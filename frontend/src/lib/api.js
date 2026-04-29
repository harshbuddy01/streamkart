import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data;
};

export const fetchProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const fetchCategories = async () => {
  const { data } = await api.get("/categories");
  return data;
};

export const fetchAuthors = async () => {
  const { data } = await api.get("/authors");
  return data;
};

export const createOrder = async (payload) => {
  const { data } = await api.post("/orders", payload);
  return data;
};

export const verifyPayment = async (payload) => {
  const { data } = await api.post("/orders/verify", payload);
  return data;
};

export const fetchOrder = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};
