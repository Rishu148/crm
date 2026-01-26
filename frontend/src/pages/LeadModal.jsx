import { useState, useEffect, useRef } from "react";
import { 
  X, Phone, Mail, MessageCircle, 
  Globe, Edit3, Save, Trash2,
  ShieldCheck, Activity, FileText, LayoutGrid, ChevronDown, Check, AlertTriangle, Lock
} from "lucide-react";

// Helper Functions
const formatTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

export default function LeadModal({ lead, onClose, onUpdate, onDelete, currentUser }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Status Dropdown State
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const statusMenuRef = useRef(null);

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Initial Data Load
    useEffect(() => {
        if (lead) {
            setFormData({ ...lead });
        }
    }, [lead]);

    // Click Outside Status Menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
                setShowStatusMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!lead) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await onUpdate(lead._id, formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        const updatedData = { ...formData, status: newStatus };
        setFormData(updatedData);
        setShowStatusMenu(false);
        try {
            await onUpdate(lead._id, { status: newStatus });
        } catch (error) {
            setFormData({ ...formData });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "New": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "Contacted": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "Interested": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "Closed": return "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.3)]";
            case "Lost": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default: return "bg-slate-800 text-slate-400 border-slate-700";
        }
    };

    const allStatuses = ["New", "Contacted", "Interested", "Closed", "Lost"];
    const isClosed = formData.status === "Closed";

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm animate-in fade-in duration-200"></div>

            <div 
                className="relative w-full max-w-xl h-[600px] bg-[#0A0A0C] border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* 🔴 DELETE CONFIRMATION OVERLAY */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-[#0A0A0C] border border-red-500/30 p-6 rounded-2xl w-80 text-center shadow-2xl shadow-red-900/20 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                <AlertTriangle size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Delete Opportunity?</h3>
                            <p className="text-slate-500 text-xs mb-6 px-2">
                                This action is permanent and cannot be undone. Are you sure?
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/5 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => { onDelete(lead._id); onClose(); }} 
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="px-6 py-6 border-b border-white/5 bg-[#0A0A0C]/90 backdrop-blur-md shrink-0 relative z-20">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4 w-full">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20 shrink-0">
                                {lead.name?.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1.5">
                                {isEditing ? (
                                    <input 
                                        className="w-full bg-[#050505] border border-indigo-500/50 rounded-lg px-2 py-1 text-white font-bold text-xl focus:outline-none transition-all mb-1"
                                        value={formData.name || ""} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="Name"
                                    />
                                ) : (
                                    <h2 className="text-xl font-bold text-white leading-tight truncate">{lead.name}</h2>
                                )}
                                
                                <div className="flex items-center gap-3">
                                    
                                    {/* 🔥 LOGIC: If Closed -> Locked Badge. If Open -> Dropdown */}
                                    {isClosed ? (
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border flex items-center gap-1.5 cursor-not-allowed opacity-90 ${getStatusColor("Closed")}`}>
                                            Closed <Lock size={10}/>
                                        </div>
                                    ) : (
                                        <div className="relative" ref={statusMenuRef}>
                                            <button 
                                                onClick={() => setShowStatusMenu(!showStatusMenu)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border flex items-center gap-1.5 transition-all hover:brightness-125 active:scale-95 cursor-pointer ${getStatusColor(formData.status)}`}
                                            >
                                                {formData.status}
                                                <ChevronDown size={10} className={`transition-transform duration-200 ${showStatusMenu ? 'rotate-180' : ''}`}/>
                                            </button>

                                            {showStatusMenu && (
                                                <div className="absolute top-full left-0 mt-2 w-32 bg-[#0F0F12] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                                    {allStatuses.map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(status)}
                                                            className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-white/5 flex items-center justify-between transition-colors cursor-pointer ${
                                                                status === formData.status ? "text-white bg-white/5" : "text-slate-400"
                                                            }`}
                                                        >
                                                            <span className={status === "Closed" ? "text-green-400" : ""}>{status}</span>
                                                            {status === formData.status && <Check size={10} className="text-indigo-500"/>}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                        <Globe size={10}/> {lead.source || "Manual"}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
                            <X size={18}/>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-[#0A0A0C] px-6 shrink-0 relative z-10">
                    <button onClick={() => setActiveTab("overview")} className={`mr-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTab === "overview" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-white"}`}>Overview</button>
                    <button onClick={() => setActiveTab("activity")} className={`mr-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTab === "activity" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-white"}`}>Timeline</button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0C] custom-scrollbar relative z-0">
                    
                    {activeTab === "overview" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
                            {/* Contact Box */}
                            <div className="bg-[#0F0F12] border border-white/5 rounded-2xl p-5 relative group">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={12} className="text-indigo-500"/> Identity
                                    </h3>
                                    {!isEditing && <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 cursor-pointer"><Edit3 size={10}/> Edit</button>}
                                </div>

                                <div className="space-y-4">
                                    <InfoField label="Phone" icon={<Phone size={10}/>} value={formData.phone} isEditing={isEditing} onChange={(v) => setFormData({...formData, phone: v})} />
                                    <InfoField label="Email" icon={<Mail size={10}/>} value={formData.email} isEditing={isEditing} onChange={(v) => setFormData({...formData, email: v})} />
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0F0F12] p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2"><LayoutGrid size={14} className="text-blue-400"/><p className="text-[10px] font-bold text-slate-500 uppercase">Agent</p></div>
                                    <div className="flex items-center gap-2 text-sm text-white pl-1">
                                        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                                            {lead.assignedTo?.name?.charAt(0) || "U"}
                                        </div>
                                        <span className="truncate text-xs">{lead.assignedTo?.name || "Unassigned"}</span>
                                    </div>
                                </div>
                                <div className="bg-[#0F0F12] p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2"><FileText size={14} className="text-purple-400"/><p className="text-[10px] font-bold text-slate-500 uppercase">System ID</p></div>
                                    <div className="text-sm text-slate-300 font-mono pl-1">#{lead._id.slice(-6).toUpperCase()}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "activity" && (
                        <div className="space-y-8 relative pl-4 border-l-2 border-white/5 ml-2 animate-in fade-in slide-in-from-right-4 duration-300 ease-out h-full">
                            <TimelineItem 
                                icon={<Activity size={12}/>} 
                                color="indigo" 
                                title={`Status is ${lead.status}`} 
                                time={formatTimeAgo(lead.updatedAt)} 
                            />
                            <TimelineItem 
                                icon={<Globe size={12}/>} 
                                color="emerald" 
                                title={`Source: ${lead.source}`} 
                                time={formatTimeAgo(lead.createdAt)} 
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-white/5 bg-[#0A0A0C]/90 backdrop-blur-lg flex justify-between items-center gap-4 shrink-0 relative z-20">
                    {isEditing ? (
                        <div className="flex gap-3 w-full justify-end">
                            <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs transition-all cursor-pointer">Cancel</button>
                            <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer">
                                {loading ? "Saving..." : <><Save size={14}/> Save Changes</>}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-3 flex-1">
                                <ActionButton icon={<Phone size={16} />} label="Call" href={`tel:${lead.phone}`} color="blue" />
                                <ActionButton icon={<Mail size={16} />} label="Email" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}`} color="purple" />
                                <ActionButton icon={<MessageCircle size={16} />} label="Chat" href={`https://wa.me/${lead.phone}`} color="green" />
                            </div>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)} 
                                className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20 hover:border-red-500/40 active:scale-95 cursor-pointer" 
                                title="Delete Deal"
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-components
const InfoField = ({ label, icon, value, isEditing, onChange }) => (
    <div>
        <label className="text-[10px] uppercase font-bold text-slate-600 mb-1 flex items-center gap-1.5">{icon} {label}</label>
        {isEditing ? (
            <input className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" value={value || ""} onChange={(e) => onChange(e.target.value)} />
        ) : (
            <div className="text-sm text-slate-300 font-medium truncate pl-1">{value || "-"}</div>
        )}
    </div>
);

const ActionButton = ({ icon, label, href, color }) => {
    const colors = { 
        blue: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20", 
        purple: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20", 
        green: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20" 
    };
    return <a href={href} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all active:scale-[0.98] hover:-translate-y-0.5 font-bold text-xs cursor-pointer ${colors[color]}`}>{icon}<span className="tracking-wide hidden sm:inline">{label}</span></a>;
};

const TimelineItem = ({ icon, color, title, time }) => (
    <div className="relative group">
        <div className={`absolute -left-[23px] top-1 w-3 h-3 bg-${color}-500 rounded-full border-2 border-[#0A0A0C] shadow-sm`}></div>
        <p className="text-sm text-slate-300">{title}</p>
        <p className="text-[10px] text-slate-500 mt-1">{time}</p>
    </div>
);