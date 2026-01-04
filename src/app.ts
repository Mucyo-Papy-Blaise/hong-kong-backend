import express, { type Application } from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"
import path from "path"
import { errorHandler } from "./middleware/errorHandler"

// Import routes
import authRoutes from "./routes/auth.route"
import productRoutes from "./routes/products.route"
import brandRoutes from "./routes/brands.route"
import insuranceLogoRoutes from "./routes/insurance-logos.route"
import cartRoutes from "./routes/cart.route"
import wishlistRoutes from "./routes/wishlist.route"
import adminRoutes from "./routes/admin.route"
import lensesRoutes  from  './routes/lenses.route'
import contactRes from "./routes/contact.routes"
import clientRes from './routes/Clients.route'
import orderRes from './routes/order.route'
import AppointmentRes  from "./routes/appointment.routes"


// Create and configure Express application

export const createApp = (): Application => {
  const app = express()

  // Middleware
  app.use(cors({
    origin: function (origin, callback) {
    const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
  }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Health check
  app.get("/health", (req, res) => {
    res.json({ success: true, message: "Server is running" })
  })

  // API routes
  app.use("/auth", authRoutes)
  app.use("/products", productRoutes)
  app.use("/brands", brandRoutes)
  app.use("/insurance-logos", insuranceLogoRoutes)
  app.use("/cart", cartRoutes)
  app.use("/wishlist", wishlistRoutes)
  app.use("/admin", adminRoutes)
  app.use("/lenses", lensesRoutes)
  app.use('/contacts', contactRes);
  app.use('/clients', clientRes)
  app.use('/orders', orderRes)
  app.use("/appointments", AppointmentRes)

  // Swagger documentation
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, "../docs/openapi.yaml"))
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  } catch (error) {
    console.warn("Swagger documentation not available")
  }

  // Error handler (must be last)
  app.use(errorHandler)

  return app
}
