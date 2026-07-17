// Krama public website — shared data.
// Categories and icon map are static (from schema seed).
// jobs / companies / banners are populated at runtime by api.js → KRAMA_API.init().
// Mock data below is shown on localhost (when API is unavailable); live API overrides it on hosting.
window.KRAMA_DATA = {
  banners: [
    {
      id: "1", active: true, title: "Hire top talent in Cambodia",
      message: "Post your job and reach thousands of qualified candidates.", cta: "Post a job",
      ctaUrl: "#register", theme: "teal", icon: "briefcase", image: "", align: "left", fit: "cover",
      start: "", end: "",
    },
  ],
  jobs: [
    { id: 1, title: "Frontend Developer", company: "Smart Axiata", companyId: 2, location: "Phnom Penh", salary: "$800–$1,200/mo", type: "Full-time", remote: false, featured: true, postedAt: "2d ago", category: "Information Technology", description: "<p>We are looking for a skilled Frontend Developer to join our team.</p>", requirements: "<ul><li>3+ years React experience</li><li>Strong CSS skills</li></ul>", benefits: "<ul><li>Health insurance</li><li>Annual bonus</li></ul>", slug: "frontend-developer-smart-axiata", logo: null, salaryMin: 800, salaryMax: 1200 },
    { id: 2, title: "Senior Accountant", company: "ABA Bank", companyId: 1, location: "Phnom Penh", salary: "$900–$1,400/mo", type: "Full-time", remote: false, featured: true, postedAt: "1d ago", category: "Accounting", description: "<p>ABA Bank is seeking an experienced Senior Accountant.</p>", requirements: "<ul><li>5+ years accounting experience</li><li>CPA preferred</li></ul>", benefits: "<ul><li>Medical coverage</li><li>13th month salary</li></ul>", slug: "senior-accountant-aba-bank", logo: null, salaryMin: 900, salaryMax: 1400 },
    { id: 3, title: "Marketing Manager", company: "Cellcard", companyId: 3, location: "Phnom Penh", salary: "$1,000–$1,500/mo", type: "Full-time", remote: false, featured: false, postedAt: "3d ago", category: "Marketing", description: "<p>Lead our marketing team and grow the Cellcard brand.</p>", requirements: "<ul><li>5+ years marketing experience</li><li>Digital marketing skills</li></ul>", benefits: "<ul><li>Free data plan</li><li>Performance bonus</li></ul>", slug: "marketing-manager-cellcard", logo: null, salaryMin: 1000, salaryMax: 1500 },
    { id: 4, title: "HR Officer", company: "Wing Bank", companyId: 4, location: "Phnom Penh", salary: "$600–$900/mo", type: "Full-time", remote: false, featured: false, postedAt: "5d ago", category: "Human Resources", description: "<p>Join Wing Bank as HR Officer supporting recruitment and employee relations.</p>", requirements: "<ul><li>2+ years HR experience</li><li>Knowledge of Cambodian labor law</li></ul>", benefits: "<ul><li>Health insurance</li><li>Training opportunities</li></ul>", slug: "hr-officer-wing-bank", logo: null, salaryMin: 600, salaryMax: 900 },
    { id: 5, title: "Financial Analyst", company: "Manulife", companyId: 5, location: "Phnom Penh", salary: "$1,200–$1,800/mo", type: "Full-time", remote: false, featured: true, postedAt: "1w ago", category: "Finance", description: "<p>Analyse financial data and provide investment insights at Manulife Cambodia.</p>", requirements: "<ul><li>CFA or MBA preferred</li><li>Advanced Excel skills</li></ul>", benefits: "<ul><li>Life insurance</li><li>Annual leave</li></ul>", slug: "financial-analyst-manulife", logo: null, salaryMin: 1200, salaryMax: 1800 },
    { id: 6, title: "Civil Engineer", company: "Borey Peng Huoth", companyId: 6, location: "Phnom Penh", salary: "$800–$1,200/mo", type: "Full-time", remote: false, featured: false, postedAt: "2d ago", category: "Engineering", description: "<p>Join Cambodia's leading real estate developer as a Civil Engineer.</p>", requirements: "<ul><li>Bachelor's in Civil Engineering</li><li>AutoCAD skills</li></ul>", benefits: "<ul><li>Housing allowance</li><li>Medical coverage</li></ul>", slug: "civil-engineer-borey-peng-huoth", logo: null, salaryMin: 800, salaryMax: 1200 },
    { id: 7, title: "IT Support Specialist", company: "Acleda Bank", companyId: 7, location: "Siem Reap", salary: "$500–$700/mo", type: "Full-time", remote: false, featured: false, postedAt: "4d ago", category: "Information Technology", description: "<p>Provide IT support for Acleda Bank's Siem Reap branches.</p>", requirements: "<ul><li>Networking knowledge</li><li>Windows Server experience</li></ul>", benefits: "<ul><li>Staff loans</li><li>Annual bonus</li></ul>", slug: "it-support-acleda-bank", logo: null, salaryMin: 500, salaryMax: 700 },
    { id: 8, title: "Restaurant Manager", company: "Pizza Company", companyId: 8, location: "Phnom Penh", salary: "$700–$1,000/mo", type: "Full-time", remote: false, featured: false, postedAt: "6d ago", category: "Hospitality", description: "<p>Manage daily operations of our Pizza Company outlet.</p>", requirements: "<ul><li>3+ years F&B management</li><li>Customer service skills</li></ul>", benefits: "<ul><li>Meal allowance</li><li>Staff discounts</li></ul>", slug: "restaurant-manager-pizza-company", logo: null, salaryMin: 700, salaryMax: 1000 },
    { id: 9, title: "UX Designer", company: "Smart Axiata", companyId: 2, location: "Phnom Penh", salary: "$900–$1,300/mo", type: "Full-time", remote: true, featured: false, postedAt: "3d ago", category: "Information Technology", description: "<p>Design intuitive digital experiences for Smart Axiata's mobile apps.</p>", requirements: "<ul><li>Figma proficiency</li><li>Portfolio required</li></ul>", benefits: "<ul><li>Remote work option</li><li>Learning budget</li></ul>", slug: "ux-designer-smart-axiata", logo: null, salaryMin: 900, salaryMax: 1300 },
    { id: 10, title: "Loan Officer", company: "Prince Bank", companyId: 9, location: "Battambang", salary: "$550–$800/mo", type: "Full-time", remote: false, featured: false, postedAt: "1w ago", category: "Finance", description: "<p>Evaluate and process loan applications at Prince Bank Battambang branch.</p>", requirements: "<ul><li>Finance or Banking degree</li><li>Credit analysis skills</li></ul>", benefits: "<ul><li>Commission</li><li>Health insurance</li></ul>", slug: "loan-officer-prince-bank", logo: null, salaryMin: 550, salaryMax: 800 },
    { id: 11, title: "Nurse", company: "Royal Phnom Penh Hospital", companyId: 10, location: "Phnom Penh", salary: "$600–$900/mo", type: "Full-time", remote: false, featured: false, postedAt: "2d ago", category: "Healthcare", description: "<p>Join our nursing team at Royal Phnom Penh Hospital.</p>", requirements: "<ul><li>Nursing degree</li><li>1+ years clinical experience</li></ul>", benefits: "<ul><li>Medical benefits</li><li>Uniform provided</li></ul>", slug: "nurse-royal-phnom-penh-hospital", logo: null, salaryMin: 600, salaryMax: 900 },
    { id: 12, title: "Sales Executive", company: "Chip Mong", companyId: 11, location: "Phnom Penh", salary: "$500–$800/mo", type: "Full-time", remote: false, featured: false, postedAt: "5d ago", category: "Marketing", description: "<p>Drive B2B sales for Chip Mong Group's product lines.</p>", requirements: "<ul><li>Sales experience</li><li>Khmer & English communication</li></ul>", benefits: "<ul><li>Commission</li><li>Travel allowance</li></ul>", slug: "sales-executive-chip-mong", logo: null, salaryMin: 500, salaryMax: 800 },
  ],
  companies: [
    { id: 1, name: "ABA Bank", industry: "Banking", location: "Phnom Penh", openJobs: 8, verified: true, logo: null },
    { id: 2, name: "Smart Axiata", industry: "Telecommunications", location: "Phnom Penh", openJobs: 5, verified: true, logo: null },
    { id: 3, name: "Cellcard", industry: "Telecommunications", location: "Phnom Penh", openJobs: 4, verified: true, logo: null },
    { id: 4, name: "Wing Bank", industry: "Banking & Fintech", location: "Phnom Penh", openJobs: 6, verified: true, logo: null },
    { id: 5, name: "Manulife", industry: "Insurance", location: "Phnom Penh", openJobs: 3, verified: true, logo: null },
    { id: 6, name: "Borey Peng Huoth", industry: "Real Estate", location: "Phnom Penh", openJobs: 7, verified: true, logo: null },
    { id: 7, name: "Acleda Bank", industry: "Banking", location: "Phnom Penh", openJobs: 10, verified: true, logo: null },
    { id: 8, name: "Pizza Company", industry: "Food & Beverage", location: "Phnom Penh", openJobs: 2, verified: false, logo: null },
    { id: 9, name: "Prince Bank", industry: "Banking", location: "Phnom Penh", openJobs: 4, verified: true, logo: null },
    { id: 10, name: "Royal Phnom Penh Hospital", industry: "Healthcare", location: "Phnom Penh", openJobs: 5, verified: true, logo: null },
    { id: 11, name: "Chip Mong", industry: "Conglomerate", location: "Phnom Penh", openJobs: 9, verified: true, logo: null },
    { id: 12, name: "Chip Mong Retail", industry: "Retail", location: "Phnom Penh", openJobs: 3, verified: true, logo: null },
  ],
  categories: [
    { name: "Information Technology", icon: "monitor", count: 3 },
    { name: "Accounting", icon: "calculator", count: 1 },
    { name: "Finance", icon: "landmark", count: 2 },
    { name: "Marketing", icon: "megaphone", count: 2 },
    { name: "Human Resources", icon: "users", count: 1 },
    { name: "Engineering", icon: "hard-hat", count: 1 },
  ],
};

