import { useState, useRef, useEffect, useMemo } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const DEFAULT_SUPPLIERS = ["Massa", "WBC", "Triad", "Pro Tech", "Home Depot"];

const INITIAL_MATERIALS = [
  { id: uid(), name: '2x4x92 5/8"', supplier: "Massa", unitPrice: 3.27, unit: "ea", supplierCode: "LBR-2492", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: '2x4x104 5/8"', supplier: "Massa", unitPrice: 4.27, unit: "ea", supplierCode: "LBR-24104", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x4x8", supplier: "Massa", unitPrice: 4.18, unit: "ea", supplierCode: "LBR-248", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x4x10", supplier: "Massa", unitPrice: 5.24, unit: "ea", supplierCode: "LBR-2410", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x4x12", supplier: "Massa", unitPrice: 6.98, unit: "ea", supplierCode: "LBR-2412", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x4x16", supplier: "Massa", unitPrice: 8.47, unit: "ea", supplierCode: "LBR-2416", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x4x20", supplier: "Massa", unitPrice: 12.09, unit: "ea", supplierCode: "LBR-2420", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x6x8", supplier: "Massa", unitPrice: 6.82, unit: "ea", supplierCode: "LBR-268", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x6x10", supplier: "Massa", unitPrice: 8.53, unit: "ea", supplierCode: "LBR-2610", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x6x12", supplier: "Massa", unitPrice: 10.24, unit: "ea", supplierCode: "LBR-2612", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: '2x6x116"', supplier: "Massa", unitPrice: 7.23, unit: "ea", supplierCode: "LBR-26116", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x6x16", supplier: "Massa", unitPrice: 13.65, unit: "ea", supplierCode: "LBR-2616", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x8x12", supplier: "Massa", unitPrice: 14.72, unit: "ea", supplierCode: "LBR-2812", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x8x16", supplier: "Massa", unitPrice: 19.63, unit: "ea", supplierCode: "LBR-2816", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x10x12", supplier: "Massa", unitPrice: 18.54, unit: "ea", supplierCode: "LBR-21012", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x10x16", supplier: "Massa", unitPrice: 24.72, unit: "ea", supplierCode: "LBR-21016", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x12x16", supplier: "Massa", unitPrice: 38.84, unit: "ea", supplierCode: "LBR-21216", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "2x12x20", supplier: "Massa", unitPrice: 60.80, unit: "ea", supplierCode: "LBR-21220", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "7/16 OSB", supplier: "Massa", unitPrice: 9.95, unit: "sheet", supplierCode: "SHT-716OSB", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "1/2 CDX Plywood", supplier: "Massa", unitPrice: 22.50, unit: "sheet", supplierCode: "SHT-12CDX", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "3/4 T&G Plywood", supplier: "Massa", unitPrice: 34.80, unit: "sheet", supplierCode: "SHT-34TG", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "3 Ply 2x6x12' Full Treat", supplier: "WBC", unitPrice: 70.26, unit: "ea", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-01-28" },
  { id: uid(), name: "6x6x10 Full Treat", supplier: "WBC", unitPrice: 42.50, unit: "ea", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-01-28" },
  { id: uid(), name: "5/8 Fire Rated Plywood", supplier: "WBC", unitPrice: 38.90, unit: "sheet", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-01" },
  { id: uid(), name: "R-19 Kraft Faced Batt", supplier: "WBC", unitPrice: 42.00, unit: "bag", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-01" },
  { id: uid(), name: "R-30 Kraft Faced Batt", supplier: "WBC", unitPrice: 58.00, unit: "bag", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-01" },
  { id: uid(), name: "R-13 Unfaced Batt", supplier: "WBC", unitPrice: 32.00, unit: "bag", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-01" },
  { id: uid(), name: "Triad Pacific Rib per sqft", supplier: "Triad", unitPrice: 1.20, unit: "sqft", supplierCode: "TR-PACRIB", priceSource: "Supplier", lastUpdated: "2026-02-01" },
  { id: uid(), name: "29ga Corrugated Metal 3x12", supplier: "Triad", unitPrice: 32.50, unit: "sheet", supplierCode: "TR-29COR", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: 'Ridge Cap 12"', supplier: "Triad", unitPrice: 18.75, unit: "ea", supplierCode: "TR-RC12", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "Drip Edge 10'", supplier: "Triad", unitPrice: 6.80, unit: "ea", supplierCode: "TR-DE10", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "LP SmartSide 4x8", supplier: "Pro Tech", unitPrice: 28.40, unit: "sheet", supplierCode: "PT-LPSS48", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "LP SmartSide 4x9", supplier: "Pro Tech", unitPrice: 32.10, unit: "sheet", supplierCode: "PT-LPSS49", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "House Wrap 9x150", supplier: "Pro Tech", unitPrice: 148.00, unit: "roll", supplierCode: "PT-HW9150", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "J-Channel 12'", supplier: "Pro Tech", unitPrice: 4.20, unit: "ea", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-01-15" },
  { id: uid(), name: "Ice & Water Shield", supplier: "Pro Tech", unitPrice: 89.00, unit: "roll", supplierCode: "PT-IWS", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "30# Felt Paper", supplier: "Pro Tech", unitPrice: 22.50, unit: "roll", supplierCode: "PT-30FP", priceSource: "Supplier", lastUpdated: "2026-02-15" },
  { id: uid(), name: "Simpson A35 Clip", supplier: "Home Depot", unitPrice: 1.85, unit: "ea", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-10" },
  { id: uid(), name: "Joist Hanger 2x6", supplier: "Home Depot", unitPrice: 3.42, unit: "ea", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-10" },
  { id: uid(), name: "Joist Hanger 2x8", supplier: "Home Depot", unitPrice: 3.98, unit: "ea", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-10" },
  { id: uid(), name: "16d Sinker Nails 50lb", supplier: "Home Depot", unitPrice: 89.00, unit: "box", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-10" },
  { id: uid(), name: '3" Deck Screws 5lb', supplier: "Home Depot", unitPrice: 32.00, unit: "box", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-10" },
  { id: uid(), name: "GRK RSS 5/16x3-1/8", supplier: "Home Depot", unitPrice: 68.00, unit: "box", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-01-20" },
  { id: uid(), name: "Concrete 80lb bag", supplier: "Home Depot", unitPrice: 5.80, unit: "ea", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-10" },
  { id: uid(), name: 'Rigid Foam 2" 4x8', supplier: "Home Depot", unitPrice: 28.50, unit: "sheet", supplierCode: "", priceSource: "Manual", lastUpdated: "2026-02-01" },
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
  sourceBadge: (src) => ({ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600, background: src === "Supplier" ? `${C.green}20` : `${C.amber}20`, color: src === "Supplier" ? C.green : C.amber }),
  supplierBadge: { fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600, background: `${C.purple}20`, color: C.purple },
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

const AddSupplierTab = ({ onAdd }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  const submit = () => { if (name.trim()) { onAdd(name.trim()); setName(""); setEditing(false); } };
  if (!editing) return <button style={{ ...s.tab(false), color: C.green, fontSize: 12 }} onClick={() => setEditing(true)}>+ Add Supplier</button>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px" }}>
      <input ref={inputRef} style={{ ...s.input, width: 140, padding: "5px 8px", fontSize: 12 }} placeholder="Supplier name..." value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setEditing(false); setName(""); } }} />
      <button style={{ ...s.btn, ...s.btnPrimary, ...s.btnSm, padding: "4px 10px" }} onClick={submit}>Add</button>
      <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm, padding: "4px 8px" }} onClick={() => { setEditing(false); setName(""); }}>✕</button>
    </div>
  );
};

export default function MaterialsDatabase({ materials: externalMaterials, onMaterialsChange }) {
  const [materials, setMaterials] = useState(externalMaterials || INITIAL_MATERIALS);
  const [suppliers, setSuppliers] = useState(DEFAULT_SUPPLIERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState(null);
  const [formData, setFormData] = useState({});
  const [sortCol, setSortCol] = useState("lastUpdated");
  const [sortDir, setSortDir] = useState("desc");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [deleteSupplierConfirm, setDeleteSupplierConfirm] = useState(null);
  const [sourceFilter, setSourceFilter] = useState("All");

  // Sync up to parent
  useEffect(() => { if (onMaterialsChange) onMaterialsChange(materials); }, [materials]);

  const addSupplier = (name) => {
    if (suppliers.some(s => s.toLowerCase() === name.toLowerCase())) return;
    setSuppliers(ss => [...ss, name]);
  };
  const deleteSupplier = (name) => {
    setSuppliers(ss => ss.filter(s => s !== name));
    setMaterials(ms => ms.filter(m => m.supplier !== name));
    if (activeTab === name) setActiveTab("All");
    setDeleteSupplierConfirm(null);
  };

  const filtered = useMemo(() => {
    let list = materials;
    if (activeTab !== "All") list = list.filter(m => m.supplier === activeTab);
    if (sourceFilter !== "All") list = list.filter(m => m.priceSource === sourceFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.supplier.toLowerCase().includes(q) || (m.supplierCode || "").toLowerCase().includes(q));
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
  }, [materials, search, activeTab, sortCol, sortDir, sourceFilter]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };
  const sortArrow = (col) => sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const supplierCounts = useMemo(() => {
    const counts = { All: materials.length };
    suppliers.forEach(sup => { counts[sup] = materials.filter(m => m.supplier === sup).length; });
    return counts;
  }, [materials, suppliers]);

  const supplierSourceCount = materials.filter(m => m.priceSource === "Supplier").length;
  const manualSourceCount = materials.filter(m => m.priceSource === "Manual").length;

  const emptyMaterial = () => ({ name: "", supplier: suppliers[0] || "", unitPrice: 0, unit: "ea", supplierCode: "", priceSource: "Manual" });
  const openAddModal = () => { setEditingMat(null); setFormData({ ...emptyMaterial(), supplier: activeTab !== "All" ? activeTab : (suppliers[0] || "") }); setModalOpen(true); };
  const openEditModal = (mat) => { setEditingMat(mat); setFormData({ ...mat }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingMat(null); };
  const updateForm = (field, value) => setFormData(f => ({ ...f, [field]: value }));
  const saveMaterial = () => {
    if (!formData.name.trim()) return;
    const now = new Date().toISOString().slice(0, 10);
    if (editingMat) setMaterials(ms => ms.map(m => m.id === editingMat.id ? { ...formData, lastUpdated: now } : m));
    else setMaterials(ms => [...ms, { ...formData, id: uid(), lastUpdated: now }]);
    closeModal();
  };
  const deleteMaterial = (id) => { setMaterials(ms => ms.filter(m => m.id !== id)); setDeleteConfirm(null); };

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <h1 style={s.h1}>Materials Database</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setUploadModal(true)}>⬆ Upload Supplier Pricing</button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={openAddModal}>+ Add Material</button>
        </div>
      </div>
      <div style={s.tabs}>
        <button style={s.tab(activeTab === "All")} onClick={() => setActiveTab("All")}>
          All<span style={s.badge(activeTab === "All")}>{supplierCounts.All || 0}</span>
        </button>
        {suppliers.map(sup => (
          <button key={sup} style={s.tab(activeTab === sup)} onClick={() => setActiveTab(sup)}>
            {sup}<span style={s.badge(activeTab === sup)}>{supplierCounts[sup] || 0}</span>
            {activeTab === sup && (
              <span style={{ marginLeft: 6, fontSize: 11, color: C.red, cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); setDeleteSupplierConfirm(sup); }}>✕</span>
            )}
          </button>
        ))}
        <AddSupplierTab onAdd={addSupplier} />
      </div>
      <div style={s.content}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ ...s.searchBar, width: 320 }}>
            <span style={{ color: C.muted, fontSize: 14 }}>🔍</span>
            <input style={{ background: "none", border: "none", outline: "none", color: C.text, fontFamily: "inherit", fontSize: 13, flex: 1 }}
              placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <span style={{ color: C.muted, cursor: "pointer", fontSize: 14 }} onClick={() => setSearch("")}>✕</span>}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted, marginRight: 4 }}>Source:</span>
            {[["All", `All (${materials.length})`, null], ["Supplier", `Auto-priced (${supplierSourceCount})`, C.green], ["Manual", `Manual (${manualSourceCount})`, C.amber]].map(([key, label, dotColor]) => (
              <button key={key} style={{ ...s.btn, ...s.btnSm, fontSize: 12, fontWeight: 500, background: sourceFilter === key ? (dotColor ? `${dotColor}18` : `${C.accent}15`) : "transparent", color: sourceFilter === key ? (dotColor || C.accent) : C.dim, border: `1px solid ${sourceFilter === key ? (dotColor ? `${dotColor}40` : `${C.accent}40`) : C.border}`, borderRadius: 20, padding: "4px 12px" }} onClick={() => setSourceFilter(sourceFilter === key ? "All" : key)}>
                {dotColor && <span style={{ width: 6, height: 6, borderRadius: 3, background: dotColor, display: "inline-block" }} />}
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                {[["name", "Item"], ["supplier", "Supplier"], ["unitPrice", "Price"], ["unit", "Unit"], ["supplierCode", "Supplier Code"], ["priceSource", "Source"], ["lastUpdated", "Last Updated"]].map(([col, label]) => (
                  <th key={col} style={{ ...s.th, cursor: "pointer", userSelect: "none", textAlign: col === "unitPrice" ? "right" : "left" }} onClick={() => toggleSort(col)}>
                    {label}{sortArrow(col)}
                  </th>
                ))}
                <th style={{ ...s.th, width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ ...s.td, textAlign: "center", padding: 40, color: C.muted }}>
                  {search ? `No materials matching "${search}"` : "No materials yet"}
                </td></tr>
              )}
              {filtered.map(mat => (
                <tr key={mat.id} onMouseEnter={(e) => e.currentTarget.style.background = C.hover} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...s.td, fontWeight: 500 }}>{mat.name}</td>
                  <td style={s.td}><span style={s.supplierBadge}>{mat.supplier}</span></td>
                  <td style={{ ...s.td, textAlign: "right", ...s.mono }}>{fmt(mat.unitPrice)}</td>
                  <td style={s.td}>{mat.unit}</td>
                  <td style={{ ...s.td, ...s.mono, color: mat.supplierCode ? C.dim : C.muted, fontSize: 11 }}>{mat.supplierCode || "—"}</td>
                  <td style={s.td}><span style={s.sourceBadge(mat.priceSource)}>{mat.priceSource}</span></td>
                  <td style={{ ...s.td, color: C.dim }}>{mat.lastUpdated}</td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => openEditModal(mat)}>Edit</button>
                      <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm, color: C.red }} onClick={() => setDeleteConfirm(mat.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: C.muted, textAlign: "right" }}>
          Showing {filtered.length} of {materials.length} material{materials.length !== 1 ? "s" : ""}
        </div>
      </div>

      {modalOpen && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{editingMat ? "Edit Material" : "Add New Material"}</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={closeModal}>✕</button>
            </div>
            <div style={s.modalBody}>
              <Field label="Item Name *" field="name" placeholder="e.g., 2x4x10" value={formData.name} onChange={updateForm} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Supplier *" field="supplier" value={formData.supplier} onChange={updateForm}>
                  <select style={s.input} value={formData.supplier || ""} onChange={(e) => updateForm("supplier", e.target.value)}>
                    {suppliers.map(sup => <option key={sup} value={sup}>{sup}</option>)}
                  </select>
                </Field>
                <Field label="Unit" field="unit" placeholder="ea, sheet, roll, sqft..." value={formData.unit} onChange={updateForm} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Unit Price" field="unitPrice" type="number" placeholder="0.00" value={formData.unitPrice} onChange={(f, v) => updateForm(f, parseFloat(v) || 0)} />
                <Field label="Price Source" field="priceSource" value={formData.priceSource} onChange={updateForm}>
                  <select style={s.input} value={formData.priceSource || "Manual"} onChange={(e) => updateForm("priceSource", e.target.value)}>
                    <option value="Supplier">Supplier</option>
                    <option value="Manual">Manual</option>
                  </select>
                </Field>
              </div>
              <Field label="Supplier Code" field="supplierCode" placeholder="e.g., LBR-2410" value={formData.supplierCode} onChange={updateForm} />
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={closeModal}>Cancel</button>
              <button style={{ ...s.btn, ...s.btnPrimary, opacity: formData.name?.trim() ? 1 : 0.5 }} onClick={saveMaterial}>
                {editingMat ? "Save Changes" : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modal, width: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Delete Material?</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 14, color: C.dim, margin: 0, lineHeight: 1.6 }}>
                Delete <strong style={{ color: C.text }}>{materials.find(m => m.id === deleteConfirm)?.name}</strong>? This won't affect existing project estimates.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ ...s.btn, background: C.red, color: "#fff" }} onClick={() => deleteMaterial(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteSupplierConfirm && (
        <div style={s.overlay} onClick={() => setDeleteSupplierConfirm(null)}>
          <div style={{ ...s.modal, width: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Remove Supplier?</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setDeleteSupplierConfirm(null)}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 14, color: C.dim, margin: 0, lineHeight: 1.6 }}>
                Remove <strong style={{ color: C.text }}>{deleteSupplierConfirm}</strong> and all <strong style={{ color: C.text }}>{supplierCounts[deleteSupplierConfirm] || 0}</strong> associated materials? This cannot be undone.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setDeleteSupplierConfirm(null)}>Cancel</button>
              <button style={{ ...s.btn, background: C.red, color: "#fff" }} onClick={() => deleteSupplier(deleteSupplierConfirm)}>Remove Supplier</button>
            </div>
          </div>
        </div>
      )}

      {uploadModal && (
        <div style={s.overlay} onClick={() => setUploadModal(false)}>
          <div style={{ ...s.modal, width: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Upload Supplier Pricing</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setUploadModal(false)}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
                <div style={{ fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 4 }}>Drop supplier Excel file here</div>
                <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>or click to browse — accepts .xlsx, .xls, .csv</div>
                <button style={{ ...s.btn, ...s.btnSecondary }}>Browse Files</button>
              </div>
              <div style={{ marginTop: 12, padding: 12, background: `${C.amber}10`, borderRadius: 6, fontSize: 12, color: C.amber }}>
                ⚠ This feature will be fully functional once connected to the backend.
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setUploadModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
