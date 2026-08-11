import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../api/axios";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const handleLogin = async (event) => {

    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {

      if (!email.trim()) {

          toast.error("Email is required");

          return;
      }

      if (!password.trim()) {

          toast.error("Password is required");

          return;
      }
      const response =
        await api.post(
          "/users/login",
          {
            email,
            password
          }
        );

      const token =
        response.data.data.token;

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "email",
        response.data.data.email
      );

      toast.success(
        "Login successful"
      );

      navigate(
        "/dashboard"
      );

    } catch (error) {

      console.error(
        "Login Error:",
        error.response?.data ||
        error.message
      );

      toast.error(
        "Invalid email or password"
      );

    } finally {

      setIsLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-8 text-blue-600">
          Docs App Login
        </h2>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="
              w-full
              border
              border-gray-300
              rounded-lg
              px-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-4
                py-3
                pr-16
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-gray-500
                hover:text-blue-600
                cursor-pointer
              "
            >

              {
                showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
              }

            </button>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="
              cursor-pointer
              w-full
              bg-blue-600
              text-white
              py-3
              rounded-lg
              font-semibold
              hover:bg-blue-700
              transition-all
              duration-200
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {
              isLoading
                ? "Logging in..."
                : "Login"
            }
          </button>

          <div className="
            text-right
            mt-3
          ">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/forgot-password"
                )
              }
              className="
                text-blue-600
                hover:underline
                cursor-pointer
              "
            >
              Forgot Password?
            </button>

          </div>

          <div className="
            text-center
            mt-4
          ">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/register"
                )
              }
              className="
                text-blue-600
                hover:underline
                cursor-pointer
              "
            >
              Don't have an account? Register
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Login;