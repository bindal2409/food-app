// 9KqPV6ywRAuDSgaD
// himanshubindal90340

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in the .env file");
        }

        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected.");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit process on failure
    }
}

export default connectDB;
