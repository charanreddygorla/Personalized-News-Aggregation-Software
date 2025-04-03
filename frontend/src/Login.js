import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import "./Login.css";

function Login() {
    const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [registerMessage, setRegisterMessage] = useState("");
    const [loginMessage, setLoginMessage] = useState("");
    const [recaptchaToken, setRecaptchaToken] = useState(null);

    

    
    const navigate = useNavigate();  // Add the useNavigate hook

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    function SwitchContent() {
        const content = document.getElementById('content');
        content.classList.toggle('active');
        setRegisterMessage("");
        setLoginMessage("");
    }

    const handleChange = (e, formType) => {
        const { name, value } = e.target;
        if (formType === "register") {
            setRegisterData({ ...registerData, [name]: value });
        } else {
            setLoginData({ ...loginData, [name]: value });
        }
    };

    
    

    const validateRegister = () => {
        let newErrors = {};
        const { name, email, password } = registerData;

        if (!name.trim()) newErrors.name = "Name is required";
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!isValidEmail(email)) newErrors.email = "Invalid email format";

        if (!password.trim()) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateLogin = () => {
        let newErrors = {};
        const { email, password } = loginData;

        if (!email.trim()) newErrors.loginEmail = "Email is required";
        else if (!isValidEmail(email)) newErrors.loginEmail = "Invalid email format";
        if (!password.trim()) newErrors.loginPassword = "Password is required";
        if (!recaptchaToken) newErrors.recaptcha = "Please verify reCAPTCHA";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!validateRegister()) return;
    
        try {
            const response = await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...registerData }), // Removed recaptchaToken
            });
    
            const data = await response.json();
            if (response.ok) {
                setRegisterMessage("User successfully registered! You can now login.");
                localStorage.setItem("userEmail", registerData.email);
                setRegisterData({ name: "", email: "", password: "" });
    
                setTimeout(() => {
                    navigate('/preferences');
                }, 500);
            } else {
                setRegisterMessage(data.message);
            }
        } catch (error) {
            setRegisterMessage("Error connecting to the server");
        }
    };
    
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!validateLogin()) return;
    
        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...loginData }), // Removed recaptchaToken
            });
    
            const data = await response.json();
            if (response.ok) {
                setLoginMessage("Login successful! Redirecting...");
                localStorage.setItem("userEmail", loginData.email);
                navigate('/newsapp');
            } else {
                setLoginMessage(data.message || "Invalid email or password");
            }
        } catch (error) {
            setLoginMessage("Error connecting to the server");
        }
    };
    
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await fetch("http://localhost:5000/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });
    
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("userEmail", data.email);
                navigate("/newsapp");
            } else {
                setLoginMessage(data.message || "Google login failed");
            }
        } catch (error) {
            setLoginMessage("Error connecting to the server");
        }
    };
    

    

    

    return (
        <div className='content justify-content-center align-items-center d-flex shadow-lg' id='content'>
            {/* Registration Form */}
            <div className='col-md-6 d-flex justify-content-center'>
                <form onSubmit={handleRegisterSubmit}>
                    <div className='header-text mb-4'>
                        <h1>Create Account</h1>
                    </div>

                    <div className='input-group mb-3'>
                        <input type='text' name="name" placeholder='Name' className='form-control form-control-lg bg-light fs-6' value={registerData.name} onChange={(e) => handleChange(e, "register")} />
                    </div>
                    {errors.name && <p className="text-danger">{errors.name}</p>}

                    <div className='input-group mb-3'>
                        <input type='email' name="email" placeholder='Email' className='form-control form-control-lg bg-light fs-6' value={registerData.email} onChange={(e) => handleChange(e, "register")} />
                    </div>
                    {errors.email && <p className="text-danger">{errors.email}</p>}

                    <div className='input-group mb-3'>
                        <input type='password' name="password" placeholder='Password' className='form-control form-control-lg bg-light fs-6' value={registerData.password} onChange={(e) => handleChange(e, "register")} />
                    </div>
                    {errors.password && <p className="text-danger">{errors.password}</p>}

                    <ReCAPTCHA
    sitekey="6LfeZfsqAAAAAGmG6TdNhDfsdx6UQ3oTlNj0qq9V"
    onChange={(token) => setRecaptchaToken(token)} 
/>


                    <div className='input-group mb-3 justify-content-center'>
                        <button type="submit" className='btn border-white text-white w-50 fs-6'>Register</button>
                    </div>
                    {/* Message Display for Registration */}
                    {registerMessage && <p className="text-center mt-3">{registerMessage}</p>}
                </form>
            </div>

            {/* Login Form */}
            <div className='col-md-6 right-box'>
                <form onSubmit={handleLoginSubmit}>
                    <div className='header-text mb-4'>
                        <h1>Sign In</h1>
                    </div>

                    <div className='input-group mb-3'>
                        <input type='email' name="email" placeholder='Email' className='form-control form-control-lg bg-light fs-6' value={loginData.email} onChange={(e) => handleChange(e, "login")} />
                    </div>
                    {errors.loginEmail && <p className="text-danger">{errors.loginEmail}</p>}

                    <div className='input-group mb-3'>
                        <input type='password' name="password" placeholder='Password' className='form-control form-control-lg bg-light fs-6' value={loginData.password} onChange={(e) => handleChange(e, "login")} />
                    </div>
                    {errors.loginPassword && <p className="text-danger">{errors.loginPassword}</p>}

                    <div className='input-group mb-5 d-flex justify-content-between'>
                        <div className='form-check'>
                            <input type='checkbox' className='form-check-input' />
                            <label htmlFor='formcheck' className='form-check-label text-secondary'><small>Remember me</small></label>
                        </div>
                        <div className='forgot'>
                            <small><Link to="/forgot-password">Forgot password?</Link></small>
                        </div>
                    </div>

                    {/* Google Login */}
                <GoogleOAuthProvider clientId="392040130989-fr1qk33s60n286b1c11cojvg9mifso1t.apps.googleusercontent.com">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setLoginMessage("Google login failed")}
                    />
                </GoogleOAuthProvider>


                <ReCAPTCHA
    sitekey="6LfeZfsqAAAAAGmG6TdNhDfsdx6UQ3oTlNj0qq9V"
    onChange={(token) => setRecaptchaToken(token)} 
/>



                    <div className='input-group mb-3 justify-content-center'>
                        <button type="submit" className='btn border-white text-white w-50 fs-6'>Login</button>
                    </div>
                    {/* Message Display for Login */}
                    {loginMessage && <p className="text-center mt-3">{loginMessage}</p>}
                </form>
            </div>

            {/* Switch Panel */}
            <div className='switch-content'>
                <div className='switch'>
                    <div className='switch-panel switch-left'>
                        <h1>Hello, Again</h1>
                        <p>We are happy to see you back</p>
                        <button className='hidden btn text-white w-50 fs-6' id='login' onClick={SwitchContent}>Login</button>
                    </div>

                    <div className='switch-panel switch-right'>
                        <h1>Welcome</h1>
                        <p>Join Our Unique Platform, Explore a New Experience</p>
                        <button className='hidden btn border-white text-white w-50 fs-6' id='register' onClick={SwitchContent}>Register</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;