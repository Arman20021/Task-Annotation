import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const publicRoutes = ["/auth/login/", "/auth/register/", "/auth/refresh/"];

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const requestUrl = config.url || "";

  const isPublicRoute = publicRoutes.some((route) =>
    requestUrl.includes(route)
  );

  if (isPublicRoute) {
    return config;
  }

  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const requestUrl = error.config?.url || "";

      const isPublicRoute = publicRoutes.some((route) =>
        requestUrl.includes(route)
      );

      if (status === 401 && !isPublicRoute) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);