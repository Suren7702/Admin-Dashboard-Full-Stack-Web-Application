// client/src/pages/MaanaduSupporters.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout.jsx";
import { 
  Heart, 
  IndianRupee, 
  Users, 
  Bus, 
  Calendar, 
  TrendingUp, 
  Trophy,
  Filter,
  Download
} from "lucide-react";

// ✅ Use env-based API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MaanaduSupporters() {
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchMaanadu = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_URL}/api/members/maanadu`, {
          headers: { Authorization: getToken() ? `Bearer ${getToken()}` : "" },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load data");
        setData(json);
      } catch (err) {
        console.error("❌ Error loading maanadu members:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMaanadu();
  }, []);

  const members = data?.members || [];
  
  // ---------- 🧮 Derived Analytics ----------
  const supportersWithAmount = members.filter((m) => {
    const ms = m.maanaduSupport || {};
    return ms.enabled || (ms.amountSpent || 0) > 0;
  });

  // Top 5 Contributors
  const topContributors = [...supportersWithAmount]
    .sort((a, b) => (b.maanaduSupport?.amountSpent || 0) - (a.maanaduSupport?.amountSpent || 0))
    .slice(0, 5);

  // Team Stats
  const teamMap = {};
  supportersWithAmount.forEach((m) => {
    const team = (m.teamName || m.team || "Other").trim() || "Other";
    const amt = m.maanaduSupport?.amountSpent || 0;
    if (!teamMap[team]) teamMap[team] = { team, totalAmount: 0, contributors: 0 };
    teamMap[team].totalAmount += amt;
    teamMap[team].contributors += 1;
  });
  const teamStats = Object.values(teamMap).sort((a, b) => b.totalAmount - a.totalAmount);
  const maxTeamAmount = teamStats.length ? Math.max(...teamStats.map((t) => t.totalAmount)) : 0;

  // Vehicle Stats
  const vehicleMap = {};
  supportersWithAmount.forEach((m) => {
    const v = (m.maanaduSupport?.vehicleType || "Not specified").trim() || "Not specified";
    const amt = m.maanaduSupport?.amountSpent || 0;
    if (!vehicleMap[v]) vehicleMap[v] = { vehicleType: v, totalAmount: 0 };
    vehicleMap[v].totalAmount += amt;
  });
  const vehicleStats = Object.values(vehicleMap).sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <DashboardLayout>
      <div className="min-h-screen text-gray-100">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
              <Trophy size={28} className="text-amber-400" />
              Maanadu Contributors
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tracking financial and logistical support for the Grand Conference.
            </p>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 text-sm hover:text-white transition-colors">
                <Filter size={16} /> Filter
             </button>
             <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors">
                <Download size={16} /> Export Report
             </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
             <Heart size={20} /> {error}
          </div>
        )}

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-900 rounded-2xl border border-gray-800"></div>)}
           </div>
        ) : data && (
          <div className="space-y-6">
            
            {/* 🔹 KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 group">
                 <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={80} /></div>
                 <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Supporters</p>
                 <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">{data.totalContributors}</span>
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Active</span>
                 </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/30 to-gray-950 border border-amber-500/20 rounded-2xl p-6 group">
                 <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><IndianRupee size={80} className="text-amber-500"/></div>
                 <p className="text-sm font-medium text-amber-500/80 uppercase tracking-wider">Total Amount Raised</p>
                 <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-amber-400">₹{data.totalAmount.toLocaleString("en-IN")}</span>
                 </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 group">
                 <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={80} /></div>
                 <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Contribution</p>
                 <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-400">
                       ₹{data.totalContributors > 0 ? Math.round(data.totalAmount / data.totalContributors).toLocaleString("en-IN") : 0}
                    </span>
                    <span className="text-sm text-gray-500">per person</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 🔹 TOP CONTRIBUTORS LIST */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 lg:col-span-1 h-full">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <Trophy size={18} className="text-yellow-500" /> Top 5 Contributors
                </h3>
                {topContributors.length === 0 ? (
                   <p className="text-sm text-gray-500 text-center py-8">No contributions yet.</p>
                ) : (
                   <div className="space-y-4">
                      {topContributors.map((m, idx) => (
                         <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-orange-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                  {idx + 1}
                               </div>
                               <div>
                                  <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{m.name}</p>
                                  <p className="text-[10px] text-gray-500">{m.teamName || "General"}</p>
                               </div>
                            </div>
                            <span className="text-sm font-bold text-emerald-400">₹{m.maanaduSupport?.amountSpent?.toLocaleString()}</span>
                         </div>
                      ))}
                   </div>
                )}
              </div>

              {/* 🔹 TEAM PERFORMANCE CHART */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 lg:col-span-2">
                 <h3 className="text-lg font-bold text-white mb-4">Team Performance</h3>
                 {teamStats.length === 0 ? (
                    <p className="text-sm text-gray-500">No team data available.</p>
                 ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                       {teamStats.map((t, idx) => {
                          const percentage = maxTeamAmount > 0 ? (t.totalAmount / maxTeamAmount) * 100 : 0;
                          return (
                             <div key={idx} className="relative">
                                <div className="flex justify-between text-xs mb-1">
                                   <span className="font-medium text-gray-300">{t.team}</span>
                                   <span className="text-gray-400">₹{t.totalAmount.toLocaleString()} <span className="text-gray-600 mx-1">|</span> {t.contributors} members</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                   <div 
                                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 ease-out"
                                      style={{ width: `${percentage}%` }}
                                   />
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 )}
              </div>
            </div>

            {/* 🔹 VEHICLE STATS */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Bus size={18} className="text-blue-400" /> Logistics & Transport
               </h3>
               {vehicleStats.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                     {vehicleStats.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-950 border border-gray-800 px-4 py-3 rounded-xl min-w-[160px]">
                           <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                              <Bus size={20} />
                           </div>
                           <div>
                              <p className="text-xs text-gray-500 uppercase">{v.vehicleType}</p>
                              <p className="text-lg font-bold text-gray-200">₹{v.totalAmount.toLocaleString()}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className="text-sm text-gray-500">No vehicle data recorded yet.</p>
               )}
            </div>

            {/* 🔹 FULL LIST GRID */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-white mb-4">All Contributors</h3>
              {members.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl">
                   <Users size={48} className="mx-auto text-gray-700 mb-3" />
                   <p className="text-gray-500">No supporters added yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {members.map((m) => (
                    <div key={m._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-900/10 group">
                      <div className="flex justify-between items-start mb-3">
                         <div>
                            <h4 className="font-bold text-gray-200 group-hover:text-white">{m.name}</h4>
                            <p className="text-xs text-gray-500">{m.teamName || "No Team"}</p>
                         </div>
                         <span className="text-sm font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                            ₹{(m.maanaduSupport?.amountSpent || 0).toLocaleString()}
                         </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-800 pt-3">
                         <div className="flex items-center gap-1.5 text-gray-400">
                            <Bus size={12} />
                            <span>{m.maanaduSupport?.vehicleType || "None"}</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-gray-400 justify-end">
                            <Calendar size={12} />
                            <span>{m.maanaduSupport?.date ? new Date(m.maanaduSupport.date).toLocaleDateString() : "No Date"}</span>
                         </div>
                      </div>
                      
                      {m.maanaduSupport?.notes && (
                         <div className="mt-2 text-[10px] text-gray-500 bg-gray-950 p-2 rounded border border-gray-800/50">
                            {m.maanaduSupport.notes}
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 10px; }
      `}</style>
    </DashboardLayout>
  );
}