import { useState, useMemo } from "react";

const fmt = (n) => "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const SECTIONS_SAMPLE = [
  { name: "Framing", materials: 12450, labor: 5400, equipment: 1200, subs: 0, other: 0 },
  { name: "Roofing", materials: 8200, labor: 3600, equipment: 800, subs: 2800, other: 0 },
  { name: "Siding", materials: 5870, labor: 2230, equipment: 0, subs: 0, other: 0 },
  { name: "Foundation", materials: 1900, labor: 0, equipment: 1200, subs: 4200, other: 350 },
  { name: "Dirt Work", materials: 0, labor: 0, equipment: 0, subs: 1800, other: 150 },
];

const ACTIVITY = [
  { color: "#4a7cff", text: "Framing section updated — adjusted wall stud quantities", who: "You", date: "Feb 22, 2026" },
  { color: "#3fb950", text: "Roofing section added — metal roofing + felt paper", who: "You", date: "Feb 20, 2026" },
  { color: "#d29922", text: "Siding materials priced — LP SmartSide 4x8 and 4x9", who: "You", date: "Feb 19, 2026" },
  { color: "#a371f7", text: "Foundation section added — pier footings + concrete", who: "You", date: "Feb 18, 2026" },
  { color: "#8b949e", text: "Project created", who: "You", date: "Feb 18, 2026" },
];

const STATUSES = ["Draft", "In Review", "Active", "Completed"];

const C = {
  bg: "#0e1117", raised: "#161b22", card: "#1c2129", hover: "#252c37",
  input: "#0d1117", border: "#2d333b", text: "#e6edf3", dim: "#8b949e", muted: "#484f58",
  accent: "#4a7cff", green: "#3fb950", amber: "#d29922", red: "#f85149",
  purple: "#a371f7", orange: "#db6d28",
};
const statusColor = (st) => ({ Draft: C.amber, "In Review": C.purple, Active: C.green, Completed: C.accent }[st] || C.dim);
const statusDesc = (st) => ({
  Draft: "No estimates or invoices created",
  "In Review": "Estimate sent, awaiting approval",
  Active: "Estimate accepted & signed — work in progress",
  Completed: "Work completed & paid in full",
}[st] || "");

const s = {
  page: { background: C.bg, color: C.text, fontFamily: "'Segoe UI',system-ui,sans-serif", minHeight: "100vh", fontSize: 14 },
  topbar: { background: C.raised, borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 },
  h1: { fontSize: 18, fontWeight: 600, margin: 0 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 13, color: C.muted, borderBottom: `1px solid ${C.border}` },
  breadLink: { color: C.dim, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", fontSize: 13 },
  content: { padding: "24px" },
  btn: { padding: "7px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 },
  btnPrimary: { background: C.accent, color: "#fff" },
  btnSecondary: { background: C.hover, color: C.text, border: `1px solid ${C.border}` },
  btnGhost: { background: "transparent", color: C.dim },
  btnSm: { padding: "5px 10px", fontSize: 12 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" },
  cardHeader: { padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, background: C.raised },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: `1px solid ${C.border}` },
  mono: { fontFamily: "'SF Mono','Cascadia Code',monospace", fontSize: 12 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, width: 480, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" },
  modalHeader: { padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
  modalFooter: { padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 10 },
};

const ActionBtn = ({ icon, iconBg, label, desc, onClick, disabled = false }) => (
  <button onClick={disabled ? undefined : onClick}
    style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", width: "100%", fontFamily: "inherit", fontSize: 13, color: disabled ? C.muted : C.text, textAlign: "left", opacity: disabled ? 0.5 : 1 }}
    onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = `${C.accent}10`; } }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: iconBg, fontSize: 18 }}>{icon}</div>
    <div>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{desc}</div>
    </div>
  </button>
);

