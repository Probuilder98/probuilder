import { useState, useMemo } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const INITIAL_PROJECTS = [
  { id: uid(), name: "Missoula Pole Barn", clientId: "c1", clientName: "Hess Construction", status: "Draft", total: 42850, created: "2026-02-18", updated: "2026-02-22" },
  { id: uid(), name: "Hamilton Roof Replacement", clientId: "c2", clientName: "Anderson Properties", status: "In Review", total: 28400, created: "2026-02-14", updated: "2026-02-20" },
  { id: uid(), name: "Stevensville Shop Build", clientId: "c3", clientName: "Miller Ranch LLC", status: "Active", total: 67200, created: "2026-02-05", updated: "2026-02-16" },
  { id: uid(), name: "Victor Lean-To Addition", clientId: "c4", clientName: "Thompson Family", status: "Draft", total: 18650, created: "2026-02-10", updated: "2026-02-19" },
  { id: uid(), name: "Florence Garage Build", clientId: "c5", clientName: "Riverside Homes", status: "In Review", total: 55800, created: "2026-01-28", updated: "2026-02-12" },
  { id: uid(), name: "Corvallis Barn Renovation", clientId: "c6", clientName: "Big Sky Ag", status: "Active", total: 60300, created: "2026-01-20", updated: "2026-02-08" },
  { id: uid(), name: "Lolo Deck & Patio", clientId: "c8", clientName: "Williams Residence", status: "Completed", total: 12400, created: "2026-01-15", updated: "2026-02-03" },
  { id: uid(), name: "Darby Equipment Shed", clientId: "c7", clientName: "Mountain View Ranch", status: "Draft", total: 22100, created: "2026-02-20", updated: "2026-02-22" },
];

const STATUSES = ["Draft", "In Review", "Active", "Completed"];

const C = {
  bg: "#0e1117", raised: "#161b22", card: "#1c2129", hover: "#252c37",
  input: "#0d1117", border: "#2d333b", text: "#e6edf3", dim: "#8b949e", muted: "#484f58",
  accent: "#4a7cff", green: "#3fb950", amber: "#d29922", red: "#f85149",
  purple: "#a371f7", orange: "#db6d28",
};
const statusColor = (st) => ({ Draft: C.amber, "In Review": C.purple, Active: C.green, Completed: C.accent }[st] || C.dim);

