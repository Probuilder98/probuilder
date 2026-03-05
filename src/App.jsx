import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ProjectDashboard, { INITIAL_PROJECTS } from "./pages/ProjectDashboard";
import ClientDatabase, { INITIAL_CLIENTS } from "./pages/ClientDatabase";
import MaterialsDatabase from "./pages/MaterialsDatabase";
import LaborEquipmentRates from "./pages/LaborEquipmentRates";
import JobOverview from "./pages/JobOverview";
import ProjectBuilder from "./pages/ProjectBuilder";

// Seed data for the builder autocomplete — mirrors the DB page defaults
const SEED_MATERIALS = [
  { id: "sm1", name: '2x4x92 5/8"', supplier: "Massa", unitPrice: 3.27, unit: "ea" },
  { id: "sm2", name: '2x4x104 5/8"', supplier: "Massa", unitPrice: 4.27, unit: "ea" },
  { id: "sm3", name: "2x4x8", supplier: "Massa", unitPrice: 4.18, unit: "ea" },
  { id: "sm4", name: "2x4x10", supplier: "Massa", unitPrice: 5.24, unit: "ea" },
  { id: "sm5", name: "2x4x12", supplier: "Massa", unitPrice: 6.98, unit: "ea" },
  { id: "sm6", name: "2x4x16", supplier: "Massa", unitPrice: 8.47, unit: "ea" },
  { id: "sm7", name: "2x4x20", supplier: "Massa", unitPrice: 12.09, unit: "ea" },
  { id: "sm8", name: "2x6x8", supplier: "Massa", unitPrice: 6.82, unit: "ea" },
  { id: "sm9", name: "2x6x10", supplier: "Massa", unitPrice: 8.53, unit: "ea" },
  { id: "sm10", name: "2x6x12", supplier: "Massa", unitPrice: 10.24, unit: "ea" },
  { id: "sm11", name: "2x12x16", supplier: "Massa", unitPrice: 38.84, unit: "ea" },
  { id: "sm12", name: "2x12x20", supplier: "Massa", unitPrice: 60.80, unit: "ea" },
  { id: "sm13", name: "7/16 OSB", supplier: "Massa", unitPrice: 9.95, unit: "sheet" },
  { id: "sm14", name: "1/2 CDX Plywood", supplier: "Massa", unitPrice: 22.50, unit: "sheet" },
  { id: "sm15", name: "Triad Pacific Rib per sqft", supplier: "Triad", unitPrice: 1.20, unit: "sqft" },
  { id: "sm16", name: "29ga Corrugated Metal 3x12", supplier: "Triad", unitPrice: 32.50, unit: "sheet" },
  { id: "sm17", name: "Ice & Water Shield", supplier: "Pro Tech", unitPrice: 89.00, unit: "roll" },
  { id: "sm18", name: "30# Felt Paper", supplier: "Pro Tech", unitPrice: 22.50, unit: "roll" },
  { id: "sm19", name: "LP SmartSide 4x8", supplier: "Pro Tech", unitPrice: 28.40, unit: "sheet" },
  { id: "sm20", name: "House Wrap 9x150", supplier: "Pro Tech", unitPrice: 148.00, unit: "roll" },
  { id: "sm21", name: "Simpson A35 Clip", supplier: "Home Depot", unitPrice: 1.85, unit: "ea" },
  { id: "sm22", name: "Joist Hanger 2x6", supplier: "Home Depot", unitPrice: 3.42, unit: "ea" },
  { id: "sm23", name: "16d Sinker Nails 50lb", supplier: "Home Depot", unitPrice: 89.00, unit: "box" },
];

const SEED_RATES = [
  { id: "sr1", name: "Logan per day $20", category: "Labor", rate: 250.00, unit: "day" },
  { id: "sr2", name: "Elias per day $23.50", category: "Labor", rate: 293.75, unit: "day" },
  { id: "sr3", name: "Zook per day $40", category: "Labor", rate: 500.00, unit: "day" },
  { id: "sr4", name: "Skytrack Day", category: "Equipment Rentals", rate: 400.00, unit: "day" },
  { id: "sr5", name: "Skytrack Week", category: "Equipment Rentals", rate: 750.00, unit: "week" },
  { id: "sr6", name: "Skid Steer Day", category: "Equipment Rentals", rate: 200.00, unit: "day" },
  { id: "sr7", name: "Crane per hr", category: "Equipment Rentals", rate: 150.00, unit: "hour" },
];

export default function App() {
  // ── Shared state across all pages ──
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [materials, setMaterials] = useState(SEED_MATERIALS);
  const [rates, setRates] = useState(SEED_RATES);

  // ── Navigation ──
  const [activePage, setActivePage] = useState("projects");
  const [activeProjectId, setActiveProjectId] = useState(null);

  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

  const navigate = (page, projectId) => {
    if (projectId) setActiveProjectId(projectId);
    if (page === "projects") setActiveProjectId(null);
    setActivePage(page);
  };

  const handleOpenProject = (projectId) => {
    setActiveProjectId(projectId);
    setActivePage("overview");
  };

  const handleSaveEstimate = (estimateData) => {
    if (!activeProjectId) return;
    setProjects(ps => ps.map(p =>
      p.id === activeProjectId
        ? { ...p, total: Math.round(estimateData.totals?.total || 0), updated: new Date().toISOString().slice(0, 10) }
        : p
    ));
    setActivePage("overview");
  };

  const renderPage = () => {
    switch (activePage) {
      case "projects":
        return <ProjectDashboard projects={projects} setProjects={setProjects} clients={clients} onOpenProject={handleOpenProject} />;
      case "clients":
        return <ClientDatabase clients={clients} setClients={setClients} />;
      case "materials":
        return <MaterialsDatabase materials={materials} onMaterialsChange={setMaterials} />;
      case "rates":
        return <LaborEquipmentRates rates={rates} onRatesChange={setRates} />;
      case "overview":
        return <JobOverview project={activeProject} onNavigate={(page) => navigate(page, activeProjectId)} />;
      case "builder":
        return <ProjectBuilder project={activeProject} materials={materials} rates={rates} onSave={handleSaveEstimate} onNavigate={(page) => navigate(page, activeProjectId)} />;
      default:
        return <ProjectDashboard projects={projects} setProjects={setProjects} clients={clients} onOpenProject={handleOpenProject} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0e1117" }}>
      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        activeProject={activeProject}
        projects={projects}
      />
      <div style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>
        {renderPage()}
      </div>
    </div>
  );
}
