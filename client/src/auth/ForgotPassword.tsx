import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore"; // Import Zustand store

const ForgotPassword = () => {
    const [email, setEmail] = useState<string>("");
    const forgotPassword = useUserStore((state) => state.forgotPassword);
    const loading = useUserStore((state) => state.loading);
    const [message, setMessage] = useState<string>("");

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        try {
            await forgotPassword(email);
            setMessage("If an account with this email exists, a reset link has been sent.");
        } catch (error) {
            setMessage("Failed to send reset link. Try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full">
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-5 md:p-8 w-full max-w-md rounded-lg mx-4">
                <div className="text-center">
                    <h1 className="font-extrabold text-2xl mb-2">Forgot Password</h1>
                    <p className="text-sm text-gray-600">Enter your email to reset your password</p>
                </div>
                <div className="relative w-full">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                    />
                    <Mail className="absolute inset-y-2 left-2 text-gray-600 pointer-events-none"/>
                </div>
                {message && <p className="text-center text-green-500">{message}</p>}
                <Button type="submit" disabled={loading} className="bg-[var(--button)] hover:bg-[var(--hoverButtonColor)]">
                    {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <span className="text-center">
                    Back to <Link to="/login" className="text-blue-500">Login</Link>
                </span>
            </form>
        </div>
    );
};

export default ForgotPassword;
