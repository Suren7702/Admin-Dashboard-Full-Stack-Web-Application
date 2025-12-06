// src/layout/DashboardLayout.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-red-900 text-amber-200 border border-amber-400/70"
      : "text-gray-200 hover:bg-red-900/40 hover:text-amber-200";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">

      {/* TVK Flag Strip */}
      <div>
        <div className="h-1.5 bg-red-900" />
        <div className="h-1.5 bg-amber-400" />
        <div className="h-1.5 bg-red-900" />
      </div>

      {/* ================= TOP BAR ================= */}
      <div className="flex justify-between items-center p-3 border-b border-slate-800">

        {/* LEFT – MENU BUTTON */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="px-4 py-2 rounded-lg bg-red-900 text-amber-200 border border-red-800 shadow-md"
        >
          Menu
        </button>

        {/* CENTER – TITLE */}
        <div className="flex-1 text-center">
          <p className="text-base md:text-lg font-bold text-amber-300 tracking-wide">
            தமிழக வெற்றிக் கழகம் - திருச்சி புறநகர் மேற்கு மாவட்டம்
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Admin Dashboard
          </p>
        </div>

        {/* RIGHT – Search + Notification + Profile */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            className="hidden md:block px-3 py-1.5 text-sm bg-[#111] border border-[#222]
             rounded-lg placeholder-gray-500 text-gray-200 
             focus:ring-1 focus:ring-amber-400"
          />

          {/* Notification */}
        {/*<button className="relative p-2 rounded-lg bg-[#111] hover:bg-[#222] transition">
            <span className="material-icons text-amber-300 text-xl">notifications</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600"></span>
          </button> */}

          {/* Profile */}
          <div className="relative group">
            <div className="w-10 h-10 flex items-center justify-center 
              bg-amber-400 text-black font-bold rounded-full cursor-pointer shadow-lg">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>

            {/* Dropdown */}
            <div className="absolute hidden group-hover:block right-0 mt-2
              w-44 bg-[#111] border border-[#222] rounded-lg shadow-xl z-50">

              <p className="px-3 py-2 text-xs text-gray-400 border-b border-[#222]">
                Logged in as:
                <br />
                <span className="text-gray-200 font-medium">{user?.name}</span>
              </p>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/40"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BACKDROP ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-black border-r border-red-900/70 p-4 flex flex-col z-50
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
        `}
      >
        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="mb-4 px-3 py-1 rounded bg-red-900 text-amber-200 border border-red-800"
        >
          Close
        </button>

        {/* Brand */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-red-800 bg-red-900">
              <span className="text-xs font-semibold text-amber-300">TVK</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-amber-300 uppercase tracking-[0.18em]">
                Party Admin
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Pro Team Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Items */}
        <nav className="flex-1 space-y-2 text-sm">
          <button
            onClick={() => { setSidebarOpen(false); navigate("/dashboard"); }}
            className={`w-full text-left px-3 py-2 rounded-lg ${isActive("/dashboard")}`}
          >
            Dashboard
          </button>

          <button
            onClick={() => { setSidebarOpen(false); navigate("/dashboard/members"); }}
            className={`w-full text-left px-3 py-2 rounded-lg ${isActive("/dashboard/members")}`}
          >
            Members
          </button>

          <button
            onClick={() => { setSidebarOpen(false); navigate("/dashboard/volunteers"); }}
            className={`w-full text-left px-3 py-2 rounded-lg ${isActive("/dashboard/volunteers")}`}
          >
            Volunteers
          </button>

          <button
            onClick={() => { setSidebarOpen(false); navigate("/dashboard/approvals"); }}
            className={`w-full text-left px-3 py-2 rounded-lg ${isActive("/dashboard/approvals")}`}
          >
            Approvals
          </button>

          <button
            onClick={() => { setSidebarOpen(false); navigate("/dashboard/maanadu-supporters"); }}
            className={`w-full text-left px-3 py-2 rounded-lg ${isActive("/dashboard/maanadu-supporters")}`}
          >
            Maanadu Supporters
          </button>
        </nav>

        {/* Footer */}
        <div className="mt-4 border-t border-red-900/70 pt-3 text-xs">
          <p className="text-gray-400 mb-2">
            Logged in as:<br />
            <span className="text-amber-200 font-medium">{user?.name || "Admin"}</span>
          </p>

          <button
            onClick={handleLogout}
            className="w-full text-left text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="p-6">{children}</main>
    </div>
  );
}
