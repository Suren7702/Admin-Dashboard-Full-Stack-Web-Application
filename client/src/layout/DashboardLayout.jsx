// src/layout/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Hand, 
  CheckCircle, 
  Heart, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  ChevronRight,
  Maximize,
  Minimize,
  MapPin,
  ShieldCheck, // 🛡️ Security Icon
  ChevronDown
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen toggle logic
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // Dummy Notifications
  const notifications = [
    { id: 1, text: "New member registration in Trichy", time: "2 min ago", unread: true },
    { id: 2, text: "Volunteer approval pending", time: "1 hour ago", unread: false },
    { id: 3, text: "Maanadu list updated", time: "Yesterday", unread: false },
  ];

  // User Auth Logic
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || { name: "Admin", role: "District Secretary" };
    } catch {
      return { name: "Admin", role: "Guest" };
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ⭐ MENU ITEMS (Includes Active Sessions)
  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "கிளைகள்", path: "/dashboard/kizhai", icon: <MapPin size={20} /> },
    { label: "பூத்", path: "/dashboard/booths/add", icon: <MapPin size={20} /> },
    { label: "நிர்வாகிகள்", path: "/dashboard/members", icon: <Users size={20} /> },
    { label: "தொண்டர்கள்", path: "/dashboard/volunteers", icon: <Hand size={20} /> },
    { label: "ஒப்புதல்", path: "/dashboard/approvals", icon: <CheckCircle size={20} /> },
    { label: "Maanadu Supporters", path: "/dashboard/maanadu-supporters", icon: <Heart size={20} /> },
    { label: "Active Sessions", path: "/dashboard/active-sessions", icon: <ShieldCheck size={20} className="text-cyan-400" /> },
  ];

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="flex h-screen bg-[#0f1115] text-gray-100 font-sans overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
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
        {/* Sidebar Top Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800 relative overflow-hidden bg-gradient-to-r from-red-900/10 to-transparent">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
          
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-red-800 to-black flex items-center justify-center border border-yellow-500/40 shadow-xl">
              <span className="font-black text-yellow-400 text-xs tracking-tighter">TVK</span>
            </div>
          </div>

          <div className="flex-1 cursor-pointer group">
            <h1 className="font-bold text-gray-100 tracking-wide text-sm group-hover:text-yellow-400 transition-colors">
              ADMIN
            </h1>
            <div className="flex items-center gap-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider group-hover:text-gray-200">
                திருச்சி மேற்கு மாவட்டம் 
              </p>
              <ChevronDown size={10} className="text-gray-500 group-hover:text-yellow-500 transition-colors" />
            </div>
          </div>
          
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
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]"></div>
                )}
                <span className={active ? "text-yellow-500" : "text-gray-500 group-hover:text-gray-300"}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>

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

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 z-30 flex items-center justify-between px-6 border-b border-gray-800 bg-[#0f1115]/80 backdrop-blur-md sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <Menu size={20} />
            </button>
            
            <nav className="hidden md:flex items-center text-sm text-gray-500">
              <span className="hover:text-gray-300 cursor-pointer">App</span>
              {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                return (
                  <span key={to} className="flex items-center">
                    <ChevronRight size={14} className="mx-1" />
                    <Link to={to} className="capitalize hover:text-yellow-500 transition-colors">
                      {value.replace("-", " ")}
                    </Link>
                  </span>
                );
              })}
            </nav>
          </div>

          <div className="hidden lg:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <h1 className="text-xl font-black tracking-wide whitespace-nowrap text-white drop-shadow-md">
              தமிழக வெற்றிக் கழகம்
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden xl:block text-xs font-mono text-gray-500 mr-2">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            <button onClick={toggleFullScreen} className="hidden md:block text-gray-400 hover:text-white transition-colors">
              {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative text-gray-400 hover:text-white p-1">
                <Bell size={20} />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border border-[#0f1115]"></span>
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-72 bg-[#1a1d24] border border-gray-700 rounded-xl shadow-2xl z-20 py-2">
                    <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-gray-800/50 cursor-pointer border-b border-gray-800 last:border-0">
                          <p className="text-xs text-gray-300 font-medium">{n.text}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 group focus:outline-none">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-white to-gray-400 border-2 border-[#0f1115] flex items-center justify-center text-black font-bold shadow-lg group-hover:scale-105 transition-transform">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-[#1a1d24] border border-gray-700 rounded-xl shadow-2xl z-20 py-1 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm text-white font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                      Profile Settings
                    </button>
                    {/* Security Link */}
                    <button 
                      onClick={() => { navigate("/dashboard/active-sessions"); setProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-cyan-400 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <ShieldCheck size={16} />
                      Active Sessions
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors border-t border-gray-700 mt-1">
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:flex md:items-center md:justify-between">
              <h2 className="text-2xl font-bold text-white capitalize">
                {location.pathname.split("/").pop().replace("-", " ") || "Dashboard"}
              </h2>
            </div>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #374151; border-radius: 20px; }
      `}</style>
    </div>
  );
}