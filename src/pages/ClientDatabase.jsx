import React, { useState, useMemo } from "react";

const uid = () => Math.random().toString(36).slice(2, 10);

export const INITIAL_CLIENTS = [
  { id: "c1", companyName: "Hess Construction", contactName: "Mike Hess", email: "mike@hess.com", phone: "(406) 555-0123", address: "1245 Main St, Missoula, MT 59801", notes: "Repeat customer, prefers email communication", projects: 2, createdAt: "2025-09-15" },
  { id: "c2", companyName: "Anderson Properties", contactName: "Sarah Anderson", email: "sarah@anderson.com", phone: "(406) 555-0456", address: "890 Brooks St, Hamilton, MT 59840", notes: "", projects: 1, createdAt: "2025-11-02" },
  { id: "c3", companyName: "Miller Ranch LLC", contactName: "Dave Miller", email: "dave@millerranch.com", phone: "(406) 555-0789", address: "4521 Eastside Hwy, Stevensville, MT 59870", notes: "Large ranch operation, multiple buildings planned", projects: 1, createdAt: "2026-01-10" },
  { id: "c4", companyName: "Thompson Family", contactName: "Jim Thompson", email: "jim@thompson.net", phone: "(406) 555-0321", address: "312 River Rd, Victor, MT 59875", notes: "", projects: 1, createdAt: "2026-01-20" },
  { id: "c5", companyName: "Riverside Homes", contactName: "Tom Rivers", email: "tom@riverside.com", phone: "(406) 555-0654", address: "7780 US-93, Florence, MT 59833", notes: "General contractor, subcontracts framing", projects: 1, createdAt: "2025-10-05" },
  { id: "c6", companyName: "Big Sky Ag", contactName: "Laura Chen", email: "laura@bigskyag.com", phone: "(406) 555-0987", address: "15200 MT-269, Corvallis, MT 59828", notes: "Agricultural buildings only", projects: 1, createdAt: "2025-12-01" },
  { id: "c7", companyName: "Mountain View Ranch", contactName: "Pat Greer", email: "pat@mountainview.com", phone: "(406) 555-0111", address: "2200 Tin Cup Rd, Darby, MT 59829", notes: "", projects: 1, createdAt: "2026-02-10" },
  { id: "c8", companyName: "Williams Residence", contactName: "Bob Williams", email: "bob@williams.net", phone: "(406) 555-0222", address: "445 Lewis & Clark Dr, Lolo, MT 59847", notes: "Residential client", projects: 1, createdAt: "2025-08-20" },
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
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 },
  statCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 },
  statLabel: { fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 },
  statValue: { fontSize: 28, fontWeight: 700, marginTop: 6, letterSpacing: -0.5 },
  statSub: { fontSize: 12, color: C.dim, marginTop: 4 },
};

const emptyClient = () => ({ id: uid(), companyName: "", contactName: "", email: "", phone: "", address: "", notes: "", projects: 0, createdAt: new Date().toISOString().slice(0, 10) });

const Field = ({ label, field, type = "text", placeholder = "", textarea = false, value, onChange }) => (
  <div style={s.formGroup}>
    <label style={s.label}>{label}</label>
    {textarea ? (
      <textarea style={{ ...s.input, resize: "vertical", minHeight: 60 }} rows={3} placeholder={placeholder} value={value || ""} onChange={(e) => onChange(field, e.target.value)} />
    ) : (
      <input style={s.input} type={type} placeholder={placeholder} value={value || ""} onChange={(e) => onChange(field, e.target.value)} />
    )}
  </div>
);

