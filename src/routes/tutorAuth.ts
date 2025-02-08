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

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword }
        });

        // Create a Tutor entry linked to the new user
        const newTutor = await prisma.tutor.create({
            data: {
                id: newUser.id, // Ensuring tutor ID matches user ID
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

        res.status(201).json({ msg: "User has been created successfully", user: newUser, tutor: newTutor });
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
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ msg: "Signin successful", token });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
    }
});

export default router;
