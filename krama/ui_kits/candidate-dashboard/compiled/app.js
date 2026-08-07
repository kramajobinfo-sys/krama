function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Krama candidate dashboard — wired to real API
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const NS = window.KramaDesignSystem_1a6f65;
  // Home page target: clean "/" in production, relative path in local dev (same host check as api.js).
  const HOME_URL = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(location.hostname) ? "../public-website/index.html" : "/";
  const {
    Button,
    Badge,
    Avatar,
    Card,
    StatCard,
    Tabs,
    ProgressTracker,
    JobCard,
    EmptyState,
    Input,
    Textarea,
    Select,
    Tag,
    Switch,
    Modal
  } = NS;

  // ── i18n ────────────────────────────────────────────────────────────────────
  // Khmer strings for the candidate dashboard, merged into the shared KRAMA_I18N dict
  // (loaded from ../public-website/i18n.js). T("English source") → Khmer when km is active.
  var CAND_KM = {
    // Nav + shell
    "Dashboard": "ផ្ទាំងគ្រប់គ្រង",
    "My applications": "ពាក្យសុំការងាររបស់ខ្ញុំ",
    "Saved jobs": "ការងារបានរក្សាទុក",
    "Recommended": "បានណែនាំ",
    "Following": "កំពុងតាមដាន",
    "Job alerts": "ការជូនដំណឹងការងារ",
    "Messages": "សារ",
    "Résumé builder": "បង្កើតប្រវត្តិរូប",
    "Profile": "ប្រវត្តិរូប",
    "Help & support": "ជំនួយ",
    "Profile strength": "កម្រិតប្រវត្តិរូប",
    "Profile complete": "ប្រវត្តិរូបពេញលេញ",
    "Sign out": "ចាកចេញ",
    "Welcome back": "សូមស្វាគមន៍ត្រឡប់មកវិញ",
    "Recommended for you": "បានណែនាំសម្រាប់អ្នក",
    "Companies I follow": "ក្រុមហ៊ុនដែលខ្ញុំតាមដាន",
    // Dashboard / overview
    "Applied jobs": "ការងារបានដាក់ពាក្យ",
    "Interviews": "ការសម្ភាសន៍",
    "Application pipeline": "ដំណើរការពាក្យសុំ",
    "Applied": "បានដាក់ពាក្យ",
    "Reviewed": "បានពិនិត្យ",
    "Shortlisted": "បានជ្រើសរើស",
    "Interview": "សម្ភាសន៍",
    "Offered": "បានផ្តល់ជូន",
    "Recent applications": "ពាក្យសុំថ្មីៗ",
    "View all": "មើលទាំងអស់",
    "No applications yet. Start applying!": "មិនទាន់មានពាក្យសុំនៅឡើយ។ ចាប់ផ្តើមដាក់ពាក្យ!",
    // Completion meter
    "Complete your profile": "បំពេញប្រវត្តិរូបរបស់អ្នក",
    "Guided setup": "ការណែនាំរៀបចំ",
    "A complete profile gets far more employer views.": "ប្រវត្តិរូបពេញលេញទទួលបានការមើលពីនិយោជកកាន់តែច្រើន។",
    "step left": "ជំហានទៀត",
    "steps left": "ជំហានទៀត",
    "Full name": "ឈ្មោះពេញ",
    "Email address": "អាសយដ្ឋានអ៊ីមែល",
    "Phone number": "លេខទូរស័ព្ទ",
    "Profile photo": "រូបថតប្រវត្តិរូប",
    "About you": "អំពីអ្នក",
    "Professional headline": "ចំណងជើងវិជ្ជាជីវៈ",
    "Career summary": "សេចក្តីសង្ខេបអាជីព",
    "Work experience": "បទពិសោធន៍ការងារ",
    "Education": "ការសិក្សា",
    "Skills": "ជំនាញ",
    "Upload your CV": "បង្ហោះ CV របស់អ្នក",
    // Onboarding wizard
    "Set up your profile": "រៀបចំប្រវត្តិរូបរបស់អ្នក",
    "Jobs you want": "ការងារដែលអ្នកចង់បាន",
    "Upload CV": "បង្ហោះ CV",
    "Step": "ជំហាន",
    "of": "ក្នុងចំណោម",
    "Tell us what you're looking for — we'll email you matching jobs.": "ប្រាប់យើងពីអ្វីដែលអ្នកកំពុងស្វែងរក — យើងនឹងផ្ញើអ៊ីមែលការងារដែលត្រូវគ្នាទៅអ្នក។",
    "Job title you want": "ចំណងជើងការងារដែលអ្នកចង់បាន",
    "Field / category": "វិស័យ / ប្រភេទ",
    "Any field": "វិស័យណាមួយ",
    "Location": "ទីតាំង",
    "Any location": "ទីតាំងណាមួយ",
    "Employment type": "ប្រភេទការងារ",
    "Any type": "ប្រភេទណាមួយ",
    "Full time": "ពេញម៉ោង",
    "Part time": "ក្រៅម៉ោង",
    "Contract": "កិច្ចសន្យា",
    "Internship": "កម្មសិក្សា",
    "Upload your CV so you can apply to jobs in one click.": "បង្ហោះ CV របស់អ្នក ដើម្បីអាចដាក់ពាក្យការងារបានក្នុងមួយចុច។",
    "Upload your CV file": "បង្ហោះឯកសារ CV របស់អ្នក",
    "Browse files": "រកមើលឯកសារ",
    "Choose a different file": "ជ្រើសរើសឯកសារផ្សេង",
    "Add your most recent role — employers see this on your profile.": "បន្ថែមតួនាទីថ្មីបំផុតរបស់អ្នក — និយោជកឃើញវានៅលើប្រវត្តិរូបរបស់អ្នក។",
    "Position": "មុខតំណែង",
    "Company name": "ឈ្មោះក្រុមហ៊ុន",
    "Years": "ឆ្នាំ",
    "You can add more roles later in the Résumé builder.": "អ្នកអាចបន្ថែមតួនាទីច្រើនទៀតនៅពេលក្រោយ។",
    "Back": "ថយក្រោយ",
    "Skip this step": "រំលងជំហាននេះ",
    "Continue": "បន្ត",
    "Finish setup": "បញ្ចប់ការរៀបចំ",
    "CV already on file": "មាន CV រួចហើយ",
    // Common
    "Loading…": "កំពុងផ្ទុក…",
    "Saving…": "កំពុងរក្សាទុក…",
    "Uploading…": "កំពុងបង្ហោះ…",
    "Previous": "មុន",
    "Next": "បន្ទាប់",
    "Add": "បន្ថែម",
    "Cancel": "បោះបង់",
    "Search": "ស្វែងរក",
    "Clear": "សម្អាត",
    "No results": "គ្មានលទ្ធផល",
    "Rejected": "បានបដិសេធ",
    "View": "មើល",
    "All": "ទាំងអស់",
    // Applications
    "total applications": "ពាក្យសុំសរុប",
    "No applications found.": "រកមិនឃើញពាក្យសុំ។",
    "Message": "ផ្ញើសារ",
    "Withdraw": "ដកពាក្យ",
    "Send message": "ផ្ញើសារ",
    "Sending…": "កំពុងផ្ញើ…",
    "Employer": "និយោជក",
    // Saved jobs
    "jobs saved": "ការងារបានរក្សាទុក",
    "No saved jobs yet. Browse jobs and click the bookmark icon.": "មិនទាន់មានការងារបានរក្សាទុក។ រកមើលការងារ ហើយចុចរូបសញ្ញាចំណាំ។",
    // Recommended
    "jobs matched": "ការងារត្រូវគ្នា",
    "Matches your field": "ត្រូវនឹងវិស័យរបស់អ្នក",
    "Matches your level": "ត្រូវនឹងកម្រិតរបស់អ្នក",
    "Apply to or save some jobs first — we'll personalise these recommendations based on your activity.": "ដាក់ពាក្យ ឬរក្សាទុកការងារមុនសិន — យើងនឹងធ្វើឱ្យការណែនាំទាំងនេះផ្ទាល់ខ្លួនតាមសកម្មភាពរបស់អ្នក។",
    // Profile
    "How you appear to employers.": "របៀបដែលអ្នកបង្ហាញទៅនិយោជក។",
    "Change photo": "ប្តូររូបថត",
    "Email": "អ៊ីមែល",
    "Phone": "ទូរស័ព្ទ",
    "Bio / Description": "ជីវប្រវត្តិ / ការពិពណ៌នា",
    "CV / Resume visibility": "ភាពមើលឃើញ CV",
    "Controls who can download your uploaded CV file.": "គ្រប់គ្រងអ្នកដែលអាចទាញយកឯកសារ CV របស់អ្នក។",
    "Public — anyone can view": "សាធារណៈ — នរណាក៏មើលបាន",
    "Employers only — recruiters who review your application": "និយោជកតែប៉ុណ្ណោះ — អ្នកជ្រើសរើសដែលពិនិត្យពាក្យសុំ",
    "Private — only you can access": "ឯកជន — មានតែអ្នកទេអាចចូលបាន",
    "Save changes": "រក្សាទុកការផ្លាស់ប្តូរ",
    "Change password": "ប្តូរពាក្យសម្ងាត់",
    "Choose a strong password of at least 8 characters.": "ជ្រើសរើសពាក្យសម្ងាត់ខ្លាំង យ៉ាងតិច ៨ តួអក្សរ។",
    "Current password": "ពាក្យសម្ងាត់បច្ចុប្បន្ន",
    "New password": "ពាក្យសម្ងាត់ថ្មី",
    "Confirm new password": "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី",
    "Update password": "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់",
    "Updating…": "កំពុងធ្វើបច្ចុប្បន្នភាព…",
    // Résumé builder
    "Build your CV to attach when applying for jobs.": "បង្កើត CV របស់អ្នកដើម្បីភ្ជាប់ពេលដាក់ពាក្យការងារ។",
    "Download CV": "ទាញយក CV",
    "Save resume": "រក្សាទុកប្រវត្តិរូប",
    "Resume saved successfully!": "បានរក្សាទុកប្រវត្តិរូបដោយជោគជ័យ!",
    "Upload CV file": "បង្ហោះឯកសារ CV",
    "CV uploaded": "បានបង្ហោះ CV",
    "Replace CV": "ជំនួស CV",
    "No CV uploaded yet. Upload a PDF or DOC (max 5 MB).": "មិនទាន់បង្ហោះ CV។ បង្ហោះ PDF ឬ DOC (អតិបរមា ៥ MB)។",
    "Personal summary": "សេចក្តីសង្ខេបផ្ទាល់ខ្លួន",
    "Headline / Job title": "ចំណងជើង / មុខតំណែង",
    "Summary": "សេចក្តីសង្ខេប",
    "No education entries yet.": "មិនទាន់មានការសិក្សា។",
    "School / University": "សាលា / សាកលវិទ្យាល័យ",
    "Degree": "សញ្ញាបត្រ",
    "No experience entries yet.": "មិនទាន់មានបទពិសោធន៍។",
    "Job title": "មុខតំណែង",
    "Company": "ក្រុមហ៊ុន",
    "Description": "ការពិពណ៌នា",
    "No skills added yet.": "មិនទាន់មានជំនាញ។",
    "Certifications": "វិញ្ញាបនបត្រ",
    "No certifications yet.": "មិនទាន់មានវិញ្ញាបនបត្រ។",
    "Certification name": "ឈ្មោះវិញ្ញាបនបត្រ",
    "Year": "ឆ្នាំ",
    // Following
    "You'll get an email when a followed company posts a new job.": "អ្នកនឹងទទួលបានអ៊ីមែលពេលក្រុមហ៊ុនដែលអ្នកតាមដានបង្ហោះការងារថ្មី។",
    "Not following anyone yet": "មិនទាន់តាមដាននរណាទេ",
    "Visit a company profile and click Follow to stay notified of new jobs.": "ចូលទៅកាន់ប្រវត្តិរូបក្រុមហ៊ុន ហើយចុចតាមដាន ដើម្បីទទួលដំណឹងការងារថ្មី។",
    "Unfollow": "ឈប់តាមដាន",
    // Job alerts
    "Your job alerts": "ការជូនដំណឹងការងាររបស់អ្នក",
    "Get an email the moment a matching role is posted. Up to 10 alerts.": "ទទួលអ៊ីមែលភ្លាមៗពេលមានការងារត្រូវគ្នាបានបង្ហោះ។ រហូតដល់ ១០ ការជូនដំណឹង។",
    "+ New alert": "+ ការជូនដំណឹងថ្មី",
    "Create a new alert": "បង្កើតការជូនដំណឹងថ្មី",
    "Keyword": "ពាក្យគន្លឹះ",
    "Category": "ប្រភេទ",
    "Any category": "ប្រភេទណាមួយ",
    "Job type": "ប្រភេទការងារ",
    "Work mode": "របៀបធ្វើការ",
    "Any": "ណាមួយ",
    "Remote only": "ពីចម្ងាយតែប៉ុណ្ណោះ",
    "On-site / hybrid": "នៅកន្លែង / ចម្រុះ",
    "Full-time": "ពេញម៉ោង",
    "Part-time": "ក្រៅម៉ោង",
    "Save alert": "រក្សាទុកការជូនដំណឹង",
    "No job alerts yet": "មិនទាន់មានការជូនដំណឹងការងារ",
    "Create an alert and we'll email you when a matching role is posted.": "បង្កើតការជូនដំណឹង ហើយយើងនឹងផ្ញើអ៊ីមែលពេលមានការងារត្រូវគ្នា។",
    "All new jobs": "ការងារថ្មីទាំងអស់",
    "Remote": "ពីចម្ងាយ",
    // Messages
    "Conversations": "ការសន្ទនា",
    "No conversations yet.": "មិនទាន់មានការសន្ទនា។",
    "Employers can message you directly after viewing your application.": "និយោជកអាចផ្ញើសារទៅអ្នកដោយផ្ទាល់ បន្ទាប់ពីមើលពាក្យសុំរបស់អ្នក។",
    "Send": "ផ្ញើ",
    "Select a conversation to read messages": "ជ្រើសរើសការសន្ទនាដើម្បីអានសារ",
    // Login
    "Candidate sign in": "ការចូលរបស់បេក្ខជន",
    "Access your applications and saved jobs.": "ចូលមើលពាក្យសុំ និងការងារបានរក្សាទុករបស់អ្នក។",
    "Password": "ពាក្យសម្ងាត់",
    "Sign in": "ចូល",
    "Signing in…": "កំពុងចូល…",
    // Digital CV
    "My Digital CV": "CV ឌីជីថលរបស់ខ្ញុំ",
    "Share your CV with a link or QR code.": "ចែករំលែក CV របស់អ្នកជាមួយតំណ ឬកូដ QR។",
    "Scan the code or share the link — anyone can view your CV, no login needed.": "ស្កេនកូដ ឬចែករំលែកតំណ — នរណាក៏អាចមើល CV របស់អ្នកបាន ដោយមិនចាំបាច់ចូល។",
    "Copy link": "ចម្លងតំណ",
    "Copied!": "បានចម្លង!",
    "Open public CV": "បើក CV សាធារណៈ",
    "Your CV is private, so this link won't open. Set visibility to Employers or Public in your Profile to share it.": "CV របស់អ្នកជាឯកជន ដូច្នេះតំណនេះនឹងមិនបើកទេ។ កំណត់ភាពមើលឃើញទៅ និយោជក ឬ សាធារណៈ ក្នុងប្រវត្តិរូប ដើម្បីចែករំលែក។"
  };
  try {
    if (window.KRAMA_I18N && window.KRAMA_I18N.km) {
      Object.assign(window.KRAMA_I18N.km, CAND_KM);
    } else {
      window.KRAMA_I18N = {
        km: CAND_KM
      };
    }
  } catch (e) {}
  var T = function (s) {
    return typeof window.KRAMA_T === "function" ? window.KRAMA_T(s) : s;
  };
  const LucideIcon = React.memo(function ({
    name,
    size
  }) {
    var ref = React.useRef(null);
    React.useEffect(function () {
      if (ref.current && window.lucide) {
        ref.current.innerHTML = '<i data-lucide="' + name + '" style="width:' + size + 'px;height:' + size + 'px"></i>';
        window.lucide.createIcons({
          el: ref.current
        });
      }
    }, [name, size]);
    return /*#__PURE__*/React.createElement("span", {
      ref: ref,
      style: {
        display: "inline-flex",
        alignItems: "center"
      }
    });
  });
  const I = (n, s) => /*#__PURE__*/React.createElement(LucideIcon, {
    name: n,
    size: s || 18
  });

  // Lightweight rich-text editor (same toolbar as the employer job/company forms) so
  // candidates can format their summary/experience without writing HTML by hand.
  function RichEditor({
    label,
    value,
    onChange,
    placeholder,
    rows
  }) {
    const ref = React.useRef(null);
    React.useEffect(function () {
      if (ref.current) ref.current.innerHTML = value || "";
    }, []);
    const exec = function (cmd) {
      if (ref.current) ref.current.focus();
      document.execCommand(cmd, false, null);
    };
    const tb = {
      border: "1px solid var(--border)",
      background: "var(--surface-page)",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      padding: "3px 9px",
      fontSize: "var(--text-xs)",
      fontFamily: "var(--font-sans)",
      color: "var(--text-body)",
      lineHeight: 1.5,
      display: "inline-flex",
      alignItems: "center"
    };
    const sep = /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-block",
        width: 1,
        alignSelf: "stretch",
        background: "var(--border)",
        margin: "2px 2px"
      }
    });
    return /*#__PURE__*/React.createElement("div", null, label && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 6
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        padding: "6px 10px",
        background: "var(--surface-page)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onMouseDown: function (e) {
        e.preventDefault();
        exec("bold");
      },
      style: tb,
      title: "Bold"
    }, /*#__PURE__*/React.createElement("strong", null, "B")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onMouseDown: function (e) {
        e.preventDefault();
        exec("italic");
      },
      style: tb,
      title: "Italic"
    }, /*#__PURE__*/React.createElement("em", null, "I")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onMouseDown: function (e) {
        e.preventDefault();
        exec("underline");
      },
      style: tb,
      title: "Underline"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        textDecoration: "underline"
      }
    }, "U")), sep, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onMouseDown: function (e) {
        e.preventDefault();
        exec("insertUnorderedList");
      },
      style: tb,
      title: "Bullet list"
    }, "\u2022 Bullet list"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onMouseDown: function (e) {
        e.preventDefault();
        exec("insertOrderedList");
      },
      style: tb,
      title: "Numbered list"
    }, "1. Numbered"), sep, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onMouseDown: function (e) {
        e.preventDefault();
        exec("removeFormat");
      },
      style: tb,
      title: "Clear formatting"
    }, "Clear format")), /*#__PURE__*/React.createElement("div", {
      ref: ref,
      contentEditable: true,
      className: "krama-rich-body",
      "data-placeholder": placeholder || "Type here…",
      suppressContentEditableWarning: true,
      onInput: function () {
        onChange && onChange(ref.current ? ref.current.innerHTML : "");
      },
      style: {
        padding: "10px 12px",
        minHeight: (rows || 3) * 26,
        outline: "none",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.65,
        background: "var(--surface-card)"
      }
    })));
  }

  // Resize + convert any image to JPEG ≤ maxPx on longest side, quality 0–1
  function compressImage(file, maxPx, quality) {
    maxPx = maxPx || 400;
    quality = quality || 0.82;
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        var w = Math.round(img.width * ratio),
          h = Math.round(img.height * ratio);
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          resolve(new File([blob], 'avatar.jpg', {
            type: 'image/jpeg'
          }));
        }, 'image/jpeg', quality);
      };
      img.src = url;
    });
  }
  function flatJob(j) {
    var co = j.company || {};
    var cat = j.category || {};
    var loc = j.location || {};
    return Object.assign({}, j, {
      company: co.name || (typeof j.company === "string" ? j.company : ""),
      logo: co.logo_url || j.logo || "",
      category: cat.name || (typeof j.category === "string" ? j.category : ""),
      location: loc.name || (typeof j.location === "string" ? j.location : "")
    });
  }
  const STAGE_ORDER = ["applied", "reviewed", "shortlisted", "interview", "offered", "rejected"];
  const STAGE_LABEL = {
    applied: "Applied",
    reviewed: "Reviewed",
    shortlisted: "Shortlisted",
    interview: "Interview",
    offered: "Offered",
    rejected: "Rejected"
  };
  const PIPELINE_STEPS = ["Applied", "Reviewed", "Shortlisted", "Interview", "Offered"];
  function stageIndex(stage) {
    var idx = ["applied", "reviewed", "shortlisted", "interview", "offered"].indexOf(stage);
    return idx < 0 ? 0 : idx;
  }
  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getFullYear();
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  function CandidateLogin({
    onLogin
  }) {
    var [email, setEmail] = React.useState("");
    var [password, setPassword] = React.useState("");
    var [error, setError] = React.useState("");
    var [busy, setBusy] = React.useState(false);
    function submit(e) {
      e.preventDefault();
      setBusy(true);
      setError("");
      cand.login(email, password).then(function (d) {
        if (d.access_token && d.user && d.user.role && d.user.role.slug === "candidate") {
          onLogin(d.user);
        } else if (d.access_token) {
          localStorage.removeItem("krama_access_token");
          setError("This account is not a candidate.");
        } else {
          setError(d.message || "Login failed.");
        }
        setBusy(false);
      }).catch(function (err) {
        setError(err.message || "Login failed.");
        setBusy(false);
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-page)",
        padding: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 40,
      style: {
        width: "100%",
        maxWidth: 380
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: HOME_URL,
      title: "Go to Krama home",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 28,
        textDecoration: "none",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: window.getKramaLogo("../../assets/krama-icon.png"),
      height: "42",
      alt: "KRAMA"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-xl)",
        letterSpacing: ".08em",
        color: "var(--text-strong)"
      }
    }, window.KRAMA_BRAND_NAME || "KRAMA")), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 6
      }
    }, T("Candidate sign in")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 24
      }
    }, T("Access your applications and saved jobs.")), error && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16,
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, error), /*#__PURE__*/React.createElement("form", {
      onSubmit: submit,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Email"),
      type: "email",
      value: email,
      onChange: function (e) {
        setEmail(e.target.value);
      },
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: T("Password"),
      type: "password",
      value: password,
      onChange: function (e) {
        setPassword(e.target.value);
      },
      required: true
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      disabled: busy
    }, busy ? T("Signing in…") : T("Sign in")))));
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────
  // Profile-completion score from the candidate's account + résumé. Each item is equal-weight;
  // name+email are always present (set at signup) so a brand-new profile starts around ~18%.
  function profileCompletion(user, resume) {
    if (!user) return null;
    var r = resume || {};
    var d = r.data || {};
    var items = [{
      key: "name",
      label: "Full name",
      done: !!(user.name && String(user.name).trim()),
      page: "profile"
    }, {
      key: "email",
      label: "Email address",
      done: !!user.email,
      page: "profile"
    }, {
      key: "phone",
      label: "Phone number",
      done: !!(user.phone && String(user.phone).trim()),
      page: "profile"
    }, {
      key: "photo",
      label: "Profile photo",
      done: !!user.avatar_url,
      page: "profile"
    }, {
      key: "about",
      label: "About you",
      done: !!(user.bio && String(user.bio).trim()),
      page: "profile"
    }, {
      key: "headline",
      label: "Professional headline",
      done: !!(r.headline && String(r.headline).trim()),
      page: "resume"
    }, {
      key: "summary",
      label: "Career summary",
      done: !!(r.summary && String(r.summary).trim()),
      page: "resume"
    }, {
      key: "experience",
      label: "Work experience",
      done: (d.experience || []).length > 0,
      page: "resume"
    }, {
      key: "education",
      label: "Education",
      done: (d.education || []).length > 0,
      page: "resume"
    }, {
      key: "skills",
      label: "Skills",
      done: (d.skills || []).length > 0,
      page: "resume"
    }, {
      key: "cv",
      label: "Upload your CV",
      done: !!(r.has_cv || r.download_url),
      page: "resume"
    }];
    var done = items.filter(function (it) {
      return it.done;
    }).length;
    return {
      percent: Math.round(done / items.length * 100),
      done: done,
      total: items.length,
      items: items,
      missing: items.filter(function (it) {
        return !it.done;
      })
    };
  }

  // Actionable completion card for the dashboard — hidden once the profile is 100% complete.
  function ProfileCompletionCard({
    completion,
    onNav,
    onStartWizard
  }) {
    if (!completion || completion.percent >= 100) return null;
    var pct = completion.percent;
    return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)",
        display: "inline-flex"
      }
    }, I("badge-check", 18)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, T("Complete your profile")), onStartWizard && /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("wand-sparkles", 14),
      onClick: onStartWizard
    }, T("Guided setup")), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-lg)",
        color: "var(--brand)"
      }
    }, pct, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 8,
        background: "var(--border-subtle)",
        borderRadius: 99,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        width: pct + "%",
        background: "var(--brand)",
        borderRadius: 99,
        transition: "width .3s ease"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 10
      }
    }, T("A complete profile gets far more employer views."), " ", completion.missing.length, " ", completion.missing.length === 1 ? T("step left") : T("steps left")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10
      }
    }, completion.missing.map(function (m) {
      return /*#__PURE__*/React.createElement("button", {
        key: m.key,
        onClick: function () {
          onNav(m.page);
        },
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          border: "1px solid var(--border-strong)",
          background: "var(--surface-card)",
          color: "var(--text-body)",
          borderRadius: 99,
          padding: "6px 12px",
          fontSize: "var(--text-sm)",
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          cursor: "pointer"
        }
      }, I("plus", 13), " ", T(m.label));
    })));
  }
  function Sidebar({
    page,
    onNav,
    user,
    badges,
    open,
    onClose,
    onLogout,
    completion,
    lang,
    onLang
  }) {
    const NAV = [{
      id: "dashboard",
      label: "Dashboard",
      icon: "layout-dashboard"
    }, {
      id: "cv",
      label: "My Digital CV",
      icon: "qr-code"
    }, {
      id: "applications",
      label: "My applications",
      icon: "send",
      badge: badges.applications
    }, {
      id: "saved",
      label: "Saved jobs",
      icon: "bookmark",
      badge: badges.saved
    }, {
      id: "recommended",
      label: "Recommended",
      icon: "sparkles"
    }, {
      id: "following",
      label: "Following",
      icon: "heart"
    }, {
      id: "alerts",
      label: "Job alerts",
      icon: "bell"
    }, {
      id: "messages",
      label: "Messages",
      icon: "message-square",
      badge: badges.messages
    }, {
      id: "resume",
      label: "Résumé builder",
      icon: "file-text"
    }, {
      id: "profile",
      label: "Profile",
      icon: "user-round"
    }, {
      id: "support",
      label: "Help & support",
      icon: "life-buoy",
      badge: badges.support
    }];
    return /*#__PURE__*/React.createElement("aside", {
      className: "krm-sidebar" + (open ? " open" : ""),
      style: {
        width: 248,
        flexShrink: 0,
        background: "var(--surface-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        position: "sticky",
        top: 0,
        height: "100vh"
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "../public-website/index.html",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "4px 8px 22px",
        textDecoration: "none"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: window.getKramaLogo("../../assets/krama-icon.png"),
      height: "36",
      alt: "KRAMA"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-lg)",
        letterSpacing: ".08em",
        color: "var(--text-strong)"
      }
    }, window.KRAMA_BRAND_NAME || "KRAMA")), completion && /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        onNav(completion.percent < 100 && completion.missing[0] && completion.missing[0].page || "profile");
        onClose && onClose();
      },
      title: completion.percent >= 100 ? "Profile complete" : "Complete your profile",
      style: {
        textAlign: "left",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        margin: "0 8px 14px",
        padding: 0,
        display: "block"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "var(--text-xs)",
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontWeight: 600
      }
    }, completion.percent >= 100 ? T("Profile complete") : T("Profile strength")), /*#__PURE__*/React.createElement("span", {
      style: {
        color: completion.percent >= 100 ? "var(--success)" : "var(--brand)",
        fontWeight: 800
      }
    }, completion.percent, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        background: "var(--border-subtle)",
        borderRadius: 99,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        width: completion.percent + "%",
        background: completion.percent >= 100 ? "var(--success)" : "var(--brand)",
        borderRadius: 99,
        transition: "width .3s ease"
      }
    }))), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 3
      }
    }, NAV.map(function (n) {
      var active = page === n.id;
      return /*#__PURE__*/React.createElement("button", {
        key: n.id,
        onClick: function () {
          onNav(n.id);
          onClose && onClose();
        },
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11,
          border: "none",
          cursor: "pointer",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          textAlign: "left",
          background: active ? "var(--brand-subtle)" : "transparent",
          color: active ? "var(--text-brand)" : "var(--text-body)",
          fontFamily: "var(--font-sans)",
          fontWeight: active ? 700 : 500,
          fontSize: "var(--text-base)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          color: active ? "var(--brand)" : "var(--text-muted)"
        }
      }, I(n.icon, 19)), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }, T(n.label)), n.badge > 0 && /*#__PURE__*/React.createElement(Badge, {
        tone: active ? "brand" : "neutral"
      }, n.badge));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "auto",
        paddingTop: 16,
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: user ? user.name : "?",
      src: user && user.avatar_url || undefined,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, user ? user.name : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, user ? user.email : ""))), onLang && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        padding: "6px 12px 8px"
      }
    }, [{
      v: "en",
      l: "EN"
    }, {
      v: "km",
      l: "ខ្មែរ"
    }].map(function (o) {
      var on = (lang || "en") === o.v;
      return /*#__PURE__*/React.createElement("button", {
        key: o.v,
        onClick: function () {
          onLang(o.v);
        },
        style: {
          flex: 1,
          padding: "6px 8px",
          borderRadius: "var(--radius-md)",
          border: "1px solid " + (on ? "var(--brand)" : "var(--border)"),
          background: on ? "var(--brand-subtle)" : "transparent",
          color: on ? "var(--text-brand)" : "var(--text-muted)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          cursor: "pointer"
        }
      }, o.l);
    })), /*#__PURE__*/React.createElement("button", {
      onClick: onLogout,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "10px 12px",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        fontWeight: 500,
        color: "var(--danger)",
        textAlign: "left"
      }
    }, I("log-out", 18), " ", T("Sign out"))));
  }

  // ── Topbar ─────────────────────────────────────────────────────────────────
  function NotificationBell({
    onNav
  }) {
    var [open, setOpen] = React.useState(false);
    var [list, setList] = React.useState([]);
    var [unread, setUnread] = React.useState(0);
    var [loading, setLoading] = React.useState(false);
    var ROUTE = {
      application_received: "applications",
      application_stage: "applications",
      job_approved: "applications",
      job_rejected: "applications"
    };
    var ICON = {
      application_received: "user-plus",
      application_stage: "activity",
      job_approved: "circle-check-big",
      job_rejected: "circle-x",
      forum_reply: "message-circle",
      forum_mention: "at-sign"
    };
    var pollUnread = React.useCallback(function () {
      cand.fetchNotifUnread().then(function (d) {
        setUnread(d.count || 0);
      }).catch(function () {});
    }, []);
    React.useEffect(function () {
      pollUnread();
      var t = setInterval(pollUnread, 20000);
      return function () {
        clearInterval(t);
      };
    }, [pollUnread]);
    function openPanel() {
      var next = !open;
      setOpen(next);
      if (next) {
        setLoading(true);
        cand.fetchNotifications().then(function (d) {
          setList(d.data || []);
          setUnread(d.unread || 0);
          setLoading(false);
        }).catch(function () {
          setLoading(false);
        });
      }
    }
    function markAll() {
      cand.markAllNotifRead().then(function () {
        setList(function (l) {
          return l.map(function (n) {
            return Object.assign({}, n, {
              read_at: n.read_at || "x"
            });
          });
        });
        setUnread(0);
      }).catch(function () {});
    }
    function clickNotif(n) {
      if (!n.read_at) {
        cand.markNotifRead(n.id).then(function () {
          setUnread(function (u) {
            return Math.max(0, u - 1);
          });
        }).catch(function () {});
      }
      setOpen(false);
      if (n.type === "forum_reply" || n.type === "forum_mention") {
        window.location.href = "../public-website/index.html" + (n.link ? "?thread=" + n.link : "");
        return;
      }
      var route = ROUTE[n.type];
      if (route && onNav) onNav(route);
    }
    function fmtTime(iso) {
      if (!iso) return "";
      var d = new Date(iso),
        diff = Date.now() - d.getTime();
      if (diff < 60000) return "just now";
      if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
      if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
      return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: openPanel,
      title: "Notifications",
      style: {
        position: "relative",
        width: 36,
        height: 36,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("bell", 16), unread > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: -6,
        right: -6,
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: 9,
        background: "var(--danger)",
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid var(--surface-card)"
      }
    }, unread > 9 ? "9+" : unread)), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      onClick: function () {
        setOpen(false);
      },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 99
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-notif-panel",
      onClick: function (e) {
        e.stopPropagation();
      },
      style: {
        position: "absolute",
        top: 44,
        right: 0,
        width: 340,
        maxHeight: 440,
        overflowY: "auto",
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        zIndex: 100
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)"
      }
    }, "Notifications"), unread > 0 && /*#__PURE__*/React.createElement("button", {
      onClick: markAll,
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-brand)",
        cursor: "pointer",
        background: "none",
        border: "none",
        fontFamily: "var(--font-sans)",
        fontWeight: 600
      }
    }, "Mark all read")), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, T("Loading…")) : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, I("bell", 26), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8
      }
    }, "No notifications yet.")) : list.map(function (n) {
      return /*#__PURE__*/React.createElement("div", {
        key: n.id,
        onClick: function () {
          clickNotif(n);
        },
        style: {
          display: "flex",
          gap: 11,
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
          background: n.read_at ? "transparent" : "var(--brand-subtle)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 32,
          height: 32,
          borderRadius: "var(--radius-sm)",
          background: "var(--surface-page)",
          color: "var(--text-brand)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }
      }, I(ICON[n.type] || "bell", 15)), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, n.title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginTop: 2,
          lineHeight: 1.4
        }
      }, n.body), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-faint)",
          marginTop: 3
        }
      }, fmtTime(n.created_at))));
    }))));
  }
  function Topbar({
    title,
    user,
    onLogout,
    onMenu,
    onNav
  }) {
    return /*#__PURE__*/React.createElement("header", {
      className: "krm-topbar",
      style: {
        height: 64,
        flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-card)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "krm-hamburger-dash",
      onClick: onMenu,
      style: {
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        flexShrink: 0
      }
    }, I("menu", 20)), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(NotificationBell, {
      onNav: onNav
    }), /*#__PURE__*/React.createElement(Avatar, {
      name: user ? user.name : "?",
      src: user && user.avatar_url || undefined,
      size: 36
    }), /*#__PURE__*/React.createElement("button", {
      onClick: onLogout,
      title: "Sign out",
      style: {
        width: 36,
        height: 36,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("log-out", 16))));
  }
  function ScreenHead({
    title,
    sub,
    action
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-screenhead",
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, sub)), action && /*#__PURE__*/React.createElement("div", {
      className: "krm-screenhead-action"
    }, action));
  }

  // Clickable wrapper that turns a StatCard into a link to its section (with hover lift).
  function StatLink({
    onClick,
    title,
    children
  }) {
    var [h, setH] = React.useState(false);
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClick,
      onMouseEnter: function () {
        setH(true);
      },
      onMouseLeave: function () {
        setH(false);
      },
      role: "button",
      tabIndex: 0,
      title: title,
      "aria-label": title,
      onKeyDown: function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      },
      style: {
        cursor: "pointer",
        borderRadius: "var(--radius-lg)",
        transition: "transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)",
        transform: h ? "translateY(-2px)" : "none",
        boxShadow: h ? "var(--shadow-md)" : "none"
      }
    }, children);
  }

  // One stage tile in the dashboard "Application pipeline" row (count + label, links to that stage).
  function PipelineTile({
    count,
    label,
    onClick
  }) {
    var [h, setH] = React.useState(false);
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClick,
      onMouseEnter: function () {
        setH(true);
      },
      onMouseLeave: function () {
        setH(false);
      },
      role: "button",
      tabIndex: 0,
      title: "View " + label + " applications",
      "aria-label": "View " + label + " applications",
      onKeyDown: function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      },
      style: {
        cursor: "pointer",
        textAlign: "center",
        padding: "14px 6px",
        borderRadius: "var(--radius-md)",
        border: "1px solid " + (h ? "var(--brand)" : "var(--border)"),
        background: h ? "var(--brand-subtle)" : "var(--surface-card)",
        transition: "border-color var(--dur-base), background var(--dur-base)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-2xl)",
        color: count > 0 ? "var(--brand)" : "var(--text-faint)",
        lineHeight: 1
      }
    }, count), /*#__PURE__*/React.createElement("div", {
      className: "krm-pipeline-label",
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 6
      }
    }, label));
  }
  var PIPELINE = [{
    key: "applied",
    label: "Applied"
  }, {
    key: "reviewed",
    label: "Reviewed"
  }, {
    key: "shortlisted",
    label: "Shortlisted"
  }, {
    key: "interview",
    label: "Interview"
  }, {
    key: "offered",
    label: "Offered"
  }];

  // ── Overview ───────────────────────────────────────────────────────────────
  function Overview({
    user,
    onNav,
    onOpenApplications,
    completion,
    onStartWizard
  }) {
    var [stats, setStats] = React.useState({
      applied: 0,
      saved: 0,
      interviews: 0
    });
    var [stageCounts, setStageCounts] = React.useState({
      applied: 0,
      reviewed: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0
    });
    var [recentApps, setRecentApps] = React.useState([]);
    var [recs, setRecs] = React.useState([]);
    var [savedIds, setSavedIds] = React.useState([]);
    var [loading, setLoading] = React.useState(true);
    React.useEffect(function () {
      Promise.all([cand.fetchApplications("all", 1), cand.fetchSavedJobs(1), cand.fetchJobs({
        per_page: 4
      }), cand.fetchApplicationStageCounts()]).then(function (results) {
        var apps = results[0];
        var saved = results[1];
        var jobs = results[2];
        var sc = results[3] || {};
        var allApps = apps.data || [];
        // Use the paginator/grouped totals (not just page 1) so each count reflects everything.
        setStats({
          applied: apps.total || 0,
          saved: saved.total || 0,
          interviews: sc.interview || 0
        });
        setStageCounts(sc);
        setRecentApps(allApps.slice(0, 3));
        setRecs(jobs.data || []);
        setSavedIds((saved.data || []).map(function (j) {
          return j.id;
        }));
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }, []);
    function toggleSave(jobId) {
      var isSaved = savedIds.includes(jobId);
      (isSaved ? cand.unsaveJob(jobId) : cand.saveJob(jobId)).then(function () {
        setSavedIds(function (ids) {
          return isSaved ? ids.filter(function (x) {
            return x !== jobId;
          }) : ids.concat(jobId);
        });
      }).catch(function () {});
    }
    if (loading) return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        color: "var(--text-muted)"
      }
    }, T("Loading…"));
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 24
      }
    }, /*#__PURE__*/React.createElement(ProfileCompletionCard, {
      completion: completion,
      onNav: onNav,
      onStartWizard: onStartWizard
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-stats-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatLink, {
      onClick: function () {
        onOpenApplications();
      },
      title: "View my applications"
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: T("Applied jobs"),
      value: String(stats.applied),
      tone: "brand",
      icon: I("send", 22)
    })), /*#__PURE__*/React.createElement(StatLink, {
      onClick: function () {
        onNav("saved");
      },
      title: "View saved jobs"
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: T("Saved jobs"),
      value: String(stats.saved),
      tone: "accent",
      icon: I("bookmark", 22)
    })), /*#__PURE__*/React.createElement(StatLink, {
      onClick: function () {
        onOpenApplications("interview");
      },
      title: "View interviews"
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: T("Interviews"),
      value: String(stats.interviews),
      tone: "success",
      icon: I("calendar-check", 22)
    }))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-base)",
        color: "var(--text-strong)",
        marginBottom: 16
      }
    }, T("Application pipeline")), /*#__PURE__*/React.createElement("div", {
      className: "krm-pipeline",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(5,1fr)",
        gap: 10
      }
    }, PIPELINE.map(function (s) {
      return /*#__PURE__*/React.createElement(PipelineTile, {
        key: s.key,
        count: stageCounts[s.key] || 0,
        label: T(s.label),
        onClick: function () {
          onOpenApplications(s.key);
        }
      });
    }))), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, T("Recent applications")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: I("arrow-right", 14),
      onClick: function () {
        onNav("applications");
      }
    }, T("View all"))), recentApps.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "28px 22px",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, T("No applications yet. Start applying!")) : recentApps.map(function (a, i) {
      var job = a.job || {};
      var company = job.company || {};
      return /*#__PURE__*/React.createElement("div", {
        key: a.id,
        style: {
          padding: "16px 22px",
          borderBottom: i < recentApps.length - 1 ? "1px solid var(--border-subtle)" : "none",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap"
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: company.name || "?",
        square: true,
        size: 42,
        src: company.logo_url
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, job.title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)"
        }
      }, company.name)), /*#__PURE__*/React.createElement("div", {
        className: "krm-tracker",
        style: {
          flex: 1,
          maxWidth: 380
        }
      }, /*#__PURE__*/React.createElement(ProgressTracker, {
        current: stageIndex(a.stage),
        steps: PIPELINE_STEPS.map(T)
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: "auto",
          fontSize: "var(--text-sm)",
          color: "var(--text-faint)"
        }
      }, fmtDate(a.created_at)));
    })), recs.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, T("Recommended for you")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: I("arrow-right", 14),
      onClick: function () {
        onNav("recommended");
      }
    }, T("View all"))), /*#__PURE__*/React.createElement("div", {
      className: "krm-card-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, recs.map(function (j) {
      return /*#__PURE__*/React.createElement(JobCard, _extends({
        key: j.id
      }, flatJob(j), {
        saved: savedIds.includes(j.id),
        onSave: function () {
          toggleSave(j.id);
        },
        onClick: function () {
          window.location.href = "../public-website/index.html?job=" + j.id;
        }
      }));
    }))));
  }

  // ── Applications ───────────────────────────────────────────────────────────
  function Applications({
    onBadgeChange,
    onGoToMessages,
    initialTab
  }) {
    var [tab, setTab] = React.useState(initialTab || "all");
    var [apps, setApps] = React.useState([]);
    var [meta, setMeta] = React.useState({
      total: 0,
      last_page: 1,
      current_page: 1
    });
    var [loading, setLoading] = React.useState(true);
    var [counts, setCounts] = React.useState({
      all: 0,
      applied: 0,
      reviewed: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      rejected: 0
    });
    var [msgModal, setMsgModal] = React.useState(null);
    var [msgBody, setMsgBody] = React.useState("");
    var [msgSending, setMsgSending] = React.useState(false);
    var [msgErr, setMsgErr] = React.useState("");
    function openMessage(job, owner) {
      setMsgModal({
        job: job,
        owner: owner
      });
      setMsgBody("");
      setMsgErr("");
    }
    function sendNewMessage() {
      if (!msgBody.trim() || msgSending || !msgModal) return;
      setMsgSending(true);
      setMsgErr("");
      cand.startConversation({
        other_user_id: msgModal.owner.id,
        job_id: msgModal.job.id || null,
        subject: msgModal.job.title || null,
        message: msgBody.trim()
      }).then(function () {
        setMsgSending(false);
        setMsgModal(null);
        setMsgBody("");
        if (onGoToMessages) onGoToMessages();
      }).catch(function (e) {
        setMsgSending(false);
        setMsgErr(e && e.message || "Could not send message.");
      });
    }
    function load(stage, page) {
      setLoading(true);
      cand.fetchApplications(stage === "all" ? "" : stage, page || 1).then(function (r) {
        setApps(r.data || []);
        setMeta({
          total: r.total || 0,
          last_page: r.last_page || 1,
          current_page: r.current_page || 1
        });
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }
    React.useEffect(function () {
      // One grouped query gives the count for every stage tab.
      cand.fetchApplicationStageCounts().then(function (sc) {
        setCounts({
          all: sc.total || 0,
          applied: sc.applied || 0,
          reviewed: sc.reviewed || 0,
          shortlisted: sc.shortlisted || 0,
          interview: sc.interview || 0,
          offered: sc.offered || 0,
          rejected: sc.rejected || 0
        });
        if (onBadgeChange) onBadgeChange(sc.total || 0);
      }).catch(function () {});
      load(initialTab || "all", 1);
    }, []);
    function changeTab(t) {
      setTab(t);
      load(t, 1);
    }
    function withdraw(id) {
      if (!confirm("Withdraw this application?")) return;
      cand.withdrawApplication(id).then(function () {
        load(tab, meta.current_page);
      }).catch(function (err) {
        alert(err.message || "Failed to withdraw.");
      });
    }
    var tabList = [{
      value: "all",
      label: T("All"),
      count: counts.all
    }];
    PIPELINE.forEach(function (s) {
      tabList.push({
        value: s.key,
        label: T(s.label),
        count: counts[s.key] || 0
      });
    });
    if (counts.rejected > 0) tabList.push({
      value: "rejected",
      label: T("Rejected"),
      count: counts.rejected
    });
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: T("My applications"),
      sub: counts.all + " " + T("total applications")
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-tabs-scroll",
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: changeTab,
      tabs: tabList
    })), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, T("Loading…")) : apps.length === 0 ? /*#__PURE__*/React.createElement(Card, {
      padding: 32
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        color: "var(--text-muted)"
      }
    }, T("No applications found."))) : /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, apps.map(function (a, i) {
      var job = a.job || {};
      var company = job.company || {};
      var owner = company.owner || null;
      var canMessage = owner && owner.allow_candidate_messages;
      var rejected = a.stage === "rejected";
      return /*#__PURE__*/React.createElement("div", {
        key: a.id,
        style: {
          padding: "18px 22px",
          borderBottom: i < apps.length - 1 ? "1px solid var(--border-subtle)" : "none",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap"
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: company.name || "?",
        square: true,
        size: 46,
        src: company.logo_url
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)",
          fontSize: "var(--text-md)"
        }
      }, job.title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)"
        }
      }, company.name, " \xB7 Applied ", fmtDate(a.created_at)), rejected && /*#__PURE__*/React.createElement(Badge, {
        tone: "danger",
        style: {
          marginTop: 4
        }
      }, T("Rejected"))), !rejected ? /*#__PURE__*/React.createElement("div", {
        className: "krm-tracker",
        style: {
          flex: 1,
          maxWidth: 420
        }
      }, /*#__PURE__*/React.createElement(ProgressTracker, {
        current: stageIndex(a.stage),
        steps: PIPELINE_STEPS.map(T)
      })) : /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, canMessage && /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        iconLeft: I("message-square", 13),
        onClick: function () {
          openMessage(job, owner);
        }
      }, T("Message")), a.stage === "applied" && /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        style: {
          color: "var(--danger)"
        },
        onClick: function () {
          withdraw(a.id);
        }
      }, T("Withdraw"))));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 22px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, meta.total > 0 ? "Showing " + ((meta.current_page - 1) * 10 + 1) + "–" + ((meta.current_page - 1) * 10 + apps.length) + " of " + meta.total : "No results"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: meta.current_page <= 1,
      onClick: function () {
        load(tab, meta.current_page - 1);
      }
    }, T("Previous")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: meta.current_page >= meta.last_page,
      onClick: function () {
        load(tab, meta.current_page + 1);
      }
    }, T("Next"))))), msgModal && /*#__PURE__*/React.createElement("div", {
      onClick: function () {
        setMsgModal(null);
      },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay, rgba(0,0,0,0.45))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function (e) {
        e.stopPropagation();
      },
      style: {
        width: "100%",
        maxWidth: 460,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)"
      }
    }, "Message about \u201C", msgModal.job.title, "\u201D"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 3
      }
    }, (msgModal.job.company || {}).name || "Employer")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 18
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      value: msgBody,
      onChange: function (e) {
        setMsgBody(e.target.value);
      },
      rows: 5,
      autoFocus: true,
      placeholder: "Write your message to the employer\u2026",
      onKeyDown: function (e) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          sendNewMessage();
        }
      },
      style: {
        width: "100%",
        boxSizing: "border-box",
        resize: "vertical",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        background: "var(--surface-page)",
        outline: "none",
        lineHeight: 1.5
      }
    }), msgErr && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-xs)",
        marginTop: 8
      }
    }, msgErr)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 18px 18px",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: function () {
        setMsgModal(null);
      }
    }, T("Cancel")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: msgSending || !msgBody.trim(),
      onClick: sendNewMessage
    }, msgSending ? T("Sending…") : T("Send message"))))));
  }

  // ── Saved Jobs ─────────────────────────────────────────────────────────────
  function SavedJobs({
    onBadgeChange
  }) {
    var [jobs, setJobs] = React.useState([]);
    var [meta, setMeta] = React.useState({
      total: 0,
      last_page: 1,
      current_page: 1
    });
    var [loading, setLoading] = React.useState(true);
    function load(page) {
      setLoading(true);
      cand.fetchSavedJobs(page || 1).then(function (r) {
        setJobs(r.data || []);
        setMeta({
          total: r.total || 0,
          last_page: r.last_page || 1,
          current_page: r.current_page || 1
        });
        if (onBadgeChange) onBadgeChange(r.total || 0);
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }
    React.useEffect(function () {
      load(1);
    }, []);
    function unsave(jobId) {
      cand.unsaveJob(jobId).then(function () {
        load(meta.current_page);
      }).catch(function () {});
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: T("Saved jobs"),
      sub: meta.total + " " + T("jobs saved")
    }), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)"
      }
    }, T("Loading…")) : jobs.length === 0 ? /*#__PURE__*/React.createElement(Card, {
      padding: 32
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        color: "var(--text-muted)"
      }
    }, T("No saved jobs yet. Browse jobs and click the bookmark icon."))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "krm-card-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        marginBottom: 20
      }
    }, jobs.map(function (j) {
      return /*#__PURE__*/React.createElement(JobCard, _extends({
        key: j.id
      }, flatJob(j), {
        saved: true,
        onSave: function () {
          unsave(j.id);
        },
        onClick: function () {
          window.location.href = "../public-website/index.html?job=" + j.id;
        }
      }));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Showing ", (meta.current_page - 1) * 10 + 1, "\u2013", (meta.current_page - 1) * 10 + jobs.length, " of ", meta.total), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: meta.current_page <= 1,
      onClick: function () {
        load(meta.current_page - 1);
      }
    }, T("Previous")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: meta.current_page >= meta.last_page,
      onClick: function () {
        load(meta.current_page + 1);
      }
    }, T("Next"))))));
  }

  // ── Recommended ────────────────────────────────────────────────────────────
  function MatchBadge({
    reasons
  }) {
    if (!reasons || reasons.length === 0) return null;
    var labels = {
      category: "Matches your field",
      level: "Matches your level"
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginTop: 6
      }
    }, reasons.map(function (r) {
      return /*#__PURE__*/React.createElement("span", {
        key: r,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 8px",
          borderRadius: "var(--radius-full)",
          background: "var(--brand-subtle)",
          color: "var(--text-brand)",
          fontSize: "var(--text-xs)",
          fontWeight: 600
        }
      }, I("sparkles", 11), " ", T(labels[r] || r));
    }));
  }
  function Recommended() {
    var [jobs, setJobs] = React.useState([]);
    var [meta, setMeta] = React.useState({
      total: 0,
      last_page: 1,
      current_page: 1
    });
    var [savedIds, setSavedIds] = React.useState([]);
    var [loading, setLoading] = React.useState(true);
    var [search, setSearch] = React.useState("");
    var [searchInput, setSearchInput] = React.useState("");
    var [hasHistory, setHasHistory] = React.useState(true);
    function load(page, kw) {
      setLoading(true);
      Promise.all([cand.fetchRecommended(page || 1, kw || ""), cand.fetchSavedJobs(1)]).then(function (r) {
        var jobsRes = r[0];
        var savedRes = r[1];
        var jobList = jobsRes.data || [];
        setJobs(jobList);
        setMeta({
          total: jobsRes.total || 0,
          last_page: jobsRes.last_page || 1,
          current_page: jobsRes.current_page || 1
        });
        setSavedIds((savedRes.data || []).map(function (j) {
          return j.id;
        }));
        // If no job has match_reasons, the candidate has no history (fallback mode)
        setHasHistory(jobList.some(function (j) {
          return j.match_reasons && j.match_reasons.length > 0;
        }));
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }
    React.useEffect(function () {
      load(1, "");
    }, []);
    function toggleSave(jobId) {
      var isSaved = savedIds.includes(jobId);
      (isSaved ? cand.unsaveJob(jobId) : cand.saveJob(jobId)).then(function () {
        setSavedIds(function (ids) {
          return isSaved ? ids.filter(function (x) {
            return x !== jobId;
          }) : ids.concat(jobId);
        });
      }).catch(function () {});
    }
    function doSearch(e) {
      e && e.preventDefault();
      setSearch(searchInput);
      load(1, searchInput);
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: T("Recommended for you"),
      sub: loading ? T("Loading…") : meta.total + " " + T("jobs matched")
    }), !loading && !hasHistory && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--info-subtle)",
        border: "1px solid var(--info-border)",
        borderRadius: "var(--radius-md)",
        marginBottom: 18,
        fontSize: "var(--text-sm)",
        color: "var(--info)"
      }
    }, I("info", 15), " ", T("Apply to or save some jobs first — we'll personalise these recommendations based on your activity.")), /*#__PURE__*/React.createElement("form", {
      onSubmit: doSearch,
      style: {
        display: "flex",
        gap: 10,
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: 12,
        top: "50%",
        transform: "translateY(-50%)",
        color: "var(--text-faint)",
        pointerEvents: "none"
      }
    }, I("search", 16)), /*#__PURE__*/React.createElement("input", {
      value: searchInput,
      onChange: function (e) {
        setSearchInput(e.target.value);
      },
      placeholder: "Search job title, company, keyword\u2026",
      style: {
        width: "100%",
        height: 40,
        padding: "0 12px 0 38px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: "var(--surface-input)",
        color: "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        boxSizing: "border-box"
      }
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      type: "submit"
    }, T("Search")), search && /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: function () {
        setSearchInput("");
        setSearch("");
        load(1, "");
      }
    }, T("Clear"))), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        padding: "28px 0"
      }
    }, T("Loading…")) : jobs.length === 0 ? /*#__PURE__*/React.createElement(Card, {
      padding: 32
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        color: "var(--text-muted)"
      }
    }, "No jobs found", search ? ' for "' + search + '"' : "", ". Try a different keyword.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "krm-card-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        marginBottom: 20
      }
    }, jobs.map(function (j) {
      return /*#__PURE__*/React.createElement("div", {
        key: j.id
      }, /*#__PURE__*/React.createElement(JobCard, _extends({}, flatJob(j), {
        saved: savedIds.includes(j.id),
        onSave: function () {
          toggleSave(j.id);
        },
        onClick: function () {
          window.location.href = "../public-website/index.html?job=" + j.id;
        }
      })), /*#__PURE__*/React.createElement(MatchBadge, {
        reasons: j.match_reasons
      }));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Showing ", (meta.current_page - 1) * 12 + 1, "\u2013", (meta.current_page - 1) * 12 + jobs.length, " of ", meta.total), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: meta.current_page <= 1,
      onClick: function () {
        load(meta.current_page - 1, search);
      }
    }, T("Previous")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: meta.current_page >= meta.last_page,
      onClick: function () {
        load(meta.current_page + 1, search);
      }
    }, T("Next"))))));
  }

  // ── Profile ────────────────────────────────────────────────────────────────
  function Profile({
    user,
    onUserUpdate
  }) {
    var [name, setName] = React.useState(user ? user.name : "");
    var [email, setEmail] = React.useState(user ? user.email || "" : "");
    var [phone, setPhone] = React.useState(user ? user.phone || "" : "");
    var [bio, setBio] = React.useState(user ? user.bio || "" : "");
    var [cvVis, setCvVis] = React.useState(user ? user.cv_visibility || "employers" : "employers");
    var [preview, setPreview] = React.useState(user ? user.avatar_url || "" : "");
    var [busy, setBusy] = React.useState(false);
    var [uploading, setUploading] = React.useState(false);
    var [msg, setMsg] = React.useState(null); // { ok, text }
    var fileRef = React.useRef(null);
    var [curPwd, setCurPwd] = React.useState("");
    var [newPwd, setNewPwd] = React.useState("");
    var [conPwd, setConPwd] = React.useState("");
    var [pwdBusy, setPwdBusy] = React.useState(false);
    var [pwdMsg, setPwdMsg] = React.useState(null);
    function changePwd() {
      if (!curPwd || !newPwd || !conPwd) {
        setPwdMsg({
          ok: false,
          text: "All fields are required."
        });
        return;
      }
      if (newPwd !== conPwd) {
        setPwdMsg({
          ok: false,
          text: "New passwords do not match."
        });
        return;
      }
      if (newPwd.length < 8) {
        setPwdMsg({
          ok: false,
          text: "Password must be at least 8 characters."
        });
        return;
      }
      setPwdBusy(true);
      setPwdMsg(null);
      cand.changePassword(curPwd, newPwd).then(function () {
        setPwdBusy(false);
        setPwdMsg({
          ok: true,
          text: "Password updated!"
        });
        setCurPwd("");
        setNewPwd("");
        setConPwd("");
      }).catch(function (e) {
        setPwdBusy(false);
        setPwdMsg({
          ok: false,
          text: e && e.message || "Failed to update password."
        });
      });
    }
    function onFileChange(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        setPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
      setUploading(true);
      setMsg(null);
      compressImage(file, 400, 0.82).then(function (compressed) {
        return cand.uploadAvatar(compressed);
      }).then(function (u) {
        setPreview(u.avatar_url || "");
        if (onUserUpdate) onUserUpdate(u);
        setUploading(false);
        setMsg({
          ok: true,
          text: "Photo updated!"
        });
      }).catch(function (err) {
        setUploading(false);
        setMsg({
          ok: false,
          text: err.message || "Upload failed."
        });
      });
    }
    function save() {
      setBusy(true);
      setMsg(null);
      cand.updateMe({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        cv_visibility: cvVis
      }).then(function (u) {
        if (u.cv_visibility) setCvVis(u.cv_visibility);
        if (onUserUpdate) onUserUpdate(u);
        setMsg({
          ok: true,
          text: "Profile saved!"
        });
        setBusy(false);
      }).catch(function (err) {
        setBusy(false);
        if (err && err.errors) {
          var first = Object.values(err.errors)[0];
          setMsg({
            ok: false,
            text: Array.isArray(first) ? first[0] : first
          });
        } else {
          setMsg({
            ok: false,
            text: err && err.message || "Failed to save."
          });
        }
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        maxWidth: 720
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: T("Profile"),
      sub: T("How you appear to employers.")
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 20,
        alignItems: "center",
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: name || "?",
      size: 72,
      src: preview || undefined
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function () {
        fileRef.current && fileRef.current.click();
      },
      disabled: uploading,
      style: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: "var(--brand)",
        border: "2px solid var(--surface-card)",
        cursor: "pointer",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, uploading ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10
      }
    }, "\u2026") : I("camera", 13)), /*#__PURE__*/React.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: "image/*",
      style: {
        display: "none"
      },
      onChange: onFileChange
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-md)",
        color: "var(--text-strong)"
      }
    }, name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, email), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      style: {
        marginTop: 8,
        paddingLeft: 0
      },
      onClick: function () {
        fileRef.current && fileRef.current.click();
      },
      disabled: uploading
    }, uploading ? T("Uploading…") : T("Change photo")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Full name"),
      value: name,
      onChange: function (e) {
        setName(e.target.value);
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Email"),
      type: "email",
      value: email,
      onChange: function (e) {
        setEmail(e.target.value);
      },
      iconLeft: I("mail", 16)
    }), /*#__PURE__*/React.createElement(Input, {
      label: T("Phone"),
      value: phone,
      onChange: function (e) {
        setPhone(e.target.value);
      },
      iconLeft: I("phone", 16)
    })), /*#__PURE__*/React.createElement(Textarea, {
      label: T("Bio / Description"),
      value: bio,
      onChange: function (e) {
        setBio(e.target.value);
      },
      rows: 4,
      placeholder: "Tell employers a bit about yourself\u2026"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 6
      }
    }, T("CV / Resume visibility")), /*#__PURE__*/React.createElement(Select, {
      value: cvVis,
      onChange: function (e) {
        setCvVis(e.target.value);
      },
      options: [{
        value: "public",
        label: T("Public — anyone can view")
      }, {
        value: "employers",
        label: T("Employers only — recruiters who review your application")
      }, {
        value: "private",
        label: T("Private — only you can access")
      }]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 5
      }
    }, T("Controls who can download your uploaded CV file."))), msg && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        background: msg.ok ? "var(--success-subtle,#f0fdf4)" : "var(--danger-subtle,#fff5f5)",
        color: msg.ok ? "var(--success)" : "var(--danger)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, msg.text), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        paddingTop: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: busy,
      onClick: save
    }, busy ? T("Saving…") : T("Save changes"))))), /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginTop: 20
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-base)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 4
      }
    }, T("Change password")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 18
      }
    }, T("Choose a strong password of at least 8 characters.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Current password"),
      type: "password",
      value: curPwd,
      onChange: function (e) {
        setCurPwd(e.target.value);
      },
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("New password"),
      type: "password",
      value: newPwd,
      onChange: function (e) {
        setNewPwd(e.target.value);
      },
      placeholder: "At least 8 characters"
    }), /*#__PURE__*/React.createElement(Input, {
      label: T("Confirm new password"),
      type: "password",
      value: conPwd,
      onChange: function (e) {
        setConPwd(e.target.value);
      },
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    })), pwdMsg && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: pwdMsg.ok ? "var(--success)" : "var(--danger)",
        fontWeight: 600
      }
    }, pwdMsg.text), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: pwdBusy,
      onClick: changePwd
    }, pwdBusy ? T("Updating…") : T("Update password"))))));
  }

  // ── Resume Builder ─────────────────────────────────────────────────────────
  function ResumeBuilder({
    onResumeSaved
  }) {
    var EMPTY_RESUME = {
      headline: "",
      summary: "",
      data: {
        education: [],
        experience: [],
        skills: [],
        certifications: []
      }
    };
    var [resume, setResume] = React.useState(EMPTY_RESUME);
    var [loading, setLoading] = React.useState(true);
    var [busy, setBusy] = React.useState(false);
    var [saved, setSaved] = React.useState(false);
    var [uploading, setUploading] = React.useState(false);
    var cvRef = React.useRef(null);
    // Stable per-item key for experience rows so the (mount-once) rich editors don't
    // show stale content when a row is removed. Kept in memory only; stripped on save.
    var expKeyRef = React.useRef(1);
    function withExpKeys(list) {
      return (list || []).map(function (it) {
        return Object.assign({}, it, {
          _k: expKeyRef.current++
        });
      });
    }
    React.useEffect(function () {
      cand.fetchResume().then(function (r) {
        if (r) {
          var d = Object.assign({
            education: [],
            experience: [],
            skills: [],
            certifications: []
          }, r.data || {});
          d.experience = withExpKeys(d.experience);
          setResume({
            headline: r.headline || "",
            summary: r.summary || "",
            has_cv: !!r.download_url,
            data: d
          });
        }
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }, []);
    function setField(key, val) {
      setResume(function (r) {
        return Object.assign({}, r, {
          [key]: val
        });
      });
    }
    function setData(key, val) {
      setResume(function (r) {
        return Object.assign({}, r, {
          data: Object.assign({}, r.data, {
            [key]: val
          })
        });
      });
    }
    function saveAll() {
      setBusy(true);
      setSaved(false);
      var cleanData = Object.assign({}, resume.data, {
        experience: (resume.data.experience || []).map(function (it) {
          var c = Object.assign({}, it);
          delete c._k;
          return c;
        })
      });
      cand.saveResume({
        headline: resume.headline,
        summary: resume.summary,
        data: cleanData
      }).then(function (r) {
        setSaved(true);
        setBusy(false);
        onResumeSaved && onResumeSaved();
      }).catch(function (err) {
        alert(err.message || "Save failed.");
        setBusy(false);
      });
    }
    function onCvChange(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setUploading(true);
      cand.uploadCv(file).then(function (r) {
        setResume(function (rv) {
          return Object.assign({}, rv, {
            has_cv: !!r.download_url
          });
        });
        setUploading(false);
        onResumeSaved && onResumeSaved();
      }).catch(function (err) {
        alert(err.message || "Upload failed.");
        setUploading(false);
      });
    }
    function downloadCv() {
      cand.downloadCv().then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'my_cv.pdf';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 300);
      }).catch(function (e) {
        alert('Download failed: ' + (e && e.message || 'Unknown error'));
      });
    }

    // Education helpers
    function addEdu() {
      setData("education", resume.data.education.concat({
        school: "",
        degree: "",
        years: ""
      }));
    }
    function updateEdu(i, key, val) {
      var arr = resume.data.education.slice();
      arr[i] = Object.assign({}, arr[i], {
        [key]: val
      });
      setData("education", arr);
    }
    function removeEdu(i) {
      setData("education", resume.data.education.filter(function (_, idx) {
        return idx !== i;
      }));
    }

    // Experience helpers
    function addExp() {
      setData("experience", resume.data.experience.concat({
        role: "",
        org: "",
        years: "",
        note: "",
        _k: expKeyRef.current++
      }));
    }
    function updateExp(i, key, val) {
      var arr = resume.data.experience.slice();
      arr[i] = Object.assign({}, arr[i], {
        [key]: val
      });
      setData("experience", arr);
    }
    function removeExp(i) {
      setData("experience", resume.data.experience.filter(function (_, idx) {
        return idx !== i;
      }));
    }

    // Skills helpers
    var [skillInput, setSkillInput] = React.useState("");
    function addSkill() {
      var s = skillInput.trim();
      if (!s) return;
      setData("skills", resume.data.skills.concat(s));
      setSkillInput("");
    }
    function removeSkill(i) {
      setData("skills", resume.data.skills.filter(function (_, idx) {
        return idx !== i;
      }));
    }

    // Certifications helpers
    function addCert() {
      setData("certifications", resume.data.certifications.concat({
        name: "",
        year: ""
      }));
    }
    function updateCert(i, key, val) {
      var arr = resume.data.certifications.slice();
      arr[i] = Object.assign({}, arr[i], {
        [key]: val
      });
      setData("certifications", arr);
    }
    function removeCert(i) {
      setData("certifications", resume.data.certifications.filter(function (_, idx) {
        return idx !== i;
      }));
    }
    var sectionStyle = {
      marginBottom: 20
    };
    var sectionHeadStyle = {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 14
    };
    var iconBoxStyle = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 34,
      height: 34,
      borderRadius: "var(--radius-md)",
      background: "var(--brand-subtle)",
      color: "var(--brand)",
      flexShrink: 0
    };
    if (loading) return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        color: "var(--text-muted)"
      }
    }, T("Loading…"));
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        maxWidth: 860
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: T("Résumé builder"),
      sub: T("Build your CV to attach when applying for jobs."),
      action: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 10
        }
      }, resume.has_cv && /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: I("download", 15),
        onClick: downloadCv
      }, T("Download CV")), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        disabled: busy,
        onClick: saveAll,
        iconLeft: I("save", 15)
      }, busy ? T("Saving…") : T("Save resume")))
    }), saved && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16,
        padding: "10px 16px",
        background: "var(--success-subtle)",
        color: "var(--success)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, T("Resume saved successfully!")), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: sectionHeadStyle
    }, /*#__PURE__*/React.createElement("span", {
      style: iconBoxStyle
    }, I("upload", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-md)",
        fontWeight: 700,
        color: "var(--text-strong)",
        flex: 1
      }
    }, T("Upload CV file"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, resume.has_cv ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)"
      }
    }, I("file-text", 20)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, T("CV uploaded")), /*#__PURE__*/React.createElement("button", {
      onClick: downloadCv,
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--brand)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0
      }
    }, T("View"))) : /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, T("No CV uploaded yet. Upload a PDF or DOC (max 5 MB).")), /*#__PURE__*/React.createElement("input", {
      ref: cvRef,
      type: "file",
      accept: ".pdf,.doc,.docx",
      style: {
        display: "none"
      },
      onChange: onCvChange
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      disabled: uploading,
      onClick: function () {
        cvRef.current && cvRef.current.click();
      }
    }, uploading ? T("Uploading…") : resume.has_cv ? T("Replace CV") : T("Upload CV")))), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      style: sectionStyle
    }, /*#__PURE__*/React.createElement("div", {
      style: sectionHeadStyle
    }, /*#__PURE__*/React.createElement("span", {
      style: iconBoxStyle
    }, I("user-round", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-md)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, T("Personal summary"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Headline / Job title"),
      value: resume.headline,
      onChange: function (e) {
        setField("headline", e.target.value);
      },
      placeholder: "e.g. Senior Accountant"
    }), /*#__PURE__*/React.createElement(RichEditor, {
      label: T("Summary"),
      rows: 4,
      value: resume.summary,
      onChange: function (v) {
        setField("summary", v);
      },
      placeholder: "Brief professional summary\u2026"
    }))), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      style: sectionStyle
    }, /*#__PURE__*/React.createElement("div", {
      style: sectionHeadStyle
    }, /*#__PURE__*/React.createElement("span", {
      style: iconBoxStyle
    }, I("graduation-cap", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-md)",
        fontWeight: 700,
        color: "var(--text-strong)",
        flex: 1
      }
    }, T("Education")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("plus", 13),
      onClick: addEdu
    }, T("Add"))), resume.data.education.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-faint)",
        fontSize: "var(--text-sm)"
      }
    }, T("No education entries yet.")), resume.data.education.map(function (e, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginBottom: 10,
          alignItems: "end"
        }
      }, /*#__PURE__*/React.createElement(Input, {
        label: i === 0 ? T("School / University") : undefined,
        value: e.school,
        onChange: function (ev) {
          updateEdu(i, "school", ev.target.value);
        },
        placeholder: "School"
      }), /*#__PURE__*/React.createElement(Input, {
        label: i === 0 ? T("Degree") : undefined,
        value: e.degree,
        onChange: function (ev) {
          updateEdu(i, "degree", ev.target.value);
        },
        placeholder: "e.g. BBA, Accounting"
      }), /*#__PURE__*/React.createElement(Input, {
        label: i === 0 ? T("Years") : undefined,
        value: e.years,
        onChange: function (ev) {
          updateEdu(i, "years", ev.target.value);
        },
        placeholder: "2018\u20132022"
      }), /*#__PURE__*/React.createElement("button", {
        onClick: function () {
          removeEdu(i);
        },
        style: {
          height: 40,
          width: 36,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }
      }, I("trash-2", 15)));
    })), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      style: sectionStyle
    }, /*#__PURE__*/React.createElement("div", {
      style: sectionHeadStyle
    }, /*#__PURE__*/React.createElement("span", {
      style: iconBoxStyle
    }, I("briefcase", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-md)",
        fontWeight: 700,
        color: "var(--text-strong)",
        flex: 1
      }
    }, T("Work experience")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("plus", 13),
      onClick: addExp
    }, T("Add"))), resume.data.experience.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-faint)",
        fontSize: "var(--text-sm)"
      }
    }, T("No experience entries yet.")), resume.data.experience.map(function (e, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: e._k != null ? e._k : i,
        style: {
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "14px",
          marginBottom: 12
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginBottom: 10,
          alignItems: "end"
        }
      }, /*#__PURE__*/React.createElement(Input, {
        label: T("Job title"),
        value: e.role,
        onChange: function (ev) {
          updateExp(i, "role", ev.target.value);
        },
        placeholder: "e.g. Senior Accountant"
      }), /*#__PURE__*/React.createElement(Input, {
        label: T("Company"),
        value: e.org,
        onChange: function (ev) {
          updateExp(i, "org", ev.target.value);
        },
        placeholder: "Company name"
      }), /*#__PURE__*/React.createElement(Input, {
        label: T("Years"),
        value: e.years,
        onChange: function (ev) {
          updateExp(i, "years", ev.target.value);
        },
        placeholder: "2021\u2013present"
      }), /*#__PURE__*/React.createElement("button", {
        onClick: function () {
          removeExp(i);
        },
        style: {
          height: 40,
          width: 36,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 20
        }
      }, I("trash-2", 15))), /*#__PURE__*/React.createElement(RichEditor, {
        key: "expnote-" + (e._k != null ? e._k : i),
        label: T("Description"),
        rows: 2,
        value: e.note,
        onChange: function (v) {
          updateExp(i, "note", v);
        },
        placeholder: "Key responsibilities and achievements\u2026"
      }));
    })), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      style: sectionStyle
    }, /*#__PURE__*/React.createElement("div", {
      style: sectionHeadStyle
    }, /*#__PURE__*/React.createElement("span", {
      style: iconBoxStyle
    }, I("sparkles", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-md)",
        fontWeight: 700,
        color: "var(--text-strong)",
        flex: 1
      }
    }, T("Skills"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 12,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("input", {
      value: skillInput,
      onChange: function (e) {
        setSkillInput(e.target.value);
      },
      onKeyDown: function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          addSkill();
        }
      },
      placeholder: "Type a skill and press Enter or Add",
      style: {
        flex: 1,
        height: 40,
        padding: "0 12px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: addSkill
    }, T("Add"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8
      }
    }, resume.data.skills.map(function (s, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          background: "var(--brand-subtle)",
          color: "var(--text-brand)",
          borderRadius: 99,
          fontSize: "var(--text-sm)",
          fontWeight: 500
        }
      }, s, /*#__PURE__*/React.createElement("button", {
        onClick: function () {
          removeSkill(i);
        },
        style: {
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--text-muted)",
          display: "inline-flex",
          padding: 0,
          lineHeight: 1
        }
      }, I("x", 12)));
    }), resume.data.skills.length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)",
        fontSize: "var(--text-sm)"
      }
    }, T("No skills added yet.")))), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      style: sectionStyle
    }, /*#__PURE__*/React.createElement("div", {
      style: sectionHeadStyle
    }, /*#__PURE__*/React.createElement("span", {
      style: iconBoxStyle
    }, I("award", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-md)",
        fontWeight: 700,
        color: "var(--text-strong)",
        flex: 1
      }
    }, T("Certifications")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("plus", 13),
      onClick: addCert
    }, T("Add"))), resume.data.certifications.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-faint)",
        fontSize: "var(--text-sm)"
      }
    }, T("No certifications yet.")), resume.data.certifications.map(function (c, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginBottom: 10,
          alignItems: "end"
        }
      }, /*#__PURE__*/React.createElement(Input, {
        label: i === 0 ? T("Certification name") : undefined,
        value: c.name,
        onChange: function (ev) {
          updateCert(i, "name", ev.target.value);
        },
        placeholder: "e.g. CPA Cambodia"
      }), /*#__PURE__*/React.createElement(Input, {
        label: i === 0 ? T("Year") : undefined,
        value: c.year,
        onChange: function (ev) {
          updateCert(i, "year", ev.target.value);
        },
        placeholder: "2021"
      }), /*#__PURE__*/React.createElement("button", {
        onClick: function () {
          removeCert(i);
        },
        style: {
          height: 40,
          width: 36,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }
      }, I("trash-2", 15)));
    })));
  }

  // ── Following ──────────────────────────────────────────────────────────────
  // Reusable client-side pager (auto-hides while everything fits on one page).
  function Pager({
    page,
    perPage,
    total,
    onPage,
    label
  }) {
    var pages = Math.max(1, Math.ceil(total / perPage));
    var safe = Math.min(Math.max(1, page), pages);
    if (total <= perPage) return null;
    var from = total === 0 ? 0 : (safe - 1) * perPage + 1;
    var to = Math.min(total, safe * perPage);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 14,
        flexWrap: "wrap",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Showing ", from, "\u2013", to, " of ", total, label ? " " + label : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: safe <= 1,
      onClick: function () {
        onPage(safe - 1);
      }
    }, T("Previous")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: safe >= pages,
      onClick: function () {
        onPage(safe + 1);
      }
    }, T("Next"))));
  }
  function Following() {
    var [companies, setCompanies] = React.useState([]);
    var [loading, setLoading] = React.useState(true);
    var [error, setError] = React.useState("");
    var [unfollowing, setUnfollowing] = React.useState(null);
    var [page, setPage] = React.useState(1);
    var FOLLOW_PER = 10;
    var pageSafe = Math.min(Math.max(1, page), Math.max(1, Math.ceil(companies.length / FOLLOW_PER)));
    var shown = companies.slice((pageSafe - 1) * FOLLOW_PER, pageSafe * FOLLOW_PER);
    React.useEffect(function () {
      cand.fetchFollowing().then(function (r) {
        setCompanies(r.data || []);
        setLoading(false);
      }).catch(function (e) {
        setError(e.message);
        setLoading(false);
      });
    }, []);
    function handleUnfollow(id) {
      if (!window.confirm("Unfollow this company?")) return;
      setUnfollowing(id);
      cand.unfollowCompany(id).then(function () {
        setCompanies(function (prev) {
          return prev.filter(function (c) {
            return c.id !== id;
          });
        });
        setUnfollowing(null);
      }).catch(function (e) {
        alert(e.message || "Failed.");
        setUnfollowing(null);
      });
    }
    if (loading) return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        color: "var(--text-muted)"
      }
    }, T("Loading…"));
    if (error) return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        color: "var(--danger)"
      }
    }, error);
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 740
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, T("Companies I follow")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, T("You'll get an email when a followed company posts a new job."))), companies.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("heart", 28),
      title: T("Not following anyone yet"),
      description: T("Visit a company profile and click Follow to stay notified of new jobs.")
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, shown.map(function (c) {
      return /*#__PURE__*/React.createElement(Card, {
        key: c.id,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        src: c.logo_url,
        name: c.name,
        square: true,
        size: 48
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)",
          fontSize: "var(--text-sm)"
        }
      }, c.name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginTop: 2
        }
      }, [c.industry, c.location].filter(Boolean).join(" · "), c.open_jobs > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: 8,
          color: "var(--text-brand)",
          fontWeight: 600
        }
      }, c.open_jobs, " open role", c.open_jobs === 1 ? "" : "s"))), /*#__PURE__*/React.createElement("button", {
        onClick: function () {
          handleUnfollow(c.id);
        },
        disabled: unfollowing === c.id,
        style: {
          border: "1px solid var(--border-strong)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--text-muted)",
          padding: "7px 14px",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "var(--text-xs)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6
        }
      }, I("heart-off", 14), " ", T("Unfollow")));
    }), /*#__PURE__*/React.createElement(Pager, {
      page: pageSafe,
      perPage: FOLLOW_PER,
      total: companies.length,
      onPage: setPage,
      label: "companies"
    }))));
  }

  // ── JobAlerts ──────────────────────────────────────────────────────────────
  function JobAlerts() {
    var {
      Card,
      Button,
      Input,
      Select,
      Badge,
      EmptyState
    } = window.KramaDesignSystem_1a6f65;
    var [alerts, setAlerts] = React.useState([]);
    var [loading, setLoading] = React.useState(true);
    var [error, setError] = React.useState("");
    var [deleting, setDeleting] = React.useState(null);
    var [showForm, setShowForm] = React.useState(true);
    var [categories, setCategories] = React.useState([]);
    var [locations, setLocations] = React.useState([]);
    var [form, setForm] = React.useState({
      keyword: "",
      category_id: "",
      location_id: "",
      job_type: "",
      is_remote: ""
    });
    var [saving, setSaving] = React.useState(false);
    var [formErr, setFormErr] = React.useState("");
    function load() {
      cand.fetchAlerts().then(function (r) {
        setAlerts(r.data || []);
        setLoading(false);
      }).catch(function (e) {
        setError(e.message);
        setLoading(false);
      });
    }
    React.useEffect(function () {
      load();
      // Load filter options for the form
      var base = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : window.location.protocol + "//" + window.location.host + "/api";
      Promise.all([fetch(base + "/categories").then(function (r) {
        return r.json();
      }), fetch(base + "/locations").then(function (r) {
        return r.json();
      })]).then(function (r) {
        setCategories(r[0].data || r[0] || []);
        setLocations(r[1].data || r[1] || []);
      }).catch(function () {});
    }, []);
    function handleDelete(id) {
      if (!window.confirm("Delete this alert?")) return;
      setDeleting(id);
      cand.deleteAlert(id).then(function () {
        setAlerts(function (prev) {
          return prev.filter(function (a) {
            return a.id !== id;
          });
        });
        setDeleting(null);
      }).catch(function (e) {
        alert(e.message || "Failed to delete alert.");
        setDeleting(null);
      });
    }
    function handleCreate(e) {
      e.preventDefault();
      setFormErr("");
      var payload = {};
      if (form.keyword.trim()) payload.keyword = form.keyword.trim();
      if (form.category_id) payload.category_id = parseInt(form.category_id);
      if (form.location_id) payload.location_id = parseInt(form.location_id);
      if (form.job_type) payload.job_type = form.job_type;
      if (form.is_remote !== "") payload.is_remote = form.is_remote === "1";
      if (!Object.keys(payload).length) {
        setFormErr("Set at least one filter before saving.");
        return;
      }
      setSaving(true);
      cand.createAlert(payload).then(function (r) {
        setAlerts(function (prev) {
          return [r.data, ...prev];
        });
        setForm({
          keyword: "",
          category_id: "",
          location_id: "",
          job_type: "",
          is_remote: ""
        });
        setShowForm(false);
        setSaving(false);
        setFormErr("");
      }).catch(function (e) {
        setFormErr(e.message || "Failed to save alert.");
        setSaving(false);
      });
    }
    var JOB_TYPES = [{
      value: "",
      label: "Any type"
    }, {
      value: "full_time",
      label: "Full-time"
    }, {
      value: "part_time",
      label: "Part-time"
    }, {
      value: "contract",
      label: "Contract"
    }, {
      value: "internship",
      label: "Internship"
    }];
    var REMOTE_OPTS = [{
      value: "",
      label: "Any"
    }, {
      value: "1",
      label: "Remote only"
    }, {
      value: "0",
      label: "On-site / hybrid"
    }];
    function alertLabel(a) {
      var parts = [];
      if (a.keyword) parts.push('"' + a.keyword + '"');
      if (a.category) parts.push(a.category.name);
      if (a.location) parts.push(a.location.name);
      if (a.job_type) parts.push(a.job_type.replace("_", "-"));
      if (a.is_remote === true) parts.push(T("Remote"));
      return parts.length ? parts.join(" · ") : T("All new jobs");
    }
    if (loading) return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        color: "var(--text-muted)"
      }
    }, T("Loading…"));
    if (error) return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        color: "var(--danger)"
      }
    }, error);
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 740
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, T("Your job alerts")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, T("Get an email the moment a matching role is posted. Up to 10 alerts."))), alerts.length < 10 && alerts.length > 0 && /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      onClick: function () {
        setShowForm(!showForm);
        setFormErr("");
      }
    }, showForm ? T("Cancel") : T("+ New alert"))), showForm && /*#__PURE__*/React.createElement(Card, {
      style: {
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("form", {
      onSubmit: handleCreate
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-base)",
        color: "var(--text-strong)",
        marginBottom: 16
      }
    }, T("Create a new alert")), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Keyword"),
      placeholder: "e.g. Software Engineer",
      value: form.keyword,
      onChange: function (e) {
        setForm(function (f) {
          return Object.assign({}, f, {
            keyword: e.target.value
          });
        });
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Category"),
      placeholder: T("Any category"),
      value: form.category_id,
      onChange: function (e) {
        setForm(function (f) {
          return Object.assign({}, f, {
            category_id: e.target.value
          });
        });
      },
      options: categories.map(function (c) {
        return {
          value: c.id,
          label: c.name
        };
      })
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Location"),
      placeholder: T("Any location"),
      value: form.location_id,
      onChange: function (e) {
        setForm(function (f) {
          return Object.assign({}, f, {
            location_id: e.target.value
          });
        });
      },
      options: locations.map(function (l) {
        return {
          value: l.id,
          label: l.name
        };
      })
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Job type"),
      value: form.job_type,
      onChange: function (e) {
        setForm(function (f) {
          return Object.assign({}, f, {
            job_type: e.target.value
          });
        });
      },
      options: JOB_TYPES.map(function (o) {
        return {
          value: o.value,
          label: T(o.label)
        };
      })
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Work mode"),
      value: form.is_remote,
      onChange: function (e) {
        setForm(function (f) {
          return Object.assign({}, f, {
            is_remote: e.target.value
          });
        });
      },
      options: REMOTE_OPTS.map(function (o) {
        return {
          value: o.value,
          label: T(o.label)
        };
      })
    })), formErr && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-sm)",
        marginBottom: 12
      }
    }, formErr), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      disabled: saving
    }, saving ? T("Saving…") : T("Save alert")))), alerts.length === 0 && !showForm && /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("bell", 28),
      title: T("No job alerts yet"),
      description: T("Create an alert and we'll email you when a matching role is posted.")
    }), alerts.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, alerts.map(function (a) {
      return /*#__PURE__*/React.createElement(Card, {
        key: a.id,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--brand-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }
      }, I("bell", 16)), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: "var(--text-strong)",
          fontSize: "var(--text-sm)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, alertLabel(a)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginTop: 2
        }
      }, "Created ", new Date(a.created_at).toLocaleDateString())), /*#__PURE__*/React.createElement("button", {
        onClick: function () {
          handleDelete(a.id);
        },
        disabled: deleting === a.id,
        style: {
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--text-faint)",
          padding: 6,
          borderRadius: "var(--radius-sm)",
          display: "inline-flex"
        }
      }, I("trash-2", 16)));
    }))));
  }

  // ── Messages ───────────────────────────────────────────────────────────────
  function Messages({
    user
  }) {
    var [convs, setConvs] = React.useState([]);
    var [activeConv, setActiveConv] = React.useState(null);
    var [msgs, setMsgs] = React.useState([]);
    var [body, setBody] = React.useState("");
    var [sending, setSending] = React.useState(false);
    var [loading, setLoading] = React.useState(true);
    var [msgLoading, setMsgLoading] = React.useState(false);
    var bottomRef = React.useRef(null);
    var lastIdRef = React.useRef(0);
    var activeId = activeConv ? activeConv.id : null;
    function fmtTime(iso) {
      if (!iso) return "";
      var d = new Date(iso);
      var now = new Date();
      var diff = now - d;
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return Math.floor(diff / 60000) + "m";
      if (diff < 86400000) return Math.floor(diff / 3600000) + "h";
      return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    }
    function otherParty(conv) {
      if (!user || !user.role) return {};
      return user.role.slug === "candidate" ? conv.employer || {} : conv.candidate || {};
    }
    function reloadConvs() {
      cand.fetchConversations().then(function (d) {
        setConvs(d.data || []);
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }
    function reloadMsgs(convId) {
      cand.fetchMessages(convId).then(function (d) {
        var arr = d.messages && d.messages.data || [];
        setMsgs(arr);
        lastIdRef.current = arr.length ? arr[arr.length - 1].id : 0;
        setMsgLoading(false);
      }).catch(function () {
        setMsgLoading(false);
      });
    }

    // Delta poll: fetch only messages newer than the last one we hold, then append.
    function pollNew(convId) {
      cand.fetchNewMessages(convId, lastIdRef.current).then(function (d) {
        var fresh = d && d.messages || [];
        if (!fresh.length) return;
        setMsgs(function (m) {
          var seen = {};
          m.forEach(function (x) {
            seen[x.id] = 1;
          });
          var add = fresh.filter(function (x) {
            return !seen[x.id];
          });
          return add.length ? m.concat(add) : m;
        });
        lastIdRef.current = Math.max(lastIdRef.current, fresh[fresh.length - 1].id);
      }).catch(function () {});
    }
    React.useEffect(function () {
      reloadConvs();
      var t = setInterval(function () {
        if (!document.hidden) reloadConvs();
      }, 5000);
      return function () {
        clearInterval(t);
      };
    }, []);
    React.useEffect(function () {
      if (!activeId) {
        setMsgs([]);
        lastIdRef.current = 0;
        return;
      }
      setMsgLoading(true);
      lastIdRef.current = 0;
      reloadMsgs(activeId);
      var t = setInterval(function () {
        if (!document.hidden) pollNew(activeId);
      }, 1500);
      function onVis() {
        if (!document.hidden) pollNew(activeId);
      }
      document.addEventListener("visibilitychange", onVis);
      return function () {
        clearInterval(t);
        document.removeEventListener("visibilitychange", onVis);
      };
    }, [activeId]);
    React.useEffect(function () {
      if (bottomRef.current) bottomRef.current.scrollIntoView({
        behavior: "smooth"
      });
    }, [msgs.length]);
    function send() {
      if (!body.trim() || !activeId || sending) return;
      setSending(true);
      cand.sendMessage(activeId, body.trim()).then(function (msg) {
        setMsgs(function (m) {
          if (msg && m.some(function (x) {
            return x.id === msg.id;
          })) return m;
          return m.concat(msg);
        });
        if (msg && msg.id) lastIdRef.current = Math.max(lastIdRef.current, msg.id);
        setBody("");
        setSending(false);
        reloadConvs();
      }).catch(function (e) {
        alert(e.message || "Failed to send.");
        setSending(false);
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-msg-wrap" + (activeConv ? " krm-msg-wrap--active" : ""),
      style: {
        display: "flex",
        height: "calc(100vh - 64px)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-msg-list",
      style: {
        width: 290,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 16px 12px",
        borderBottom: "1px solid var(--border)",
        fontWeight: 700,
        fontSize: "var(--text-base)",
        color: "var(--text-strong)"
      }
    }, T("Conversations")), loading && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, T("Loading…")), !loading && convs.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, I("message-square", 28), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8
      }
    }, T("No conversations yet.")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        fontSize: 12,
        color: "var(--text-faint)"
      }
    }, T("Employers can message you directly after viewing your application."))), convs.map(function (conv) {
      var other = otherParty(conv);
      var latest = conv.latest_message;
      var isActive = activeId === conv.id;
      return /*#__PURE__*/React.createElement("button", {
        key: conv.id,
        onClick: function () {
          setActiveConv(conv);
        },
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11,
          width: "100%",
          border: "none",
          background: isActive ? "var(--brand-subtle)" : "transparent",
          padding: "11px 14px",
          cursor: "pointer",
          textAlign: "left",
          borderBottom: "1px solid var(--border-subtle)"
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: other.name || "?",
        src: other.avatar_url,
        size: 38
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0,
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: "var(--text-sm)",
          color: isActive ? "var(--text-brand)" : "var(--text-strong)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, other.name || "?"), latest && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: "var(--text-faint)",
          flexShrink: 0
        }
      }, fmtTime(latest.created_at))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 2
        }
      }, latest && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1
        }
      }, latest.body), conv.unread_count > 0 && /*#__PURE__*/React.createElement(Badge, {
        tone: "brand"
      }, conv.unread_count))));
    })), /*#__PURE__*/React.createElement("div", {
      className: "krm-msg-thread",
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        background: "var(--surface-page)"
      }
    }, !activeConv ? /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        color: "var(--text-faint)"
      }
    }, I("message-square", 40), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)"
      }
    }, T("Select a conversation to read messages"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--surface-card)",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "krm-msg-back",
      onClick: function () {
        setActiveConv(null);
      },
      "aria-label": "Back to conversations",
      style: {
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        flexShrink: 0,
        marginLeft: -6,
        padding: 0
      }
    }, I("arrow-left", 20)), /*#__PURE__*/React.createElement(Avatar, {
      name: otherParty(activeConv).name || "?",
      src: otherParty(activeConv).avatar_url,
      size: 36
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-base)"
      }
    }, otherParty(activeConv).name || "?"), activeConv.job && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, "Re: ", activeConv.job.title))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, msgLoading && msgs.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, T("Loading…")), msgs.map(function (msg) {
      var mine = msg.sender_id === user.id;
      return /*#__PURE__*/React.createElement("div", {
        key: msg.id,
        style: {
          display: "flex",
          flexDirection: mine ? "row-reverse" : "row",
          gap: 8,
          alignItems: "flex-end"
        }
      }, !mine && /*#__PURE__*/React.createElement(Avatar, {
        name: msg.sender && msg.sender.name || "?",
        src: msg.sender && msg.sender.avatar_url,
        size: 26
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: "70%",
          padding: "8px 12px",
          lineHeight: 1.55,
          fontSize: "var(--text-sm)",
          background: mine ? "var(--brand)" : "var(--surface-card)",
          color: mine ? "#fff" : "var(--text-body)",
          borderRadius: mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          border: mine ? "none" : "1px solid var(--border)"
        }
      }, msg.body, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          marginTop: 4,
          opacity: 0.65
        }
      }, fmtTime(msg.created_at))));
    }), /*#__PURE__*/React.createElement("div", {
      ref: bottomRef
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 20px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        background: "var(--surface-card)",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      value: body,
      onChange: function (e) {
        setBody(e.target.value);
      },
      onKeyDown: function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      },
      placeholder: "Type a message\u2026 (Enter to send, Shift+Enter for new line)",
      rows: 2,
      style: {
        flex: 1,
        resize: "none",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        background: "var(--surface-page)",
        outline: "none",
        lineHeight: 1.5
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("send", 16),
      disabled: sending || !body.trim(),
      onClick: send
    }, sending ? "…" : T("Send"))))));
  }

  // ── App ────────────────────────────────────────────────────────────────────
  // ── Onboarding wizard ──────────────────────────────────────────────────────
  // Guided 3-step setup for new candidates (Jobs you want → Upload CV → Work experience).
  // Reuses existing endpoints only (createAlert / uploadCv / saveResume). Auto-shown once for
  // an empty profile; also launchable from the dashboard completion card.
  function OnboardingWizard({
    user,
    resume,
    onClose,
    onDone
  }) {
    var STEPS = ["Jobs you want", "Upload CV", "Work experience"];
    var JOB_TYPES = [{
      v: "full_time",
      l: "Full time"
    }, {
      v: "part_time",
      l: "Part time"
    }, {
      v: "contract",
      l: "Contract"
    }, {
      v: "internship",
      l: "Internship"
    }];
    var [step, setStep] = React.useState(0);
    var [cats, setCats] = React.useState([]);
    var [locs, setLocs] = React.useState([]);
    var [prefs, setPrefs] = React.useState({
      keyword: "",
      category_id: "",
      location_id: "",
      job_type: ""
    });
    var [cvName, setCvName] = React.useState(resume && (resume.has_cv || resume.download_url) ? "CV already on file" : "");
    var [uploading, setUploading] = React.useState(false);
    var [exp, setExp] = React.useState({
      role: "",
      org: "",
      years: ""
    });
    var [saving, setSaving] = React.useState(false);
    var [err, setErr] = React.useState("");
    var cvRef = React.useRef(null);
    React.useEffect(function () {
      var base = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : window.location.protocol + "//" + window.location.host + "/api";
      Promise.all([fetch(base + "/categories").then(function (r) {
        return r.json();
      }), fetch(base + "/locations").then(function (r) {
        return r.json();
      })]).then(function (res) {
        setCats(res[0] || []);
        setLocs(res[1] || []);
      }).catch(function () {});
    }, []);
    function setP(k, v) {
      setPrefs(function (p) {
        var o = Object.assign({}, p);
        o[k] = v;
        return o;
      });
    }
    function setE(k, v) {
      setExp(function (e) {
        var o = Object.assign({}, e);
        o[k] = v;
        return o;
      });
    }
    function onCv(e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      setUploading(true);
      setErr("");
      cand.uploadCv(f).then(function () {
        setCvName(f.name);
        setUploading(false);
      }).catch(function (er) {
        setErr(er && er.message || "Upload failed.");
        setUploading(false);
      });
    }
    function finish() {
      setSaving(true);
      setErr("");
      var tasks = [];
      var p = {};
      if (prefs.keyword.trim()) p.keyword = prefs.keyword.trim();
      if (prefs.category_id) p.category_id = parseInt(prefs.category_id);
      if (prefs.location_id) p.location_id = parseInt(prefs.location_id);
      if (prefs.job_type) p.job_type = prefs.job_type;
      if (Object.keys(p).length) tasks.push(cand.createAlert(p).catch(function () {}));
      if (exp.role.trim() || exp.org.trim()) {
        var d = Object.assign({
          education: [],
          experience: [],
          skills: [],
          certifications: []
        }, resume && resume.data || {});
        d.experience = (d.experience || []).concat({
          role: exp.role.trim(),
          org: exp.org.trim(),
          years: exp.years.trim(),
          note: ""
        });
        tasks.push(cand.saveResume({
          headline: resume && resume.headline || "",
          summary: resume && resume.summary || "",
          data: d
        }).catch(function () {}));
      }
      Promise.all(tasks).then(function () {
        setSaving(false);
        onDone();
      }).catch(function () {
        setSaving(false);
        onDone();
      });
    }
    function next() {
      if (step < STEPS.length - 1) setStep(step + 1);else finish();
    }
    var pct = Math.round((step + 1) / STEPS.length * 100);
    var last = step === STEPS.length - 1;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "var(--surface-overlay, rgba(0,0,0,0.5))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function (e) {
        e.stopPropagation();
      },
      style: {
        width: "100%",
        maxWidth: 520,
        maxHeight: "92vh",
        overflowY: "auto",
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "20px 24px 0",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-xl)",
        color: "var(--text-strong)"
      }
    }, T("Set up your profile")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, T("Step"), " ", step + 1, " ", T("of"), " ", STEPS.length, " \xB7 ", T(STEPS[step]))), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "Close",
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("x", 20))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "14px 24px 0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        background: "var(--border-subtle)",
        borderRadius: 99,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        width: pct + "%",
        background: "var(--brand)",
        borderRadius: 99,
        transition: "width .3s ease"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, step === 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, T("Tell us what you're looking for — we'll email you matching jobs.")), /*#__PURE__*/React.createElement(Input, {
      label: T("Job title you want"),
      placeholder: "e.g. IT Manager, Accountant",
      value: prefs.keyword,
      onChange: function (e) {
        setP("keyword", e.target.value);
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Field / category"),
      placeholder: T("Any field"),
      value: prefs.category_id,
      onChange: function (e) {
        setP("category_id", e.target.value);
      },
      options: cats.map(function (c) {
        return {
          value: c.id,
          label: c.name
        };
      })
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Location"),
      placeholder: T("Any location"),
      value: prefs.location_id,
      onChange: function (e) {
        setP("location_id", e.target.value);
      },
      options: locs.map(function (l) {
        return {
          value: l.id,
          label: l.name
        };
      })
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Employment type"),
      placeholder: T("Any type"),
      value: prefs.job_type,
      onChange: function (e) {
        setP("job_type", e.target.value);
      },
      options: JOB_TYPES.map(function (t) {
        return {
          value: t.v,
          label: T(t.l)
        };
      })
    })), step === 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, T("Upload your CV so you can apply to jobs in one click.")), /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1.5px dashed var(--border-strong)",
        borderRadius: "var(--radius-lg)",
        padding: "28px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: cvName ? "var(--success)" : "var(--text-faint)"
      }
    }, I(cvName ? "circle-check-big" : "cloud-upload", 34)), cvName ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, cvName) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, T("Upload your CV file")), /*#__PURE__*/React.createElement("input", {
      ref: cvRef,
      type: "file",
      accept: ".pdf,.doc,.docx",
      onChange: onCv,
      style: {
        display: "none"
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: uploading,
      onClick: function () {
        cvRef.current && cvRef.current.click();
      }
    }, uploading ? T("Uploading…") : cvName ? T("Choose a different file") : T("Browse files")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, ".pdf, .doc or .docx \xB7 up to 5 MB"))), step === 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, T("Add your most recent role — employers see this on your profile.")), /*#__PURE__*/React.createElement(Input, {
      label: T("Position"),
      placeholder: "e.g. HR Manager, Accountant",
      value: exp.role,
      onChange: function (e) {
        setE("role", e.target.value);
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: T("Company name"),
      placeholder: "e.g. ABA Bank",
      value: exp.org,
      onChange: function (e) {
        setE("org", e.target.value);
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: T("Years"),
      placeholder: "e.g. 2021 \u2013 Present",
      value: exp.years,
      onChange: function (e) {
        setE("years", e.target.value);
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, T("You can add more roles later in the Résumé builder."))), err && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "9px 12px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, err)), /*#__PURE__*/React.createElement("div", {
      className: "krm-wizard-foot",
      style: {
        padding: "0 24px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, step > 0 && /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: function () {
        setStep(step - 1);
      }
    }, T("Back")), /*#__PURE__*/React.createElement("button", {
      onClick: next,
      style: {
        marginLeft: "auto",
        border: "none",
        background: "transparent",
        color: "var(--text-muted)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        padding: "8px 4px",
        whiteSpace: "nowrap",
        flexShrink: 0
      }
    }, T("Skip this step")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: saving,
      onClick: next
    }, saving ? T("Saving…") : last ? T("Finish setup") : T("Continue")))));
  }

  // In-app support thread. Messages relay to a Telegram support group and agent replies come
  // back through the webhook, so there is nothing to push to the browser — poll while the
  // page is open (and only while the tab is visible, to avoid pointless background traffic).
  function SupportThread({
    onRead
  }) {
    const [msgs, setMsgs] = React.useState(null);
    const [body, setBody] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [err, setErr] = React.useState("");
    const endRef = React.useRef(null);
    const load = function () {
      return cand.fetchSupportThread().then(function (d) {
        setMsgs(d && d.messages || []);
        // GET /support/thread clears unread_for_user server-side, so drop the nav badge now
        // rather than leaving it lit until the next 15s poll.
        if (onRead) onRead();
      }).catch(function () {/* keep whatever is on screen */});
    };
    React.useEffect(function () {
      load();
      const t = setInterval(function () {
        if (!document.hidden) load();
      }, 15000);
      return function () {
        clearInterval(t);
      };
    }, []);
    React.useEffect(function () {
      if (endRef.current && endRef.current.scrollIntoView) endRef.current.scrollIntoView({
        block: "end"
      });
    }, [msgs]);
    const send = function () {
      const text = body.trim();
      if (!text || sending) return;
      setSending(true);
      setErr("");
      cand.sendSupportMessage(text).then(function () {
        setBody("");
        return load();
      }).catch(function (e) {
        setErr(e && e.message || "Couldn’t send that. Please try again.");
      }).then(function () {
        setSending(false);
      });
    };
    const onKey = function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-page)",
        padding: 14,
        maxHeight: 380,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, msgs === null ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, T("Loading…")) : msgs.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "No messages yet \u2014 tell us what you need help with and we\u2019ll reply here.") : msgs.map(function (m) {
      const mine = m.sender === "user";
      return /*#__PURE__*/React.createElement("div", {
        key: m.id,
        style: {
          display: "flex",
          justifyContent: mine ? "flex-end" : "flex-start"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: "78%",
          padding: "9px 13px",
          borderRadius: "var(--radius-md)",
          background: mine ? "var(--brand)" : "var(--surface-card)",
          color: mine ? "var(--on-brand)" : "var(--text-body)",
          border: mine ? "none" : "1px solid var(--border)",
          fontSize: "var(--text-sm)",
          whiteSpace: "pre-wrap"
        }
      }, !mine && m.agent_name ? /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: "var(--text-brand)",
          marginBottom: 3
        }
      }, m.agent_name) : null, m.body));
    }), /*#__PURE__*/React.createElement("div", {
      ref: endRef
    })), err ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--danger)",
        marginTop: 8
      }
    }, err) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      value: body,
      onChange: function (e) {
        setBody(e.target.value);
      },
      onKeyDown: onKey,
      rows: 2,
      placeholder: "Type your message\u2026",
      style: {
        flex: 1,
        resize: "vertical",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)",
        outline: "none",
        background: "var(--surface-card)"
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: send,
      disabled: !body.trim() || sending,
      iconLeft: I("send", 16)
    }, sending ? "Sending…" : "Send")));
  }

  // ===== Help & support =====
  // The server decides HOW support is offered (see App\Http\Controllers\SupportController).
  // Today that is a Telegram deep link carrying a signed token so whoever answers knows who
  // is writing. When the in-app bridge ships, config.mode becomes "in_app" and only the
  // branch below changes — the nav entry, the page and the API call all stay as they are.
  function HelpSupport({
    user,
    onRead
  }) {
    const [cfg, setCfg] = React.useState(null);
    const [failed, setFailed] = React.useState(false);
    React.useEffect(function () {
      cand.fetchSupportConfig().then(setCfg).catch(function () {
        setFailed(true);
      });
    }, []);
    const open = function () {
      if (cfg && cfg.url) window.open(cfg.url, "_blank", "noopener,noreferrer");
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        maxWidth: 820
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Help & support",
      sub: "Talk to the Krama team \u2014 we usually reply within a few hours."
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I("life-buoy", 19)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Chat with support")), failed ? /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Couldn\u2019t load support options just now. Please refresh, or email us.") : !cfg ? /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Loading\u2026") : !cfg.enabled ? /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Live chat is closed at the moment. Please email us and we\u2019ll come back to you.") : cfg.mode === "telegram_link" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        margin: "0 0 4px"
      }
    }, "Opens a private Telegram chat with ", /*#__PURE__*/React.createElement("strong", null, "@", cfg.handle), ". Your account is identified automatically, so there\u2019s no need to explain who you are."), cfg.hours ? /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)",
        margin: "0 0 16px"
      }
    }, cfg.hours) : /*#__PURE__*/React.createElement("div", {
      style: {
        height: 12
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("send", 16),
      onClick: open
    }, "Chat on Telegram"), cfg.note ? /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 14
      }
    }, cfg.note) : null) :
    /*#__PURE__*/
    /* mode === "in_app" — bridged to the Telegram support group. */
    React.createElement(SupportThread, {
      onRead: onRead
    })));
  }

  // ── Digital CV (shareable public CV page + QR) ─────────────────────────────
  // Renders a URL to a QR image via the qrcodejs UMD lib (loaded on demand from the CDN),
  // same pattern as the employer KHQR canvas.
  function QrCanvas({
    value,
    size
  }) {
    var ref = React.useRef(null);
    React.useEffect(function () {
      var s = size || 200;
      function draw() {
        if (window.QRCode && ref.current && value) {
          ref.current.innerHTML = "";
          new window.QRCode(ref.current, {
            text: value,
            width: s,
            height: s,
            correctLevel: window.QRCode.CorrectLevel.M
          });
        }
      }
      if (window.QRCode) {
        draw();
        return;
      }
      var existing = document.getElementById("qrcode-lib");
      if (existing) {
        existing.addEventListener("load", draw);
        return;
      }
      var sc = document.createElement("script");
      sc.id = "qrcode-lib";
      sc.src = "https://unpkg.com/qrcodejs@1.0.0/qrcode.min.js";
      sc.onload = draw;
      document.head.appendChild(sc);
    }, [value, size]);
    return /*#__PURE__*/React.createElement("div", {
      ref: ref,
      style: {
        width: size || 200,
        height: size || 200
      }
    });
  }
  function DigitalCv({
    user
  }) {
    var [link, setLink] = React.useState(null);
    var [loading, setLoading] = React.useState(true);
    var [copied, setCopied] = React.useState(false);
    React.useEffect(function () {
      cand.fetchCvLink().then(function (d) {
        setLink(d);
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }, []);
    function copy() {
      if (!link || !link.url) return;
      try {
        navigator.clipboard.writeText(link.url);
      } catch (e) {}
      setCopied(true);
      setTimeout(function () {
        setCopied(false);
      }, 1800);
    }
    var isPrivate = link && link.visibility === "private";
    var url = link ? link.url : "";
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        maxWidth: 720
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: T("My Digital CV"),
      sub: T("Share your CV with a link or QR code.")
    }), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)"
      }
    }, T("Loading…")) : /*#__PURE__*/React.createElement(Card, {
      padding: 28
    }, isPrivate && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 16px",
        background: "var(--warning-subtle, #fef9c3)",
        color: "var(--warning, #92400e)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        marginBottom: 20
      }
    }, T("Your CV is private, so this link won't open. Set visibility to Employers or Public in your Profile to share it.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 24,
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(QrCanvas, {
      value: url,
      size: 200
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 240
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)",
        marginBottom: 6
      }
    }, user ? user.name : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 16,
        lineHeight: 1.6
      }
    }, T("Scan the code or share the link — anyone can view your CV, no login needed.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("input", {
      readOnly: true,
      value: url,
      onClick: function (e) {
        e.target.select();
      },
      style: {
        flex: 1,
        minWidth: 180,
        height: 40,
        padding: "0 12px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        background: "var(--surface-page)"
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: I(copied ? "check" : "copy", 15),
      onClick: copy
    }, copied ? T("Copied!") : T("Copy link"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("external-link", 15),
      onClick: function () {
        if (url) window.open(url, "_blank", "noopener");
      }
    }, T("Open public CV")))))));
  }
  function App() {
    var [page, setPage] = React.useState("dashboard");
    var [lang, setLang] = React.useState(window.KRAMA_LANG === "km" ? "km" : "en");
    function switchLang(l) {
      if (window.KRAMA_SET_LANG) window.KRAMA_SET_LANG(l);
      setLang(l);
    }
    var [authUser, setAuthUser] = React.useState(null);
    var [authLoading, setAuthLoading] = React.useState(true);
    var [resume, setResume] = React.useState(null); // for the profile-completion meter
    var [showOnboarding, setShowOnboarding] = React.useState(false);
    var onboardCheckedRef = React.useRef(false);
    var [badges, setBadges] = React.useState({
      applications: 0,
      saved: 0,
      messages: 0,
      support: 0
    });
    var [sidebarOpen, setSidebarOpen] = React.useState(false);
    // Which tab the Applications page opens on (set by the dashboard "Interviews" stat).
    var [appsInitialTab, setAppsInitialTab] = React.useState("all");
    // Normal navigation resets the applications tab to "all"; the Interviews stat deep-links.
    function navTo(p) {
      setAppsInitialTab("all");
      setPage(p);
    }
    function goApplications(t) {
      setAppsInitialTab(t || "all");
      setPage("applications");
    }
    React.useEffect(function () {
      if (!cand.token()) {
        setAuthLoading(false);
        return;
      }
      cand.fetchMe().then(function (u) {
        if (u && u.role && u.role.slug === "candidate") {
          setAuthUser(u);
        }
        setAuthLoading(false);
      }).catch(function () {
        setAuthLoading(false);
      });
    }, []);

    // Load badge counts once logged in
    React.useEffect(function () {
      if (!authUser) return;
      Promise.all([cand.fetchApplications("", 1), cand.fetchSavedJobs(1)]).then(function (r) {
        setBadges(function (b) {
          return Object.assign({}, b, {
            applications: r[0].total || 0,
            saved: r[1].total || 0
          });
        });
      }).catch(function () {});
    }, [authUser]);

    // Résumé drives half of the profile-completion meter; (re)load it and expose a reloader
    // so the meter stays live after the candidate edits their résumé.
    function reloadResume() {
      cand.fetchResume().then(setResume).catch(function () {});
    }
    React.useEffect(function () {
      if (authUser) reloadResume();
    }, [authUser]);

    // Auto-open the onboarding wizard ONCE for a brand-new (empty) profile that hasn't been
    // through / dismissed setup. Runs after the résumé loads so the "is empty" check is real.
    React.useEffect(function () {
      if (onboardCheckedRef.current || !authUser || resume === null) return;
      onboardCheckedRef.current = true;
      var d = resume.data || {};
      var isNew = !(d.experience || []).length && !(resume.has_cv || resume.download_url) && !(resume.headline && String(resume.headline).trim());
      if (isNew && !localStorage.getItem("krama_cand_onboarded")) setShowOnboarding(true);
    }, [authUser, resume]);
    function dismissOnboarding() {
      try {
        localStorage.setItem("krama_cand_onboarded", "1");
      } catch (e) {}
      setShowOnboarding(false);
    }
    function finishOnboarding() {
      dismissOnboarding();
      reloadResume();
    }
    var completion = profileCompletion(authUser, resume);

    // Poll unread message count every 15s
    React.useEffect(function () {
      if (!authUser) return;
      function pollUnread() {
        cand.fetchUnreadCount().then(function (d) {
          setBadges(function (b) {
            return Object.assign({}, b, {
              messages: d.count || 0
            });
          });
        }).catch(function () {});
        // Support replies come from an agent in Telegram, so nothing pushes them here —
        // reuse this 15s poll instead of adding another interval.
        cand.fetchSupportUnread().then(function (d) {
          setBadges(function (b) {
            return Object.assign({}, b, {
              support: d.count || 0
            });
          });
        }).catch(function () {});
      }
      pollUnread();
      var t = setInterval(pollUnread, 15000);
      return function () {
        clearInterval(t);
      };
    }, [authUser]);
    function handleLogout() {
      function doLogout() {
        localStorage.removeItem("krama_access_token");
        localStorage.removeItem("krama_refresh_token");
        localStorage.removeItem("krama_admin_token");
        localStorage.removeItem("krama_admin_refresh_token");
        localStorage.removeItem("krama_employer_token");
        localStorage.removeItem("krama_employer_refresh_token");
        window.location.href = HOME_URL;
      }
      cand.logout().then(doLogout).catch(doLogout);
    }
    if (authLoading) return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "var(--text-muted)"
      }
    }, T("Loading…"));
    if (!authUser) return /*#__PURE__*/React.createElement(CandidateLogin, {
      onLogin: function (u) {
        setAuthUser(u);
      }
    });
    var titles = {
      dashboard: T("Welcome back") + ", " + authUser.name.split(" ")[0],
      cv: T("My Digital CV"),
      applications: T("My applications"),
      saved: T("Saved jobs"),
      recommended: T("Recommended for you"),
      following: T("Companies I follow"),
      alerts: T("Job alerts"),
      messages: T("Messages"),
      resume: T("Résumé builder"),
      support: T("Help & support"),
      profile: T("Profile")
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        minHeight: "100vh",
        background: "var(--surface-page)"
      }
    }, sidebarOpen && /*#__PURE__*/React.createElement("div", {
      className: "krm-sidebar-backdrop open",
      onClick: function () {
        setSidebarOpen(false);
      }
    }), showOnboarding && /*#__PURE__*/React.createElement(OnboardingWizard, {
      user: authUser,
      resume: resume,
      onClose: dismissOnboarding,
      onDone: finishOnboarding
    }), /*#__PURE__*/React.createElement(Sidebar, {
      page: page,
      onNav: navTo,
      user: authUser,
      badges: badges,
      open: sidebarOpen,
      onClose: function () {
        setSidebarOpen(false);
      },
      onLogout: handleLogout,
      completion: completion,
      lang: lang,
      onLang: switchLang
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column"
      }
    }, /*#__PURE__*/React.createElement(Topbar, {
      title: titles[page],
      user: authUser,
      onLogout: handleLogout,
      onMenu: function () {
        setSidebarOpen(function (o) {
          return !o;
        });
      },
      onNav: navTo
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto"
      }
    }, page === "dashboard" && /*#__PURE__*/React.createElement(Overview, {
      user: authUser,
      onNav: navTo,
      onOpenApplications: goApplications,
      completion: completion,
      onStartWizard: function () {
        setShowOnboarding(true);
      }
    }), page === "cv" && /*#__PURE__*/React.createElement(DigitalCv, {
      user: authUser
    }), page === "applications" && /*#__PURE__*/React.createElement(Applications, {
      initialTab: appsInitialTab,
      onBadgeChange: function (n) {
        setBadges(function (b) {
          return Object.assign({}, b, {
            applications: n
          });
        });
      },
      onGoToMessages: function () {
        setPage("messages");
      }
    }), page === "saved" && /*#__PURE__*/React.createElement(SavedJobs, {
      onBadgeChange: function (n) {
        setBadges(function (b) {
          return Object.assign({}, b, {
            saved: n
          });
        });
      }
    }), page === "recommended" && /*#__PURE__*/React.createElement(Recommended, null), page === "following" && /*#__PURE__*/React.createElement(Following, null), page === "alerts" && /*#__PURE__*/React.createElement(JobAlerts, null), page === "messages" && /*#__PURE__*/React.createElement(Messages, {
      user: authUser
    }), page === "resume" && /*#__PURE__*/React.createElement(ResumeBuilder, {
      onResumeSaved: reloadResume
    }), page === "profile" && /*#__PURE__*/React.createElement(Profile, {
      user: authUser,
      onUserUpdate: function (u) {
        setAuthUser(u);
      }
    }), page === "support" && /*#__PURE__*/React.createElement(HelpSupport, {
      user: authUser,
      onRead: function () {
        setBadges(function (b) {
          return Object.assign({}, b, {
            support: 0
          });
        });
      }
    }))));
  }
  window.KramaCandidateApp = App;
})();