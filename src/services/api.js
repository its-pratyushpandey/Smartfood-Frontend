import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

const unwrap = (promise) => promise.then((response) => response.data);

const messageFromError = (error) => error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong";

export const apiErrorMessage = messageFromError;

export const getDashboardStats = () => unwrap(api.get("/dashboard/stats"));
export const getSuppliers = (params = {}) => unwrap(api.get("/suppliers", { params }));
export const getSupplier = (id) => unwrap(api.get(`/suppliers/${id}`));
export const createSupplier = (payload) => unwrap(api.post("/suppliers", payload));
export const getQueries = (params = {}) => unwrap(api.get("/queries", { params }));
export const getQuery = (id) => unwrap(api.get(`/queries/${id}`));
export const createQuery = (payload) => unwrap(api.post("/queries", payload));
export const updateQuery = (id, payload) => unwrap(api.patch(`/queries/${id}`, payload));
export const deleteQuery = (id) => unwrap(api.delete(`/queries/${id}`));
export const updateQueryStatus = (id, payload) => unwrap(api.patch(`/queries/${id}/status`, payload));
export const addQueryNote = (id, payload) => unwrap(api.post(`/queries/${id}/notes`, payload));
