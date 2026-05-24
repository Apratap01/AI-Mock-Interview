import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRoutes);

app.get("/", async (req,res)=>{

    const users=await prisma.user.findMany();

    res.json(users);

});

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`);
});