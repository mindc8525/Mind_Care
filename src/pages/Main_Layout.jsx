import React, { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  FaBrain,
  FaChartBar,
  FaGlobe,
  FaCubes,
  FaChartLine,
  FaCircle,
  FaBars,
  FaChevronLeft,
  FaProjectDiagram,
} from "react-icons/fa";

const navItems = [
  { label: "Predictor", path: "/predictor", icon: <FaBrain /> },
  { label: "Country Comparison", path: "/country-comparison", icon: <FaGlobe /> },
  { label: "Bubble Plot", path: "/bubble-plot", icon: <FaCircle /> },
  { label: "3D Bubble Plot", path: "/3d-bubble-plot", icon: <FaCubes /> },
  { label: "Trend Analysis", path: "/trend-analysis", icon: <FaChartLine /> },
  { label: "Violin plot", path: "/violin-plot", icon: <FaChartBar /> },
  { label: "Parallel plot", path: "/parallel-plot", icon: <FaProjectDiagram /> },
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-md p-4 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          {!collapsed && (
            <h2
              onClick={() => navigate("/")}
              className="text-xl font-bold text-indigo-600 cursor-pointer hover:underline"
            >
              MindCare
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-indigo-600 p-2 focus:outline-none"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <FaBars /> : <FaChevronLeft />}
          </button>
        </div>

        <nav className="space-y-3">
          {navItems.map((item, i) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "hover:bg-indigo-50 text-gray-700"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
