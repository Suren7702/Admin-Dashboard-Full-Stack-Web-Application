// client/src/pages/MaanaduSupporters.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout.jsx";

// ✅ Use env-based API URL (works for local + Vercel)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MaanaduSupporters() {
  const [data, setData] = useState(null); // { totalContributors, totalAmount, members }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchMaanadu = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/api/members/maanadu`, {
          headers: {
            Authorization: getToken() ? `Bearer ${getToken()}` : "",
          },
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Failed to load maanadu members");
        }

        setData(json);
      } catch (err) {
        console.error("❌ Error loading maanadu members:", err);
        setError(err.message || "Failed to load maanadu members");
      } finally {
        setLoading(false);
      }
    };

    fetchMaanadu();
  }, []);

  const members = data?.members || [];

  // ---------- 🧮 Derived Analytics (Feature #5) ----------
  const supportersWithAmount = members.filter((m) => {
    const ms = m.maanaduSupport || {};
    return ms.enabled || (ms.amountSpent || 0) > 0;
  });

  // Top 5 contributors
  const topContributors = [...supportersWithAmount]
    .sort(
      (a, b) =>
        (b.maanaduSupport?.amountSpent || 0) -
        (a.maanaduSupport?.amountSpent || 0)
    )
    .slice(0, 5);

  // Team-wise contribution
  const teamMap = {};
  for (const m of supportersWithAmount) {
    const team = (m.teamName || m.team || "Other").trim() || "Other";
    const amt = m.maanaduSupport?.amountSpent || 0;
    if (!teamMap[team]) {
      teamMap[team] = { team, totalAmount: 0, contributors: 0 };
    }
    teamMap[team].totalAmount += amt;
    teamMap[team].contributors += 1;
  }
  const teamStats = Object.values(teamMap).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );
  const maxTeamAmount = teamStats.length
    ? Math.max(...teamStats.map((t) => t.totalAmount))
    : 0;

  // Vehicle-type usage
  const vehicleMap = {};
  for (const m of supportersWithAmount) {
    const v =
      (m.maanaduSupport?.vehicleType || "Not specified").trim() ||
      "Not specified";
    const amt = m.maanaduSupport?.amountSpent || 0;
    if (!vehicleMap[v]) {
      vehicleMap[v] = { vehicleType: v, totalAmount: 0, contributors: 0 };
    }
    vehicleMap[v].totalAmount += amt;
    vehicleMap[v].contributors += 1;
  }
  const vehicleStats = Object.values(vehicleMap).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

  // Month-wise trend (MMM YYYY)
  const monthMap = {};
  for (const m of supportersWithAmount) {
    const d = m.maanaduSupport?.date ? new Date(m.maanaduSupport.date) : null;
    if (!d || isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const label = d.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
    const amt = m.maanaduSupport?.amountSpent || 0;
    if (!monthMap[key]) {
      monthMap[key] = { key, label, totalAmount: 0 };
    }
    monthMap[key].totalAmount += amt;
  }
  const monthStats = Object.values(monthMap).sort((a, b) =>
    a.key.localeCompare(b.key)
  );

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Maanadu Supporters</h1>
        <p className="text-sm text-gray-400">
          Party members who arranged vans / spent money for Maanadu.
        </p>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-400 bg-red-900/30 border border-red-700 rounded px-3 py-2">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-gray-400">Loading maanadu supporters...</p>
      )}

      {!loading && data && (
        <div className="space-y-4">
          {/* ---------- TOP STATS ---------- */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400">Total Contributors</p>
              <p className="text-2xl font-semibold text-blue-400">
                {data.totalContributors}
              </p>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400">Total Amount Spent</p>
              <p className="text-2xl font-semibold text-emerald-400">
                ₹{data.totalAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3">
              <p className="text-xs text-gray-400">Average per Member</p>
              <p className="text-2xl font-semibold text-orange-300">
                {data.totalContributors > 0
                  ? `₹${Math.round(
                      data.totalAmount / data.totalContributors
                    ).toLocaleString("en-IN")}`
                  : "₹0"}
              </p>
            </div>
          </div>

          {/* ---------- FEATURE #5: ADVANCED ANALYTICS ---------- */}
          <div className="grid gap-3 md:grid-cols-3">
            {/* Top Contributors */}
            <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 md:col-span-1">
              <p className="text-xs text-gray-400 mb-2">
                Top 5 Contributors (₹)
              </p>
              {topContributors.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No contribution data available yet.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {topContributors.map((m, idx) => (
                    <li
                      key={m._id || idx}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-100">
                          {idx + 1}. {m.name || "-"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {m.teamName || m.team || ""} ·{" "}
                          {m.maanaduSupport?.vehicleType || "Vehicle NA"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-300">
                        ₹
                        {(m.maanaduSupport?.amountSpent || 0).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Team-wise Contribution */}
            <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 md:col-span-1">
              <p className="text-xs text-gray-400 mb-2">
                Team-wise Contribution
              </p>
              {teamStats.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No team contribution data yet.
                </p>
              ) : (
                <div className="space-y-2 text-xs">
                  {teamStats.map((t, idx) => {
                    const pct =
                      maxTeamAmount > 0
                        ? Math.round((t.totalAmount / maxTeamAmount) * 100)
                        : 0;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between mb-0.5">
                          <p className="font-medium text-gray-100">
                            {t.team}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            ₹{t.totalAmount.toLocaleString("en-IN")} ·{" "}
                            {t.contributors}{" "}
                            {t.contributors === 1 ? "member" : "members"}
                          </p>
                        </div>
                        <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${pct || 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vehicle Type & Month Trend */}
            <div className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 md:col-span-1">
              <p className="text-xs text-gray-400 mb-2">
                Vehicle Type & Monthly Trend
              </p>

              {/* Vehicle types */}
              {vehicleStats.length > 0 && (
                <div className="mb-3 text-xs">
                  <p className="text-[11px] text-gray-500 mb-1">
                    Vehicle Type Usage
                  </p>
                  <ul className="space-y-1">
                    {vehicleStats.map((v, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between text-[11px] text-gray-300"
                      >
                        <span>
                          {idx + 1}. {v.vehicleType}
                        </span>
                        <span>
                          ₹{v.totalAmount.toLocaleString("en-IN")} ·{" "}
                          {v.contributors}{" "}
                          {v.contributors === 1 ? "member" : "members"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Month-wise trend */}
              {monthStats.length > 0 && (
                <div className="text-xs">
                  <p className="text-[11px] text-gray-500 mb-1">
                    Month-wise Total Contribution
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {monthStats.map((m) => (
                      <span
                        key={m.key}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-900 px-2 py-0.5 text-[11px] text-gray-200"
                      >
                        <span>{m.label}</span>
                        <span className="text-emerald-300">
                          ₹{m.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {vehicleStats.length === 0 && monthStats.length === 0 && (
                <p className="text-xs text-gray-500">
                  No detailed analytics yet. Add more supporters with proper
                  vehicle and date info.
                </p>
              )}
            </div>
          </div>

          {/* ---------- SUPPORTERS LIST ---------- */}
          {members.length === 0 ? (
            <div className="border border-gray-800 rounded-xl bg-gray-950 px-4 py-6 text-center text-gray-500">
              No supporters added yet for Maanadu.
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {members.map((m, idx) => (
                <div
                  key={m._id || idx}
                  className="bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 shadow-sm hover:border-blue-500/60 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-semibold text-sm md:text-base">
                        {m.name || "-"}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {m.teamName || m.team || ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Amount Spent</p>
                      <p className="text-base font-semibold text-emerald-400">
                        ₹
                        {(
                          m.maanaduSupport?.amountSpent || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs md:text-sm mb-2">
                    <div>
                      <p className="text-[11px] text-gray-500">Vehicle</p>
                      <p className="text-gray-200">
                        {m.maanaduSupport?.vehicleType || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500">Event</p>
                      <p className="text-gray-200">
                        {m.maanaduSupport?.eventName || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 mb-2">
                    {m.maanaduSupport?.date && (
                      <span>
                        Date:{" "}
                        {new Date(
                          m.maanaduSupport.date
                        ).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>

                  {m.maanaduSupport?.notes && (
                    <p className="text-[11px] text-gray-300 border-t border-gray-800 pt-2 mt-1">
                      {m.maanaduSupport.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
