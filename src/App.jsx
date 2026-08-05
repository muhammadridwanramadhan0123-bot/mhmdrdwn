import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

/* =========================
   HALAMAN PUBLIK
========================= */
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import PortfolioPage from "./pages/PortfolioPage";
import PortfolioDetailPage from "./pages/PortfolioDetailPage";
import InsightPage from "./pages/InsightPage";
import InsightDetailPage from "./pages/InsightDetailPage";
import ContactPage from "./pages/ContactPage";
import CompanyAboutPage from "./pages/company/CompanyAboutPage";
import CompanyMilestonePage from "./pages/company/CompanyMilestonePage";
import CompanyPartnersPage from "./pages/company/CompanyPartnersPage";
import CompanyLocationPage from "./pages/company/CompanyLocationPage";
import CompanyCareerPage from "./pages/company/CompanyCareerPage";

/* =========================
   LOGIN DAN DASHBOARD
========================= */
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

/* =========================
   PORTFOLIO ADMIN
========================= */
import AdminPortfolioPage from "./pages/admin/AdminPortfolioPage";
import AdminPortfolioCreatePage from "./pages/admin/AdminPortfolioCreatePage";
import AdminPortfolioEditPage from "./pages/admin/AdminPortfolioEditPage";

/* =========================
   INSIGHT ADMIN
========================= */
import AdminInsightPage from "./pages/admin/AdminInsightPage";
import AdminInsightCreatePage from "./pages/admin/AdminInsightCreatePage";
import AdminInsightEditPage from "./pages/admin/AdminInsightEditPage";

/* =========================
   SERVICES ADMIN
========================= */
import AdminServicePage from "./pages/admin/AdminServicePage";
import AdminServiceCreatePage from "./pages/admin/AdminServiceCreatePage";
import AdminServiceEditPage from "./pages/admin/AdminServiceEditPage";

/* =========================
   MESSEGE
========================= */
import AdminContactMessagePage from "./pages/admin/AdminContactMessagePage";
import AdminContactMessageDetailPage from "./pages/admin/AdminContactMessageDetailPage";

/* =========================
   SETTING
========================= */
import AdminCompanyPage from "./pages/admin/AdminCompanyPage";
import AdminCompanyAboutPage from "./pages/admin/AdminCompanyAboutPage";
import AdminCompanyLocationPage from "./pages/admin/AdminCompanyLocationPage";
import AdminCompanyMilestonesPage from "./pages/admin/AdminCompanyMilestonesPage";
import AdminCompanyPartnersPage from "./pages/admin/AdminCompanyPartnersPage";
import AdminCompanyCareersPage from "./pages/admin/AdminCompanyCareersPage";
import AdminCompanyCertificationsPage from "./pages/admin/AdminCompanyCertificationsPage";
import AdminCompanyAwardsPage from "./pages/admin/AdminCompanyAwardsPage";


function ScrollTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
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
          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/services"
            element={<ServicesPage />}
          />

          <Route
            path="/services/:slug"
            element={<ServiceDetailPage />}
          />

          <Route
            path="/portfolio"
            element={<PortfolioPage />}
          />

          <Route
            path="/portfolio/:slug"
            element={<PortfolioDetailPage />}
          />

          {/* COMPANY */}
<Route
  path="/company"
  element={
    <Navigate
      to="/company/about-us"
      replace
    />
  }
/>

<Route
  path="/company/about-us"
  element={<CompanyAboutPage />}
/>

<Route
  path="/company/milestone"
  element={<CompanyMilestonePage />}
/>

<Route
  path="/company/partners"
  element={<CompanyPartnersPage />}
/>

<Route
  path="/company/location"
  element={<CompanyLocationPage />}
/>

<Route
  path="/company/career"
  element={<CompanyCareerPage />}
/>

          <Route
            path="/insight"
            element={<InsightPage />}
          />

          <Route
            path="/insight/:slug"
            element={<InsightDetailPage />}
          />

          <Route
            path="/contact"
            element={<ContactPage />}
          />
        </Route>

        {/* =========================
            LOGIN ADMIN
        ========================== */}
        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        {/* =========================
            DASHBOARD ADMIN
        ========================== */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route
            index
            element={<AdminDashboardPage />}
          />

          {/* Portfolio */}
          <Route
            path="portfolio"
            element={<AdminPortfolioPage />}
          />

          <Route
            path="portfolio/create"
            element={<AdminPortfolioCreatePage />}
          />

          <Route
            path="portfolio/edit/:id"
            element={<AdminPortfolioEditPage />}
          />

          {/* Insight */}
          <Route
            path="insight"
            element={<AdminInsightPage />}
          />

          <Route
            path="insight/create"
            element={<AdminInsightCreatePage />}
          />

          <Route
            path="insight/edit/:id"
            element={<AdminInsightEditPage />}
          />

          {/* Services */}
          <Route
            path="services"
            element={<AdminServicePage />}
          />

          <Route
            path="services/create"
            element={<AdminServiceCreatePage />}
          />

          <Route
            path="services/edit/:id"
            element={<AdminServiceEditPage />}
          />
          {/* PESAN MASUK */}
          <Route
            path="messages"
            element={<AdminContactMessagePage />}
          />
          <Route
            path="messages/:id"
            element={<AdminContactMessageDetailPage />}
          />

          {/* COMPANY MANAGEMENT */}
         <Route
  path="company"
  element={<AdminCompanyPage />}
/>

<Route
  path="company/about-us"
  element={<AdminCompanyAboutPage />}
/>

<Route
  path="company/location"
  element={<AdminCompanyLocationPage />}
/>

<Route
  path="company/milestones"
  element={<AdminCompanyMilestonesPage />}
/>

<Route
  path="company/partners"
  element={<AdminCompanyPartnersPage />}
/>

<Route
  path="company/careers"
  element={<AdminCompanyCareersPage />}
/>

<Route
  path="company/certifications"
  element={
    <AdminCompanyCertificationsPage />
  }
/>

<Route
  path="company/awards"
  element={
    <AdminCompanyAwardsPage />
  }
/>

<Route
  path="company/*"
  element={
    <Navigate
      to="/admin/company"
      replace
    />
  }
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