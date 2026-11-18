import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import TopBar from "./components/TopBar.jsx";
import TabNav from "./components/TabNav.jsx";
import BottomNav from "./components/BottomNav.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InputForm from "./pages/pic/InputForm.jsx";
import QueueDashboard from "./pages/pic/QueueDashboard.jsx";
import SupplyToLine from "./pages/pic/SupplyToLine.jsx";
import TaskList from "./pages/mp/TaskList.jsx";
import ApprovalList from "./pages/qc/ApprovalList.jsx";
import ReadyToReturn from "./pages/admin/ReadyToReturn.jsx";
import ShiftReport from "./pages/sectionhead/ShiftReport.jsx";
import FullReport from "./pages/leader/FullReport.jsx";

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1">
        <TabNav />
        <main className="flex-1 min-w-0 pb-24 md:pb-10 pt-4">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pic/input"
              element={
                <ProtectedRoute allowedRoles={["pic_area"]}>
                  <InputForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pic/queue"
              element={
                <ProtectedRoute
                  allowedRoles={["pic_area", "mp_repair", "section_head"]}
                >
                  <QueueDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pic/supply"
              element={
                <ProtectedRoute allowedRoles={["pic_area"]}>
                  <SupplyToLine />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mp/tasks"
              element={
                <ProtectedRoute allowedRoles={["mp_repair"]}>
                  <TaskList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/qc/approval"
              element={
                <ProtectedRoute allowedRoles={["qc", "pic_area"]}>
                  <ApprovalList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/ready-to-return"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReadyToReturn />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sectionhead/report"
              element={
                <ProtectedRoute allowedRoles={["section_head", "admin"]}>
                  <ShiftReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leader/report"
              element={
                <ProtectedRoute
                  allowedRoles={["leader", "admin", "section_head"]}
                >
                  <FullReport />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
