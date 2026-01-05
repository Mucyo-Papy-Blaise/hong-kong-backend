import { Router, type Router as ExpressRouter } from "express";
import { ClientController } from "../controllers/Clients.Controller";

const router: ExpressRouter = Router();
const client = new ClientController();

router.post("/", client.create.bind(client));
router.get("/", client.findAll.bind(client));
router.get("/:id", client.findOne.bind(client));
router.put("/:id", client.update.bind(client));
router.delete("/:id", client.delete.bind(client));

// Manage purchased products
router.post("/:id/products", client.addProduct.bind(client));
router.delete("/:id/products/:index", client.deleteProduct.bind(client));

export default router;
