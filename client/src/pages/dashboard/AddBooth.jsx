import { useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import { MapPin, Save, Loader2 } from "lucide-react";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/booths`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
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
        throw new Error(data.message || "Failed to add booth");
      }

      setMsg("✅ Booth successfully added!");
      // Clear form
      setForm({
        name: "",
        code: "",
        district: form.district, // keep same district
        taluk: "",
        village: "",
        latitude: "",
        longitude: "",
        votersCount: "",
        inchargeName: "",
        phone: "",
      });
    } catch (err) {
      console.error("Add booth error:", err);
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-900/40 border border-red-700/50">
            <MapPin className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Add New Booth / Polling Area
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

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
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
              placeholder="Eg. Siruganur"
            />
          </div>

          {/* Right side fields */}
          <div className="space-y-3">
            <Field
              label="Latitude"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="Eg. 10.9100"
              required
            />
            <Field
              label="Longitude"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="Eg. 78.6949"
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
              placeholder="Eg. Kumar"
            />
            <Field
              label="Contact Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Eg. 98765 43210"
            />
          </div>

          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-xs font-semibold text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Booth
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-3 text-[11px] text-gray-500">
          Tip: Google Maps la location open panni, latitude/longitude copy
          panni paste pannina map-la exact spot la marker varum.
        </p>
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
