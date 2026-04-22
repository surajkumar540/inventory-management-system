// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Signup from "./pages/Auth/Signup";
import Analytics from "./pages/Analytics";
import Stock from "./pages/Stock"; // 🆕

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin + Manager only */}
          <Route
            index
            element={
              <ProtectedRoute role={["ADMIN", "MANAGER"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* All roles */}
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          {/* Staff + Manager + Admin */}
          <Route path="stock" element={<Stock />} /> {/* 🆕 */}
          {/* Admin + Manager only */}
          <Route
            path="analytics"
            element={
              <ProtectedRoute role={["ADMIN", "MANAGER"]}>
                <Analytics />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
