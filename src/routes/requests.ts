import { Router, Request, Response } from "express";
import prisma from "../config/prismaClient";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Define the request body type
interface BookingRequestBody {
    tutorId: string;
    userId: string;
    subject: string;
    requestType: string;
}

router.post('/booking-requests', async (req: Request, res: Response) => {
    const { tutorId, userId, subject, requestType }: BookingRequestBody = req.body;

    // Validate request body
    if (!tutorId || !userId || !subject || !requestType) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Save the booking request to the database
        const bookingRequest = await prisma.bookingRequest.create({
            data: {
                tutorId,
                userId,
                subject,
                requestType,
                status: "Pending" // Default status
            }
        });

        // Return success response
        res.status(201).json({
            message: "Booking request sent successfully",
            bookingRequest
        });
    } catch (error) {
        console.error("Error creating booking request:", error);
        res.status(500).json({ error: "Failed to send booking request" });
    }
}); 

export default router;  