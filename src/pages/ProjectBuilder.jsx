import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ── Helpers ──
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ── Factories ──
const makeLineItem = (overrides = {}) => ({
  id: uid(), categoryType: "Materials", itemName: "", quantity: 1,
  unit: "ea", unitPrice: 0, isCustom: true, materialId: null,
  priceOverride: false, componentGroupId: null, description: "", showDescription: false,
  ...overrides,
});
const makeGroup = (name, overrides = {}) => ({ id: uid(), name, sortOrder: 0, ...overrides });
const makeSubcategory = (name, overrides = {}) => ({
  id: uid(), name, sortOrder: 0, parentId: null,
  materialsMarkup: null, laborMarkup: null, equipmentMarkup: null, subsMarkup: null, otherMarkup: null,
  materialsMarkupEnabled: true, laborMarkupEnabled: true, equipmentMarkupEnabled: true,
  subsMarkupEnabled: true, otherMarkupEnabled: true, lumpSum: 0, ...overrides,
});
const makeSection = (name) => ({ id: uid(), name, sortOrder: 0 });

// ── Colors / Styles ──
const C = {
  bg: "#0e1117", raised: "#161b22", card: "#1c2129", hover: "#252c37",
  input: "#0d1117", border: "#2d333b", borderFocus: "#4a7cff",
  text: "#e6edf3", dim: "#8b949e", muted: "#484f58",
  accent: "#4a7cff", green: "#3fb950", amber: "#d29922", red: "#f85149",
  purple: "#a371f7", orange: "#db6d28",
};
const s = {
  page: { background: C.bg, color: C.text, fontFamily: "'Segoe UI',system-ui,sans-serif", minHeight: "100vh", fontSize: 14, paddingBottom: 100 },
  topbar: { background: C.raised, borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 },
  h1: { fontSize: 18, fontWeight: 600, margin: 0 },
  toolbar: { background: C.raised, borderBottom: `1px solid ${C.border}`, padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 },
  content: { padding: "20px 24px" },
  btn: { padding: "7px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 },
  btnPrimary: { background: C.accent, color: "#fff" },
  btnSecondary: { background: C.hover, color: C.text, border: `1px solid ${C.border}` },
  btnGhost: { background: "transparent", color: C.dim },
  btnGreen: { background: C.green, color: "#000" },
  btnSm: { padding: "5px 10px", fontSize: 12 },
  btnDanger: { background: "transparent", color: C.red, border: `1px solid ${C.red}33` },
  section: { border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 14, background: C.card, overflow: "hidden" },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: C.raised, borderBottom: `1px solid ${C.border}`, cursor: "pointer" },
  subcat: { margin: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" },
  subcatHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: `${C.accent}0a`, borderBottom: `1px solid ${C.border}`, cursor: "pointer" },
  group: { borderBottom: `1px solid ${C.border}30` },
  groupLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.green, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, background: `${C.green}08` },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "6px 10px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600, background: C.raised, borderBottom: `1px solid ${C.border}` },
  td: { padding: "6px 10px", fontSize: 13, borderBottom: `1px solid ${C.border}30` },
  mono: { fontFamily: "'SF Mono','Cascadia Code',monospace", fontSize: 12 },
  input: { background: C.input, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.text, fontFamily: "inherit", fontSize: 13, outline: "none", width: "100%" },
  inputNum: { width: 70, textAlign: "right" },
  markupInput: { width: 55, textAlign: "right", color: C.amber, fontFamily: "'SF Mono',monospace", fontSize: 12, padding: "4px 6px", background: C.input, border: `1px solid ${C.border}`, borderRadius: 4, outline: "none" },
  summary: { position: "fixed", bottom: 0, left: 220, right: 0, background: C.raised, borderTop: `2px solid ${C.accent}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 60 },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,.4)", zIndex: 100, maxHeight: 200, overflowY: "auto" },
  dropItem: { padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", fontSize: 13 },
  toggle: (on) => ({ width: 32, height: 18, borderRadius: 9, background: on ? C.accent : C.muted, cursor: "pointer", position: "relative", border: "none", flexShrink: 0 }),
  toggleDot: (on) => ({ width: 14, height: 14, borderRadius: 7, background: "#fff", position: "absolute", top: 2, left: on ? 16 : 2, transition: "left .15s" }),
  markupRow: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, padding: "8px 14px", background: `${C.amber}06`, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" },
  addRow: { padding: "8px 14px", color: C.muted, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
};

const Toggle = ({ on, onChange }) => (
  <button style={s.toggle(on)} onClick={() => onChange(!on)}>
    <div style={s.toggleDot(on)} />
  </button>
);

const AutocompleteInput = ({ value, onChange, onSelect, onSelectComplete, categoryFilter, gridRow, gridCol, allItems }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (value !== lastValueRef.current && value !== search) {
      setSearch(value || "");
    }
    lastValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search || search.length < 1) return [];
    const q = search.toLowerCase();
    let items = allItems || [];
    if (categoryFilter) items = items.filter(i => i.type === categoryFilter);
    return items.filter(i => i.name.toLowerCase().includes(q)).slice(0, 12);
  }, [search, categoryFilter, allItems]);

  useEffect(() => { setHighlightIdx(-1); }, [filtered.length, search]);

  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIdx];
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx]);

  const confirmSelection = (item) => {
    onSelect(item);
    setSearch(item.name);
    setOpen(false);
    setHighlightIdx(-1);
    setTimeout(() => { if (onSelectComplete) onSelectComplete(); }, 30);
  };

  const handleKeyDown = (e) => {
    const dropdownActive = open && filtered.length > 0;
    if (dropdownActive && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      if (e.key === "ArrowDown") setHighlightIdx(i => (i + 1) % filtered.length);
      else setHighlightIdx(i => (i <= 0 ? filtered.length - 1 : i - 1));
      return;
    }
    if (e.key === "Enter" && dropdownActive) {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < filtered.length) confirmSelection(filtered[highlightIdx]);
      else if (filtered.length > 0) confirmSelection(filtered[0]);
      return;
    }
    if (e.key === "Escape") { setOpen(false); setHighlightIdx(-1); }
  };

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }} data-grid-row={gridRow} data-grid-col={gridCol}>
      <input
        style={s.input}
        value={search}
        placeholder="Type to search..."
        onChange={(e) => { setSearch(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => { if (search) setOpen(true); }}
        onKeyDown={handleKeyDown}
      />
      {open && filtered.length > 0 && (
        <div style={s.dropdown} ref={listRef}>
          {filtered.map((item, idx) => (
            <div key={item.id}
              style={{ ...s.dropItem, background: idx === highlightIdx ? C.accent + "20" : "transparent" }}
              onMouseDown={() => confirmSelection(item)}
              onMouseEnter={() => setHighlightIdx(idx)}>
              <span>{item.name}</span>
              <span style={{ ...s.mono, color: C.dim }}>{fmt(item.price)}/{item.unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddGroupInput = ({ onAdd }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  const submit = () => {
    if (name.trim()) { onAdd(name.trim()); setName(""); setEditing(false); }
  };
  if (!editing) return <div style={s.addRow} onClick={() => setEditing(true)}>+ Add component group</div>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px" }}>
      <input ref={inputRef} style={{ ...s.input, width: 220 }} placeholder="Group name (e.g., Wall Studs)" value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setEditing(false); setName(""); } }} />
      <button style={{ ...s.btn, ...s.btnPrimary, ...s.btnSm }} onClick={submit}>Add</button>
      <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm }} onClick={() => { setEditing(false); setName(""); }}>Cancel</button>
    </div>
  );
};

const TableHead = () => (
  <thead><tr>
    <th style={{ ...s.th, width: 110 }}>Type</th>
    <th style={s.th}>Item</th>
    <th style={{ ...s.th, width: 70, textAlign: "right" }}>Qty</th>
    <th style={{ ...s.th, width: 60, textAlign: "center" }}>Unit</th>
    <th style={{ ...s.th, width: 90, textAlign: "right" }}>Price</th>
    <th style={{ ...s.th, width: 90, textAlign: "right" }}>After Markup</th>
    <th style={{ ...s.th, width: 100, textAlign: "right" }}>Total</th>
    <th style={{ ...s.th, width: 70 }}></th>
  </tr></thead>
);

const LineItemRow = ({ li, markup, onUpdate, onDelete, onSelectMaster, allItems }) => {
  const qtyRef = useRef(null);
  const markedUpPrice = li.unitPrice * (1 + markup / 100);
  const total = li.quantity * markedUpPrice;
  const focusQty = () => { setTimeout(() => { if (qtyRef.current) { qtyRef.current.focus(); qtyRef.current.select(); } }, 30); };
  return (
    <tbody>
      <tr>
        <td style={s.td}>
          <select style={{ ...s.input, width: 100, fontSize: 11 }} value={li.categoryType}
            onChange={(e) => onUpdate(li.id, { categoryType: e.target.value })}>
            <option>Materials</option><option>Labor</option><option>Equipment</option><option>Subs</option><option>Other</option>
          </select>
        </td>
        <td style={s.td}>
          <AutocompleteInput value={li.itemName} categoryFilter={li.categoryType} gridRow={li.id} gridCol={1} allItems={allItems}
            onChange={(val) => onUpdate(li.id, { itemName: val, isCustom: true })}
            onSelect={(item) => onSelectMaster(li.id, item)}
            onSelectComplete={focusQty} />
        </td>
        <td style={{ ...s.td, width: 70 }}>
          <input ref={qtyRef} style={{ ...s.input, ...s.inputNum, ...s.mono }} type="number" min="0" value={li.quantity}
            onChange={(e) => onUpdate(li.id, { quantity: parseFloat(e.target.value) || 0 })} />
        </td>
        <td style={{ ...s.td, width: 60 }}>
          <input style={{ ...s.input, width: 50, textAlign: "center", fontSize: 12 }} value={li.unit}
            onChange={(e) => onUpdate(li.id, { unit: e.target.value })} />
        </td>
        <td style={{ ...s.td, width: 90 }}>
          <input style={{ ...s.input, ...s.inputNum, ...s.mono }} type="number" step="0.01" value={li.unitPrice}
            onChange={(e) => onUpdate(li.id, { unitPrice: parseFloat(e.target.value) || 0, priceOverride: true })} />
        </td>
        <td style={{ ...s.td, width: 90, textAlign: "right", ...s.mono, color: C.amber }}>{fmt(markedUpPrice)}</td>
        <td style={{ ...s.td, width: 100, textAlign: "right", ...s.mono, fontWeight: 600 }}>{fmt(total)}</td>
        <td style={{ ...s.td, width: 70, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
            <button style={{ ...s.btn, ...s.btnGhost, padding: "2px 6px", fontSize: 13, color: li.showDescription ? C.accent : C.muted, borderRadius: 4, border: li.showDescription ? `1px solid ${C.accent}44` : "1px solid transparent" }}
              onClick={() => onUpdate(li.id, { showDescription: !li.showDescription })} title="Add note">📝</button>
            <button style={{ ...s.btn, ...s.btnGhost, padding: "2px 6px", color: C.red, fontSize: 16 }}
              onClick={() => onDelete(li.id)} title="Delete">×</button>
          </div>
        </td>
      </tr>
      {li.showDescription && (
        <tr>
          <td colSpan={8} style={{ ...s.td, paddingTop: 2, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8 }}>
              <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>Note:</span>
              <input style={{ ...s.input, fontSize: 12, color: C.dim }} placeholder="Brief description or note..."
                value={li.description || ""} onChange={(e) => onUpdate(li.id, { description: e.target.value })} />
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default function ProjectBuilder({ project, materials, rates, onSave, onNavigate }) {
  const projectName = project?.name || "New Project";
  const clientName = project?.clientName || "";

  // Build all items from shared databases
  const allItems = useMemo(() => {
    const matItems = (materials || []).map(m => ({ ...m, id: m.id, price: m.unitPrice, type: "Materials" }));
    const rateItems = (rates || []).map(r => ({
      ...r, id: r.id, price: r.rate,
      type: r.category === "Labor" ? "Labor" : r.category === "Equipment Rentals" ? "Equipment" : r.category === "Subcontractors" ? "Subs" : "Other"
    }));
    return [...matItems, ...rateItems];
  }, [materials, rates]);

  const [globalMarkups, setGlobalMarkups] = useState({ materials: 20, labor: 25, equipment: 15, subs: 10, other: 10 });
  const [sections, setSections] = useState([{ ...makeSection("Framing"), expanded: true }]);
  const [subcategories, setSubcategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [history, setHistory] = useState([]);

  const snapshot = () => setHistory(h => [...h.slice(-19), {
    sections: JSON.parse(JSON.stringify(sections)),
    subcategories: JSON.parse(JSON.stringify(subcategories)),
    groups: JSON.parse(JSON.stringify(groups)),
    lineItems: JSON.parse(JSON.stringify(lineItems))
  }]);

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setSections(prev.sections); setSubcategories(prev.subcategories);
    setGroups(prev.groups); setLineItems(prev.lineItems);
    setHistory(h => h.slice(0, -1));
  };

  const addSection = () => { snapshot(); setSections(ss => [...ss, { ...makeSection("New Section"), expanded: true }]); };
  const renameSection = (id, name) => setSections(ss => ss.map(x => x.id === id ? { ...x, name } : x));
  const deleteSection = (id) => {
    snapshot();
    const subIds = subcategories.filter(sc => sc.sectionId === id).map(sc => sc.id);
    setLineItems(li => li.filter(l => !subIds.includes(l.subcategoryId)));
    setGroups(gs => gs.filter(g => !subIds.includes(g.subcategoryId)));
    setSubcategories(scs => scs.filter(sc => sc.sectionId !== id));
    setSections(ss => ss.filter(x => x.id !== id));
  };
  const toggleSection = (id) => setSections(ss => ss.map(x => x.id === id ? { ...x, expanded: !x.expanded } : x));

  const addSubcategory = (sectionId) => { snapshot(); setSubcategories(scs => [...scs, { ...makeSubcategory("New Subcategory"), sectionId, expanded: true }]); };
  const renameSubcategory = (id, name) => setSubcategories(scs => scs.map(x => x.id === id ? { ...x, name } : x));
  const deleteSubcategory = (id) => {
    snapshot();
    setLineItems(li => li.filter(l => l.subcategoryId !== id));
    setGroups(gs => gs.filter(g => g.subcategoryId !== id));
    setSubcategories(scs => scs.filter(x => x.id !== id));
  };
  const toggleSubcategory = (id) => setSubcategories(scs => scs.map(x => x.id === id ? { ...x, expanded: !x.expanded } : x));
  const updateSubcatMarkup = (id, field, val) => setSubcategories(scs => scs.map(x => x.id === id ? { ...x, [field]: val } : x));

  const addGroup = (subcategoryId, name) => { snapshot(); setGroups(gs => [...gs, { ...makeGroup(name), subcategoryId }]); };
  const renameGroup = (id, name) => setGroups(gs => gs.map(x => x.id === id ? { ...x, name } : x));
  const deleteGroup = (id) => {
    snapshot();
    setLineItems(li => li.map(l => l.componentGroupId === id ? { ...l, componentGroupId: null } : l));
    setGroups(gs => gs.filter(x => x.id !== id));
  };

  const addLineItem = (subcategoryId, componentGroupId = null) => { snapshot(); setLineItems(li => [...li, makeLineItem({ subcategoryId, componentGroupId })]); };
  const updateLineItem = (id, updates) => setLineItems(li => li.map(l => l.id === id ? { ...l, ...updates } : l));
  const deleteLineItem = (id) => { snapshot(); setLineItems(li => li.filter(l => l.id !== id)); };
  const selectMasterItem = (lineItemId, masterItem) => {
    updateLineItem(lineItemId, { itemName: masterItem.name, unitPrice: masterItem.price, unit: masterItem.unit, categoryType: masterItem.type, isCustom: false, materialId: masterItem.id });
  };

  const getMarkup = (subcatId, categoryType) => {
    const sc = subcategories.find(x => x.id === subcatId);
    if (!sc) return 0;
    const type = categoryType === "Labor" ? "labor" : categoryType === "Equipment" ? "equipment" : categoryType === "Subs" ? "subs" : categoryType === "Other" ? "other" : "materials";
    if (sc[`${type}MarkupEnabled`] === false) return 0;
    const ov = sc[`${type}Markup`];
    if (ov != null && ov !== "") return parseFloat(ov) || 0;
    return globalMarkups[type] || 0;
  };

  const lineTotal = (li) => li.quantity * li.unitPrice;
  const lineMarkedUp = (li) => li.quantity * li.unitPrice * (1 + getMarkup(li.subcategoryId, li.categoryType) / 100);

  const totals = useMemo(() => {
    let matBefore = 0, matAfter = 0, labor = 0, equip = 0, subs = 0, other = 0;
    lineItems.forEach(li => {
      const base = lineTotal(li), marked = lineMarkedUp(li);
      if (li.categoryType === "Materials") { matBefore += base; matAfter += marked; }
      else if (li.categoryType === "Labor") labor += marked;
      else if (li.categoryType === "Equipment") equip += marked;
      else if (li.categoryType === "Subs") subs += marked;
      else if (li.categoryType === "Other") other += marked;
      else matAfter += marked;
    });
    subcategories.forEach(sc => { matAfter += parseFloat(sc.lumpSum) || 0; });
    return { matBefore, matAfter, labor, equip, subs, other, total: matAfter + labor + equip + subs + other };
  }, [lineItems, subcategories, globalMarkups]);

  const sectionTotal = (sid) => {
    const subIds = subcategories.filter(sc => sc.sectionId === sid).map(sc => sc.id);
    let t = 0;
    lineItems.filter(li => subIds.includes(li.subcategoryId)).forEach(li => t += lineMarkedUp(li));
    subcategories.filter(sc => sc.sectionId === sid).forEach(sc => t += parseFloat(sc.lumpSum) || 0);
    return t;
  };
  const sectionTotalBefore = (sid) => {
    const subIds = subcategories.filter(sc => sc.sectionId === sid).map(sc => sc.id);
    let t = 0;
    lineItems.filter(li => subIds.includes(li.subcategoryId)).forEach(li => t += lineTotal(li));
    return t;
  };
  const subcatTotal = (scid) => {
    const sc = subcategories.find(x => x.id === scid);
    let t = 0;
    lineItems.filter(li => li.subcategoryId === scid).forEach(li => t += lineMarkedUp(li));
    t += parseFloat(sc?.lumpSum) || 0;
    return t;
  };

  const applyGlobalMarkup = (type, val) => {
    setGlobalMarkups(gm => ({ ...gm, [type]: parseFloat(val) || 0 }));
    setSubcategories(scs => scs.map(sc => ({ ...sc, [`${type}Markup`]: null })));
  };

  const renderGroup = (group, subcatId) => {
    const items = lineItems.filter(li => li.subcategoryId === subcatId && li.componentGroupId === group.id);
    return (
      <div key={group.id} style={s.group}>
        <div style={s.groupLabel}>
          <span>▸</span>
          <input style={{ ...s.input, background: "transparent", border: "none", color: C.green, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, padding: 0, width: "auto", flex: 1 }}
            value={group.name} onChange={(e) => renameGroup(group.id, e.target.value)} />
          <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm, color: C.red }} onClick={() => deleteGroup(group.id)}>×</button>
        </div>
        <table style={s.table}>
          <TableHead />
          {items.map(li => <LineItemRow key={li.id} li={li} markup={getMarkup(li.subcategoryId, li.categoryType)} onUpdate={updateLineItem} onDelete={deleteLineItem} onSelectMaster={selectMasterItem} allItems={allItems} />)}
        </table>
        <div style={s.addRow} onClick={() => addLineItem(subcatId, group.id)}>+ Add line item</div>
      </div>
    );
  };

  const renderSubcategory = (sc) => {
    const scGroups = groups.filter(g => g.subcategoryId === sc.id);
    const ungrouped = lineItems.filter(li => li.subcategoryId === sc.id && !li.componentGroupId);
    return (
      <div key={sc.id} style={s.subcat} data-subcat-grid="true">
        <div style={s.subcatHead} onClick={() => toggleSubcategory(sc.id)}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, transform: sc.expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform .15s" }}>▶</span>
            <input style={{ ...s.input, background: "transparent", border: "none", color: C.accent, fontWeight: 600, fontSize: 13, padding: 0, width: "auto" }}
              value={sc.name} onClick={(e) => e.stopPropagation()} onChange={(e) => renameSubcategory(sc.id, e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ ...s.mono, color: C.dim, fontSize: 13 }}>{fmt(subcatTotal(sc.id))}</span>
            <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm, ...s.btnDanger }}
              onClick={(e) => { e.stopPropagation(); deleteSubcategory(sc.id); }}>Delete</button>
          </div>
        </div>
        {sc.expanded && (
          <>
            {scGroups.map(g => renderGroup(g, sc.id))}
            {ungrouped.length > 0 && (
              <div style={s.group}>
                <div style={{ ...s.groupLabel, color: C.dim, background: "transparent" }}><span>○</span> Ungrouped Items</div>
                <table style={s.table}><TableHead />
                  {ungrouped.map(li => <LineItemRow key={li.id} li={li} markup={getMarkup(li.subcategoryId, li.categoryType)} onUpdate={updateLineItem} onDelete={deleteLineItem} onSelectMaster={selectMasterItem} allItems={allItems} />)}
                </table>
              </div>
            )}
            <div style={{ display: "flex", gap: 12, padding: "6px 14px", flexWrap: "wrap" }}>
              <div style={s.addRow} onClick={() => addLineItem(sc.id, null)}>+ Add line item</div>
              <AddGroupInput onAdd={(name) => addGroup(sc.id, name)} />
            </div>
            <div style={s.markupRow}>
              {["materials", "labor", "equipment", "subs", "other"].map((type, i) => (
                <span key={type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {i > 0 && <span style={{ color: C.border, margin: "0 4px" }}>|</span>}
                  <span style={{ fontSize: 12, color: C.dim, textTransform: "capitalize" }}>{type}:</span>
                  <input style={s.markupInput} value={sc[`${type}Markup`] != null ? sc[`${type}Markup`] : globalMarkups[type]}
                    onChange={(e) => updateSubcatMarkup(sc.id, `${type}Markup`, e.target.value)} />
                  <span style={{ fontSize: 11, color: C.muted }}>%</span>
                  <Toggle on={sc[`${type}MarkupEnabled`] !== false} onChange={(v) => updateSubcatMarkup(sc.id, `${type}MarkupEnabled`, v)} />
                </span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "6px 14px", background: `${C.accent}05` }}>
              <span style={{ fontSize: 12, color: C.dim }}>Lump Sum Adjustment:</span>
              <input style={{ ...s.markupInput, width: 80, color: C.accent }} type="number" step="0.01" value={sc.lumpSum || 0}
                onChange={(e) => updateSubcatMarkup(sc.id, "lumpSum", e.target.value)} />
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSection = (sec) => {
    const subs = subcategories.filter(sc => sc.sectionId === sec.id);
    return (
      <div key={sec.id} style={s.section}>
        <div style={s.sectionHead} onClick={() => toggleSection(sec.id)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, transform: sec.expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform .15s" }}>▶</span>
            <input style={{ ...s.input, background: "transparent", border: "none", fontWeight: 600, fontSize: 14, padding: 0, color: C.text, width: "auto" }}
              value={sec.name} onClick={(e) => e.stopPropagation()} onChange={(e) => renameSection(sec.id, e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 12, color: C.dim }}>Before: <span style={{ ...s.mono, color: C.text }}>{fmt(sectionTotalBefore(sec.id))}</span></span>
            <span style={{ ...s.mono, fontSize: 14, color: C.green, fontWeight: 600 }}>{fmt(sectionTotal(sec.id))}</span>
            <button style={{ ...s.btn, ...s.btnGhost, ...s.btnSm, ...s.btnDanger }}
              onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }}>Delete</button>
          </div>
        </div>
        {sec.expanded && (
          <>
            {subs.map(renderSubcategory)}
            <div style={{ padding: "6px 12px" }}>
              <div style={s.addRow} onClick={() => addSubcategory(sec.id)}>+ Add subcategory</div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div>
          <span style={{ color: C.dim, fontSize: 13 }}>
            {onNavigate && (
              <span style={{ cursor: "pointer", marginRight: 4 }} onClick={() => onNavigate("overview")}>← </span>
            )}
            Editing:{" "}
          </span>
          <span style={s.h1}>{projectName}</span>
          {clientName && <span style={{ color: C.dim, fontSize: 12, marginLeft: 12 }}>Client: {clientName}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => onNavigate && onNavigate("overview")}>Cancel</button>
          <button style={{ ...s.btn, ...s.btnGreen }} onClick={() => onSave && onSave({ sections, subcategories, groups, lineItems, totals })}>✓ Save Project</button>
        </div>
      </div>
      <div style={s.toolbar}>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn, ...s.btnPrimary, ...s.btnSm }} onClick={addSection}>+ Add Section</button>
          <button style={{ ...s.btn, ...s.btnSecondary, ...s.btnSm }} onClick={undo} disabled={!history.length}>
            ↶ Undo {history.length > 0 && `(${history.length})`}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: C.muted }}>Global Markup:</span>
          {["materials", "labor", "equipment", "subs", "other"].map(type => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, color: C.dim, textTransform: "capitalize" }}>{type}</span>
              <input style={s.markupInput} value={globalMarkups[type]} onChange={(e) => applyGlobalMarkup(type, e.target.value)} />
              <span style={{ fontSize: 11, color: C.muted }}>%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={s.content}>
        {sections.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>No sections yet</div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>Start by adding a section (e.g., Framing, Roofing, Siding)</div>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={addSection}>+ Add First Section</button>
          </div>
        )}
        {sections.map(renderSection)}
        {sections.length > 0 && (
          <button style={{ ...s.btn, ...s.btnSecondary, width: "100%", justifyContent: "center", padding: 12, marginTop: 8 }} onClick={addSection}>
            + Add Section
          </button>
        )}
      </div>
      <div style={s.summary}>
        <div style={{ display: "flex", gap: 32 }}>
          {[["Materials (before)", fmt(totals.matBefore), C.text], ["Materials (after)", fmt(totals.matAfter), C.amber],
            ["Labor", fmt(totals.labor), C.text], ["Equipment", fmt(totals.equip), C.text],
            ["Subs", fmt(totals.subs), C.text], ["Other", fmt(totals.other), C.text]
          ].map(([label, val, color]) => (
            <div key={label}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600 }}>{label}</div>
              <div style={{ ...s.mono, fontSize: 18, fontWeight: 700, color, marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, fontWeight: 600 }}>Project Total</div>
          <div style={{ ...s.mono, fontSize: 22, fontWeight: 700, color: C.green, marginTop: 2 }}>{fmt(totals.total)}</div>
        </div>
      </div>
    </div>
  );
}
