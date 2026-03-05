import { useState, useRef, useEffect, useMemo } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const DEFAULT_CATEGORIES = ["Labor", "Equipment Rentals", "Subcontractors", "Quick Pricing", "Other"];

const INITIAL_RATES = [
  { id: uid(), name: "Logan per day $20", category: "Labor", supplier: "", rate: 250.00, unit: "day", notes: "8hr day at $20/hr + burden", lastUpdated: "2026-02-10" },
  { id: uid(), name: "Elias per day $23.50", category: "Labor", supplier: "", rate: 293.75, unit: "day", notes: "8hr day at $23.50/hr + burden", lastUpdated: "2026-02-10" },
  { id: uid(), name: "Zook per day $40", category: "Labor", supplier: "", rate: 500.00, unit: "day", notes: "8hr day at $40/hr + burden", lastUpdated: "2026-02-10" },
  { id: uid(), name: "Logan per hour", category: "Labor", supplier: "", rate: 31.25, unit: "hour", notes: "", lastUpdated: "2026-02-10" },
  { id: uid(), name: "Elias per hour", category: "Labor", supplier: "", rate: 36.72, unit: "hour", notes: "", lastUpdated: "2026-02-10" },
  { id: uid(), name: "Zook per hour", category: "Labor", supplier: "", rate: 62.50, unit: "hour", notes: "", lastUpdated: "2026-02-10" },
  { id: uid(), name: "Framing Crew (3 man)", category: "Labor", supplier: "", rate: 1043.75, unit: "day", notes: "Logan + Elias + Zook full day", lastUpdated: "2026-02-10" },
  { id: uid(), name: "Helper / Laborer", category: "Labor", supplier: "", rate: 200.00, unit: "day", notes: "General labor, 8hr day", lastUpdated: "2026-01-15" },
  { id: uid(), name: "Concrete Crew", category: "Labor", supplier: "", rate: 1800.00, unit: "day", notes: "4 man crew for pours", lastUpdated: "2026-01-20" },
  { id: uid(), name: "Roofing Sub per sqft", category: "Subcontractors", supplier: "", rate: 3.50, unit: "sqft", notes: "Sub rate for metal roofing install", lastUpdated: "2026-02-01" },
  { id: uid(), name: "Skytrack Day", category: "Equipment Rentals", supplier: "Hertz Equip", rate: 400.00, unit: "day", notes: "", lastUpdated: "2026-02-15" },
  { id: uid(), name: "Skytrack Week", category: "Equipment Rentals", supplier: "Hertz Equip", rate: 750.00, unit: "week", notes: "Better rate for week rental", lastUpdated: "2026-02-15" },
  { id: uid(), name: "Skytrack Month", category: "Equipment Rentals", supplier: "Hertz Equip", rate: 2200.00, unit: "month", notes: "", lastUpdated: "2026-02-15" },
  { id: uid(), name: "Skid Steer Day", category: "Equipment Rentals", supplier: "Hertz Equip", rate: 200.00, unit: "day", notes: "", lastUpdated: "2026-02-15" },
  { id: uid(), name: "Skid Steer Week", category: "Equipment Rentals", supplier: "Hertz Equip", rate: 650.00, unit: "week", notes: "", lastUpdated: "2026-02-15" },
  { id: uid(), name: "Crane per hr", category: "Equipment Rentals", supplier: "Vantassel", rate: 150.00, unit: "hour", notes: "2hr minimum", lastUpdated: "2026-01-28" },
  { id: uid(), name: "Crane half day (4hr)", category: "Equipment Rentals", supplier: "Vantassel", rate: 500.00, unit: "ea", notes: "4hr block", lastUpdated: "2026-01-28" },
  { id: uid(), name: "Excavator Day", category: "Equipment Rentals", supplier: "Hertz Equip", rate: 350.00, unit: "day", notes: "", lastUpdated: "2026-02-15" },
  { id: uid(), name: "Compactor Day", category: "Equipment Rentals", supplier: "Hertz Equip", rate: 125.00, unit: "day", notes: "", lastUpdated: "2026-02-15" },
  { id: uid(), name: "Generator Day", category: "Equipment Rentals", supplier: "Home Depot", rate: 85.00, unit: "day", notes: "For remote site power", lastUpdated: "2026-02-01" },
  { id: uid(), name: "Concrete Sub (flatwork)", category: "Subcontractors", supplier: "Bitterroot Concrete", rate: 6.50, unit: "sqft", notes: "Flatwork pour + finish", lastUpdated: "2026-02-05" },
  { id: uid(), name: "Electrician Rough-In", category: "Subcontractors", supplier: "Valley Electric", rate: 85.00, unit: "hour", notes: "Rough-in wiring, panel, circuits", lastUpdated: "2026-01-20" },
  { id: uid(), name: "Plumber Rough-In", category: "Subcontractors", supplier: "Missoula Plumbing", rate: 95.00, unit: "hour", notes: "", lastUpdated: "2026-01-20" },
  { id: uid(), name: "Dirt Work / Grading", category: "Subcontractors", supplier: "Clark Excavation", rate: 125.00, unit: "hour", notes: "Dozer + operator", lastUpdated: "2026-02-01" },
  { id: uid(), name: "Porta Potty Monthly", category: "Other", supplier: "Valley Waste", rate: 175.00, unit: "month", notes: "", lastUpdated: "2026-01-15" },
  { id: uid(), name: "Dumpster 20yd", category: "Other", supplier: "Valley Waste", rate: 450.00, unit: "ea", notes: "Drop off + pickup + disposal", lastUpdated: "2026-01-15" },
  { id: uid(), name: "Delivery Fee (local)", category: "Other", supplier: "", rate: 75.00, unit: "ea", notes: "Within 30mi of Missoula", lastUpdated: "2026-02-01" },
  { id: uid(), name: "Delivery Fee (remote)", category: "Other", supplier: "", rate: 150.00, unit: "ea", notes: "30-60mi from Missoula", lastUpdated: "2026-02-01" },
  { id: uid(), name: "Survey / Layout", category: "Other", supplier: "Bitterroot Survey", rate: 800.00, unit: "ea", notes: "Basic lot survey + stake", lastUpdated: "2026-01-10" },
];

