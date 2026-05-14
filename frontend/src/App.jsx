import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard      from "./pages/Dashboard";
import Login          from "./pages/Auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";
import Products       from "./pages/Products";
import Orders         from "./pages/Orders";
import Analytics      from "./pages/Analytics";
import Stock          from "./pages/Stock";
import AI             from "./pages/AI";
import Settings       from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index        element={<Dashboard />} />
          <Route path="products"  element={<Products />} />
          <Route path="orders"    element={<Orders />} />
          <Route path="stock"     element={<Stock />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai"        element={<AI />} />
          <Route path="settings"  element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;