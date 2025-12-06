// client/src/pages/Approvals.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Clock, 
  ShieldAlert, 
  Mail 
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Approvals() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // Stores ID of user being processed

  const getToken = () => localStorage.getItem("token");

  // Fetch Pending Users
  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/pending`, {
        headers: { Authorization: getToken() ? `Bearer ${getToken()}` : "" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load");
      setPendingUsers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Handle Approve
  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      const res = await fetch(`${API_URL}/api/auth/approve/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed");
      
      // Remove from list locally
      setPendingUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Reject
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject and remove this user?")) return;
    try {
      setActionLoading(id);
      const res = await fetch(`${API_URL}/api/auth/reject/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed");

      // Remove from list locally
      setPendingUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen text-gray-100">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldAlert size={32} className="text-yellow-500" />
            Pending Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            The following admins/volunteers have registered and are waiting for your access approval.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-400 bg-red-900/20 border border-red-800 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-900/50 rounded-2xl border border-gray-800"></div>
            ))}
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-900/30 border border-gray-800 border-dashed rounded-3xl">
            <CheckCircle size={64} className="text-emerald-500/20 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">All Caught Up!</h3>
            <p className="text-gray-600">No pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.map((user) => (
              <div 
                key={user._id} 
                className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl hover:border-gray-700 transition-all"
              >
                {/* User Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-gray-600 text-xl font-bold text-gray-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{user.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-semibold">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Mail size={16} className="text-gray-500" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Clock size={16} className="text-gray-500" />
                    Registered: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleReject(user._id)}
                    disabled={actionLoading === user._id}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all text-sm font-semibold disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  
                  <button
                    onClick={() => handleApprove(user._id)}
                    disabled={actionLoading === user._id}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-all text-sm font-bold disabled:opacity-50"
                  >
                    {actionLoading === user._id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}