const C = {
  bg: "#0e1117", raised: "#161b22", card: "#1c2129", hover: "#252c37",
  input: "#0d1117", border: "#2d333b", text: "#e6edf3", dim: "#8b949e", muted: "#484f58",
  accent: "#4a7cff", green: "#3fb950", amber: "#d29922", red: "#f85149",
  purple: "#a371f7", orange: "#db6d28",
};
const s = {
  page: { background: C.bg, color: C.text, fontFamily: "'Segoe UI',system-ui,sans-serif", minHeight: "100vh", fontSize: 14 },
  topbar: { background: C.raised, borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 },
  h1: { fontSize: 18, fontWeight: 600, margin: 0 },
  tabs: { display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, padding: "0 24px", background: C.raised, flexWrap: "wrap" },
  tab: (active) => ({ padding: "12px 18px", fontSize: 13, fontWeight: 500, color: active ? C.accent : C.dim, cursor: "pointer", background: "none", border: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: active ? C.accent : "transparent", fontFamily: "inherit", transition: "all .15s" }),
  badge: (active) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "1px 7px", borderRadius: 10, fontSize: 11, fontWeight: 600, marginLeft: 6, background: active ? `${C.accent}20` : `${C.muted}30`, color: active ? C.accent : C.muted }),
  content: { padding: "20px 24px" },
  btn: { padding: "7px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 },
  btnPrimary: { background: C.accent, color: "#fff" },
  btnSecondary: { background: C.hover, color: C.text, border: `1px solid ${C.border}` },
  btnGhost: { background: "transparent", color: C.dim },
  btnSm: { padding: "5px 10px", fontSize: 12 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, background: C.raised },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: `1px solid ${C.border}` },
  input: { background: C.input, border: `1px solid ${C.border}`, borderRadius: 4, padding: "8px 12px", color: C.text, fontFamily: "inherit", fontSize: 14, outline: "none", width: "100%" },
  mono: { fontFamily: "'SF Mono','Cascadia Code',monospace", fontSize: 12 },
  searchBar: { display: "flex", alignItems: "center", gap: 8, background: C.input, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 14px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, width: 520, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" },
  modalHeader: { padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
  modalBody: { padding: 24 },
  modalFooter: { padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 },
  formGroup: { marginBottom: 18 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: C.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  catBadge: (cat) => ({
    fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600,
    background: cat === "Labor" ? `${C.orange}20` : cat === "Equipment Rentals" ? `${C.purple}20` : cat === "Subcontractors" ? `${C.green}20` : cat === "Quick Pricing" ? `${C.amber}20` : `${C.accent}20`,
    color: cat === "Labor" ? C.orange : cat === "Equipment Rentals" ? C.purple : cat === "Subcontractors" ? C.green : cat === "Quick Pricing" ? C.amber : C.accent,
  }),
};

const Field = ({ label, field, type = "text", placeholder = "", value, onChange, textarea = false, children }) => (
  <div style={s.formGroup}>
    <label style={s.label}>{label}</label>
    {children ? children : textarea ? (
      <textarea style={{ ...s.input, resize: "vertical", minHeight: 60 }} rows={3} placeholder={placeholder} value={value || ""} onChange={(e) => onChange(field, e.target.value)} />
    ) : (
      <input style={s.input} type={type} placeholder={placeholder} value={value || ""} onChange={(e) => onChange(field, e.target.value)} />
    )}
  </div>
);

const AddCategoryTab = ({ onAdd }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  const submit = () => { if (name.trim()) { onAdd(name.trim()); setName(""); setEditing(false); } };
  if (!editing) return <button style={{ ...s.tab(false), color: C.green, fontSize: 12 }} onClick={() => setEditing(true)}>+ Add Category</button>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px" }}>
      <input ref={inputRef} style={{ ...s.input, width: 140, padding: "5px 8px", fontSize: 12 }} placeholder="Category name..." value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setEditing(false); setName(""); } }} />
      <button style={{ ...s.btn, ...s.btnPrimary, ...s.btnSm, padding: "4px 10px" }} onClick={submit}>Add</button>
      <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm, padding: "4px 8px" }} onClick={() => { setEditing(false); setName(""); }}>✕</button>
    </div>
  );
};

