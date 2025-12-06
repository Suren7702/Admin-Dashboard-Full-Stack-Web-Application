// client/src/pages/DashboardHome.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  Users, 
  Layers, 
  Trophy, 
  IndianRupee, 
  TrendingUp, 
  Activity 
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Modern Palette (Vibrant but Professional)
const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [maanadu, setMaanadu] = useState(null);
  const [maanaduLoading, setMaanaduLoading] = useState(true);
  const [maanaduError, setMaanaduError] = useState("");

  const getToken = () => localStorage.getItem("token");

  // 🔹 Fetch Data Logic
  useEffect(() => {
    const fetchData = async () => {
      setStatsLoading(true);
      setMaanaduLoading(true);
      try {
        const headers = { Authorization: getToken() ? `Bearer ${getToken()}` : "" };
        
        // Parallel Fetching
        const [statsRes, maanaduRes] = await Promise.all([
          fetch(`${API_URL}/api/members/stats`, { headers }),
          fetch(`${API_URL}/api/members/maanadu`, { headers })
        ]);

        const statsData = await statsRes.json();
        const maanaduData = await maanaduRes.json();

        if (!statsRes.ok) throw new Error(statsData.message || "Failed to load stats");
        if (!maanaduRes.ok) throw new Error(maanaduData.message || "Failed to load maanadu");

        setStats(statsData);
        setMaanadu(maanaduData);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setStatsError(err.message);
      } finally {
        setStatsLoading(false);
        setMaanaduLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Process Chart Data
  const teamPieData = stats?.teamStats?.map((t) => ({
    name: t.teamName || "Unknown",
    value: t.members,
  })) || [];

  const maanaduTeamPieData = (maanadu?.members || []).reduce((arr, m) => {
    const team = (m.teamName || m.team || "Other").trim() || "Other";
    const amt = m.maanaduSupport?.amountSpent || 0;
    const existing = arr.find((x) => x.name === team);
    if (existing) existing.value += amt;
    else arr.push({ name: team, value: amt });
    return arr;
  }, []) || [];

  // 🔹 Loading Skeleton Component
  if (statsLoading || maanaduLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-1/3 bg-gray-800 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-800/50 rounded-2xl border border-gray-700"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-800/50 rounded-2xl border border-gray-700"></div>
            <div className="h-80 bg-gray-800/50 rounded-2xl border border-gray-700"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen text-gray-100">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              TVK Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time analytics and team performance metrics.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-medium">
            <Activity size={14} />
            System Operational
          </div>
        </div>

        {/* Error Display */}
        {statsError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            {statsError}
          </div>
        )}

        {/* 🔹 KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Total Members */}
          <KPICard 
            title="Total Members"
            value={stats?.totalMembers || 0}
            icon={<Users className="text-blue-400" size={24} />}
            trend="+12% this month"
            color="blue"
          />

          {/* Card 2: Total Teams */}
          <KPICard 
            title="Active Teams"
            value={stats?.totalTeams || 0}
            icon={<Layers className="text-emerald-400" size={24} />}
            trend="Stable growth"
            color="emerald"
          />

          {/* Card 3: Top Team */}
          <div className="relative overflow-hidden bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl transition-all hover:border-gray-700 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={80} className="text-yellow-500" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <Trophy className="text-yellow-500" size={24} />
              </div>
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Top Performer</span>
            </div>
            {stats?.topTeam ? (
              <div>
                <h3 className="text-2xl font-bold text-white mb-1 truncate">{stats.topTeam.teamName}</h3>
                <div className="flex gap-3 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1"><Users size={12}/> {stats.topTeam.members}</span>
                  <span className="w-px h-4 bg-gray-700"></span>
                  <span>{stats.topTeam.bloodGroups} Blood Groups</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>

        {/* 🔹 Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Team Distribution */}
          <ChartCard title="Member Distribution" subtitle="By Team">
             <div className="flex flex-col md:flex-row items-center h-full">
                {/* Donut Chart */}
                <div className="w-full h-64 md:w-1/2">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                            data={teamPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            cornerRadius={4}
                         >
                            {teamPieData.map((_, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                            ))}
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                   </ResponsiveContainer>
                </div>

                {/* Legend List */}
                <div className="w-full md:w-1/2 md:pl-4 space-y-3 h-64 overflow-y-auto custom-scrollbar">
                   {stats?.teamStats?.map((team, idx) => (
                      <div key={team.teamName} className="flex items-center justify-between text-sm group">
                         <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                            <span className="text-gray-300 font-medium group-hover:text-white transition-colors truncate max-w-[120px]">{team.teamName}</span>
                         </div>
                         <span className="text-gray-500 font-mono text-xs">{team.members}</span>
                      </div>
                   ))}
                </div>
             </div>
          </ChartCard>

          {/* Chart 2: Maanadu Finances */}
          <ChartCard 
            title="Maanadu Contribution" 
            subtitle={maanadu ? `Total: ₹${maanadu.totalAmount.toLocaleString('en-IN')}` : "Financials"}
            action={<div className="bg-gray-800 p-1.5 rounded-lg"><IndianRupee size={16} className="text-gray-400"/></div>}
          >
             {!maanadu || maanaduTeamPieData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                   <IndianRupee size={48} className="mb-2 opacity-20"/>
                   <p>No financial data yet</p>
                </div>
             ) : (
                <div className="flex flex-col md:flex-row items-center h-full">
                    {/* Donut Chart */}
                   <div className="w-full h-64 md:w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                               data={maanaduTeamPieData}
                               dataKey="value"
                               nameKey="name"
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               cornerRadius={4}
                            >
                               {maanaduTeamPieData.map((_, index) => (
                                  <Cell key={`m-cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                               ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip isCurrency />} />
                         </PieChart>
                      </ResponsiveContainer>
                   </div>

                   {/* Legend List */}
                   <div className="w-full md:w-1/2 md:pl-4 space-y-3 h-64 overflow-y-auto custom-scrollbar">
                       {maanaduTeamPieData
                         .sort((a, b) => b.value - a.value)
                         .map((t, idx) => (
                          <div key={t.name} className="flex items-center justify-between text-sm group">
                             <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                <span className="text-gray-300 font-medium group-hover:text-white transition-colors truncate max-w-[120px]">{t.name}</span>
                             </div>
                             <span className="text-gray-500 font-mono text-xs">₹{t.value.toLocaleString("en-IN")}</span>
                          </div>
                       ))}
                   </div>
                </div>
             )}
          </ChartCard>

        </div>
      </div>
    </DashboardLayout>
  );
}

// ----------------------------------------------------------------------
// 🔹 Sub-Components for Clean Code
// ----------------------------------------------------------------------

function KPICard({ title, value, icon, trend, color }) {
  // Dynamic border/bg colors based on prop
  const colorMap = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };
  const theme = colorMap[color] || "text-gray-400 bg-gray-500/10 border-gray-500/20";

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl transition-all hover:border-gray-700 hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl border ${theme}`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
          <TrendingUp size={12} />
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, isCurrency }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gray-950 border border-gray-700 p-3 rounded-xl shadow-2xl">
        <p className="text-xs text-gray-400 mb-1">{data.name}</p>
        <p className="text-base font-bold text-white">
          {isCurrency ? "₹" : ""}
          {data.value.toLocaleString("en-IN")}
          {!isCurrency && " Members"}
        </p>
      </div>
    );
  }
  return null;
}