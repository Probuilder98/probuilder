const C = {
  bg: "#0b0e14",
  raised: "#161b22",
  border: "#2d333b",
  text: "#e6edf3",
  dim: "#8b949e",
  muted: "#484f58",
  accent: "#4a7cff",
  green: "#3fb950",
  amber: "#d29922",
  red: "#f85149",
  purple: "#a371f7",
};

const statusColor = (st) => ({
  Draft: C.amber,
  "In Review": C.purple,
  Active: C.green,
  Completed: C.accent,
}[st] || C.dim);

const NAV_ITEMS = [
  { id: "projects", icon: "⊞", label: "Projects" },
  { id: "clients", icon: "👥", label: "Clients" },
  { id: "materials", icon: "🪵", label: "Materials" },
  { id: "rates", icon: "💼", label: "Labor & Equipment" },
];

export default function Sidebar({ activePage, onNavigate, activeProject, projects }) {
  const recentProjects = (projects || []).slice(0, 5);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: 220,
      background: C.bg, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", zIndex: 100,
      fontFamily: "'Segoe UI',system-ui,sans-serif",
    }}>
      {/* Logo */}
      <div style={{
        padding: "18px 20px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `linear-gradient(135deg, ${C.accent}, #7c4dff)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>P</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1 }}>ProBuilder</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: 0.3 }}>Job Estimating</div>
        </div>
      </div>

      {/* Main Nav */}
      <div style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ padding: "4px 16px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: C.muted }}>
          Main
        </div>
        {NAV_ITEMS.map(item => {
          const active = activePage === item.id && !activeProject;
          return (
            <button key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 16px",
                background: active ? `${C.accent}18` : "transparent",
                border: "none", borderLeft: `3px solid ${active ? C.accent : "transparent"}`,
                color: active ? C.accent : C.dim,
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all .12s",
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#ffffff08"; e.currentTarget.style.color = C.text; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.dim; } }}>
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Active Project Context */}
      {activeProject && (
        <div style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ padding: "4px 16px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: C.muted }}>
            Current Project
          </div>
          <div style={{ padding: "6px 16px 10px" }}>
            <div style={{ fontSize: 11, color: C.text, fontWeight: 600, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeProject.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: statusColor(activeProject.status), flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: statusColor(activeProject.status), fontWeight: 500 }}>{activeProject.status}</span>
            </div>
          </div>
          {[
            { id: "overview", icon: "◈", label: "Overview" },
            { id: "builder", icon: "📐", label: "Estimate Builder" },
          ].map(item => {
            const active = activePage === item.id;
            return (
              <button key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "9px 16px",
                  background: active ? `${C.accent}18` : "transparent",
                  border: "none", borderLeft: `3px solid ${active ? C.accent : "transparent"}`,
                  color: active ? C.accent : C.dim,
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all .12s",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#ffffff08"; e.currentTarget.style.color = C.text; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.dim; } }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => onNavigate("projects")}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 16px 4px", background: "transparent", border: "none", color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            ← Back to projects
          </button>
        </div>
      )}

      {/* Recent Projects */}
      {!activeProject && recentProjects.length > 0 && (
        <div style={{ padding: "12px 0", flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "4px 16px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: C.muted }}>
            Recent Projects
          </div>
          {recentProjects.map(proj => (
            <button key={proj.id}
              onClick={() => onNavigate("overview", proj.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "8px 16px",
                background: "transparent", border: "none", borderLeft: "3px solid transparent",
                cursor: "pointer", fontFamily: "inherit",
                transition: "all .12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#ffffff08"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: statusColor(proj.status), flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, textAlign: "left" }}>{proj.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, marginTop: "auto" }}>
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>ProBuilder v1.0</div>
      </div>
    </div>
  );
}
