import { Request, Response } from "express";
import { Order, OrderStatus } from "../models/order";
import { AuthRequest } from "../types";
import mongoose from "mongoose";

export class OrderController {
  // Create a new order
  static createOrder = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { items, total } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, error: "Cart is empty" });
      }

      const order = await Order.create({
        user: userId,
        items,
        total,
      });

      res.status(201).json({ success: true, order });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  };

  // Get orders of a user
  static getUserOrders = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      const search = req.query.search?.toString().trim() || "";
      const status = req.query.status?.toString().trim() || "";

      const pipeline: any[] = [];

      pipeline.push({
        $match: { user: new mongoose.Types.ObjectId(userId) },
      });

      pipeline.push({
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      });

      if (search) {
        const filters: any[] = [];

        if (mongoose.Types.ObjectId.isValid(search)) {
          filters.push({ _id: new mongoose.Types.ObjectId(search) });
        }

        // by status
        filters.push({ status: { $regex: search, $options: "i" } });

        // by product name
        filters.push({
          "productDetails.name": { $regex: search, $options: "i" },
        });

        // by total amount number
        const numSearch = Number(search);
        if (!isNaN(numSearch)) {
          filters.push({ total: numSearch });
        }

        pipeline.push({ $match: { $or: filters } });
      }

      const validStatuses = [
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (status && validStatuses.includes(status)) {
        pipeline.push({ $match: { status } });
      }

      // Sort newest first
      pipeline.push({ $sort: { createdAt: -1 } });

      const orders = await Order.aggregate(pipeline);

      // Format response
      const formattedOrders = orders.map((order) => ({
        _id: order._id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item: any) => {
          const product = order.productDetails.find(
            (p: any) => p._id.toString() === item.productId.toString()
          );
          return {
            product,
            quantity: item.quantity,
            priceAtAddTime: item.priceAtAddTime,
          };
        }),
      }));

      res.json({
        success: true,
        orders: formattedOrders,
      });
    } catch (err: any) {
      console.error("getUserOrders error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  };

  static getAllOrders = async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
      const skip = (page - 1) * limit;

      const search = req.query.search?.toString().trim() || "";
      const status = req.query.status?.toString().trim() || "";

      const pipeline: any[] = [];

      pipeline.push({
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      });

      pipeline.push({
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      });

      // Apply search filter
      if (search) {
        const orFilters: any[] = [];

        if (mongoose.Types.ObjectId.isValid(search)) {
          orFilters.push({ _id: new mongoose.Types.ObjectId(search) });
        }

        orFilters.push(
          { status: { $regex: search, $options: "i" } },
          { "userDetails.name": { $regex: search, $options: "i" } },
          { "userDetails.email": { $regex: search, $options: "i" } }
        );

        pipeline.push({ $match: { $or: orFilters } });
      }

      const validStatuses = [
        "placed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (status && validStatuses.includes(status)) {
        pipeline.push({ $match: { status } });
      }

      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Order.aggregate(countPipeline);
      const totalOrders = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalOrders / limit);

      pipeline.push({ $sort: { createdAt: -1 } });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      pipeline.push({
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      });

      const orders = await Order.aggregate(pipeline);

      const transformedOrders = orders.map((order) => ({
        _id: order._id.toString(),
        user: {
          id: order.userDetails._id.toString(),
          name: order.userDetails.name,
          email: order.userDetails.email,
          role: order.userDetails.role,
          image: order.userDetails.image,
        },
        items: order.items.map((item: any) => {
          const product = order.productDetails.find(
            (p: any) => p._id.toString() === item.productId.toString()
          );
          return {
            product: product || null,
            quantity: item.quantity,
            priceAtAddTime: item.priceAtAddTime,
          };
        }),
        totalAmount: order.total,
        status: order.status,
        statusHistory: order.statusHistory || [],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

      res.json({
        success: true,
        pagination: {
          page,
          limit,
          totalOrders,
          totalPages,
        },
        orders: transformedOrders,
      });
    } catch (err: any) {
      console.error("Error in getAllOrders:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
      });
    }
  };

  static getOrderById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const order = await Order.findById(id)
        .populate("items.productId")
        .populate("user");

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      res.json({ success: true, order });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: OrderStatus };

      if (!status) {
        return res
          .status(400)
          .json({ success: false, error: "Status is required" });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, error: "Order not found" });
      }

      order.status = status;
      await order.save();

      res.json({ success: true, order });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  static countOrder = async (req: Request, res: Response) => {
    try {
      const count = await Order.countDocuments({ status: "placed" });
      return res.json({ success: true, placedOrder: count });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to Count Placed orders" });
    }
  };
}
