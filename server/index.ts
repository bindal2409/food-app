import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/user.route";
import restaurantRoute from "./routes/restaurant.route";
import menuRoute from "./routes/menu.route";
import orderRoute from "./routes/order.route";
import path from "path";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

const DIRNAME = path.resolve();

// Default middleware for any MERN project
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const coreOptions = {
    origin: "http://localhost:5173",
    credentials: true
};
app.use(cors(coreOptions));

// ✅ Stripe Webhook MUST use express.raw() middleware BEFORE express.json()
app.use("/api/v1/order/webhook", express.raw({ type: "application/json" }));

// ✅ Now apply express.json() for all other routes
app.use(express.json());

// API Routes
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/menu", menuRoute);

app.use(express.static(path.join(DIRNAME,"/client/dist")));
app.use("*",(_,res)=>{
    res.sendFile(path.resolve(DIRNAME,"client","dist","index.html"));
})

// Start Server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server listening at port ${PORT}`);
});
