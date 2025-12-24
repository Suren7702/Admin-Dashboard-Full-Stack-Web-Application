import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import {
  Monitor,
  Smartphone,
  Tablet,
  LogOut,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Session fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const forceLogout = async (id) => {
    if (!window.confirm("Force logout this session?")) return;
    await fetch(`${API_URL}/api/sessions/${id}/logout`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSessions();
  };

  const deviceIcon = (type) => {
    if (type === "mobile") return <Smartphone size={16} />;
    if (type === "tablet") return <Tablet size={16} />;
    return <Monitor size={16} />;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen text-gray-100">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" />
            Active Sessions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor logged-in devices & locations
          </p>
        </div>

        {/* Table */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-6 text-center text-gray-400">
              Loading sessions…
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No active sessions
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-950 text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Device</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Last Active</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map((s) => (
                    <tr
                      key={s._id}
                      className="border-t border-gray-800 hover:bg-gray-800/40 transition"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">
                          {s.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.user?.email}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {deviceIcon(s.device)}
                          <div>
                            <p className="text-gray-200 capitalize">
                              {s.device}
                            </p>
                            <p className="text-xs text-gray-500">
                              {s.browser} / {s.os}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin size={14} />
                          <span className="text-xs">
                            {s.location?.city || "—"},{" "}
                            {s.location?.country || ""}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(s.lastActive).toLocaleString()}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {s.isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {s.isActive && (
                          <button
                            onClick={() => forceLogout(s._id)}
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full
                                       bg-red-600/10 text-red-400 hover:bg-red-600/20 transition"
                          >
                            <LogOut size={12} />
                            Logout
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
