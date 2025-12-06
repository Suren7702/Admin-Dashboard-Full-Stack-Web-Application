// src/pages/auth/RegisterForm.jsx
import { useState } from "react";
import api from "../../utils/api";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  UserPlus 
} from "lucide-react";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Full Name is required";

    if (!form.email) newErrors.email = "Email Address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setServerError("");
      const { data } = await api.post("/auth/register", form);

      setSuccessMsg(
        `Success! Account created for "${data.name || form.name}".`
      );
      setForm({ name: "", email: "", password: "", role: "admin" });
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      
      <div className="mb-5 border-b border-gray-100 pb-2">
         <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <UserPlus size={20} className="text-[#8B0000]" />
            New User Registration
         </h2>
         <p className="text-xs text-gray-500 mt-1">Create accounts for party functionaries.</p>
      </div>

      {successMsg && (
        <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div>
             <span className="font-bold block">Registration Complete</span>
             {successMsg}
          </div>
        </div>
      )}

      {serverError && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
             <span className="font-bold block">Error</span>
             {serverError}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Name Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B0000] transition-colors">
              <User size={18} />
            </div>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent focus:bg-white transition-all text-sm`}
              placeholder="e.g. Vijay Kumar"
            />
          </div>
          {errors.name && <p className="text-xs text-red-600 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B0000] transition-colors">
              <Mail size={18} />
            </div>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent focus:bg-white transition-all text-sm`}
              placeholder="admin@tvkparty.com"
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B0000] transition-colors">
              <Lock size={18} />
            </div>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent focus:bg-white transition-all text-sm`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-xs text-red-600 mt-1 font-medium">{errors.password}</p>}
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Access Role</label>
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B0000] transition-colors">
              <Shield size={18} />
            </div>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 bg-gray-50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent focus:bg-white transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="admin">System Admin</option>
              <option value="coordinator">District Coordinator</option>
              <option value="volunteer">Volunteer Lead</option>
            </select>
            {/* Custom Arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-[#8B0000] to-[#b91c1c] hover:from-[#6b0000] hover:to-[#991b1b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B0000] disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {submitting ? (
             <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating Account...
             </span>
          ) : "Create Account"}
        </button>
      </form>
    </div>
  );
}