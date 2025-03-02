import express from "express";
import dotenv from "dotenv";
import userAuthRoutes from "./routes/userAuth";
import tutorAuthRoutes from "./routes/tutorAuth"
import allTutors from "./routes/tutors"
import requests from "./routes/requests"

dotenv.config();

const app = express();
app.use(express.json());

// User Auth Routes
app.use("/userAuth", userAuthRoutes);
app.use("/requests", requests )
// Tutor Auth Routes
app.use("/tutorAuth", tutorAuthRoutes);
app.use("/tutor", allTutors);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));