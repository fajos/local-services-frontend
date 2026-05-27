import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 10_000,
});
export const auth = (token: string | null) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export default API;