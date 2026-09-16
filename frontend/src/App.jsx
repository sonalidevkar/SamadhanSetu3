import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// =========================
// CITIZEN
// =========================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import CitizenDashboard from "./pages/citizen/Dashboard";
import SubmitProblem from "./pages/citizen/SubmitProblem";
import TrackProblems from "./pages/citizen/TrackProblems";
import Notifications from "./pages/citizen/Notifications";
import AIAssistant from "./pages/citizen/AIAssistant";
import Feedback from "./pages/citizen/Feedback";
import Profile from "./pages/citizen/Profile";
import Rewards from "./pages/citizen/Rewards";
import HelpSupport from "./pages/citizen/HelpSupport";

// =========================
// ADMIN
// =========================
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminDashboard from "./pages/admin/AdminDashboard";

// =========================
// COLLEGE
// =========================
import CollegeLogin from "./pages/college/CollegeLogin";
import CollegeRegister from "./pages/college/CollegeRegister";
import CollegeDashboard from "./pages/college/CollegeDashboard";
import CollegeRequests from "./pages/college/CollegeRequests";
import CollegeProgress from "./pages/college/CollegeProgress";

// =========================
// INDUSTRY
// =========================
import IndustryLogin from "./pages/industry/IndustryLogin";
import IndustryRegister from "./pages/industry/IndustryRegister";

// =========================
// MUNICIPALITY
// =========================
import MunicipalityLogin from "./pages/municipality/MunicipalityLogin";
import MunicipalityRegister from "./pages/municipality/MunicipalityRegister";
import MunicipalityDashboard from "./pages/municipality/MunicipalityDashboard";

// =========================
// PROTECTED ROUTE
// =========================
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================================
            HOME
        ========================================= */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* =========================================
            CITIZEN AUTH
        ========================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================================
            CITIZEN DASHBOARD
        ========================================= */}

        <Route
          path="/citizen"
          element={
            <ProtectedRoute allowedRole="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CITIZEN - SUBMIT PROBLEM
        ========================================= */}

        <Route
          path="/citizen/submit-problem"
          element={
            <ProtectedRoute allowedRole="citizen">
              <SubmitProblem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submit-problem"
          element={
            <ProtectedRoute allowedRole="citizen">
              <SubmitProblem />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CITIZEN - TRACK PROBLEMS
        ========================================= */}

        <Route
          path="/citizen/track-problems"
          element={
            <ProtectedRoute allowedRole="citizen">
              <TrackProblems />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-problems"
          element={
            <ProtectedRoute allowedRole="citizen">
              <TrackProblems />
            </ProtectedRoute>
          }
        />

        {/* Specific Problem Tracking */}
        <Route
          path="/citizen/track-problems/:id"
          element={
            <ProtectedRoute allowedRole="citizen">
              <TrackProblems />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-problems/:id"
          element={
            <ProtectedRoute allowedRole="citizen">
              <TrackProblems />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CITIZEN - SEE ALL PROBLEMS
        ========================================= */}

        <Route
          path="/citizen/all-problems"
          element={
            <ProtectedRoute allowedRole="citizen">
              <TrackProblems />
            </ProtectedRoute>
          }
        />

        <Route
          path="/all-problems"
          element={
            <ProtectedRoute allowedRole="citizen">
              <TrackProblems />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CITIZEN - NOTIFICATIONS
        ========================================= */}

        <Route
          path="/citizen/notifications"
          element={
            <ProtectedRoute allowedRole="citizen">
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRole="citizen">
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CITIZEN - AI ASSISTANT
        ========================================= */}

        <Route
          path="/citizen/ai-assistant"
          element={
            <ProtectedRoute allowedRole="citizen">
              <AIAssistant />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute allowedRole="citizen">
              <AIAssistant />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CITIZEN - FEEDBACK
        ========================================= */}

        <Route
          path="/citizen/feedback"
          element={
            <ProtectedRoute allowedRole="citizen">
              <Feedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute allowedRole="citizen">
              <Feedback />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CITIZEN - PROFILE
        ========================================= */}

        <Route
          path="/citizen/profile"
          element={
            <ProtectedRoute allowedRole="citizen">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRole="citizen">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CITIZEN - REWARDS
        ========================================= */}

        <Route
          path="/citizen/rewards"
          element={
            <ProtectedRoute allowedRole="citizen">
              <Rewards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rewards"
          element={
            <ProtectedRoute allowedRole="citizen">
              <Rewards />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CITIZEN - HELP & SUPPORT
        ========================================= */}

        <Route
          path="/citizen/help-support"
          element={
            <ProtectedRoute allowedRole="citizen">
              <HelpSupport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/help-support"
          element={
            <ProtectedRoute allowedRole="citizen">
              <HelpSupport />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            ADMIN
        ========================================= */}

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin-register"
          element={<AdminRegister />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            COLLEGE
        ========================================= */}

        <Route
          path="/college-login"
          element={<CollegeLogin />}
        />

        <Route
          path="/college-register"
          element={<CollegeRegister />}
        />

        <Route
          path="/college"
          element={
            <ProtectedRoute allowedRole="college">
              <CollegeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/college/requests"
          element={
            <ProtectedRoute allowedRole="college">
              <CollegeRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/college/progress"
          element={
            <ProtectedRoute allowedRole="college">
              <CollegeProgress />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            INDUSTRY
        ========================================= */}

        <Route
          path="/industry-login"
          element={<IndustryLogin />}
        />

        <Route
          path="/industry-register"
          element={<IndustryRegister />}
        />

        {/* =========================================
            MUNICIPALITY
        ========================================= */}

        <Route
          path="/municipality-login"
          element={<MunicipalityLogin />}
        />

        <Route
          path="/municipality-register"
          element={<MunicipalityRegister />}
        />

        <Route
          path="/municipality"
          element={
            <ProtectedRoute allowedRole="municipality">
              <MunicipalityDashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            INVALID URL
        ========================================= */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;