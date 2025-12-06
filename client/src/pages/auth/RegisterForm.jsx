// src/pages/auth/RegisterForm.jsx
import { useState } from "react";
import api from "../../utils/api";

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

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Enter a valid email";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters";

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
        `User "${data.name || form.name}" registered successfully.`
      );
      setForm({ name: "", email: "", password: "", role: "admin" });
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2 border border-gray-800 rounded-xl bg-gray-900/80 p-4">
      <h2 className="text-sm font-semibold mb-3">Create New Account</h2>

      {successMsg && (
        <div className="mb-3 text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700 rounded px-3 py-2">
          {successMsg}
        </div>
      )}

      {serverError && (
        <div className="mb-3 text-xs text-red-400 bg-red-900/30 border border-red-700 rounded px-3 py-2">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Full name"
          />
          {errors.name && (
            <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="user@party.com"
          />
          {errors.email && (
            <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-[11px] text-red-400 mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="admin">Admin</option>
            <option value="coordinator">Coordinator</option>
            <option value="volunteer">Volunteer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed py-2 font-semibold transition"
        >
          {submitting ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
