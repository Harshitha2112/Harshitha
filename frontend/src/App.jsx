import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import Home          from "./pages/Home";
import AuthPage      from "./pages/AuthPage";
import Recipes       from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";
import CreateRecipe  from "./pages/CreateRecipe";
import Dashboard     from "./pages/Dashboard";
import Bookmarks     from "./pages/Bookmarks";
import SubAdminPanel from "./pages/SubAdminPanel";
import AdminPanel    from "./pages/AdminPanel";

const App = () => {
  // Persist theme across sessions
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  // Apply theme on first render
  document.documentElement.setAttribute("data-theme", theme);

  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.875rem",
          },
          success: { iconTheme: { primary: "#f97316", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#ef4444",  secondary: "#fff" } },
        }}
      />

      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main>
        <Routes>
          {/* ── Public Routes ─────────────────────────── */}
          <Route path="/"          element={<Home />} />
          <Route path="/recipes"   element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />

          {/* Auth routes — redirect to dashboard if already logged in */}
          <Route path="/login"    element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* ── Private Routes (any logged-in user) ───── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/recipes/create" element={
            <ProtectedRoute>
              <CreateRecipe />
            </ProtectedRoute>
          } />

          <Route path="/bookmarks" element={
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          } />

          {/* ── Sub-Admin Routes ──────────────────────── */}
          <Route path="/subadmin" element={
            <ProtectedRoute roles={["SUBADMIN", "ADMIN"]}>
              <SubAdminPanel />
            </ProtectedRoute>
          } />

          {/* ── Admin-Only Routes ─────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* ── Fallback ─────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
