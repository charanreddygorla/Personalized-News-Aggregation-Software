import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // Hook for navigation

    const handleReset = async () => {
        const response = await fetch(`http://localhost:5000/reset-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        const data = await response.json();
        setMessage(data.message);

        if (response.ok) {
            // Redirect to login page after successful reset
            setTimeout(() => {
                navigate("/");
            }, 2000);
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
            />
            <button onClick={handleReset}>Reset Password</button>

            {message && <p>{message}</p>}
        </div>
    );
}

export default ResetPassword;
