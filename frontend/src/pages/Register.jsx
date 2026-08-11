import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../api/axios";

function Register() {

  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [
    showConfirmPassword,
    setShowConfirmPassword
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const handleRegister = async (event) => {

    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (
      password !==
      confirmPassword
    ) {

      toast.error(
        "Passwords do not match"
      );

      return;
    }

    setIsLoading(true);

    try {

      await api.post(
        "/users",
        {
          name,
          email,
          password
        }
      );

      toast.success(
        "Account created successfully. Please login."
      );

      navigate(
        "/login"
      );

    } catch (error) {

      const validationErrors =
        error.response?.data?.data;

      if (
        validationErrors &&
        typeof validationErrors === "object"
      ) {

        Object.values(
          validationErrors
        ).forEach((message) => {

          toast.error(
            message
          );
        });

      } else {

        toast.error(
          error.response?.data?.message ||
          "Registration failed"
        );
      }

    } finally {

      setIsLoading(false);
    }
  };

  return (

    <div className="
      min-h-screen
      bg-gray-100
      flex
      items-center
      justify-center
    ">

      <div className="
        bg-white
        p-10
        rounded-2xl
        shadow-lg
        w-full
        max-w-md
      ">

        <h2 className="
          text-3xl
          font-bold
          text-center
          mb-8
          text-blue-600
        ">
          Create Account
        </h2>

        <form
          onSubmit={handleRegister}
          className="space-y-5"
        >

          <input
            type="text"
            required
            placeholder="Enter name"
            value={name}
            onChange={(e) =>
              setName(
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

          <input
            type="email"
            required
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
              required
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

          <div className="relative">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
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
                setShowConfirmPassword(
                  !showConfirmPassword
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
                showConfirmPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />
              }

            </button>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full
              bg-green-600
              text-white
              py-3
              rounded-lg
              font-semibold
              hover:bg-green-700
              transition-all
              duration-200
              cursor-pointer
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {
              isLoading
                ? "Creating account..."
                : "Register"
            }
          </button>

          <div className="
            text-center
            mt-4
          ">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/login"
                )
              }
              className="
                text-blue-600
                hover:underline
                cursor-pointer
              "
            >
              Already have an account? Login
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Register;