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
    Select: DSSelect,
    Tag,
    Switch,
    Modal
  } = NS;

  // ── Select: native on desktop, custom dropdown on mobile ────────────────────────────────
  // Android/iOS render a native <select>'s option list with a large, system-scaled font that
  // ignores our CSS — so on a phone the picker text dwarfs the rest of the app. This wrapper
  // keeps the safe native control on desktop but swaps in a custom, app-sized dropdown on
  // mobile so every combobox reads at the same size as the surrounding UI. Drop-in
  // API-compatible with the DS Select (label / value / onChange / options / placeholder /
  // disabled / hint / error / style / containerStyle); onChange receives {target:{value}}.
  function useIsMobile() {
    const q = "(max-width: 768px)";
    const [m, setM] = React.useState(function () {
      return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(q).matches;
    });
    React.useEffect(function () {
      if (!window.matchMedia) return;
      var mq = window.matchMedia(q);
      var fn = function (e) {
        setM(e.matches);
      };
      mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
      return function () {
        mq.removeEventListener ? mq.removeEventListener("change", fn) : mq.removeListener(fn);
      };
    }, []);
    return m;
  }
  function normalizeOptions(options, children) {
    if (options && options.length) {
      return options.map(function (o) {
        return typeof o === "string" ? {
          value: o,
          label: o
        } : o;
      });
    }
    var out = [];
    React.Children.forEach(children, function (c) {
      if (c && c.type === "option") out.push({
        value: c.props.value,
        label: c.props.children
      });
    });
    return out;
  }
  function MobileSelect(props) {
    var label = props.label,
      value = props.value,
      onChange = props.onChange;
    var placeholder = props.placeholder,
      disabled = props.disabled;
    var hint = props.hint,
      error = props.error;
    var opts = normalizeOptions(props.options, props.children);
    var btnRef = React.useRef(null);
    var listRef = React.useRef(null);
    var _o = React.useState(false),
      open = _o[0],
      setOpen = _o[1];
    var _r = React.useState(null),
      pos = _r[0],
      setPos = _r[1];
    var selected = opts.find(function (o) {
      return String(o.value) === String(value);
    });
    var display = selected ? selected.label : placeholder || "";
    var place = function () {
      var el = btnRef.current;
      if (!el) return;
      var r = el.getBoundingClientRect();
      var below = window.innerHeight - r.bottom,
        above = r.top;
      var openUp = below < 240 && above > below;
      setPos({
        left: r.left,
        width: r.width,
        top: openUp ? null : r.bottom + 4,
        bottom: openUp ? window.innerHeight - r.top + 4 : null,
        maxH: Math.max(160, (openUp ? above : below) - 16)
      });
    };
    var doOpen = function () {
      if (disabled) return;
      place();
      setOpen(true);
    };
    var pick = function (o) {
      setOpen(false);
      if (onChange) onChange({
        target: {
          value: o.value
        }
      });
    };
    React.useEffect(function () {
      if (!open) return;
      var onScroll = function (e) {
        // Don't close while scrolling INSIDE the options list — only when the page/background scrolls.
        if (listRef.current && (listRef.current === e.target || listRef.current.contains(e.target))) return;
        setOpen(false);
      };
      var onResize = function () {
        setOpen(false);
      };
      var onKey = function (e) {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      window.addEventListener("keydown", onKey);
      return function () {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("keydown", onKey);
      };
    }, [open]);
    var borderColor = error ? "var(--danger)" : open ? "var(--border-focus)" : "var(--border-strong)";
    return React.createElement("div", {
      style: Object.assign({
        display: "flex",
        flexDirection: "column",
        gap: 6
      }, props.containerStyle)
    }, label && React.createElement("label", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, label), React.createElement("div", {
      style: {
        position: "relative"
      }
    }, React.createElement("button", {
      ref: btnRef,
      type: "button",
      disabled: disabled,
      onClick: doOpen,
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      style: Object.assign({
        appearance: "none",
        width: "100%",
        height: 44,
        padding: "0 38px 0 14px",
        textAlign: "left",
        background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
        border: "1px solid " + borderColor,
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        color: display ? "var(--text-strong)" : "var(--text-faint)",
        cursor: disabled ? "default" : "pointer",
        outline: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }, props.style)
    }, display || placeholder || " "), React.createElement("span", {
      style: {
        position: "absolute",
        right: 14,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: "var(--text-faint)"
      }
    }, React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    })))), (hint || error) && React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: error ? "var(--danger)" : "var(--text-muted)"
      }
    }, error || hint), open && pos && window.ReactDOM.createPortal(React.createElement("div", {
      onClick: function () {
        setOpen(false);
      },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 4000
      }
    }, React.createElement("div", {
      ref: listRef,
      role: "listbox",
      onClick: function (e) {
        e.stopPropagation();
      },
      style: {
        position: "fixed",
        left: pos.left,
        width: pos.width,
        top: pos.top != null ? pos.top : "auto",
        bottom: pos.bottom != null ? pos.bottom : "auto",
        maxHeight: pos.maxH,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-xl)",
        padding: 4
      }
    }, opts.map(function (o, i) {
      var isSel = String(o.value) === String(value);
      return React.createElement("div", {
        key: String(o.value) + i,
        role: "option",
        "aria-selected": isSel,
        onClick: function () {
          pick(o);
        },
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "9px 12px",
          borderRadius: "var(--radius-sm, 6px)",
          cursor: "pointer",
          fontSize: "var(--text-sm)",
          lineHeight: 1.4,
          color: isSel ? "var(--text-brand)" : "var(--text-body)",
          fontWeight: isSel ? 600 : 400,
          background: isSel ? "var(--brand-subtle)" : "transparent"
        }
      }, React.createElement("span", null, o.label), isSel && React.createElement("span", {
        style: {
          flexShrink: 0,
          display: "inline-flex",
          color: "var(--text-brand)"
        }
      }, React.createElement("svg", {
        width: "15",
        height: "15",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.4",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      }))));
    }))), document.body));
  }
  function Select(props) {
    var isMobile = useIsMobile();
    return isMobile ? React.createElement(MobileSelect, props) : React.createElement(DSSelect, props);
  }

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
    "Invitations": "ការអញ្ជើញ",
    "Employers who invited you to apply.": "និយោជកដែលបានអញ្ជើញអ្នកឱ្យដាក់ពាក្យ។",
    "No invitations yet": "មិនទាន់មានការអញ្ជើញនៅឡើយ",
    "When an employer invites you to apply for a role, it will appear here.": "នៅពេលនិយោជកអញ្ជើញអ្នកឱ្យដាក់ពាក្យសុំតំណែងណាមួយ វានឹងបង្ហាញនៅទីនេះ។",
    "New": "ថ្មី",
    "Decline": "បដិសេធ",
    "Already applied": "បានដាក់ពាក្យរួចហើយ",
    "Job closed": "ការងារបានបិទ",
    "Résumé builder": "បង្កើតប្រវត្តិរូប",
    "Profile": "ប្រវត្តិរូប",
    "Help & support": "ជំនួយ",
    "Profile strength": "កម្រិតប្រវត្តិរូប",
    "Profile complete": "ប្រវត្តិរូបពេញលេញ",
    "Sign out": "ចាកចេញ",
    "Welcome back": "សូមស្វាគមន៍ត្រឡប់មកវិញ",
    "Recommended for you": "បានណែនាំសម្រាប់អ្នក",
    "Companies I follow": "ក្រុមហ៊ុនដែលខ្ញុំតាមដាន",
    "Who viewed you": "អ្នកដែលមើលប្រវត្តិរូប",
    "Who viewed your profile": "អ្នកដែលបានមើលប្រវត្តិរូបរបស់អ្នក",
    "Employers who opened your profile from candidate search. A complete profile gets viewed more.": "និយោជកដែលបានបើកប្រវត្តិរូបរបស់អ្នកពីការស្វែងរកបេក្ខជន។ ប្រវត្តិរូបពេញលេញ ត្រូវបានមើលកាន់តែច្រើន។",
    "No profile views yet": "មិនទាន់មានការមើលប្រវត្តិរូបនៅឡើយ",
    "When an employer views your profile, you'll see them here. Complete your profile and add your CV to get discovered.": "នៅពេលនិយោជកមើលប្រវត្តិរូបរបស់អ្នក អ្នកនឹងឃើញនៅទីនេះ។ បំពេញប្រវត្តិរូប និងបន្ថែម CV ដើម្បីត្រូវបានរកឃើញ។",
    "viewed": "បានមើល",
    "Verified": "បានផ្ទៀងផ្ទាត់",
    "Premium": "ព្រីមៀម",
    "more employer viewed you": "និយោជកទៀតបានមើលអ្នក",
    "more employers viewed you": "និយោជកទៀតបានមើលអ្នក",
    "Upgrade to Premium to see everyone who viewed your profile.": "ដំឡើងទៅ Premium ដើម្បីមើលអ្នកទាំងអស់ដែលបានមើលប្រវត្តិរូបរបស់អ្នក។",
    "Upgrade to Premium": "ដំឡើងទៅ Premium",
    "Krama Premium": "Krama Premium",
    "Stand out and see who's interested in you.": "លេចធ្លោ និងដឹងថានរណាចាប់អារម្មណ៍លើអ្នក។",
    "See every employer who viewed your profile": "មើលនិយោជកគ្រប់រូបដែលបានមើលប្រវត្តិរូបរបស់អ្នក",
    "Know which companies are interested — and follow up": "ដឹងថាក្រុមហ៊ុនណាចាប់អារម្មណ៍ ហើយតាមដានបន្ត",
    "Priority visibility in employer searches": "អាទិភាពក្នុងការស្វែងរករបស់និយោជក",
    "Premium is rolling out. Message us via Help & support to get early access for your account.": "Premium កំពុងដាក់ឱ្យប្រើ។ ផ្ញើសារមកយើងតាម ជំនួយ & គាំទ្រ ដើម្បីទទួលបានសិទ្ធិមុនគេ។",
    "Maybe later": "ពេលក្រោយ",
    "Contact us": "ទាក់ទងយើង",
    "month": "ខែ",
    "months": "ខែ",
    "Pay with KHQR": "បង់ប្រាក់ដោយ KHQR",
    "Scan with any Cambodian banking app to pay": "ស្កេនដោយកម្មវិធីធនាគារកម្ពុជាណាមួយ ដើម្បីបង់",
    "Waiting for payment…": "កំពុងរង់ចាំការទូទាត់…",
    "Cancel": "បោះបង់",
    "You're Premium!": "អ្នកបានក្លាយជា Premium!",
    "You can now see everyone who viewed your profile.": "ឥឡូវអ្នកអាចមើលអ្នកទាំងអស់ដែលបានមើលប្រវត្តិរូបរបស់អ្នក។",
    "View all": "មើលទាំងអស់",
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
    "Download PDF": "ទាញយក PDF",
    "Preparing…": "កំពុងរៀបចំ…",
    "Couldn't generate the PDF. Please try again.": "មិនអាចបង្កើត PDF បានទេ។ សូមព្យាយាមម្តងទៀត។",
    "Download as PDF": "ទាញយកជា PDF",
    "Modern": "ទំនើប",
    "Classic": "បុរាណ",
    "Creative": "ច្នៃប្រឌិត",
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
  // Simplified Chinese for this dashboard. Keys that also exist in the shared public-site
  // dictionary reuse its exact value on purpose — this merges into the SAME KRAMA_I18N.zh
  // object, so a different value here would silently re-translate the public site too.
  var CAND_ZH = {
    // Nav + shell
    "Dashboard": "控制台",
    "My applications": "我的申请",
    "Saved jobs": "收藏的职位",
    "Recommended": "推荐职位",
    "Following": "已关注",
    "Job alerts": "职位提醒",
    "Messages": "消息",
    "Invitations": "邀请",
    "Employers who invited you to apply.": "邀请你投递的雇主。",
    "No invitations yet": "暂无邀请",
    "When an employer invites you to apply for a role, it will appear here.": "当雇主邀请你申请职位时，会显示在这里。",
    "New": "新",
    "Decline": "谢绝",
    "Already applied": "已申请",
    "Job closed": "职位已关闭",
    "Résumé builder": "简历生成器",
    "Profile": "个人档案",
    "Help & support": "帮助与支持",
    "Profile strength": "档案完整度",
    "Profile complete": "档案已完善",
    "Sign out": "退出登录",
    "Welcome back": "欢迎回来",
    "Recommended for you": "为你推荐",
    "Companies I follow": "我关注的公司",
    "Who viewed you": "谁看过你",
    "Who viewed your profile": "谁查看了你的资料",
    "Employers who opened your profile from candidate search. A complete profile gets viewed more.": "从人才搜索中打开你资料的雇主。资料越完整，被查看得越多。",
    "No profile views yet": "还没有人查看你的资料",
    "When an employer views your profile, you'll see them here. Complete your profile and add your CV to get discovered.": "当有雇主查看你的资料时，会显示在这里。完善资料并上传简历，更容易被发现。",
    "viewed": "查看了",
    "Verified": "已认证",
    "Premium": "高级会员",
    "more employer viewed you": "位雇主查看了你",
    "more employers viewed you": "位雇主查看了你",
    "Upgrade to Premium to see everyone who viewed your profile.": "升级到高级会员，查看所有查看过你资料的人。",
    "Upgrade to Premium": "升级到高级会员",
    "Krama Premium": "Krama 高级会员",
    "Stand out and see who's interested in you.": "脱颖而出，了解谁对你感兴趣。",
    "See every employer who viewed your profile": "查看所有查看过你资料的雇主",
    "Know which companies are interested — and follow up": "了解哪些公司感兴趣 —— 并及时跟进",
    "Priority visibility in employer searches": "在雇主搜索中优先展示",
    "Premium is rolling out. Message us via Help & support to get early access for your account.": "高级会员正在推出。通过「帮助与支持」联系我们，为你的账户抢先开通。",
    "Maybe later": "以后再说",
    "Contact us": "联系我们",
    "month": "个月",
    "months": "个月",
    "Pay with KHQR": "使用 KHQR 支付",
    "Scan with any Cambodian banking app to pay": "用任意柬埔寨银行 App 扫码支付",
    "Waiting for payment…": "等待支付…",
    "Cancel": "取消",
    "You're Premium!": "你已是高级会员！",
    "You can now see everyone who viewed your profile.": "现在你可以查看所有查看过你资料的人。",
    "View all": "查看全部",
    // Dashboard / overview
    "Applied jobs": "已申请职位",
    "Interviews": "面试",
    "Application pipeline": "申请进度",
    "Applied": "已申请",
    "Reviewed": "已查看",
    "Shortlisted": "已入围",
    "Interview": "面试",
    "Offered": "已发录用",
    "Recent applications": "最近的申请",
    "View all": "查看全部",
    "No applications yet. Start applying!": "还没有申请记录，快去投递吧！",
    // Completion meter
    "Complete your profile": "完善档案",
    "Guided setup": "引导设置",
    "A complete profile gets far more employer views.": "完整的档案能获得更多雇主浏览。",
    "step left": "项待完成",
    "steps left": "项待完成",
    "Full name": "姓名",
    "Email address": "电子邮箱",
    "Phone number": "手机号码",
    "Profile photo": "头像",
    "About you": "个人简介",
    "Professional headline": "职业头衔",
    "Career summary": "职业概述",
    "Work experience": "工作经历",
    "Education": "教育背景",
    "Skills": "技能",
    "Upload your CV": "上传简历",
    // Onboarding wizard
    "Set up your profile": "设置你的档案",
    "Jobs you want": "期望职位",
    "Upload CV": "上传简历",
    "Step": "第",
    "of": "步，共",
    "Tell us what you're looking for — we'll email you matching jobs.": "告诉我们你想找什么工作——有匹配职位时我们会邮件通知你。",
    "Job title you want": "期望职位名称",
    "Field / category": "领域 / 类别",
    "Any field": "不限领域",
    "Location": "地点",
    "Any location": "不限地区",
    "Employment type": "工作性质",
    "Any type": "不限类型",
    "Full time": "全职",
    "Part time": "兼职",
    "Contract": "合同工",
    "Internship": "实习",
    "Upload your CV so you can apply to jobs in one click.": "上传简历，即可一键投递职位。",
    "Upload your CV file": "上传简历文件",
    "Browse files": "浏览文件",
    "Choose a different file": "选择其他文件",
    "Add your most recent role — employers see this on your profile.": "填写你最近的一份工作——雇主会在你的档案中看到。",
    "Position": "职位",
    "Company name": "公司名称",
    "Years": "年限",
    "You can add more roles later in the Résumé builder.": "之后可在简历生成器中添加更多经历。",
    "Back": "上一步",
    "Skip this step": "跳过此步",
    "Continue": "继续",
    "Finish setup": "完成设置",
    "CV already on file": "已有简历",
    // Common
    "Loading…": "加载中…",
    "Saving…": "保存中…",
    "Uploading…": "上传中…",
    "Previous": "上一页",
    "Next": "下一页",
    "Add": "添加",
    "Cancel": "取消",
    "Search": "搜索",
    "Clear": "清除",
    "No results": "无结果",
    "Rejected": "未通过",
    "View": "查看",
    "All": "全部",
    // Applications
    "total applications": "份申请",
    "No applications found.": "未找到申请记录。",
    "Message": "留言",
    "Withdraw": "撤回申请",
    "Send message": "发送消息",
    "Sending…": "发送中…",
    "Employer": "雇主",
    // Saved jobs
    "jobs saved": "个已收藏职位",
    "No saved jobs yet. Browse jobs and click the bookmark icon.": "还没有收藏的职位。浏览职位并点击书签图标即可收藏。",
    // Recommended
    "jobs matched": "个匹配职位",
    "Matches your field": "匹配你的领域",
    "Matches your level": "匹配你的级别",
    "Apply to or save some jobs first — we'll personalise these recommendations based on your activity.": "先投递或收藏一些职位——我们会根据你的行为个性化推荐。",
    // Profile
    "How you appear to employers.": "雇主看到的你。",
    "Change photo": "更换头像",
    "Email": "电子邮箱",
    "Phone": "电话",
    "Bio / Description": "个人简介",
    "CV / Resume visibility": "简历可见性",
    "Controls who can download your uploaded CV file.": "控制谁可以下载你上传的简历文件。",
    "Public — anyone can view": "公开——任何人可查看",
    "Employers only — recruiters who review your application": "仅雇主——查看你申请的招聘人员",
    "Private — only you can access": "私密——仅你本人可访问",
    "Save changes": "保存更改",
    "Change password": "修改密码",
    "Choose a strong password of at least 8 characters.": "请设置至少 8 个字符的高强度密码。",
    "Current password": "当前密码",
    "New password": "新密码",
    "Confirm new password": "确认新密码",
    "Update password": "更新密码",
    "Updating…": "更新中…",
    // Résumé builder
    "Build your CV to attach when applying for jobs.": "创建简历，投递职位时可一并提交。",
    "Download CV": "下载简历",
    "Save resume": "保存简历",
    "Resume saved successfully!": "简历保存成功！",
    "Upload CV file": "上传简历文件",
    "CV uploaded": "简历已上传",
    "Replace CV": "替换简历",
    "No CV uploaded yet. Upload a PDF or DOC (max 5 MB).": "尚未上传简历。请上传 PDF 或 DOC 文件（最大 5 MB）。",
    "Personal summary": "个人概述",
    "Headline / Job title": "头衔 / 职位名称",
    "Summary": "概述",
    "No education entries yet.": "尚未添加教育背景。",
    "School / University": "学校 / 大学",
    "Degree": "学位",
    "No experience entries yet.": "尚未添加工作经历。",
    "Job title": "职位名称",
    "Company": "公司",
    "Description": "描述",
    "No skills added yet.": "尚未添加技能。",
    "Certifications": "证书",
    "No certifications yet.": "尚未添加证书。",
    "Certification name": "证书名称",
    "Year": "年份",
    // Following
    "You'll get an email when a followed company posts a new job.": "你关注的公司发布新职位时，我们会邮件通知你。",
    "Not following anyone yet": "尚未关注任何公司",
    "Visit a company profile and click Follow to stay notified of new jobs.": "访问公司主页并点击关注，即可及时获知新职位。",
    "Unfollow": "取消关注",
    // Job alerts
    "Your job alerts": "你的职位提醒",
    "Get an email the moment a matching role is posted. Up to 10 alerts.": "一有匹配职位发布，立即邮件通知你。最多可创建 10 个提醒。",
    "+ New alert": "+ 新建提醒",
    "Create a new alert": "创建新提醒",
    "Keyword": "关键词",
    "Category": "类别",
    "Any category": "不限类别",
    "Job type": "工作类型",
    "Work mode": "工作方式",
    "Any": "不限",
    "Remote only": "仅远程",
    "On-site / hybrid": "现场 / 混合办公",
    "Full-time": "全职",
    "Part-time": "兼职",
    "Save alert": "保存提醒",
    "No job alerts yet": "尚无职位提醒",
    "Create an alert and we'll email you when a matching role is posted.": "创建提醒，有匹配职位发布时我们会邮件通知你。",
    "All new jobs": "所有新职位",
    "Remote": "远程",
    // Messages
    "Conversations": "会话",
    "No conversations yet.": "暂无会话。",
    "Employers can message you directly after viewing your application.": "雇主查看你的申请后可直接给你发消息。",
    "Send": "发送",
    "Select a conversation to read messages": "选择一个会话以查看消息",
    // Login
    "Candidate sign in": "求职者登录",
    "Access your applications and saved jobs.": "查看你的申请记录和收藏的职位。",
    "Password": "密码",
    "Sign in": "登录",
    "Signing in…": "登录中…",
    // Digital CV
    "My Digital CV": "我的电子简历",
    "Share your CV with a link or QR code.": "通过链接或二维码分享你的简历。",
    "Scan the code or share the link — anyone can view your CV, no login needed.": "扫描二维码或分享链接——任何人无需登录即可查看你的简历。",
    "Copy link": "复制链接",
    "Copied!": "已复制！",
    "Open public CV": "打开公开简历",
    "Download PDF": "下载 PDF",
    "Preparing…": "正在准备…",
    "Couldn't generate the PDF. Please try again.": "无法生成 PDF，请重试。",
    "Download as PDF": "下载为 PDF",
    "Modern": "现代",
    "Classic": "经典",
    "Creative": "创意",
    "Your CV is private, so this link won't open. Set visibility to Employers or Public in your Profile to share it.": "你的简历为私密状态，此链接无法打开。请在个人档案中将可见性设为「仅雇主」或「公开」后再分享。"
  };
  try {
    if (window.KRAMA_I18N && window.KRAMA_I18N.zh) {
      Object.assign(window.KRAMA_I18N.zh, CAND_ZH);
    } else if (window.KRAMA_I18N) {
      window.KRAMA_I18N.zh = CAND_ZH;
    }
  } catch (e) {}

  // Languages this dashboard actually ships a dictionary for. The shared i18n layer carries
  // more (the public site also has zh), and a chunk of this kit's strings — "Dashboard",
  // "Saved jobs", "Job alerts" — happen to exist in that shared public-site dictionary. So
  // without this guard, picking a language we haven't translated here renders a HALF-
  // translated dashboard: shared keys switch, candidate-specific keys stay English. Falling
  // back wholesale to English is the honest result until a dictionary for that language
  // exists. To add one: merge it below like CAND_KM and list its code here.
  var KIT_LANGS = {
    en: 1,
    km: 1,
    zh: 1
  };
  var T = function (s) {
    if (typeof window.KRAMA_T !== "function") return s;
    return KIT_LANGS[window.KRAMA_LANG] ? window.KRAMA_T(s) : s;
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
      id: "invitations",
      label: "Invitations",
      icon: "mail-plus"
    }, {
      id: "following",
      label: "Following",
      icon: "heart"
    }, {
      id: "profileviews",
      label: "Who viewed you",
      icon: "eye",
      badge: badges.profileViews
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
    }, {
      v: "zh",
      l: "中文"
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
    // Keep in sync with the `type` strings passed to Notification::record() on the API side —
    // an unmapped type makes the notification a click-dead-end (it marks read and goes nowhere).
    var ROUTE = {
      application_received: "applications",
      application_stage: "applications",
      job_approved: "applications",
      job_rejected: "applications",
      invitation: "invitations",
      interview_scheduled: "applications"
    };
    var ICON = {
      application_received: "user-plus",
      application_stage: "activity",
      job_approved: "circle-check-big",
      job_rejected: "circle-x",
      forum_reply: "message-circle",
      forum_mention: "at-sign",
      invitation: "mail-plus",
      interview_scheduled: "calendar-clock"
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
  function Invitations() {
    const [list, setList] = React.useState(null);
    const [busy, setBusy] = React.useState(null);
    React.useEffect(function () {
      cand.fetchInvitations().then(setList).catch(function () {
        setList([]);
      });
    }, []);
    const decline = function (id) {
      setBusy(id);
      cand.declineInvitation(id).then(function () {
        setList(function (l) {
          return (l || []).filter(function (x) {
            return x.id !== id;
          });
        });
        setBusy(null);
      }).catch(function () {
        setBusy(null);
      });
    };
    const jobLink = function (job) {
      return HOME_URL + "?job=" + job.id;
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 4
      }
    }, T("Invitations")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 20
      }
    }, T("Employers who invited you to apply.")), list === null ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, T("Loading…")) : list.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("mail-plus", 28),
      title: T("No invitations yet"),
      description: T("When an employer invites you to apply for a role, it will appear here.")
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 640
      }
    }, list.map(function (iv) {
      return /*#__PURE__*/React.createElement(Card, {
        key: iv.id,
        padding: 18
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 14
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        src: iv.company && iv.company.logo_url,
        name: iv.company && iv.company.name || "?",
        square: true,
        size: 44
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, iv.job.title), iv.status === "applied" ? /*#__PURE__*/React.createElement(Badge, {
        tone: "success"
      }, T("Applied")) : iv.status === "sent" ? /*#__PURE__*/React.createElement(Badge, {
        tone: "brand"
      }, T("New")) : null), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          marginTop: 2
        }
      }, iv.company && iv.company.name), iv.message && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          marginTop: 10,
          background: "var(--surface-sunken)",
          borderRadius: "var(--radius-md)",
          padding: "10px 12px",
          whiteSpace: "pre-wrap"
        }
      }, iv.message), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 10,
          marginTop: 12
        }
      }, iv.status === "applied" ? /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        disabled: true
      }, T("Already applied")) : iv.job.status === "published" ? /*#__PURE__*/React.createElement("a", {
        href: jobLink(iv.job),
        target: "_blank",
        rel: "noopener"
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        size: "sm",
        iconRight: I("arrow-up-right", 14)
      }, T("View & apply"))) : /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        disabled: true
      }, T("Job closed")), (iv.status === "sent" || iv.status === "viewed") && /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        disabled: busy === iv.id,
        onClick: function () {
          decline(iv.id);
        }
      }, T("Decline"))))));
    })));
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
    var [delOpen, setDelOpen] = React.useState(false);
    var [delPwd, setDelPwd] = React.useState("");
    var [delBusy, setDelBusy] = React.useState(false);
    var [delErr, setDelErr] = React.useState("");
    function deleteAccount() {
      setDelBusy(true);
      setDelErr("");
      cand.deleteAccount(delPwd).then(function () {
        // Deleted — clear the session everywhere and return to the public site.
        try {
          localStorage.removeItem("krama_access_token");
          localStorage.removeItem("krama_refresh_token");
        } catch (e) {}
        window.location.href = "../public-website/index.html";
      }).catch(function (e) {
        setDelBusy(false);
        setDelErr(e && e.message || "Could not delete your account.");
      });
    }
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
      placeholder: T("Tell employers a bit about yourself…")
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
    }, pwdBusy ? T("Updating…") : T("Update password"))))), /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginTop: 20,
        borderColor: "var(--danger)"
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-base)",
        fontWeight: 700,
        color: "var(--danger)",
        marginBottom: 4
      }
    }, T("Delete account")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 16
      }
    }, T("Permanently delete your account and personal data — résumé, saved jobs, alerts and profile. This cannot be undone.")), !delOpen ? /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      style: {
        color: "var(--danger)",
        borderColor: "var(--danger)"
      },
      onClick: function () {
        setDelOpen(true);
        setDelErr("");
      }
    }, T("Delete my account")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Confirm your password to delete"),
      type: "password",
      value: delPwd,
      onChange: function (e) {
        setDelPwd(e.target.value);
      },
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    }), delErr && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--danger)",
        fontWeight: 600
      }
    }, delErr), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        background: "var(--danger)",
        borderColor: "var(--danger)"
      },
      disabled: delBusy || !delPwd,
      onClick: deleteAccount
    }, delBusy ? T("Deleting…") : T("Permanently delete")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      disabled: delBusy,
      onClick: function () {
        setDelOpen(false);
        setDelPwd("");
        setDelErr("");
      }
    }, T("Cancel"))))));
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
        placeholder: T("Company name")
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

  // ── Who viewed your profile ──────────────────────────────────────────────────
  function ProfileViews({
    onNav
  }) {
    var [viewers, setViewers] = React.useState([]);
    var [locked, setLocked] = React.useState(0);
    var [isPremium, setIsPremium] = React.useState(false);
    var [loading, setLoading] = React.useState(true);
    var [error, setError] = React.useState("");
    var [showUpgrade, setShowUpgrade] = React.useState(false);
    var [prem, setPrem] = React.useState(null); // {price,currency,months,khqr_enabled}
    var [step, setStep] = React.useState("benefits"); // benefits | qr | success
    var [pay, setPay] = React.useState(null); // {id, qr, amount, currency}
    var [payBusy, setPayBusy] = React.useState(false);
    var [payErr, setPayErr] = React.useState("");
    var pollRef = React.useRef(null);
    var reload = function () {
      cand.fetchProfileViews().then(function (r) {
        setViewers(r.viewers || []);
        setLocked(r.locked_count || 0);
        setIsPremium(!!r.is_premium);
        setLoading(false);
      }).catch(function (e) {
        setError(e.message);
        setLoading(false);
      });
    };
    React.useEffect(function () {
      reload();
      cand.premiumStatus().then(setPrem).catch(function () {});
      return function () {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }, []);
    var money = function (cur, amt) {
      return String(cur).toUpperCase() === "KHR" ? "៛" + Math.round(amt).toLocaleString() : "$" + Number(amt).toFixed(2);
    };
    var startBuy = function () {
      setPayBusy(true);
      setPayErr("");
      cand.premiumCheckout().then(function (c) {
        return cand.premiumKhqr(c.payment_id).then(function (k) {
          setPay({
            id: c.payment_id,
            qr: k.qr,
            amount: k.amount,
            currency: k.currency
          });
          setStep("qr");
          setPayBusy(false);
          pollRef.current = setInterval(function () {
            cand.premiumVerify(c.payment_id).then(function (v) {
              if (v.status === "paid") {
                clearInterval(pollRef.current);
                pollRef.current = null;
                setStep("success");
                setIsPremium(true);
                reload();
              }
            }).catch(function () {});
          }, 3500);
        });
      }).catch(function (e) {
        setPayBusy(false);
        setPayErr(e && e.message || "Couldn't start the payment.");
      });
    };
    var closeUpgrade = function () {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setShowUpgrade(false);
      setStep("benefits");
      setPay(null);
      setPayErr("");
    };

    // "3 days ago" style relative time.
    function ago(iso) {
      if (!iso) return "";
      var d = new Date(iso);
      if (isNaN(d)) return "";
      var s = Math.floor((Date.now() - d.getTime()) / 1000);
      if (s < 3600) return T("just now");
      if (s < 86400) {
        var h = Math.floor(s / 3600);
        return h + (h === 1 ? T(" hour ago") : T(" hours ago"));
      }
      var dd = Math.floor(s / 86400);
      if (dd < 30) return dd + (dd === 1 ? T(" day ago") : T(" days ago"));
      return d.toLocaleDateString();
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
        marginBottom: 22,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, T("Who viewed your profile")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, T("Employers who opened your profile from candidate search. A complete profile gets viewed more."))), isPremium && /*#__PURE__*/React.createElement("span", {
      style: {
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "linear-gradient(180deg,#F7CE63,#D99A1F)",
        color: "#4a3300",
        fontWeight: 700,
        fontSize: "var(--text-xs)",
        padding: "5px 11px",
        borderRadius: 999
      }
    }, I("crown", 13), " ", T("Premium"))), viewers.length === 0 && locked === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("eye", 28),
      title: T("No profile views yet"),
      description: T("When an employer views your profile, you'll see them here. Complete your profile and add your CV to get discovered.")
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, viewers.map(function (v) {
      return /*#__PURE__*/React.createElement(Card, {
        key: v.company_id,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 16,
          cursor: v.company_id ? "pointer" : "default"
        },
        onClick: function () {
          if (v.company_id) window.open(window.location.origin + "/companies/" + v.company_id, "_blank", "noopener");
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        src: v.logo_url,
        name: v.company,
        square: true,
        size: 48
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)",
          fontSize: "var(--text-sm)"
        }
      }, v.company), v.is_verified && /*#__PURE__*/React.createElement("span", {
        title: T("Verified"),
        style: {
          display: "inline-flex",
          color: "var(--text-brand)"
        }
      }, I("badge-check", 15))), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginTop: 2
        }
      }, v.industry ? v.industry + " · " : "", ago(v.last_viewed_at), v.view_count > 1 && /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: 8,
          color: "var(--text-brand)",
          fontWeight: 600
        }
      }, T("viewed"), " ", v.view_count, "\xD7"))), /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-faint)",
          display: "inline-flex",
          flexShrink: 0
        }
      }, I("chevron-right", 18)));
    }), locked > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        filter: "blur(3px)",
        opacity: 0.55,
        pointerEvents: "none",
        userSelect: "none"
      },
      "aria-hidden": "true"
    }, Array.from({
      length: Math.min(locked, 3)
    }).map(function (_, i) {
      return /*#__PURE__*/React.createElement(Card, {
        key: i,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 48,
          height: 48,
          borderRadius: 10,
          background: "var(--surface-sunken, #e9ecef)",
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: 12,
          width: "42%",
          background: "var(--surface-sunken, #e9ecef)",
          borderRadius: 6
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          height: 10,
          width: "60%",
          background: "var(--surface-sunken, #eef1f3)",
          borderRadius: 6,
          marginTop: 8
        }
      })));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg, 0 10px 30px -12px rgba(16,24,40,.25))",
        padding: "20px 24px",
        maxWidth: 420
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 20,
        background: "linear-gradient(180deg,#F7CE63,#D99A1F)",
        color: "#4a3300",
        marginBottom: 8
      }
    }, I("lock", 18)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)"
      }
    }, locked, " ", locked === 1 ? T("more employer viewed you") : T("more employers viewed you")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        margin: "6px 0 14px",
        lineHeight: 1.5
      }
    }, T("Upgrade to Premium to see everyone who viewed your profile.")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("crown", 15),
      onClick: function () {
        setShowUpgrade(true);
      }
    }, T("Upgrade to Premium"))))))), showUpgrade && /*#__PURE__*/React.createElement("div", {
      onClick: closeUpgrade,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "var(--surface-overlay, rgba(17,24,39,.55))",
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
        maxWidth: 440,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "linear-gradient(135deg,#0C7E6B,#0B6557)",
        color: "#fff",
        padding: "24px 24px 20px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: 24,
        background: "linear-gradient(180deg,#F7CE63,#D99A1F)",
        color: "#4a3300",
        marginBottom: 10
      }
    }, I("crown", 22)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: "var(--text-lg)"
      }
    }, T("Krama Premium")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "rgba(255,255,255,.9)",
        marginTop: 4
      }
    }, T("Stand out and see who's interested in you."))), step === "benefits" && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "20px 24px"
      }
    }, [T("See every employer who viewed your profile"), T("Know which companies are interested — and follow up"), T("Priority visibility in employer searches")].map(function (b, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 12
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-brand)",
          flexShrink: 0,
          marginTop: 1
        }
      }, I("check-circle-2", 17)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)"
        }
      }, b));
    }), payErr && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--danger)",
        marginTop: 6
      }
    }, payErr), prem && prem.khqr_enabled ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        margin: "14px 0 4px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-2xl, 24px)",
        fontWeight: 800,
        color: "var(--text-strong)"
      }
    }, money(prem.currency, prem.price)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, " / ", prem.months, " ", prem.months === 1 ? T("month") : T("months"))), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        width: "100%",
        marginTop: 10
      },
      disabled: payBusy,
      iconLeft: I("qr-code", 15),
      onClick: startBuy
    }, payBusy ? T("Preparing…") : T("Pay with KHQR")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      style: {
        width: "100%",
        marginTop: 8
      },
      onClick: closeUpgrade
    }, T("Maybe later"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        background: "var(--surface-sunken, var(--surface-page))",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px",
        marginTop: 6,
        lineHeight: 1.6
      }
    }, T("Premium is rolling out. Message us via Help & support to get early access for your account.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      style: {
        flex: 1
      },
      onClick: closeUpgrade
    }, T("Maybe later")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        flex: 1
      },
      iconLeft: I("life-buoy", 15),
      onClick: function () {
        closeUpgrade();
        if (onNav) onNav("support");
      }
    }, T("Contact us"))))), step === "qr" && pay && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "22px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 14
      }
    }, T("Scan with any Cambodian banking app to pay"), " ", money(pay.currency, pay.amount), "."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-block",
        padding: 14,
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)"
      }
    }, /*#__PURE__*/React.createElement(QrCanvas, {
      value: pay.qr,
      size: 200
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 16,
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, /*#__PURE__*/React.createElement("style", null, "@keyframes krmCvPremSpin{to{transform:rotate(360deg)}}"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        animation: "krmCvPremSpin 1s linear infinite"
      }
    }, I("loader-2", 16)), " ", T("Waiting for payment…")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      style: {
        marginTop: 12
      },
      onClick: closeUpgrade
    }, T("Cancel"))), step === "success" && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "28px 24px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 52,
        height: 52,
        borderRadius: 26,
        background: "var(--success-subtle, #dcfce7)",
        color: "var(--success, #16a34a)",
        marginBottom: 12
      }
    }, I("check-circle-2", 28)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 800,
        fontSize: "var(--text-md)",
        color: "var(--text-strong)"
      }
    }, T("You're Premium!")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        margin: "6px 0 16px"
      }
    }, T("You can now see everyone who viewed your profile.")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: closeUpgrade
    }, T("View all"))))));
  }

  // ── JobAlerts ──────────────────────────────────────────────────────────────
  function JobAlerts() {
    var {
      Card,
      Button,
      Input,
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

    // ── Web push (this device) ──────────────────────────────────────────────
    var [pushState, setPushState] = React.useState("checking"); // checking|unsupported|default|denied|subscribing|subscribed
    React.useEffect(function () {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setPushState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setPushState("denied");
        return;
      }
      navigator.serviceWorker.getRegistration().then(function (reg) {
        if (!reg) {
          setPushState("default");
          return;
        }
        reg.pushManager.getSubscription().then(function (sub) {
          setPushState(sub ? "subscribed" : "default");
        }).catch(function () {
          setPushState("default");
        });
      }).catch(function () {
        setPushState("default");
      });
    }, []);
    function pushApiBase() {
      return /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(location.hostname) ? "http://127.0.0.1:8000/api" : location.protocol + "//" + location.host + "/api";
    }
    function urlB64ToUint8(base64) {
      var pad = "=".repeat((4 - base64.length % 4) % 4);
      var b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
      var raw = atob(b64),
        arr = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
      return arr;
    }
    function enablePush() {
      setPushState("subscribing");
      Notification.requestPermission().then(function (perm) {
        if (perm !== "granted") {
          setPushState(perm === "denied" ? "denied" : "default");
          return;
        }
        navigator.serviceWorker.register("/sw.js").catch(function () {}).then(function () {
          return navigator.serviceWorker.ready;
        }).then(function (reg) {
          return fetch(pushApiBase() + "/push/vapid-public-key").then(function (r) {
            return r.json();
          }).then(function (j) {
            if (!j || !j.publicKey) throw new Error("push not configured");
            return reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlB64ToUint8(j.publicKey)
            });
          });
        }).then(function (sub) {
          return cand.savePushSubscription(sub.toJSON());
        }).then(function () {
          setPushState("subscribed");
        }).catch(function () {
          setPushState("default");
          alert(T("Could not enable push notifications on this device."));
        });
      });
    }
    function disablePush() {
      navigator.serviceWorker.ready.then(function (reg) {
        return reg.pushManager.getSubscription();
      }).then(function (sub) {
        if (!sub) {
          setPushState("default");
          return;
        }
        var ep = sub.endpoint;
        return sub.unsubscribe().then(function () {
          return cand.deletePushSubscription(ep);
        }).then(function () {
          setPushState("default");
        });
      }).catch(function () {
        setPushState("default");
      });
    }

    // ── AI profile match (opt-in) ───────────────────────────────────────────
    // A single "ai"-type alert: when on, new jobs are AI-scored against the
    // candidate's résumé and strong matches are notified — even with no filters set.
    var [aiSaving, setAiSaving] = React.useState(false);
    function toggleAiMatch() {
      var existing = alerts.find(function (a) {
        return a.type === "ai";
      });
      setAiSaving(true);
      if (existing) {
        cand.deleteAlert(existing.id).then(function () {
          setAlerts(function (p) {
            return p.filter(function (a) {
              return a.id !== existing.id;
            });
          });
          setAiSaving(false);
        }).catch(function (e) {
          alert(e.message || "Failed to update.");
          setAiSaving(false);
        });
      } else {
        cand.createAlert({
          type: "ai"
        }).then(function (r) {
          setAlerts(function (p) {
            return [r.data].concat(p);
          });
          setAiSaving(false);
        }).catch(function (e) {
          alert(e.message || "Failed to update.");
          setAiSaving(false);
        });
      }
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

    // The "ai"-type row is the profile-match opt-in, shown as its own toggle — keep it
    // out of the saved-search list and the 10-alert cap.
    var aiAlert = alerts.find(function (a) {
      return a.type === "ai";
    });
    var filterAlerts = alerts.filter(function (a) {
      return a.type !== "ai";
    });
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
    }, T("Get an email the moment a matching role is posted. Up to 10 alerts."))), filterAlerts.length < 10 && filterAlerts.length > 0 && /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      onClick: function () {
        setShowForm(!showForm);
        setFormErr("");
      }
    }, showForm ? T("Cancel") : T("+ New alert"))), /*#__PURE__*/React.createElement(Card, {
      style: {
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
        borderColor: aiAlert ? "var(--brand)" : undefined
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)",
        flexShrink: 0
      }
    }, I("sparkles", 20)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-base)",
        color: "var(--text-strong)"
      }
    }, T("Match me by my profile (AI)")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, aiAlert ? T("On — we'll alert you when a new job strongly fits your résumé, even without a saved filter.") : T("Let AI read your résumé and alert you when a new job is a strong match. Keep your résumé up to date.")))), aiAlert ? /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: aiSaving,
      onClick: toggleAiMatch
    }, aiSaving ? T("Saving…") : T("Turn off")) : /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      disabled: aiSaving,
      onClick: toggleAiMatch
    }, aiSaving ? T("Saving…") : T("Turn on"))), pushState !== "unsupported" && pushState !== "checking" && /*#__PURE__*/React.createElement(Card, {
      style: {
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)",
        flexShrink: 0
      }
    }, I("bell-ring", 20)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-base)",
        color: "var(--text-strong)"
      }
    }, T("Push notifications")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, pushState === "subscribed" ? T("On for this device — you'll get matching jobs as a notification.") : pushState === "denied" ? T("Blocked. Enable notifications for Krama in your browser settings.") : T("Get matching jobs as a notification on this device, even when Krama is closed.")))), pushState === "subscribed" ? /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: disablePush
    }, T("Turn off")) : pushState === "denied" ? null : /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      disabled: pushState === "subscribing",
      onClick: enablePush
    }, pushState === "subscribing" ? T("Enabling…") : T("Enable"))), showForm && /*#__PURE__*/React.createElement(Card, {
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
      placeholder: T("e.g. Software Engineer"),
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
    }, saving ? T("Saving…") : T("Save alert")))), filterAlerts.length === 0 && !showForm && /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("bell", 28),
      title: T("No job alerts yet"),
      description: T("Create an alert and we'll email you when a matching role is posted.")
    }), filterAlerts.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, filterAlerts.map(function (a) {
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
    var [pdfBusy, setPdfBusy] = React.useState("");
    var [pdfStyle, setPdfStyle] = React.useState("modern");
    React.useEffect(function () {
      cand.fetchCvLink().then(function (d) {
        setLink(d);
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }, []);
    function downloadPdf(style) {
      if (pdfBusy) return;
      setPdfBusy(style || pdfStyle);
      cand.downloadResumePdf(style || pdfStyle).then(function (blob) {
        var u = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = u;
        a.download = (user && user.name ? user.name.replace(/\s+/g, "-").toLowerCase() : "cv") + "-cv.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
          URL.revokeObjectURL(u);
        }, 4000);
        setPdfBusy("");
      }).catch(function () {
        setPdfBusy("");
        alert(T("Couldn't generate the PDF. Please try again."));
      });
    }
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
    }, T("Open public CV"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        marginBottom: 8
      }
    }, T("Download as PDF")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, [{
      k: "modern",
      l: T("Modern")
    }, {
      k: "classic",
      l: T("Classic")
    }, {
      k: "creative",
      l: T("Creative")
    }].map(function (s) {
      return /*#__PURE__*/React.createElement(Button, {
        key: s.k,
        variant: "secondary",
        size: "sm",
        iconLeft: I("download", 14),
        disabled: !!pdfBusy,
        onClick: function () {
          downloadPdf(s.k);
        }
      }, pdfBusy === s.k ? T("Preparing…") : s.l);
    })))))));
  }
  function App() {
    var [page, setPage] = React.useState("dashboard");
    // Seed from the global choice, but only honour languages this kit ships a dictionary for —
    // otherwise the pills would highlight a language whose strings render as English.
    var [lang, setLang] = React.useState(KIT_LANGS[window.KRAMA_LANG] ? window.KRAMA_LANG : "en");
    function switchLang(l) {
      if (window.KRAMA_SET_LANG) window.KRAMA_SET_LANG(l);
      setLang(window.KRAMA_LANG);
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
      support: 0,
      profileViews: 0
    });
    var [sidebarOpen, setSidebarOpen] = React.useState(false);
    // Which tab the Applications page opens on (set by the dashboard "Interviews" stat).
    var [appsInitialTab, setAppsInitialTab] = React.useState("all");
    // Normal navigation resets the applications tab to "all"; the Interviews stat deep-links.
    function navTo(p) {
      setAppsInitialTab("all");
      if (p === "profileviews") setBadges(function (b) {
        return Object.assign({}, b, {
          profileViews: 0
        });
      });
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
      cand.fetchProfileViewCount().then(function (d) {
        setBadges(function (b) {
          return Object.assign({}, b, {
            profileViews: d.new_count || 0
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
      invitations: T("Invitations"),
      following: T("Companies I follow"),
      profileviews: T("Who viewed your profile"),
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
    }), page === "recommended" && /*#__PURE__*/React.createElement(Recommended, null), page === "invitations" && /*#__PURE__*/React.createElement(Invitations, null), page === "following" && /*#__PURE__*/React.createElement(Following, null), page === "profileviews" && /*#__PURE__*/React.createElement(ProfileViews, {
      onNav: navTo
    }), page === "alerts" && /*#__PURE__*/React.createElement(JobAlerts, null), page === "messages" && /*#__PURE__*/React.createElement(Messages, {
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