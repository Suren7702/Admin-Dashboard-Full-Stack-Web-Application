// client/src/pages/DashboardHome.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Users,
  Layers,
  Trophy,
  IndianRupee,
  TrendingUp,
  Activity,
  Search,
  ChevronDown,
  UserCircle2,
  MapPin,
  Target,
} from "lucide-react";

// ✅ IMPORT IMAGES
import thalaivarImg from "../../assets/images/thalaivar.jfif";
import GensecImg from "../../assets/images/gensec.avif";
import DtsecImg from "../../assets/images/dtsc.jpg";
import leninImg from "../../assets/images/lenin.jpg";

// ✅ Map Card
// OLD
// import BoothMapCard from "../components/BoothMapCard";

// NEW ✅ (from src/pages/dashboard → src/components)
import BoothMapCard from "../../components/BoothMapCard";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Modern Palette
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [maanadu, setMaanadu] = useState(null);
  const [kizhais, setKizhais] = useState([]); // ✅ New State for Kizhai

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔸 UI states
  const [mounted, setMounted] = useState(false); // page-load animation
  const [profileOpen, setProfileOpen] = useState(false); // profile dropdown
  const [teamSearch, setTeamSearch] = useState(""); // search bar
  const [teamFilter, setTeamFilter] = useState("all"); // all | high | low

  const getToken = () => localStorage.getItem("token");

  // 🔹 Fetch Data Logic
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = {
          Authorization: getToken() ? `Bearer ${getToken()}` : "",
        };

        // ✅ Updated to fetch Kizhais as well
        const [statsRes, maanaduRes, kizhaiRes] = await Promise.all([
          fetch(`${API_URL}/api/members/stats`, { headers }),
          fetch(`${API_URL}/api/members/maanadu`, { headers }),
          fetch(`${API_URL}/api/kizhais`, { headers }),
        ]);

        const statsData = await statsRes.json();
        const maanaduData = await maanaduRes.json();
        const kizhaiData = await kizhaiRes.json();

        if (!statsRes.ok)
          throw new Error(statsData.message || "Failed to load stats");
        if (!maanaduRes.ok)
          throw new Error(maanaduData.message || "Failed to load maanadu");

        setStats(statsData);
        setMaanadu(maanaduData);
        setKizhais(Array.isArray(kizhaiData) ? kizhaiData : []);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Page-load animation mount
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // 🔹 FILTERED DATA (Search + Filter)
  const rawTeamStats = stats?.teamStats || [];

  const filteredTeamStats = rawTeamStats.filter((t) => {
    const nameMatch = (t.teamName || "")
      .toLowerCase()
      .includes(teamSearch.toLowerCase());
    if (!nameMatch) return false;
    if (teamFilter === "high") return t.members >= 10;
    if (teamFilter === "low") return t.members < 10;
    return true;
  });

  // Pie data uses filtered teams
  const teamPieData =
    filteredTeamStats.map((t) => ({
      name: t.teamName || "Unknown",
      value: t.members,
    })) || [];

  const maanaduTeamPieData =
    (maanadu?.members || []).reduce((arr, m) => {
      const team = (m.teamName || m.team || "Other").trim() || "Other";
      const amt = m.maanaduSupport?.amountSpent || 0;
      const existing = arr.find((x) => x.name === team);
      if (existing) existing.value += amt;
      else arr.push({ name: team, value: amt });
      return arr;
    }, []) || [];

  // ✅ KIZHAI ANALYTICS LOGIC
  const totalKizhaiCount = kizhais.length;
  // Sort by performance and take top 7 for the graph
  const kizhaiGraphData = kizhais
    .map((k) => ({
      name: k.name.replace("Kizhai", "").trim(), // Shorten name for graph
      members: k.memberCount || 0,
      target: k.targetCount || 100,
      percentage: Math.round(
        ((k.memberCount || 0) / (k.targetCount || 100)) * 100
      ),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 7);

  // Overall Target Calculation
  const overallTarget = kizhais.reduce(
    (acc, k) => acc + (k.targetCount || 0),
    0
  );
  const overallAchieved = kizhais.reduce(
    (acc, k) => acc + (k.memberCount || 0),
    0
  );
  const overallPercentage = overallTarget
    ? Math.round((overallAchieved / overallTarget) * 100)
    : 0;

  // 🔹 Loading Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-48 w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl mb-8 overflow-hidden relative">
            <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[pulse_1.6s_ease-in-out_infinite]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-900/60 rounded-2xl border border-gray-800"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-900/60 rounded-2xl border border-gray-800" />
            <div className="h-80 bg-gray-900/60 rounded-2xl border border-gray-800" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        className={`min-h-screen text-gray-100 transform transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
        {/* ================= LEADERSHIP BANNER (4 CARDS) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10 items-stretch">
  {/* 1. GENERAL SECRETARY */}
  <div
    className="
      order-2 md:order-1 md:col-span-3 
      bg-gradient-to-br from-gray-950 to-black 
      border border-gray-800 rounded-2xl 
      p-4 flex flex-col items-center justify-center text-center 
      shadow-[0_12px_35px_rgba(0,0,0,0.6)] 
      relative overflow-hidden group transition-all duration-300 
      hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.9)] 
      hover:border-amber-400/60

      /* ⭐ New lines for mobile equal height */
      min-h-[120px] 
      md:min-h-0
    "
  >
    <div className="absolute -top-6 -right-10 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-full blur-2xl" />
    <div className="w-20 h-20 rounded-full border-2 border-gray-600 overflow-hidden shadow-md mb-3">
      <img
        src={GensecImg}
        alt="Gen Sec"
        className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 scale-[1.2]"
      />
    </div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-tamil">
        பொதுச் செயலாளர்
      </p>
      <h3 className="text-sm font-bold text-white font-tamil leading-tight">
        திரு. புஸ்ஸி N. ஆனந்த்
      </h3>
      <p className="text-[10px] text-gray-500 mt-1">Ex. MLA</p>
    </div>
  </div>

  {/* 2. THALAIVAR */}
  <div className="order-1 md:order-2 md:col-span-6 bg-gradient-to-b from-[#3b0202] via-[#4a0404] to-[#1a0000] border-2 border-amber-400/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_0_55px_rgba(245,158,11,0.45)] relative overflow-hidden z-10 min-h-[220px]">
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.35),_transparent_65%)]" />
    <div className="relative z-10">
      <div className="w-32 h-32 mx-auto rounded-full border-[3px] border-amber-300 shadow-[0_0_25px_rgba(250,204,21,0.8)] overflow-hidden mb-4 bg-[#2b0000] relative">
        <img src={thalaivarImg} alt="Thalaivar" className="w-full h-full object-cover object-top" />
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-white font-tamil drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
        தளபதி திரு. விஜய்
      </h2>
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-4 py-0.5 rounded-full mt-2 uppercase tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.8)]">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> தலைவர் / President
      </div>
    </div>
  </div>

  {/* 3. RIGHT COLUMN */}
  <div className="order-3 md:order-3 md:col-span-3 flex flex-col gap-4">

    {/* District Secretary */}
    <div className="flex-1 bg-gradient-to-bl from-gray-950 to-black border border-amber-500/40 rounded-2xl p-3 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.7)] relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-amber-300">
      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg shadow-sm z-10">
        District Leader
      </div>
      <div className="w-14 h-14 rounded-full border-2 border-gray-600 overflow-hidden shadow-md shrink-0">
        <img src={DtsecImg} alt="Dist Sec" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
      </div>
      <div className="min-w-0 text-left">
        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-tamil">
          மாவட்ட செயலாளர்
        </p>
        <h3 className="text-sm font-bold text-white font-tamil leading-tight truncate">
          திரு. ரவிசங்கர்
        </h3>
        <p className="text-[9px] text-gray-500 mt-0.5">திருச்சி புறநகர் மேற்கு மாவட்டம்</p>
      </div>
    </div>

    {/* District President */}
    <div className="flex-1 bg-gradient-to-bl from-gray-950 to-black border border-gray-800 rounded-2xl p-3 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.7)] relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-gray-600">
      <div className="w-14 h-14 rounded-full border-2 border-gray-600 overflow-hidden shadow-md shrink-0">
        <img src={leninImg} alt="Dist Pres" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
      </div>
      <div className="min-w-0 text-left">
        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-tamil">
          திருச்சி மண்டல ஒருங்கிணைப்பாளர்
        </p>
        <h3 className="text-sm font-bold text-white font-tamil leading-tight truncate">
          திரு. லெனின்
        </h3>
      </div>
    </div>

  </div>
</div>


        {/* ================= HEADER + SEARCH + PROFILE ================= */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-amber-200 to-orange-400 bg-clip-text text-transparent">
              Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time analytics and team performance metrics.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
            {/* Search + Filter bar */}
            <div className="flex-1 md:flex-none flex items-center gap-2 bg-gray-900/80 border border-gray-700 rounded-full px-3 py-1.5 shadow-sm">
              <Search size={14} className="text-gray-500" />
              <input
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search teams..."
                className="bg-transparent outline-none text-xs text-gray-200 placeholder:text-gray-500 w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1 bg-gray-900/70 border border-gray-800 rounded-full px-1 py-1 text-[11px]">
              {[
                { id: "all", label: "All" },
                { id: "high", label: "High Strength" },
                { id: "low", label: "Low Strength" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTeamFilter(f.id)}
                  className={`px-2.5 py-0.5 rounded-full transition-colors ${
                    teamFilter === f.id
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* System status + profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-medium">
                <Activity size={14} /> System Operational
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-gray-900/80 border border-gray-700 rounded-full px-2.5 py-1.5 hover:border-amber-400/70 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-semibold text-black">
                    S
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-medium text-gray-100">
                      Admin
                    </p>
                    <p className="text-[10px] text-gray-500">
                      District Coordinator
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl bg-gray-950 border border-gray-800 shadow-2xl py-2 text-xs text-gray-200 z-20">
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-800/70 flex items-center gap-2">
                      <UserCircle2 size={14} /> View Profile
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-800/70 flex items-center gap-2">
                      <Activity size={14} /> Activity Log
                    </button>
                    <div className="border-t border-gray-800 my-1" />
                    <button className="w-full text-left px-3 py-2 hover:bg-red-600/20 text-red-400 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />{" "}
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />{" "}
            {error}
          </div>
        )}

        {/* 🔹 KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Members"
            value={stats?.totalMembers || 0}
            icon={<Users className="text-blue-400" size={24} />}
            trend="+12% this month"
          />

          {/* ✅ NEW KIZHAI CARD */}
          <KPICard
            title="Branch Units (Kizhai)"
            value={totalKizhaiCount}
            icon={<MapPin className="text-red-400" size={24} />}
            trend={`${overallPercentage}% Target Met`}
          />

          <KPICard
            title="Active Teams"
            value={stats?.totalTeams || 0}
            icon={<Layers className="text-emerald-400" size={24} />}
            trend="Stable growth"
          />

          {/* Top performer card */}
          <div className="relative overflow-hidden bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.9)] hover:border-amber-400/60 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity">
              <Trophy size={80} className="text-amber-400" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40">
                <Trophy className="text-amber-400" size={24} />
              </div>
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                Top Performer
              </span>
            </div>
            {stats?.topTeam ? (
              <div>
                <h3 className="text-2xl font-bold text-white mb-1 truncate">
                  {stats.topTeam.teamName}
                </h3>
                <div className="flex gap-3 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {stats.topTeam.members}
                  </span>
                  <span className="w-px h-4 bg-gray-700" />
                  <span>{stats.topTeam.bloodGroups} Blood Groups</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>

        {/* 🔹 Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Chart 1: Team Distribution */}
          <ChartCard
            title="Member Distribution"
            subtitle="By Team (filtered)"
          >
            <div className="flex flex-col md:flex-row items-center h-full">
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
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="rgba(0,0,0,0.2)"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 md:pl-4 space-y-3 h-64 overflow-y-auto custom-scrollbar">
                {filteredTeamStats.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No teams match your search / filter.
                  </p>
                )}
                {filteredTeamStats.map((team, idx) => (
                  <div
                    key={team.teamName}
                    className="flex items-center justify-between text-sm group"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      ></span>
                      <span className="text-gray-300 font-medium group-hover:text-white transition-colors truncate max-w-[150px]">
                        {team.teamName}
                      </span>
                    </div>
                    <span className="text-gray-500 font-mono text-xs">
                      {team.members}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Chart 2: Maanadu Finances */}
          <ChartCard
            title="Maanadu Contribution"
            subtitle={
              maanadu
                ? `Total: ₹${maanadu.totalAmount.toLocaleString("en-IN")}`
                : "Financials"
            }
            action={
              <div className="bg-gray-800 p-1.5 rounded-lg">
                <IndianRupee size={16} className="text-gray-400" />
              </div>
            }
          >
            {!maanadu || maanaduTeamPieData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <IndianRupee size={48} className="mb-2 opacity-20" />
                <p>No financial data yet</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center h-full">
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
                          <Cell
                            key={`m-cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="rgba(0,0,0,0.2)"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip isCurrency />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 md:pl-4 space-y-3 h-64 overflow-y-auto custom-scrollbar">
                  {maanaduTeamPieData
                    .sort((a, b) => b.value - a.value)
                    .map((t, idx) => (
                      <div
                        key={t.name}
                        className="flex items-center justify-between text-sm group"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          ></span>
                          <span className="text-gray-300 font-medium group-hover:text-white transition-colors truncate max-w-[150px]">
                            {t.name}
                          </span>
                        </div>
                        <span className="text-gray-500 font-mono text-xs">
                          ₹{t.value.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* ✅ NEW SECTION: KIZHAI PERFORMANCE GRAPH + MAP ON DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Left: Kizhai Performance Bar Chart */}
          <ChartCard
            title="Kizhai Performance (Top 7)"
            subtitle={`Overall Target Achieved: ${overallAchieved} / ${overallTarget} (${overallPercentage}%)`}
            action={
              <div className="bg-red-900/20 p-1.5 rounded-lg border border-red-500/30">
                <Target size={16} className="text-red-400" />
              </div>
            }
          >
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kizhaiGraphData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      color: "#fff",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="members"
                    name="Achieved"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="target"
                    name="Target Goal"
                    fill="#374151"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Right: Booth Map direct on Dashboard */}
          <BoothMapCard district="Trichy" taluk="Mannachanallur" />
        </div>
      </div>
    </DashboardLayout>
  );
}

// 🔹 Sub-Components
function KPICard({ title, value, icon, trend }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.9)] hover:border-amber-400/70">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl border border-amber-400/30 bg-amber-500/5">
          {icon}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
          <TrendingUp size={12} /> {trend}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="flex-grow">{children}</div>
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
