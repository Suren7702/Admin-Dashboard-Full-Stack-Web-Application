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

const TEAM_COLORS = [
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#f97316", // orange-400
  "#facc15", // yellow-400
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#22c55e", // green-500
  "#38bdf8", // sky-400
];

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [maanadu, setMaanadu] = useState(null);
  const [maanaduLoading, setMaanaduLoading] = useState(true);
  const [maanaduError, setMaanaduError] = useState("");

  const getToken = () => localStorage.getItem("token");

  // 🔹 Load main members stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const res = await fetch("http://localhost:5000/api/members/stats", {
          headers: {
            Authorization: getToken() ? `Bearer ${getToken()}` : "",
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load stats");
        }

        setStats(data);
      } catch (err) {
        console.error("❌ Error loading stats:", err);
        setStatsError(err.message || "Failed to load stats");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 🔹 Load Maanadu supporters stats
  useEffect(() => {
    const fetchMaanadu = async () => {
      try {
        setMaanaduLoading(true);
        setMaanaduError("");

        const res = await fetch("http://localhost:5000/api/members/maanadu", {
          headers: {
            Authorization: getToken() ? `Bearer ${getToken()}` : "",
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load maanadu stats");
        }

        setMaanadu(data);
      } catch (err) {
        console.error("❌ Error loading maanadu stats:", err);
        setMaanaduError(err.message || "Failed to load maanadu stats");
      } finally {
        setMaanaduLoading(false);
      }
    };

    fetchMaanadu();
  }, []);

  const teamPieData =
    stats?.teamStats?.map((t) => ({
      name: t.teamName || "Unknown",
      value: t.members,
    })) || [];

  // 🔹 Maanadu donut data: team-wise total amount
  const maanaduTeamPieData =
    (maanadu?.members || []).reduce((arr, m) => {
      const team = (m.teamName || m.team || "Other").trim() || "Other";
      const amt = m.maanaduSupport?.amountSpent || 0;

      const existing = arr.find((x) => x.name === team);
      if (existing) {
        existing.value += amt;
      } else {
        arr.push({ name: team, value: amt });
      }
      return arr;
    }, []) || [];

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">TVK Members Dashboard</h1>
        <p className="text-sm text-gray-400">
          Overall view of teams and Maanadu supporter distribution.
        </p>
      </div>

      {/* Errors */}
      {(statsError || maanaduError) && (
        <div className="mb-3 text-sm text-red-400 bg-red-900/30 border border-red-700 rounded px-3 py-2 space-y-1">
          {statsError && <p>{statsError}</p>}
          {maanaduError && <p>{maanaduError}</p>}
        </div>
      )}

      {(statsLoading || maanaduLoading) && !stats && (
        <p className="text-sm text-gray-400">Loading dashboard data...</p>
      )}

      {!statsLoading && stats && (
        <div className="space-y-5">
          {/* 🔹 Top summary cards */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400">Total Members</p>
              <p className="text-2xl font-semibold text-blue-400">
                {stats.totalMembers}
              </p>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400">Total Teams</p>
              <p className="text-2xl font-semibold text-emerald-400">
                {stats.totalTeams}
              </p>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400">Top Team (Most Members)</p>
              {stats.topTeam ? (
                <>
                  <p className="text-base font-semibold text-orange-300">
                    {stats.topTeam.teamName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {stats.topTeam.members} members,{" "}
                    {stats.topTeam.bloodGroups} blood groups
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No data yet</p>
              )}
            </div>
          </div>

          {/* 🔹 Team-wise members donut + list */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-100">
                Team-wise Members Distribution
              </h2>
              <p className="text-xs text-gray-500">
                {stats.teamStats.length} teams
              </p>
            </div>

            {stats.teamStats.length === 0 ? (
              <p className="text-sm text-gray-500">
                No team data available. Add members first.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-[2fr,3fr] items-center">
                {/* Donut graph */}
                <div className="w-full h-60 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={teamPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="45%"
                        outerRadius="80%"
                        paddingAngle={2}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={900}
                      >
                        {teamPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={TEAM_COLORS[index % TEAM_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#020617",
                          borderColor: "#1f2937",
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{
                          fontSize: "11px",
                          paddingLeft: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* side info list */}
                <div className="space-y-2 text-xs">
                  {stats.teamStats.map((team, idx) => {
                    const percentage = (
                      (team.members / (stats.totalMembers || 1)) *
                      100
                    ).toFixed(1);

                    return (
                      <div
                        key={team.teamName}
                        className="flex items-center justify-between border border-gray-800 rounded-xl px-3 py-2 bg-gray-900/60"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                TEAM_COLORS[idx % TEAM_COLORS.length],
                            }}
                          />
                          <div>
                            <p className="text-xs font-medium text-gray-100">
                              {team.teamName}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {team.members} members • {percentage}% of total
                            </p>
                          </div>
                        </div>
                        <div className="text-[11px] text-gray-500 text-right">
                          {team.communities} communities
                          <br />
                          {team.bloodGroups} blood groups
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 🔹 Maanadu supporters – team-wise amount donut */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-100">
                Maanadu Supporters – Team-wise Contribution
              </h2>
              {maanadu && (
                <p className="text-xs text-gray-500">
                  {maanadu.totalContributors} contributors · ₹
                  {maanadu.totalAmount.toLocaleString("en-IN")}
                </p>
              )}
            </div>

            {maanaduLoading && (
              <p className="text-sm text-gray-400">
                Loading Maanadu supporter stats...
              </p>
            )}

            {!maanaduLoading && (!maanadu || maanaduTeamPieData.length === 0) && (
              <p className="text-sm text-gray-500">
                No Maanadu supporter data yet.
              </p>
            )}

            {!maanaduLoading && maanadu && maanaduTeamPieData.length > 0 && (
              <div className="grid gap-4 md:grid-cols-[2fr,3fr] items-center">
                {/* Donut */}
                <div className="w-full h-60 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={maanaduTeamPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="45%"
                        outerRadius="80%"
                        paddingAngle={2}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={900}
                      >
                        {maanaduTeamPieData.map((entry, index) => (
                          <Cell
                            key={`maanadu-cell-${index}`}
                            fill={TEAM_COLORS[index % TEAM_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `₹${Number(value).toLocaleString("en-IN")}`,
                          "Total Amount",
                        ]}
                        contentStyle={{
                          backgroundColor: "#020617",
                          borderColor: "#1f2937",
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{
                          fontSize: "11px",
                          paddingLeft: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* side list */}
                <div className="space-y-2 text-xs">
                  {maanaduTeamPieData
                    .slice()
                    .sort((a, b) => b.value - a.value)
                    .map((t, idx) => (
                      <div
                        key={t.name}
                        className="flex items-center justify-between border border-gray-800 rounded-xl px-3 py-2 bg-gray-900/60"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                TEAM_COLORS[idx % TEAM_COLORS.length],
                            }}
                          />
                          <div>
                            <p className="text-xs font-medium text-gray-100">
                              {t.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              ₹{t.value.toLocaleString("en-IN")} total
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
