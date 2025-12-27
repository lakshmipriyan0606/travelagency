import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'https://travelagency-1-odma.onrender.com/api',
  // baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    // 'Content-Type': 'application/json',
    userId: localStorage.getItem("userId") || "",
  },
});

export default axiosClient;
