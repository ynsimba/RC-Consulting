import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";

const HomePage = lazy(() => import("@/pages/HomePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const PracticeAreasPage = lazy(() => import("@/pages/PracticeAreasPage"));
const PracticeAreaDetailPage = lazy(
  () => import("@/pages/PracticeAreaDetailPage"),
);
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogArticlePage = lazy(() => import("@/pages/BlogArticlePage"));
const FaqPage = lazy(() => import("@/pages/FaqPage"));
const BookingPage = lazy(() => import("@/pages/BookingPage"));
const ManageAppointmentPage = lazy(
  () => import("@/pages/ManageAppointmentPage"),
);
const AppointmentHistoryPage = lazy(
  () => import("@/pages/AppointmentHistoryPage"),
);
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));

const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const AgendaPage = lazy(() => import("@/pages/admin/AgendaPage"));
const ClientsPage = lazy(() => import("@/pages/admin/ClientsPage"));
const AppointmentsAdminPage = lazy(
  () => import("@/pages/admin/AppointmentsAdminPage"),
);
const BlogAdminPage = lazy(() => import("@/pages/admin/BlogAdminPage"));
const FaqAdminPage = lazy(() => import("@/pages/admin/FaqAdminPage"));
const MessagesPage = lazy(() => import("@/pages/admin/MessagesPage"));
const AvailabilityPage = lazy(() => import("@/pages/admin/AvailabilityPage"));
const StatsPage = lazy(() => import("@/pages/admin/StatsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-sm tracking-wide text-muted uppercase">
      Chargement…
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="a-propos" element={<AboutPage />} />
                <Route path="nos-expertises" element={<PracticeAreasPage />} />
                <Route
                  path="nos-expertises/:slug"
                  element={<PracticeAreaDetailPage />}
                />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<BlogArticlePage />} />
                <Route path="faq" element={<FaqPage />} />
                <Route path="rendez-vous" element={<BookingPage />} />
                <Route
                  path="rendez-vous/gerer/:token"
                  element={<ManageAppointmentPage />}
                />
                <Route
                  path="rendez-vous/historique"
                  element={<AppointmentHistoryPage />}
                />
                <Route path="contact" element={<ContactPage />} />
                <Route path="mentions-legales" element={<LegalPage />} />
                <Route
                  path="politique-de-confidentialite"
                  element={<PrivacyPage />}
                />
              </Route>

              <Route path="admin/login" element={<AdminLoginPage />} />
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="rendez-vous" element={<AppointmentsAdminPage />} />
                <Route path="blog" element={<BlogAdminPage />} />
                <Route path="faq" element={<FaqAdminPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="disponibilites" element={<AvailabilityPage />} />
                <Route path="statistiques" element={<StatsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
