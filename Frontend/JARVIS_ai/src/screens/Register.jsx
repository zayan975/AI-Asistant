import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios.js";
import { useState, useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";


const Register = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        axios.post('/users/register', { email, password })
            .then((res) => {
                console.log("Login successful:", res.data);
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);

                navigate('/')

            }).catch((err) => {
                console.error("Login failed:", err);
            });
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-80">
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                    Register
                </h2>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="text-gray-400 text-sm text-center mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
