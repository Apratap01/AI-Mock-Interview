import express from "express";
import { signup , login, refreshAccessToken} from "../controllers/auth.controller.js";
import { JWT_Verify } from "../middlewares/auth.middleware.js";


const router=express.Router();

router.post("/signup",signup);

router.post("/login",login);

router.post("/refresh-token",refreshAccessToken);

router.get("/me", JWT_Verify, (req,res) => {
    return res.json({
            success:true,
            user:req.user
        });
})


export default router;