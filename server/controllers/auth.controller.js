import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import {
generateAccessToken,
generateRefreshToken
}
from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";


export const signup=async(req,res)=>{
    
    try{

        const {name,email,password}=req.body;

        if(!name || !email || !password){

            return res.status(400).json({
                success:false,
                message:"All fields required"
            });

        }

        const existingUser=await prisma.user.findUnique({

            where:{
                email
            }

        });

        if(existingUser){

            return res.status(409).json({
                success:false,
                message:"User already exists"
            });

        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword
            }
        });

        return res.status(201).json({

            success:true,
            message:"Signup route working",
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            }

        });

    }
    catch(error){

        console.log(error);

        return res.status(500).json({

            success:false,
            message:"Internal server error"

        });

    }

}


export const login = async (req, res) => {
    try {
        
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Email and Passwords are required"
            });
        }

        const user = await prisma.user.findUnique({
            where:{
                email
            }
        });


        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const hashRefreshToken = await bcrypt.hash(refreshToken, 10);

        await prisma.user.update({
            where:{
                id:user.id
            },
            data:{
                refreshToken:hashRefreshToken
            }
        });

        res.cookie("accessToken", accessToken,{
            httpOnly:true,
            secure: false,
            sameSite:"strict",
            maxAge: 24*60*60*1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            secure: false,
            sameSite:"strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        return res.status(200).json({
            success:true,
            message:"Login successful",
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            }
        })



    } catch (error) {
        console.log("Login Error:",error);

        return res.status(500).json({

            success:false,
            message:"Internal server error"

        });

    }
}


export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await prisma.user.findUnique({
            where:{
                id:decoded.id
            }
        });

        if(!user || !user.refreshToken){
            return res.status(401).json({
                success:false,
                message:"Invalid Refresh Token"
            });
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

        if(!isRefreshTokenValid){
            return res.status(401).json({
                success:false,
                message:"Invalid Refresh Token"
            });
        }

        const newAccessToken = generateAccessToken(user);

        res.cookie("accessToken", newAccessToken,{
            httpOnly:true,
            secure: false,
            sameSite:"strict",
            maxAge: 24*60*60*1000
        });

        return res.status(200).json({
            success:true,
            message:"Access token refreshed"
        });
        
    } catch (error) {
        console.log(
            "Refresh Token Error:",
            error
        );

        return res.status(500).json({

            success:false,
            message:"Internal server error"

        });
    }
}