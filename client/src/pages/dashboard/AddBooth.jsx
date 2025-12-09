// client/src/pages/dashboard/AddBooth.jsx
import { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import { MapPin, Save, Loader2, Edit2, Trash2, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AddBooth() {
  const [form, setForm] = useState({
    name: "",
    code: "",
    district: "Trichy",
    taluk: "",
    village: "",
    latitude: "",
    longitude: "",
    votersCount: "",
    inchargeName: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // CRUD extra state
  const [booths, setBooths] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const token = () => localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔄 Fetch booth list (based on district / taluk)
  const fetchBooths = async () => {
    try {
      setListLoading(true);
      let url = `${API_URL}/api/booths`;

      const params = [];
      if (form.district) params.push(`district=${encodeURIComponent(form.district)}`);
      if (form.taluk) params.push(`taluk=${encodeURIComponent(form.taluk)}`);
      if (params.length > 0) url += "?" + params.join("&");

      const res = await fetch(url, {
        headers: {
          Authorization: token() ? `Bearer ${token()}` : "",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load booths");
      }
      setBooths(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch booths error:", err);
      setMsg("❌ " + err.message);
    } finally {
      setListLoading(false);
    }
  };

  // Auto load when district / taluk change
  useEffect(() => {
    fetchBooths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.district, form.taluk]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const url = editingId
        ? `${API_URL}/api/booths/${editingId}`
        : `${API_URL}/api/booths`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token() ? `Bearer ${token()}` : "",
        },
        body: JSON.stringify({
          ...form,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          votersCount: form.votersCount ? parseInt(form.votersCount, 10) : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (editingId ? "Failed to update booth" : "Failed to add booth"));
      }

      setMsg(editingId ? "✅ Booth updated successfully!" : "✅ Booth successfully added!");

      // Reset form (keep district for convenience)
      setForm({
        name: "",
        code: "",
        district: form.district,
        taluk: form.taluk,
        village: "",
        latitude: "",
        longitude: "",
        votersCount: "",
        inchargeName: "",
        phone: "",
      });

      setEditingId(null);
      fetchBooths();
    } catch (err) {
      console.error("Add/Update booth error:", err);
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Edit existing booth
  const handleEdit = (booth) => {
    setEditingId(booth._id);
    setForm({
      name: booth.name || "",
      code: booth.code || "",
      district: booth.district || "Trichy",
      taluk: booth.taluk || "",
      village: booth.village || "",
      latitude: booth.latitude?.toString() || "",
      longitude: booth.longitude?.toString() || "",
      votersCount: booth.votersCount?.toString() || "",
      inchargeName: booth.inchargeName || "",
      phone: booth.phone || "",
    });
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ❌ Delete booth
  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this booth?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/api/booths/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token() ? `Bearer ${token()}` : "",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete booth");
      }

      setMsg("✅ Booth deleted successfully");
      setBooths((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete booth error:", err);
      setMsg("❌ " + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm((prev) => ({
      ...prev,
      name: "",
      code: "",
      village: "",
      latitude: "",
      longitude: "",
      votersCount: "",
      inchargeName: "",
      phone: "",
    }));
    setMsg("");
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-900/40 border border-red-700/50">
            <MapPin className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {editingId ? "Edit Booth" : "Add New Booth / Polling Area"}
            </h1>
            <p className="text-xs text-gray-400">
              Mannachanallur / Trichy district kulla irukkura booth details enter pannunga.
            </p>
          </div>
        </div>

        {msg && (
          <div className="mb-4 text-xs px-3 py-2 rounded-lg border bg-gray-900/80 border-gray-700 text-gray-100">
            {msg}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          {/* Left side fields */}
          <div className="space-y-3">
            <Field
              label="Booth Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Eg. Mannachanallur Booth 32"
              required
            />
            <Field
              label="Booth Code / ID"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Eg. MNC-32"
              required
            />
            <Field
              label="District"
              name="district"
              value={form.district}
              onChange={handleChange}
              placeholder="Eg. Trichy"
              required
            />
            <Field
              label="Taluk"
              name="taluk"
              value={form.taluk}
              onChange={handleChange}
              placeholder="Eg. Mannachanallur"
            />
            <Field
              label="Village / Area"
              name="village"
              value={form.village}
              onChange={handleChange}
              placeholder="Eg. Sengulipatti"
            />
          </div>

          {/* Right side fields */}
          <div className="space-y-3">
            <Field
              label="Latitude"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="Eg. 10.93474"
              required
            />
            <Field
              label="Longitude"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="Eg. 78.65761"
              required
            />
            <Field
              label="Total Voters (approx)"
              name="votersCount"
              value={form.votersCount}
              onChange={handleChange}
              placeholder="Eg. 1200"
            />
            <Field
              label="Booth Incharge Name"
              name="inchargeName"
              value={form.inchargeName}
              onChange={handleChange}
              placeholder="Eg. Murugadoss"
            />
            <Field
              label="Contact Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Eg. 98765 43210"
            />
          </div>

          <div className="md:col-span-2 flex justify-between mt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-600 text-xs text-gray-200 hover:bg-gray-800"
              >
                <X className="w-3 h-3" /> Cancel Edit
              </button>
            )}

            <div className="flex-1" />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-xs font-semibold text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />{" "}
                  {editingId ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />{" "}
                  {editingId ? "Update Booth" : "Save Booth"}
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mb-3 text-[11px] text-gray-500">
          Tip: Google Maps la location open panni, latitude/longitude copy panni paste pannina map-la exact spot la marker varum.
        </p>

        {/* Booth List (READ + UPDATE + DELETE) */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">
              Booth List – {form.district}
              {form.taluk ? ` / ${form.taluk}` : ""}
            </h2>
            <button
              type="button"
              onClick={fetchBooths}
              className="text-[11px] px-2 py-1 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-800"
            >
              Refresh
            </button>
          </div>

          {listLoading ? (
            <div className="py-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading booths...
            </div>
          ) : booths.length === 0 ? (
            <p className="py-4 text-xs text-gray-500">
              No booths found for this filter. Add one above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-2 pr-2 text-left">Name / Code</th>
                    <th className="py-2 px-2 text-left">Area</th>
                    <th className="py-2 px-2 text-left">Voters</th>
                    <th className="py-2 px-2 text-left">Incharge</th>
                    <th className="py-2 pl-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {booths.map((b) => (
                    <tr
                      key={b._id}
                      className="border-b border-gray-800 hover:bg-gray-800/40"
                    >
                      <td className="py-2 pr-2">
                        <div className="font-semibold text-gray-100">
                          {b.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {b.code}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-gray-200">
                        <div>{b.village}</div>
                        <div className="text-[10px] text-gray-400">
                          {b.taluk} / {b.district}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-gray-200">
                        {b.votersCount}
                      </td>
                      <td className="py-2 px-2 text-gray-200">
                          {b.inchargeName || "-"}
                      </td>
                      <td className="py-2 pl-2 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(b)}
                            className="p-1.5 rounded-lg bg-gray-800 text-gray-100 hover:bg-gray-700"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b._id)}
                            className="p-1.5 rounded-lg bg-red-900/70 text-red-200 hover:bg-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
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

function Field({ label, name, value, onChange, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-gray-400 uppercase tracking-widest">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
      />
    </div>
  );
}
