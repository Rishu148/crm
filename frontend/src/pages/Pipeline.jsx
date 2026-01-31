import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/authContext";
import Confetti from "react-confetti";
import { 
  Search, Plus, Phone, Mail, X, MoreVertical, 
  GripVertical, LayoutGrid, CheckCircle, XCircle, User, 
  Briefcase, Globe, MessageCircle, Trash2, Edit3,
  Clock, AlertCircle, Zap, ExternalLink, FileText, Lock, AlertTriangle, Save, ArrowRight
} from "lucide-react";

// --- HELPER: TIME FORMATTER ---
const formatTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
};

// --- HELPER: INTERACTION BADGE ---
const getInteractionStatus = (dateString) => {
    if (!dateString) return { label: "New", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Zap size={12}/> };
    const created = new Date(dateString);
    const now = new Date();
    const diffHours = Math.abs(now - created) / 36e5;
    if (diffHours < 24) return { label: "Active", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <Zap size={12}/> };
    if (diffHours < 168) return { label: "Idle", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <Clock size={12}/> };
    return { label: "Stalled", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: <AlertCircle size={12}/> };
};

// --- CUSTOM TOAST ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-10 duration-500 ease-out ${type === 'success' ? 'bg-[#0A0A0C]/95 border-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'bg-[#0A0A0C]/95 border-rose-500/20 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)]'}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="font-medium text-sm text-slate-200 tracking-wide">{message}</span>
    </div>
  );
};

