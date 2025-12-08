import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout.jsx";
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

import { 
  Search, Plus, MapPin, Phone, Users, Target, 
  Trash2, Edit, X, ChevronDown, ChevronUp
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function KizhaiKazhagam() {
  const [kizhais, setKizhais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // CRUD States
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    name: "", ward: "", secretaryName: "", phone: "", area: "", 
    memberCount: "", targetCount: "100"
  });

  const getToken = () => localStorage.getItem("token");

  // Load Data
  const loadKizhais = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/kizhais`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (Array.isArray(data)) setKizhais(data);
    } catch (err) { console.error("Load Error:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadKizhais(); }, []);

  const getProgressColor = (current, total) => {
    if (!total || total === 0) return "bg-gray-600";
    const percentage = (current / total) * 100;
    if (percentage < 40) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (percentage < 80) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
    return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
  };

  const handleFormChange = (e) => { 
    setForm({ ...form, [e.target.name]: e.target.value }); 
  };

  // SAVE Function (Modified for Debugging)
  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Form Data sending:", form); // Check Console for this!

    if (!form.name || !form.secretaryName) return alert("பெயர் மற்றும் செயலாளர் விபரங்கள் தேவை");
    
    setSaving(true);
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `${API_URL}/api/kizhais/${editingId}` : `${API_URL}/api/kizhais`;
      const method = isEdit ? "PUT" : "POST";
      
      // Convert numbers explicitly
      const payload = {
          ...form,
          memberCount: Number(form.memberCount),
          targetCount: Number(form.targetCount)
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      });
      
      const responseData = await res.json();

      if (res.ok) {
        alert(isEdit ? "வெற்றிகரமாக புதுப்பிக்கப்பட்டது (Updated)" : "வெற்றிகரமாக சேர்க்கப்பட்டது (Added)");
        loadKizhais();
        setShowForm(false);
        setEditingId(null);
        setForm({ name: "", ward: "", secretaryName: "", phone: "", area: "", memberCount: "", targetCount: "100" });
      } else {
        alert("Error: " + (responseData.message || "Save failed"));
        console.error("Server Error:", responseData);
      }
    } catch (err) { 
        alert("Network Error. Check Console."); 
        console.error("Network Error:", err); 
    } finally { setSaving(false); }
  };

  // EDIT Function
  const startEdit = (item, e) => {
    e.stopPropagation(); // Stop card click
    setEditingId(item._id);
    setForm({
        name: item.name,
        ward: item.ward,
        secretaryName: item.secretaryName,
        phone: item.phone,
        area: item.area || "", // Handle missing area
        memberCount: item.memberCount,
        targetCount: item.targetCount
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if(!window.confirm("Delete?")) return;
    await fetch(`${API_URL}/api/kizhais/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setKizhais(prev => prev.filter(k => k._id !== id));
  };

  const filteredList = kizhais.filter(k => 
    k.name.toLowerCase().includes(search.toLowerCase()) || 
    k.secretaryName.toLowerCase().includes(search.toLowerCase()) ||
    k.ward.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen pb-20 text-gray-100">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
              கிளைக் கழகம்
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <MapPin size={14} className="text-red-500" />
              <span>{kizhais.length} கிளைகள்</span>
            </p>
          </div>
          <button 
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", ward: "", secretaryName: "", phone: "", area: "", memberCount: "", targetCount: "100" }); }} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg ${showForm ? 'bg-gray-800 text-gray-300' : 'bg-red-700 hover:bg-red-600 text-white shadow-red-900/20'}`}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "ரத்து செய்" : "கிளை சேர்"}
          </button>
        </div>

        {/* Search */}
        {!showForm && (
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-4 rounded-2xl mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder="தேடுங்கள்..." 
                    className="w-full bg-gray-950/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-600 text-white" 
                />
            </div>
            </div>
        )}

        {/* FORM SECTION */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? "max-h-[800px] opacity-100 mb-8" : "max-h-0 opacity-0 mb-0"}`}>
           <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <form onSubmit={handleSave} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    
                    <div>
                        <label className="lbl">கிளை பெயர் (Name)</label>
                        <ReactTransliterate
                          value={form.name}
                          onChangeText={(text) => setForm({ ...form, name: text })}
                          lang="ta"
                          placeholder="Ex: Srirangam"
                          renderComponent={(props) => <input {...props} className="input-field" />}
                        />
                    </div>

                    <div>
                        <label className="lbl">வார்டு எண்</label>
                        <input name="ward" value={form.ward} onChange={handleFormChange} placeholder="Ex: 45" className="input-field" required />
                    </div>

                    {/* NEW AREA FIELD */}
                    <div>
                        <label className="lbl">பகுதி / தெரு (Area)</label>
                        <input name="area" value={form.area} onChange={handleFormChange} placeholder="Ex: Gandhi Nagar" className="input-field" />
                    </div>

                    <div>
                        <label className="lbl">செயலாளர் பெயர்</label>
                        <ReactTransliterate
                          value={form.secretaryName}
                          onChangeText={(text) => setForm({ ...form, secretaryName: text })}
                          lang="ta"
                          placeholder="Ex: Vijay"
                          renderComponent={(props) => <input {...props} className="input-field" />}
                        />
                    </div>

                    <div>
                        <label className="lbl">அலைபேசி எண்</label>
                        <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="9876543210" className="input-field" />
                    </div>
                    <div>
                        <label className="lbl">உறுப்பினர்கள்</label>
                        <input type="number" name="memberCount" value={form.memberCount} onChange={handleFormChange} placeholder="0" className="input-field" />
                    </div>
                    <div>
                        <label className="lbl">இலக்கு</label>
                        <input type="number" name="targetCount" value={form.targetCount} onChange={handleFormChange} placeholder="100" className="input-field" />
                    </div>
                 </div>
                 <div className="flex justify-end gap-3 pt-2">
                   <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold transition-colors">
                     {saving ? "சேமிக்கிறது..." : editingId ? "புதுப்பி (Update)" : "உருவாக்கு (Create)"}
                   </button>
                 </div>
              </form>
           </div>
        </div>

        {/* LIST VIEW */}
        {!loading && (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
             {filteredList.map((item) => {
                const percentage = Math.round((item.memberCount / item.targetCount) * 100) || 0;
                const isExpanded = expandedId === item._id;
                return (
                 <div 
                   key={item._id}
                   onClick={() => setExpandedId(isExpanded ? null : item._id)}
                   className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                     percentage < 40 ? 'bg-gray-900/60 border-red-900/30' : 
                     percentage < 80 ? 'bg-gray-900/60 border-yellow-900/30' : 
                     'bg-gray-900/60 border-green-900/30'
                   }`}
                 >
                    <div className="absolute top-0 right-0 bg-[#1a1d24] text-gray-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-gray-800 z-10">{item.ward}</div>
                    
                    <div className="p-5">
                       <h3 className="font-bold text-lg text-white mb-1 group-hover:text-yellow-500 transition-colors">{item.name}</h3>
                       <p className="text-xs text-gray-500 mb-4 flex items-center gap-1"><MapPin size={12}/> {item.area || "பகுதி குறிப்பிடப்படவில்லை"}</p>

                       <div className="flex items-center gap-3 mb-4 bg-black/20 p-3 rounded-xl border border-gray-800">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                            {item.secretaryName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">செயலாளர்</p>
                            <p className="text-sm font-semibold text-gray-200">{item.secretaryName}</p>
                          </div>
                       </div>

                       <div className="mb-2">
                           <div className="flex justify-between text-xs mb-1.5">
                               <span className="text-gray-500">பலம் ({percentage}%)</span>
                               <span className="text-white font-mono">{item.memberCount}/{item.targetCount}</span>
                           </div>
                           <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full ${getProgressColor(item.memberCount, item.targetCount)}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                           </div>
                       </div>
                    </div>

                    {/* EXPANDED VIEW / EDIT ACTIONS */}
                    <div className={`transition-all duration-300 ease-in-out bg-black/20 border-t border-gray-800/50 ${isExpanded ? 'max-h-32 opacity-100 py-3 px-5' : 'max-h-0 opacity-0 py-0 px-5'}`}>
                       <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-400">
                           <div>Phone: <span className="text-white">{item.phone}</span></div>
                           <div>Area: <span className="text-white">{item.area}</span></div>
                       </div>
                       <div className="flex items-center justify-between border-t border-gray-700 pt-2">
                          <a href={`tel:${item.phone}`} className="text-gray-400 hover:text-green-500 transition-colors"><Phone size={18} /></a>
                          <div className="flex gap-3">
                             <button onClick={(e) => startEdit(item, e)} className="text-blue-400 text-xs font-medium flex items-center gap-1 hover:underline"><Edit size={14}/> திருத்து</button>
                             <button onClick={(e) => handleDelete(item._id, e)} className="text-red-400 text-xs font-medium flex items-center gap-1 hover:underline"><Trash2 size={14}/> நீக்கு</button>
                          </div>
                       </div>
                    </div>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-700">
                       {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </div>
                 </div>
                );
             })}
           </div>
        )}

        <style>{`
            .lbl { display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #6b7280; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
            .input-field { width: 100%; background-color: rgba(17, 24, 39, 0.5); border: 1px solid rgba(55, 65, 81, 1); border-radius: 0.75rem; padding: 0.625rem 1rem; font-size: 0.875rem; color: white; transition: all 0.2s; } 
            .input-field:focus { outline: none; border-color: #ef4444; box-shadow: 0 0 0 1px #ef4444; background-color: rgba(17, 24, 39, 0.8); }
            .react-transliterate-suggestion-list { background: #1f2937 !important; color: white !important; border: 1px solid #374151 !important; z-index: 50 !important; }
            .react-transliterate-suggestion-item-active { background: #ef4444 !important; }
        `}</style>
      </div>
    </DashboardLayout>
  );
}