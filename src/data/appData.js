// ─── Customers (Empty - start fresh) ──────────────────────────────────────────
export const INITIAL_CUSTOMERS = [];

// ─── Projects (Empty - start fresh) ───────────────────────────────────────────
export const INITIAL_PROJECTS = [];

// ─── Site Surveys (Empty - start fresh) ───────────────────────────────────────
export const INITIAL_SURVEYS = [];

// ─── Installations (Empty - start fresh) ──────────────────────────────────────
export const INITIAL_INSTALLATIONS = [];

// ─── Inventory ─────────────────────────────────────────────────────────────────
export const INITIAL_INVENTORY = [
  { id: 'INV-001', name: 'Solar Panel 400W Mono', category: 'Panels', brand: 'Waaree', unit: 'Nos', stock: 45, minStock: 20, unitPrice: 8500, location: 'Warehouse A', lastUpdated: '2026-10-14' },
  { id: 'INV-002', name: 'Solar Panel 500W Mono', category: 'Panels', brand: 'Adani Solar', unit: 'Nos', stock: 30, minStock: 15, unitPrice: 10200, location: 'Warehouse A', lastUpdated: '2026-10-13' },
  { id: 'INV-003', name: 'Fronius Primo 3.0 Inverter', category: 'Inverters', brand: 'Fronius', unit: 'Nos', stock: 5, minStock: 3, unitPrice: 45000, location: 'Warehouse B', lastUpdated: '2026-10-12' },
  { id: 'INV-004', name: 'SMA SB 5.0 Inverter', category: 'Inverters', brand: 'SMA', unit: 'Nos', stock: 4, minStock: 3, unitPrice: 58000, location: 'Warehouse B', lastUpdated: '2026-10-10' },
  { id: 'INV-005', name: 'Growatt MIN 3000 Inverter', category: 'Inverters', brand: 'Growatt', unit: 'Nos', stock: 8, minStock: 4, unitPrice: 28000, location: 'Warehouse B', lastUpdated: '2026-10-14' },
  { id: 'INV-006', name: 'DC Cable 6mm² (Red)', category: 'Cables', brand: 'Polycab', unit: 'Meters', stock: 800, minStock: 200, unitPrice: 42, location: 'Warehouse A', lastUpdated: '2026-10-11' },
  { id: 'INV-007', name: 'DC Cable 6mm² (Black)', category: 'Cables', brand: 'Polycab', unit: 'Meters', stock: 750, minStock: 200, unitPrice: 42, location: 'Warehouse A', lastUpdated: '2026-10-11' },
  { id: 'INV-008', name: 'AC Cable 4mm² (3-Phase)', category: 'Cables', brand: 'KEI', unit: 'Meters', stock: 400, minStock: 100, unitPrice: 85, location: 'Warehouse A', lastUpdated: '2026-10-09' },
  { id: 'INV-009', name: 'Mounting Structure (GI)', category: 'Structures', brand: 'Ganges Solar', unit: 'Sets', stock: 18, minStock: 10, unitPrice: 12000, location: 'Warehouse C', lastUpdated: '2026-10-14' },
  { id: 'INV-010', name: 'MC4 Connector Pair', category: 'Accessories', brand: 'Amphenol', unit: 'Pairs', stock: 200, minStock: 50, unitPrice: 85, location: 'Warehouse A', lastUpdated: '2026-10-13' },
  { id: 'INV-011', name: 'DC Junction Box', category: 'Accessories', brand: 'Legrand', unit: 'Nos', stock: 12, minStock: 5, unitPrice: 1800, location: 'Warehouse B', lastUpdated: '2026-10-12' },
  { id: 'INV-012', name: 'Lightning Arrester', category: 'Safety', brand: 'OBO Bettermann', unit: 'Nos', stock: 15, minStock: 8, unitPrice: 3200, location: 'Warehouse B', lastUpdated: '2026-10-10' },
  { id: 'INV-013', name: 'Net Meter (KSEB)', category: 'Meters', brand: 'HPL', unit: 'Nos', stock: 3, minStock: 5, unitPrice: 6500, location: 'Warehouse B', lastUpdated: '2026-10-08' },
  { id: 'INV-014', name: 'Earth Cable 6mm²', category: 'Cables', brand: 'Polycab', unit: 'Meters', stock: 300, minStock: 100, unitPrice: 55, location: 'Warehouse A', lastUpdated: '2026-10-13' },
];

// ─── Team ─────────────────────────────────────────────────────────────────────
export const INITIAL_TEAM = [
  { id: 'EMP-001', name: 'Krishnanunni K', role: 'Marketing Head', team: 'Management', phone: '9876543210', email: 'krishna@royaleye.in', status: 'Active', joined: '2024-01-15', skills: ['Sales', 'Customer Relations', 'Site Survey'], currentProject: null, avatar: 'KK', completedJobs: 42 },
  { id: 'EMP-002', name: 'Sajin P', role: 'Site Surveyor', team: 'Team A (Survey)', phone: '9845678901', email: 'sajin@royaleye.in', status: 'Active', joined: '2024-03-10', skills: ['Site Survey', 'AutoCAD', 'Load Calculation'], currentProject: null, avatar: 'SP', completedJobs: 38 },
  { id: 'EMP-003', name: 'Arun Menon', role: 'Lead Installer', team: 'Team B (Install)', phone: '9912378456', email: 'arun@royaleye.in', status: 'Active', joined: '2024-02-20', skills: ['Panel Mounting', 'Electrical', 'Inverter Setup'], currentProject: null, avatar: 'AM', completedJobs: 65 },
  { id: 'EMP-004', name: 'Bibin Thomas', role: 'Electrician', team: 'Team B (Install)', phone: '9987654321', email: 'bibin@royaleye.in', status: 'Active', joined: '2024-04-05', skills: ['Electrical Work', 'Cable Laying', 'Testing'], currentProject: null, avatar: 'BT', completedJobs: 51 },
  { id: 'EMP-005', name: 'Rajan V', role: 'Project Manager', team: 'Management', phone: '9876501234', email: 'rajan@royaleye.in', status: 'Active', joined: '2023-11-01', skills: ['Project Management', 'KSEB Liaison', 'QA'], currentProject: null, avatar: 'RV', completedJobs: 87 },
  { id: 'EMP-006', name: 'Deepak R', role: 'Technician', team: 'Team C', phone: '9654123789', email: 'deepak@royaleye.in', status: 'Active', joined: '2024-06-15', skills: ['Inverter Setup', 'System Testing', 'Maintenance'], currentProject: null, avatar: 'DR', completedJobs: 29 },
  { id: 'EMP-007', name: 'Anas M', role: 'Technician', team: 'Team A', phone: '9741258963', email: 'anas@royaleye.in', status: 'On Leave', joined: '2024-05-20', skills: ['Panel Mounting', 'Electrical', 'Cable Laying'], currentProject: null, avatar: 'AN', completedJobs: 33 },
  { id: 'EMP-008', name: 'Faisal K', role: 'Helper', team: 'Team B', phone: '9865432107', email: 'faisal@royaleye.in', status: 'Active', joined: '2024-08-01', skills: ['Panel Mounting', 'Cable Laying'], currentProject: null, avatar: 'FK', completedJobs: 18 },
];
