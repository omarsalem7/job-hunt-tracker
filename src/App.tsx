import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { DashboardPage } from "./pages/DashboardPage";
import { SharedBoardPage } from "./pages/SharedBoardPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (guests only) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterForm />
            </PublicRoute>
          }
        />

        {/* OAuth Callback Route */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Public Shared Board Route */}
        <Route path="/share/:token" element={<SharedBoardPage />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Contacts Route */}
        {/* <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <ContactsPage />
            </ProtectedRoute>
          }
        /> */}

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
