import { useNavigate } from "react-router-dom";

function NotFound() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">

                <h1 className="text-6xl font-bold text-blue-600">
                    404
                </h1>

                <h2 className="text-2xl font-semibold mt-4">
                    Page Not Found
                </h2>

                <p className="text-gray-600 mt-3">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <button
                    type="button"
                    onClick={() => navigate(token ? "/dashboard" : "/login")}
                    className="mt-6 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                    {token ? "Go to Dashboard" : "Go to Login"}
                </button>

            </div>

        </div>

    );
}

export default NotFound;