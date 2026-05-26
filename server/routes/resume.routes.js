import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { uploadResume } from "../controllers/resume.controller.js";
import { JWT_Verify } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
    "/upload",
    JWT_Verify,
    upload.single("resume"),
    uploadResume
);

export default router;