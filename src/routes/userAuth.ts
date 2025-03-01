import { Router, Request, Response } from "express";
import prisma from "../config/prismaClient";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.put("/user/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { supabaseUserId, firstName, lastName, standard, email, phoneNumber, profileImage } = req.body;

        // Check if the user exists
        const user = await prisma.user.findUnique({ where: { id: id } });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Verify that the supabaseUserId matches the logged-in user
        if (user.supabaseUserId !== supabaseUserId) {
            return res.status(403).json({ msg: "Unauthorized: You can only update your own profile" });
        }

        // Update the user details
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: {
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                standard: standard || user.standard,
                email: email || user.email,
                phoneNumber: phoneNumber || user.phoneNumber,
                profileImage: profileImage || user.profileImage
            },
        });

        res.json({ msg: "User details updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
    }
});

//Save the user in supabase database
router.post("/save-user", async (req: Request, res: Response) => {
    try {
        console.log("Request Body:", req.body); 
        const { supabaseUserId, firstName, lastName, phoneNumber, standard, email, profileImage } = req.body;

        if (!supabaseUserId || !email) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { supabaseUserId } });

        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const newUser = await prisma.user.create({
            data: { supabaseUserId, firstName, lastName, phoneNumber, standard, email, profileImage }, 
        });

        res.json({ msg: "User data saved successfully", user: newUser });
    } catch (error) {
        console.error("Error saving user:", error); // Log the error
        res.status(500).json({ msg: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
    }
});


// get User for a perticular supabase user id
router.get("/get-user", async (req: Request, res: Response) => {
    try {
        const { supabaseUserId } = req.query;

        if (!supabaseUserId) {
            return res.status(400).json({ msg: "User ID is required" });
        }

        const user = await prisma.user.findUnique({ where: { supabaseUserId: supabaseUserId as string } });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ msg: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
    }
});
export default router;
