import { Router, Request, Response } from "express";
import prisma from "../config/prismaClient";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET || "S3cret";

// Signup Route
router.post("/signup", async (req: Request, res: Response) => {
    try {
        const {
            email, 
            password, 
            fullName, 
            gender, 
            profileImage, 
            bio, 
            experience, 
            charges, 
            subjects, 
            Standard, 
            gradInstitute, 
            address, 
            ratings 
        } = req.body;
        
        // Check required fields
        if (!email || !password || !fullName || !gender || !gradInstitute) {
            return res.status(400).json({ msg: "All required fields must be provided" });
        }

        // Validate gender enum
        const validGenders = ["Male", "Female", "PreferNotToSay"];
        if (!validGenders.includes(gender)) {
            return res.status(400).json({ msg: "Invalid gender value" });
        }

        // Check if the tutor already exists
        const existingTutor = await prisma.tutor.findUnique({ where: { email } });
        if (existingTutor) {
            return res.status(400).json({ msg: "Tutor already exists" });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the tutor directly
        const newTutor = await prisma.tutor.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                gender,
                profileImage: profileImage || "", // Default to empty string if not provided
                bio: bio || "",
                experience: experience || "0yr",
                charges: charges || 0,
                subjects: subjects || [],
                Standard: Standard || [],
                gradInstitute,
                address: address || "",
                ratings: ratings || 0.0
            }
        });

        res.status(201).json({ msg: "Tutor has been created successfully", tutor: newTutor });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ msg: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
    }
});

// Signin Route
router.post("/signin", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // Find tutor by email
        const tutor = await prisma.tutor.findUnique({ where: { email } });
        if (!tutor) {
            return res.status(400).json({ msg: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, tutor.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ tutorId: tutor.id, email: tutor.email }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ msg: "Signin successful", token });
    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ msg: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
    }
});

export default router;
