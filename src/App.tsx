import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
import Index from "./pages/Index";
import DoctorsPage from "./pages/DoctorsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BookAppointment from "./pages/BookAppointment";
import LoginPage from "./pages/LoginPage";
import PatientDashboard from "./pages/PatientDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminConsultations from "./pages/admin/AdminConsultations";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminSMS from "./pages/admin/AdminSMS";
import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorQueue from "./pages/doctor/DoctorQueue";
import DoctorConsultations from "./pages/doctor/DoctorConsultations";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import ReceptionistLayout from "./pages/receptionist/ReceptionistLayout";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import ReceptionistQueue from "./pages/receptionist/ReceptionistQueue";
import ReceptionistWalkin from "./pages/receptionist/ReceptionistWalkin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
          <Route path="/doctors" element={<PublicLayout><DoctorsPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/book" element={<PublicLayout><BookAppointment /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />

          {/* Patient */}
          <Route path="/dashboard" element={<PatientDashboard />} />

          {/* Staff Login */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="consultations" element={<AdminConsultations />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="sms" element={<AdminSMS />} />
          </Route>

          {/* Doctor Panel */}
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="queue" element={<DoctorQueue />} />
            <Route path="consultations" element={<DoctorConsultations />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="patients" element={<DoctorPatients />} />
          </Route>

          {/* Receptionist Panel */}
          <Route path="/receptionist" element={<ReceptionistLayout />}>
            <Route path="dashboard" element={<ReceptionistDashboard />} />
            <Route path="queue" element={<ReceptionistQueue />} />
            <Route path="walkin" element={<ReceptionistWalkin />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
