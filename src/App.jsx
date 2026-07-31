import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Layout
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

// Halaman publik
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import PortfolioPage from "./pages/PortfolioPage";
import CompanyPage from "./pages/CompanyPage";
import InsightPage from "./pages/InsightPage";
import ContactPage from "./pages/ContactPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import PortfolioDetailPage from "./pages/PortfolioDetailPage";

// Halaman admin
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPortfolioPage from "./pages/admin/AdminPortfolioPage";
import AdminPortfolioCreatePage from "./pages/admin/AdminPortfolioCreatePage";
import AdminPortfolioEditPage from "./pages/admin/AdminPortfolioEditPage";

function ScrollTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />

      <Routes>
        {/* =========================
            WEBSITE PUBLIK
        ========================== */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/services" element={<ServicesPage />} />

          <Route
            path="/services/:slug"
            element={<ServiceDetailPage />}
          />

          <Route path="/portfolio" element={<PortfolioPage />} />

          <Route
            path="/portfolio/:slug"
            element={<PortfolioDetailPage />}
          />

          <Route path="/company" element={<CompanyPage />} />

          <Route path="/insight" element={<InsightPage />} />

          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* =========================
            LOGIN ADMIN
            Tidak menggunakan AdminLayout
            dan tidak diproteksi
        ========================== */}
        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        {/* =========================
            DASHBOARD ADMIN
            Seluruh route di dalamnya
            dilindungi ProtectedAdminRoute
        ========================== */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          {/* /admin */}
          <Route
            index
            element={<AdminDashboardPage />}
          />

          {/* /admin/portfolio */}
          <Route
            path="portfolio"
            element={<AdminPortfolioPage />}
          />

          {/* /admin/portfolio/create */}
          <Route
            path="portfolio/create"
            element={<AdminPortfolioCreatePage />}
          />

          {/* /admin/portfolio/edit/:id */}
          <Route
            path="portfolio/edit/:id"
            element={<AdminPortfolioEditPage />}
          />
        </Route>

        {/* =========================
            ROUTE TIDAK DITEMUKAN
        ========================== */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}