export default function LaborEquipmentRates({ rates: externalRates, onRatesChange }) {
  const [rates, setRates] = useState(externalRates || INITIAL_RATES);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({});
  const [sortCol, setSortCol] = useState("lastUpdated");
  const [sortDir, setSortDir] = useState("desc");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteCatConfirm, setDeleteCatConfirm] = useState(null);

  // Sync rates up to parent
  useEffect(() => { if (onRatesChange) onRatesChange(rates); }, [rates]);

  const addCategory = (name) => {
    if (categories.some(c => c.toLowerCase() === name.toLowerCase())) return;
    setCategories(cs => [...cs, name]);
  };
  const deleteCategory = (name) => {
    setCategories(cs => cs.filter(c => c !== name));
    setRates(rs => rs.filter(r => r.category !== name));
    if (activeTab === name) setActiveTab("All");
    setDeleteCatConfirm(null);
  };

  const filtered = useMemo(() => {
    let list = rates;
    if (activeTab !== "All") list = list.filter(r => r.category === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.supplier.toLowerCase().includes(q) || r.notes.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [rates, search, activeTab, sortCol, sortDir]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };
  const sortArrow = (col) => sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const catCounts = useMemo(() => {
    const counts = { All: rates.length };
    categories.forEach(cat => { counts[cat] = rates.filter(r => r.category === cat).length; });
    return counts;
  }, [rates, categories]);

  const emptyRate = () => ({ name: "", category: categories[0] || "Labor", supplier: "", rate: 0, unit: "day", notes: "" });
  const openAddModal = () => { setEditingRate(null); setFormData({ ...emptyRate(), category: activeTab !== "All" ? activeTab : (categories[0] || "Labor") }); setModalOpen(true); };
  const openEditModal = (rate) => { setEditingRate(rate); setFormData({ ...rate }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingRate(null); };
  const updateForm = (field, value) => setFormData(f => ({ ...f, [field]: value }));
  const saveRate = () => {
    if (!formData.name.trim()) return;
    const now = new Date().toISOString().slice(0, 10);
    if (editingRate) setRates(rs => rs.map(r => r.id === editingRate.id ? { ...formData, lastUpdated: now } : r));
    else setRates(rs => [...rs, { ...formData, id: uid(), lastUpdated: now }]);
    closeModal();
  };
  const deleteRate = (id) => { setRates(rs => rs.filter(r => r.id !== id)); setDeleteConfirm(null); };

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <h1 style={s.h1}>Labor & Equipment Rates</h1>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={openAddModal}>+ Add Rate</button>
      </div>
      <div style={s.tabs}>
        <button style={s.tab(activeTab === "All")} onClick={() => setActiveTab("All")}>
          All<span style={s.badge(activeTab === "All")}>{catCounts.All || 0}</span>
        </button>
        {categories.map(cat => (
          <button key={cat} style={s.tab(activeTab === cat)} onClick={() => setActiveTab(cat)}>
            {cat}<span style={s.badge(activeTab === cat)}>{catCounts[cat] || 0}</span>
            {activeTab === cat && (
              <span style={{ marginLeft: 6, fontSize: 11, color: C.red, cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); setDeleteCatConfirm(cat); }} title="Remove category">✕</span>
            )}
          </button>
        ))}
        <AddCategoryTab onAdd={addCategory} />
      </div>
      <div style={s.content}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ ...s.searchBar, width: 320 }}>
            <span style={{ color: C.muted, fontSize: 14 }}>🔍</span>
            <input style={{ background: "none", border: "none", outline: "none", color: C.text, fontFamily: "inherit", fontSize: 13, flex: 1 }}
              placeholder="Search rates..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <span style={{ color: C.muted, cursor: "pointer", fontSize: 14 }} onClick={() => setSearch("")}>✕</span>}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12, color: C.dim }}>
            <span style={{ color: C.orange }}>● {rates.filter(r => r.category === "Labor").length} labor</span>
            <span style={{ color: C.purple }}>● {rates.filter(r => r.category === "Equipment Rentals").length} equipment</span>
            <span style={{ color: C.green }}>● {rates.filter(r => r.category === "Subcontractors").length} subs</span>
          </div>
        </div>
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                {[["name", "Item"], ["category", "Category"], ["supplier", "Supplier / Source"], ["rate", "Rate"], ["unit", "Unit"], ["notes", "Notes"], ["lastUpdated", "Last Updated"]].map(([col, label]) => (
                  <th key={col} style={{ ...s.th, cursor: "pointer", userSelect: "none", textAlign: col === "rate" ? "right" : "left" }} onClick={() => toggleSort(col)}>
                    {label}{sortArrow(col)}
                  </th>
                ))}
                <th style={{ ...s.th, width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ ...s.td, textAlign: "center", padding: 40, color: C.muted }}>
                  {search ? `No rates matching "${search}"` : "No rates yet"}
                </td></tr>
              )}
              {filtered.map(rate => (
                <tr key={rate.id} onMouseEnter={(e) => e.currentTarget.style.background = C.hover} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...s.td, fontWeight: 500 }}>{rate.name}</td>
                  <td style={s.td}><span style={s.catBadge(rate.category)}>{rate.category}</span></td>
                  <td style={{ ...s.td, color: rate.supplier ? C.dim : C.muted }}>{rate.supplier || "—"}</td>
                  <td style={{ ...s.td, textAlign: "right", ...s.mono, fontWeight: 600 }}>{fmt(rate.rate)}</td>
                  <td style={s.td}>{rate.unit}</td>
                  <td style={{ ...s.td, color: C.dim, fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rate.notes || "—"}</td>
                  <td style={{ ...s.td, color: C.dim }}>{rate.lastUpdated}</td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => openEditModal(rate)}>Edit</button>
                      <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm, color: C.red }} onClick={() => setDeleteConfirm(rate.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: C.muted, textAlign: "right" }}>
          Showing {filtered.length} of {rates.length} rate{rates.length !== 1 ? "s" : ""}
        </div>
      </div>

      {modalOpen && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{editingRate ? "Edit Rate" : "Add New Rate"}</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={closeModal}>✕</button>
            </div>
            <div style={s.modalBody}>
              <Field label="Item Name *" field="name" placeholder="e.g., Skytrack Day, Logan per day" value={formData.name} onChange={updateForm} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Category *" field="category" value={formData.category} onChange={updateForm}>
                  <select style={s.input} value={formData.category || categories[0]} onChange={(e) => updateForm("category", e.target.value)}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </Field>
                <Field label="Supplier / Source" field="supplier" placeholder="e.g., Hertz Equip" value={formData.supplier} onChange={updateForm} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Rate" field="rate" type="number" placeholder="0.00" value={formData.rate} onChange={(f, v) => updateForm(f, parseFloat(v) || 0)} />
                <Field label="Unit" field="unit" placeholder="hour, day, week..." value={formData.unit} onChange={updateForm} />
              </div>
              <Field label="Notes" field="notes" placeholder="Any notes about this rate..." textarea value={formData.notes} onChange={updateForm} />
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={closeModal}>Cancel</button>
              <button style={{ ...s.btn, ...s.btnPrimary, opacity: formData.name?.trim() ? 1 : 0.5 }} onClick={saveRate}>
                {editingRate ? "Save Changes" : "Add Rate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modal, width: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Delete Rate?</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 14, color: C.dim, margin: 0, lineHeight: 1.6 }}>
                Delete <strong style={{ color: C.text }}>{rates.find(r => r.id === deleteConfirm)?.name}</strong>? This won't affect existing project estimates.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ ...s.btn, background: C.red, color: "#fff" }} onClick={() => deleteRate(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteCatConfirm && (
        <div style={s.overlay} onClick={() => setDeleteCatConfirm(null)}>
          <div style={{ ...s.modal, width: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Remove Category?</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setDeleteCatConfirm(null)}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 14, color: C.dim, margin: 0, lineHeight: 1.6 }}>
                Remove <strong style={{ color: C.text }}>{deleteCatConfirm}</strong> and all <strong style={{ color: C.text }}>{catCounts[deleteCatConfirm] || 0}</strong> associated rates? This cannot be undone.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setDeleteCatConfirm(null)}>Cancel</button>
              <button style={{ ...s.btn, background: C.red, color: "#fff" }} onClick={() => deleteCategory(deleteCatConfirm)}>Remove Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