function Pipeline() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedOver, setDraggedOver] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [selectedDeal, setSelectedDeal] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", source: "Manual", status: "New"
  });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.get("/leads");
      setLeads(res.data);
    } catch (error) { console.error("Error fetching pipeline"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await api.post("/leads", { ...formData, status: "New" });
      setShowModal(false);
      setFormData({ name: "", phone: "", email: "", source: "Manual", status: "New" });
      fetchLeads();
      notify("New opportunity created! 🚀");
    } catch (error) { notify("Failed to create deal.", "error"); }
  };

  const handleUpdateDeal = async (id, updatedData) => {
      try {
          await api.put(`/leads/${id}`, updatedData);
          fetchLeads();
          notify("Deal updated successfully", "success");
          setTimeout(() => setSelectedDeal(null), 500);
      } catch (err) {
          notify("Update failed", "error");
      }
  };

  const requestDelete = () => { if(selectedDeal) setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
      if (!selectedDeal) return;
      try {
          await api.delete(`/leads/${selectedDeal._id}`);
          setShowDeleteConfirm(false);
          setSelectedDeal(null);
          fetchLeads();
          notify("Deal removed permanently.", "success");
      } catch (error) { notify("Could not delete deal.", "error"); }
  };

  const handleDrop = async (leadId, newStatus) => {
    // 🚩 ADMIN CHECK: Admin can't drop
    if (user?.role === "admin") {
        notify("Admin cannot modify stages.", "error");
        setDraggedOver(null);
        return;
    }

    const currentLead = leads.find(l => l._id === leadId);
    if (!currentLead) return;
    
    if (currentLead.status === 'Closed') {
        notify("Closed deals are locked.", "error");
        setDraggedOver(null);
        return;
    }

    const isUnassigned = !currentLead.assignedTo;
    const originalLeads = [...leads];
    
    setLeads(prev => prev.map(l => {
        if (l._id === leadId) {
            return { 
                ...l, 
                status: newStatus, 
                assignedTo: isUnassigned ? { _id: user._id, name: user.name } : l.assignedTo 
            };
        }
        return l;
    }));
    setDraggedOver(null);

    if (newStatus === "Closed") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); 
        notify("Deal Won! Congratulations! 🏆");
    } else {
        notify(`Moved to ${newStatus}`);
    }

    try {
      const payload = { status: newStatus };
      if (isUnassigned) payload.assignedTo = user._id;
      await api.put(`/leads/${leadId}`, payload);
      fetchLeads();
    } catch (error) {
      setLeads(originalLeads);
      notify("Move failed. Reverting changes.", "error");
    }
  };

  const totalLeads = leads.length;
  const groupedLeads = ["New", "Contacted", "Interested", "Closed", "Lost"].map((stage) => ({
    stage,
    items: leads.filter((l) => {
        const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm);
        if (!matchesSearch) return false;
        const isUnassigned = !l.assignedTo;
        if (stage === "New") return l.status === "New" || isUnassigned;
        else return l.status === stage && !isUnassigned;
    })
  }));

  if (loading) return <PipelineSkeleton />;

  return (
    <div className="flex flex-col h-screen bg-[#030303] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={300} gravity={0.2} style={{ zIndex: 200 }} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="px-8 py-5 flex-none border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl z-20">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <div className="p-2 bg-[#0F0F12] rounded-xl border border-white/10 shadow-inner">
                 <LayoutGrid className="text-indigo-400" size={20} />
              </div>
              Pipeline View
            </h1>
            <p className="text-slate-500 text-xs mt-1.5 ml-1 font-medium tracking-wide">
              Managing <span className="text-white font-bold">{totalLeads}</span> active opportunities
            </p>
          </div>
          <div className="flex gap-4 w-full xl:w-auto">
              <div className="relative flex-1 xl:w-80 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input type="text" placeholder="Search pipeline..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0A0A0C] border border-white/5 group-focus-within:border-indigo-500/50 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none transition-all placeholder:text-slate-600" />
              </div>
              {/* 🚩 Show Add button only for Agents or if Admin needs it */}
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all text-sm font-bold active:scale-95 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] cursor-pointer"><Plus size={18} strokeWidth={3} /> Add Deal</button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 z-10">
        <div className="flex gap-6 h-full min-w-max pb-4">
          {groupedLeads.map((group, index) => (
            <StageColumn
              key={group.stage}
              stage={group.stage}
              leads={group.items}
              onDrop={handleDrop}
              draggedOver={draggedOver === group.stage}
              setDraggedOver={setDraggedOver}
              onCardClick={setSelectedDeal} 
              index={index}
            />
          ))}
        </div>
      </div>

      {/* MODALS */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-[#0A0A0C] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl relative animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase size={20} className="text-indigo-500"/> Create Opportunity</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddLead} className="p-8 space-y-5 relative z-10">
              <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Name</label><input required type="text" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Phone</label><input type="tel" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700" placeholder="+1 234..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email</label><input type="email" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Source</label>
                  <select className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}>
                      <option>Manual</option><option>Facebook</option><option>Website</option><option>Referral</option>
                  </select>
              </div>
              <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl mt-4 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer">Create Deal</button>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-[#0A0A0C] border border-red-500/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20 mx-auto">
                    <AlertTriangle className="text-red-500" size={28}/>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-center">Delete this Deal?</h3>
                <p className="text-slate-500 text-xs mb-8 text-center px-4">This action is permanent and cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors cursor-pointer">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all cursor-pointer">Delete</button>
                </div>
            </div>
        </div>
      )}

      <DealModal 
        deal={selectedDeal} 
        onClose={() => setSelectedDeal(null)} 
        onDeleteRequest={requestDelete} 
        onSave={handleUpdateDeal}
        currentUser={user} 
      />
    </div>
  );
}

