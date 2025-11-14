import type {Request, Response}  from 'express'
import { Lenses } from '../models/Lenses'
import { uploadSingleImage } from '../services/cloudinary'

export class LensesController {
async create(req: Request, res: Response) {
  try {
    const file = req.file;
    let imageUrl = "";

    if (file) {
      imageUrl = await uploadSingleImage(file.buffer, "eyewear/brands");
    }

    const { features, ...rest } = req.body;

    let parsedFeatures: string[] = [];

    if (features) {
      try {
        parsedFeatures = JSON.parse(features);
      } catch {
        parsedFeatures = [features]; 
      }
    }

    const lenses = await Lenses.create({
      ...rest,
      features: parsedFeatures,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Lenses created successfully",
      data: lenses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

    async getAll(req:Request, res:Response){
        try {
           const lenses = await Lenses.find().sort({name:1}) 

           res.json({
            success: true,
            data: lenses
           })
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error:error.message
            })
        }
    }

    async getById (req:Request, res:Response){
        try {
            const {id} = req.params
            const lenses = await Lenses.findById(id)

            if(!lenses){
                return res.status(404).json({
                   success: false,
                   error: "Brand not found", 
                })
            }
            res.json({
                success: true,
                data: lenses,
            })
        } catch (error: any) {
            res.status(500).json({
            success: false,
            error: error.message,
      })
        }
    }

async update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const file = req.file;
    let imageUrl = "";

    if (file) {
      imageUrl = await uploadSingleImage(file.buffer, "eyewear/brands");
    }

    const { features, ...rest } = req.body;

    let parsedFeatures: string[] = [];

    if (features) {
      try {
        parsedFeatures = JSON.parse(features);
      } catch {
        parsedFeatures = [features];
      }
    }

    const updated = await Lenses.findByIdAndUpdate(
      id,
      {
        ...rest,
        ...(parsedFeatures.length ? { features: parsedFeatures } : {}),
        ...(imageUrl ? { image: imageUrl } : {}),
      },
      { new: true }
    );

    console.log('This is Updated Data', updated)

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Lens not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lens updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}


    async delete(req:Request, res:Response){
        try {
            const { id } = req.params
            const lenses = await Lenses.findByIdAndDelete(id)
            
            if(!lenses){
                return res.status(404).json({
                    success: false,
                    error: "Brand not found",
                })
            }
            res.json({
                success: true,
                message: "Lense deleted successfully",
            })
        } catch (error: any) {
            res.status(500).json({
              success: false,
              error: error.message,
        })
        }
    }
}