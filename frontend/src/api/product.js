import api from "./axios";

export const getProducts = () => api.get("/products");
export const createProduct = (data) =>
  api.post("/products", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);