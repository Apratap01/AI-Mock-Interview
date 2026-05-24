import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()

export const generateAccessToken=(user)=>{

    return jwt.sign(

        {
            id:user.id,
            email:user.email
        },

        process.env.JWT_ACCESS_SECRET,

        {
            expiresIn:
            process.env.ACCESS_TOKEN_EXPIRES
        }

    );

}

export const generateRefreshToken=(user)=>{

    return jwt.sign(

        {
            id:user.id
        },

        process.env.JWT_REFRESH_SECRET,

        {
            expiresIn:
            process.env.REFRESH_TOKEN_EXPIRES
        }

    );

}