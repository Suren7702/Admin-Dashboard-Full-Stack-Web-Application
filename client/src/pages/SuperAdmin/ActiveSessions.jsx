import { useEffect, useState } from "react";
import { Monitor, Smartphone, Globe, LogOut, ShieldCheck, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch sessions from the new route we added
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      // Ensure we set an array even if the backend fails
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

  // 🚫 Terminate a session (Logout specific device)
  const handleTerminate = async (id) => {
    if (!window.confirm("Terminate this login session?")) return;
    try {
      await fetch(`${API_URL}/api/auth/sessions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchSessions(); // Refresh list after deletion
    } catch (err) {
      console.error("Termination error", err);
    }
  };

  return (
    <div className="bg-[#05070a] border border-gray-800 rounded-[2rem] p-4 md:p-8 min-h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="text-cyan-500 w-6 h-6" /> 
            Active Access Points
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Manage devices currently logged into your TVK account</p>
        </div>
        <button onClick={fetchSessions} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Clock className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-10 text-gray-600 border border-dashed border-gray-800 rounded-2xl">
              No active sessions found.
            </div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session._id}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 rounded-2xl border transition-all ${
                  session.isActive 
                    ? "bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]" 
                    : "bg-gray-900/20 border-gray-800 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    {session.device === "mobile" ? (
                      <Smartphone className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <Monitor className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-bold">{session.os || "Unknown OS"} • {session.browser}</h4>
                      {session.isActive && (
                        <span className="text-[10px] px-2 py-0.5 bg-cyan-500 text-black font-black rounded-full uppercase tracking-tighter">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Globe className="w-3 h-3" /> 
                      {session.location?.city || "Unknown City"}, {session.location?.country || "Earth"} • {session.ipAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto mt-4 md:mt-0 gap-6">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Last Sync</p>
                    <p className="text-xs text-gray-400">{new Date(session.lastActive).toLocaleString()}</p>
                  </div>
                  
                  {session.isActive && (
                    <button 
                      onClick={() => handleTerminate(session._id)}
                      className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all active:scale-90"
                      title="Terminate Session"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}