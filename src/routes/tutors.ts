import { Router, Request, Response } from "express";
import prisma from "../config/prismaClient";

const router = Router()
router.get("/all", async (req: Request, res: Response) => {
    try {
        // Fetch all tutors from the database
        const tutors = await prisma.tutor.findMany();
        
        // Return the list of tutors
        res.json(tutors);
    } catch (error) {
        console.error("Error fetching tutors:", error);
        res.status(500).json({ msg: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
    }
});

export default router