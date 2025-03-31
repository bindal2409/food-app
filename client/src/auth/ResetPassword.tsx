import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockKeyholeIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

const ResetPassword = () => {
    const { token } = useParams(); // Extract token from URL
    const navigate = useNavigate();
    const { resetPassword, loading } = useUserStore();
    const [newPassword, setNewPassword] = useState<string>("");

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or expired reset link.");
            navigate("/forgot-password"); // Redirect if no token
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid or expired token.");
            return;
        }

        console.log("Reset Password Request:", { token, newPassword }); // Debugging log

        try {
            await resetPassword(token, newPassword);
            toast.success("Password reset successfully!");
            navigate("/login");
        } catch (error) {
            toast.error("Failed to reset password. Try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full">
            <form className="flex flex-col gap-5 md:p-8 w-full max-w-md rounded-lg mx-4" onSubmit={handleSubmit}>
                <div className="text-center">
                    <h1 className="font-extrabold text-2xl mb-2">Reset Password</h1>
                    <p className="text-sm text-gray-600">Enter your new password to reset the old one</p>
                </div>
                <div className="relative w-full">
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new Password"
                        className="pl-10"
                    />
                    <LockKeyholeIcon className="absolute inset-y-2 left-2 text-gray-600 pointer-events-none"/>
                </div>
                <Button type="submit" className="bg-[var(--button)] hover:bg-[var(--hoverButtonColor)]" disabled={loading}>
                    {loading ? "Please wait..." : "Reset"}
                </Button>
                <span className="text-center">
                    Back to <Link to="/login" className="text-blue-500">Login</Link>
                </span>
            </form>
        </div>
    );
};

export default ResetPassword;
