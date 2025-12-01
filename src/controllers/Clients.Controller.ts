import { Request, Response } from "express";
import { Client } from "../models/clients";

export class ClientController {

  // CREATE CLIENT
  async create(req: Request, res: Response) {
    try {
      let { purchases = [] } = req.body;

      purchases = purchases.map((p: any) => ({
        ...p,
        subtotal: p.quantity * p.price,
      }));

      const totalPurchases = purchases.reduce(
        (sum: number, p: any) => sum + p.subtotal,
        0
      );

      const client = await Client.create({
        ...req.body,
        purchases,
        totalPurchases,
      });

      return res.status(201).json(client);
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }

  // GET ALL CLIENTS
  async findAll(req: Request, res: Response) {
  try {
    // Get query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build search query
    let query: any = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Execute queries
    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Client.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.json({
      data: clients,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}

  // GET ONE CLIENT
  async findOne(req: Request, res: Response) {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) return res.status(404).json({ message: "Client not found" });

      return res.json(client);
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }

  // UPDATE CLIENT (info + purchases)
  async update(req: Request, res: Response) {
    try {
      const updateBody = req.body;

      if (updateBody.purchases) {
        updateBody.purchases = updateBody.purchases.map((p: any) => ({
          ...p,
          subtotal: p.quantity * p.price,
        }));

        updateBody.totalPurchases = updateBody.purchases.reduce(
          (sum: number, p: any) => sum + p.subtotal,
          0
        );
      }

      const client = await Client.findByIdAndUpdate(
        req.params.id,
        updateBody,
        { new: true }
      );

      if (!client) return res.status(404).json({ message: "Client not found" });

      return res.json(client);
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }

  // DELETE CLIENT
  async delete(req: Request, res: Response) {
    try {
      const client = await Client.findByIdAndDelete(req.params.id);
      if (!client) return res.status(404).json({ message: "Client not found" });

      return res.json({ message: "Client deleted" });
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }

  // ADD PRODUCT TO CLIENT PURCHASES
  async addProduct(req: Request, res: Response) {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) return res.status(404).json({ message: "Client not found" });

      const { name, quantity, price } = req.body;

      const newProduct = {
        name,
        quantity,
        price,
        subtotal: quantity * price,
      };

      if(!client) {
        res.status(404).json({message:"No Client found"})
      }

      client.purchases!.push(newProduct);

      client.totalPurchases = client.purchases?.reduce(
        (sum, p) => sum + p.subtotal,
        0
      );

      await client.save();

      return res.json(client);
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }

  // DELETE ONE PRODUCT FROM PURCHASES
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id, index } = req.params;

      const client = await Client.findById(id);
      if (!client) return res.status(404).json({ message: "Client not found" });

      const idx = parseInt(index);

      if (idx < 0 || idx >= client.purchases!.length) {
        return res.status(400).json({ message: "Invalid product index" });
      }

      // remove 1 product
      client.purchases!.splice(idx, 1);

      // recalc total
      client.totalPurchases = client.purchases?.reduce(
        (sum, p) => sum + p.subtotal,
        0
      );

      await client.save();

      return res.json(client);
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }
}
