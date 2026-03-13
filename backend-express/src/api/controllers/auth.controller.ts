import { Request, Response, NextFunction } from "express";
import { authService } from "../../services/auth.service";
import "../../middlewares/auth.middleware"; // Import for req.user typing

const isProduction = process.env.NODE_ENV === "production";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      // Extract access_token to put in httpOnly cookie
      const { access_token, ...userData } = result;

      res.cookie("auth_token", access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 Day
      });

      res.status(200).json({ ...userData, access_token });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "User tidak ditemukan atau kredensial salah"
      ) {
        res.status(401).json({ message: error.message, success: false });
        return;
      }
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("auth_token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
      });
      res
        .status(200)
        .json({ message: "Successfully logged out", success: true });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized", success: false });
        return;
      }

      const result = await authService.changePassword(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "Kata sandi lama salah") {
        res.status(400).json({ message: error.message, success: false });
        return;
      }
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    // Used to check who is currently authenticated from the cookie
    // Assuming requireAuth middleware adds req.user
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized", success: false });
        return;
      }
      const profile = await authService.getProfile(req.user.id);
      res.status(200).json(profile);
    } catch (error) {
      if (error instanceof Error && error.message === "User tidak ditemukan") {
        res.status(401).json({ message: error.message, success: false });
        return;
      }
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized", success: false });
        return;
      }
      const result = await authService.updateProfile(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
