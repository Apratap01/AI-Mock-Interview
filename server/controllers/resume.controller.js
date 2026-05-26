import { createRequire } from "module";
import cloudinary from "../config/cloudinary.js";

import prisma from "../config/prisma.js";
import streamifier from "streamifier";


const require = createRequire(import.meta.url);

const { PDFParse } = require("pdf-parse");


export const uploadResume = async (req,res) => {
    try {
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"Resume Required"
            });
        }

        const parser = new PDFParse({
            data: req.file.buffer
        });

        const pdfData = await parser.getText();

        const extractedText = pdfData.text;

        const uploadResult =
        await new Promise((resolve,reject)=>{

            const stream =
            cloudinary.uploader.upload_stream(

                {

                    resource_type:"raw",

                    folder:"resumes"

                },

                (error,result)=>{

                    if(error)
                        reject(error);

                    resolve(result);

                }

            );


            streamifier
            .createReadStream(
                req.file.buffer
            )
            .pipe(stream);

        });

        const resume =
        await prisma.resume.create({

            data:{

                title:
                req.file.originalname,

                pdfUrl:
                uploadResult.secure_url,

                extractedText,

                userId:
                req.user.id

            }
        });

        return res.status(201).json({

            success:true,

            message:
            "Resume uploaded successfully",

            resume

        });

    } catch (error) {
        console.log(
            "Resume Upload Error:",
            error
        );

        return res.status(500).json({

            success:false,
            message:"Internal server error"

        });
    }
}