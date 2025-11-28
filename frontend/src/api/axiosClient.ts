import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'https://travelagency-1-odma.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'userId': localStorage.getItem("userId") || '',
  },
});

export default axiosClient;