const s = {
  page: { background: C.bg, color: C.text, fontFamily: "'Segoe UI',system-ui,sans-serif", minHeight: "100vh", fontSize: 14 },
  topbar: { background: C.raised, borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 },
  h1: { fontSize: 18, fontWeight: 600, margin: 0 },
  tabs: { display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, padding: "0 24px", background: C.raised },
  tab: (active) => ({ padding: "12px 18px", fontSize: 13, fontWeight: 500, color: active ? C.accent : C.dim, cursor: "pointer", background: "none", border: "none", borderBottomWidth: 2, borderBottomStyle: "solid", borderBottomColor: active ? C.accent : "transparent", fontFamily: "inherit", transition: "all .15s" }),
  badge: (bg, fg) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "1px 7px", borderRadius: 10, fontSize: 11, fontWeight: 600, marginLeft: 6, background: bg, color: fg }),
  content: { padding: "20px 24px" },
  btn: { padding: "7px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 },
  btnPrimary: { background: C.accent, color: "#fff" },
  btnSecondary: { background: C.hover, color: C.text, border: `1px solid ${C.border}` },
  btnGhost: { background: "transparent", color: C.dim },
  btnSm: { padding: "5px 10px", fontSize: 12 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, background: C.raised },
  td: { padding: "14px 16px", fontSize: 13, borderBottom: `1px solid ${C.border}` },
  mono: { fontFamily: "'SF Mono','Cascadia Code',monospace", fontSize: 12 },
  searchBar: { display: "flex", alignItems: "center", gap: 8, background: C.input, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 14px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, width: 520, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" },
  modalHeader: { padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
  modalBody: { padding: 24 },
  modalFooter: { padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 },
  formGroup: { marginBottom: 18 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: C.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  input: { background: C.input, border: `1px solid ${C.border}`, borderRadius: 4, padding: "8px 12px", color: C.text, fontFamily: "inherit", fontSize: 14, outline: "none", width: "100%" },
  statusBadge: (st) => { const col = statusColor(st); return { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${col}18`, color: col }; },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 },
  statLabel: { fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 },
  statValue: { fontSize: 28, fontWeight: 700, marginTop: 6, letterSpacing: -0.5 },
  statSub: { fontSize: 12, color: C.dim, marginTop: 4 },
};

const Field = ({ label, field, placeholder = "", value, onChange, children, textarea = false }) => (
  <div style={s.formGroup}>
    <label style={s.label}>{label}</label>
    {children ? children : textarea ? (
      <textarea style={{ ...s.input, resize: "vertical", minHeight: 60 }} rows={3} placeholder={placeholder} value={value || ""} onChange={(e) => onChange(field, e.target.value)} />
    ) : (
      <input style={s.input} placeholder={placeholder} value={value || ""} onChange={(e) => onChange(field, e.target.value)} />
    )}
  </div>
);

export default function ProjectDashboard({ projects, setProjects, clients, onOpenProject }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [sortCol, setSortCol] = useState("updated");
  const [sortDir, setSortDir] = useState("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ clientId: "", name: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    let list = projects;
    if (activeTab !== "All") list = list.filter(p => p.status === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q));
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
  }, [projects, search, activeTab, sortCol, sortDir]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };
  const sortArrow = (col) => sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const statusCounts = useMemo(() => {
    const counts = { All: projects.length };
    STATUSES.forEach(st => { counts[st] = projects.filter(p => p.status === st).length; });
    return counts;
  }, [projects]);

  const draftCount = projects.filter(p => p.status === "Draft").length;
  const reviewCount = projects.filter(p => p.status === "In Review").length;
  const activeCount = projects.filter(p => p.status === "Active").length;
  const activeTotal = projects.filter(p => p.status === "Active").reduce((sum, p) => sum + p.total, 0);
  const reviewTotal = projects.filter(p => p.status === "In Review").reduce((sum, p) => sum + p.total, 0);
  const completedCount = projects.filter(p => p.status === "Completed").length;
  const completedTotal = projects.filter(p => p.status === "Completed").reduce((sum, p) => sum + p.total, 0);

  const updateForm = (field, value) => setFormData(f => ({ ...f, [field]: value }));
  const createProject = () => {
    if (!formData.name.trim()) return;
    const client = (clients || []).find(c => c.id === formData.clientId);
    const now = new Date().toISOString().slice(0, 10);
    setProjects(ps => [...ps, {
      id: uid(), name: formData.name, clientId: formData.clientId,
      clientName: client?.companyName || "Unassigned",
      status: "Draft", total: 0, created: now, updated: now,
    }]);
    setFormData({ clientId: "", name: "", description: "" });
    setModalOpen(false);
  };

  const deleteProject = (id) => { setProjects(ps => ps.filter(p => p.id !== id)); setDeleteConfirm(null); };

  const formatDate = (d) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <h1 style={s.h1}>Projects</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ ...s.searchBar, width: 280 }}>
            <span style={{ color: C.muted, fontSize: 14 }}>🔍</span>
            <input style={{ background: "none", border: "none", outline: "none", color: C.text, fontFamily: "inherit", fontSize: 13, flex: 1 }}
              placeholder="Search projects, clients..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <span style={{ color: C.muted, cursor: "pointer", fontSize: 14 }} onClick={() => setSearch("")}>✕</span>}
          </div>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setModalOpen(true)}>+ New Project</button>
        </div>
      </div>
      <div style={s.tabs}>
        {["All", ...STATUSES].map(tab => {
          const col = tab === "All" ? C.accent : statusColor(tab);
          const active = activeTab === tab;
          return (
            <button key={tab} style={s.tab(active)} onClick={() => setActiveTab(tab)}>
              {tab}<span style={s.badge(active ? `${col}20` : `${C.muted}30`, active ? col : C.muted)}>{statusCounts[tab] || 0}</span>
            </button>
          );
        })}
      </div>
      <div style={s.content}>
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Draft Projects</div>
            <div style={s.statValue}>{draftCount}</div>
            <div style={s.statSub}>No estimates sent yet</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>In Review</div>
            <div style={s.statValue}>{reviewCount}</div>
            <div style={s.statSub}>{fmt(reviewTotal)} pending approval</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Active Projects</div>
            <div style={s.statValue}>{activeCount}</div>
            <div style={s.statSub}>{fmt(activeTotal)} in progress</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Completed</div>
            <div style={{ ...s.statValue, color: C.green }}>{completedCount}</div>
            <div style={s.statSub}>{fmt(completedTotal)} done & paid</div>
          </div>
        </div>
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                {[["name", "Project"], ["clientName", "Client"], ["status", "Status"], ["total", "Total"], ["created", "Created"], ["updated", "Updated"]].map(([col, label]) => (
                  <th key={col} style={{ ...s.th, cursor: "pointer", userSelect: "none", textAlign: col === "total" ? "right" : "left" }} onClick={() => toggleSort(col)}>
                    {label}{sortArrow(col)}
                  </th>
                ))}
                <th style={{ ...s.th, width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ ...s.td, textAlign: "center", padding: 40, color: C.muted }}>
                  {search ? `No projects matching "${search}"` : "No projects yet — create your first one above"}
                </td></tr>
              )}
              {filtered.map(proj => (
                <tr key={proj.id} style={{ cursor: "pointer" }}
                  onClick={() => onOpenProject && onOpenProject(proj.id)}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.hover}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{proj.name}</td>
                  <td style={s.td}>{proj.clientName}</td>
                  <td style={s.td}>
                    <span style={s.statusBadge(proj.status)}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: statusColor(proj.status) }} />
                      {proj.status}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: "right", ...s.mono, fontWeight: 600 }}>
                    {proj.total > 0 ? "$" + proj.total.toLocaleString() : "—"}
                  </td>
                  <td style={{ ...s.td, color: C.dim }}>{formatDate(proj.created)}</td>
                  <td style={{ ...s.td, color: C.dim }}>{formatDate(proj.updated)}</td>
                  <td style={{ ...s.td, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm, color: C.red }} onClick={() => setDeleteConfirm(proj.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: C.muted, textAlign: "right" }}>
          Showing {filtered.length} of {projects.length} project{projects.length !== 1 ? "s" : ""}
        </div>
      </div>

      {modalOpen && (
        <div style={s.overlay} onClick={() => setModalOpen(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>New Project</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <Field label="Client" field="clientId" value={formData.clientId} onChange={updateForm}>
                <select style={s.input} value={formData.clientId} onChange={(e) => updateForm("clientId", e.target.value)}>
                  <option value="">Select a client...</option>
                  {(clients || []).map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </Field>
              <Field label="Job Name *" field="name" placeholder="e.g., Missoula Pole Barn" value={formData.name} onChange={updateForm} />
              <Field label="Description (Optional)" field="description" placeholder="Brief project description..." value={formData.description} onChange={updateForm} textarea />
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setModalOpen(false)}>Cancel</button>
              <button style={{ ...s.btn, ...s.btnPrimary, opacity: formData.name?.trim() ? 1 : 0.5 }} onClick={createProject}>Create Project</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modal, width: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Delete Project?</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 14, color: C.dim, margin: 0, lineHeight: 1.6 }}>
                Are you sure you want to delete <strong style={{ color: C.text }}>{projects.find(p => p.id === deleteConfirm)?.name}</strong>? This will permanently remove the project and all its data.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ ...s.btn, background: C.red, color: "#fff" }} onClick={() => deleteProject(deleteConfirm)}>Delete Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
