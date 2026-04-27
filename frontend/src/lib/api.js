import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const getToken = () => localStorage.getItem("rdt_token");

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const login = async (username, password) => {
  const { data } = await api.post("/auth/login", { username, password });
  localStorage.setItem("rdt_token", data.token);
  localStorage.setItem("rdt_user", data.username);
  return data;
};

export const logout = () => {
  localStorage.removeItem("rdt_token");
  localStorage.removeItem("rdt_user");
};

export const isAuthed = () => !!localStorage.getItem("rdt_token");

export const fetchCategories = () => api.get("/categories").then((r) => r.data);
export const fetchProducts = () => api.get("/products").then((r) => r.data);
export const fetchSauces = () => api.get("/sauces").then((r) => r.data);

export const createCategory = (p) => api.post("/categories", p).then((r) => r.data);
export const updateCategory = (id, p) => api.put(`/categories/${id}`, p).then((r) => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data);

export const createProduct = (p) => api.post("/products", p).then((r) => r.data);
export const updateProduct = (id, p) => api.put(`/products/${id}`, p).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);

export const createSauce = (p) => api.post("/sauces", p).then((r) => r.data);
export const updateSauce = (id, p) => api.put(`/sauces/${id}`, p).then((r) => r.data);
export const deleteSauce = (id) => api.delete(`/sauces/${id}`).then((r) => r.data);