export default function JobOverview({ project, onNavigate }) {
  const projectData = project || { name: "Missoula Pole Barn", clientName: "Hess Construction", clientContact: "Mike Hess", clientEmail: "mike@hess.com", clientPhone: "(406) 555-0123", status: "Draft", description: "30x40 pole barn with 12x40 lean-to, metal roofing, LP SmartSide siding.", createdAt: "Feb 18, 2026", updatedAt: "Feb 22, 2026" };

  const [status, setStatus] = useState(projectData.status || "Draft");
  const [statusModal, setStatusModal] = useState(false);
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteDetail, setQuoteDetail] = useState("category");

  const ALL_COST_CATS = [
    { key: "materials", label: "Materials" }, { key: "labor", label: "Labor" },
    { key: "equipment", label: "Equipment" }, { key: "subs", label: "Subcontractors" }, { key: "other", label: "Other" },
  ];

  const activeCats = useMemo(() => ALL_COST_CATS.filter(cat => SECTIONS_SAMPLE.some(sec => (sec[cat.key] || 0) > 0)), []);

  const totals = useMemo(() => {
    const t = {};
    ALL_COST_CATS.forEach(cat => { t[cat.key] = 0; });
    SECTIONS_SAMPLE.forEach(sec => { ALL_COST_CATS.forEach(cat => { t[cat.key] += sec[cat.key] || 0; }); });
    t.total = ALL_COST_CATS.reduce((sum, cat) => sum + t[cat.key], 0);
    return t;
  }, []);

  const sectionTotal = (sec) => ALL_COST_CATS.reduce((sum, cat) => sum + (sec[cat.key] || 0), 0);
  const sc = statusColor(status);

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <h1 style={s.h1}>{projectData.name}</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => onNavigate && onNavigate("builder")}>✏️ Edit Estimate</button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setQuoteModal(true)}>📄 Create Estimate</button>
        </div>
      </div>
      <div style={s.breadcrumb}>
        <button style={s.breadLink} onClick={() => onNavigate && onNavigate("projects")}>Projects</button>
        <span>/</span>
        <span style={{ color: C.text }}>{projectData.name}</span>
      </div>
      <div style={s.content}>
        {/* Client & Project Info */}
        <div style={{ ...s.card, marginBottom: 20 }}>
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 24, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600, marginBottom: 8 }}>Client</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{projectData.clientName || "—"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {projectData.clientContact && <div style={{ fontSize: 13, color: C.dim }}>👤 {projectData.clientContact}</div>}
                {projectData.clientEmail && <div style={{ fontSize: 13 }}><span style={{ color: C.accent }}>{projectData.clientEmail}</span></div>}
                {projectData.clientPhone && <div style={{ fontSize: 13, color: C.dim }}>{projectData.clientPhone}</div>}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600, marginBottom: 8 }}>Project Details</div>
              {projectData.description && <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6, marginBottom: 10 }}>{projectData.description}</div>}
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Created</div>
                  <div style={{ fontSize: 13, color: C.dim, marginTop: 2 }}>{projectData.createdAt || projectData.created || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Last Updated</div>
                  <div style={{ fontSize: 13, color: C.dim, marginTop: 2 }}>{projectData.updatedAt || projectData.updated || "—"}</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600, marginBottom: 8 }}>Status</div>
              <button onClick={() => setStatusModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", background: `${sc}18`, color: sc, border: `1px solid ${sc}40`, fontFamily: "inherit" }}>
                <span style={{ width: 7, height: 7, borderRadius: 4, background: sc }} />
                {status}
                <span style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${activeCats.length + 1}, 1fr)`, gap: 12, marginBottom: 24 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600 }}>Total Estimate</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: C.green }}>{fmt(totals.total)}</div>
          </div>
          {activeCats.map(cat => (
            <div key={cat.key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600 }}>{cat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{fmt(totals[cat.key])}</div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <div>
            {/* Sections Breakdown */}
            <div style={{ ...s.card, marginBottom: 20 }}>
              <div style={s.cardHeader}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Sections Breakdown</h3>
              </div>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Section</th>
                    {activeCats.map(cat => <th key={cat.key} style={{ ...s.th, textAlign: "right" }}>{cat.label}</th>)}
                    <th style={{ ...s.th, textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {SECTIONS_SAMPLE.map((sec, i) => (
                    <tr key={i} onMouseEnter={(e) => e.currentTarget.style.background = C.hover} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{sec.name}</td>
                      {activeCats.map(cat => (
                        <td key={cat.key} style={{ ...s.td, textAlign: "right", ...s.mono, color: (sec[cat.key] || 0) === 0 ? C.muted : C.text }}>
                          {(sec[cat.key] || 0) === 0 ? "—" : fmt(sec[cat.key])}
                        </td>
                      ))}
                      <td style={{ ...s.td, textAlign: "right", ...s.mono, fontWeight: 600 }}>{fmt(sectionTotal(sec))}</td>
                    </tr>
                  ))}
                  <tr style={{ background: `${C.accent}08` }}>
                    <td style={{ ...s.td, fontWeight: 700, borderBottom: "none" }}>Total</td>
                    {activeCats.map(cat => (
                      <td key={cat.key} style={{ ...s.td, textAlign: "right", ...s.mono, fontWeight: 700, borderBottom: "none" }}>{fmt(totals[cat.key])}</td>
                    ))}
                    <td style={{ ...s.td, textAlign: "right", ...s.mono, fontWeight: 700, color: C.green, borderBottom: "none" }}>{fmt(totals.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Activity Log */}
            <div style={s.card}>
              <div style={s.cardHeader}><h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Activity</h3></div>
              <div style={{ padding: "16px 20px" }}>
                {ACTIVITY.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < ACTIVITY.length - 1 ? 16 : 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: a.color, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{a.text}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{a.date} — {a.who}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, marginBottom: 10 }}>Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <ActionBtn icon="✏️" iconBg={`${C.accent}18`} label="Edit Estimate" desc="Modify estimate details" onClick={() => onNavigate && onNavigate("builder")} />
                <ActionBtn icon="📄" iconBg={`${C.green}18`} label="Create Estimate" desc="Generate client-facing quote" onClick={() => setQuoteModal(true)} />
                <ActionBtn icon="🧾" iconBg={`${C.purple}18`} label="Convert to Invoice" desc="Create invoice from project" disabled={status === "Completed" || status === "In Review"} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, marginBottom: 10 }}>Output Documents</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <ActionBtn icon="📋" iconBg={`${C.orange}18`} label="Internal Estimate" desc="Full detailed breakdown (PDF)" />
                <ActionBtn icon="📑" iconBg={`${C.green}18`} label="Client Quote" desc="Category or line-item detail (PDF)" onClick={() => setQuoteModal(true)} />
                <ActionBtn icon="🔨" iconBg={`${C.amber}18`} label="Crew Material List" desc="Organized by section (PDF)" />
                <ActionBtn icon="📦" iconBg={`${C.accent}18`} label="Supplier Order List" desc="Consolidated quantities (PDF)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {statusModal && (
        <div style={s.overlay} onClick={() => setStatusModal(false)}>
          <div style={{ ...s.modal, width: 360 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Update Status</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setStatusModal(false)}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {STATUSES.map(st => {
                  const col = statusColor(st);
                  const active = status === st;
                  return (
                    <button key={st} onClick={() => { setStatus(st); setStatusModal(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: active ? 600 : 400, background: active ? `${col}18` : "transparent", border: `1px solid ${active ? `${col}40` : C.border}`, color: active ? col : C.text, textAlign: "left" }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.hover; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: col, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div>{st}</div>
                        <div style={{ fontSize: 11, color: C.dim, fontWeight: 400, marginTop: 2 }}>{statusDesc(st)}</div>
                      </div>
                      {active && <span style={{ fontSize: 11, opacity: 0.7 }}>Current</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {quoteModal && (
        <div style={s.overlay} onClick={() => setQuoteModal(false)}>
          <div style={{ ...s.modal, width: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Create Client Quote</h2>
              <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => setQuoteModal(false)}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, lineHeight: 1.5 }}>
                Choose the level of detail to show on the client-facing quote.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[["category", "Category Totals", "Show one total per section (Framing, Roofing, etc.)"], ["lineItem", "Line-Item Detail", "Show every item with quantity and price"]].map(([key, label, desc]) => (
                  <button key={key} onClick={() => setQuoteDetail(key)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: quoteDetail === key ? `${C.accent}12` : "transparent", border: `1px solid ${quoteDetail === key ? C.accent : C.border}`, color: C.text }}>
                    <div style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${quoteDetail === key ? C.accent : C.muted}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      {quoteDetail === key && <div style={{ width: 8, height: 8, borderRadius: 4, background: C.accent }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                      <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setQuoteModal(false)}>Cancel</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setQuoteModal(false)}>📄 Generate Quote PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
