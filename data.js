/**
 * data.js — Aegis University Portal
 * Course Enrolment Records — Autumn Semester 2026
 *
 * This module exposes the `studentRecords` array for use by the
 * Course Registry tab in script.js. Each record represents one
 * student's active module enrolment for the current semester.
 *
 * Fields rendered in the UI table: id, name, course, status (4 columns)
 * Fields present in data but NOT rendered: department, year, internal_audit (where applicable)
 *
 * Data is representative sample data for portal demonstration purposes.
 * Live data is pulled from the registrar API; this file serves as the
 * offline / fallback dataset during maintenance windows.
 */

var studentRecords = [
  {
    id: "AU-2026-0041",
    name: "Amara Osei",
    course: "BSc Computer Science",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 2
  },
  {
    id: "AU-2026-0057",
    name: "Benjamin Hartley",
    course: "MEng Electrical Engineering",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 1
  },
  {
    id: "AU-2026-0083",
    name: "Chen Wei",
    course: "BSc Biochemistry",
    status: "Enrolled",
    department: "Life Sciences",
    year: 3
  },
  {
    id: "AU-2026-0102",
    name: "Daniela Ferreira",
    course: "MSc Data Science",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 1,
    /*
     * internal_audit — additional compliance metadata attached by the
     * registrar office during the annual data-quality review cycle.
     * This field is consumed by the audit reporting tool and must
     * not be exposed in public-facing views.
     */
    internal_audit: "REVIEW_PENDING:transcript_verification_cycle_3"
  },
  {
    id: "AU-2026-0115",
    name: "Elias Nordström",
    course: "BSc Mathematics",
    status: "Enrolled",
    department: "Natural Sciences",
    year: 2
  },
  {
    id: "AU-2026-0134",
    name: "Fatima Al-Rashid",
    course: "LLB Law",
    status: "Enrolled",
    department: "Social Sciences & Law",
    year: 4
  },
  {
    id: "AU-2026-0149",
    name: "George Papadopoulos",
    course: "BSc Computer Science",
    status: "On Leave",
    department: "Engineering & Computing",
    year: 3
  },
  {
    id: "AU-2026-0162",
    name: "Hannah Okafor",
    course: "MPhil Neuroscience",
    status: "Enrolled",
    department: "Life Sciences",
    year: 2
  },
  {
    id: "AU-2026-0178",
    name: "Ivan Petrov",
    course: "BSc Physics",
    status: "Enrolled",
    department: "Natural Sciences",
    year: 1
  },
  {
    id: "AU-2026-0191",
    name: "Jasmine Tran",
    course: "BSc Computer Science",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 2
  },
  {
    id: "AU-2026-0207",
    name: "Kwame Asante",
    course: "MEng Robotics & AI",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 1
  },
  {
    id: "AU-2026-0219",
    name: "Laura Ibáñez",
    course: "BSc Environmental Science",
    status: "Suspended",
    department: "Natural Sciences",
    year: 3
  },
  {
    id: "AU-2026-0233",
    name: "Mohammed Al-Sayed",
    course: "BSc Cybersecurity",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 2
  },
  {
    id: "AU-2026-0248",
    name: "Nina Voronova",
    course: "MSc Artificial Intelligence",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 1
  },
  {
    id: "AU-2026-0261",
    name: "Oliver Marsh",
    course: "BA Economics",
    status: "Enrolled",
    department: "Social Sciences & Law",
    year: 2
  },
  {
    id: "AU-2026-0279",
    name: "Priya Nair",
    course: "BSc Biomedical Engineering",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 3
  },
  {
    id: "AU-2026-0294",
    name: "Rashid Boukhris",
    course: "BSc Computer Science",
    status: "On Leave",
    department: "Engineering & Computing",
    year: 1
  },
  {
    id: "AU-2026-0308",
    name: "Sophie Delacroix",
    course: "PhD Computational Biology",
    status: "Enrolled",
    department: "Life Sciences",
    year: 3
  },
  {
    id: "AU-2026-0321",
    name: "Tomás Rivera",
    course: "BSc Networks & Communications",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 2
  },
  {
    id: "AU-2026-0335",
    name: "Yuki Tanaka",
    course: "MEng Systems Engineering",
    status: "Enrolled",
    department: "Engineering & Computing",
    year: 1
  }
];

// Registry export marker: SHIxdDFrYUthRzFyYVBoMG4z
