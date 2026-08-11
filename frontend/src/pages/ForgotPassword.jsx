import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../api/axios";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    showNewPassword,
    setShowNewPassword
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const handleResetPassword =
    async (event) => {

      event.preventDefault();

      if (isLoading) {
        return;
      }

      setIsLoading(true);

      try {

        await api.post(
          "/users/forgot-password",
          {
            email,
            newPassword
          }
        );

        toast.success(
          "Password updated successfully"
        );

        navigate(
          "/login"
        );

      } catch (error) {

        toast.error(
          error.response?.data?.message ||
          "Password reset failed"
        );

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
          Reset Password
        </h2>

        <form
          onSubmit={handleResetPassword}
          className="space-y-5"
        >

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
                showNewPassword
                  ? "text"
                  : "password"
              }
              required
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
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
                setShowNewPassword(
                  !showNewPassword
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
                showNewPassword
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
              bg-blue-600
              text-white
              py-3
              rounded-lg
              font-semibold
              hover:bg-blue-700
              transition-all
              duration-200
              cursor-pointer
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {
              isLoading
                ? "Updating password..."
                : "Reset Password"
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
              Back to Login
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ForgotPassword;