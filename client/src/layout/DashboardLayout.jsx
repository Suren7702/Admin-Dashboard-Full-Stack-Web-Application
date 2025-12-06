// src/layout/DashboardLayout.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Hand, 
  CheckCircle, 
  Heart, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  Bell, 
  ChevronDown 
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // User Auth Logic
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || { name: "Admin", role: "Organizer" };
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Navigation Items Config
  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Members", path: "/dashboard/members", icon: <Users size={20} /> },
    { label: "Volunteers", path: "/dashboard/volunteers", icon: <Hand size={20} /> },
    { label: "Approvals", path: "/dashboard/approvals", icon: <CheckCircle size={20} /> },
    { label: "Maanadu Supporters", path: "/dashboard/maanadu-supporters", icon: <Heart size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#0f1115] text-gray-100 font-sans overflow-hidden">
      
      {/* ================= SIDEBAR (Desktop Fixed / Mobile Drawer) ================= */}
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800 relative overflow-hidden">
          {/* Decorative Flag Strip Top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-700 via-yellow-500 to-red-700"></div>
          
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center border border-yellow-500/30 shadow-lg shadow-red-900/20">
            <span className="font-black text-yellow-400 text-xs tracking-tighter">TVK</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-100 tracking-wide text-sm">TVK Admin</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Tiruchirappalli</p>
          </div>
          
          {/* Mobile Close */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-2">Menu</p>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  active 
                    ? "text-white bg-gradient-to-r from-red-900/80 to-red-900/10 border border-red-800/50" 
                    : "text-gray-400 hover:text-gray-100 hover:bg-gray-900"
                }`}
              >
                {/* Active Indicator Line */}
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]"></div>}
                
                <span className={active ? "text-yellow-500" : "text-gray-500 group-hover:text-gray-300"}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer (Logout) */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-[#0a0a0a]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>


      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header (Glassmorphism) */}
        <header className="h-16 z-30 flex items-center justify-between px-6 border-b border-gray-800 bg-[#0f1115]/80 backdrop-blur-md sticky top-0">
          
          {/* Left: Mobile Toggle & Title */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:block">
               {/* Breadcrumb-like text */}
               <h2 className="text-sm font-medium text-gray-400">
                  Dashboard <span className="mx-2 text-gray-600">/</span> <span className="text-gray-100">Overview</span>
               </h2>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center bg-[#1a1d24] border border-gray-700 rounded-full px-4 py-1.5 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-all w-64">
              <Search size={16} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500 ml-2 w-full"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full border border-[#0f1115]"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 focus:outline-none group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-gray-200 leading-none">{user?.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase">{user?.role || "Admin"}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-[#0f1115] ring-2 ring-gray-700 group-hover:ring-gray-500 transition-all flex items-center justify-center text-black font-bold shadow-lg">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <ChevronDown size={14} className="text-gray-500 md:block hidden" />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-48 bg-[#1a1d24] border border-gray-700 rounded-xl shadow-2xl z-20 py-1 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-700 md:hidden">
                       <p className="text-sm text-white">{user?.name}</p>
                       <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                      Profile Settings
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>

      </div>
      
      {/* Utility Styles for Scrollbar (Optional) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #374151;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}