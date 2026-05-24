import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()

export const JWT_Verify = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if(!token){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        console.log(
            "Auth Middleware Error:",
            error.message
        );

        return res.status(401).json({

            success:false,
            message:"Invalid or expired token"

        });
    }
}