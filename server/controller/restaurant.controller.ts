import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import { Multer } from "multer";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { Order } from "../models/order.model";


export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;


        if (!req.id) {
            res.status(401).json({
                success: false,
                message: "Unauthorized access"
            });
            return;
        }

        const existingRestaurant = await Restaurant.findOne({ user: req.id });
        if (existingRestaurant) {
            res.status(400).json({
                success: false,
                message: "Restaurant already exists for this user"
            });
            return;
        }

        if (!file) {
            res.status(400).json({
                success: false,
                message: "Image is required"
            });
            return;
        }

        const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
        
        const newRestaurant = await Restaurant.create({
            user: req.id,
            restaurantName,
            city,
            country,
            deliveryTime,
            cuisines: JSON.parse(cuisines),
            imageUrl
        });

        res.status(201).json({
            success: true,
            message: "Restaurant Added",
            restaurant: newRestaurant
        });
    } catch (error) {
        console.error("❌ Error creating restaurant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.id) {
            res.status(401).json({
                success: false,
                message: "Unauthorized access"
            });
            return;
        }

        const restaurant = await Restaurant.findOne({ user: req.id }).populate("menus");

        if (!restaurant) {
            res.status(404).json({
                success: false,
                restaurant: [],
                message: "Restaurant not found"
            });
            return;
        }

        res.status(200).json({ success: true, restaurant });
    } catch (error) {
        console.error("❌ Error fetching restaurant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.id) {
            res.status(401).json({
                success: false,
                message: "Unauthorized access"
            });
            return;
        }

        const { restaurantName, city, country, deliveryTime, cuisines } = req.body;
        const file = req.file;

        const restaurant = await Restaurant.findOne({ user: req.id });

        if (!restaurant) {
            res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
            return;
        }

        // Update restaurant fields
        restaurant.restaurantName = restaurantName || restaurant.restaurantName;
        restaurant.city = city || restaurant.city;
        restaurant.country = country || restaurant.country;
        restaurant.deliveryTime = deliveryTime || restaurant.deliveryTime;
        restaurant.cuisines = cuisines ? JSON.parse(cuisines) : restaurant.cuisines;

        // Upload image if a new file is provided
        if (file) {
            const imageUrl = await uploadImageOnCloudinary(file as Express.Multer.File);
            restaurant.imageUrl = imageUrl;
        }

        await restaurant.save();

        res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            restaurant
        });
    } catch (error) {
        console.error("❌ Error updating restaurant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getRestaurantOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.id) {
            res.status(401).json({
                success: false,
                message: "Unauthorized access"
            });
            return;
        }

        const restaurant = await Restaurant.findOne({ user: req.id });

        if (!restaurant) {
            res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
            return;
        }

        const orders = await Order.find({ restaurant: restaurant._id })
            .populate("restaurant")
            .populate("user");

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("❌ Error fetching restaurant orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({
                success: false,
                message: "Status is required"
            });
            return;
        }

        const order = await Order.findById(orderId);
        if (!order) {
            res.status(404).json({
                success: false,
                message: "Order not found"
            });
            return;
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            status: order.status,
            message: "Order status updated successfully"
        });
    } catch (error) {
        console.error("❌ Error updating order status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const searchRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const searchText = req.params.searchText?.trim() || "";
        const searchQuery = (req.query.searchQuery as string)?.trim() || "";
        const selectedCuisines = (req.query.selectedCuisines as string || "")
            .split(",")
            .map(cuisine => cuisine.trim())
            .filter(cuisine => cuisine.length > 0);

        const query: any = {};


        // Basic search based on restaurantName, city, or country
        if (searchText) {
            query.$or = [
                { restaurantName: { $regex: searchText, $options: "i" } },
                { city: { $regex: searchText, $options: "i" } },
                { country: { $regex: searchText, $options: "i" } },
            ];
        }

        // Filter based on searchQuery (overwriting previous $or if both exist)
        if (searchQuery) {
            query.$or = [
                { restaurantName: { $regex: searchQuery, $options: "i" } },
                { cuisines: { $regex: searchQuery, $options: "i" } },
            ];
        }

        // Cuisine filter
        if (selectedCuisines.length > 0) {
            query.cuisines = { $in: selectedCuisines };
        }

        console.log("Final Query:", query);

        const restaurants = await Restaurant.find(query);

        res.status(200).json({
            success: true,
            data: restaurants,
        });
    } catch (error) {
        console.error("❌ Error in searchRestaurant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getSingleRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: restaurantId } = req.params;

        // Validate restaurantId format
        if (!restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({
                success: false,
                message: "Invalid restaurant ID",
            });
            return;
        }

        const restaurant = await Restaurant.findById(restaurantId).populate({
            path: "menus",
            options: { sort: { createdAt: -1 } }, 
        });

        if (!restaurant) {
            res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            restaurant,
        });
    } catch (error) {
        console.error("❌ Error in getSingleRestaurant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
