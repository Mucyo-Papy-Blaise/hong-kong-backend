import type { Request, Response } from "express"
import bcrypt from "bcrypt"
import { User } from "../models/User"
import { generateAccessToken } from "../services/token"
import type { AuthRequest } from "../types"
import { uploadSingleImage } from "../services/cloudinary"


export class AuthController {
  //Register  
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body
      const file =  req.file

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists",
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      let imageUrl = ''

      if(file){
        imageUrl = await uploadSingleImage(file.buffer, 'eyewear/image')
      }

      // Create user with role forced to 'user'
      const user = await User.create({
        name,
        email,
        image: imageUrl,
        password: hashedPassword,
        role: "user", 
      })

      const accessToken = generateAccessToken(user.id.toString(), user.email, user.role)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          },
          accessToken,
        },
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
  // Login 
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      // Find user
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        })
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        })
      }

      const accessToken = generateAccessToken(user.id.toString(), user.email, user.role)

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          accessToken,
        },
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  async getLoggedInUser(req: AuthRequest, res: Response){
    try {
      const user = req?.user

    if(!user){
      return res.status(401).json({
        success: false,
        error: "Unauthorized. No user logged in"
      })
    }

    const fullUser = await User.findById(user.id).select('-password')

    if(!fullUser){
      return res.status(401).json({
        success: false,
        error: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: fullUser._id,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role,
        image: fullUser?.image
      }
    })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  // Update Profile
 async updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const userId = req.user.id;
    const { name, email, password, currentPassword } = req.body;
    const file = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Update password if provided
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: "Current password is required" });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    // Update name if provided
    if (name) user.name = name;

    // Update email if provided and unique
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, error: "Email already in use" });
      }
      user.email = email;
    }

    // Update profile image if provided
    if (file) {
      const imageUrl = await uploadSingleImage(file.buffer, "eyewear/image");
      user.image = imageUrl;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

  // Logout 
  async logout(req: AuthRequest, res: Response) {
    try {
      res.json({
        success: true,
        message: "Logout successful. Please remove the token from client storage.",
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
}
