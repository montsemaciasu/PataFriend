import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  }
);

export const listPets = ({ limit = 3 } = {}) =>
  axios.get(`${BASE_URL}/pets?limit=${limit}`).then((res) => res.data);

const profile = () => http.get("/users/me");

const register = (user) => http.post("/users", user);

const login = (user) => http.post("/sessions", user);

const logout = () => http.delete("/sessions");

export { login, logout, register, profile };
