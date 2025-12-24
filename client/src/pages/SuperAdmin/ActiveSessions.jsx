import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import { Monitor, Smartphone, Globe, LogOut, ShieldCheck, Clock, AlertTriangle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Session fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminate = async (id) => {
    if (!window.confirm("Terminate this login session?")) return;
    try {
      await fetch(`${API_URL}/api/auth/sessions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchSessions();
    } catch (err) {
      console.error("Termination error", err);
    }
  };

  const handlePurgeOthers = async () => {
    const confirmMessage = "⚠️ SECURITY ALERT: This will log you out of every other device and browser. Continue?";
    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/sessions/purge-others`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        alert("Success: All other active sessions have been terminated.");
        fetchSessions();
      }
    } catch (err) {
      console.error("Purge failed", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-[2rem] p-6 shadow-2xl transition-all duration-300">
        
        {/* Header with Panic Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <ShieldCheck className="text-cyan-500 w-7 h-7" /> 
              Security Command
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Active sessions: <span className="text-cyan-400 font-mono font-bold">{sessions.length}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handlePurgeOthers}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-500 hover:text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
            >
              <AlertTriangle size={16} />
              Terminate Other Sessions
            </button>

            <button onClick={fetchSessions} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-2xl transition-colors border border-white/5">
              <Clock className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em]">Scanning Active Nodes</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div 
                key={session._id}
                className={`flex flex-col md:flex-row items-center justify-between p-5 rounded-2xl border transition-all duration-500 ${
                  session.isActive 
                    ? "bg-cyan-500/5 border-cyan-500/20 shadow-lg" 
                    : "bg-gray-950/40 border-gray-800 opacity-60"
                }`}
              >
                <div className="flex items-center gap-5 w-full">
                  <div className="p-4 bg-black/60 rounded-2xl border border-white/5">
                    {session.device === "mobile" ? <Smartphone className="w-6 h-6 text-cyan-400" /> : <Monitor className="w-6 h-6 text-cyan-400" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-white font-bold text-lg">{session.os} • {session.browser}</h4>
                      
                      {/* Live Badge */}
                      {session.isActive && (
                        <div className="px-2 py-0.5 bg-cyan-500 text-black text-[9px] font-black rounded-md uppercase flex items-center gap-1">
                          <span className="w-1 h-1 bg-black rounded-full animate-pulse"></span>
                          Live
                        </div>
                      )}

                      {/* 🕵️ NEW LOCATION ALERT BADGE */}
                      {session.isNewLocation && (
                        <div className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black rounded-md uppercase flex items-center gap-1">
                          <AlertTriangle size={10} />
                          New Location
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> 
                        {session.location?.city}, {session.location?.country}
                      </p>
                      <p className="text-xs text-gray-600 font-mono">IP: {session.ipAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Heartbeat</p>
                    <p className="text-xs text-gray-400 font-mono">
                       {new Date(session.lastActive).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {session.isActive && (
                    <button 
                      onClick={() => handleTerminate(session._id)}
                      className="p-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all active:scale-90"
                      title="Terminate Session"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}