// Original monogram logos (not real trademarks) — map company name → SVG path.
window.KRAMA_LOGOS = {
  "ABA Bank": "../../assets/logos/aba-bank.svg",
  "Smart Axiata": "../../assets/logos/smart-axiata.svg",
  "Wing Bank": "../../assets/logos/wing-bank.svg",
  "Manulife": "../../assets/logos/manulife.svg",
  "Borey Peng Huoth": "../../assets/logos/borey-peng-huoth.svg",
  "Chip Mong": "../../assets/logos/chip-mong.svg",
  "Chip Mong Retail": "../../assets/logos/chip-mong-retail.svg",
  "Cellcard": "../../assets/logos/cellcard.svg",
  "Acleda Bank": "../../assets/logos/acleda-bank.svg",
  "Royal Phnom Penh Hospital": "../../assets/logos/royal-phnom-penh-hospital.svg",
  "Prince Bank": "../../assets/logos/prince-bank.svg",
  "Pizza Company": "../../assets/logos/pizza-company.svg",
};
// Attach logo to every job + company by name.
(function () {
  var L = window.KRAMA_LOGOS, D = window.KRAMA_DATA;
  (D.jobs || []).forEach(function (j) { if (L[j.company]) j.logo = L[j.company]; });
  (D.companies || []).forEach(function (c) { if (L[c.name]) c.logo = L[c.name]; });
})();
