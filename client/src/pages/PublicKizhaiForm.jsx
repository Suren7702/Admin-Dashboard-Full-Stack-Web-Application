import { useState } from "react";
import { Loader2, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PublicKizhaiForm() {
  const [form, setForm] = useState({
    name: "",
    area: "",
    village: "",
    taluk: "",
    district: "Trichy",
    memberCount: "",
    presidentName: "",
    contactNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_URL}/api/kizhais/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMsg("✅ Thank you! Your Kizhai Kazhagam data has been recorded.");
      setForm({
        name: "",
        area: "",
        village: "",
        taluk: "",
        district: "Trichy",
        memberCount: "",
        presidentName: "",
        contactNumber: "",
      });

    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-lg bg-gray-900/70 border border-gray-800 p-6 rounded-2xl shadow-xl">

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-purple-800/40 rounded-lg border border-purple-600/50">
            <Users className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Kizhai Kazhagam Registration</h1>
            <p className="text-xs text-gray-400">Fill the details correctly.</p>
          </div>
        </div>

        {msg && (
          <div className="mb-4 p-3 text-sm rounded-lg bg-black/40 border border-gray-700 text-gray-200">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <Field name="name" label="Kizhai Kazhagam Name" value={form.name} onChange={handleChange} required />
          <Field name="area" label="Area / Street" value={form.area} onChange={handleChange} required />
          <Field name="village" label="Village" value={form.village} onChange={handleChange} required />
          <Field name="taluk" label="Taluk" value={form.taluk} onChange={handleChange} required />

          <Field name="district" label="District" value={form.district} onChange={handleChange} />

          <Field name="memberCount" label="Total Members" value={form.memberCount} onChange={handleChange} />
          <Field name="presidentName" label="President Name" value={form.presidentName} onChange={handleChange} />
          <Field name="contactNumber" label="Contact Number" value={form.contactNumber} onChange={handleChange} />

          <button
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-gray-400 text-center">
          Powered by your district team • Data is confidential.
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-sm text-gray-100 outline-none focus:ring-1 focus:ring-purple-500"
      />
    </div>
  );
}
