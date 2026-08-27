export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  floors: string[];
  lat?: number;
  lng?: number;
}

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "main-library",
    name: "Main Library (W.E.B. Du Bois)",
    code: "LIB",
    floors: ["Ground", "Floor 1", "Floor 2", "Floor 3", "Floor 4", "Floor 5"],
    lat: 42.3897,
    lng: -72.5283,
  },
  {
    id: "student-union",
    name: "Student Union & Campus Center",
    code: "CC",
    floors: ["Lower Level", "Ground", "Floor 1", "Floor 2", "Floor 3"],
    lat: 42.3918,
    lng: -72.5262,
  },
  {
    id: "science-engineering",
    name: "Science & Engineering Complex",
    code: "SEC",
    floors: ["Ground", "Floor 1", "Floor 2", "Floor 3"],
    lat: 42.3935,
    lng: -72.5312,
  },
  {
    id: "recreation-center",
    name: "Campus Recreation & Gym Center",
    code: "REC",
    floors: ["Ground", "Floor 1", "Floor 2"],
    lat: 42.3882,
    lng: -72.5335,
  },
  {
    id: "dining-commons-north",
    name: "Worcester Dining Commons",
    code: "DC-N",
    floors: ["Ground", "Floor 1", "Floor 2"],
    lat: 42.3951,
    lng: -72.5241,
  },
  {
    id: "dining-commons-south",
    name: "Berkshire Dining Commons",
    code: "DC-S",
    floors: ["Ground", "Floor 1", "Floor 2"],
    lat: 42.3842,
    lng: -72.5298,
  },
  {
    id: "humanities-hall",
    name: "Integrative Learning & Humanities Hall",
    code: "ILC",
    floors: ["Ground", "Floor 1", "Floor 2", "Floor 3", "Floor 4"],
    lat: 42.3905,
    lng: -72.5274,
  },
  {
    id: "business-innovation-hub",
    name: "Business Innovation Hub",
    code: "BIH",
    floors: ["Ground", "Floor 1", "Floor 2", "Floor 3"],
    lat: 42.3871,
    lng: -72.5255,
  },
  {
    id: "athletic-stadium",
    name: "Athletic Stadium & Fields",
    code: "STAD",
    floors: ["Field Level", "Concourse", "Bleachers"],
    lat: 42.3789,
    lng: -72.5361,
  },
];
