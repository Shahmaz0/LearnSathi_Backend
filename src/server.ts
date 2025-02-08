import express from "express";
import dotenv from "dotenv";
import userAuthRoutes from "./routes/userAuth";
import tutorAuthRoutes from "./routes/tutorAuth"

dotenv.config();

const app = express();
app.use(express.json());

// User Auth Routes
app.use("/userAuth", userAuthRoutes);

// Tutor Auth Routes
app.use("/tutorAuth", tutorAuthRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));