export default function ClientDatabase({ clients, setClients }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState(emptyClient());
  const [expandedId, setExpandedId] = useState(null);
  const [sortCol, setSortCol] = useState("companyName");
  const [sortDir, setSortDir] = useState("asc");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    let list = clients;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.companyName.toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) || c.phone.includes(q) ||
        c.address.toLowerCase().includes(q) || (c.notes || "").toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [clients, search, sortCol, sortDir]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };
  const sortArrow = (col) => sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const totalProjects = clients.reduce((sum, c) => sum + (c.projects || 0), 0);
  const recentClients = clients.filter(c => {
    const d = new Date(c.createdAt);
    return (Date.now() - d) < 90 * 24 * 60 * 60 * 1000;
  }).length;

  const openAddModal = () => { setEditingClient(null); setFormData(emptyClient()); setModalOpen(true); };
  const openEditModal = (client) => { setEditingClient(client); setFormData({ ...client }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingClient(null); };
  const updateForm = (field, value) => setFormData(f => ({ ...f, [field]: value }));
  const saveClient = () => {
    if (!formData.companyName.trim()) return;
    if (editingClient) setClients(cs => cs.map(c => c.id === editingClient.id ? { ...formData } : c));
    else setClients(cs => [...cs, { ...formData, id: uid() }]);
    closeModal();
  };
  const deleteClient = (id) => { setClients(cs => cs.filter(c => c.id !== id)); setDeleteConfirm(null); if (expandedId === id) setExpandedId(null); };

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <h1 style={s.h1}>Clients</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ ...s.searchBar, width: 280 }}>
            <span style={{ color: C.muted, fontSize: 14 }}>🔍</span>
            <input style={{ background: "none", border: "none", outline: "none", color: C.text, fontFamily: "inherit", fontSize: 13, flex: 1 }}
              placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <span style={{ color: C.muted, cursor: "pointer", fontSize: 14 }} onClick={() => setSearch("")}>✕</span>}
          </div>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={openAddModal}>+ Add Client</button>
        </div>
      </div>
      <div style={s.content}>
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Total Clients</div>
            <div style={s.statValue}>{clients.length}</div>
            <div style={s.statSub}>{recentClients} added in last 90 days</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Total Projects</div>
            <div style={s.statValue}>{totalProjects}</div>
            <div style={s.statSub}>Across all clients</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Avg Projects / Client</div>
            <div style={s.statValue}>{clients.length ? (totalProjects / clients.length).toFixed(1) : "0"}</div>
            <div style={s.statSub}>Per client average</div>
          </div>
        </div>
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                {[["companyName", "Client"], ["contactName", "Contact"], ["email", "Email"], ["phone", "Phone"], ["projects", "Projects"], ["createdAt", "Added"]].map(([col, label]) => (
                  <th key={col} style={{ ...s.th, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort(col)}>
                    {label}{sortArrow(col)}
                  </th>
                ))}
                <th style={{ ...s.th, width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ ...s.td, textAlign: "center", padding: 40, color: C.muted }}>
                  {search ? `No clients matching "${search}"` : "No clients yet — add your first client above"}
                </td></tr>
              )}
              {filtered.map(client => (
                <React.Fragment key={client.id}>
                  <tr style={{ cursor: "pointer" }}
                    onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.hover}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ ...s.td, fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: C.muted, transform: expandedId === client.id ? "rotate(90deg)" : "rotate(0)", transition: "transform .15s" }}>▶</span>
                        {client.companyName}
                      </div>
                    </td>
                    <td style={s.td}>{client.contactName}</td>
                    <td style={{ ...s.td, color: C.accent }}>{client.email}</td>
                    <td style={{ ...s.td, color: C.dim }}>{client.phone}</td>
                    <td style={{ ...s.td, ...s.mono, textAlign: "center" }}>{client.projects}</td>
                    <td style={{ ...s.td, color: C.dim }}>{client.createdAt}</td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                        <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => openEditModal(client)}>Edit</button>
                        <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm, color: C.red }} onClick={() => setDeleteConfirm(client.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === client.id && (
                    <tr>
                      <td colSpan={7} style={{ ...s.td, background: `${C.accent}06`, padding: "16px 24px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, marginBottom: 6 }}>Address</div>
                            <div style={{ fontSize: 13, color: client.address ? C.text : C.muted }}>{client.address || "No address on file"}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, marginBottom: 6 }}>Notes</div>
                            <div style={{ fontSize: 13, color: client.notes ? C.text : C.muted }}>{client.notes || "No notes"}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: C.muted, textAlign: "right" }}>
          Showing {filtered.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
        </div>
      </div>

      {modalOpen && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{editingClient ? "Edit Client" : "Add New Client"}</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={closeModal}>✕</button>
            </div>
            <div style={s.modalBody}>
              <Field label="Company / Client Name *" field="companyName" placeholder="e.g., Hess Construction" value={formData.companyName} onChange={updateForm} />
              <Field label="Contact Name" field="contactName" placeholder="e.g., Mike Hess" value={formData.contactName} onChange={updateForm} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Email" field="email" type="email" placeholder="email@example.com" value={formData.email} onChange={updateForm} />
                <Field label="Phone" field="phone" placeholder="(406) 555-0123" value={formData.phone} onChange={updateForm} />
              </div>
              <Field label="Address" field="address" placeholder="Street, City, State, ZIP" value={formData.address} onChange={updateForm} />
              <Field label="Notes" field="notes" placeholder="Any notes about this client..." textarea value={formData.notes} onChange={updateForm} />
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={closeModal}>Cancel</button>
              <button style={{ ...s.btn, ...s.btnPrimary, opacity: formData.companyName.trim() ? 1 : 0.5 }} onClick={saveClient}>
                {editingClient ? "Save Changes" : "Add Client"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modal, width: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Delete Client?</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 14, color: C.dim, margin: 0, lineHeight: 1.6 }}>
                Are you sure you want to delete <strong style={{ color: C.text }}>{clients.find(c => c.id === deleteConfirm)?.companyName}</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ ...s.btn, background: C.red, color: "#fff" }} onClick={() => deleteClient(deleteConfirm)}>Delete Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
