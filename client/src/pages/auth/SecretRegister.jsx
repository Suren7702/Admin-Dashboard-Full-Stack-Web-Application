// src/pages/auth/SecretRegister.jsx
import { useState } from "react";
import api from "../../utils/api";
import RegisterForm from "./RegisterForm"; // Ensure this component is also styled nicely
import { Link } from "react-router-dom";
import { 
  Lock, 
  KeyRound, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  Loader2 
} from "lucide-react";

export default function SecretRegister() {
  const [secretKey, setSecretKey] = useState("");
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!secretKey.trim()) {
      setError("Secret key is required");
      return;
    }

    try {
      setChecking(true);
      const { data } = await api.post("/auth/verify-secret", { secretKey });
      if (data.valid) {
        setValidated(true);
      } else {
        setError("Invalid secret key. Access denied.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to verify secret key right now."
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4a0404] via-[#2b0000] to-black p-4">
      
      {/* Background decoration (Optional) */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 z-10"></div>

      <div className="w-full max-w-[450px] bg-white rounded-2xl shadow-2xl overflow-hidden relative z-0 transition-all duration-500 ease-in-out">
        
        {/* Decorative Header Background */}
        <div className="h-32 bg-[#1a0505] relative flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            {/* Dynamic Icon based on state */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-[#2b0000] shadow-lg z-10 transition-colors duration-500 ${validated ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#8B0000]'}`}>
                {validated ? <ShieldCheck size={32} /> : <Lock size={30} />}
            </div>
        </div>

        <div className="px-8 pb-8 pt-4">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {validated ? "Authorized Registration" : "Restricted Access"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {validated 
                ? "Secure channel established. Create new admin account." 
                : "Enter the master security key to proceed."}
            </p>
          </div>

          {!validated ? (
            /* STEP 1: VERIFY SECRET KEY */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Master Key
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B0000] transition-colors">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="password"
                      value={secretKey}
                      onChange={(e) => {
                        setSecretKey(e.target.value);
                        setError("");
                      }}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition-all sm:text-sm"
                      placeholder="••••••••••••••"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checking}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#8B0000] hover:bg-[#6b0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {checking ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Verifying Access...
                    </>
                  ) : (
                    "Verify Key"
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* STEP 2: REGISTRATION FORM */
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-6 flex items-center gap-3 text-sm text-emerald-800">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                  <span>Key Verified. Session secured.</span>
               </div>
               
               {/* This assumes RegisterForm is relatively clean, or you might need to style it too */}
               <RegisterForm />
            </div>
          )}

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#8B0000] transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to Login Portal
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}