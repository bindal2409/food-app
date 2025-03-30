import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
    interface Request {
        id?: string;
    }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log("Middleware triggered...");

        const token = req.cookies?.token;  // Ensure cookies exist
        if (!token) {
            console.log("No token found in request");
            res.status(401).json({ success: false, message: "User not authenticated" });
            return;
        }

        if (!process.env.SECRET_KEY) {
            console.error("JWT Secret Key is missing");
            res.status(500).json({ message: "Internal server error" });
            return;
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY) as jwt.JwtPayload;
        console.log("Decoded Token:", decoded);

        req.id = decoded.userId || decoded.id;
        console.log("Extracted User ID:", req.id);

        if (!req.id) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return;
        }

        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};
