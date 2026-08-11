import axios from "axios";
import { getToken, logout } from "../utils/auth";

const api = axios.create({

  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8081/api/v1",

  headers: {
    "Content-Type":
      "application/json"
  }
});

api.interceptors.request.use(
  (config) => {

    if (
      config.url?.includes(
        "/users/login"
      ) ||

      config.url === "/users"
    ) {
      return config;
    }

    const token = getToken();

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (
      error.response?.status === 401 &&

      error.config?.url !==
        "/users/login" &&

      error.config?.url !==
        "/users"
    ) {

      logout();

      alert(
        "Session expired. Please login again."
      );

      window.location.href =
        "/login";
    }

    return Promise.reject(
      error
    );
  }
);

export default api;