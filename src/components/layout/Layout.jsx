import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, LayoutDashboard, Wallet, FileText } from "lucide-react";

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 p-4 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-xl text-blue-400 flex items-center gap-2">
            <span className="hidden md:inline">LAN Center Manager</span>
            <span className="md:hidden">LCM</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded ml-2">
              {user?.role}
            </span>
          </div>
          <nav>
            <ul className="flex space-x-1 md:space-x-4">
              <li>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden md:inline">Panel Principal</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/debts"
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  <Wallet className="w-5 h-5" />
                  <span className="hidden md:inline">Deudas</span>
                </Link>
              </li>
              {user?.role === "ADMIN" && (
                <li>
                  <Link
                    to="/daily-entry"
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="hidden md:inline">Registro Diario</span>
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
