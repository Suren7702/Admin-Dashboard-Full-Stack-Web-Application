// src/pages/auth/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// Placeholder for Leader Image
const LEADER_IMAGE_URL = "https://via.placeholder.com/150?text=Leader+Photo"; 

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  
  // New State for Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "மின்னஞ்சல் அவசியம் தேவை";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "சரியான மின்னஞ்சல் முகவரியை அளிக்கவும்";
    if (!form.password) newErrors.password = "கடவுச்சொல் அவசியம் தேவை";
    else if (form.password.length < 6)
      newErrors.password = "குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4a0404] via-[#2b0000] to-black overflow-hidden relative">
      
      {/* Background Animated Circles */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob transition-all duration-1000 ${loaded ? 'scale-100' : 'scale-0'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 transition-all duration-1000 ${loaded ? 'scale-100' : 'scale-0'}`}></div>

      {/* Main Card Container - WIDTH INCREASED to max-w-[500px] */}
      <div 
        className={`w-full max-w-[500px] px-6 transition-all duration-1000 ease-out transform ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative z-10">
          
          <div className="h-2 w-full bg-gradient-to-r from-[#8B0000] via-[#facc15] to-[#8B0000]"></div>

          <div className="pt-10 pb-8 px-10"> {/* Increased horizontal padding slightly */}
            
            {/* Header Section */}
            <div className="flex flex-col items-center justify-center text-center mb-8">
              
              <div className="relative group cursor-pointer mb-5">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                <div className="relative w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-lg transform transition duration-500 group-hover:scale-105">
                  <img 
                    src={LEADER_IMAGE_URL} 
                    alt="Leader" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h1 className="text-3xl font-extrabold text-[#8B0000] tracking-tight">
                TVK Admin
              </h1>
              
              <div className="mt-2 inline-block px-4 py-1 rounded-full bg-red-50 border border-red-100">
                <span className="text-[#b91c1c] text-sm font-bold italic block">
                  "பிறப்பொக்கும் எல்லா உயிர்க்கும்"
                </span>
              </div>
            </div>

            {/* Error Message */}
            {serverError && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 animate-pulse">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {serverError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-100 text-gray-900 placeholder-transparent focus:outline-none focus:border-red-500 focus:bg-white transition-all duration-300"
                  placeholder="Email"
                />
                <label 
                  htmlFor="email"
                  className="absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-red-600"
                >
                  மின்னஞ்சல்
                </label>
                {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"} // Dynamic Type
                  name="password"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  className="peer w-full pl-4 pr-12 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-100 text-gray-900 placeholder-transparent focus:outline-none focus:border-red-500 focus:bg-white transition-all duration-300"
                  placeholder="Password"
                />
                <label 
                  htmlFor="password"
                  className="absolute left-4 -top-2.5 bg-white px-1 text-xs font-semibold text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-red-600"
                >
                  கடவுச்சொல்
                </label>
                
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    // Eye Slash Icon (Hide)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    // Eye Icon (Show)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                
                {errors.password && <p className="text-xs text-red-500 mt-1 ml-1">{errors.password}</p>}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-[#8B0000] to-[#b91c1c] text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transform transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                  <span className="relative flex items-center justify-center gap-2">
                    {submitting ? "ஏற்றுகிறது..." : "உள்நுழையவும்"}
                    {!submitting && (
                       <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    )}
                  </span>
                </button>
              </div>

            </form>

            <div className="mt-8 text-center">
              <Link
                to="/secret-register"
                className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-red-600 transition-colors duration-300"
              >
                நிர்வாகி பதிவு இல்லை? <span className="underline ml-1">இங்கே கிளிக் செய்யவும்</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shine { 100% { transform: translateX(100%); } }
        .animate-shine { animation: shine 1s; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}