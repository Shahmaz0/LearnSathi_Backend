import { Router, Request, Response } from "express";
import prisma from "../config/prismaClient";

const router = Router()
router.get("/allTutors", async (req: Request, res: Response) => {
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

router.get("/all", async (req: Request, res: Response) => {
    try {
        // Extract query parameters
        const { subjects, standard } = req.query;

        // Convert subjects to an array if it's a string
        const subjectsArray = typeof subjects === 'string' ? subjects.split(',') : [];

        // Convert standard to a number
        const standardNumber = parseInt(standard as string, 10);

        // Fetch tutors based on the filters
        const tutors = await prisma.tutor.findMany({
            where: {
                subjects: {
                    hasSome: subjectsArray, // Filter by subjects
                },
                Standard: {
                    has: standardNumber, // Filter by standard
                },
            },
        });

        // Return the filtered list of tutors
        res.json(tutors);
    } catch (error) {
        console.error("Error fetching tutors:", error);
        res.status(500).json({ msg: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
    }
});

export default router;

// router.get("/all", async (req: Request, res: Response) => {
//     try {
//         // Extract filters from the request body
//         const { subjects, standard } = req.body;

//         // Validate the input
//         if (!subjects || !standard) {
//             return res.status(400).json({ msg: "Please provide subjects and standard in the request body." });
//         }

//         // Convert subjects to an array if it's a string
//         const subjectsArray = Array.isArray(subjects) ? subjects : [subjects];

//         // Convert standard to a number
//         const standardNumber = parseInt(standard, 10);

//         // Fetch tutors based on the filters
//         const tutors = await prisma.tutor.findMany({
//             where: {
//                 subjects: {
//                     hasSome: subjectsArray, // Filter by subjects
//                 },
//                 Standard: {
//                     has: standardNumber, // Filter by standard
//                 },
//             },
//         });

//         // Return the filtered list of tutors
//         res.json(tutors);
//     } catch (error) {
//         console.error("Error fetching tutors:", error);
//         res.status(500).json({ msg: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
//     }
// });

// export default router;