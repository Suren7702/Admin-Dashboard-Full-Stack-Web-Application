// client/src/pages/Members.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  Phone, 
  Users, 
  Heart, 
  Save, 
  Trash2, 
  Edit, 
  X,
  Shield,
  Droplet
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🥇 Role priority helper (Tamil + English)
const getRolePriority = (rawRole) => {
  const role = (rawRole || "").toLowerCase().trim();
  if (!role) return 999;
  if (role.includes("district secretary") || (role.includes("மாவட்ட") && role.includes("செயலாளர்"))) return 1;
  if (role.includes("union secretary") || (role.includes("ஒன்றிய") && role.includes("செயலாளர்"))) return 2;
  if (role.includes("town secretary") || role.includes("city secretary") || (role.includes("நகர") && role.includes("செயலாளர்"))) return 3;
  if (role.includes("area secretary") || role.includes("ward secretary") || (role.includes("வட்ட") && role.includes("செயலாளர்")) || (role.includes("ஊராட்சி") && role.includes("செயலாளர்"))) return 4;
  if (role.includes("coordinator") || role.includes("incharge") || role.includes("in-charge") || role.includes("இணை ஒருங்கிணைப்பாளர்") || role.includes("ஒருங்கிணைப்பாளர்")) return 5;
  if (role.includes("executive") || role.includes("committee") || role.includes("worker") || role.includes("செயலர்") || role.includes("துணை செயலாளர்")) return 6;
  if (role.includes("member") || role.includes("உறுப்பினர்")) return 7;
  return 900;
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  
  // UI State
  const [showForm, setShowForm] = useState(false);

  // form + CRUD
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [useNewTeam, setUseNewTeam] = useState(false);

  const [form, setForm] = useState({
    teamName: "",
    name: "",
    role: "",
    phone: "",
    community: "",
    bloodGroup: "",
    maanaduEnabled: false,
    maanaduEventName: "",
    maanaduVehicleType: "",
    maanaduAmount: "",
    maanaduDate: "",
    maanaduNotes: "",
  });

  const getToken = () => localStorage.getItem("token");

  // ----------------- LOAD MEMBERS -----------------
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/members`, {
        headers: { Authorization: getToken() ? `Bearer ${getToken()}` : "" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load members");
      
      let list = Array.isArray(data) ? data : (data.members || []);

      // Sort
      list.sort((a, b) => {
        const pa = getRolePriority(a.role);
        const pb = getRolePriority(b.role);
        if (pa !== pb) return pa - pb;
        return (a.name || "").localeCompare(b.name || "", "ta-IN");
      });

      setMembers(list);
    } catch (err) {
      console.error("❌ Error loading members:", err);
      setError(err.message || "Something went wrong");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  // ----------------- LOAD TEAMS -----------------
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API_URL}/api/members/teams`, {
          headers: { Authorization: getToken() ? `Bearer ${getToken()}` : "" },
        });
        const data = await res.json();
        if (Array.isArray(data)) setTeams(data);
      } catch (err) {
        console.error("❌ Error loading team list:", err);
      }
    };
    fetchTeams();
  }, []);

  const safeMembers = Array.isArray(members) ? members : [];

  // ----------------- FILTER -----------------
  const filteredMembers = safeMembers.filter((m) => {
    const q = search.trim().toLowerCase();
    const memberTeam = (m.teamName || m.team || "").toLowerCase();
    if (teamFilter !== "all" && memberTeam !== teamFilter.toLowerCase()) return false;
    if (!q) return true;
    const name = (m.name || "").toLowerCase();
    const phone = (m.phone || "").toLowerCase();
    const role = (m.role || "").toLowerCase();
    const team = memberTeam;
    return name.includes(q) || phone.includes(q) || role.includes(q) || team.includes(q);
  });

  const toInputDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  // ----------------- HANDLERS -----------------
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setFormError("");
    setFormSuccess("");
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setFormError(""); setFormSuccess("");

    if (!form.teamName || !form.name || !form.phone) {
      setFormError("Team, Name, and Phone are mandatory.");
      return;
    }

    try {
      setSaving(true);
      const isEdit = Boolean(editingId);
      const url = isEdit ? `${API_URL}/api/members/${editingId}` : `${API_URL}/api/members`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken() ? `Bearer ${getToken()}` : "",
        },
        body: JSON.stringify({
          teamName: form.teamName,
          name: form.name,
          role: form.role,
          phone: form.phone,
          community: form.community,
          bloodGroup: form.bloodGroup,
          maanaduEnabled: form.maanaduEnabled,
          maanaduEventName: form.maanaduEventName,
          maanaduVehicleType: form.maanaduVehicleType,
          maanaduAmount: form.maanaduAmount ? Number(form.maanaduAmount) : 0,
          maanaduDate: form.maanaduDate || null,
          maanaduNotes: form.maanaduNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save member");

      if (isEdit) {
        setFormSuccess("Member updated successfully ✅");
        setMembers((prev) => prev.map((m) => (m._id === data._id ? data : m)));
      } else {
        setFormSuccess("Member added successfully ✅");
        setMembers((prev) => [data, ...prev]);
        // Don't close form immediately on add, allow continuous adding
      }
      
      if(isEdit) {
         setEditingId(null);
         setShowForm(false);
         setForm({ teamName: "", name: "", role: "", phone: "", community: "", bloodGroup: "", maanaduEnabled: false, maanaduEventName: "", maanaduVehicleType: "", maanaduAmount: "", maanaduDate: "", maanaduNotes: "" });
      } else {
          // Reset fields but keep team for convenience
          setForm(prev => ({...prev, name: "", role: "", phone: "", community: "", bloodGroup: "", maanaduEnabled: false, maanaduAmount: ""}));
      }

    } catch (err) {
      setFormError(err.message || "Failed to save member");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (m) => {
    const maanadu = m.maanaduSupport || {};
    setEditingId(m._id);
    setUseNewTeam(false);
    setForm({
      teamName: m.teamName || m.team || "",
      name: m.name || "",
      role: m.role || "",
      phone: m.phone || "",
      community: m.community || "",
      bloodGroup: m.bloodGroup || m.blood || "",
      maanaduEnabled: !!maanadu.enabled,
      maanaduEventName: maanadu.eventName || "",
      maanaduVehicleType: maanadu.vehicleType || "",
      maanaduAmount: maanadu.amountSpent != null ? String(maanadu.amountSpent) : "",
      maanaduDate: toInputDate(maanadu.date),
      maanaduNotes: maanadu.notes || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      const res = await fetch(`${API_URL}/api/members/${id}`, {
        method: "DELETE",
        headers: { Authorization: getToken() ? `Bearer ${getToken()}` : "" },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMembers((prev) => prev.filter((x) => x._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // ----------------- RENDER -----------------
  return (
    <DashboardLayout>
      <div className="min-h-screen text-gray-100">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Members Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Shield size={14} className="text-emerald-500" />
              <span>{filteredMembers.length} active members</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => {
                   setShowForm(!showForm);
                   setEditingId(null);
                   setForm({ teamName: "", name: "", role: "", phone: "", community: "", bloodGroup: "", maanaduEnabled: false, maanaduEventName: "", maanaduVehicleType: "", maanaduAmount: "", maanaduDate: "", maanaduNotes: "" });
               }}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-900/20 ${showForm ? 'bg-gray-800 text-gray-300' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
             >
               {showForm ? <X size={18} /> : <Plus size={18} />}
               {showForm ? "Cancel" : "Add Member"}
             </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, role, phone..."
                className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
              />
           </div>
           
           <div className="relative md:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-8 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-gray-300"
              >
                <option value="all">All Teams</option>
                {teams.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
           </div>
        </div>

        {/* ERROR MESSAGES */}
        {error && (
           <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3 animate-pulse">
             <Shield size={20} />
             {error}
           </div>
        )}

        {/* ADD / EDIT FORM (Collapsible) */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? "max-h-[800px] opacity-100 mb-8" : "max-h-0 opacity-0 mb-0"}`}>
           <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {editingId ? <Edit size={18} className="text-blue-400"/> : <Plus size={18} className="text-emerald-400"/>}
                    {editingId ? "Edit Member Details" : "New Member Registration"}
                 </h2>
              </div>

              {formError && <div className="mb-4 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-800">{formError}</div>}
              {formSuccess && <div className="mb-4 text-sm text-emerald-400 bg-emerald-900/20 p-3 rounded-lg border border-emerald-800">{formSuccess}</div>}

              <form onSubmit={handleSaveMember} className="space-y-6">
                 {/* Basic Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    
                    {/* Team Selection */}
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Team Allocation</label>
                       {useNewTeam ? (
                          <div className="relative">
                             <input name="teamName" value={form.teamName} onChange={handleFormChange} placeholder="Enter New Team Name" className="input-field" />
                             <button type="button" onClick={() => setUseNewTeam(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300">Select Existing</button>
                          </div>
                       ) : (
                          <div className="relative">
                             <select name="teamName" value={form.teamName} onChange={handleFormChange} className="input-field appearance-none">
                                <option value="">Select Team</option>
                                {teams.map((t, i) => <option key={i} value={t}>{t}</option>)}
                             </select>
                             <button type="button" onClick={() => {setUseNewTeam(true); setForm(p => ({...p, teamName: ""}))}} className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300">New</button>
                          </div>
                       )}
                    </div>

                    {/* Name */}
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                       <input name="name" value={form.name} onChange={handleFormChange} placeholder="Member Name" className="input-field" />
                    </div>

                    {/* Role */}
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Designation / Role</label>
                       <input name="role" value={form.role} onChange={handleFormChange} placeholder="e.g. District Secretary" className="input-field" />
                    </div>

                    {/* Phone */}
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact Number</label>
                       <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="Mobile Number" className="input-field" />
                    </div>

                    {/* Community */}
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Community</label>
                       <input name="community" value={form.community} onChange={handleFormChange} placeholder="Community" className="input-field" />
                    </div>

                    {/* Blood Group */}
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Blood Group</label>
                       <input name="bloodGroup" value={form.bloodGroup} onChange={handleFormChange} placeholder="e.g. O+ve" className="input-field" />
                    </div>
                 </div>

                 {/* Maanadu Support Section */}
                 <div className="bg-gray-950/50 rounded-xl p-5 border border-gray-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                       <div className="relative">
                          <input type="checkbox" name="maanaduEnabled" checked={form.maanaduEnabled} onChange={handleFormChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-emerald-600"></div>
                       </div>
                       <span className="text-sm font-medium text-gray-200">Maanadu Contribution / Support</span>
                    </label>

                    {form.maanaduEnabled && (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 animate-fadeIn">
                          <input name="maanaduEventName" value={form.maanaduEventName} onChange={handleFormChange} placeholder="Event Name" className="input-field" />
                          <input name="maanaduVehicleType" value={form.maanaduVehicleType} onChange={handleFormChange} placeholder="Vehicle Type (Van/Bus)" className="input-field" />
                          <input type="number" name="maanaduAmount" value={form.maanaduAmount} onChange={handleFormChange} placeholder="Amount (₹)" className="input-field" />
                          <input type="date" name="maanaduDate" value={form.maanaduDate} onChange={handleFormChange} className="input-field" />
                          <textarea name="maanaduNotes" value={form.maanaduNotes} onChange={handleFormChange} placeholder="Additional Notes..." rows={1} className="input-field md:col-span-4 resize-none" />
                       </div>
                    )}
                 </div>

                 <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium">Cancel</button>
                    <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition-all text-sm font-bold flex items-center gap-2">
                       {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={16}/>}
                       {editingId ? "Update Member" : "Save Member"}
                    </button>
                 </div>
              </form>
           </div>
        </div>

        {/* MEMBERS GRID */}
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-900/50 rounded-2xl animate-pulse border border-gray-800"></div>)}
           </div>
        ) : (
           <>
              {filteredMembers.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed">
                    <Users size={48} className="mb-4 opacity-20" />
                    <p>No members found matching your criteria.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredMembers.map((m) => {
                       const maanadu = m.maanaduSupport || {};
                       const isSupporter = !!maanadu.enabled;
                       
                       return (
                          <div key={m._id} className="group relative bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1">
                             
                             {/* Top Strip for Supporters */}
                             {isSupporter && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-emerald-500 rounded-t-2xl opacity-80"></div>}

                             <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                   <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${isSupporter ? 'bg-gradient-to-br from-yellow-500/10 to-emerald-500/10 border-yellow-500/30 text-yellow-500' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                      {m.name.charAt(0).toUpperCase()}
                                   </div>
                                   <div>
                                      <h3 className="font-bold text-gray-100 text-lg leading-tight">{m.name}</h3>
                                      <p className="text-xs text-blue-400 mt-0.5">{m.teamName || m.team || "No Team"}</p>
                                   </div>
                                </div>
                                
                                {isSupporter && (
                                   <div className="flex flex-col items-end">
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Maanadu</span>
                                      <span className="text-xs font-mono text-emerald-300 mt-1">₹{maanadu.amountSpent?.toLocaleString()}</span>
                                   </div>
                                )}
                             </div>

                             {/* Role Badge */}
                             <div className="mb-4">
                                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${m.role ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-900 text-gray-600 border-dashed border-gray-800'}`}>
                                   {m.role || "No Role Assigned"}
                                </span>
                             </div>

                             {/* Details Grid */}
                             <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm border-t border-gray-800 pt-4 mb-4">
                                <div className="flex items-center gap-2 text-gray-400">
                                   <Phone size={14} />
                                   <span className="text-gray-200">{m.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                   <Users size={14} />
                                   <span className="text-gray-200 truncate">{m.community || "-"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                   <Droplet size={14} className="text-red-400"/>
                                   <span className="text-gray-200">{m.bloodGroup || "-"}</span>
                                </div>
                             </div>

                             {/* Actions */}
                             <div className="flex justify-end gap-2 pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(m)} className="p-2 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors" title="Edit Member">
                                   <Edit size={16} />
                                </button>
                                <button onClick={() => deleteMember(m._id)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors" title="Delete Member">
                                   <Trash2 size={16} />
                                </button>
                             </div>

                          </div>
                       );
                    })}
                 </div>
              )}
           </>
        )}
      </div>

      {/* CSS Utility for Input Fields */}
      <style>{`
         .input-field {
            width: 100%;
            background-color: rgba(17, 24, 39, 0.5);
            border: 1px solid rgba(55, 65, 81, 1);
            border-radius: 0.75rem;
            padding: 0.625rem 1rem;
            font-size: 0.875rem;
            color: white;
            transition: all 0.2s;
         }
         .input-field:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
            background-color: rgba(17, 24, 39, 0.8);
         }
         .input-field::placeholder {
            color: #6b7280;
         }
      `}</style>
    </DashboardLayout>
  );
}