function DealModal({ deal, onClose, onDeleteRequest, onSave, currentUser }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        if (deal) {
            setEditData({ ...deal }); 
            setIsEditing(false);
        }
    }, [deal]);

    if (!deal) return null;

    const handleSave = () => { onSave(deal._id, editData); };
    const getStatusColor = (status) => {
        switch (status) {
            case "New": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "Contacted": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "Interested": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "Closed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "Lost": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default: return "bg-slate-800 text-slate-400";
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity"></div>
            <div className="relative w-full max-w-xl h-[600px] bg-[#0A0A0C] border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-6 border-b border-white/5 bg-[#0A0A0C]/90 backdrop-blur-md shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4 w-full">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                                {deal.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <input className="w-full bg-[#050505] border border-indigo-500/50 rounded-lg px-2 py-1 text-white font-bold text-xl focus:outline-none" value={editData.name || ""} onChange={(e) => setEditData({...editData, name: e.target.value})} />
                                ) : (
                                    <h2 className="text-xl font-bold text-white leading-tight truncate">{deal.name}</h2>
                                )}
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(deal.status)}`}>{deal.status}</span>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><Globe size={10}/> {deal.source}</div>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 cursor-pointer"><X size={18}/></button>
                    </div>
                </div>
                
                <div className="flex border-b border-white/5 bg-[#0A0A0C] px-6 shrink-0">
                    <button onClick={() => setActiveTab("overview")} className={`mr-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTab === "overview" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-white"}`}>Overview</button>
                    <button onClick={() => setActiveTab("activity")} className={`mr-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTab === "activity" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-white"}`}>Timeline</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0C] custom-scrollbar relative">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5 relative group">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><User size={12} className="text-indigo-500"/> Contact Details</h3>
                                    {/* 🚩 ADMIN CHECK: No Edit button for Admin */}
                                    {!isEditing && currentUser?.role !== 'admin' && <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 cursor-pointer"><Edit3 size={10}/> Edit</button>}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-600 mb-1 block">Phone</label>
                                        {isEditing ? (
                                            <input className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" value={editData.phone || ""} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
                                        ) : (
                                            <div className="flex items-center gap-3"><span className="text-sm text-white font-mono">{deal.phone}</span><a href={`tel:${deal.phone}`} className="p-1.5 bg-[#050505] border border-white/5 rounded hover:bg-indigo-600 text-slate-400"><Phone size={12}/></a></div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-600 mb-1 block">Email</label>
                                        {isEditing ? (
                                            <input className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" value={editData.email || ""} onChange={(e) => setEditData({...editData, email: e.target.value})} />
                                        ) : (
                                            <div className="flex items-center gap-3"><span className="text-sm text-white truncate">{deal.email || "-"}</span>{deal.email && <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${deal.email}`} target="_blank" className="p-1.5 bg-[#050505] border border-white/5 rounded hover:bg-purple-600 text-slate-400"><ExternalLink size={12}/></a>}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0F0F12] p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2"><LayoutGrid size={14} className="text-blue-400"/><p className="text-[10px] font-bold text-slate-500 uppercase">Agent</p></div>
                                    <div className="flex items-center gap-2 text-sm text-white pl-1"><div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-[10px] font-bold">{deal.assignedTo?.name?.charAt(0) || "U"}</div><span className="truncate text-xs">{deal.assignedTo?.name || "Unassigned"}</span></div>
                                </div>
                                <div className="bg-[#0F0F12] p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2"><FileText size={14} className="text-purple-400"/><p className="text-[10px] font-bold text-slate-500 uppercase">System ID</p></div>
                                    <div className="text-sm text-slate-300 font-mono pl-1">#{deal._id.slice(-6).toUpperCase()}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "activity" && (
                        <div className="space-y-8 relative pl-4 border-l-2 border-white/5 ml-2 h-full">
                            <div className="relative group">
                                <div className="absolute -left-[23px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#0A0A0C]"></div>
                                <p className="text-sm text-slate-300">Stage updated to <span className="font-bold text-indigo-400">{deal.status}</span></p>
                                <p className="text-[10px] text-slate-500 mt-1">{formatTimeAgo(deal.updatedAt)}</p>
                            </div>
                            <div className="relative group">
                                <div className="absolute -left-[23px] top-1 w-3 h-3 bg-slate-700 rounded-full border-2 border-[#0A0A0C]"></div>
                                <p className="text-sm text-slate-300">Opportunity created via <b className="text-white">{deal.source}</b></p>
                                <p className="text-[10px] text-slate-500 mt-1">{formatTimeAgo(deal.createdAt)}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* FOOTER */}
                <div className="p-5 border-t border-white/5 bg-[#0A0A0C]/90 backdrop-blur-lg flex justify-between items-center gap-4 shrink-0">
                    {/* 🚩 ADMIN CHECK: Show only View-Only tag for Admin */}
                    {currentUser?.role === 'admin' ? (
                        <div className="w-full text-center py-2.5 bg-white/5 rounded-xl border border-white/5">
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                <Lock size={12} className="text-amber-500"/> Admin View-Only Mode
                             </p>
                        </div>
                    ) : isEditing ? (
                        <div className="flex gap-3 w-full justify-end">
                            <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs cursor-pointer">Cancel</button>
                            <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"><Save size={14}/> Save Changes</button>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-3 flex-1">
                                <ActionButton icon={<Phone size={16} />} label="Call" href={`tel:${deal.phone}`} color="blue" />
                                <ActionButton icon={<Mail size={16} />} label="Email" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${deal.email}`} color="purple" />
                                <ActionButton icon={<MessageCircle size={16} />} label="Chat" href={`https://wa.me/${deal.phone}`} color="green" />
                            </div>
                            <button onClick={onDeleteRequest} className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 cursor-pointer" title="Delete Deal"><Trash2 size={18} /></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function StageColumn({ stage, leads, onDrop, draggedOver, setDraggedOver, onCardClick, index }) {
  const config = {
    New: { border: "border-t-blue-500", text: "text-blue-400", bg: "bg-blue-500/5", badge: "text-blue-300 bg-blue-500/10 border-blue-500/20" },
    Contacted: { border: "border-t-amber-500", text: "text-amber-400", bg: "bg-amber-500/5", badge: "text-amber-300 bg-amber-500/10 border-amber-500/20" },
    Interested: { border: "border-t-purple-500", text: "text-purple-400", bg: "bg-purple-500/5", badge: "text-purple-300 bg-purple-500/10 border-purple-500/20" },
    Closed: { border: "border-t-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", badge: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30" }, 
    Lost: { border: "border-t-slate-700", text: "text-slate-500", bg: "bg-slate-900/20", badge: "text-slate-500 bg-slate-800 border-slate-700" },
  }[stage] || { border: "border-t-slate-500", text: "text-slate-400", bg: "bg-slate-500/5", badge: "text-slate-400" };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setDraggedOver(stage); }}
      onDragLeave={() => setDraggedOver(null)}
      onDrop={(e) => onDrop(e.dataTransfer.getData("id"), stage)}
      className={`min-w-[320px] w-[320px] flex flex-col h-full rounded-3xl bg-[#0F0F12]/40 border border-white/5 shadow-xl transition-all duration-300 ${draggedOver ? "ring-2 ring-indigo-500/50 bg-[#0F0F12]/80 scale-[1.01]" : ""}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`p-4 border-b border-white/5 flex flex-col gap-3 rounded-t-3xl border-t-[3px] sticky top-0 z-10 backdrop-blur-xl ${config.border} ${config.bg}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <h3 className={`font-bold text-xs uppercase tracking-widest ${config.text}`}>{stage}</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${config.badge}`}>{leads.length}</span>
            </div>
            <button className="text-slate-600 hover:text-white transition-colors cursor-pointer"><MoreVertical size={16} /></button>
        </div>
      </div>
      <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
        {leads.map((lead) => <LeadCard key={lead._id} lead={lead} onClick={() => onCardClick(lead)} />)}
        {leads.length === 0 && (
            <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex flex-col gap-3 items-center justify-center text-slate-700 bg-white/[0.01]">
                <Briefcase size={20} className="opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Empty</span>
            </div>
        )}
      </div>
    </div>
  );
}

function LeadCard({ lead, onClick }) {
  const { user } = useAuth(); // 👈 Role check ke liye
  const isLost = lead.status === "Lost";
  const isClosed = lead.status === "Closed"; 
  const isAdmin = user?.role === "admin"; // 👈 Admin identification

  // 🚩 Admin cannot drag, and Closed cards cannot be dragged
  const canDrag = !isClosed && !isAdmin;

  return (
    <div
      draggable={canDrag} 
      onClick={onClick}
      onDragStart={(e) => { 
          if(!canDrag) {
              e.preventDefault();
              return;
          }
          e.dataTransfer.setData("id", lead._id); 
          e.currentTarget.style.opacity = "0.5"; 
          e.currentTarget.style.transform = "scale(0.95)";
      }}
      onDragEnd={(e) => { 
          e.currentTarget.style.opacity = "1"; 
          e.currentTarget.style.transform = "scale(1)";
      }}
      className={`group relative rounded-2xl p-4 transition-all duration-300 ${
          isClosed 
          ? "bg-gradient-to-br from-emerald-900/10 to-emerald-900/5 border border-emerald-500/20 cursor-default" 
          : isAdmin 
            ? "bg-[#131316] border border-white/5 cursor-pointer hover:border-white/20" // Admin mode: No drag cursor
            : `bg-[#131316] border border-white/5 cursor-grab active:cursor-grabbing hover:border-indigo-500/40 hover:bg-[#18181b] hover:shadow-xl hover:-translate-y-1`
      }`}
    >
      {/* 🚩 Show Lock icon for Closed deals OR for Admin view */}
      {(isClosed || isAdmin) && (
        <div className="absolute top-4 right-4 text-slate-500 bg-white/5 p-1 rounded-md border border-white/10" title={isAdmin ? "Read Only" : "Deal Locked"}>
            <Lock size={10} />
        </div>
      )}
      {!isClosed && !isAdmin && <div className="absolute top-4 right-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"><GripVertical size={14} /></div>}

      <div className="flex flex-wrap gap-2 mb-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${isClosed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 border-white/5 text-slate-500"}`}>{lead.source || "Manual"}</span>
      </div>

      <h4 className={`font-bold text-sm mb-1 ${isLost ? "text-slate-500 line-through decoration-slate-700" : isClosed ? "text-emerald-100" : "text-slate-200 group-hover:text-white transition-colors"}`}>{lead.name}</h4>

      <div className="space-y-1.5 mt-3">
         {lead.phone && <div className="flex items-center gap-2 text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors"><Phone size={10} className={isClosed ? "text-emerald-500/50" : "text-indigo-500/70"} /> <span className="font-mono tracking-wide">{lead.phone}</span></div>}
         {lead.email && <div className="flex items-center gap-2 text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors"><Mail size={10} className={isClosed ? "text-emerald-500/50" : "text-purple-500/70"} /> <span className="truncate max-w-[150px]">{lead.email}</span></div>}
      </div>

      <div className={`mt-4 pt-3 border-t flex justify-between items-center ${isClosed ? "border-emerald-500/10" : "border-white/5"}`}>
         <span className={`text-[9px] font-medium ${isClosed ? "text-emerald-500/60" : "text-slate-600 group-hover:text-slate-500"}`}>{formatTimeAgo(lead.updatedAt)}</span>
         
         {lead.assignedTo ? (
             <div className={`flex items-center gap-1.5 bg-white/5 pr-2 pl-1 py-0.5 rounded-lg border border-white/5 transition-colors ${isClosed ? "opacity-70 bg-emerald-500/5 border-emerald-500/10" : ""}`}>
                 <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">{lead.assignedTo.name?.charAt(0).toUpperCase()}</div>
                 <span className="text-[9px] text-slate-400 font-bold max-w-[60px] truncate">{lead.assignedTo.name}</span>
             </div>
         ) : <div className="text-[9px] font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">Unassigned</div>}
      </div>
    </div>
  );
}

const ActionButton = ({ icon, label, href, color }) => {
    const colors = { blue: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20", purple: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20", green: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20" };
    return <a href={href} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all active:scale-[0.98] hover:-translate-y-0.5 font-bold text-xs cursor-pointer ${colors[color]}`}>{icon}<span className="tracking-wide hidden sm:inline">{label}</span></a>;
};

// 1. Pehle styles ko component ke bahar rakho
const scanlineStyles = `
  @keyframes scanline {
    0% { top: -5%; opacity: 0; }
    5% { opacity: 1; }
    95% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
`;

const PipelineSkeleton = () => (
  <div className="flex flex-col h-screen bg-[#020202] overflow-hidden relative font-mono">
    {/* 🚩 YE LINE ZAROORI HAI: Browser ko animation samjhane ke liye */}
    <style>{scanlineStyles}</style>

    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
    
    {/* Scanline Div */}
    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-[scanline_2.5s_linear_infinite] z-[100]"></div>
    
    <div className="px-8 py-5 flex-none border-b border-cyan-900/30 bg-[#020202]/90 backdrop-blur-xl z-20 relative">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
           <div className="space-y-2">
              <div className="h-8 w-48 bg-cyan-900/20 border-l-4 border-cyan-500 rounded-r"></div>
              <div className="h-3 w-32 bg-cyan-900/10 rounded"></div>
           </div>
           <div className="flex gap-4 w-full xl:w-auto">
              <div className="h-12 w-full xl:w-80 bg-cyan-900/10 border border-cyan-500/20 rounded-xl"></div>
              <div className="h-12 w-32 bg-cyan-500/20 border border-cyan-500/30 rounded-xl"></div>
           </div>
        </div>
    </div>
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 z-10">
        <div className="flex gap-6 h-full min-w-max pb-4">
           {[1, 2, 3, 4, 5].map((colIndex) => (
              <div key={colIndex} className="min-w-[320px] w-[320px] flex flex-col h-full rounded-3xl bg-[#050505] border border-cyan-800/30 shadow-xl relative overflow-hidden">
                 <div className="p-4 border-b border-cyan-900/30 flex justify-between items-center bg-cyan-900/5">
                    <div className="flex items-center gap-3">
                       <div className="h-4 w-24 bg-cyan-900/30 rounded"></div>
                       <div className="h-5 w-8 bg-cyan-900/20 rounded border border-cyan-500/10"></div>
                    </div>
                    <div className="h-4 w-4 bg-cyan-900/20 rounded"></div>
                 </div>
                 <div className="p-3 space-y-3 overflow-y-hidden flex-1">
                    {[1, 2, 3].map((cardIndex) => (
                       <div key={cardIndex} className="rounded-2xl p-4 bg-[#0A0A0C] border border-cyan-900/20 relative overflow-hidden group" style={{ opacity: 1 - (cardIndex * 0.15) }}>
                          <div className="flex gap-2 mb-3"><div className="h-4 w-16 bg-cyan-900/20 rounded border border-cyan-500/10"></div></div>
                          <div className="h-5 w-3/4 bg-cyan-900/30 rounded mb-3 border-l-2 border-cyan-500/50"></div>
                          <div className="space-y-2 mb-4"><div className="h-3 w-1/2 bg-cyan-900/10 rounded"></div><div className="h-3 w-2/3 bg-cyan-900/10 rounded"></div></div>
                          <div className="pt-3 border-t border-cyan-900/20 flex justify-between items-center"><div className="h-3 w-16 bg-cyan-900/20 rounded"></div><div className="h-6 w-6 rounded-full bg-cyan-900/20"></div></div>
                          {/* Shimmer effect inside cards */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{animationDelay: `${colIndex * 0.2}s`}}></div>
                       </div>
                    ))}
                 </div>
              </div>
           ))}
        </div>
    </div>
  </div>
);

export default Pipeline;