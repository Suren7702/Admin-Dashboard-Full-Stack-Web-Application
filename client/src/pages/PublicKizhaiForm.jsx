import { useState } from "react";
import { Loader2, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PublicKizhaiForm() {
  const [form, setForm] = useState({
    name: "",
    ward: "",
    area: "",
    secretaryName: "",
    phone: "",
    memberCount: "",
    targetCount: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_URL}/api/kizhais/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          memberCount: Number(form.memberCount) || 0,
          targetCount: Number(form.targetCount) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");

      setMsg("✅ நன்றி! உங்கள் கிளை கழக விவரங்கள் பதிவு செய்யப்பட்டுவிட்டது.");
      setForm({
        name: "",
        ward: "",
        area: "",
        secretaryName: "",
        phone: "",
        memberCount: "",
        targetCount: "",
      });
    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-2xl bg-gray-900/70 border border-gray-800 p-6 rounded-2xl shadow-xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-purple-800/40 rounded-lg border border-purple-600/50">
            <Users className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">கிளைக் கழகம் பதிவு</h1>
            <p className="text-xs text-gray-400">
              தயவு செய்து கீழே உள்ள விவரங்களை சரியாக நிரப்பவும்.
            </p>
          </div>
        </div>

        {msg && (
          <div className="mb-4 p-3 text-sm rounded-lg bg-black/40 border border-gray-700 text-gray-200">
            {msg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Row 1 */}
          <Field
            label="கிளை பெயர் (NAME)"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: Srirangam"
            required
          />

          <Field
            label="வார்டு எண்"
            name="ward"
            value={form.ward}
            onChange={handleChange}
            placeholder="Ex: 45"
            required
          />

          {/* Row 2 */}
          <Field
            label="பகுதி / தெரு (AREA)"
            name="area"
            value={form.area}
            onChange={handleChange}
            placeholder="Ex: Gandhi Nagar"
            required
          />

          <Field
            label="செயலாளர் பெயர்"
            name="secretaryName"
            value={form.secretaryName}
            onChange={handleChange}
            placeholder="Ex: Vijay"
            required
          />

          {/* Row 3 */}
          <Field
            label="அலைபேசி எண்"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="9876543210"
            required
          />

          <Field
            label="உறுப்பினர்கள்"
            name="memberCount"
            value={form.memberCount}
            onChange={handleChange}
            placeholder="0"
          />

          {/* Row 4 – இலக்கு full width or 2nd col */}
          <Field
            label="இலக்கு"
            name="targetCount"
            value={form.targetCount}
            onChange={handleChange}
            placeholder="100"
          />

          {/* submit button full width */}
          <div className="md:col-span-2 mt-2">
            <button
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "சமர்ப்பிக்கவும் (Submit)"}
            </button>
          </div>
        </form>

        <p className="mt-3 text-[11px] text-gray-400 text-center">
          Powered by your district team • Data is confidential.
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-sm text-gray-100 outline-none focus:ring-1 focus:ring-purple-500"
      />
    </div>
  );
}
