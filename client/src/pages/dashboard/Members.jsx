// client/src/pages/Members.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout.jsx";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");

  // form + CRUD
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editingId, setEditingId] = useState(null); // null = create mode

  // 🆕 use existing team or create new team
  const [useNewTeam, setUseNewTeam] = useState(false);

  const [form, setForm] = useState({
    teamName: "",
    name: "",
    role: "",
    phone: "",
    community: "",
    bloodGroup: "",

    // 🆕 Maanadu fields
    maanaduEnabled: false,
    maanaduEventName: "",
    maanaduVehicleType: "",
    maanaduAmount: "",
    maanaduDate: "",
    maanaduNotes: "",
  });

  const getToken = () => localStorage.getItem("token");

  // ----------------- LOAD MEMBERS -----------------
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/members", {
        headers: {
          Authorization: getToken() ? `Bearer ${getToken()}` : "",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load members");
      }

      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data.members)) list = data.members;

      setMembers(list);
    } catch (err) {
      console.error("❌ Error loading members:", err);
      setError(err.message || "Something went wrong");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // ----------------- LOAD TEAMS FOR DROPDOWN -----------------
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/members/teams", {
          headers: {
            Authorization: getToken() ? `Bearer ${getToken()}` : "",
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) setTeams(data);
      } catch (err) {
        console.error("❌ Error loading team list:", err);
      }
    };

    fetchTeams();
  }, []);

  const safeMembers = Array.isArray(members) ? members : [];

  // ----------------- FILTER MEMBERS (TEAM + SEARCH) -----------------
  const filteredMembers = safeMembers.filter((m) => {
    const q = search.trim().toLowerCase();
    const memberTeam = (m.teamName || m.team || "").toLowerCase();

    if (teamFilter !== "all" && memberTeam !== teamFilter.toLowerCase()) {
      return false;
    }

    if (!q) return true;

    const name = (m.name || "").toLowerCase();
    const phone = (m.phone || "").toLowerCase();
    const role = (m.role || "").toLowerCase();
    const team = memberTeam;

    return (
      name.includes(q) ||
      phone.includes(q) ||
      role.includes(q) ||
      team.includes(q)
    );
  });

  // helper: convert date from DB to yyyy-mm-dd
  const toInputDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  // ----------------- FORM HANDLERS -----------------
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormError("");
    setFormSuccess("");
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.teamName || !form.name || !form.phone) {
      setFormError("Team, Name, Phone mandatory da.");
      return;
    }

    try {
      setSaving(true);

      const isEdit = Boolean(editingId);

      const url = isEdit
        ? `http://localhost:5000/api/members/${editingId}`
        : "http://localhost:5000/api/members";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken() ? `Bearer ${getToken()}` : "",
        },
        body: JSON.stringify({
          teamName: form.teamName,
          name: form.name,
          role: form.role,
          phone: form.phone,
          community: form.community,
          bloodGroup: form.bloodGroup,

          // 🆕 send maanadu fields
          maanaduEnabled: form.maanaduEnabled,
          maanaduEventName: form.maanaduEventName,
          maanaduVehicleType: form.maanaduVehicleType,
          maanaduAmount: form.maanaduAmount
            ? Number(form.maanaduAmount)
            : 0,
          maanaduDate: form.maanaduDate || null,
          maanaduNotes: form.maanaduNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save member");
      }

      if (isEdit) {
        setFormSuccess("Member updated successfully ✅");
        setMembers((prev) =>
          prev.map((m) => (m._id === data._id ? data : m))
        );
      } else {
        setFormSuccess("Member added successfully ✅");
        setMembers((prev) => [data, ...prev]);
      }

      setForm({
        teamName: "",
        name: "",
        role: "",
        phone: "",
        community: "",
        bloodGroup: "",
        maanaduEnabled: false,
        maanaduEventName: "",
        maanaduVehicleType: "",
        maanaduAmount: "",
        maanaduDate: "",
        maanaduNotes: "",
      });
      setEditingId(null);
      setUseNewTeam(false); // reset mode
    } catch (err) {
      console.error("❌ Error saving member:", err);
      setFormError(err.message || "Failed to save member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      {/* TOP HEADER + FILTERS */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pro Team Members</h1>
          <p className="text-sm text-gray-400">
            Showing{" "}
            <span className="font-semibold">{filteredMembers.length}</span> of{" "}
            <span className="font-semibold">{safeMembers.length}</span> members.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Teams</option>
            {teams.map((t, i) => (
              <option key={i} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name / phone / role / team..."
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[230px]"
          />
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-400 bg-red-900/30 border border-red-700 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* ADD / EDIT MEMBER FORM */}
      <div className="mb-5 border border-gray-800 rounded-2xl bg-gray-950 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-100">
            {editingId ? "Edit Member" : "Add New Member (Manual)"}
          </h2>
          {saving && (
            <span className="text-xs text-blue-400">
              {editingId ? "Updating..." : "Saving..."}
            </span>
          )}
        </div>

        {formError && (
          <div className="mb-2 text-xs text-red-300 bg-red-900/30 border border-red-700 rounded px-3 py-1.5">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="mb-2 text-xs text-emerald-300 bg-emerald-900/30 border border-emerald-700 rounded px-3 py-1.5">
            {formSuccess}
          </div>
        )}

        <form
          onSubmit={handleSaveMember}
          className="grid gap-3 md:grid-cols-3 text-xs md:text-sm"
        >
          {/* TEAM (existing vs new) */}
          <div className="flex flex-col gap-1 md:col-span-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-gray-400">
                Team <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setUseNewTeam((v) => !v);
                  setForm((prev) => ({
                    ...prev,
                    teamName: "",
                  }));
                }}
                className="text-[10px] text-blue-400 hover:underline"
              >
                {useNewTeam ? "Use existing team" : "Add new team"}
              </button>
            </div>

            {useNewTeam ? (
              <input
                name="teamName"
                value={form.teamName}
                onChange={handleFormChange}
                placeholder="Enter new team name"
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <select
                name="teamName"
                value={form.teamName}
                onChange={handleFormChange}
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select team</option>
                {teams.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* NAME */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Member name"
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ROLE */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Role</label>
            <input
              name="role"
              value={form.role}
              onChange={handleFormChange}
              placeholder="Role (optional)"
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PHONE */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">
              Phone <span className="text-red-400">*</span>
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              placeholder="Mobile number"
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* COMMUNITY */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Community</label>
            <input
              name="community"
              value={form.community}
              onChange={handleFormChange}
              placeholder="Community"
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* BLOOD GROUP */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Blood Group</label>
            <input
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleFormChange}
              placeholder="e.g. O+, B+, A-"
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 🆕 MAANADU SUPPORT TOGGLE */}
          <div className="md:col-span-3 mt-2 border-t border-gray-800 pt-2">
            <label className="flex items-center gap-2 text-[11px] text-gray-300">
              <input
                type="checkbox"
                name="maanaduEnabled"
                checked={form.maanaduEnabled}
                onChange={handleFormChange}
                className="h-3 w-3"
              />
              This member supported Maanadu (Van / Money)
            </label>
          </div>

          {/* 🆕 MAANADU FIELDS (conditional) */}
          {form.maanaduEnabled && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">
                  Maanadu Event Name
                </label>
                <input
                  name="maanaduEventName"
                  value={form.maanaduEventName}
                  onChange={handleFormChange}
                  placeholder="e.g. TVK Maanadu 2025"
                  className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">
                  Vehicle Type
                </label>
                <input
                  name="maanaduVehicleType"
                  value={form.maanaduVehicleType}
                  onChange={handleFormChange}
                  placeholder="e.g. Van, Mini Bus"
                  className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">
                  Amount Spent (₹)
                </label>
                <input
                  name="maanaduAmount"
                  value={form.maanaduAmount}
                  onChange={handleFormChange}
                  placeholder="e.g. 5000"
                  type="number"
                  min="0"
                  className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Date</label>
                <input
                  type="date"
                  name="maanaduDate"
                  value={form.maanaduDate}
                  onChange={handleFormChange}
                  className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">
                  Notes (optional)
                </label>
                <textarea
                  name="maanaduNotes"
                  value={form.maanaduNotes}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="Any extra details about their support"
                  className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </>
          )}

          {/* SUBMIT BUTTON */}
          <div className="md:col-span-3 flex justify-end mt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-xs md:text-sm font-medium"
            >
              {saving
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                ? "Update Member"
                : "Add Member"}
            </button>
          </div>
        </form>
      </div>

      {/* MEMBERS LIST – CARD VIEW WITH EDIT / DELETE */}
      {loading && <p className="text-sm text-gray-400">Loading members...</p>}

      {!loading && !error && (
        <>
          {filteredMembers.length === 0 ? (
            <div className="border border-gray-800 rounded-xl bg-gray-950 px-4 py-6 text-center text-gray-500">
              No members found for this search.
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredMembers.map((m, idx) => {
                const maanadu = m.maanaduSupport || {};
                const isSupporter = !!maanadu.enabled;

                return (
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
                      {isSupporter && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/60 text-[10px] text-emerald-300">
                            Maanadu Support
                          </span>
                          <p className="text-[11px] text-emerald-300 mt-1">
                            ₹{(maanadu.amountSpent || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Role</p>
                      <p className="text-sm text-gray-200">
                        {m.role && m.role !== "-" ? m.role : "—"}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                      <div>
                        <p className="text-[11px] text-gray-500">Phone</p>
                        <p className="font-medium text-gray-200">
                          {m.phone || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500">Community</p>
                        <p className="text-gray-200">{m.community || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500">Blood</p>
                        <p className="text-gray-200">
                          {m.bloodGroup || m.blood || "-"}
                        </p>
                      </div>
                    </div>

                    {/* EDIT & DELETE BUTTONS */}
                    <div className="mt-3 flex justify-end gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          const maanadu = m.maanaduSupport || {};
                          setEditingId(m._id); // set edit id
                          setUseNewTeam(false); // default back to existing dropdown
                          setForm({
                            teamName: m.teamName || m.team || "",
                            name: m.name || "",
                            role: m.role || "",
                            phone: m.phone || "",
                            community: m.community || "",
                            bloodGroup: m.bloodGroup || m.blood || "",
                            maanaduEnabled: !!maanadu.enabled,
                            maanaduEventName: maanadu.eventName || "",
                            maanaduVehicleType: maanadu.vehicleType || "",
                            maanaduAmount:
                              maanadu.amountSpent != null
                                ? String(maanadu.amountSpent)
                                : "",
                            maanaduDate: toInputDate(maanadu.date),
                            maanaduNotes: maanadu.notes || "",
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-3 py-1 rounded-lg border border-blue-500 text-blue-300 hover:bg-blue-500/10"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const ok = window.confirm(
                            "Delete this member sure ah?"
                          );
                          if (!ok) return;

                          try {
                            const res = await fetch(
                              `http://localhost:5000/api/members/${m._id}`,
                              {
                                method: "DELETE",
                                headers: {
                                  Authorization: getToken()
                                    ? `Bearer ${getToken()}`
                                    : "",
                                },
                              }
                            );

                            const data = await res.json();
                            if (!res.ok) {
                              throw new Error(
                                data.message || "Failed to delete"
                              );
                            }

                            setMembers((prev) =>
                              prev.filter((x) => x._id !== m._id)
                            );
                          } catch (err) {
                            alert(err.message || "Delete failed");
                          }
                        }}
                        className="px-3 py-1 rounded-lg border border-red-500 text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
