import { useState } from "react";
import { Loader2, Users, ShieldCheck, Flag } from "lucide-react";
import leaderImg from "../assets/images/thalaivar.jfif";

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
    <div className="min-h-screen bg-[#080303] flex justify-center items-start py-10 px-4 font-sans text-gray-100">
      <div className="w-full max-w-2xl bg-[#120a0a] border border-[#3d0000] p-0 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* --- LEADER IMAGE OVERLAY --- */}
        <div className="absolute top-1 right-6 z-20 hidden sm:block">
          <div className="w-24 h-24 rounded-full border-4 border-[#FFD700] shadow-xl overflow-hidden bg-black">
             <img 
              src={leaderImg} 
              alt="Party Leader" 
              className="w-full h-full object-cover"
              />
          </div>
        </div>

        {/* TVK Theme Header */}
        <div className="bg-[#800000] p-6 border-b-4 border-[#FFD700] relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Flag className="w-20 h-20 text-white" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <Users className="w-8 h-8 text-[#FFD700]" />
                </div>
                <div className="max-w-[70%]"> {/* Added max-width to avoid overlapping text on mobile */}
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase">தமிழக வெற்றி கழகம்</h1>
                    <p className="text-sm font-bold text-[#FFD700] tracking-widest">கிளைக் கழகம் பதிவு • REGISTRATION</p>
                </div>
            </div>
        </div>

        <div className="p-8">
            {msg && (
                <div className={`mb-6 p-4 text-sm rounded-xl border flex items-center gap-3 ${
                    msg.includes('✅') ? 'bg-green-500/10 border-green-500/50 text-green-200' : 'bg-red-500/10 border-red-500/50 text-red-200'
                }`}>
                    <ShieldCheck className="w-5 h-5" />
                    {msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field
                    label="கிளை பெயர் (NAME)"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="உதாரணம்: ஸ்ரீரங்கம் கிளை"
                    required
                />

                <Field
                    label="வார்டு எண் (WARD NO)"
                    name="ward"
                    value={form.ward}
                    onChange={handleChange}
                    placeholder="Ex: 45"
                    required
                />

                <Field
                    label="பகுதி / தெரு (AREA)"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="Ex: காந்தி நகர்"
                    required
                />

                <Field
                    label="செயலாளர் பெயர் (SECRETARY NAME)"
                    name="secretaryName"
                    value={form.secretaryName}
                    onChange={handleChange}
                    placeholder="செயலாளர் பெயரை உள்ளிடவும்"
                    required
                />

                <Field
                    label="அலைபேசி எண் (PHONE)"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    type="tel"
                    required
                />

                <Field
                    label="உறுப்பினர்கள் எண்ணிக்கை (MEMBERS)"
                    name="memberCount"
                    value={form.memberCount}
                    onChange={handleChange}
                    placeholder="0"
                    type="number"
                />

                <Field
                    label="இலக்கு (TARGET)"
                    name="targetCount"
                    value={form.targetCount}
                    onChange={handleChange}
                    placeholder="100"
                    type="number"
                />

                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-800">
                    <button
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-[#FFD700] hover:bg-[#ffed4d] active:scale-[0.98] transition-all text-[#800000] font-black text-base uppercase flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(255,215,0,0.2)] disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <ShieldCheck className="w-5 h-5" />
                                விவரங்களை சேமிக்கவும் (SUBMIT DATA)
                            </>
                        )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <div className="h-px w-10 bg-gray-800"></div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            TVK Digital Registry
                        </p>
                        <div className="h-px w-10 bg-gray-800"></div>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}

// Field component remains the same
function Field({ label, name, value, onChange, placeholder, required, type = "text" }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        {label}
        {required && <span className="text-[#800000] bg-[#FFD700] px-1 rounded-[2px] text-[8px]">REQUIRED</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="px-4 py-3 bg-black/60 border border-gray-800 rounded-xl text-sm text-gray-100 outline-none focus:ring-2 focus:ring-[#800000] focus:border-[#FFD700] transition-all placeholder:text-gray-700"
      />
    </div>
  );
}