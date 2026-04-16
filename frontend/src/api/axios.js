import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔥 TEMP TOKEN (replace later with login)
API.interceptors.request.use((req) => {
  req.headers.Authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc2MzM1Njk1LCJleHAiOjE3NzY5NDA0OTV9.t8lh5Gut_nL4KGkZF3MulgtBASvQzG5zy-TQXBfrKPI";
  return req;
});

export default API;