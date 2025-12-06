// src/pages/auth/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck 
} from "lucide-react";

// Ensure this path is correct
import leaderImg from "../../assets/images/logo.jfif"; 

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "மின்னஞ்சல் அவசியம் தேவை";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "சரியான மின்னஞ்சல் தேவை";
    if (!form.password) newErrors.password = "கடவுச்சொல் அவசியம் தேவை";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
      }
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message || "உள்நுழைவு தோல்வியுற்றது");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#4a0404] to-[#1a0505]">
      
      <div className="w-full max-w-[400px] px-4">
        
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Header Section */}
          <div className="bg-gray-50 pt-8 pb-6 px-8 text-center border-b border-gray-100">
             
             {/* Logo / Image Container */}
             <div className="mx-auto w-24 h-24 mb-4 relative">
                <div className="w-full h-full rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 flex items-center justify-center">
                  {!imgError ? (
                    <img 
                      src={leaderImg} 
                      alt="TVK Leader" 
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)} 
                    />
                  ) : (
                    <div className="bg-[#8B0000] w-full h-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">TVK</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-[#facc15] text-[#8B0000] p-1.5 rounded-full border-2 border-white shadow-sm">
                  <ShieldCheck size={14} strokeWidth={3} />
                </div>
             </div>

             {/* ✅ Tamil Font Applied Here */}
             <h1 className="text-xl font-bold text-gray-900 font-tamil">
               மாவட்ட நிர்வாகம்
             </h1>
             <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1 font-tamil">
               தமிழக வெற்றிக் கழகம்
             </p>
          </div>

          <div className="p-8 pt-6">
            
            {serverError && (
              <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm font-tamil">
                <AlertCircle size={16} />
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Email ID / <span className="font-tamil">மின்னஞ்சல்</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition-all text-sm"
                    placeholder="admin@tvk.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 font-tamil">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Password / <span className="font-tamil">கடவுச்சொல்</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1 font-tamil">{errors.password}</p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-[#8B0000] hover:bg-[#6b0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B0000] disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {submitting ? (
                   <span className="flex items-center gap-2 font-tamil">
                     உள்நுழைகிறது...
                   </span>
                ) : (
                  <span className="flex items-center gap-2 font-tamil">
                    உள்நுழையவும் <LogIn size={16} />
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
             <Link to="/secret-register" className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#8B0000] transition-colors font-tamil">
                புதிய நிர்வாகி பதிவு <ChevronRight size={14} />
             </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-white/40 text-[10px] font-tamil">
            © 2025 TVK IT Wing - திருச்சி புறநகர் மேற்கு மாவட்டம்
          </p>
        </div>

      </div>
    </div>
  );
}