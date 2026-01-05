import { Router, type Router as ExpressRouter } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { upload } from "../config/multer";
import { LensesController } from "../controllers/lenses.controller";

const router:ExpressRouter = Router()
const lensesController = new LensesController()

router.get('/', lensesController.getAll.bind(lensesController))
router.get('/:id', lensesController.getById.bind(lensesController))
router.post('/',authenticate, requireAdmin,upload.single('image') ,lensesController.create.bind(lensesController))
router.put('/:id',authenticate, requireAdmin,upload.single('image'), lensesController.update.bind(lensesController))
router.delete('/:id',authenticate, requireAdmin, lensesController.delete.bind(lensesController))

export default router