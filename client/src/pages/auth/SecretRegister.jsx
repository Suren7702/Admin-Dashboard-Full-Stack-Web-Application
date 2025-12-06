// src/pages/auth/SecretRegister.jsx
import { useState } from "react";
import api from "../../utils/api";
import RegisterForm from "./RegisterForm";
import { Link } from "react-router-dom";

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
        setError("Invalid secret key");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          Secret Registration
        </h1>
        <p className="text-gray-400 text-center text-xs mb-6">
          Only trusted party members with the secret key can create accounts.
        </p>

        {!validated ? (
          <>
            {error && (
              <div className="mb-4 text-sm text-red-400 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Secret Key</label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => {
                    setSecretKey(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter secret key"
                />
              </div>

              <button
                type="submit"
                disabled={checking}
                className="w-full mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed py-2 text-sm font-semibold transition"
              >
                {checking ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-emerald-400 text-center mb-2">
              ✅ Secret key validated. You can register a new admin/worker now.
            </div>
            <RegisterForm />
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-400">
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
