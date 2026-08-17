// Krama employer dashboard — shell + overview + jobs + applicant pipeline + billing, wired to the API.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const NS = window.KramaDesignSystem_1a6f65;
  const {
    Button,
    Badge,
    StatusBadge,
    Avatar,
    Card,
    StatCard,
    Tabs,
    EmptyState,
    Input,
    Textarea,
    Select,
    Switch
  } = NS;
  const emp = window.KRAMA_EMPLOYER_API;

  // ── i18n ──────────────────────────────────────────────────────────────────────────────
  // Dictionaries live in EMP_KM / EMP_ZH below (loaded from emp-i18n.js) and merge into the
  // shared KRAMA_I18N. KIT_LANGS is the guard: this kit is translated SCREEN BY SCREEN, and
  // a language is only listed here once its dictionary exists, otherwise KRAMA_T would
  // resolve the handful of strings that happen to live in the shared public-site dictionary
  // and leave the rest English — a half-translated dashboard. See project-i18n-languages.
  // Employer-dashboard strings. Keys already carried by the shared public-site dictionary
  // are deliberately ABSENT here and inherit from it — these merge into the SAME
  // KRAMA_I18N objects, so redefining one would re-translate the public site too. (That is
  // why the note button says "Save note" and the interview type "Phone call": bare "Save"
  // and "Phone" already mean "bookmark" and "phone number" in the shared dictionary.)
  var EMP_KM = {
    "Moved to": "បានផ្លាស់ទៅ",
    "Awaiting payment confirmation from admin. Your plan will activate automatically once confirmed.": "កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់ពីអ្នកគ្រប់គ្រង។ គម្រោងរបស់អ្នកនឹងចាប់ដំណើរការដោយស្វ័យប្រវត្តិនៅពេលបញ្ជាក់រួច។",
    "Doesn't meet requirements": "មិនត្រូវតាមលក្ខខណ្ឌ",
    "Free boosts included in your active plan": "ការលើកកម្ពស់ឥតគិតថ្លៃរួមបញ្ចូលក្នុងគម្រោងសកម្មរបស់អ្នក",
    "Job posting requires an active plan.": "ការប្រកាសការងារត្រូវការគម្រោងសកម្ម។",
    "Meets requirements": "ត្រូវតាមលក្ខខណ្ឌ",
    "Payment pending admin confirmation. Job posting will be unlocked once your subscription is activated.": "ការទូទាត់កំពុងរង់ចាំការបញ្ជាក់ពីអ្នកគ្រប់គ្រង។ ការប្រកាសការងារនឹងបើកនៅពេលការជាវរបស់អ្នកសកម្ម។",
    "Unlimited": "គ្មានដែនកំណត់",
    "Use a credit to feature a job free. After they run out, featuring costs the pay-per-boost price.": "ប្រើឥណទានដើម្បីធ្វើឱ្យការងារលេចធ្លោដោយឥតគិតថ្លៃ។ ពេលអស់ឥណទាន ការធ្វើឱ្យលេចធ្លោនឹងគិតតាមតម្លៃបង់ក្នុងមួយលើក។",
    "Verified": "បានផ្ទៀងផ្ទាត់",
    "Temporary": "បណ្តោះអាសន្ន",
    "e.g. 8:00 AM – 5:00 PM": "ឧ. ៨:០០ ព្រឹក – ៥:០០ ល្ងាច",
    "A logo, description and culture help candidates trust and choose you.": "ឡូហ្គូ ការពិពណ៌នា និងវប្បធម៌ ជួយឱ្យបេក្ខជនទុកចិត្ត និងជ្រើសរើសអ្នក។",
    "AI draft failed.": "ការព្រាងដោយ AI បរាជ័យ។",
    "Activates on": "ចាប់ដំណើរការនៅ",
    "Add note": "បន្ថែមកំណត់ចំណាំ",
    "Add scorecard": "បន្ថែមសន្លឹកវាយតម្លៃ",
    "All used": "បានប្រើអស់",
    "Already used": "បានប្រើរួចហើយ",
    "Banner preview": "មើលបដាជាមុន",
    "CV hidden": "CV ត្រូវបានលាក់",
    "Candidate": "បេក្ខជន",
    "Clone job": "ចម្លងការងារ",
    "Complete your company profile": "បំពេញប្រវត្តិក្រុមហ៊ុនរបស់អ្នក",
    "Connect a feed": "ភ្ជាប់មតិព័ត៌មាន",
    "Could not save job.": "មិនអាចរក្សាទុកការងារបានទេ។",
    "Could not send message.": "មិនអាចផ្ញើសារបានទេ។",
    "Download failed": "ការទាញយកបរាជ័យ",
    "Draft added below — review and edit before posting.": "សេចក្តីព្រាងត្រូវបានបន្ថែមខាងក្រោម — សូមពិនិត្យ និងកែមុនប្រកាស។",
    "Draft saved.": "បានរក្សាទុកសេចក្តីព្រាង។",
    "Draft with AI": "ព្រាងដោយ AI",
    "Drafting…": "កំពុងព្រាង…",
    "Edit job": "កែការងារ",
    "Edit profile": "កែប្រវត្តិរូប",
    "Enter a job title first, then draft with AI.": "បញ្ចូលឈ្មោះការងារជាមុនសិន បន្ទាប់មកព្រាងដោយ AI។",
    "Enterprise plan inquiry": "សំណួរអំពីគម្រោងសហគ្រាស",
    "Expired on": "ផុតកំណត់នៅ",
    "Freelance": "ការងារឯករាជ្យ",
    "Hide scorecard": "លាក់សន្លឹកវាយតម្លៃ",
    "Image upload failed.": "ការផ្ទុករូបភាពបរាជ័យ។",
    "Import in bulk": "នាំចូលជាដុំ",
    "Interview scheduled — candidate notified.": "បានកំណត់ការសម្ភាសន៍ — បានជូនដំណឹងបេក្ខជន។",
    "Job approved and published.": "ការងារត្រូវបានអនុម័ត និងផ្សាយ។",
    "Job closed.": "ការងារត្រូវបានបិទ។",
    "Job deleted.": "ការងារត្រូវបានលុប។",
    "Job published!": "ការងារត្រូវបានផ្សាយ!",
    "Job rejected.": "ការងារត្រូវបានបដិសេធ។",
    "Job submitted for company approval.": "ការងារត្រូវបានដាក់ស្នើសុំការអនុម័តពីក្រុមហ៊ុន។",
    "Job title is required.": "ត្រូវការឈ្មោះការងារ។",
    "Job updated.": "ការងារត្រូវបានធ្វើបច្ចុប្បន្នភាព។",
    "Limit reached": "ដល់ដែនកំណត់",
    "Location / map": "ទីតាំង / ផែនទី",
    "Max salary must be greater than or equal to min salary.": "ប្រាក់ខែអតិបរមាត្រូវធំជាង ឬស្មើប្រាក់ខែអប្បបរមា។",
    "Needs approval": "ត្រូវការការអនុម័ត",
    "Negotiable": "អាចចរចា",
    "No CV": "គ្មាន CV",
    "No active subscription.": "គ្មានការជាវសកម្ម។",
    "No expiry": "គ្មានថ្ងៃផុតកំណត់",
    "Pick a date & time first.": "សូមជ្រើសកាលបរិច្ឆេទ និងម៉ោងជាមុនសិន។",
    "Plan": "គម្រោង",
    "Publish": "ផ្សាយ",
    "Publish job": "ផ្សាយការងារ",
    "Renews": "បន្តជាថ្មី",
    "Replace image": "ជំនួសរូបភាព",
    "Save changes": "រក្សាទុកការផ្លាស់ប្តូរ",
    "Save draft": "រក្សាទុកសេចក្តីព្រាង",
    "Save scorecard": "រក្សាទុកសន្លឹកវាយតម្លៃ",
    "Saving…": "កំពុងរក្សាទុក…",
    "Schedule": "កំណត់ពេល",
    "Schedule interview": "កំណត់ការសម្ភាសន៍",
    "Scheduling…": "កំពុងកំណត់ពេល…",
    "Scorecard saved.": "បានរក្សាទុកសន្លឹកវាយតម្លៃ។",
    "Sending…": "កំពុងផ្ញើ…",
    "Submit": "ដាក់ស្នើ",
    "Submit for approval": "ដាក់ស្នើសុំការអនុម័ត",
    "Submitted for company review.": "បានដាក់ស្នើសុំការពិនិត្យពីក្រុមហ៊ុន។",
    "Upgrade": "ដំឡើងកម្រិត",
    "Upload image": "ផ្ទុករូបភាព",
    "Uploading…": "កំពុងផ្ទុក…",
    "Yes": "បាទ/ចាស",
    "You": "អ្នក",
    "Your subscription has expired. Jobs are hidden from the public website.": "ការជាវរបស់អ្នកបានផុតកំណត់។ ការងារត្រូវបានលាក់ពីគេហទំព័រសាធារណៈ។",
    "Approved": "បានអនុម័ត",
    "Suspended": "ត្រូវបានផ្អាក",
    "Applicant tracking": "ការតាមដានបេក្ខជន",
    "Job postings": "ការងារដែលបានប្រកាស",
    "Applicants": "បេក្ខជន",
    "CV Match": "ផ្គូផ្គង CV",
    "Find candidates": "ស្វែងរកបេក្ខជន",
    "Messages": "សារ",
    "Team": "ក្រុមការងារ",
    "Company profile": "ប្រវត្តិក្រុមហ៊ុន",
    "Plan & billing": "គម្រោង និងវិក្កយបត្រ",
    "Help & support": "ជំនួយ",
    "Unverified": "មិនទាន់ផ្ទៀងផ្ទាត់",
    "Post": "ប្រកាស",
    "My Profile": "ប្រវត្តិរូបរបស់ខ្ញុំ",
    "Sign out": "ចាកចេញ",
    "Welcome — let’s get your first job live": "សូមស្វាគមន៍ — តោះប្រកាសការងារដំបូងរបស់អ្នក",
    "Your dashboard is empty because you haven’t posted yet. Three quick ways to fill it:": "ផ្ទាំងគ្រប់គ្រងរបស់អ្នកនៅទទេ ព្រោះអ្នកមិនទាន់ប្រកាសការងារ។ មានវិធីរហ័សបីយ៉ាង៖",
    "Active jobs": "ការងារកំពុងដំណើរការ",
    "Pending approval": "រង់ចាំការអនុម័ត",
    "Total applications": "ពាក្យសុំសរុប",
    "Total job views": "ចំនួនមើលការងារសរុប",
    "Your job postings": "ការងារដែលអ្នកបានប្រកាស",
    "Manage jobs": "គ្រប់គ្រងការងារ",
    "Job title": "ឈ្មោះការងារ",
    "Status": "ស្ថានភាព",
    "Views": "ចំនួនមើល",
    "Loading…": "កំពុងផ្ទុក…",
    "No jobs yet. Click “Post a job” to create your first listing.": "មិនទាន់មានការងារ។ ចុច “ដាក់ការងារ” ដើម្បីបង្កើតការងារដំបូង។",
    "Upcoming interviews": "ការសម្ភាសន៍ខាងមុខ",
    "Open": "បើក",
    "Close": "បិទ",
    "e.g. Senior Accountant": "ឧ. គណនេយ្យករជាន់ខ្ពស់",
    "— Select —": "— ជ្រើសរើស —",
    "+ Add a new category…": "+ បន្ថែមប្រភេទថ្មី…",
    "New category name": "ឈ្មោះប្រភេទថ្មី",
    "e.g. Renewable Energy": "ឧ. ថាមពលកកើតឡើងវិញ",
    "Salary min": "ប្រាក់ខែអប្បបរមា",
    "Salary max": "ប្រាក់ខែអតិបរមា",
    "Currency": "រូបិយប័ណ្ណ",
    "Per": "ក្នុងមួយ",
    "Hour": "ម៉ោង",
    "Day": "ថ្ងៃ",
    "Month": "ខែ",
    "Year": "ឆ្នាំ",
    "Remote-friendly": "អាចធ្វើការពីចម្ងាយ",
    "Candidates can work remotely.": "បេក្ខជនអាចធ្វើការពីចម្ងាយបាន។",
    "Working days": "ថ្ងៃធ្វើការ",
    "e.g. Monday to Friday": "ឧ. ច័ន្ទ ដល់ សុក្រ",
    "Working time": "ម៉ោងធ្វើការ",
    "Location / map link (optional)": "ទីតាំង / តំណផែនទី (មិនចាំបាច់)",
    "Address or Google Maps link": "អាសយដ្ឋាន ឬតំណ Google Maps",
    "Share on social media": "ចែករំលែកលើបណ្តាញសង្គម",
    "Auto-post this job to our social channels when it's published.": "ប្រកាសការងារនេះដោយស្វ័យប្រវត្តិទៅបណ្តាញសង្គមរបស់យើង នៅពេលវាផ្សាយ។",
    "Banner image for the social post": "រូបភាពបដាសម្រាប់ការប្រកាសលើបណ្តាញសង្គម",
    "Remove": "លុបចេញ",
    "Description": "ការពិពណ៌នា",
    "Describe the role and what the team does…": "ពិពណ៌នាអំពីតួនាទី និងអ្វីដែលក្រុមធ្វើ…",
    "Skills, qualifications, experience…": "ជំនាញ សញ្ញាបត្រ បទពិសោធន៍…",
    "Perks, insurance, bonuses…": "អត្ថប្រយោជន៍ ធានារ៉ាប់រង ប្រាក់រង្វាន់…",
    "Screening questions": "សំណួរជ្រើសរើស",
    "Add question": "បន្ថែមសំណួរ",
    "Ask applicants custom questions. A knockout question flags anyone whose answer doesn't meet the rule.": "សួរបេក្ខជននូវសំណួរផ្ទាល់ខ្លួន។ សំណួរច្រានចោលនឹងសម្គាល់អ្នកដែលចម្លើយមិនត្រូវតាមលក្ខខណ្ឌ។",
    "No screening questions yet.": "មិនទាន់មានសំណួរជ្រើសរើស។",
    "Question…": "សំណួរ…",
    "Short text": "អត្ថបទខ្លី",
    "Long text": "អត្ថបទវែង",
    "Yes / No": "បាទ/ចាស ឬ ទេ",
    "Single choice": "ជម្រើសតែមួយ",
    "Multi choice": "ជម្រើសច្រើន",
    "Number": "លេខ",
    "Date": "កាលបរិច្ឆេទ",
    "Options, comma-separated (e.g. 1-2 years, 3-5 years, 5+ years)": "ជម្រើស បំបែកដោយសញ្ញាក្បៀស (ឧ. ១-២ឆ្នាំ, ៣-៥ឆ្នាំ, ៥ឆ្នាំឡើង)",
    "Passes when the answer…": "ជាប់នៅពេលចម្លើយ…",
    "is at least (≥)": "យ៉ាងតិច (≥)",
    "is more than (>)": "ច្រើនជាង (>)",
    "equals (=)": "ស្មើ (=)",
    "is at most (≤)": "យ៉ាងច្រើន (≤)",
    "is less than (<)": "តិចជាង (<)",
    "is Yes": "គឺ បាទ/ចាស",
    "Accepted answers, comma-separated": "ចម្លើយដែលទទួលយក បំបែកដោយសញ្ញាក្បៀស",
    "on / after (≥)": "នៅ / ក្រោយ (≥)",
    "on / before (≤)": "នៅ / មុន (≤)",
    "Application deadline": "ថ្ងៃផុតកំណត់ដាក់ពាក្យ",
    "Edit": "កែសម្រួល",
    "Clone": "ចម្លង",
    "Approve": "អនុម័ត",
    "Reject": "បដិសេធ",
    "Awaiting review": "រង់ចាំការពិនិត្យ",
    "Feature": "ធ្វើឱ្យលេចធ្លោ",
    "Delete": "លុប",
    "All": "ទាំងអស់",
    "Published": "បានផ្សាយ",
    "Draft": "សេចក្តីព្រាង",
    "Rejected": "បានបដិសេធ",
    "Closed": "បានបិទ",
    "Create, submit, close, and remove your listings.": "បង្កើត ដាក់ស្នើ បិទ និងលុបការងាររបស់អ្នក។",
    "Import from a job feed": "នាំចូលពីមតិព័ត៌មានការងារ",
    "Subscribe now →": "ជាវឥឡូវនេះ →",
    "Actions": "សកម្មភាព",
    "No jobs in this tab.": "គ្មានការងារក្នុងផ្ទាំងនេះ។",
    "Reject job posting": "បដិសេធការប្រកាសការងារ",
    "Tell the recruiter why this job was rejected.": "ប្រាប់អ្នកជ្រើសរើសពីមូលហេតុដែលការងារនេះត្រូវបានបដិសេធ។",
    "Reason": "មូលហេតុ",
    "e.g. Job description is incomplete…": "ឧ. ការពិពណ៌នាការងារមិនពេញលេញ…",
    "Notes…": "កំណត់ចំណាំ…",
    "Interviews": "ការសម្ភាសន៍",
    "Video": "វីដេអូ",
    "Phone call": "ការហៅទូរស័ព្ទ",
    "In-person": "ជួបផ្ទាល់",
    "Duration (minutes)": "រយៈពេល (នាទី)",
    "Location / address": "ទីតាំង / អាសយដ្ឋាន",
    "Meeting link (https://…)": "តំណប្រជុំ (https://…)",
    "Notes (optional)…": "កំណត់ចំណាំ (មិនចាំបាច់)…",
    "No interviews scheduled.": "មិនទាន់មានការសម្ភាសន៍។",
    "Reviewed": "បានពិនិត្យ",
    "Shortlisted": "បានជ្រើសរើស",
    "Interview": "សម្ភាសន៍",
    "Offered": "បានផ្តល់ជូន",
    "Hired": "បានជ្រើសរើសយក",
    "No applicants yet": "មិនទាន់មានបេក្ខជន",
    "Publish a job to start receiving applications.": "ផ្សាយការងារដើម្បីចាប់ផ្តើមទទួលពាក្យសុំ។",
    "Pipeline": "ដំណើរការ",
    "Drag a card between columns, or open it to manage.": "អូសកាតរវាងជួរឈរ ឬបើកវាដើម្បីគ្រប់គ្រង។",
    "Doesn't meet a screening requirement": "មិនត្រូវតាមលក្ខខណ្ឌជ្រើសរើស",
    "Stage": "ដំណាក់កាល",
    "Download CV": "ទាញយក CV",
    "Cover note": "លិខិតបញ្ជាក់",
    "Screening answers": "ចម្លើយជ្រើសរើស",
    "Meets requirement": "ត្រូវតាមលក្ខខណ្ឌ",
    "Does not meet requirement": "មិនត្រូវតាមលក្ខខណ្ឌ",
    "Tags": "ស្លាក",
    "Add a tag…": "បន្ថែមស្លាក…",
    "Add": "បន្ថែម",
    "Private notes": "កំណត់ចំណាំឯកជន",
    "Add a private note (only your team can see this)…": "បន្ថែមកំណត់ចំណាំឯកជន (មានតែក្រុមរបស់អ្នកទេដែលឃើញ)…",
    "Save note": "រក្សាទុកកំណត់ចំណាំ",
    "No notes yet.": "មិនទាន់មានកំណត់ចំណាំ។",
    "Write your message…": "សរសេរសាររបស់អ្នក…",
    "Manage your subscription and billing history.": "គ្រប់គ្រងការជាវ និងប្រវត្តិវិក្កយបត្ររបស់អ្នក។",
    "Current plan": "គម្រោងបច្ចុប្បន្ន",
    "Started": "បានចាប់ផ្តើម",
    "Live job posts": "ការងារកំពុងផ្សាយ",
    "Close a job to free a slot, or upgrade your plan for more.": "បិទការងារមួយដើម្បីទំនេរកន្លែង ឬដំឡើងគម្រោងដើម្បីបានច្រើនជាង។",
    "Featured credits": "ឥណទានលេចធ្លោ",
    "Check now": "ពិនិត្យឥឡូវនេះ",
    "Popular": "ពេញនិយម",
    "Current": "បច្ចុប្បន្ន",
    "Billing history": "ប្រវត្តិវិក្កយបត្រ",
    "Invoice": "វិក្កយបត្រ",
    "Amount": "ចំនួនទឹកប្រាក់",
    "Type": "ប្រភេទ",
    "Method": "វិធីទូទាត់",
    "No payments yet.": "មិនទាន់មានការទូទាត់។",
    "Tax invoice": "វិក្កយបត្រពន្ធ",
    "Download invoice": "ទាញយកវិក្កយបត្រ"
  };
  var EMP_ZH = {
    "Moved to": "已移至",
    "Awaiting payment confirmation from admin. Your plan will activate automatically once confirmed.": "等待管理员确认付款。确认后你的套餐将自动生效。",
    "Doesn't meet requirements": "不符合条件",
    "Free boosts included in your active plan": "你的有效套餐已包含免费推广额度",
    "Job posting requires an active plan.": "发布职位需要有效套餐。",
    "Meets requirements": "符合条件",
    "Payment pending admin confirmation. Job posting will be unlocked once your subscription is activated.": "付款待管理员确认。订阅生效后即可发布职位。",
    "Unlimited": "无限制",
    "Use a credit to feature a job free. After they run out, featuring costs the pay-per-boost price.": "使用额度可免费将职位设为精选。额度用完后，设为精选将按单次推广价格计费。",
    "Verified": "已认证",
    "Temporary": "临时",
    "e.g. 8:00 AM – 5:00 PM": "例如：上午 8:00 – 下午 5:00",
    "A logo, description and culture help candidates trust and choose you.": "logo、公司介绍和企业文化能让候选人更信任并选择你。",
    "AI draft failed.": "AI 生成草稿失败。",
    "Activates on": "生效日期",
    "Add note": "添加备注",
    "Add scorecard": "添加评分表",
    "All used": "已用完",
    "Already used": "已使用",
    "Banner preview": "横幅预览",
    "CV hidden": "简历已隐藏",
    "Candidate": "候选人",
    "Clone job": "复制职位",
    "Complete your company profile": "完善你的公司主页",
    "Connect a feed": "连接职位源",
    "Could not save job.": "无法保存职位。",
    "Could not send message.": "消息发送失败。",
    "Download failed": "下载失败",
    "Draft added below — review and edit before posting.": "草稿已添加到下方——请在发布前检查并修改。",
    "Draft saved.": "草稿已保存。",
    "Draft with AI": "用 AI 生成草稿",
    "Drafting…": "生成中…",
    "Edit job": "编辑职位",
    "Edit profile": "编辑主页",
    "Enter a job title first, then draft with AI.": "请先填写职位名称，再使用 AI 生成草稿。",
    "Enterprise plan inquiry": "企业套餐咨询",
    "Expired on": "到期于",
    "Freelance": "自由职业",
    "Hide scorecard": "隐藏评分表",
    "Image upload failed.": "图片上传失败。",
    "Import in bulk": "批量导入",
    "Interview scheduled — candidate notified.": "面试已安排——已通知候选人。",
    "Job approved and published.": "职位已批准并发布。",
    "Job closed.": "职位已关闭。",
    "Job deleted.": "职位已删除。",
    "Job published!": "职位已发布！",
    "Job rejected.": "职位已驳回。",
    "Job submitted for company approval.": "职位已提交公司审批。",
    "Job title is required.": "请填写职位名称。",
    "Job updated.": "职位已更新。",
    "Limit reached": "已达上限",
    "Location / map": "地点 / 地图",
    "Max salary must be greater than or equal to min salary.": "最高薪资必须大于或等于最低薪资。",
    "Needs approval": "待审批",
    "Negotiable": "面议",
    "No CV": "无简历",
    "No active subscription.": "没有生效中的订阅。",
    "No expiry": "无到期日",
    "Pick a date & time first.": "请先选择日期和时间。",
    "Plan": "套餐",
    "Publish": "发布",
    "Publish job": "发布职位",
    "Renews": "续订于",
    "Replace image": "更换图片",
    "Save changes": "保存更改",
    "Save draft": "保存草稿",
    "Save scorecard": "保存评分表",
    "Saving…": "保存中…",
    "Schedule": "安排",
    "Schedule interview": "安排面试",
    "Scheduling…": "安排中…",
    "Scorecard saved.": "评分表已保存。",
    "Sending…": "发送中…",
    "Submit": "提交",
    "Submit for approval": "提交审批",
    "Submitted for company review.": "已提交公司审核。",
    "Upgrade": "升级",
    "Upload image": "上传图片",
    "Uploading…": "上传中…",
    "Yes": "是",
    "You": "你",
    "Your subscription has expired. Jobs are hidden from the public website.": "你的订阅已到期。职位已从公开网站隐藏。",
    "Approved": "已批准",
    "Suspended": "已暂停",
    "Applicant tracking": "申请者跟踪",
    "Job postings": "职位发布",
    "Applicants": "申请者",
    "CV Match": "简历匹配",
    "Find candidates": "寻找候选人",
    "Messages": "消息",
    "Team": "团队",
    "Company profile": "公司主页",
    "Plan & billing": "套餐与账单",
    "Help & support": "帮助与支持",
    "Unverified": "未认证",
    "Post": "发布",
    "My Profile": "我的资料",
    "Sign out": "退出登录",
    "Welcome — let’s get your first job live": "欢迎——来发布你的第一个职位吧",
    "Your dashboard is empty because you haven’t posted yet. Three quick ways to fill it:": "你的控制台还是空的，因为尚未发布职位。三种快捷方式：",
    "Active jobs": "在招职位",
    "Pending approval": "待审核",
    "Total applications": "申请总数",
    "Total job views": "职位浏览总数",
    "Your job postings": "你发布的职位",
    "Manage jobs": "管理职位",
    "Job title": "职位名称",
    "Status": "状态",
    "Views": "浏览量",
    "Loading…": "加载中…",
    "No jobs yet. Click “Post a job” to create your first listing.": "还没有职位。点击「发布职位」创建你的第一个职位。",
    "Upcoming interviews": "即将进行的面试",
    "Open": "打开",
    "Close": "关闭",
    "e.g. Senior Accountant": "例如：高级会计",
    "— Select —": "— 请选择 —",
    "+ Add a new category…": "+ 添加新类别…",
    "New category name": "新类别名称",
    "e.g. Renewable Energy": "例如：可再生能源",
    "Salary min": "最低薪资",
    "Salary max": "最高薪资",
    "Currency": "币种",
    "Per": "每",
    "Hour": "小时",
    "Day": "天",
    "Month": "月",
    "Year": "年",
    "Remote-friendly": "支持远程",
    "Candidates can work remotely.": "候选人可远程办公。",
    "Working days": "工作日",
    "e.g. Monday to Friday": "例如：周一至周五",
    "Working time": "工作时间",
    "Location / map link (optional)": "地点 / 地图链接（选填）",
    "Address or Google Maps link": "地址或 Google 地图链接",
    "Share on social media": "分享到社交媒体",
    "Auto-post this job to our social channels when it's published.": "职位发布时自动同步到我们的社交渠道。",
    "Banner image for the social post": "社交帖子的横幅图片",
    "Remove": "移除",
    "Description": "职位描述",
    "Describe the role and what the team does…": "介绍该职位以及团队的工作内容…",
    "Skills, qualifications, experience…": "技能、学历、经验…",
    "Perks, insurance, bonuses…": "福利、保险、奖金…",
    "Screening questions": "筛选问题",
    "Add question": "添加问题",
    "Ask applicants custom questions. A knockout question flags anyone whose answer doesn't meet the rule.": "向申请者提出自定义问题。淘汰型问题会标记出回答不符合条件的人。",
    "No screening questions yet.": "尚未添加筛选问题。",
    "Question…": "问题…",
    "Short text": "短文本",
    "Long text": "长文本",
    "Yes / No": "是 / 否",
    "Single choice": "单选",
    "Multi choice": "多选",
    "Number": "数字",
    "Date": "日期",
    "Options, comma-separated (e.g. 1-2 years, 3-5 years, 5+ years)": "选项，用逗号分隔（例如：1-2 年、3-5 年、5 年以上）",
    "Passes when the answer…": "当回答满足以下条件时通过…",
    "is at least (≥)": "不少于 (≥)",
    "is more than (>)": "大于 (>)",
    "equals (=)": "等于 (=)",
    "is at most (≤)": "不超过 (≤)",
    "is less than (<)": "小于 (<)",
    "is Yes": "为「是」",
    "Accepted answers, comma-separated": "可接受的答案，用逗号分隔",
    "on / after (≥)": "在该日期或之后 (≥)",
    "on / before (≤)": "在该日期或之前 (≤)",
    "Application deadline": "申请截止日期",
    "Edit": "编辑",
    "Clone": "复制",
    "Approve": "批准",
    "Reject": "驳回",
    "Awaiting review": "等待审核",
    "Feature": "设为精选",
    "Delete": "删除",
    "All": "全部",
    "Published": "已发布",
    "Draft": "草稿",
    "Rejected": "已驳回",
    "Closed": "已关闭",
    "Create, submit, close, and remove your listings.": "创建、提交、关闭和删除你的职位。",
    "Import from a job feed": "从职位源导入",
    "Subscribe now →": "立即订阅 →",
    "Actions": "操作",
    "No jobs in this tab.": "此标签下暂无职位。",
    "Reject job posting": "驳回职位发布",
    "Tell the recruiter why this job was rejected.": "告知招聘人员此职位被驳回的原因。",
    "Reason": "原因",
    "e.g. Job description is incomplete…": "例如：职位描述不完整…",
    "Notes…": "备注…",
    "Interviews": "面试",
    "Video": "视频",
    "Phone call": "电话面试",
    "In-person": "现场面试",
    "Duration (minutes)": "时长（分钟）",
    "Location / address": "地点 / 地址",
    "Meeting link (https://…)": "会议链接（https://…）",
    "Notes (optional)…": "备注（选填）…",
    "No interviews scheduled.": "尚未安排面试。",
    "Reviewed": "已查看",
    "Shortlisted": "已入围",
    "Interview": "面试",
    "Offered": "已发录用",
    "Hired": "已录用",
    "No applicants yet": "暂无申请者",
    "Publish a job to start receiving applications.": "发布职位即可开始接收申请。",
    "Pipeline": "招聘流程",
    "Drag a card between columns, or open it to manage.": "在各列之间拖动卡片，或打开卡片进行管理。",
    "Doesn't meet a screening requirement": "不符合筛选条件",
    "Stage": "阶段",
    "Download CV": "下载简历",
    "Cover note": "求职附言",
    "Screening answers": "筛选问题回答",
    "Meets requirement": "符合条件",
    "Does not meet requirement": "不符合条件",
    "Tags": "标签",
    "Add a tag…": "添加标签…",
    "Add": "添加",
    "Private notes": "内部备注",
    "Add a private note (only your team can see this)…": "添加内部备注（仅你的团队可见）…",
    "Save note": "保存备注",
    "No notes yet.": "暂无备注。",
    "Write your message…": "写下你的消息…",
    "Manage your subscription and billing history.": "管理你的订阅与账单记录。",
    "Current plan": "当前套餐",
    "Started": "开始于",
    "Live job posts": "在线职位数",
    "Close a job to free a slot, or upgrade your plan for more.": "关闭一个职位以释放名额，或升级套餐以获得更多。",
    "Featured credits": "精选额度",
    "Check now": "立即查看",
    "Popular": "热门",
    "Current": "当前",
    "Billing history": "账单记录",
    "Invoice": "发票",
    "Amount": "金额",
    "Type": "类型",
    "Method": "支付方式",
    "No payments yet.": "暂无付款记录。",
    "Tax invoice": "税务发票",
    "Download invoice": "下载发票"
  };
  try {
    if (window.KRAMA_I18N) {
      window.KRAMA_I18N.km = Object.assign(window.KRAMA_I18N.km || {}, EMP_KM);
      window.KRAMA_I18N.zh = Object.assign(window.KRAMA_I18N.zh || {}, EMP_ZH);
    }
  } catch (e) {}
  // The DS StatusBadge hardcodes English labels, but it renders `children || label` — so we
  // can pass a translated child instead of editing _ds_bundle.js, which has no rebuild
  // pipeline and would have to be hand-patched. Keys mirror the DS map.
  const STATUS_LABEL = {
    draft: "Draft",
    pending: "Pending approval",
    company_pending: "Awaiting review",
    published: "Published",
    approved: "Approved",
    rejected: "Rejected",
    closed: "Closed",
    suspended: "Suspended"
  };
  const statusText = function (s) {
    return T(STATUS_LABEL[s] || "Draft");
  };
  const KIT_LANGS = {
    en: 1,
    km: 1,
    zh: 1
  };
  const T = function (s) {
    if (typeof window.KRAMA_T !== "function") return s;
    return KIT_LANGS[window.KRAMA_LANG] ? window.KRAMA_T(s) : s;
  };
  // Home page target: clean "/" in production, relative path in local dev (same host check as api.js).
  const HOME_URL = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(location.hostname) ? "../public-website/index.html" : "/";
  if (!document.getElementById('kre-css')) {
    var _krecss = document.createElement('style');
    _krecss.id = 'kre-css';
    _krecss.textContent = '.krama-rich-body:empty:before{content:attr(data-placeholder);color:var(--text-faint,#bbb);pointer-events:none;display:block}.krama-rich-body ul,.krama-rich-body ol{margin:6px 0;padding-left:22px}.krama-rich-body li{margin-bottom:3px}';
    document.head.appendChild(_krecss);
  }

  // LucideIcon isolates lucide's DOM mutations inside a <span> React controls,
  // so re-renders never hit the removeChild error from swapped-out <i> nodes.
  const LucideIcon = React.memo(function LucideIcon({
    name,
    size
  }) {
    size = size || 18;
    const ref = React.useRef(null);
    React.useEffect(function () {
      var span = ref.current;
      if (!span || !window.lucide) return;
      span.innerHTML = '<i data-lucide="' + name + '" style="width:' + size + 'px;height:' + size + 'px;display:inline-flex"></i>';
      window.lucide.createIcons({
        el: span
      });
    }, [name, size]);
    return /*#__PURE__*/React.createElement("span", {
      ref: ref,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0
      }
    });
  });
  const I = (n, s = 18) => /*#__PURE__*/React.createElement(LucideIcon, {
    name: n,
    size: s
  });

  // Redirect the browser to ABA PayWay's hosted checkout page (shows ABA Pay + KHQR + Card tabs)
  // by POSTing the signed "purchase" form the server returned.
  function abaSubmitForm(d) {
    if (!d || !d.action) return;
    var f = document.createElement("form");
    f.method = "POST";
    f.action = d.action;
    f.style.display = "none";
    var fields = d.fields || {};
    Object.keys(fields).forEach(function (k) {
      var inp = document.createElement("input");
      inp.type = "hidden";
      inp.name = k;
      inp.value = fields[k] == null ? "" : String(fields[k]);
      f.appendChild(inp);
    });
    document.body.appendChild(f);
    f.submit();
  }
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
  const NAV = [{
    id: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard"
  }, {
    id: "jobs",
    label: "Job postings",
    icon: "briefcase"
  }, {
    id: "applicants",
    label: "Applicants",
    icon: "users"
  }, {
    id: "cvmatch",
    label: "CV Match",
    icon: "git-compare-arrows"
  }, {
    id: "talent",
    label: "Find candidates",
    icon: "user-search"
  }, {
    id: "messages",
    label: "Messages",
    icon: "message-square"
  }, {
    id: "team",
    label: "Team",
    icon: "user-plus",
    adminOnly: true
  }, {
    id: "company",
    label: "Company profile",
    icon: "building-2",
    adminOnly: true
  }, {
    id: "billing",
    label: "Plan & billing",
    icon: "credit-card",
    adminOnly: true
  }, {
    id: "support",
    label: "Help & support",
    icon: "life-buoy"
  }];
  function isCompanyAdmin(user) {
    // Owner (no company_role set, owns a company) or explicit company_admin
    return !user || user.company_role !== "recruitment";
  }
  function Sidebar({
    page,
    onNav,
    company,
    badges,
    open,
    onClose,
    user,
    lang,
    onLang
  }) {
    badges = badges || {};
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
    }, window.KRAMA_BRAND_NAME || "KRAMA")), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 3
      }
    }, NAV.filter(function (n) {
      return !n.adminOnly || isCompanyAdmin(user);
    }).map(n => {
      const active = page === n.id;
      return /*#__PURE__*/React.createElement("button", {
        key: n.id,
        onClick: () => {
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
      }, T(n.label)), badges[n.id] > 0 && /*#__PURE__*/React.createElement(Badge, {
        tone: n.id === "billing" ? "warning" : active ? "brand" : "neutral"
      }, badges[n.id]));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "auto",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 8px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: company && company.logo_url,
      name: company && company.name || "Company",
      square: true,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, company && company.name || "Company"), company && company.is_verified ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--success)",
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, I("badge-check", 12), " ", T("Verified")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, T("Unverified")))), onLang && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        padding: "0 8px 10px"
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
    })));
  }
  function NotificationBell({
    onNav
  }) {
    const [open, setOpen] = React.useState(false);
    const [list, setList] = React.useState([]);
    const [unread, setUnread] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const ROUTE = {
      application_received: "applicants",
      application_stage: "applications",
      job_approved: "jobs",
      job_rejected: "jobs"
    };
    const ICON = {
      application_received: "user-plus",
      application_stage: "activity",
      job_approved: "circle-check-big",
      job_rejected: "circle-x",
      forum_reply: "message-circle",
      forum_mention: "at-sign"
    };
    const pollUnread = React.useCallback(function () {
      emp.fetchNotifUnread().then(function (d) {
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
        emp.fetchNotifications().then(function (d) {
          setList(d.data || []);
          setUnread(d.unread || 0);
          setLoading(false);
        }).catch(function () {
          setLoading(false);
        });
      }
    }
    function markAll() {
      emp.markAllNotifRead().then(function () {
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
        emp.markNotifRead(n.id).then(function () {
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
        width: 40,
        height: 40,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("bell", 18), unread > 0 && /*#__PURE__*/React.createElement("span", {
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
        top: 48,
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
    }, "Loading\u2026") : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
    onPost,
    onNav,
    onMenu
  }) {
    const [open, setOpen] = React.useState(false);
    const initials = user && user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "EM";
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
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(NotificationBell, {
      onNav: onNav
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("plus", 16),
      onClick: onPost,
      style: {
        whiteSpace: "nowrap"
      }
    }, T("Post")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(o => !o),
      style: {
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "var(--brand)",
        color: "#fff",
        border: "2px solid var(--border)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: 14,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 0
      }
    }, user && user.avatar_url ? /*#__PURE__*/React.createElement("img", {
      src: user.avatar_url,
      alt: initials,
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }
    }) : initials), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      onClick: () => setOpen(false),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 99
      }
    }), /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        position: "absolute",
        top: 46,
        right: 0,
        minWidth: 200,
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        zIndex: 100,
        padding: "6px 0",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px 8px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)"
      }
    }, user ? user.name : "Employer"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, user ? user.email : "")), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setOpen(false);
        onNav && onNav("profile");
      },
      style: {
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "transparent",
        padding: "9px 14px",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, T("My Profile")), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--border)",
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setOpen(false);
        onLogout && onLogout();
      },
      style: {
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "transparent",
        padding: "9px 14px",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--danger)"
      }
    }, T("Sign out"))))))));
  }
  function MyProfile({
    user,
    onUserUpdate
  }) {
    const [name, setName] = React.useState(user ? user.name || "" : "");
    const [phone, setPhone] = React.useState(user ? user.phone || "" : "");
    const [bio, setBio] = React.useState(user ? user.bio || "" : "");
    const [allowMsgs, setAllowMsgs] = React.useState(user ? !!user.allow_candidate_messages : false);
    const [preview, setPreview] = React.useState(user ? user.avatar_url || "" : "");
    const [busy, setBusy] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const fileRef = React.useRef(null);
    const [curPwd, setCurPwd] = React.useState("");
    const [newPwd, setNewPwd] = React.useState("");
    const [conPwd, setConPwd] = React.useState("");
    const [pwdBusy, setPwdBusy] = React.useState(false);
    const [pwdMsg, setPwdMsg] = React.useState(null);
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
      emp.changePassword(curPwd, newPwd).then(() => {
        setPwdBusy(false);
        setPwdMsg({
          ok: true,
          text: "Password updated!"
        });
        setCurPwd("");
        setNewPwd("");
        setConPwd("");
      }).catch(e => {
        setPwdBusy(false);
        setPwdMsg({
          ok: false,
          text: e && e.message || "Failed to update password."
        });
      });
    }
    function onFileChange(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(file);
      setUploading(true);
      setSaved(false);
      compressImage(file, 400, 0.82).then(compressed => emp.uploadAvatar(compressed)).then(u => {
        setPreview(u.avatar_url || "");
        if (onUserUpdate) onUserUpdate(u);
        setUploading(false);
        setSaved(true);
      }).catch(err => {
        alert(err.message || "Upload failed.");
        setUploading(false);
      });
    }
    function save() {
      setBusy(true);
      setSaved(false);
      emp.updateMe({
        name,
        phone,
        bio,
        allow_candidate_messages: allowMsgs
      }).then(u => {
        if (onUserUpdate) onUserUpdate(u);
        setSaved(true);
        setBusy(false);
      }).catch(err => {
        alert(err.message || "Save failed.");
        setBusy(false);
      });
    }

    // ── Telegram alerts (deep-link connect flow) ──
    const [tgConnected, setTgConnected] = React.useState(false);
    const [tgBusy, setTgBusy] = React.useState(false);
    const [tgMsg, setTgMsg] = React.useState(null);
    const tgPollRef = React.useRef(null);
    React.useEffect(function () {
      emp.telegramStatus().then(function (d) {
        setTgConnected(!!(d && d.connected));
      }).catch(function () {});
      return function () {
        if (tgPollRef.current) clearInterval(tgPollRef.current);
      };
    }, []);
    function tgConnect() {
      setTgBusy(true);
      setTgMsg(null);
      emp.telegramLink().then(function (d) {
        if (!d || !d.url) {
          setTgBusy(false);
          setTgMsg({
            ok: false,
            text: "Telegram isn't set up yet — ask the administrator to enable it."
          });
          return;
        }
        window.open(d.url, "_blank");
        setTgMsg({
          ok: true,
          text: "Opening Telegram… press Start in the bot, then come back here."
        });
        var tries = 0;
        if (tgPollRef.current) clearInterval(tgPollRef.current);
        tgPollRef.current = setInterval(function () {
          tries++;
          emp.telegramStatus().then(function (s) {
            if (s && s.connected) {
              clearInterval(tgPollRef.current);
              tgPollRef.current = null;
              setTgConnected(true);
              setTgBusy(false);
              setTgMsg({
                ok: true,
                text: "Connected! You'll get a Telegram message when a candidate applies."
              });
            } else if (tries >= 40) {
              clearInterval(tgPollRef.current);
              tgPollRef.current = null;
              setTgBusy(false);
              setTgMsg({
                ok: false,
                text: "Didn't detect a connection yet. Make sure you pressed Start in the bot, then try again."
              });
            }
          }).catch(function () {});
        }, 3000);
      }).catch(function (e) {
        setTgBusy(false);
        setTgMsg({
          ok: false,
          text: e && e.message || "Could not start connection."
        });
      });
    }
    function tgDisconnect() {
      setTgBusy(true);
      emp.telegramUnlink().then(function () {
        setTgConnected(false);
        setTgBusy(false);
        setTgMsg(null);
      }).catch(function () {
        setTgBusy(false);
      });
    }
    function tgTest() {
      setTgMsg(null);
      emp.telegramTest().then(function () {
        setTgMsg({
          ok: true,
          text: "Test message sent — check your Telegram."
        });
      }).catch(function (e) {
        setTgMsg({
          ok: false,
          text: e && e.message || "Test failed."
        });
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        maxWidth: 720
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "My Profile",
      sub: "Update your personal information and photo."
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
      onClick: () => fileRef.current && fileRef.current.click(),
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
    }, user ? user.email : ""), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      style: {
        marginTop: 8,
        paddingLeft: 0
      },
      onClick: () => fileRef.current && fileRef.current.click(),
      disabled: uploading
    }, uploading ? "Uploading…" : "Change photo"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Full name",
      value: name,
      onChange: e => setName(e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Email",
      value: user ? user.email : "",
      disabled: true,
      iconLeft: I("mail", 16)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Phone",
      value: phone,
      onChange: e => setPhone(e.target.value),
      iconLeft: I("phone", 16)
    })), /*#__PURE__*/React.createElement(Textarea, {
      label: "Bio / Description",
      value: bio,
      onChange: e => setBio(e.target.value),
      rows: 4,
      placeholder: "Tell candidates a bit about yourself\u2026"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 16px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-sunken, var(--surface-page))"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)"
      }
    }, "Allow candidates to message me directly"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 3
      }
    }, "When off, only you can start a conversation. When on, any candidate who applied can message you first.")), /*#__PURE__*/React.createElement(Switch, {
      checked: allowMsgs,
      onChange: v => setAllowMsgs(typeof v === "boolean" ? v : !allowMsgs)
    })), saved && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--success)"
      }
    }, "Changes saved!"), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: busy,
      onClick: save
    }, busy ? "Saving…" : "Save changes")))), /*#__PURE__*/React.createElement(Card, {
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
    }, "Change password"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 18
      }
    }, "Choose a strong password of at least 8 characters."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Current password",
      type: "password",
      value: curPwd,
      onChange: e => setCurPwd(e.target.value),
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "New password",
      type: "password",
      value: newPwd,
      onChange: e => setNewPwd(e.target.value),
      placeholder: "At least 8 characters"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Confirm new password",
      type: "password",
      value: conPwd,
      onChange: e => setConPwd(e.target.value),
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
    }, pwdBusy ? "Updating…" : "Update password")))), /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginTop: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-base)",
        fontWeight: 700,
        color: "var(--text-strong)",
        margin: 0
      }
    }, "Telegram alerts"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 9px",
        borderRadius: 999,
        background: tgConnected ? "var(--success-subtle, #e6f6ee)" : "var(--surface-sunken, var(--surface-page))",
        color: tgConnected ? "var(--success)" : "var(--text-muted)",
        border: "1px solid var(--border)"
      }
    }, tgConnected ? "Connected" : "Not connected")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 16
      }
    }, "Get an instant Telegram message whenever a candidate applies to one of your jobs. Click connect, press ", /*#__PURE__*/React.createElement("b", null, "Start"), " in the bot, and you're done \u2014 no codes to copy."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
      }
    }, !tgConnected && /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("send", 15),
      disabled: tgBusy,
      onClick: tgConnect
    }, tgBusy ? "Waiting for Telegram…" : "Connect Telegram"), tgConnected && /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      iconLeft: I("send", 15),
      onClick: tgTest
    }, "Send test"), tgConnected && /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: tgDisconnect,
      disabled: tgBusy
    }, "Disconnect")), tgMsg && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        fontSize: "var(--text-sm)",
        color: tgMsg.ok ? "var(--success)" : "var(--danger)",
        fontWeight: 600
      }
    }, tgMsg.text)));
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
        marginBottom: 18,
        gap: 12
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
    }, sub)), action);
  }
  function EmployerLogin({
    onLogin
  }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const submit = () => {
      setError("");
      setLoading(true);
      emp.login(email, password).then(function (u) {
        setLoading(false);
        onLogin(u);
      }).catch(function (e) {
        setLoading(false);
        setError(e && e.message || "Login failed.");
      });
    };
    const onKey = e => {
      if (e.key === "Enter") submit();
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-page)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        maxWidth: 380,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        padding: 36
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: HOME_URL,
      title: "Go to Krama home",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 24,
        textDecoration: "none",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: window.getKramaLogo("../../assets/krama-icon.png"),
      height: "40",
      alt: "KRAMA"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-xl)",
        letterSpacing: ".08em",
        color: "var(--text-strong)"
      }
    }, window.KRAMA_BRAND_NAME || "KRAMA")), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--text-2xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 6
      }
    }, "Employer login"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 22
      }
    }, "Manage your jobs and applicants."), error && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        marginBottom: 16
      }
    }, error), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Email",
      type: "email",
      value: email,
      onChange: e => setEmail(e.target.value),
      onKeyDown: onKey,
      placeholder: "hr@company.com"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Password",
      type: "password",
      value: password,
      onChange: e => setPassword(e.target.value),
      onKeyDown: onKey,
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      onClick: submit,
      disabled: loading
    }, loading ? "Signing in…" : "Sign in"))));
  }
  const JOB_TYPE_LABELS = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    internship: "Internship",
    temporary: "Temporary"
  };
  function Overview({
    jobs,
    loading,
    onNav
  }) {
    const active = jobs.filter(j => j.status === "published").length;
    const pending = jobs.filter(j => j.status === "company_pending").length;
    const totalApps = jobs.reduce((s, j) => s + (j.applications_count || 0), 0);
    const totalViews = jobs.reduce((s, j) => s + (j.views || 0), 0);
    const fmtDate = iso => {
      if (!iso) return "—";
      var d = new Date(iso);
      return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    };
    const recent = jobs.slice(0, 6);
    const [upcoming, setUpcoming] = React.useState([]);
    React.useEffect(function () {
      emp.fetchUpcomingInterviews().then(function (d) {
        setUpcoming(d || []);
      }).catch(function () {});
    }, []);
    const fmtDT = fmtWall;
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 24
      }
    }, !loading && jobs.length === 0 && /*#__PURE__*/React.createElement(Card, {
      padding: 0,
      style: {
        overflow: "hidden",
        border: "1px solid var(--brand)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 24px",
        background: "var(--brand-subtle, rgba(12,126,107,0.07))",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)",
        display: "inline-flex"
      }
    }, I("rocket", 22)), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)",
        margin: 0
      }
    }, T("Welcome — let’s get your first job live"))), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        margin: "6px 0 0 32px"
      }
    }, T("Your dashboard is empty because you haven’t posted yet. Three quick ways to fill it:"))), [{
      icon: "pen-line",
      title: T("Post a job"),
      body: "Write it yourself — or click “Draft with AI” to generate the description, requirements & benefits from just a job title.",
      cta: T("Post a job"),
      nav: "jobs"
    }, {
      icon: "rss",
      title: T("Import in bulk"),
      body: "Connect your careers page or ATS feed (Greenhouse, Lever, or RSS) to import all your open roles as drafts to review and publish.",
      cta: T("Connect a feed"),
      nav: "jobs"
    }, {
      icon: "building-2",
      title: T("Complete your company profile"),
      body: T("A logo, description and culture help candidates trust and choose you."),
      cta: T("Edit profile"),
      nav: "company"
    }].map(function (s, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          padding: "16px 24px",
          borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          background: "var(--surface-sunken, var(--surface-page))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--brand)"
        }
      }, I(s.icon, 18)), /*#__PURE__*/React.createElement("div", {
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
      }, s.title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          marginTop: 2,
          lineHeight: 1.5
        }
      }, s.body)), /*#__PURE__*/React.createElement(Button, {
        variant: i === 0 ? "primary" : "secondary",
        size: "sm",
        onClick: () => onNav(s.nav),
        style: {
          flexShrink: 0
        }
      }, s.cta));
    })), /*#__PURE__*/React.createElement("div", {
      className: "krm-stats-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: T("Active jobs"),
      value: loading ? "—" : String(active),
      tone: "brand",
      icon: I("briefcase", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: T("Pending approval"),
      value: loading ? "—" : String(pending),
      tone: "warning",
      icon: I("clock", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: T("Total applications"),
      value: loading ? "—" : String(totalApps),
      tone: "info",
      icon: I("users", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: T("Total job views"),
      value: loading ? "—" : totalViews.toLocaleString(),
      tone: "success",
      icon: I("eye", 22)
    })), /*#__PURE__*/React.createElement("div", {
      className: "krm-table-wrap"
    }, /*#__PURE__*/React.createElement(Card, {
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
    }, T("Your job postings")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: I("arrow-right", 14),
      onClick: () => onNav("jobs")
    }, T("Manage jobs"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 0.7fr 0.7fr 0.8fr",
        padding: "10px 22px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", null, T("Job title")), /*#__PURE__*/React.createElement("span", null, T("Status")), /*#__PURE__*/React.createElement("span", null, T("Applicants")), /*#__PURE__*/React.createElement("span", null, T("Views")), /*#__PURE__*/React.createElement("span", null, T("Posted"))), loading && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "26px 22px",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, T("Loading…")), !loading && recent.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "26px 22px",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, T("No jobs yet. Click “Post a job” to create your first listing.")), !loading && recent.map((j, i) => /*#__PURE__*/React.createElement("div", {
      key: j.id,
      style: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 0.7fr 0.7fr 0.8fr",
        alignItems: "center",
        padding: "14px 22px",
        borderBottom: i < recent.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, j.title), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(StatusBadge, {
      status: j.status
    }, statusText(j.status))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.applications_count || 0), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.views || 0), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, fmtDate(j.created_at)))))), upcoming.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "krm-table-wrap"
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        color: "var(--text-brand)"
      }
    }, I("calendar-clock", 18)), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, T("Upcoming interviews"))), upcoming.map(function (iv, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: iv.id,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 22px",
          borderBottom: i < upcoming.length - 1 ? "1px solid var(--border-subtle)" : "none"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          color: "var(--text-muted)",
          flexShrink: 0
        }
      }, I(iv.type === "phone" ? "phone" : iv.type === "in_person" ? "map-pin" : "video", 16)), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--text-strong)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, iv.candidate || T("Candidate"), " \xB7 ", iv.job || ""), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)"
        }
      }, IV_TYPE[iv.type], " \xB7 ", iv.duration_min, " min", iv.interviewer ? " · " + iv.interviewer : "")), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          fontWeight: 600,
          flexShrink: 0
        }
      }, fmtDT(iv.scheduled_at)), /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        onClick: () => onNav("applicants"),
        style: {
          flexShrink: 0
        }
      }, T("Open")));
    }))));
  }

  // Connect the company's own careers/ATS feed → native draft jobs.
  function JobFeedModal({
    open,
    onClose,
    onImported
  }) {
    const [feed, setFeed] = React.useState(null);
    const [url, setUrl] = React.useState("");
    const [format, setFormat] = React.useState("rss");
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [syncing, setSyncing] = React.useState(false);
    const [msg, setMsg] = React.useState("");
    const [err, setErr] = React.useState("");
    const [result, setResult] = React.useState(null);
    React.useEffect(function () {
      if (!open) return;
      setMsg("");
      setErr("");
      setResult(null);
      setLoading(true);
      emp.getJobFeed().then(function (d) {
        var f = d && d.feed;
        setFeed(f || null);
        setUrl(f ? f.url || "" : "");
        setFormat(f ? f.format || "rss" : "rss");
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }, [open]);
    if (!open) return null;
    const save = function () {
      if (!url.trim()) {
        setErr("Enter your feed URL.");
        return;
      }
      setSaving(true);
      setErr("");
      setMsg("");
      emp.saveJobFeed({
        url: url.trim(),
        format: format,
        enabled: true
      }).then(function (d) {
        setSaving(false);
        setFeed(d.feed);
        setMsg("Feed saved — click “Sync now” to import your jobs.");
      }).catch(function (e) {
        setSaving(false);
        setErr(e && e.message || "Could not save the feed.");
      });
    };
    const sync = function () {
      setSyncing(true);
      setErr("");
      setMsg("");
      setResult(null);
      emp.syncJobFeed().then(function (d) {
        setSyncing(false);
        setFeed(d.feed);
        var r = d.result;
        if (r && r.ok) {
          setResult(r);
          onImported && onImported();
        } else {
          setErr(r && r.error || "Sync failed.");
        }
      }).catch(function (e) {
        setSyncing(false);
        setErr(e && e.message || "Sync failed.");
      });
    };
    const disconnect = function () {
      emp.deleteJobFeed().then(function () {
        setFeed(null);
        setResult(null);
        setMsg("Feed disconnected. Your imported jobs were kept.");
      }).catch(function () {});
    };
    const FMT = [{
      value: "rss",
      label: "RSS"
    }, {
      value: "atom",
      label: "Atom"
    }, {
      value: "json",
      label: "JSON / ATS API (Greenhouse, Lever…)"
    }];
    const fmtWhen = function (iso) {
      if (!iso) return "never";
      try {
        return new Date(iso).toLocaleString();
      } catch (e) {
        return iso;
      }
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        overflowY: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        maxWidth: 560,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontWeight: 700,
        fontSize: "var(--text-md)",
        color: "var(--text-strong)"
      }
    }, "Import from a job feed"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "Close",
      onClick: onClose,
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        padding: 4,
        display: "inline-flex"
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Connect your careers page or ATS feed (Greenhouse, Lever, or an RSS feed). Your roles import as ", /*#__PURE__*/React.createElement("strong", null, "drafts"), " you review and publish \u2014 full content, applications handled on Krama."), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)"
      }
    }, "Loading\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
      label: "Feed URL",
      value: url,
      onChange: e => setUrl(e.target.value),
      placeholder: "https://boards-api.greenhouse.io/v1/boards/acme/jobs?content=true"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Format",
      value: format,
      onChange: e => setFormat(e.target.value),
      options: FMT
    }), feed && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        display: "flex",
        gap: 14,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Last sync: ", fmtWhen(feed.last_synced_at)), /*#__PURE__*/React.createElement("span", null, "Status: ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: feed.last_status === "ok" ? "var(--success)" : feed.last_status === "error" ? "var(--danger)" : "inherit"
      }
    }, feed.last_status || "not run")), /*#__PURE__*/React.createElement("span", null, "Imported: ", feed.imported_count)), feed && feed.last_status === "error" && feed.last_error && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--danger)"
      }
    }, feed.last_error), msg && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "8px 12px",
        background: "var(--success-subtle)",
        color: "var(--success)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, msg), err && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "8px 12px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, err), result && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "8px 12px",
        background: "var(--success-subtle)",
        color: "var(--success)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, "Imported ", result.imported, " new draft(s), updated ", result.updated, ". Review them in the ", /*#__PURE__*/React.createElement("strong", null, "Draft"), " tab, then publish."))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "14px 22px",
        borderTop: "1px solid var(--border)",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", null, feed && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: disconnect,
      style: {
        border: "none",
        background: "transparent",
        color: "var(--danger)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        cursor: "pointer",
        padding: 0
      }
    }, "Disconnect")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      disabled: saving,
      onClick: save
    }, saving ? "Saving…" : "Save"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: syncing || !feed,
      onClick: sync
    }, syncing ? "Syncing…" : "Sync now")))));
  }
  function JobFormModal({
    open,
    mode,
    job,
    onClose,
    onCreated,
    onPublishRequest,
    user
  }) {
    // Default banner for the social post when the employer doesn't upload their own:
    // the same "Hiring" banner used on the public Home page. Resolved to an ABSOLUTE
    // URL (via document.baseURI) so it works in the Telegram/Facebook post, not just
    // the in-dashboard preview. Employers can Replace it, or Remove it for a text-only post.
    const DEFAULT_SOCIAL_BANNER = new URL("../../assets/banners/banner-hiring.png", document.baseURI).href;
    const BLANK = {
      title: "",
      job_type: "full_time",
      experience_level: "mid",
      category_id: "",
      location_id: "",
      salary_min: "",
      salary_max: "",
      salary_currency: "USD",
      salary_period: "month",
      is_remote: false,
      working_days: "",
      working_time: "",
      map_location: "",
      description: "",
      requirements: "",
      benefits: "",
      expires_at: "",
      share_social: true,
      social_image: DEFAULT_SOCIAL_BANNER,
      screening_questions: []
    };
    function jobToForm(j, isClone) {
      var _today = new Date();
      _today.setHours(0, 0, 0, 0);
      var _rawExp = j.expires_at ? j.expires_at.split("T")[0] : "";
      var _exp = !isClone && _rawExp && new Date(_rawExp) > _today ? _rawExp : "";
      return {
        title: isClone ? "Copy of " + (j.title || "") : j.title || "",
        job_type: j.job_type || "full_time",
        experience_level: j.experience_level || "mid",
        category_id: j.category_id ? String(j.category_id) : "",
        location_id: j.location_id ? String(j.location_id) : "",
        salary_min: j.salary_min != null ? String(j.salary_min) : "",
        salary_max: j.salary_max != null ? String(j.salary_max) : "",
        salary_currency: j.salary_currency || "USD",
        salary_period: j.salary_period || "month",
        is_remote: !!j.is_remote,
        working_days: j.working_days || "",
        working_time: j.working_time || "",
        map_location: j.map_location || "",
        description: j.description || "",
        requirements: j.requirements || "",
        benefits: j.benefits || "",
        expires_at: _exp,
        share_social: j.share_social !== undefined ? !!j.share_social : true,
        social_image: j.social_image || "",
        screening_questions: (j.screening_questions || []).map(function (q) {
          return {
            id: isClone ? undefined : q.id,
            type: q.type,
            label: q.label || "",
            options: (q.options || []).slice(),
            required: q.required !== undefined ? !!q.required : true,
            knockout: !!q.knockout,
            knockout_config: q.knockout_config || {}
          };
        })
      };
    }
    const [form, setForm] = React.useState(BLANK);
    const [cats, setCats] = React.useState([]);
    const [locs, setLocs] = React.useState([]);
    const [expLevels, setExpLevels] = React.useState([]);
    const [newCat, setNewCat] = React.useState("");
    const [error, setError] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [resetKey, setResetKey] = React.useState(0);
    const [socialUploading, setSocialUploading] = React.useState(false);
    const [drafting, setDrafting] = React.useState(false);
    const [draftMsg, setDraftMsg] = React.useState("");
    React.useEffect(function () {
      if (!open) return;
      setForm(job && (mode === "edit" || mode === "clone") ? jobToForm(job, mode === "clone") : BLANK);
      setResetKey(function (k) {
        return k + 1;
      });
      setError("");
      setSaving(false);
      setDraftMsg("");
      emp.fetchCategories().then(setCats).catch(function () {});
      emp.fetchLocations().then(setLocs).catch(function () {});
      emp.fetchExperienceLevels().then(setExpLevels).catch(function () {});
    }, [open]);
    if (!open) return null;
    const set = (k, v) => setForm(f => Object.assign({}, f, {
      [k]: v
    }));
    // Screening-question builder helpers
    const SQ = form.screening_questions || [];
    const setSQ = arr => set("screening_questions", arr);
    const addQ = () => setSQ(SQ.concat([{
      type: "text",
      label: "",
      options: [],
      required: true,
      knockout: false,
      knockout_config: {}
    }]));
    const updQ = (i, patch) => setSQ(SQ.map((q, idx) => idx === i ? Object.assign({}, q, patch) : q));
    const rmQ = i => setSQ(SQ.filter((_, idx) => idx !== i));
    const KO_TYPES = {
      yes_no: 1,
      single_choice: 1,
      multi_choice: 1,
      number: 1,
      date: 1
    };
    const CHOICE_TYPES = {
      single_choice: 1,
      multi_choice: 1
    };
    // Seed a knockout rule with sensible defaults so an unchanged default (e.g. op ">=") persists.
    const defaultKO = type => type === "number" || type === "date" ? {
      op: ">="
    } : type === "yes_no" ? {
      equals: "yes"
    } : CHOICE_TYPES[type] ? {
      accept: []
    } : {};
    const draftWithAI = function () {
      if (!form.title.trim()) {
        setError(T("Enter a job title first, then draft with AI."));
        return;
      }
      setDrafting(true);
      setError("");
      setDraftMsg("");
      var lc = locs.find(function (l) {
        return String(l.id) === String(form.location_id);
      });
      var companyName = user && (user.company_name || user.company && user.company.name) || "";
      emp.aiDraftJob({
        title: form.title.trim(),
        company: companyName,
        job_type: form.job_type,
        experience_level: form.experience_level,
        location: lc ? lc.name : ""
      }).then(function (d) {
        setDrafting(false);
        setForm(function (f) {
          return Object.assign({}, f, {
            description: d.description || f.description,
            requirements: d.requirements || f.requirements,
            benefits: d.benefits || f.benefits
          });
        });
        setResetKey(function (k) {
          return k + 1;
        }); // remount RichEditors so they show the drafted content
        setDraftMsg(T("Draft added below — review and edit before posting."));
      }).catch(function (e) {
        setDrafting(false);
        setError(e && e.message || T("AI draft failed."));
      });
    };
    const onSocialImage = e => {
      var file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      setSocialUploading(true);
      setError("");
      emp.uploadJobImage(file).then(function (url) {
        set("social_image", url);
        setSocialUploading(false);
      }).catch(function (err) {
        setSocialUploading(false);
        setError(err && err.message || T("Image upload failed."));
      });
    };
    const isEdit = mode === "edit";
    const canSubmit = !isEdit || job && (job.status === "draft" || job.status === "rejected");
    const modalTitle = isEdit ? T("Edit job") : mode === "clone" ? T("Clone job") : T("Post a job");
    const isRecruiter = user && user.company_role === "recruitment";
    const submitLabel = isRecruiter ? T("Submit for approval") : T("Publish job");
    const submit = publish => {
      if (!form.title.trim()) {
        setError(T("Job title is required."));
        return;
      }
      if (form.salary_min && form.salary_max && Number(form.salary_max) < Number(form.salary_min)) {
        setError(T("Max salary must be greater than or equal to min salary."));
        return;
      }
      setError("");
      setSaving(true);
      var payload = {
        title: form.title.trim(),
        job_type: form.job_type,
        experience_level: form.experience_level || null,
        category_id: form.category_id && form.category_id !== "__new__" ? form.category_id : null,
        category_name: form.category_id === "__new__" ? newCat.trim() : "",
        location_id: form.location_id || null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        salary_currency: form.salary_currency || null,
        salary_period: form.salary_period || null,
        is_remote: !!form.is_remote,
        working_days: form.working_days || null,
        working_time: form.working_time || null,
        map_location: form.map_location || null,
        share_social: !!form.share_social,
        social_image: form.social_image || null,
        description: form.description || null,
        requirements: form.requirements || null,
        benefits: form.benefits || null,
        expires_at: form.expires_at || null,
        screening_questions: (form.screening_questions || []).filter(function (q) {
          return (q.label || "").trim();
        }).map(function (q) {
          var o = {
            type: q.type,
            label: q.label.trim(),
            required: !!q.required,
            knockout: !!q.knockout
          };
          if (q.id) o.id = q.id;
          if (CHOICE_TYPES[q.type]) o.options = q.options || [];
          if (q.knockout && KO_TYPES[q.type]) o.knockout_config = q.knockout_config || {};
          return o;
        })
      };
      var wantsPublish = publish && (!isEdit || canSubmit);

      // Save (create or update), resolving to the job id.
      var savePromise = isEdit ? emp.updateJob(job.id, payload).then(function () {
        return job.id;
      }) : emp.createJob(payload).then(function (newJob) {
        return newJob.id;
      });
      savePromise.then(function (jobId) {
        // Company admin publishing → hand off to the plan picker (publishes directly if only one plan).
        if (wantsPublish && !isRecruiter && onPublishRequest) {
          setSaving(false);
          onClose();
          onPublishRequest(jobId, T("Job published!"));
          return;
        }
        // Recruiter publishing → submit for company approval (no slot consumed yet).
        if (wantsPublish && isRecruiter) {
          return emp.submitJob(jobId).then(function () {
            setSaving(false);
            onCreated(T("Job submitted for company approval."));
            onClose();
          });
        }
        // Draft save, or edit without publishing.
        setSaving(false);
        onCreated(isEdit ? T("Job updated.") : T("Draft saved."));
        onClose();
      }).catch(function (e) {
        setSaving(false);
        setError(e && e.message || T("Could not save job."));
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        maxWidth: 560,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, modalTitle), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": T("Close"),
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxHeight: "68vh",
        overflowY: "auto"
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Job title"),
      value: form.title,
      onChange: e => set("title", e.target.value),
      placeholder: T("e.g. Senior Accountant")
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: T("Job type"),
      value: form.job_type,
      onChange: e => set("job_type", e.target.value),
      options: Object.keys(JOB_TYPE_LABELS).map(k => ({
        value: k,
        label: T(JOB_TYPE_LABELS[k])
      }))
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Experience level"),
      value: form.experience_level,
      onChange: e => set("experience_level", e.target.value),
      options: [{
        value: "",
        label: T("— Select —")
      }].concat(expLevels.map(function (l) {
        return {
          value: l.slug,
          label: l.name
        };
      }))
    })), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: T("Category"),
      value: form.category_id,
      onChange: e => set("category_id", e.target.value),
      options: [{
        value: "",
        label: T("— Select —")
      }].concat(cats.map(c => ({
        value: String(c.id),
        label: c.name
      }))).concat([{
        value: "__new__",
        label: T("+ Add a new category…")
      }])
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Location"),
      value: form.location_id,
      onChange: e => set("location_id", e.target.value),
      options: [{
        value: "",
        label: T("— Select —")
      }].concat(locs.map(l => ({
        value: String(l.id),
        label: l.name
      })))
    })), form.category_id === "__new__" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Input, {
      label: T("New category name"),
      value: newCat,
      onChange: e => setNewCat(e.target.value),
      placeholder: T("e.g. Renewable Energy")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 6,
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, I("info", 12), " Added to your job now; it appears in public category filters once an admin approves it.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Salary min"),
      type: "number",
      value: form.salary_min,
      onChange: e => set("salary_min", e.target.value),
      placeholder: "800"
    }), /*#__PURE__*/React.createElement(Input, {
      label: T("Salary max"),
      type: "number",
      value: form.salary_max,
      onChange: e => set("salary_max", e.target.value),
      placeholder: "1500"
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Currency"),
      value: form.salary_currency,
      onChange: e => set("salary_currency", e.target.value),
      options: [{
        value: "USD",
        label: "USD"
      }, {
        value: "KHR",
        label: "KHR"
      }]
    }), /*#__PURE__*/React.createElement(Select, {
      label: T("Per"),
      value: form.salary_period,
      onChange: e => set("salary_period", e.target.value),
      options: [{
        value: "hour",
        label: T("Hour")
      }, {
        value: "day",
        label: T("Day")
      }, {
        value: "month",
        label: T("Month")
      }, {
        value: "year",
        label: T("Year")
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, T("Remote-friendly")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, T("Candidates can work remotely."))), /*#__PURE__*/React.createElement(Switch, {
      checked: form.is_remote,
      onChange: v => set("is_remote", typeof v === "boolean" ? v : !form.is_remote)
    })), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: T("Working days"),
      value: form.working_days,
      onChange: e => set("working_days", e.target.value),
      placeholder: T("e.g. Monday to Friday")
    }), /*#__PURE__*/React.createElement(Input, {
      label: T("Working time"),
      value: form.working_time,
      onChange: e => set("working_time", e.target.value),
      placeholder: T("e.g. 8:00 AM – 5:00 PM")
    })), /*#__PURE__*/React.createElement(Input, {
      label: T("Location / map link (optional)"),
      value: form.map_location,
      onChange: e => set("map_location", e.target.value),
      placeholder: T("Address or Google Maps link")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, T("Share on social media")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, T("Auto-post this job to our social channels when it's published."))), /*#__PURE__*/React.createElement(Switch, {
      checked: form.share_social,
      onChange: v => set("share_social", typeof v === "boolean" ? v : !form.share_social)
    })), form.share_social && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 14px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 4
      }
    }, T("Banner image for the social post"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 400,
        color: "var(--text-muted)"
      }
    }, "(optional)")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginBottom: 10
      }
    }, "A hiring poster shared with the job (recommended ~1200 \xD7 630). Without one, a text-only post is shared."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, form.social_image ? /*#__PURE__*/React.createElement("img", {
      src: form.social_image,
      alt: T("Banner preview"),
      style: {
        width: 132,
        height: 69,
        objectFit: "cover",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
        flexShrink: 0
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: 132,
        height: 69,
        borderRadius: "var(--radius-sm)",
        border: "1px dashed var(--border-strong)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-faint)",
        flexShrink: 0
      }
    }, I("image", 22)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: socialUploading ? "not-allowed" : "pointer",
        opacity: socialUploading ? 0.5 : 1,
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)"
      }
    }, I("upload", 14), " ", socialUploading ? T("Uploading…") : form.social_image ? T("Replace image") : T("Upload image"), /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      disabled: socialUploading,
      onChange: onSocialImage,
      style: {
        display: "none"
      }
    })), form.social_image && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => set("social_image", ""),
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--danger)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        padding: 0
      }
    }, T("Remove"))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        paddingTop: 6,
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, I("sparkles", 13), " Let AI draft the description, requirements & benefits from your title."), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: I("sparkles", 15),
      disabled: drafting || !form.title.trim(),
      onClick: draftWithAI
    }, drafting ? T("Drafting…") : T("Draft with AI"))), draftMsg && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "7px 12px",
        background: "var(--success-subtle)",
        color: "var(--success)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-xs)",
        fontWeight: 600
      }
    }, draftMsg), /*#__PURE__*/React.createElement(RichEditor, {
      key: "d" + resetKey,
      label: T("Description"),
      rows: 4,
      value: form.description,
      onChange: v => set("description", v),
      placeholder: T("Describe the role and what the team does…")
    }), /*#__PURE__*/React.createElement(RichEditor, {
      key: "r" + resetKey,
      label: T("Requirements"),
      rows: 3,
      value: form.requirements,
      onChange: v => set("requirements", v),
      placeholder: T("Skills, qualifications, experience…")
    }), /*#__PURE__*/React.createElement(RichEditor, {
      key: "b" + resetKey,
      label: T("Benefits"),
      rows: 3,
      value: form.benefits,
      onChange: v => set("benefits", v),
      placeholder: T("Perks, insurance, bonuses…")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, T("Screening questions")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: I("plus", 14),
      onClick: addQ
    }, T("Add question"))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginBottom: 10
      }
    }, T("Ask applicants custom questions. A knockout question flags anyone whose answer doesn't meet the rule.")), SQ.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)"
      }
    }, T("No screening questions yet.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, SQ.map(function (q, i) {
      var is = {
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "7px 10px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        background: "var(--surface-card)",
        outline: "none"
      };
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: 12,
          background: "var(--surface-sunken)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          alignItems: "flex-start"
        }
      }, /*#__PURE__*/React.createElement("input", {
        value: q.label,
        onChange: e => updQ(i, {
          label: e.target.value
        }),
        placeholder: T("Question…"),
        maxLength: 300,
        style: Object.assign({}, is, {
          flex: 1,
          minWidth: 0
        })
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 148,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement(Select, {
        value: q.type,
        onChange: e => {
          var nt = e.target.value;
          var ko = KO_TYPES[nt] ? q.knockout : false;
          updQ(i, {
            type: nt,
            knockout: ko,
            knockout_config: ko ? defaultKO(nt) : {}
          });
        },
        options: [{
          value: "text",
          label: T("Short text")
        }, {
          value: "textarea",
          label: T("Long text")
        }, {
          value: "yes_no",
          label: T("Yes / No")
        }, {
          value: "single_choice",
          label: T("Single choice")
        }, {
          value: "multi_choice",
          label: T("Multi choice")
        }, {
          value: "number",
          label: T("Number")
        }, {
          value: "date",
          label: T("Date")
        }]
      })), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: () => rmQ(i),
        title: T("Remove"),
        style: {
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "var(--danger)",
          padding: 6,
          display: "inline-flex",
          flexShrink: 0
        }
      }, I("trash-2", 15))), CHOICE_TYPES[q.type] && /*#__PURE__*/React.createElement("input", {
        value: (q.options || []).join(", "),
        onChange: e => updQ(i, {
          options: e.target.value.split(",").map(function (s) {
            return s.trim();
          }).filter(Boolean)
        }),
        placeholder: T("Options, comma-separated (e.g. 1-2 years, 3-5 years, 5+ years)"),
        style: Object.assign({}, is, {
          marginTop: 8
        })
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginTop: 10,
          flexWrap: "wrap"
        }
      }, /*#__PURE__*/React.createElement("label", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          fontSize: "var(--text-xs)",
          color: "var(--text-body)"
        }
      }, /*#__PURE__*/React.createElement(Switch, {
        checked: !!q.required,
        onChange: v => updQ(i, {
          required: typeof v === "boolean" ? v : !q.required
        })
      }), " Required"), KO_TYPES[q.type] && /*#__PURE__*/React.createElement("label", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          fontSize: "var(--text-xs)",
          color: "var(--text-body)"
        }
      }, /*#__PURE__*/React.createElement(Switch, {
        checked: !!q.knockout,
        onChange: v => {
          var on = typeof v === "boolean" ? v : !q.knockout;
          updQ(i, {
            knockout: on,
            knockout_config: on ? defaultKO(q.type) : {}
          });
        }
      }), " Knockout")), q.knockout && KO_TYPES[q.type] && /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 10,
          padding: "8px 10px",
          background: "var(--surface-card)",
          borderRadius: "var(--radius-sm)",
          border: "1px dashed var(--border-strong)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          color: "var(--text-faint)",
          textTransform: "uppercase",
          letterSpacing: ".04em",
          marginBottom: 6
        }
      }, T("Passes when the answer…")), q.type === "number" && /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 150,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement(Select, {
        value: (q.knockout_config || {}).op || ">=",
        onChange: e => updQ(i, {
          knockout_config: Object.assign({}, q.knockout_config, {
            op: e.target.value
          })
        }),
        options: [{
          value: ">=",
          label: T("is at least (≥)")
        }, {
          value: ">",
          label: T("is more than (>)")
        }, {
          value: "==",
          label: T("equals (=)")
        }, {
          value: "<=",
          label: T("is at most (≤)")
        }, {
          value: "<",
          label: T("is less than (<)")
        }]
      })), /*#__PURE__*/React.createElement("input", {
        type: "number",
        value: (q.knockout_config || {}).value != null ? (q.knockout_config || {}).value : "",
        onChange: e => updQ(i, {
          knockout_config: Object.assign({}, q.knockout_config, {
            value: e.target.value
          })
        }),
        placeholder: "e.g. 3",
        style: is
      })), q.type === "yes_no" && /*#__PURE__*/React.createElement("div", {
        style: {
          width: 160
        }
      }, /*#__PURE__*/React.createElement(Select, {
        value: (q.knockout_config || {}).equals || "yes",
        onChange: e => updQ(i, {
          knockout_config: {
            equals: e.target.value
          }
        }),
        options: [{
          value: "yes",
          label: T("is Yes")
        }, {
          value: "no",
          label: "is No"
        }]
      })), CHOICE_TYPES[q.type] && /*#__PURE__*/React.createElement("input", {
        value: ((q.knockout_config || {}).accept || []).join(", "),
        onChange: e => updQ(i, {
          knockout_config: {
            accept: e.target.value.split(",").map(function (s) {
              return s.trim();
            }).filter(Boolean)
          }
        }),
        placeholder: T("Accepted answers, comma-separated"),
        style: is
      }), q.type === "date" && /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 150,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement(Select, {
        value: (q.knockout_config || {}).op || ">=",
        onChange: e => updQ(i, {
          knockout_config: Object.assign({}, q.knockout_config, {
            op: e.target.value
          })
        }),
        options: [{
          value: ">=",
          label: T("on / after (≥)")
        }, {
          value: "<=",
          label: T("on / before (≤)")
        }]
      })), /*#__PURE__*/React.createElement("input", {
        type: "date",
        value: (q.knockout_config || {}).value || "",
        onChange: e => updQ(i, {
          knockout_config: Object.assign({}, q.knockout_config, {
            value: e.target.value
          })
        }),
        style: is
      }))));
    }))), /*#__PURE__*/React.createElement(Input, {
      label: T("Application deadline"),
      type: "date",
      value: form.expires_at,
      onChange: e => set("expires_at", e.target.value)
    }), error && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, error)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose,
      style: {
        flex: 1
      }
    }, T("Cancel")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => submit(false),
      disabled: saving,
      style: {
        flex: 1
      }
    }, isEdit ? T("Save changes") : T("Save draft")), canSubmit && /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => submit(true),
      disabled: saving,
      style: {
        flex: 1
      }
    }, saving ? T("Saving…") : submitLabel))));
  }
  function JobViewModal({
    job,
    onClose
  }) {
    if (!job) return null;
    const JTL = {
      full_time: T("Full-time"),
      part_time: T("Part-time"),
      contract: T("Contract"),
      freelance: T("Freelance"),
      internship: T("Internship")
    };
    const fmtDate = iso => {
      if (!iso) return "—";
      var d = new Date(iso);
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    };
    const fmtSalary = j => {
      if (!j.salary_min && !j.salary_max) return T("Negotiable");
      var cur = j.salary_currency || "USD";
      var per = j.salary_period || "month";
      var range = j.salary_min && j.salary_max ? j.salary_min + " – " + j.salary_max : j.salary_min || j.salary_max;
      return cur + " " + range + " / " + per;
    };
    const Row = ({
      label,
      value
    }) => value ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 130,
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        fontWeight: 600
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, value)) : null;
    const Section = ({
      title,
      text
    }) => text ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 6
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      className: "krama-rich-body",
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.65
      },
      dangerouslySetInnerHTML: {
        __html: text
      }
    })) : null;
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: "100%",
        maxWidth: 580,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, job.title), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": T("Close"),
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "20px 22px",
        maxHeight: "70vh",
        overflowY: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(StatusBadge, {
      status: job.status
    }, statusText(job.status))), /*#__PURE__*/React.createElement(Row, {
      label: T("Job type"),
      value: JTL[job.job_type] || job.job_type
    }), /*#__PURE__*/React.createElement(Row, {
      label: T("Salary"),
      value: fmtSalary(job)
    }), /*#__PURE__*/React.createElement(Row, {
      label: T("Remote"),
      value: job.is_remote ? T("Yes") : "No"
    }), /*#__PURE__*/React.createElement(Row, {
      label: T("Working days"),
      value: job.working_days
    }), /*#__PURE__*/React.createElement(Row, {
      label: T("Working time"),
      value: job.working_time
    }), /*#__PURE__*/React.createElement(Row, {
      label: T("Location / map"),
      value: job.map_location
    }), /*#__PURE__*/React.createElement(Row, {
      label: T("Posted"),
      value: fmtDate(job.created_at)
    }), /*#__PURE__*/React.createElement(Row, {
      label: T("Deadline"),
      value: fmtDate(job.expires_at)
    }), /*#__PURE__*/React.createElement(Row, {
      label: T("Applicants"),
      value: String(job.applications_count || 0)
    }), /*#__PURE__*/React.createElement(Row, {
      label: T("Views"),
      value: String(job.views || 0)
    }), /*#__PURE__*/React.createElement(Section, {
      title: T("Description"),
      text: job.description
    }), /*#__PURE__*/React.createElement(Section, {
      title: T("Requirements"),
      text: job.requirements
    }), /*#__PURE__*/React.createElement(Section, {
      title: T("Benefits"),
      text: job.benefits
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "14px 22px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, T("Close")))));
  }

  // Reusable client-side pager — shows "Showing X–Y of Z" + Previous/Next.
  // Hidden while everything fits on one page, so it only appears once lists grow.
  function Pager({
    page,
    perPage,
    total,
    onPage,
    label
  }) {
    const pages = Math.max(1, Math.ceil(total / perPage));
    const safe = Math.min(Math.max(1, page), pages);
    if (total <= perPage) return null;
    const from = total === 0 ? 0 : (safe - 1) * perPage + 1;
    const to = Math.min(total, safe * perPage);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 22px",
        borderTop: "1px solid var(--border-subtle)",
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
      onClick: () => onPage(safe - 1)
    }, T("Previous")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: safe >= pages,
      onClick: () => onPage(safe + 1)
    }, T("Next"))));
  }
  function JobsManage({
    jobs,
    loading,
    reload,
    onPost,
    onPublish,
    sub,
    quota,
    onBilling,
    onView,
    onEdit,
    onClone,
    user
  }) {
    const [tab, setTab] = React.useState("all");
    const [msg, setMsg] = React.useState("");
    const [rejectModal, setRejectModal] = React.useState(null);
    const [rejectReason, setRejectReason] = React.useState("");
    const [boostTarget, setBoostTarget] = React.useState(null);
    const [feedOpen, setFeedOpen] = React.useState(false);
    const flash = m => {
      setMsg(m);
      setTimeout(() => setMsg(""), 3000);
    };
    const fmtDate = iso => {
      if (!iso) return "—";
      var d = new Date(iso);
      return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    };
    const featuredDaysLeft = j => {
      if (!j.featured_until) return null;
      var ms = new Date(j.featured_until) - new Date();
      return ms > 0 ? Math.ceil(ms / 86400000) : null;
    };
    const subActive = sub && sub.plan && (sub.status === "active" || sub.status === "trial");
    const q = quota || {
      used: 0,
      remaining: null,
      limit: null
    };
    const quotaFull = q.limit !== null && q.remaining <= 0;
    const isAdmin = isCompanyAdmin(user);
    const isRecruiter = user && user.company_role === "recruitment";
    const [page, setPage] = React.useState(1);
    React.useEffect(function () {
      setPage(1);
    }, [tab]);
    const JOBS_PER = 10;
    const counts = {
      all: jobs.length
    };
    ["published", "company_pending", "draft", "rejected", "closed"].forEach(s => {
      counts[s] = jobs.filter(j => j.status === s).length;
    });
    const filtered = tab === "all" ? jobs : jobs.filter(j => j.status === tab);
    const pageSafe = Math.min(Math.max(1, page), Math.max(1, Math.ceil(filtered.length / JOBS_PER)));
    const shown = filtered.slice((pageSafe - 1) * JOBS_PER, pageSafe * JOBS_PER);

    // Mobile: infinite scroll — reveal cards in batches as the user scrolls to the bottom,
    // instead of numbered pages. Desktop keeps its paginated table (uses `shown` above).
    const MOBILE_BATCH = 8;
    const [visible, setVisible] = React.useState(MOBILE_BATCH);
    React.useEffect(function () {
      setVisible(MOBILE_BATCH);
    }, [tab]);
    const mobileShown = filtered.slice(0, visible);
    const hasMore = visible < filtered.length;
    const sentinelRef = React.useRef(null);
    React.useEffect(function () {
      var el = sentinelRef.current;
      if (!el || typeof IntersectionObserver === "undefined") return;
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) setVisible(function (v) {
          return v + MOBILE_BATCH;
        });
      }, {
        rootMargin: "240px"
      });
      io.observe(el);
      return function () {
        io.disconnect();
      };
    }, [visible, filtered.length]);
    const act = (fn, m) => fn().then(function () {
      flash(m);
      reload();
    }).catch(function (e) {
      flash("Error: " + (e && e.message));
    });
    const del = j => {
      if (window.confirm('Delete "' + j.title + '"? This cannot be undone.')) act(() => emp.deleteJob(j.id), T("Job deleted."));
    };
    const doCompanyReject = () => {
      if (!rejectReason.trim()) return;
      act(() => emp.companyRejectJob(rejectModal.id, rejectReason), T("Job rejected."));
      setRejectModal(null);
      setRejectReason("");
    };

    // Per-job action buttons — shared by the desktop table row and the mobile card so they never drift.
    const jobActions = j => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      onClick: () => onView && onView(j),
      title: T("View"),
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        padding: "4px 6px",
        borderRadius: "var(--radius-sm)",
        display: "inline-flex",
        alignItems: "center"
      }
    }, I("eye", 15)), /*#__PURE__*/React.createElement("button", {
      onClick: () => onEdit && onEdit(j),
      title: T("Edit"),
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        padding: "4px 6px",
        borderRadius: "var(--radius-sm)",
        display: "inline-flex",
        alignItems: "center"
      }
    }, I("pencil", 15)), /*#__PURE__*/React.createElement("button", {
      onClick: () => onClone && onClone(j),
      title: T("Clone"),
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        padding: "4px 6px",
        borderRadius: "var(--radius-sm)",
        display: "inline-flex",
        alignItems: "center"
      }
    }, I("copy", 15)), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-block",
        width: 1,
        height: 16,
        background: "var(--border)",
        margin: "0 3px"
      }
    }), (j.status === "draft" || j.status === "rejected") && /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      onClick: () => isRecruiter ? act(() => emp.submitJob(j.id), T("Submitted for company review.")) : onPublish(j.id, T("Job published!"))
    }, isRecruiter ? T("Submit") : T("Publish")), j.status === "company_pending" && isAdmin && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      onClick: () => act(() => emp.companyApproveJob(j.id), T("Job approved and published."))
    }, T("Approve")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => {
        setRejectModal(j);
        setRejectReason("");
      }
    }, T("Reject"))), j.status === "company_pending" && isRecruiter && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--warning, #b45309)",
        padding: "0 4px"
      }
    }, T("Awaiting review")), j.status === "published" && !j.is_featured && /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("star", 13),
      onClick: () => setBoostTarget(j)
    }, T("Feature")), j.status === "published" && /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: () => act(() => emp.closeJob(j.id), T("Job closed."))
    }, T("Close")), (j.status === "draft" || j.status === "rejected" || j.status === "closed" || j.status === "company_pending") && /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => del(j)
    }, T("Delete")));

    // Status filters — shared by the desktop Tabs and the mobile scrollable pill bar.
    const TAB_DEFS = [{
      value: "all",
      label: T("All"),
      count: counts.all
    }, {
      value: "published",
      label: T("Published"),
      count: counts.published
    }, {
      value: "company_pending",
      label: isAdmin ? T("Needs approval") : T("Awaiting review"),
      count: counts.company_pending
    }, {
      value: "draft",
      label: T("Draft"),
      count: counts.draft
    }, {
      value: "rejected",
      label: T("Rejected"),
      count: counts.rejected
    }, {
      value: "closed",
      label: T("Closed"),
      count: counts.closed
    }];
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: T("Job postings"),
      sub: T("Create, submit, close, and remove your listings."),
      action: subActive && q.limit !== null ? /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "var(--text-sm)",
          color: quotaFull ? "var(--danger)" : q.used / q.limit > 0.8 ? "var(--warning, #b45309)" : "var(--text-muted)"
        }
      }, I(quotaFull ? "alert-circle" : "bar-chart-2", 15), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, q.used, "/", q.limit, " posts used"), q.remaining !== null && !quotaFull && /*#__PURE__*/React.createElement("span", null, "\xB7 ", q.remaining, " remaining")) : null
    }), isAdmin && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: I("rss", 15),
      onClick: () => setFeedOpen(true)
    }, T("Import from a job feed"))), /*#__PURE__*/React.createElement(JobFeedModal, {
      open: feedOpen,
      onClose: () => setFeedOpen(false),
      onImported: reload
    }), sub !== undefined && !subActive && (sub && sub.plan && sub.status === "pending" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--warning-subtle)",
        border: "1px solid var(--warning-border, #fcd34d)",
        borderRadius: "var(--radius-md)",
        color: "var(--warning, #b45309)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        marginBottom: 18
      }
    }, I("clock", 16), /*#__PURE__*/React.createElement("span", null, T("Payment pending admin confirmation. Job posting will be unlocked once your subscription is activated."))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--danger-subtle)",
        border: "1px solid var(--danger-border, #fca5a5)",
        borderRadius: "var(--radius-md)",
        color: "var(--danger)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        marginBottom: 18
      }
    }, I("alert-circle", 16), /*#__PURE__*/React.createElement("span", null, sub && sub.plan ? T("Your subscription has expired. Jobs are hidden from the public website.") : T("No active subscription."), " ", T("Job posting requires an active plan."), " ", /*#__PURE__*/React.createElement("button", {
      onClick: onBilling,
      style: {
        background: "none",
        border: "none",
        color: "inherit",
        fontWeight: 700,
        cursor: "pointer",
        textDecoration: "underline",
        fontFamily: "var(--font-sans)",
        fontSize: "inherit",
        padding: 0
      }
    }, T("Subscribe now →"))))), subActive && quotaFull && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--danger-subtle)",
        border: "1px solid var(--danger-border, #fca5a5)",
        borderRadius: "var(--radius-md)",
        color: "var(--danger)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        marginBottom: 18
      }
    }, I("alert-circle", 16), /*#__PURE__*/React.createElement("span", null, "Job post limit reached (", q.used, "/", q.limit, "). Close or delete an existing job, or", " ", /*#__PURE__*/React.createElement("button", {
      onClick: onBilling,
      style: {
        background: "none",
        border: "none",
        color: "inherit",
        fontWeight: 700,
        cursor: "pointer",
        textDecoration: "underline",
        fontFamily: "var(--font-sans)",
        fontSize: "inherit",
        padding: 0
      }
    }, "upgrade your plan \u2192"))), /*#__PURE__*/React.createElement("div", {
      className: "krm-jobs-tabs-desktop"
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      tabs: TAB_DEFS,
      style: {
        marginBottom: 18
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "krm-jobs-chipbar"
    }, TAB_DEFS.map(t => /*#__PURE__*/React.createElement("button", {
      key: t.value,
      type: "button",
      onClick: () => setTab(t.value),
      className: "krm-jobs-chip" + (tab === t.value ? " is-active" : "")
    }, t.label, /*#__PURE__*/React.createElement("span", {
      className: "krm-jobs-chip-count"
    }, t.count)))), msg && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--success-subtle)",
        color: "var(--success)",
        borderRadius: "var(--radius-md)",
        marginBottom: 14,
        fontWeight: 600,
        fontSize: "var(--text-sm)"
      }
    }, msg), /*#__PURE__*/React.createElement("div", {
      className: "krm-jobs-desktop"
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-table-wrap"
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "minmax(0,1.6fr) 130px 96px 80px 96px 264px",
        padding: "10px 22px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", null, T("Job title")), /*#__PURE__*/React.createElement("span", null, T("Status")), /*#__PURE__*/React.createElement("span", null, T("Applicants")), /*#__PURE__*/React.createElement("span", null, T("Views")), /*#__PURE__*/React.createElement("span", null, T("Posted")), /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, T("Actions"))), loading && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "26px 22px",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, T("Loading…")), !loading && filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "26px 22px",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, T("No jobs in this tab.")), !loading && shown.map((j, i) => /*#__PURE__*/React.createElement("div", {
      key: j.id,
      style: {
        display: "grid",
        gridTemplateColumns: "minmax(0,1.6fr) 130px 96px 80px 96px 264px",
        alignItems: "center",
        padding: "14px 22px",
        borderBottom: i < shown.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: 0
      }
    }, j.title), j.is_featured ? /*#__PURE__*/React.createElement("span", {
      style: {
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "accent"
    }, I("star", 11), " Featured", featuredDaysLeft(j) != null ? " · " + featuredDaysLeft(j) + "d left" : "")) : null), isAdmin && j.poster && j.poster.company_role === "recruitment" && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 2,
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, I("user", 11), " ", j.poster.name)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(StatusBadge, {
      status: j.status
    }, statusText(j.status))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.applications_count || 0), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.views || 0), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, fmtDate(j.created_at)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 2,
        justifyContent: "flex-end",
        alignItems: "center"
      }
    }, jobActions(j)))), !loading && /*#__PURE__*/React.createElement(Pager, {
      page: pageSafe,
      perPage: JOBS_PER,
      total: filtered.length,
      onPage: setPage,
      label: "jobs"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "krm-jobs-mobile"
    }, loading && /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "26px 22px",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, T("Loading…"))), !loading && filtered.length === 0 && /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "26px 22px",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, T("No jobs in this tab."))), !loading && filtered.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "krm-jobs-list"
    }, mobileShown.map(j => /*#__PURE__*/React.createElement("div", {
      className: "krm-jobs-card",
      key: j.id
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)",
        lineHeight: 1.3,
        minWidth: 0
      }
    }, j.title), /*#__PURE__*/React.createElement("span", {
      style: {
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(StatusBadge, {
      status: j.status
    }, statusText(j.status)))), j.is_featured ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "accent"
    }, I("star", 11), " Featured", featuredDaysLeft(j) != null ? " · " + featuredDaysLeft(j) + "d left" : "")) : null, isAdmin && j.poster && j.poster.company_role === "recruitment" && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, I("user", 11), " ", j.poster.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
        padding: "12px 0",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        marginBottom: 14
      }
    }, [{
      icon: "users",
      val: j.applications_count || 0,
      label: T("Applicants")
    }, {
      icon: "eye",
      val: j.views || 0,
      label: T("Views")
    }, {
      icon: "calendar",
      val: fmtDate(j.created_at),
      label: T("Posted")
    }].map(function (s, si) {
      return /*#__PURE__*/React.createElement("div", {
        key: si,
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--brand)",
          display: "inline-flex",
          flexShrink: 0
        }
      }, I(s.icon, 13)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: "var(--text-md)",
          color: "var(--text-strong)",
          lineHeight: 1
        }
      }, s.val)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "10px",
          color: "var(--text-faint)",
          textTransform: "uppercase",
          letterSpacing: ".05em",
          fontWeight: 600
        }
      }, s.label));
    })), /*#__PURE__*/React.createElement("div", {
      className: "krm-jobcard-foot",
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center"
      }
    }, jobActions(j))))))), hasMore && /*#__PURE__*/React.createElement("div", {
      ref: sentinelRef,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "18px 0 4px",
        color: "var(--text-faint)",
        fontSize: "var(--text-sm)"
      }
    }, I("loader", 15), " Loading more\u2026"), !hasMore && filtered.length > MOBILE_BATCH && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "16px 0 4px",
        color: "var(--text-faint)",
        fontSize: "var(--text-xs)"
      }
    }, "Showing all ", filtered.length, " jobs"))), rejectModal && /*#__PURE__*/React.createElement("div", {
      onClick: () => setRejectModal(null),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: "100%",
        maxWidth: 400,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        fontWeight: 700,
        fontSize: "var(--text-md)",
        color: "var(--text-strong)"
      }
    }, T("Reject job posting")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 12
      }
    }, T("Tell the recruiter why this job was rejected.")), /*#__PURE__*/React.createElement(Input, {
      label: T("Reason"),
      value: rejectReason,
      onChange: e => setRejectReason(e.target.value),
      placeholder: T("e.g. Job description is incomplete…")
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "14px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setRejectModal(null),
      style: {
        flex: 1
      }
    }, T("Cancel")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        background: "var(--danger)",
        flex: 1
      },
      disabled: !rejectReason.trim(),
      onClick: doCompanyReject
    }, T("Reject"))))), /*#__PURE__*/React.createElement(BoostModal, {
      job: boostTarget,
      onClose: () => setBoostTarget(null),
      onDone: m => {
        setBoostTarget(null);
        flash(m);
        reload();
      }
    }));
  }
  function TalentSearch({
    jobs,
    onGoToMessages
  }) {
    const publishedJobs = (jobs || []).filter(function (j) {
      return j.status === "published";
    });
    const [tab, setTab] = React.useState("search");
    const [kw, setKw] = React.useState("");
    const [skills, setSkills] = React.useState("");
    const [langs, setLangs] = React.useState("");
    const [results, setResults] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [pool, setPool] = React.useState(null);
    const [poolKw, setPoolKw] = React.useState("");
    const [sel, setSel] = React.useState(null);
    const [detail, setDetail] = React.useState(null);
    const [detailErr, setDetailErr] = React.useState("");
    const [msgBody, setMsgBody] = React.useState("");
    const [composing, setComposing] = React.useState(false);
    const [inviting, setInviting] = React.useState(false);
    const [inviteJob, setInviteJob] = React.useState("");
    const [inviteMsg, setInviteMsg] = React.useState("");
    const [inviteBusy, setInviteBusy] = React.useState(false);
    const [msg, setMsg] = React.useState("");
    const flash = m => {
      setMsg(m);
      setTimeout(function () {
        setMsg("");
      }, 2500);
    };
    const sendInvite = function () {
      if (!inviteJob || !sel) {
        flash("Pick a job to invite them to.");
        return;
      }
      setInviteBusy(true);
      emp.inviteCandidate(sel, inviteJob, inviteMsg).then(function (r) {
        setInviteBusy(false);
        setInviting(false);
        setInviteMsg("");
        setInviteJob("");
        flash("Invitation sent.");
        setDetail(function (d) {
          if (!d) return d;
          var jt = (publishedJobs.find(function (j) {
            return String(j.id) === String(r.job_id);
          }) || {}).title;
          var invs = (d.invitations || []).filter(function (x) {
            return x.job_id !== r.job_id;
          });
          return Object.assign({}, d, {
            invitations: invs.concat([{
              job_id: r.job_id,
              job: jt,
              status: r.status
            }])
          });
        });
      }).catch(function (e) {
        setInviteBusy(false);
        flash("Error: " + (e && e.message || "Invite failed."));
      });
    };
    const runSearch = function () {
      setLoading(true);
      emp.searchCandidates({
        keyword: kw,
        skills: skills,
        languages: langs,
        per_page: 30
      }).then(function (d) {
        setResults(d);
        setLoading(false);
      }).catch(function (e) {
        setLoading(false);
        flash(e && e.message || "Search failed. Please try again.");
      });
    };
    React.useEffect(function () {
      runSearch();
    }, []);
    const loadPool = React.useCallback(function () {
      emp.fetchTalentPool(poolKw).then(setPool).catch(function (e) {
        flash(e && e.message || "Could not load the talent pool.");
      });
    }, [poolKw]);
    React.useEffect(function () {
      if (tab !== "pool") return;
      // Debounced: this filter re-fetches on every keystroke, so typing one query used to cost a
      // dozen requests — enough to trip the candidate-search rate limit during normal typing.
      var t = setTimeout(loadPool, 300);
      return function () {
        clearTimeout(t);
      };
    }, [tab, loadPool]);
    React.useEffect(function () {
      if (!sel) {
        setDetail(null);
        setComposing(false);
        setMsgBody("");
        return;
      }
      setDetail(null);
      // Swallowing the error would leave the drawer stuck on "Loading…" with no way out. A 404 is
      // reachable in normal use: a pooled candidate can go private (or be suspended) after saving.
      setDetailErr("");
      emp.fetchCandidate(sel).then(setDetail).catch(function (e) {
        setDetailErr(e && e.message || "This candidate is no longer available.");
      });
    }, [sel]);
    const patchSaved = function (id, saved) {
      setResults(function (r) {
        return r ? Object.assign({}, r, {
          data: r.data.map(function (x) {
            return x.id === id ? Object.assign({}, x, {
              saved: saved
            }) : x;
          })
        }) : r;
      });
      setDetail(function (d) {
        return d && d.id === id ? Object.assign({}, d, {
          saved: saved
        }) : d;
      });
      if (tab === "pool") loadPool();
    };
    const toggleSave = function (c) {
      if (c.saved) {
        emp.unsaveCandidate(c.id).then(function () {
          patchSaved(c.id, false);
        }).catch(function () {});
      } else {
        emp.saveCandidate(c.id).then(function () {
          patchSaved(c.id, true);
          flash("Saved to talent pool.");
        }).catch(function () {});
      }
    };
    const sendMessage = function () {
      if (!msgBody.trim() || !sel) return;
      emp.startConversation({
        other_user_id: sel,
        message: msgBody.trim()
      }).then(function () {
        setComposing(false);
        setMsgBody("");
        if (onGoToMessages) onGoToMessages();
      }).catch(function (e) {
        flash("Error: " + (e && e.message));
      });
    };
    const stripTags = function (s) {
      return String(s == null ? "" : s).replace(/<[^>]*>/g, "");
    };
    const entryLine = function (e) {
      if (typeof e === "string") return e;
      if (e && typeof e === "object") {
        return Object.keys(e).filter(function (k) {
          return k !== "_k" && typeof e[k] !== "object" && String(e[k]).trim() !== "";
        }).map(function (k) {
          return stripTags(e[k]);
        }).join(" · ");
      }
      return "";
    };
    const Chip = function (t) {
      return /*#__PURE__*/React.createElement("span", {
        key: t,
        style: {
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-brand)",
          background: "var(--brand-subtle)",
          borderRadius: 999,
          padding: "2px 9px"
        }
      }, t);
    };
    const card = function (c) {
      return /*#__PURE__*/React.createElement("div", {
        key: c.id,
        onClick: function () {
          setSel(c.id);
        },
        style: {
          background: "var(--surface-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 14,
          boxShadow: "var(--shadow-xs)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        src: c.avatar_url,
        name: c.name || "?",
        size: 40
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0,
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: "var(--text-sm)",
          color: "var(--text-strong)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, c.name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, c.headline || "—"))), c.skills && c.skills.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: 5
        }
      }, c.skills.slice(0, 6).map(function (s) {
        return Chip(s);
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 2
        }
      }, c.has_cv && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: "var(--text-faint)",
          display: "inline-flex",
          alignItems: "center",
          gap: 3
        }
      }, I("file-text", 11), " CV"), /*#__PURE__*/React.createElement("div", {
        style: {
          marginLeft: "auto"
        },
        onClick: function (e) {
          e.stopPropagation();
          toggleSave(c);
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: c.saved ? "secondary" : "ghost",
        size: "sm",
        iconLeft: I(c.saved ? "bookmark-check" : "bookmark", 13)
      }, c.saved ? "Saved" : "Save"))));
    };
    const listData = tab === "pool" ? pool && pool.data : results && results.data;
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 18,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        margin: 0
      }
    }, "Find candidates"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-pill)",
        padding: 3
      }
    }, [{
      id: "search",
      label: "Search"
    }, {
      id: "pool",
      label: "Talent pool"
    }].map(function (t) {
      return /*#__PURE__*/React.createElement("button", {
        key: t.id,
        onClick: function () {
          setTab(t.id);
        },
        style: {
          border: "none",
          cursor: "pointer",
          borderRadius: "var(--radius-pill)",
          padding: "6px 16px",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          background: tab === t.id ? "var(--surface-card)" : "transparent",
          color: tab === t.id ? "var(--text-brand)" : "var(--text-muted)",
          boxShadow: tab === t.id ? "var(--shadow-xs)" : "none"
        }
      }, t.label);
    })), msg && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--success)",
        fontWeight: 600
      }
    }, msg)), tab === "search" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginBottom: 18,
        flexWrap: "wrap",
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 2,
        minWidth: 200
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Keyword",
      value: kw,
      onChange: function (e) {
        setKw(e.target.value);
      },
      placeholder: "name, title, summary\u2026",
      onKeyDown: function (e) {
        if (e.key === "Enter") runSearch();
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 160
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Skills",
      value: skills,
      onChange: function (e) {
        setSkills(e.target.value);
      },
      placeholder: "React, SQL",
      onKeyDown: function (e) {
        if (e.key === "Enter") runSearch();
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 140
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Languages",
      value: langs,
      onChange: function (e) {
        setLangs(e.target.value);
      },
      placeholder: "English",
      onKeyDown: function (e) {
        if (e.key === "Enter") runSearch();
      }
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("search", 15),
      onClick: runSearch
    }, "Search")) : /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 18,
        maxWidth: 320
      }
    }, /*#__PURE__*/React.createElement(Input, {
      value: poolKw,
      onChange: function (e) {
        setPoolKw(e.target.value);
      },
      placeholder: "Filter saved candidates\u2026",
      iconLeft: I("search", 15)
    })), loading && tab === "search" ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "Searching\u2026") : !listData || listData.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
      icon: I(tab === "pool" ? "bookmark" : "user-search", 28),
      title: tab === "pool" ? "No saved candidates" : "No candidates found",
      description: tab === "pool" ? "Save candidates from Search to build your talent pool." : "Try different keywords or skills."
    }) : /*#__PURE__*/React.createElement("div", null, tab === "search" && results && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginBottom: 10
      }
    }, results.total, " candidate", results.total === 1 ? "" : "s"), /*#__PURE__*/React.createElement("div", {
      className: "krm-talent-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 14
      }
    }, listData.map(function (c) {
      return card(c);
    }))), sel && /*#__PURE__*/React.createElement("div", {
      onClick: function () {
        setSel(null);
      },
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function (e) {
        e.stopPropagation();
      },
      style: {
        width: "100%",
        maxWidth: 460,
        height: "100%",
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-xl)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: detail && detail.avatar_url,
      name: detail && detail.name || "?",
      size: 44
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, detail ? detail.name : "Loading…"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, detail && detail.headline)), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: function () {
        setSel(null);
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        flex: 1
      }
    }, !detail ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: detailErr ? "var(--danger)" : "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, detailErr || "Loading…") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: detail.saved ? "secondary" : "primary",
      size: "sm",
      iconLeft: I(detail.saved ? "bookmark-check" : "bookmark", 14),
      onClick: function () {
        toggleSave(detail);
      }
    }, detail.saved ? "Saved" : "Save to pool"), detail.has_cv && /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("download", 14),
      onClick: function () {
        emp.downloadCandidateCv(detail.id).catch(function (e) {
          flash(e && e.message || "Download failed");
        });
      }
    }, "CV"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("message-square", 14),
      onClick: function () {
        setComposing(function (v) {
          return !v;
        });
      }
    }, "Message"), publishedJobs.length > 0 && /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("send", 14),
      onClick: function () {
        setInviting(function (v) {
          return !v;
        });
      }
    }, "Invite")), inviting && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em"
      }
    }, "Invite to apply"), /*#__PURE__*/React.createElement(Select, {
      value: inviteJob,
      onChange: function (e) {
        setInviteJob(e.target.value);
      },
      options: [{
        value: "",
        label: "— Select a published job —"
      }].concat(publishedJobs.map(function (j) {
        return {
          value: String(j.id),
          label: j.title
        };
      }))
    }), /*#__PURE__*/React.createElement("textarea", {
      value: inviteMsg,
      onChange: function (e) {
        setInviteMsg(e.target.value);
      },
      rows: 2,
      placeholder: "Optional message to the candidate\u2026",
      style: {
        width: "100%",
        boxSizing: "border-box",
        resize: "vertical",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "8px 11px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        background: "var(--surface-page)",
        color: "var(--text-body)",
        outline: "none"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      disabled: inviteBusy || !inviteJob,
      onClick: sendInvite
    }, inviteBusy ? "Sending…" : "Send invitation"))), detail.invitations && detail.invitations.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        marginBottom: 6
      }
    }, "Invitations sent"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, detail.invitations.map(function (iv, i) {
      var lbl = {
        sent: "Sent",
        viewed: "Viewed",
        applied: "Applied ✓",
        declined: "Declined",
        expired: "Expired"
      }[iv.status] || iv.status;
      var col = iv.status === "applied" ? "var(--success)" : iv.status === "declined" || iv.status === "expired" ? "var(--text-muted)" : "var(--text-brand)";
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          display: "flex",
          justifyContent: "space-between",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, iv.job), /*#__PURE__*/React.createElement("span", {
        style: {
          color: col,
          fontWeight: 600,
          flexShrink: 0
        }
      }, lbl));
    }))), composing && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      value: msgBody,
      onChange: function (e) {
        setMsgBody(e.target.value);
      },
      rows: 3,
      placeholder: "Write a message\u2026",
      style: {
        width: "100%",
        boxSizing: "border-box",
        resize: "vertical",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "9px 11px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        background: "var(--surface-page)",
        color: "var(--text-body)",
        outline: "none"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      disabled: !msgBody.trim(),
      onClick: sendMessage
    }, "Send message"))), (detail.email || detail.phone) && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
        fontSize: "var(--text-sm)"
      }
    }, detail.email && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-body)"
      }
    }, I("mail", 14), " ", /*#__PURE__*/React.createElement("a", {
      href: "mailto:" + detail.email,
      style: {
        color: "inherit",
        textDecoration: "none"
      }
    }, detail.email)), detail.phone && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-body)"
      }
    }, I("phone", 14), " ", detail.phone)), detail.summary && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        marginBottom: 6
      }
    }, "Summary"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, stripTags(detail.summary))), detail.skills && detail.skills.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        marginBottom: 8
      }
    }, "Skills"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6
      }
    }, detail.skills.map(function (s) {
      return Chip(entryLine(s));
    }))), detail.experience && detail.experience.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        marginBottom: 8
      }
    }, "Experience"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, detail.experience.map(function (e, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)"
        }
      }, entryLine(e));
    }))), detail.education && detail.education.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        marginBottom: 8
      }
    }, "Education"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, detail.education.map(function (e, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)"
        }
      }, entryLine(e));
    }))), detail.languages && detail.languages.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        marginBottom: 8
      }
    }, "Languages"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6
      }
    }, detail.languages.map(function (l) {
      return Chip(entryLine(l));
    }))), detail.certifications && detail.certifications.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        marginBottom: 8
      }
    }, "Certifications"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6
      }
    }, detail.certifications.map(function (c) {
      return Chip(entryLine(c));
    }))))))));
  }
  const IV_TYPE = {
    phone: "Phone",
    video: "Video",
    in_person: "In-person"
  };
  const IV_STATUS = [{
    value: "scheduled",
    label: "Scheduled"
  }, {
    value: "confirmed",
    label: "Confirmed"
  }, {
    value: "rescheduled",
    label: "Rescheduled"
  }, {
    value: "completed",
    label: "Completed"
  }, {
    value: "cancelled",
    label: "Cancelled"
  }, {
    value: "no_show",
    label: "No show"
  }];
  const SC_CRITERIA = [{
    key: "technical",
    label: "Technical skills"
  }, {
    key: "communication",
    label: "Communication"
  }, {
    key: "experience",
    label: "Experience"
  }, {
    key: "problem_solving",
    label: "Problem solving"
  }, {
    key: "culture_fit",
    label: "Culture fit"
  }];
  const SC_REC = [{
    value: "",
    label: "— Recommendation —"
  }, {
    value: "strong_hire",
    label: "Strong hire"
  }, {
    value: "hire",
    label: "Hire"
  }, {
    value: "maybe",
    label: "Maybe"
  }, {
    value: "no_hire",
    label: "No hire"
  }];
  const REC_LABEL = {
    strong_hire: "Strong hire",
    hire: "Hire",
    maybe: "Maybe",
    no_hire: "No hire"
  };
  const ivInput = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "7px 10px",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-sm)",
    color: "var(--text-body)",
    background: "var(--surface-card)",
    outline: "none"
  };
  // Interviews are stored as a naive wall-clock time (in the interview's timezone). Parse the
  // date/time components directly so the browser doesn't re-interpret them as UTC and shift them.
  const fmtWall = function (iso) {
    if (!iso) return "";
    var m = String(iso).match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (!m) return String(iso);
    var d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    return d.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  function ScorecardEditor({
    iv,
    onSaved,
    flash
  }) {
    var mine = (iv.scorecards || []).find(function (s) {
      return s.can_edit;
    });
    const [ratings, setRatings] = React.useState(mine && mine.ratings || {});
    const [rec, setRec] = React.useState(mine && mine.recommendation || "");
    const [comment, setComment] = React.useState(mine && mine.comment || "");
    const [busy, setBusy] = React.useState(false);
    var others = (iv.scorecards || []).filter(function (s) {
      return !s.can_edit;
    });
    const save = function () {
      setBusy(true);
      emp.saveScorecard(iv.id, {
        ratings: ratings,
        recommendation: rec || null,
        comment: comment || null
      }).then(function () {
        setBusy(false);
        flash(T("Scorecard saved."));
        if (onSaved) onSaved();
      }).catch(function (e) {
        setBusy(false);
        flash("Error: " + (e && e.message));
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        paddingTop: 8,
        borderTop: "1px dashed var(--border)"
      }
    }, others.map(function (s) {
      return /*#__PURE__*/React.createElement("div", {
        key: s.id,
        style: {
          fontSize: 11,
          color: "var(--text-muted)",
          marginBottom: 4
        }
      }, s.author, ": ", /*#__PURE__*/React.createElement("b", null, REC_LABEL[s.recommendation] || "—"));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 5
      }
    }, SC_CRITERIA.map(function (c) {
      return /*#__PURE__*/React.createElement("div", {
        key: c.key,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontSize: 12,
          color: "var(--text-body)"
        }
      }, c.label), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 3
        }
      }, [1, 2, 3, 4, 5].map(function (n) {
        var on = (ratings[c.key] || 0) >= n;
        return /*#__PURE__*/React.createElement("span", {
          key: n,
          onClick: function () {
            setRatings(Object.assign({}, ratings, {
              [c.key]: n
            }));
          },
          style: {
            cursor: "pointer",
            color: on ? "var(--warning)" : "var(--border-strong)",
            fontSize: 16,
            lineHeight: 1
          }
        }, "\u2605");
      })));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement(Select, {
      value: rec,
      onChange: function (e) {
        setRec(e.target.value);
      },
      options: SC_REC
    })), /*#__PURE__*/React.createElement("textarea", {
      value: comment,
      onChange: function (e) {
        setComment(e.target.value);
      },
      rows: 2,
      placeholder: T("Notes…"),
      style: Object.assign({}, ivInput, {
        marginTop: 6,
        resize: "vertical",
        background: "var(--surface-page)"
      })
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: busy,
      onClick: save
    }, busy ? T("Saving…") : T("Save scorecard"))));
  }
  function InterviewsPanel({
    appId,
    flash
  }) {
    const [list, setList] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [open, setOpen] = React.useState(false);
    const [scOpen, setScOpen] = React.useState(null);
    const IVBLANK = {
      type: "video",
      scheduled_at: "",
      duration_min: 45,
      timezone: "Asia/Phnom_Penh",
      meeting_url: "",
      location: "",
      notes: ""
    };
    const [form, setForm] = React.useState(IVBLANK);
    const [busy, setBusy] = React.useState(false);
    const set = function (k, v) {
      setForm(function (f) {
        return Object.assign({}, f, {
          [k]: v
        });
      });
    };
    const load = React.useCallback(function () {
      setLoading(true);
      emp.fetchInterviews(appId).then(function (d) {
        setList(d || []);
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }, [appId]);
    React.useEffect(function () {
      load();
    }, [load]);
    const schedule = function () {
      if (!form.scheduled_at) {
        flash(T("Pick a date & time first."));
        return;
      }
      setBusy(true);
      emp.scheduleInterview(appId, form).then(function () {
        setBusy(false);
        setOpen(false);
        setForm(IVBLANK);
        flash(T("Interview scheduled — candidate notified."));
        load();
      }).catch(function (e) {
        setBusy(false);
        flash("Error: " + (e && e.message));
      });
    };
    const setStatus = function (iv, status) {
      emp.updateInterview(iv.id, {
        status: status
      }).then(load).catch(function () {});
    };
    const del = function (iv) {
      emp.deleteInterview(iv.id).then(load).catch(function () {});
    };
    const fmt = fmtWall;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em"
      }
    }, T("Interviews")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("calendar-plus", 14),
      onClick: function () {
        setOpen(function (o) {
          return !o;
        });
      }
    }, open ? T("Close") : T("Schedule"))), open && /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: 12,
        marginBottom: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 130
      }
    }, /*#__PURE__*/React.createElement(Select, {
      value: form.type,
      onChange: function (e) {
        set("type", e.target.value);
      },
      options: [{
        value: "video",
        label: T("Video")
      }, {
        value: "phone",
        label: T("Phone call")
      }, {
        value: "in_person",
        label: T("In-person")
      }]
    })), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "5",
      value: form.duration_min,
      onChange: function (e) {
        set("duration_min", e.target.value);
      },
      title: T("Duration (minutes)"),
      style: ivInput
    })), /*#__PURE__*/React.createElement("input", {
      type: "datetime-local",
      value: form.scheduled_at,
      onChange: function (e) {
        set("scheduled_at", e.target.value);
      },
      style: ivInput
    }), form.type === "in_person" ? /*#__PURE__*/React.createElement("input", {
      value: form.location,
      onChange: function (e) {
        set("location", e.target.value);
      },
      placeholder: T("Location / address"),
      style: ivInput
    }) : /*#__PURE__*/React.createElement("input", {
      value: form.meeting_url,
      onChange: function (e) {
        set("meeting_url", e.target.value);
      },
      placeholder: T("Meeting link (https://…)"),
      style: ivInput
    }), /*#__PURE__*/React.createElement("textarea", {
      value: form.notes,
      onChange: function (e) {
        set("notes", e.target.value);
      },
      rows: 2,
      placeholder: T("Notes (optional)…"),
      style: Object.assign({}, ivInput, {
        resize: "vertical"
      })
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      disabled: busy,
      onClick: schedule
    }, busy ? T("Scheduling…") : T("Schedule interview")))), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)"
      }
    }, T("Loading…")) : list.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)"
      }
    }, T("No interviews scheduled.")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, list.map(function (iv) {
      return /*#__PURE__*/React.createElement("div", {
        key: iv.id,
        style: {
          background: "var(--surface-sunken)",
          borderRadius: "var(--radius-md)",
          padding: "10px 12px"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          color: "var(--text-brand)"
        }
      }, I(iv.type === "phone" ? "phone" : iv.type === "in_person" ? "map-pin" : "video", 14)), /*#__PURE__*/React.createElement("div", {
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
      }, fmt(iv.scheduled_at)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: "var(--text-muted)"
        }
      }, IV_TYPE[iv.type], " \xB7 ", iv.duration_min, " min", iv.timezone ? " · " + iv.timezone : "")), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 124,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement(Select, {
        value: iv.status,
        onChange: function (e) {
          setStatus(iv, e.target.value);
        },
        options: IV_STATUS
      })), /*#__PURE__*/React.createElement("button", {
        onClick: function () {
          del(iv);
        },
        title: T("Remove"),
        style: {
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "var(--danger)",
          display: "inline-flex",
          padding: 4,
          flexShrink: 0
        }
      }, I("trash-2", 14))), iv.meeting_url && /*#__PURE__*/React.createElement("a", {
        href: iv.meeting_url,
        target: "_blank",
        rel: "noopener",
        style: {
          fontSize: 12,
          color: "var(--text-brand)",
          display: "inline-block",
          marginTop: 4,
          wordBreak: "break-all"
        }
      }, iv.meeting_url), iv.location && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: "var(--text-muted)",
          marginTop: 4
        }
      }, iv.location), iv.notes && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: "var(--text-body)",
          marginTop: 4,
          whiteSpace: "pre-wrap"
        }
      }, iv.notes), /*#__PURE__*/React.createElement("button", {
        onClick: function () {
          setScOpen(scOpen === iv.id ? null : iv.id);
        },
        style: {
          marginTop: 6,
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "var(--text-brand)",
          fontWeight: 600,
          fontSize: 12,
          padding: 0
        }
      }, scOpen === iv.id ? T("Hide scorecard") : iv.scorecards && iv.scorecards.length ? "Scorecard (" + iv.scorecards.length + ")" : T("Add scorecard")), scOpen === iv.id && /*#__PURE__*/React.createElement(ScorecardEditor, {
        iv: iv,
        flash: flash,
        onSaved: load
      }));
    })));
  }
  const STAGES = [{
    key: "applied",
    label: "Applied",
    tone: "neutral"
  }, {
    key: "reviewed",
    label: "Reviewed",
    tone: "info"
  }, {
    key: "shortlisted",
    label: "Shortlisted",
    tone: "brand"
  }, {
    key: "interview",
    label: "Interview",
    tone: "warning"
  }, {
    key: "offered",
    label: "Offered",
    tone: "success"
  }, {
    key: "hired",
    label: "Hired",
    tone: "success"
  }, {
    key: "rejected",
    label: "Rejected",
    tone: "danger"
  }];
  const STLABEL = STAGES.reduce(function (m, s) {
    m[s.key] = s.label;
    return m;
  }, {});
  function Applicants({
    jobs,
    onGoToMessages
  }) {
    const reviewable = jobs.filter(j => j.status === "published" || j.status === "closed");
    const [jobId, setJobId] = React.useState("");
    const [apps, setApps] = React.useState([]); // flattened board items (each carries .stage/.tags/.notes_count)
    const [loading, setLoading] = React.useState(false);
    const [msg, setMsg] = React.useState("");
    const [dragId, setDragId] = React.useState(null);
    const [overCol, setOverCol] = React.useState("");
    const [sel, setSel] = React.useState(null); // selected card -> opens the drawer
    const [detail, setDetail] = React.useState(null); // full applicant detail (contact, cover note, notes)
    const [notes, setNotes] = React.useState([]);
    const [noteBody, setNoteBody] = React.useState("");
    const [noteBusy, setNoteBusy] = React.useState(false);
    const [editNote, setEditNote] = React.useState(null);
    const [editBody, setEditBody] = React.useState("");
    const [tagInput, setTagInput] = React.useState("");
    const [allTags, setAllTags] = React.useState([]);
    const [msgModal, setMsgModal] = React.useState(null);
    const [msgBody, setMsgBody] = React.useState("");
    const [msgSending, setMsgSending] = React.useState(false);
    const [msgErr, setMsgErr] = React.useState("");
    const flash = m => {
      setMsg(m);
      setTimeout(() => setMsg(""), 2500);
    };
    const openMessage = candidate => {
      setMsgModal({
        candidate: candidate,
        jobId: jobId
      });
      setMsgBody("");
      setMsgErr("");
    };
    const sendNewMessage = () => {
      if (!msgBody.trim() || msgSending || !msgModal) return;
      setMsgSending(true);
      setMsgErr("");
      var job = reviewable.find(j => String(j.id) === String(msgModal.jobId));
      emp.startConversation({
        other_user_id: msgModal.candidate.id,
        job_id: msgModal.jobId || null,
        subject: job ? job.title : null,
        message: msgBody.trim()
      }).then(function () {
        setMsgSending(false);
        setMsgModal(null);
        setMsgBody("");
        if (onGoToMessages) onGoToMessages();
      }).catch(function (e) {
        setMsgSending(false);
        setMsgErr(e && e.message || T("Could not send message."));
      });
    };
    React.useEffect(function () {
      if (!jobId && reviewable.length > 0) setJobId(String(reviewable[0].id));
    }, [jobs]);
    const load = React.useCallback(function () {
      if (!jobId) {
        setApps([]);
        return;
      }
      setLoading(true);
      emp.fetchJobBoard(jobId).then(function (d) {
        var b = d.board || {},
          list = [];
        STAGES.forEach(function (s) {
          (b[s.key] && b[s.key].items || []).forEach(function (it) {
            list.push(it);
          });
        });
        setApps(list);
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }, [jobId]);
    React.useEffect(function () {
      load();
    }, [load]);
    React.useEffect(function () {
      emp.fetchCompanyTags().then(setAllTags).catch(function () {});
    }, []);

    // Load full detail + notes whenever the drawer target changes.
    React.useEffect(function () {
      if (!sel) {
        setDetail(null);
        setNotes([]);
        setEditNote(null);
        setTagInput("");
        return;
      }
      setDetail(null);
      emp.fetchApplication(sel.id).then(function (d) {
        setDetail(d);
        setNotes(d.notes || []);
      }).catch(function () {});
    }, [sel && sel.id]);

    // Optimistic stage move (drag or drawer) — re-sync from the server on error.
    const move = (a, toStage) => {
      if (!a || a.stage === toStage) return;
      setApps(function (prev) {
        return prev.map(function (x) {
          return x.id === a.id ? Object.assign({}, x, {
            stage: toStage
          }) : x;
        });
      });
      setSel(function (s) {
        return s && s.id === a.id ? Object.assign({}, s, {
          stage: toStage
        }) : s;
      });
      emp.updateApplicationStage(a.id, toStage).then(function () {
        flash(T("Moved to") + " " + T(STLABEL[toStage] || toStage));
      }).catch(function (e) {
        flash("Error: " + (e && e.message));
        load();
      });
    };
    const patchCard = (id, fn) => {
      setApps(function (prev) {
        return prev.map(function (x) {
          return x.id === id ? fn(x) : x;
        });
      });
    };
    const addTag = label => {
      label = (label || "").trim();
      if (!label || !sel) return;
      emp.addAppTag(sel.id, label).then(function (t) {
        setDetail(function (d) {
          if (!d) return d;
          var tags = (d.tags || []).filter(function (z) {
            return z.label !== t.label;
          });
          return Object.assign({}, d, {
            tags: tags.concat([t])
          });
        });
        patchCard(sel.id, function (x) {
          var tags = (x.tags || []).filter(function (z) {
            return z.label !== t.label;
          });
          return Object.assign({}, x, {
            tags: tags.concat([t])
          });
        });
        setAllTags(function (a) {
          return a.indexOf(t.label) === -1 ? a.concat([t.label]).sort() : a;
        });
        setTagInput("");
      }).catch(function (e) {
        flash("Error: " + (e && e.message));
      });
    };
    const removeTag = tagId => {
      if (!sel) return;
      emp.removeAppTag(sel.id, tagId).then(function () {
        setDetail(function (d) {
          return d ? Object.assign({}, d, {
            tags: (d.tags || []).filter(function (z) {
              return z.id !== tagId;
            })
          }) : d;
        });
        patchCard(sel.id, function (x) {
          return Object.assign({}, x, {
            tags: (x.tags || []).filter(function (z) {
              return z.id !== tagId;
            })
          });
        });
      }).catch(function () {});
    };
    const bumpNotes = (id, delta) => patchCard(id, function (x) {
      return Object.assign({}, x, {
        notes_count: Math.max(0, (x.notes_count || 0) + delta)
      });
    });
    const submitNote = () => {
      var b = noteBody.trim();
      if (!b || noteBusy || !sel) return;
      setNoteBusy(true);
      emp.addAppNote(sel.id, b).then(function (n) {
        setNotes(function (a) {
          return [n].concat(a);
        });
        setNoteBody("");
        setNoteBusy(false);
        bumpNotes(sel.id, 1);
      }).catch(function (e) {
        setNoteBusy(false);
        flash("Error: " + (e && e.message));
      });
    };
    const saveEditNote = n => {
      var b = editBody.trim();
      if (!b) return;
      emp.updateAppNote(n.id, b).then(function (u) {
        setNotes(function (a) {
          return a.map(function (x) {
            return x.id === n.id ? Object.assign({}, x, {
              body: u.body,
              updated_at: u.updated_at
            }) : x;
          });
        });
        setEditNote(null);
      }).catch(function (e) {
        flash("Error: " + (e && e.message));
      });
    };
    const delNote = n => {
      emp.deleteAppNote(n.id).then(function () {
        setNotes(function (a) {
          return a.filter(function (x) {
            return x.id !== n.id;
          });
        });
        if (sel) bumpNotes(sel.id, -1);
      }).catch(function () {});
    };
    const fmtDay = d => {
      try {
        return new Date(d).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short"
        });
      } catch (e) {
        return "";
      }
    };
    const byStage = {};
    STAGES.forEach(s => {
      byStage[s.key] = [];
    });
    apps.forEach(a => {
      var k = a.stage || "applied";
      if (!byStage[k]) byStage[k] = [];
      byStage[k].push(a);
    });
    if (reviewable.length === 0) {
      return /*#__PURE__*/React.createElement("div", {
        className: "krm-page-pad",
        style: {
          padding: 28
        }
      }, /*#__PURE__*/React.createElement(EmptyState, {
        icon: I("users", 28),
        title: T("No applicants yet"),
        description: T("Publish a job to start receiving applications.")
      }));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 20,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)"
      }
    }, T("Pipeline")), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 280
      }
    }, /*#__PURE__*/React.createElement(Select, {
      value: jobId,
      onChange: e => setJobId(e.target.value),
      options: reviewable.map(j => ({
        value: String(j.id),
        label: j.title + " (" + (j.applications_count || 0) + ")"
      }))
    })), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, apps.length, " applicant", apps.length === 1 ? "" : "s"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)"
      }
    }, T("Drag a card between columns, or open it to manage.")), msg && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--success)",
        fontWeight: 600
      }
    }, msg)), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, T("Loading…")) : /*#__PURE__*/React.createElement("div", {
      className: "krm-pipeline",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(180px, 1fr))",
        gap: 12,
        alignItems: "start",
        overflowX: "auto",
        paddingBottom: 6
      }
    }, STAGES.map(s => /*#__PURE__*/React.createElement("div", {
      key: s.key,
      onDragOver: e => {
        e.preventDefault();
        if (overCol !== s.key) setOverCol(s.key);
      },
      onDragLeave: () => setOverCol(""),
      onDrop: e => {
        e.preventDefault();
        setOverCol("");
        var it = apps.find(function (x) {
          return x.id === dragId;
        });
        if (it) move(it, s.key);
        setDragId(null);
      },
      style: {
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-lg)",
        padding: 10,
        minHeight: 220,
        minWidth: 0,
        outline: overCol === s.key ? "2px dashed var(--brand)" : "none",
        outlineOffset: -2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 6px 10px"
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: s.tone
    }, T(s.label)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-muted)"
      }
    }, byStage[s.key].length)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, byStage[s.key].map(a => {
      var c = a.candidate || {};
      return /*#__PURE__*/React.createElement("div", {
        key: a.id,
        draggable: true,
        onDragStart: () => setDragId(a.id),
        onDragEnd: () => setDragId(null),
        onClick: () => setSel(a),
        style: {
          background: "var(--surface-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: 11,
          boxShadow: "var(--shadow-xs)",
          cursor: "pointer",
          opacity: dragId === a.id ? 0.5 : 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 9
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        src: c.avatar_url,
        name: c.name || "?",
        size: 32
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: "var(--text-sm)",
          color: "var(--text-strong)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, c.name || T("Candidate")), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, a.headline || ""))), a.tags && a.tags.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          marginTop: 8
        }
      }, a.tags.map(function (t) {
        return /*#__PURE__*/React.createElement("span", {
          key: t.id,
          style: {
            fontSize: 10,
            fontWeight: 600,
            color: "var(--text-brand)",
            background: "var(--brand-subtle)",
            borderRadius: 999,
            padding: "1px 7px"
          }
        }, t.label);
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 8,
          fontSize: 11,
          color: "var(--text-faint)"
        }
      }, a.flagged && /*#__PURE__*/React.createElement("span", {
        title: T("Doesn't meet a screening requirement"),
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          color: "var(--danger)",
          fontWeight: 700
        }
      }, I("alert-triangle", 11), " Flag"), a.has_cv && /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 3
        }
      }, I("file-text", 11), " CV"), a.notes_count > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 3
        }
      }, I("sticky-note", 11), " ", a.notes_count), /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: "auto"
        }
      }, fmtDay(a.created_at))));
    }), byStage[s.key].length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)",
        textAlign: "center",
        padding: "10px 0"
      }
    }, "\u2014"))))), sel && /*#__PURE__*/React.createElement("div", {
      onClick: () => setSel(null),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: "100%",
        maxWidth: 440,
        height: "100%",
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-xl)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: (sel.candidate || {}).avatar_url,
      name: (sel.candidate || {}).name || "?",
      size: 44
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, (sel.candidate || {}).name || T("Candidate")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, detail ? detail.headline || detail.candidate && detail.candidate.email || "" : T("Loading…"))), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => setSel(null)
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em"
      }
    }, T("Stage")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement(Select, {
      value: sel.stage,
      onChange: e => move(sel, e.target.value),
      options: STAGES.map(function (s) {
        return {
          value: s.key,
          label: T(s.label)
        };
      })
    }))), detail && detail.candidate && (detail.candidate.email || detail.candidate.phone) && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontSize: "var(--text-sm)"
      }
    }, detail.candidate.email && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-body)"
      }
    }, I("mail", 14), " ", /*#__PURE__*/React.createElement("a", {
      href: "mailto:" + detail.candidate.email,
      style: {
        color: "inherit",
        textDecoration: "none"
      }
    }, detail.candidate.email)), detail.candidate.phone && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-body)"
      }
    }, I("phone", 14), " ", detail.candidate.phone)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, detail && detail.has_cv ? /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: I("download", 14),
      onClick: () => emp.downloadCv(sel.id).catch(function (e) {
        flash(e && e.message || T("Download failed"));
      })
    }, T("Download CV")) : /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      disabled: true
    }, detail && detail.cv_private ? T("CV hidden") : T("No CV")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("message-square", 14),
      onClick: () => detail && detail.candidate && openMessage(detail.candidate)
    }, T("Message"))), detail && detail.cover_note && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em"
      }
    }, T("Cover note")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        whiteSpace: "pre-wrap",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px"
      }
    }, detail.cover_note)), detail && detail.answers && detail.answers.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em"
      }
    }, T("Screening answers")), detail.meets_requirements === false ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 700,
        color: "var(--danger)",
        background: "var(--danger-subtle)",
        borderRadius: 999,
        padding: "2px 9px"
      }
    }, I("alert-triangle", 11), " ", T("Doesn't meet requirements")) : /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 700,
        color: "var(--success)",
        background: "var(--success-subtle)",
        borderRadius: 999,
        padding: "2px 9px"
      }
    }, I("check", 11), " ", T("Meets requirements"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, detail.answers.map(function (a, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          background: "var(--surface-sunken)",
          borderRadius: "var(--radius-md)",
          padding: "9px 12px"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginBottom: 3
        }
      }, a.question), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          fontWeight: 600
        }
      }, a.answer), a.knockout && a.passed === true && /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          color: "var(--success)"
        },
        title: T("Meets requirement")
      }, I("check-circle", 14)), a.knockout && a.passed === false && /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          color: "var(--danger)"
        },
        title: T("Does not meet requirement")
      }, I("x-circle", 14))));
    }))), /*#__PURE__*/React.createElement(InterviewsPanel, {
      key: "iv" + sel.id,
      appId: sel.id,
      flash: flash
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em"
      }
    }, T("Tags")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8
      }
    }, (detail ? detail.tags : []).map(function (t) {
      return /*#__PURE__*/React.createElement("span", {
        key: t.id,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          color: "var(--text-brand)",
          background: "var(--brand-subtle)",
          borderRadius: 999,
          padding: "3px 4px 3px 10px"
        }
      }, t.label, /*#__PURE__*/React.createElement("button", {
        onClick: () => removeTag(t.id),
        style: {
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "var(--text-brand)",
          display: "inline-flex",
          padding: 2
        }
      }, I("x", 11)));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("input", {
      list: "krm-tag-suggestions",
      value: tagInput,
      onChange: e => setTagInput(e.target.value),
      onKeyDown: e => {
        if (e.key === "Enter") {
          e.preventDefault();
          addTag(tagInput);
        }
      },
      placeholder: T("Add a tag…"),
      maxLength: 40,
      style: {
        flex: 1,
        boxSizing: "border-box",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "7px 10px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        background: "var(--surface-page)",
        outline: "none"
      }
    }), /*#__PURE__*/React.createElement("datalist", {
      id: "krm-tag-suggestions"
    }, allTags.map(function (l) {
      return /*#__PURE__*/React.createElement("option", {
        key: l,
        value: l
      });
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: !tagInput.trim(),
      onClick: () => addTag(tagInput)
    }, T("Add")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".04em"
      }
    }, T("Private notes")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      value: noteBody,
      onChange: e => setNoteBody(e.target.value),
      rows: 2,
      placeholder: T("Add a private note (only your team can see this)…"),
      style: {
        width: "100%",
        boxSizing: "border-box",
        resize: "vertical",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "9px 11px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        background: "var(--surface-page)",
        outline: "none",
        lineHeight: 1.5
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      disabled: noteBusy || !noteBody.trim(),
      onClick: submitNote
    }, noteBusy ? T("Saving…") : T("Add note"))), notes.map(function (n) {
      return /*#__PURE__*/React.createElement("div", {
        key: n.id,
        style: {
          background: "var(--surface-sunken)",
          borderRadius: "var(--radius-md)",
          padding: "10px 12px"
        }
      }, editNote === n.id ? /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("textarea", {
        value: editBody,
        onChange: e => setEditBody(e.target.value),
        rows: 2,
        style: {
          width: "100%",
          boxSizing: "border-box",
          resize: "vertical",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "7px 9px",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          background: "var(--surface-card)",
          outline: "none"
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        size: "sm",
        onClick: () => saveEditNote(n)
      }, T("Save note")), /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        onClick: () => setEditNote(null)
      }, T("Cancel")))) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          whiteSpace: "pre-wrap"
        }
      }, n.body), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 6,
          fontSize: 11,
          color: "var(--text-faint)"
        }
      }, /*#__PURE__*/React.createElement("span", null, n.author || T("You"), " \xB7 ", fmtDay(n.created_at)), n.can_edit && /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setEditNote(n.id);
          setEditBody(n.body);
        },
        style: {
          marginLeft: "auto",
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "var(--text-brand)",
          fontWeight: 600
        }
      }, T("Edit")), n.can_edit && /*#__PURE__*/React.createElement("button", {
        onClick: () => delNote(n),
        style: {
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "var(--danger)",
          fontWeight: 600
        }
      }, T("Delete")))));
    }), notes.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)"
      }
    }, T("No notes yet."))))))), msgModal && /*#__PURE__*/React.createElement("div", {
      onClick: () => setMsgModal(null),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
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
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: msgModal.candidate.avatar_url,
      name: msgModal.candidate.name || "?",
      size: 38
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-sm)"
      }
    }, T("Message"), " ", msgModal.candidate.name || "candidate"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, msgModal.candidate.email || ""))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 18
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      value: msgBody,
      onChange: e => setMsgBody(e.target.value),
      rows: 5,
      autoFocus: true,
      placeholder: T("Write your message…"),
      onKeyDown: e => {
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
      onClick: () => setMsgModal(null)
    }, T("Cancel")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: msgSending || !msgBody.trim(),
      onClick: sendNewMessage
    }, msgSending ? T("Sending…") : T("Send message"))))));
  }

  // Shown when the employer has no company yet — lets them create one instead of
  // getting stuck on a T("Loading…") screen. After creating, the full profile appears.
  function CreateCompanyForm({
    onCreated
  }) {
    const [f, setF] = React.useState({
      name: "",
      industry: "",
      website: "",
      address: "",
      description: ""
    });
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState("");
    const set = (k, v) => setF(function (x) {
      return Object.assign({}, x, {
        [k]: v
      });
    });
    const submit = () => {
      if (!f.name.trim()) {
        setErr("Please enter your company name.");
        return;
      }
      setSaving(true);
      setErr("");
      var payload = {
        name: f.name.trim()
      };
      ["industry", "address", "description"].forEach(function (k) {
        if (f[k] && f[k].trim()) payload[k] = f[k].trim();
      });
      if (f.website && f.website.trim()) {
        var w = f.website.trim();
        payload.website = /^https?:\/\//i.test(w) ? w : "https://" + w;
      }
      emp.createCompany(payload).then(function (c) {
        setSaving(false);
        onCreated && onCreated(c);
      }).catch(function (e) {
        setSaving(false);
        setErr(e && e.message || "Could not create the company.");
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 620
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        margin: 0
      }
    }, "Create your company profile"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 6,
        marginBottom: 20
      }
    }, "Set up your company to start posting jobs. You can add a logo, photos, and more after it's created."), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Company name *",
      value: f.name,
      onChange: e => set("name", e.target.value),
      placeholder: "e.g. ACME Cambodia"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Industry",
      value: f.industry,
      onChange: e => set("industry", e.target.value),
      placeholder: "e.g. Financial services"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Website",
      value: f.website,
      onChange: e => set("website", e.target.value),
      placeholder: "example.com"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Address",
      value: f.address,
      onChange: e => set("address", e.target.value)
    }), /*#__PURE__*/React.createElement(Textarea, {
      label: "About the company",
      value: f.description,
      onChange: e => set("description", e.target.value),
      rows: 4,
      placeholder: "A short description of what your company does."
    }), err && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, err), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: saving,
      onClick: submit
    }, saving ? "Creating…" : "Create company profile"))))));
  }
  function CompanyProfile({
    company,
    onSaved,
    jobs
  }) {
    const [tab, setTab] = React.useState("about");
    // About tab
    const [form, setForm] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [logoUploading, setLogoUploading] = React.useState(false);
    const [msg, setMsg] = React.useState("");
    const [err, setErr] = React.useState("");
    const logoInputRef = React.useRef(null);
    // Gallery tab
    const [gallery, setGallery] = React.useState([]);
    const [galleryUploading, setGalleryUploading] = React.useState(false);
    const galleryInputRef = React.useRef(null);
    // Awards tab
    const [awards, setAwards] = React.useState([]);
    const [awardForm, setAwardForm] = React.useState({
      title: "",
      year: String(new Date().getFullYear()),
      description: ""
    });
    const [awardSaving, setAwardSaving] = React.useState(false);
    const [awardUploadingId, setAwardUploadingId] = React.useState(null);
    // About feature image
    const [aboutImageUrl, setAboutImageUrl] = React.useState("");
    const [aboutUploading, setAboutUploading] = React.useState(false);
    const aboutInputRef = React.useRef(null);
    // Cover banner
    const [coverBannerUrl, setCoverBannerUrl] = React.useState("");
    const [coverUploading, setCoverUploading] = React.useState(false);
    const coverInputRef = React.useRef(null);
    // Organization verification (free-plan eligibility)
    const [orgApp, setOrgApp] = React.useState({
      type: "ngo",
      reg_no: "",
      note: ""
    });
    const [orgFile, setOrgFile] = React.useState(null);
    const [orgBusy, setOrgBusy] = React.useState(false);
    const orgFileRef = React.useRef(null);
    React.useEffect(function () {
      if (company) {
        var sl = company.social_links || {};
        setForm({
          name: company.name || "",
          registration_no: company.registration_no || "",
          industry: company.industry || "",
          website: company.website || "",
          address: company.address || "",
          phone: company.phone || "",
          contact_name: company.contact_name || "",
          contact_email: company.contact_email || "",
          description: company.description || "",
          logo_url: company.logo_url || "",
          facebook_url: sl.facebook || "",
          linkedin_url: sl.linkedin || "",
          twitter_url: sl.twitter || "",
          instagram_url: sl.instagram || "",
          telegram_url: sl.telegram || "",
          company_size: company.company_size || "",
          culture_values: company.culture_values || "",
          benefits_tags: Array.isArray(company.benefits_tags) ? company.benefits_tags : [],
          vat_tin: company.vat_tin || "",
          vat_legal_name: company.vat_legal_name || "",
          vat_address: company.vat_address || ""
        });
        setAboutImageUrl(company.about_image_url || "");
        setCoverBannerUrl(company.cover_banner_url || "");
        setGallery(Array.isArray(company.gallery) ? company.gallery : []);
        setAwards(Array.isArray(company.awards) ? company.awards : []);
      }
    }, [company]);
    if (!company || !form) return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        color: "var(--text-muted)"
      }
    }, "Loading\u2026");
    const set = (k, v) => setForm(f => Object.assign({}, f, {
      [k]: v
    }));
    const flash = (m, isErr) => {
      if (isErr) {
        setErr(m);
        setTimeout(() => setErr(""), 4000);
      } else {
        setMsg(m);
        setTimeout(() => setMsg(""), 3000);
      }
    };
    const save = () => {
      setSaving(true);
      setErr("");
      setMsg("");
      var payload = {
        name: form.name,
        registration_no: form.registration_no,
        industry: form.industry,
        website: form.website,
        address: form.address,
        phone: form.phone || null,
        contact_name: form.contact_name || null,
        contact_email: form.contact_email || null,
        description: form.description,
        social_links: {
          facebook: form.facebook_url,
          linkedin: form.linkedin_url,
          twitter: form.twitter_url,
          instagram: form.instagram_url,
          telegram: form.telegram_url
        },
        company_size: form.company_size || null,
        culture_values: form.culture_values || null,
        benefits_tags: form.benefits_tags && form.benefits_tags.length ? form.benefits_tags : null,
        vat_tin: form.vat_tin || null,
        vat_legal_name: form.vat_legal_name || null,
        vat_address: form.vat_address || null
      };
      emp.updateCompany(company.id, payload).then(function (updated) {
        setSaving(false);
        flash("Profile saved.");
        onSaved && onSaved(updated);
      }).catch(function (e) {
        setSaving(false);
        flash(e && e.message || "Save failed.", true);
      });
    };
    const submitOrgApplication = () => {
      if (!orgFile) {
        flash("Please attach a proof document (PDF, JPG or PNG).", true);
        return;
      }
      setOrgBusy(true);
      setErr("");
      setMsg("");
      emp.applyAsOrganization(company.id, orgApp.type, orgApp.reg_no, orgApp.note, orgFile).then(function (res) {
        setOrgBusy(false);
        setOrgFile(null);
        if (orgFileRef.current) orgFileRef.current.value = "";
        onSaved && onSaved(Object.assign({}, company, {
          org_type: res.org_type,
          org_status: res.org_status,
          org_reg_no: res.org_reg_no,
          org_note: res.org_note,
          org_doc_url: res.org_doc_url
        }));
        flash(res.message || "Application submitted for review.");
      }).catch(function (e) {
        setOrgBusy(false);
        flash(e && e.message || "Application failed.", true);
      });
    };
    const openOrgDoc = () => {
      emp.orgDocumentUrl(company.id).then(function (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }).catch(function (e) {
        flash(e && e.message || "Could not open the document.", true);
      });
    };
    const handleLogoChange = e => {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setLogoUploading(true);
      setErr("");
      setMsg("");
      compressImage(file, 400, 0.82).then(function (compressed) {
        return emp.uploadCompanyLogo(company.id, compressed);
      }).then(function (updated) {
        setLogoUploading(false);
        set("logo_url", updated.logo_url || "");
        onSaved && onSaved(updated);
        flash("Logo updated.");
      }).catch(function (e) {
        setLogoUploading(false);
        flash(e && e.message || "Logo upload failed.", true);
      });
      e.target.value = "";
    };
    const handleGalleryUpload = e => {
      var files = e.target.files;
      if (!files || !files.length) return;
      setGalleryUploading(true);
      Promise.all(Array.from(files).map(function (file) {
        return compressImage(file, 1200, 0.85).then(function (compressed) {
          return emp.uploadGalleryPhoto(company.id, compressed);
        });
      })).then(function (results) {
        setGallery(function (g) {
          return g.concat(results);
        });
        setGalleryUploading(false);
        flash("Photo(s) uploaded.");
      }).catch(function (ex) {
        setGalleryUploading(false);
        flash(ex && ex.message || "Upload failed.", true);
      });
      e.target.value = "";
    };
    const deleteGalleryPhoto = photoId => {
      emp.deleteGalleryPhoto(company.id, photoId).then(function () {
        setGallery(function (g) {
          return g.filter(function (p) {
            return p.id !== photoId;
          });
        });
        flash("Photo removed.");
      }).catch(function (ex) {
        flash(ex && ex.message || "Failed to remove.", true);
      });
    };
    const saveCaption = (photoId, caption) => {
      emp.updateGalleryCaption(company.id, photoId, caption).then(function () {
        setGallery(function (g) {
          return g.map(function (p) {
            return p.id === photoId ? Object.assign({}, p, {
              caption: caption
            }) : p;
          });
        });
      }).catch(function (ex) {
        flash(ex && ex.message || "Failed to save caption.", true);
      });
    };
    const handleAboutImageChange = e => {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setAboutUploading(true);
      setErr("");
      setMsg("");
      compressImage(file, 1400, 0.85).then(function (compressed) {
        return emp.uploadAboutImage(company.id, compressed);
      }).then(function (updated) {
        setAboutUploading(false);
        setAboutImageUrl(updated.about_image_url || "");
        onSaved && onSaved(updated);
        flash("About image updated.");
      }).catch(function (ex) {
        setAboutUploading(false);
        flash(ex && ex.message || "Upload failed.", true);
      });
      e.target.value = "";
    };
    const handleCoverBannerChange = e => {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setCoverUploading(true);
      setErr("");
      setMsg("");
      compressImage(file, 1600, 0.85).then(function (compressed) {
        return emp.uploadCoverBanner(company.id, compressed);
      }).then(function (updated) {
        setCoverUploading(false);
        setCoverBannerUrl(updated.cover_banner_url || "");
        onSaved && onSaved(updated);
        flash("Cover banner updated.");
      }).catch(function (ex) {
        setCoverUploading(false);
        flash(ex && ex.message || "Upload failed.", true);
      });
      e.target.value = "";
    };
    const toggleBenefitTag = tag => {
      setForm(function (f) {
        var tags = f.benefits_tags || [];
        var idx = tags.indexOf(tag);
        return Object.assign({}, f, {
          benefits_tags: idx >= 0 ? tags.filter(function (t) {
            return t !== tag;
          }) : tags.concat([tag])
        });
      });
    };
    const handleAwardImageChange = (awardId, e) => {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setAwardUploadingId(awardId);
      compressImage(file, 1000, 0.85).then(function (compressed) {
        return emp.uploadAwardImage(company.id, awardId, compressed);
      }).then(function (updated) {
        setAwardUploadingId(null);
        setAwards(function (arr) {
          return arr.map(function (a) {
            return a.id === awardId ? Object.assign({}, a, {
              image_url: updated.image_url || ""
            }) : a;
          });
        });
        flash("Certificate uploaded.");
      }).catch(function (ex) {
        setAwardUploadingId(null);
        flash(ex && ex.message || "Upload failed.", true);
      });
      e.target.value = "";
    };
    const saveAward = () => {
      if (!awardForm.title.trim()) return;
      setAwardSaving(true);
      emp.createAward(company.id, {
        title: awardForm.title,
        year: awardForm.year,
        description: awardForm.description
      }).then(function (a) {
        setAwards(function (arr) {
          return arr.concat([a]);
        });
        setAwardForm({
          title: "",
          year: String(new Date().getFullYear()),
          description: ""
        });
        setAwardSaving(false);
        flash("Award added.");
      }).catch(function (ex) {
        setAwardSaving(false);
        flash(ex && ex.message || "Failed to save award.", true);
      });
    };
    const deleteAward = awardId => {
      emp.deleteAward(company.id, awardId).then(function () {
        setAwards(function (arr) {
          return arr.filter(function (a) {
            return a.id !== awardId;
          });
        });
        flash("Award removed.");
      }).catch(function (ex) {
        flash(ex && ex.message || "Failed to remove.", true);
      });
    };
    const companyJobs = jobs || [];
    const fmtDate = iso => {
      if (!iso) return "—";
      var d = new Date(iso);
      return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    };
    const TABS = [{
      value: "about",
      label: "About"
    }, {
      value: "jobs",
      label: "Jobs",
      count: companyJobs.length
    }, {
      value: "gallery",
      label: "Gallery",
      count: gallery.length || undefined
    }, {
      value: "awards",
      label: "Awards",
      count: awards.length || undefined
    }];
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        maxWidth: 1100
      }
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
      src: form.logo_url,
      name: form.name || "Company",
      square: true,
      size: 80
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => logoInputRef.current && logoInputRef.current.click(),
      disabled: logoUploading,
      style: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: "50%",
        border: "2px solid var(--surface-card)",
        background: "var(--brand)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0
      }
    }, logoUploading ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10
      }
    }, "\u2026") : I("camera", 13)), /*#__PURE__*/React.createElement("input", {
      ref: logoInputRef,
      type: "file",
      accept: "image/*",
      style: {
        display: "none"
      },
      onChange: handleLogoChange
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        margin: 0
      }
    }, form.name || "Company name"), company.is_verified ? /*#__PURE__*/React.createElement(Badge, {
      tone: "success"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      }
    }, I("badge-check", 12), " Verified")) : /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, "Unverified")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, form.industry, form.industry && form.address ? " · " : "", form.address), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginTop: 10
      }
    }, form.facebook_url && /*#__PURE__*/React.createElement("a", {
      href: form.facebook_url,
      target: "_blank",
      rel: "noopener",
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#1877f2",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none"
      }
    }, I("facebook", 15)), form.linkedin_url && /*#__PURE__*/React.createElement("a", {
      href: form.linkedin_url,
      target: "_blank",
      rel: "noopener",
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#0a66c2",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none"
      }
    }, I("linkedin", 15)), form.twitter_url && /*#__PURE__*/React.createElement("a", {
      href: form.twitter_url,
      target: "_blank",
      rel: "noopener",
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#000",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none"
      }
    }, I("twitter", 15)), form.instagram_url && /*#__PURE__*/React.createElement("a", {
      href: form.instagram_url,
      target: "_blank",
      rel: "noopener",
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none"
      }
    }, I("instagram", 15)), form.telegram_url && /*#__PURE__*/React.createElement("a", {
      href: form.telegram_url,
      target: "_blank",
      rel: "noopener",
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#229ED9",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none"
      }
    }, I("send", 15))))), err && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        marginBottom: 14
      }
    }, err), msg && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--success-subtle)",
        color: "var(--success)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        marginBottom: 14
      }
    }, msg), /*#__PURE__*/React.createElement("div", {
      className: "krm-tabs-scroll"
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      tabs: TABS,
      style: {
        marginBottom: 20
      }
    })), tab === "about" && /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Company name",
      value: form.name,
      onChange: e => set("name", e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Registration number",
      value: form.registration_no,
      onChange: e => set("registration_no", e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Industry",
      value: form.industry,
      onChange: e => set("industry", e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Website",
      value: form.website,
      onChange: e => set("website", e.target.value),
      iconLeft: I("globe", 16)
    })), /*#__PURE__*/React.createElement(Input, {
      label: "Address",
      value: form.address,
      onChange: e => set("address", e.target.value),
      iconLeft: I("map-pin", 16)
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Phone",
      value: form.phone,
      onChange: e => set("phone", e.target.value),
      iconLeft: I("phone", 16),
      placeholder: "+855 \u2026"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Contact person",
      value: form.contact_name,
      onChange: e => set("contact_name", e.target.value),
      iconLeft: I("user", 16),
      placeholder: "Full name"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Contact email",
      type: "email",
      value: form.contact_email,
      onChange: e => set("contact_email", e.target.value),
      iconLeft: I("mail", 16),
      placeholder: "hr@company.com"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        padding: "16px 18px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 4
      }
    }, I("receipt", 15), " Tax / VAT details ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500,
        color: "var(--text-faint)"
      }
    }, "\u2014 optional")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginBottom: 12
      }
    }, "Enter your ", /*#__PURE__*/React.createElement("strong", null, "VAT TIN"), " if your company is VAT-registered. Payments will then be issued as a compliant ", /*#__PURE__*/React.createElement("strong", null, "tax invoice"), " (VAT added on top) instead of a plain invoice. Leave blank if not registered."), /*#__PURE__*/React.createElement(Input, {
      label: "VAT TIN",
      value: form.vat_tin,
      onChange: e => set("vat_tin", e.target.value),
      placeholder: "e.g. K001-901234567"
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Legal name (on invoice)",
      value: form.vat_legal_name,
      onChange: e => set("vat_legal_name", e.target.value),
      placeholder: "Registered company name"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Billing address (on invoice)",
      value: form.vat_address,
      onChange: e => set("vat_address", e.target.value),
      placeholder: "Registered address"
    }))), function () {
      var st = company.org_status || "none";
      var typeLabels = {
        ngo: "NGO / non-profit",
        government: "Government",
        education: "Education",
        international: "International organization"
      };
      var head = /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
          flexWrap: "wrap"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, I("shield-check", 15), " Non-profit / organization"), st === "verified" && /*#__PURE__*/React.createElement(Badge, {
        tone: "success"
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 4
        }
      }, I("badge-check", 12), " Verified ", typeLabels[company.org_type] || "organization")), st === "pending" && /*#__PURE__*/React.createElement(Badge, {
        tone: "warning"
      }, "Under review"), st === "rejected" && /*#__PURE__*/React.createElement(Badge, {
        tone: "danger"
      }, "Not approved"));
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 4,
          padding: "16px 18px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: "var(--surface-sunken)"
        }
      }, head, st === "verified" ? /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)"
        }
      }, "Your organization is verified \u2014 you qualify for the ", /*#__PURE__*/React.createElement("strong", null, "free plan"), ". Thank you for the work you do.", company.org_doc_url && /*#__PURE__*/React.createElement("span", null, " \xB7 ", /*#__PURE__*/React.createElement("a", {
        href: "#",
        onClick: e => {
          e.preventDefault();
          openOrgDoc();
        },
        style: {
          color: "var(--text-brand)",
          fontWeight: 600,
          cursor: "pointer"
        }
      }, "View submitted document"))) : st === "pending" ? /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)"
        }
      }, "We've received your application to be verified as a ", /*#__PURE__*/React.createElement("strong", null, typeLabels[company.org_type] || "organization"), ". Our team will review it shortly \u2014 you'll be notified once it's approved.", company.org_doc_url && /*#__PURE__*/React.createElement("span", null, " \xB7 ", /*#__PURE__*/React.createElement("a", {
        href: "#",
        onClick: e => {
          e.preventDefault();
          openOrgDoc();
        },
        style: {
          color: "var(--text-brand)",
          fontWeight: 600,
          cursor: "pointer"
        }
      }, "View submitted document"))) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginBottom: 12
        }
      }, st === "rejected" ? /*#__PURE__*/React.createElement("span", null, "Your previous application wasn't approved", company.org_note ? /*#__PURE__*/React.createElement("span", null, " \u2014 ", /*#__PURE__*/React.createElement("em", null, "\u201C", company.org_note, "\u201D")) : null, ". You can submit again with clearer documentation below.") : /*#__PURE__*/React.createElement("span", null, "Registered NGOs, government bodies, schools and international organizations can post jobs for ", /*#__PURE__*/React.createElement("strong", null, "free"), ". Upload an official document (registration certificate, MoU, or letterhead) and we'll verify you.")), /*#__PURE__*/React.createElement("div", {
        className: "krm-form-grid",
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          color: "var(--text-muted)",
          marginBottom: 6
        }
      }, "Organization type"), /*#__PURE__*/React.createElement("select", {
        value: orgApp.type,
        onChange: e => setOrgApp(Object.assign({}, orgApp, {
          type: e.target.value
        })),
        style: {
          width: "100%",
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: "var(--surface-input)",
          color: "var(--text)",
          fontSize: "var(--text-sm)"
        }
      }, /*#__PURE__*/React.createElement("option", {
        value: "ngo"
      }, "NGO / non-profit"), /*#__PURE__*/React.createElement("option", {
        value: "government"
      }, "Government"), /*#__PURE__*/React.createElement("option", {
        value: "education"
      }, "Education"), /*#__PURE__*/React.createElement("option", {
        value: "international"
      }, "International organization"))), /*#__PURE__*/React.createElement(Input, {
        label: "Registration / MoU number",
        value: orgApp.reg_no,
        onChange: e => setOrgApp(Object.assign({}, orgApp, {
          reg_no: e.target.value
        })),
        placeholder: "e.g. MoI #1234"
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 12
        }
      }, /*#__PURE__*/React.createElement(Input, {
        label: "Note (optional)",
        value: orgApp.note,
        onChange: e => setOrgApp(Object.assign({}, orgApp, {
          note: e.target.value
        })),
        placeholder: "Anything that helps us verify you faster"
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 12
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          color: "var(--text-muted)",
          marginBottom: 6
        }
      }, "Proof document ", /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 400,
          color: "var(--text-faint)"
        }
      }, "\u2014 PDF, JPG or PNG, max 10MB")), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap"
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        onClick: () => orgFileRef.current && orgFileRef.current.click()
      }, I("upload", 14), " Choose file"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          color: orgFile ? "var(--text)" : "var(--text-faint)"
        }
      }, orgFile ? orgFile.name : "No file selected"), /*#__PURE__*/React.createElement("input", {
        ref: orgFileRef,
        type: "file",
        accept: ".pdf,image/*",
        style: {
          display: "none"
        },
        onChange: e => setOrgFile(e.target.files && e.target.files[0] || null)
      }))), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 14
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        size: "sm",
        disabled: orgBusy,
        onClick: submitOrgApplication
      }, orgBusy ? "Submitting…" : st === "rejected" ? "Re-submit application" : "Apply for verification"))));
    }(), /*#__PURE__*/React.createElement(RichEditor, {
      label: "About the company",
      rows: 5,
      value: form.description,
      onChange: v => set("description", v),
      placeholder: "Tell candidates about your company, culture, and mission\u2026"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 4
      }
    }, "Cover banner"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginBottom: 8
      }
    }, "Wide banner shown at the top of your company profile page. Recommended: 1600\xD7360px."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 100,
        borderRadius: "var(--radius-md)",
        border: "1px dashed var(--border-strong)",
        background: "var(--surface-sunken)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, coverBannerUrl ? /*#__PURE__*/React.createElement("img", {
      src: coverBannerUrl,
      alt: "",
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("panorama", 28))), /*#__PURE__*/React.createElement("div", {
      style: {
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: coverUploading,
      onClick: () => coverInputRef.current && coverInputRef.current.click()
    }, coverUploading ? "Uploading…" : coverBannerUrl ? "Change banner" : "Upload banner"), /*#__PURE__*/React.createElement("input", {
      ref: coverInputRef,
      type: "file",
      accept: "image/*",
      style: {
        display: "none"
      },
      onChange: handleCoverBannerChange
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "About image"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 200,
        height: 120,
        borderRadius: "var(--radius-md)",
        border: "1px dashed var(--border-strong)",
        background: "var(--surface-sunken)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }
    }, aboutImageUrl ? /*#__PURE__*/React.createElement("img", {
      src: aboutImageUrl,
      alt: "",
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("image", 28))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: aboutUploading,
      onClick: () => aboutInputRef.current && aboutInputRef.current.click()
    }, aboutUploading ? "Uploading…" : aboutImageUrl ? "Change image" : "Upload image"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 6,
        maxWidth: 260
      }
    }, "Shown at the top of your public About section. Landscape works best."), /*#__PURE__*/React.createElement("input", {
      ref: aboutInputRef,
      type: "file",
      accept: "image/*",
      style: {
        display: "none"
      },
      onChange: handleAboutImageChange
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 12
      }
    }, "Social media"), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Facebook",
      value: form.facebook_url,
      onChange: e => set("facebook_url", e.target.value),
      iconLeft: I("facebook", 16),
      placeholder: "https://facebook.com/yourpage"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "LinkedIn",
      value: form.linkedin_url,
      onChange: e => set("linkedin_url", e.target.value),
      iconLeft: I("linkedin", 16),
      placeholder: "https://linkedin.com/company/yourpage"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Twitter / X",
      value: form.twitter_url,
      onChange: e => set("twitter_url", e.target.value),
      iconLeft: I("twitter", 16),
      placeholder: "https://x.com/yourhandle"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Instagram",
      value: form.instagram_url,
      onChange: e => set("instagram_url", e.target.value),
      iconLeft: I("instagram", 16),
      placeholder: "https://instagram.com/yourpage"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Telegram",
      value: form.telegram_url,
      onChange: e => set("telegram_url", e.target.value),
      iconLeft: I("send", 16),
      placeholder: "https://t.me/yourchannel"
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Company size"), /*#__PURE__*/React.createElement("select", {
      value: form.company_size,
      onChange: e => set("company_size", e.target.value),
      style: {
        padding: "8px 12px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: "var(--surface-input)",
        color: "var(--text)",
        fontSize: "var(--text-sm)",
        minWidth: 180
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Not specified"), /*#__PURE__*/React.createElement("option", {
      value: "1-10"
    }, "1\u201310 employees"), /*#__PURE__*/React.createElement("option", {
      value: "11-50"
    }, "11\u201350 employees"), /*#__PURE__*/React.createElement("option", {
      value: "51-200"
    }, "51\u2013200 employees"), /*#__PURE__*/React.createElement("option", {
      value: "201-500"
    }, "201\u2013500 employees"), /*#__PURE__*/React.createElement("option", {
      value: "500+"
    }, "500+ employees"))), /*#__PURE__*/React.createElement(RichEditor, {
      label: "Culture & values",
      rows: 3,
      value: form.culture_values,
      onChange: v => set("culture_values", v),
      placeholder: "Describe your company culture, mission, and what makes your workplace special\u2026"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Employee benefits"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8
      }
    }, ["Health insurance", "Remote work", "Flexible hours", "Learning budget", "Annual bonus", "Stock options", "Gym membership", "Meals provided", "Transportation", "Paid leave", "Pension plan", "International travel"].map(function (tag) {
      var active = (form.benefits_tags || []).indexOf(tag) >= 0;
      return /*#__PURE__*/React.createElement("button", {
        key: tag,
        onClick: () => toggleBenefitTag(tag),
        style: {
          padding: "5px 12px",
          borderRadius: 20,
          border: "1px solid " + (active ? "var(--teal-500)" : "var(--border)"),
          background: active ? "var(--teal-subtle)" : "transparent",
          color: active ? "var(--teal-600)" : "var(--text-muted)",
          fontSize: "var(--text-sm)",
          cursor: "pointer",
          fontWeight: active ? 600 : 400,
          transition: "all .15s"
        }
      }, active && I("check", 12, {
        style: {
          marginRight: 4
        }
      }), tag);
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save,
      disabled: saving
    }, saving ? "Saving…" : "Save changes")))), tab === "jobs" && /*#__PURE__*/React.createElement("div", {
      className: "krm-table-wrap"
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Job postings"), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, companyJobs.length)), companyJobs.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px 22px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "No jobs posted yet."), companyJobs.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "krm-cojobs-scroll"
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-cojobs-row",
      style: {
        display: "grid",
        gridTemplateColumns: "1.8fr 0.9fr 0.7fr 0.7fr 0.8fr",
        padding: "10px 22px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Job title"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", null, "Applicants"), /*#__PURE__*/React.createElement("span", null, "Views"), /*#__PURE__*/React.createElement("span", null, "Posted")), companyJobs.map((j, i) => /*#__PURE__*/React.createElement("div", {
      key: j.id,
      className: "krm-cojobs-row",
      style: {
        display: "grid",
        gridTemplateColumns: "1.8fr 0.9fr 0.7fr 0.7fr 0.8fr",
        alignItems: "center",
        padding: "14px 22px",
        borderBottom: i < companyJobs.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, j.title), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(StatusBadge, {
      status: j.status
    }, statusText(j.status))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.applications_count || 0), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.views || 0), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, fmtDate(j.created_at))))))), tab === "gallery" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("image-plus", 16),
      disabled: galleryUploading,
      onClick: () => galleryInputRef.current && galleryInputRef.current.click()
    }, galleryUploading ? "Uploading…" : "Upload photos"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, "JPG, PNG up to 10 MB each. Multiple files allowed."), /*#__PURE__*/React.createElement("input", {
      ref: galleryInputRef,
      type: "file",
      accept: "image/*",
      multiple: true,
      style: {
        display: "none"
      },
      onChange: handleGalleryUpload
    })), gallery.length === 0 && /*#__PURE__*/React.createElement(Card, {
      padding: 40
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        marginBottom: 12,
        color: "var(--text-faint)"
      }
    }, I("image", 36)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        color: "var(--text-body)",
        marginBottom: 4
      }
    }, "No photos yet"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)"
      }
    }, "Upload photos to showcase your office, team, and culture."))), gallery.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 12
      }
    }, gallery.map(function (photo) {
      return /*#__PURE__*/React.createElement("div", {
        key: photo.id,
        style: {
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          background: "var(--surface-card)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: "relative",
          aspectRatio: "4/3",
          background: "var(--surface-sunken)"
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: photo.url || photo.photo_url || photo,
        alt: "",
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block"
        }
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => deleteGalleryPhoto(photo.id),
        title: "Remove",
        style: {
          position: "absolute",
          top: 6,
          right: 6,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.55)",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }, I("x", 14))), /*#__PURE__*/React.createElement("input", {
        defaultValue: photo.caption || "",
        onBlur: e => {
          if ((e.target.value || "") !== (photo.caption || "")) saveCaption(photo.id, e.target.value);
        },
        placeholder: "Add a caption\u2026",
        style: {
          width: "100%",
          border: "none",
          borderTop: "1px solid var(--border-subtle)",
          outline: "none",
          padding: "8px 10px",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          color: "var(--text-body)",
          background: "transparent",
          boxSizing: "border-box"
        }
      }));
    }))), tab === "awards" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 20
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 14,
        fontSize: "var(--text-base)"
      }
    }, "Add award or recognition"), /*#__PURE__*/React.createElement("div", {
      className: "krm-form-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 140px",
        gap: 12,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Award title",
      value: awardForm.title,
      onChange: e => setAwardForm(function (f) {
        return Object.assign({}, f, {
          title: e.target.value
        });
      }),
      placeholder: "e.g. Best Employer of the Year"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Year",
      type: "number",
      value: awardForm.year,
      onChange: e => setAwardForm(function (f) {
        return Object.assign({}, f, {
          year: e.target.value
        });
      }),
      placeholder: "2024"
    })), /*#__PURE__*/React.createElement(Textarea, {
      label: "Description (optional)",
      rows: 2,
      value: awardForm.description,
      onChange: e => setAwardForm(function (f) {
        return Object.assign({}, f, {
          description: e.target.value
        });
      }),
      placeholder: "Awarded by\u2026"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("plus", 16),
      disabled: awardSaving || !awardForm.title.trim(),
      onClick: saveAward
    }, awardSaving ? "Saving…" : "Add award"))), awards.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "28px 0",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "No awards yet. Add your first one above."), awards.length > 0 && awards.map(function (a) {
      return /*#__PURE__*/React.createElement(Card, {
        key: a.id,
        padding: 18
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 14
        }
      }, /*#__PURE__*/React.createElement("label", {
        title: "Upload certificate",
        style: {
          position: "relative",
          flexShrink: 0,
          width: 56,
          height: 56,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          cursor: awardUploadingId === a.id ? "wait" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: a.image_url ? "var(--surface-sunken)" : "var(--warning-subtle, #fef3c7)",
          color: "var(--warning, #b45309)",
          border: "1px solid var(--border)"
        }
      }, awardUploadingId === a.id ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: "var(--text-muted)"
        }
      }, "\u2026") : a.image_url ? /*#__PURE__*/React.createElement("img", {
        src: a.image_url,
        alt: "",
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block"
        }
      }) : I("trophy", 20), /*#__PURE__*/React.createElement("input", {
        type: "file",
        accept: "image/*",
        style: {
          display: "none"
        },
        onChange: e => handleAwardImageChange(a.id, e)
      })), /*#__PURE__*/React.createElement("div", {
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
      }, a.title), a.year && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginTop: 2
        }
      }, a.year), a.description && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          marginTop: 6,
          lineHeight: 1.5
        }
      }, a.description), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-faint)",
          marginTop: 6
        }
      }, a.image_url ? "Click the image to replace the certificate." : "Click the trophy to add a certificate image.")), /*#__PURE__*/React.createElement("button", {
        onClick: () => deleteAward(a.id),
        title: "Remove",
        style: {
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--text-muted)",
          display: "inline-flex",
          padding: 4,
          borderRadius: "var(--radius-sm)"
        }
      }, I("trash-2", 15))));
    })));
  }

  // Payment methods are configured by the admin (Admin Console → Payment methods), stored via API.
  const PAY_DEFAULTS = {
    khqr: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: "krama@aclb"
    },
    acleda: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: "1000-12-345678-9"
    },
    aba: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: "000 123 456"
    },
    card: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: ""
    },
    cod: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: ""
    }
  };
  const PAY_META = {
    khqr: {
      label: "KHQR",
      desc: window.KRAMA_T("Scan with any KHQR app — ABA, Wing, ACLEDA & more"),
      apiMethod: "khqr"
    },
    acleda: {
      label: "ACLEDA Bank",
      desc: "ACLEDA mobile / transfer",
      apiMethod: "acleda"
    },
    aba: {
      label: "ABA Bank",
      desc: "ABA PAY / transfer",
      apiMethod: "aba"
    },
    card: {
      label: "Card (Visa / Mastercard)",
      desc: "Pay by Visa or Mastercard",
      apiMethod: "card"
    },
    cod: {
      label: "Cash on Delivery",
      desc: "Pay in cash — invoice sent after confirmation",
      apiMethod: "cod"
    }
  };
  const SUB_STATUS_TONE = {
    pending: "warning",
    active: "success",
    trial: "brand",
    canceled: "neutral",
    expired: "danger"
  };
  // A $0 plan is a timed trial only if trial_days is explicitly set (>0); otherwise it's genuinely free forever.
  const planIsTrial = p => !!p && Number(p.price) === 0 && Number(p.trial_days) > 0;
  const planIsFree = p => !!p && Number(p.price) === 0 && !planIsTrial(p);
  const planIsCustom = p => !!p && !!p.custom_pricing;
  // The amount actually billed = the plan's discounted (effective) price. The API sends
  // effective_price/has_discount on every plan; fall back to price for older payloads.
  const planCharge = p => p && p.effective_price != null ? Number(p.effective_price) : p ? Number(p.price) : 0;
  const planHasDiscount = p => !!p && !!p.has_discount;

  // Renders a KHQR string to a QR image using the qrcodejs UMD lib (loaded on demand from the CDN).
  function KhqrCanvas({
    value,
    size
  }) {
    const ref = React.useRef(null);
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

  // Buy a CV-match credit pack — reuses the standard payment method + KHQR/Stripe flow.
  function BuyCreditsModal({
    pricing,
    onClose,
    onDone
  }) {
    const [pay, setPay] = React.useState(PAY_DEFAULTS);
    React.useEffect(function () {
      var apiBase = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : window.location.protocol + '//' + window.location.host + '/api';
      fetch(apiBase + '/settings/payment_config', {
        cache: 'no-cache'
      }).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (d) {
        if (d && d.data) {
          try {
            setPay(Object.assign({}, PAY_DEFAULTS, JSON.parse(d.data)));
          } catch (e) {}
        }
      }).catch(function () {});
    }, []);
    const available = ["cod", "khqr", "aba", "card"].filter(k => pay[k] && pay[k].enabled);
    const [method, setMethod] = React.useState(available[0] || null);
    React.useEffect(() => {
      if (!method && available.length) setMethod(available[0]);
    }, [pay]);
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState("");
    const [khqr, setKhqr] = React.useState(null);
    const [stripeUrl, setStripeUrl] = React.useState(null);
    const [paymentId, setPaymentId] = React.useState(null);
    const [waiting, setWaiting] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);
    const [notConfirmed, setNotConfirmed] = React.useState(false); // payment declined / not confirmed in time

    React.useEffect(function () {
      if (!waiting || !paymentId || done) return;
      var POLL_LIMIT = 22; // ~90s at 4s intervals before prompting the employer to retry
      var t = setInterval(function () {
        emp.verifyPayment(paymentId).then(function (r) {
          if (r && r.status === "paid") {
            setDone(true);
            setNotConfirmed(false);
            onDone && onDone();
            return;
          }
          if (r && (r.status === "failed" || r.status === "canceled" || r.status === "declined")) {
            setNotConfirmed(true);
            return;
          }
          setAttempts(function (n) {
            var next = n + 1;
            if (next >= POLL_LIMIT) setNotConfirmed(true);
            return next;
          });
        }).catch(function () {});
      }, 4000);
      return function () {
        clearInterval(t);
      };
    }, [waiting, paymentId, done]);
    const retryPayment = function () {
      var id = paymentId;
      if (!id) {
        onClose();
        return;
      }
      setNotConfirmed(false);
      setAttempts(0);
      setError("");
      if (method === "khqr") {
        setWaiting(true);
        emp.generateKhqr(id).then(function (d) {
          setKhqr(d.qr);
        }).catch(function (e) {
          setError(e && e.message || "Could not generate KHQR.");
        });
      } else if (method === "card") {
        setWaiting(true);
        emp.abaForm(id, "cards").then(abaSubmitForm).catch(function (e) {
          setError(e && e.message || "Could not start card payment.");
        });
      } else {
        setWaiting(true);
        emp.abaForm(id).then(abaSubmitForm).catch(function (e) {
          setError(e && e.message || "Could not start the payment.");
        });
      }
    };
    const start = () => {
      if (!method || busy) return;
      setBusy(true);
      setError("");
      emp.cvMatchBuyCredits().then(function (res) {
        setBusy(false);
        var id = res && res.payment && res.payment.id;
        if (!id) {
          setError("Could not start purchase.");
          return;
        }
        setPaymentId(id);
        if (method === "khqr") {
          setWaiting(true);
          emp.generateKhqr(id).then(function (d) {
            setKhqr(d.qr);
          }).catch(function (e) {
            setError(e && e.message || "Could not generate KHQR.");
          });
        } else if (method === "card") {
          setWaiting(true);
          emp.abaForm(id, "cards").then(abaSubmitForm).catch(function (e) {
            setWaiting(false);
            setError(e && e.message || "Could not start card payment.");
          });
        } else if (method === "aba") {
          setWaiting(true);
          emp.abaForm(id).then(abaSubmitForm).catch(function (e) {
            setWaiting(false);
            setError(e && e.message || "Could not start ABA payment.");
          });
        } else {
          setDone(true);
        } // cod → admin confirms; credits added on confirmation
      }).catch(function (e) {
        setBusy(false);
        setError(e && e.message || "Purchase failed.");
      });
    };
    var m = method ? PAY_META[method] : null;
    var acct = method ? pay[method] : null;
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, done ? "Purchase complete" : "Buy " + pricing.pack_size + " CV-match credits"), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "Close",
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("x", 18))), done ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "36px 28px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "var(--success-subtle)",
        color: "var(--success)"
      }
    }, I("circle-check-big", 28)), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginTop: 16
      }
    }, waiting || khqr || stripeUrl ? "Credits added!" : "Payment pending"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 8,
        lineHeight: 1.55
      }
    }, waiting || khqr || stripeUrl ? pricing.pack_size + " credits have been added to your balance." : "Your credits will be added once payment is confirmed."), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        marginTop: 20
      },
      onClick: onClose
    }, "Done")) : notConfirmed ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        border: "1px solid var(--warning-border, #fcd34d)",
        background: "var(--warning-subtle, #fef3c7)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--warning, #d97706)",
        flexShrink: 0
      }
    }, I("triangle-alert", 20)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-strong)"
      }
    }, "Your payment wasn't successful."), /*#__PURE__*/React.createElement("br", null), "Your credits ", /*#__PURE__*/React.createElement("strong", null, "haven't been added"), ". If you just completed payment it can take a moment to confirm \u2014 otherwise please try the payment again.")), error && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, error), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "I'll finish later"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      iconLeft: I("refresh-cw", 15),
      onClick: retryPayment
    }, "Try payment again"))) : khqr ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "#fff"
      }
    }, /*#__PURE__*/React.createElement(KhqrCanvas, {
      value: khqr,
      size: 200
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        textAlign: "center"
      }
    }, window.KRAMA_T("Scan with any KHQR app — ABA, Wing, ACLEDA, Chip Mong, and more. This confirms automatically once paid.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--brand)"
      }
    }), "Waiting for payment\u2026")) : waiting ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, method === "card" ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, "Complete your card payment in the Stripe window.", stripeUrl && /*#__PURE__*/React.createElement(React.Fragment, null, " ", /*#__PURE__*/React.createElement("a", {
      href: stripeUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        color: "var(--text-brand)",
        fontWeight: 600
      }
    }, "Open again \u2192"))) : acct ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 14px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.7
      }
    }, "Pay via ", /*#__PURE__*/React.createElement("strong", null, m ? m.label : "bank"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, acct.merchant), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, acct.account)) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--brand)"
      }
    }), "Waiting for payment confirmation\u2026")) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-body)"
      }
    }, pricing.pack_size, " credits"), /*#__PURE__*/React.createElement("strong", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-2xl)",
        color: "var(--text-strong)"
      }
    }, "$", pricing.pack_price)), available.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "No payment methods are enabled. Ask an admin to enable one.") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, available.map(k => {
      var meta = PAY_META[k];
      var on = method === k;
      return /*#__PURE__*/React.createElement("button", {
        key: k,
        onClick: () => setMethod(k),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          cursor: "pointer",
          textAlign: "left",
          border: "1.5px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
          background: on ? "var(--brand-subtle)" : "var(--surface-card)",
          borderRadius: "var(--radius-md)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: "var(--radius-sm)",
          background: "var(--brand-subtle)",
          color: "var(--brand)"
        }
      }, I(k === "khqr" ? "qr-code" : k === "cod" ? "banknote" : k === "card" ? "credit-card" : "landmark", 17)), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: "var(--text-sm)",
          color: "var(--text-strong)"
        }
      }, meta.label)), /*#__PURE__*/React.createElement("span", {
        style: {
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "2px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
          background: on ? "var(--brand)" : "transparent"
        }
      }));
    })), error && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, error), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      disabled: !method || busy,
      onClick: start
    }, busy ? "Starting…" : "Continue to pay"))));
  }
  function EmployerCvMatch() {
    const [cands, setCands] = React.useState([]);
    const [loadingCands, setLoadingCands] = React.useState(true);
    const [credits, setCredits] = React.useState(null); // {balance, pack_size, pack_price, currency, cost_deterministic, cost_ai, enabled}
    const [ref, setRef] = React.useState(null);
    const [engine, setEngine] = React.useState("deterministic");
    const [mode, setMode] = React.useState("suggest");
    const [targets, setTargets] = React.useState([]);
    const [q, setQ] = React.useState("");
    const [results, setResults] = React.useState(null);
    const [running, setRunning] = React.useState(false);
    const [error, setError] = React.useState("");
    const [buyOpen, setBuyOpen] = React.useState(false);
    const [history, setHistory] = React.useState([]);
    const [historyOpen, setHistoryOpen] = React.useState(false);
    const [viewingRun, setViewingRun] = React.useState(null); // {id, created_at} when re-viewing a saved run

    const loadCredits = React.useCallback(function () {
      emp.cvMatchCredits().then(setCredits).catch(function () {});
    }, []);
    const loadHistory = React.useCallback(function () {
      emp.cvMatchHistory().then(function (d) {
        setHistory(d.data || []);
      }).catch(function () {});
    }, []);
    React.useEffect(function () {
      setLoadingCands(true);
      emp.cvMatchCandidates().then(function (d) {
        setCands(d.data || []);
        setLoadingCands(false);
      }).catch(function () {
        setLoadingCands(false);
      });
      loadCredits();
      loadHistory();
    }, [loadCredits, loadHistory]);
    const fmtDate = function (s) {
      if (!s) return "";
      try {
        var d = new Date(s);
        return d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric"
        }) + " " + d.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch (e) {
        return String(s).slice(0, 16);
      }
    };
    const viewSavedRun = function (id) {
      setError("");
      setResults(null);
      setViewingRun(null);
      emp.cvMatchHistoryShow(id).then(function (d) {
        setResults(d.results || []);
        setRef({
          id: d.reference.resume_id,
          name: d.reference.name,
          headline: d.reference.headline
        });
        setEngine(d.engine === "ai" ? "ai" : "deterministic");
        setViewingRun({
          id: d.run_id,
          created_at: d.created_at
        });
        setHistoryOpen(false);
      }).catch(function (e) {
        setError(e && e.message || "Could not load saved result.");
      });
    };
    const cost = credits ? engine === "ai" ? credits.cost_ai : credits.cost_deterministic : 0;
    const balance = credits ? credits.balance : 0;
    const insufficient = credits && balance < cost;
    const scoreColor = s => s >= 60 ? "var(--success)" : s >= 35 ? "var(--warning)" : "var(--danger)";
    const toggleTarget = id => setTargets(function (t) {
      return t.includes(id) ? t.filter(x => x !== id) : t.concat(id);
    });
    const filtered = cands.filter(function (r) {
      var n = (r.candidate && r.candidate.name || "") + " " + (r.headline || "");
      return !q || n.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    });
    const CANDS_PER = 8;
    const [candPage, setCandPage] = React.useState(1);
    React.useEffect(function () {
      setCandPage(1);
    }, [q]);
    const candPageSafe = Math.min(Math.max(1, candPage), Math.max(1, Math.ceil(filtered.length / CANDS_PER)));
    const candsShown = filtered.slice((candPageSafe - 1) * CANDS_PER, candPageSafe * CANDS_PER);
    const HIST_PER = 8;
    const [histPage, setHistPage] = React.useState(1);
    const histPageSafe = Math.min(Math.max(1, histPage), Math.max(1, Math.ceil(history.length / HIST_PER)));
    const histShown = history.slice((histPageSafe - 1) * HIST_PER, histPageSafe * HIST_PER);
    const run = () => {
      if (!ref || running) return;
      if (insufficient) {
        setBuyOpen(true);
        return;
      }
      setRunning(true);
      setError("");
      setResults(null);
      setViewingRun(null);
      var payload = {
        reference_id: ref.id,
        engine: engine,
        mode: mode
      };
      if (mode === "compare") payload.target_ids = targets;else payload.limit = 3;
      emp.cvMatchRun(payload).then(function (d) {
        setResults(d.results || []);
        setCredits(function (c) {
          return c ? Object.assign({}, c, {
            balance: d.balance
          }) : c;
        });
        setRunning(false);
        loadHistory();
      }).catch(function (e) {
        setRunning(false);
        if (e && e.need_credits) {
          setBuyOpen(true);
        } else setError(e && e.message || "Match failed.");
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        maxWidth: 1000
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 20,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-2xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "CV Match"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4,
        maxWidth: 620
      }
    }, "Rank your applicants against a reference CV. Standard matching is instant; AI matching adds Claude's semantic scoring. Each comparison spends credits.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)"
      }
    }, I("coins", 16), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, balance), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, "credits")), /*#__PURE__*/React.createElement(Button, {
      variant: historyOpen ? "primary" : "secondary",
      size: "sm",
      iconLeft: I("history", 15),
      onClick: () => setHistoryOpen(function (v) {
        return !v;
      })
    }, "History", history.length ? " (" + history.length + ")" : ""), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: I("plus", 15),
      onClick: () => setBuyOpen(true)
    }, "Buy credits"))), historyOpen && /*#__PURE__*/React.createElement(Card, {
      padding: 0,
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 18px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Match history"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, "Re-viewing a saved result is free.")), history.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "No past matches yet. Runs you make are saved here."), histShown.map(function (h, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: h.id,
        style: {
          display: "grid",
          gridTemplateColumns: "1.6fr 90px 1fr 90px 100px",
          alignItems: "center",
          gap: 10,
          padding: "11px 18px",
          borderBottom: i < histShown.length - 1 ? "1px solid var(--border-subtle)" : "none"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: "var(--text-strong)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, h.reference_name || "Reference"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-faint)"
        }
      }, fmtDate(h.created_at), " \xB7 ", h.candidate_count, " candidate", h.candidate_count === 1 ? "" : "s")), /*#__PURE__*/React.createElement(Badge, {
        tone: h.engine === "ai" ? "brand" : "neutral"
      }, h.engine === "ai" ? "AI" : "Standard"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)"
        }
      }, h.mode === "suggest" ? "Auto-suggest" : "Compare"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 16,
          color: scoreColor(h.top_score || 0)
        }
      }, h.top_score != null ? h.top_score + "%" : "—"), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: "right"
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        onClick: () => viewSavedRun(h.id)
      }, "View")));
    }), /*#__PURE__*/React.createElement(Pager, {
      page: histPageSafe,
      perPage: HIST_PER,
      total: history.length,
      onPage: setHistPage,
      label: "runs"
    })), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 10
      }
    }, "1 \xB7 Reference CV"), ref ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        border: "1px solid var(--brand)",
        background: "var(--brand-subtle)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: ref.name,
      size: 34
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, ref.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, ref.headline || "—")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => {
        setRef(null);
        setResults(null);
      }
    }, "Change")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Pick one of your applicants below as the reference.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        marginBottom: 12,
        flexWrap: "wrap",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, [["deterministic", "Standard"], ["ai", "AI ⚡"]].map(function (p) {
      var id = p[0],
        label = p[1];
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: () => {
          setEngine(id);
          setResults(null);
        },
        style: {
          height: 34,
          padding: "0 14px",
          borderRadius: "var(--radius-pill)",
          cursor: "pointer",
          border: "1px solid " + (engine === id ? "var(--brand)" : "var(--border-strong)"),
          background: engine === id ? "var(--brand-subtle)" : "var(--surface-card)",
          color: engine === id ? "var(--text-brand)" : "var(--text-body)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: 600
        }
      }, label);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, [["suggest", "Auto-suggest top 3"], ["compare", "Compare selected"]].map(function (p) {
      var id = p[0],
        label = p[1];
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: () => {
          setMode(id);
          setResults(null);
        },
        style: {
          height: 34,
          padding: "0 14px",
          borderRadius: "var(--radius-pill)",
          cursor: "pointer",
          border: "1px solid " + (mode === id ? "var(--brand)" : "var(--border-strong)"),
          background: mode === id ? "var(--brand-subtle)" : "var(--surface-card)",
          color: mode === id ? "var(--text-brand)" : "var(--text-body)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: 600
        }
      }, label);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 34,
        padding: "0 12px",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        width: 220,
        marginLeft: "auto"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("search", 15)), /*#__PURE__*/React.createElement("input", {
      placeholder: "Search applicants",
      value: q,
      onChange: e => setQ(e.target.value),
      style: {
        border: "none",
        outline: "none",
        flex: 1,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        background: "transparent"
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "krm-table-wrap"
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 0,
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "2fr 2fr 70px 180px",
        padding: "10px 18px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Applicant"), /*#__PURE__*/React.createElement("span", null, "Headline"), /*#__PURE__*/React.createElement("span", null, "Skills"), /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "Action")), loadingCands && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "Loading\u2026"), !loadingCands && filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "No applicant r\xE9sum\xE9s yet. Candidates who apply to your jobs appear here."), !loadingCands && candsShown.map(function (r, i) {
      var c = r.candidate || {};
      var isRef = ref && ref.id === r.id;
      var isTarget = targets.includes(r.id);
      return /*#__PURE__*/React.createElement("div", {
        key: r.id,
        style: {
          display: "grid",
          gridTemplateColumns: "2fr 2fr 70px 180px",
          alignItems: "center",
          padding: "12px 18px",
          borderBottom: i < candsShown.length - 1 ? "1px solid var(--border-subtle)" : "none",
          background: isRef ? "var(--brand-subtle)" : "transparent"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: c.name,
        size: 30
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: "var(--text-strong)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, c.name)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, r.headline || "—"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          color: "var(--text-body)"
        }
      }, r.skills), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          justifyContent: "flex-end"
        }
      }, isRef ? /*#__PURE__*/React.createElement(Badge, {
        tone: "brand"
      }, "Reference") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        onClick: () => {
          setRef({
            id: r.id,
            name: c.name,
            headline: r.headline
          });
          setResults(null);
        }
      }, "Set ref"), mode === "compare" && /*#__PURE__*/React.createElement(Button, {
        variant: isTarget ? "primary" : "ghost",
        size: "sm",
        onClick: () => toggleTarget(r.id)
      }, isTarget ? "✓" : "Add"))));
    }), !loadingCands && /*#__PURE__*/React.createElement(Pager, {
      page: candPageSafe,
      perPage: CANDS_PER,
      total: filtered.length,
      onPage: setCandPage,
      label: "applicants"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: !ref || running || mode === "compare" && targets.length === 0,
      onClick: run
    }, running ? "Matching…" : insufficient ? "Buy credits to run (" + cost + " needed)" : (engine === "ai" ? "Run AI match" : "Run match") + " · " + cost + " credit" + (cost === 1 ? "" : "s")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Balance: ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: insufficient ? "var(--danger)" : "var(--text-body)"
      }
    }, balance), mode === "compare" && targets.length > 0 ? " · " + targets.length + " selected" : ""), error && /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-sm)"
      }
    }, error)), results && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Results", engine === "ai" ? " (AI)" : "", " \u2014 ranked by match", ref ? " against " + ref.name : ""), viewingRun && /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, I("history", 12), " Saved \xB7 ", fmtDate(viewingRun.created_at), " \xB7 free")), results.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "No matches found."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, results.map(function (r, idx) {
      return /*#__PURE__*/React.createElement(Card, {
        key: r.resume_id,
        padding: 18
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 14
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 20,
          color: "var(--text-faint)",
          width: 24,
          textAlign: "center"
        }
      }, idx + 1), /*#__PURE__*/React.createElement(Avatar, {
        name: r.candidate.name,
        size: 40
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, r.candidate.name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)"
        }
      }, r.headline || "—")), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: "right"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 24,
          color: scoreColor(r.score)
        }
      }, r.score, "%"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-faint)"
        }
      }, "match"))), /*#__PURE__*/React.createElement("div", {
        style: {
          height: 6,
          background: "var(--surface-sunken)",
          borderRadius: 3,
          overflow: "hidden",
          margin: "12px 0"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: "100%",
          width: r.score + "%",
          background: scoreColor(r.score),
          borderRadius: 3
        }
      })), r.breakdown && r.breakdown.reason ? /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          marginBottom: 8,
          fontStyle: "italic"
        }
      }, r.breakdown.reason) : null, r.breakdown && r.breakdown.matched_skills && r.breakdown.matched_skills.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 6
        }
      }, r.breakdown.matched_skills.map(function (s, i) {
        return /*#__PURE__*/React.createElement("span", {
          key: i,
          style: {
            fontSize: "var(--text-xs)",
            padding: "2px 8px",
            borderRadius: "var(--radius-pill)",
            background: "var(--success-subtle)",
            color: "var(--success)",
            fontWeight: 600
          }
        }, s);
      })), r.breakdown && r.breakdown.missing_skills && r.breakdown.missing_skills.length > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-faint)"
        }
      }, "Missing:"), r.breakdown.missing_skills.map(function (s, i) {
        return /*#__PURE__*/React.createElement("span", {
          key: i,
          style: {
            fontSize: "var(--text-xs)",
            padding: "2px 8px",
            borderRadius: "var(--radius-pill)",
            background: "var(--surface-sunken)",
            color: "var(--text-muted)"
          }
        }, s);
      })));
    }))), buyOpen && credits && /*#__PURE__*/React.createElement(BuyCreditsModal, {
      pricing: credits,
      onClose: () => setBuyOpen(false),
      onDone: function () {
        loadCredits();
      }
    }));
  }
  function CheckoutModal({
    plan,
    onClose,
    onPaid
  }) {
    const planFeatures = function (p) {
      return Array.isArray(p.features_json) ? p.features_json : Array.isArray(p.features) ? p.features : [];
    };
    const isTrial = planIsTrial(plan);
    const isFree = planIsFree(plan);
    const [pay, setPay] = React.useState(PAY_DEFAULTS);
    React.useEffect(function () {
      var apiBase = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : window.location.protocol + '//' + window.location.host + '/api';
      fetch(apiBase + '/settings/payment_config', {
        cache: 'no-cache'
      }).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (d) {
        if (d && d.data) {
          try {
            setPay(Object.assign({}, PAY_DEFAULTS, JSON.parse(d.data)));
          } catch (e) {}
        }
      }).catch(function () {});
    }, []);
    const trialDays = plan ? plan.trial_days || 7 : 7;
    // ACLEDA hidden for now (no gateway/API docs yet) — add "acleda" back to this list to restore it.
    const available = ["cod", "khqr", "aba", "card"].filter(k => pay[k] && pay[k].enabled);
    const [method, setMethod] = React.useState(available[0] || null);
    const [done, setDone] = React.useState(false);
    const [error, setError] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [khqr, setKhqr] = React.useState(null);
    const [stripeUrl, setStripeUrl] = React.useState(null);
    const [paymentId, setPaymentId] = React.useState(null);
    const [waiting, setWaiting] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);
    const [notConfirmed, setNotConfirmed] = React.useState(false); // payment declined / not confirmed in time
    const [currency, setCurrency] = React.useState("USD"); // billing currency: USD or KHR
    const [fxRate, setFxRate] = React.useState(null); // NBC USD→KHR rate for the riel option
    // Promo coupon — validated server-side; couponResult holds {code,label,discount,new_charge,credits,free_days}.
    const [couponInput, setCouponInput] = React.useState("");
    const [couponResult, setCouponResult] = React.useState(null);
    const [couponErr, setCouponErr] = React.useState("");
    const [couponBusy, setCouponBusy] = React.useState(false);
    React.useEffect(() => {
      if (plan) {
        setDone(false);
        setMethod(available[0] || null);
        setError("");
        setKhqr(null);
        setStripeUrl(null);
        setPaymentId(null);
        setWaiting(false);
        setAttempts(0);
        setNotConfirmed(false);
        setCurrency("USD");
        setCouponInput("");
        setCouponResult(null);
        setCouponErr("");
        setCouponBusy(false);
      }
    }, [plan]);
    const applyCoupon = function () {
      var code = (couponInput || "").trim();
      if (!code || couponBusy) return;
      setCouponBusy(true);
      setCouponErr("");
      emp.validateCoupon(plan.id, code).then(function (r) {
        setCouponBusy(false);
        setCouponResult(r);
      }).catch(function (e) {
        setCouponBusy(false);
        setCouponResult(null);
        setCouponErr(e && e.message || "This coupon can't be applied.");
      });
    };
    const removeCoupon = function () {
      setCouponResult(null);
      setCouponInput("");
      setCouponErr("");
    };
    // Pre-apply a personal referral reward (welcome discount / referrer thank-you) if the employer
    // has one waiting — surfaced automatically, no code to type. They can still remove or replace it.
    React.useEffect(function () {
      if (!plan || isTrial || isFree) return;
      emp.couponAvailable(plan.id).then(function (r) {
        if (r && r.available) {
          setCouponResult(r);
          setCouponInput(r.code || "");
        }
      }).catch(function () {});
    }, [plan]);

    // Fetch the official NBC USD→KHR rate once so the employer can pay in riel. If it can't be
    // reached the KHR option is simply hidden and checkout stays USD-only.
    React.useEffect(function () {
      emp.exchangeRate().then(function (d) {
        if (d && d.rate) setFxRate(Number(d.rate));
      }).catch(function () {});
    }, []);
    const khrOf = function (usd) {
      return fxRate ? Math.round(Number(usd) * fxRate) : null;
    };

    // While awaiting a gateway payment (KHQR/Bakong, ABA, or Stripe card), poll the backend
    // which verifies the payment against the gateway and fulfills it on confirmation. If the
    // gateway reports the payment failed/canceled, or it isn't confirmed within ~90s, surface
    // a clear "payment not successful — try again" state instead of waiting forever.
    React.useEffect(function () {
      if (!waiting || !paymentId || done) return;
      var POLL_LIMIT = 22; // ~90s at 4s intervals before prompting the employer to retry
      var t = setInterval(function () {
        emp.verifyPayment(paymentId).then(function (r) {
          if (r && r.status === "paid") {
            setDone(true);
            setNotConfirmed(false);
            onPaid && onPaid();
            return;
          }
          if (r && (r.status === "failed" || r.status === "canceled" || r.status === "declined")) {
            setNotConfirmed(true);
            return;
          }
          setAttempts(function (n) {
            var next = n + 1;
            if (next >= POLL_LIMIT) setNotConfirmed(true);
            return next;
          });
        }).catch(function () {});
      }, 4000);
      return function () {
        clearInterval(t);
      };
    }, [waiting, paymentId, done]);

    // Re-initiate the gateway step for the SAME pending payment (no new subscription created).
    const retryPayment = function () {
      var id = paymentId;
      if (!id) {
        onClose();
        return;
      }
      setNotConfirmed(false);
      setAttempts(0);
      setError("");
      if (method === "khqr") {
        setWaiting(true);
        emp.generateKhqr(id).then(function (d) {
          setKhqr(d.qr);
        }).catch(function (e) {
          setError(e && e.message || "Could not generate KHQR.");
        });
      } else if (method === "card") {
        setWaiting(true);
        emp.abaForm(id, "cards").then(abaSubmitForm).catch(function (e) {
          setError(e && e.message || "Could not start card payment.");
        });
      } else {
        setWaiting(true);
        emp.abaForm(id).then(abaSubmitForm).catch(function (e) {
          setError(e && e.message || "Could not start the payment.");
        });
      }
    };
    if (!plan) return null;
    const m = method ? PAY_META[method] : null;
    const acct = method ? pay[method] : null;

    // Amount actually due after any coupon; willBeFree = a coupon that reduces it to $0, which
    // the backend activates immediately (no gateway step) just like a free plan.
    const netCharge = couponResult ? Number(couponResult.new_charge) : planCharge(plan);
    const willBeFree = !isTrial && !isFree && netCharge <= 0;
    const confirm = () => {
      if (!isTrial && !isFree && !willBeFree && !method) return;
      setBusy(true);
      setError("");
      var couponCode = couponResult ? couponResult.code : undefined;
      var noGateway = isTrial || isFree || willBeFree;
      emp.subscribe(plan.id, isTrial ? "trial" : noGateway ? "other" : PAY_META[method].apiMethod, noGateway ? undefined : currency, couponCode).then(function (res) {
        setBusy(false);
        // KHQR / ABA / Card(Stripe): enter the waiting state and poll for gateway confirmation.
        if (!noGateway && res && res.payment && res.payment.id && (method === "khqr" || method === "aba" || method === "card")) {
          onPaid && onPaid(); // refresh billing list in the background
          if (method === "khqr") {
            setPaymentId(res.payment.id);
            setWaiting(true);
            emp.generateKhqr(res.payment.id).then(function (d) {
              setKhqr(d.qr);
            }).catch(function (e) {
              setError(e && e.message || "Could not generate KHQR. You can still pay and an admin will confirm.");
            });
          } else if (method === "card") {
            // Card via ABA PayWay hosted checkout — jump straight to the Visa/Mastercard form.
            setPaymentId(res.payment.id);
            setWaiting(true);
            emp.abaForm(res.payment.id, "cards").then(abaSubmitForm).catch(function () {});
          } else {
            setPaymentId(res.payment.id);
            setWaiting(true); // aba
            emp.abaForm(res.payment.id).then(abaSubmitForm).catch(function () {});
          }
        } else {
          setDone(true);
          onPaid && onPaid();
        }
      }).catch(function (e) {
        setBusy(false);
        setError(e && e.message || "Subscription failed.");
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: "100%",
        maxWidth: 460,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, !done ? notConfirmed ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, "Payment not confirmed"), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "Close",
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "22px",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        border: "1px solid var(--warning-border, #fcd34d)",
        background: "var(--warning-subtle, #fef3c7)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--warning, #d97706)",
        flexShrink: 0
      }
    }, I("triangle-alert", 20)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-strong)"
      }
    }, "Your payment wasn't successful."), /*#__PURE__*/React.createElement("br", null), "The ", /*#__PURE__*/React.createElement("strong", null, plan.name), " plan is ", /*#__PURE__*/React.createElement("strong", null, "not active yet"), ". If you just completed payment it can take a moment to confirm \u2014 otherwise please check out and pay again.")), error && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, error)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "I'll finish later"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      iconLeft: I("refresh-cw", 15),
      onClick: retryPayment
    }, "Try payment again"))) : khqr ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, "Scan to pay $", planCharge(plan)), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "Close",
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "26px 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "#fff"
      }
    }, /*#__PURE__*/React.createElement(KhqrCanvas, {
      value: khqr,
      size: 220
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        textAlign: "center",
        lineHeight: 1.55
      }
    }, "Open any Cambodian banking app, choose ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, "Scan KHQR"), ", and pay. This page confirms automatically once payment is received."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--brand)",
        display: "inline-block",
        animation: "pulse 1.4s ease-in-out infinite"
      }
    }), "Waiting for payment\u2026"), error && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        width: "100%",
        textAlign: "center"
      }
    }, error)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      block: true,
      onClick: onClose
    }, "I'll finish later"))) : waiting ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, "Complete your $", planCharge(plan), " payment"), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "Close",
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "22px",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, method === "card" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-sunken)"
      }
    }, I("credit-card", 20), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Secure card checkout"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, "Complete your Visa / Mastercard payment in the Stripe window that opened."), stripeUrl && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("a", {
      href: stripeUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        color: "var(--text-brand)",
        fontWeight: 600,
        display: "inline-block",
        marginTop: 6
      }
    }, "Didn't open? Open payment page \u2192")))) : acct ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "14px 16px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.7
      }
    }, "Pay via ", /*#__PURE__*/React.createElement("strong", null, m ? m.label : "ABA"), " to", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, acct.merchant), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, acct.account)) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--brand)",
        display: "inline-block"
      }
    }), "Waiting for payment confirmation\u2026"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        lineHeight: 1.55
      }
    }, "This page confirms automatically once your payment is verified. You can safely close this \u2014 your plan activates as soon as payment is received.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      block: true,
      onClick: onClose
    }, "I'll finish later"))) : isTrial || isFree ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, isFree ? "Get started with " + plan.name : "Start your " + trialDays + "-day free trial"), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "Close",
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "16px",
        background: "var(--brand-subtle)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--brand-border, var(--brand))"
      }
    }, I(isFree ? "sparkles" : "clock", 20), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-sm)"
      }
    }, isFree ? "Free forever" : "Free for " + trialDays + " days"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4,
        lineHeight: 1.55
      }
    }, isFree ? /*#__PURE__*/React.createElement(React.Fragment, null, "The ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, plan.name), " plan is free, no card required. You can upgrade anytime.") : /*#__PURE__*/React.createElement(React.Fragment, null, "Try all features included in the ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, plan.name), " plan at no cost. No payment required to start.")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, plan.job_post_limit != null && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)",
        flexShrink: 0
      }
    }, I("briefcase", 16)), plan.job_post_limit, " job post", plan.job_post_limit !== 1 ? "s" : ""), planFeatures && planFeatures(plan).map(function (f, idx) {
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        style: {
          display: "flex",
          gap: 8,
          fontSize: "var(--text-sm)",
          color: "var(--text-body)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--brand)",
          flexShrink: 0
        }
      }, I("check", 16)), f);
    })), error && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, error)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      disabled: busy,
      onClick: confirm
    }, busy ? "Starting…" : isFree ? "Get started" : "Start free trial"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, "Upgrade to ", plan.name), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "Close",
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxHeight: "66vh",
        overflowY: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-body)"
      }
    }, plan.name, " plan"), /*#__PURE__*/React.createElement("span", null, currency === "KHR" && fxRate ? /*#__PURE__*/React.createElement("strong", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-2xl)",
        color: "var(--text-strong)"
      }
    }, "\u17DB", khrOf(netCharge).toLocaleString()) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-2xl)",
        color: "var(--text-strong)"
      }
    }, "$", netCharge), couponResult ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textDecoration: "line-through",
        marginLeft: 6
      }
    }, "$", planCharge(plan)) : planHasDiscount(plan) ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textDecoration: "line-through",
        marginLeft: 6
      }
    }, "$", plan.price) : null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, " / ", plan.interval))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Coupon code"), couponResult ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "10px 14px",
        border: "1px solid var(--success-border, #86efac)",
        background: "var(--success-subtle)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.5
      }
    }, couponResult.kind && couponResult.kind.indexOf("referral") === 0 ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontWeight: 700,
        color: "var(--success, #047857)"
      }
    }, I("gift", 13), " Referral reward \xB7 ") : null, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--success, #047857)"
      }
    }, couponResult.code), " applied \u2014 you save $", couponResult.discount, couponResult.credits ? /*#__PURE__*/React.createElement("span", null, " \xB7 +", couponResult.credits, " featured credit", couponResult.credits !== 1 ? "s" : "") : null, couponResult.free_days ? /*#__PURE__*/React.createElement("span", null, " \xB7 +", couponResult.free_days, " free day", couponResult.free_days !== 1 ? "s" : "") : null, couponResult.job_posts ? /*#__PURE__*/React.createElement("span", null, " \xB7 +", couponResult.job_posts, " job post", couponResult.job_posts !== 1 ? "s" : "") : null), /*#__PURE__*/React.createElement("button", {
      onClick: removeCoupon,
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        flexShrink: 0
      }
    }, "Remove")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("input", {
      value: couponInput,
      onChange: e => setCouponInput(e.target.value.toUpperCase()),
      onKeyDown: e => {
        if (e.key === "Enter") {
          e.preventDefault();
          applyCoupon();
        }
      },
      placeholder: "Enter code",
      style: {
        flex: 1,
        padding: "10px 12px",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        textTransform: "uppercase",
        background: "var(--surface-card)",
        color: "var(--text-strong)"
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: applyCoupon,
      disabled: couponBusy || !couponInput.trim(),
      style: {
        padding: "10px 16px",
        border: "1px solid var(--brand)",
        background: "var(--brand-subtle)",
        color: "var(--text-brand)",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        cursor: couponBusy || !couponInput.trim() ? "default" : "pointer",
        opacity: couponBusy || !couponInput.trim() ? 0.6 : 1,
        flexShrink: 0
      }
    }, couponBusy ? "Checking…" : "Apply")), couponErr ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        fontSize: "var(--text-xs)",
        color: "var(--danger)"
      }
    }, couponErr) : null)), fxRate ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 10
      }
    }, "Pay in"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, [{
      v: "USD",
      label: "US Dollar",
      amt: "$" + netCharge
    }, {
      v: "KHR",
      label: "Khmer Riel",
      amt: "៛" + khrOf(netCharge).toLocaleString()
    }].map(function (c) {
      var on = currency === c.v;
      return /*#__PURE__*/React.createElement("button", {
        key: c.v,
        type: "button",
        onClick: function () {
          setCurrency(c.v);
        },
        style: {
          flex: 1,
          padding: "12px 14px",
          cursor: "pointer",
          textAlign: "left",
          border: "1.5px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
          background: on ? "var(--brand-subtle)" : "var(--surface-card)",
          borderRadius: "var(--radius-md)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: "var(--text-base)",
          color: on ? "var(--text-brand)" : "var(--text-strong)"
        }
      }, c.amt), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)"
        }
      }, c.label));
    })), currency === "KHR" ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 6
      }
    }, "Charged in riel at the National Bank of Cambodia rate (\u17DB", Math.round(fxRate).toLocaleString(), " / US$1).") : null) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 10
      }
    }, "Payment method"), available.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        padding: "12px 14px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)"
      }
    }, "No payment methods are enabled. Ask an admin to enable one in Payment settings.") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, available.map(k => {
      const meta = PAY_META[k];
      const on = method === k;
      return /*#__PURE__*/React.createElement("button", {
        key: k,
        onClick: () => setMethod(k),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          cursor: "pointer",
          textAlign: "left",
          border: "1.5px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
          background: on ? "var(--brand-subtle)" : "var(--surface-card)",
          borderRadius: "var(--radius-md)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          borderRadius: "var(--radius-sm)",
          background: "var(--brand-subtle)",
          color: "var(--brand)"
        }
      }, I(k === "khqr" ? "qr-code" : k === "cod" ? "banknote" : k === "card" ? "credit-card" : "landmark", 19)), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: "var(--text-sm)",
          color: "var(--text-strong)"
        }
      }, meta.label), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)"
        }
      }, meta.desc)), /*#__PURE__*/React.createElement("span", {
        style: {
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "2px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
          background: on ? "var(--brand)" : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff"
        }
      }, on ? I("check", 11) : null));
    }))), m && acct ? method === "khqr" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-sunken)"
      }
    }, I("qr-code", 20), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "KHQR"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, "Continue to get a KHQR code to scan with any Cambodian banking app. Your plan activates automatically once payment is confirmed."))) : method === "cod" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-sunken)"
      }
    }, I("banknote", 20), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Cash on Delivery"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, "An invoice will be sent to your registered email. Our team will contact you to arrange payment in person. Your plan activates after admin confirmation."), acct.account && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        marginTop: 4,
        display: "block"
      }
    }, "Contact: ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-strong)"
      }
    }, acct.account))))) : method === "card" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-sunken)"
      }
    }, I("credit-card", 20), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Visa / Mastercard"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, "You'll be taken to Stripe's secure checkout to pay by card. Your plan activates automatically once payment is confirmed."))) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "14px 16px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, "Transfer to ", /*#__PURE__*/React.createElement("strong", null, m.label), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, acct.merchant), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, acct.account)) : null, error && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)"
      }
    }, error)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      disabled: !method && !willBeFree || busy,
      onClick: confirm
    }, busy ? "Processing…" : willBeFree ? "Activate plan" : method === "khqr" || method === "aba" || method === "card" ? "Continue to pay" : method === "cod" ? "Confirm order" : "Confirm payment"))) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px 32px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "var(--success-subtle)",
        color: "var(--success)"
      }
    }, I("circle-check-big", 30)), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-2xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginTop: 18
      }
    }, isTrial ? "Trial started!" : isFree ? "You're all set!" : method === "khqr" || method === "aba" || method === "card" ? "Payment confirmed!" : "Subscription created"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 8,
        lineHeight: 1.55
      }
    }, isTrial ? /*#__PURE__*/React.createElement("span", null, "Your ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, trialDays, "-day free trial"), " is now active. Enjoy full access to the ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, plan.name), " plan features.") : isFree ? /*#__PURE__*/React.createElement("span", null, "You're now on the ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, plan.name), " plan \u2014 free, active immediately, no payment needed.") : method === "khqr" || method === "aba" || method === "card" ? /*#__PURE__*/React.createElement("span", null, "Payment received \u2014 you're now on the ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, plan.name), " plan, active immediately.") : /*#__PURE__*/React.createElement("span", null, "You're now on the ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, plan.name), " plan, paid via ", method ? PAY_META[method].label : "", ". Payment is pending admin confirmation.")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        marginTop: 22
      },
      onClick: onClose
    }, "Done"))));
  }
  function ReferralCard() {
    const [ref, setRef] = React.useState(null);
    const [copied, setCopied] = React.useState(false);
    React.useEffect(function () {
      emp.fetchReferral().then(setRef).catch(function () {});
    }, []);
    if (!ref || !ref.code) return null;
    const rewardLine = function (r) {
      if (!r) return "";
      var p = [];
      if (r.percent_off) p.push(r.percent_off + "% off");
      if (r.amount_off) p.push("$" + r.amount_off + " off");
      if (r.credits) p.push(r.credits + " featured credit" + (r.credits !== 1 ? "s" : ""));
      if (r.free_days) p.push(r.free_days + " free days");
      if (r.job_posts) p.push(r.job_posts + " job post" + (r.job_posts !== 1 ? "s" : ""));
      return p.join(" + ");
    };
    const copy = function () {
      try {
        navigator.clipboard.writeText(ref.link);
        setCopied(true);
        setTimeout(function () {
          setCopied(false);
        }, 1800);
      } catch (e) {}
    };
    const welcome = rewardLine(ref.welcome);
    const referrer = rewardLine(ref.referrer);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 24,
        padding: "20px 22px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--brand-border, var(--brand))",
        background: "var(--brand-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)"
      }
    }, I("gift", 18)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, "Refer & earn")), ref.enabled && (welcome || referrer) ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        marginBottom: 14,
        lineHeight: 1.6
      }
    }, welcome ? /*#__PURE__*/React.createElement("span", null, "Your friend gets ", /*#__PURE__*/React.createElement("strong", null, welcome), " on sign-up. ") : null, referrer ? /*#__PURE__*/React.createElement("span", null, "You get ", /*#__PURE__*/React.createElement("strong", null, referrer), " when they subscribe.") : null) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 14
      }
    }, "Share your code with other employers."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontWeight: 800,
        fontSize: "var(--text-lg)",
        letterSpacing: ".08em",
        color: "var(--text-strong)",
        padding: "8px 16px",
        background: "var(--surface-card)",
        border: "1px dashed var(--brand)",
        borderRadius: "var(--radius-md)"
      }
    }, ref.code), /*#__PURE__*/React.createElement("button", {
      onClick: copy,
      style: {
        padding: "9px 16px",
        border: "none",
        background: "var(--brand)",
        color: "#fff",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6
      }
    }, I(copied ? "check" : "copy", 14), " ", copied ? "Copied" : "Copy link"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, ref.referred_count, " referred \xB7 ", ref.rewarded_count, " reward", ref.rewarded_count !== 1 ? "s" : "", " earned")));
  }
  function Billing({
    onSubChange
  }) {
    const [plans, setPlans] = React.useState([]);
    const [sub, setSub] = React.useState(null);
    const [allSubs, setAllSubs] = React.useState([]);
    const [quota, setQuota] = React.useState({
      used: 0,
      remaining: null,
      limit: null
    });
    const [featured, setFeatured] = React.useState({
      pool: 0,
      used: 0,
      remaining: 0
    });
    const [payments, setPayments] = React.useState([]);
    const [payMeta, setPayMeta] = React.useState({
      total: 0,
      last_page: 1,
      current_page: 1
    });
    const [loading, setLoading] = React.useState(true);
    const [payLoading, setPayLoading] = React.useState(false);
    const [checkout, setCheckout] = React.useState(null);
    const [invPage, setInvPage] = React.useState(1);
    const [usedPlanIds, setUsedPlanIds] = React.useState([]);
    const fetchPayHistory = React.useCallback(function (page) {
      setPayLoading(true);
      emp.fetchPayments(page).then(function (r) {
        setPayments(r.data || []);
        setPayMeta({
          total: r.total || 0,
          last_page: r.last_page || 1,
          current_page: r.current_page || page
        });
        setPayLoading(false);
      }).catch(function () {
        setPayLoading(false);
      });
    }, []);
    const load = React.useCallback(function () {
      setLoading(true);
      Promise.all([emp.fetchPlans(), emp.fetchSubscription()]).then(function (r) {
        setPlans(Array.isArray(r[0]) ? r[0] : r[0].data || []);
        var subResp = r[1] || {};
        var latestSub = subResp.subscription || null;
        setSub(latestSub);
        setAllSubs(Array.isArray(subResp.all_subscriptions) ? subResp.all_subscriptions : []);
        setQuota({
          used: subResp.jobs_used || 0,
          remaining: subResp.jobs_remaining !== undefined ? subResp.jobs_remaining : null,
          limit: subResp.jobs_limit !== undefined ? subResp.jobs_limit : null
        });
        setFeatured({
          pool: subResp.featured_pool || 0,
          used: subResp.featured_used || 0,
          remaining: subResp.featured_remaining || 0
        });
        setUsedPlanIds(Array.isArray(subResp.used_plan_ids) ? subResp.used_plan_ids : []);
        if (onSubChange) onSubChange();
        setLoading(false);
        return latestSub;
      }).catch(function () {
        setLoading(false);
        return null;
      });
      fetchPayHistory(1);
    }, [fetchPayHistory]);
    React.useEffect(function () {
      load();
    }, [load]);

    // Auto-poll when subscription is pending payment confirmation
    React.useEffect(function () {
      if (!sub || sub.status !== "pending") return;
      var timer = setInterval(function () {
        emp.fetchSubscription().then(function (r) {
          var latestSub = r && r.subscription || null;
          if (latestSub && latestSub.status !== "pending") {
            setSub(latestSub);
            setAllSubs(Array.isArray(r.all_subscriptions) ? r.all_subscriptions : []);
            setQuota({
              used: r.jobs_used || 0,
              remaining: r.jobs_remaining !== undefined ? r.jobs_remaining : null,
              limit: r.jobs_limit !== undefined ? r.jobs_limit : null
            });
            setFeatured({
              pool: r.featured_pool || 0,
              used: r.featured_used || 0,
              remaining: r.featured_remaining || 0
            });
            if (onSubChange) onSubChange();
            fetchPayHistory(1);
          }
        }).catch(function () {});
      }, 10000);
      return function () {
        clearInterval(timer);
      };
    }, [sub && sub.status]);
    const currentPlanId = sub && sub.plan ? sub.plan.id : null;
    const invSlice = payments;
    const invSafe = payMeta.current_page;
    const invPages = payMeta.last_page;
    const INV_PER = 10;
    const fmtDate = iso => {
      if (!iso) return "—";
      var d = new Date(iso);
      return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getFullYear();
    };
    const planFeatures = p => Array.isArray(p.features_json) ? p.features_json : Array.isArray(p.features) ? p.features : [];

    // Mobile plan carousel — keep the pagination dots in sync with the horizontal swipe.
    const [activeCard, setActiveCard] = React.useState(0);
    const carRef = React.useRef(null);
    const onCarScroll = function () {
      var el = carRef.current;
      if (!el || !plans.length) return;
      var step = el.scrollWidth / plans.length;
      var idx = Math.max(0, Math.min(plans.length - 1, Math.round(el.scrollLeft / step)));
      setActiveCard(function (prev) {
        return prev === idx ? prev : idx;
      });
    };
    const scrollToCard = function (i) {
      var el = carRef.current;
      if (!el || !plans.length) return;
      el.scrollTo({
        left: i * (el.scrollWidth / plans.length),
        behavior: "smooth"
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: T("Plan & billing"),
      sub: T("Manage your subscription and billing history.")
    }), /*#__PURE__*/React.createElement(ReferralCard, null), loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, T("Loading…")) : /*#__PURE__*/React.createElement(React.Fragment, null, sub && sub.plan && /*#__PURE__*/React.createElement("div", {
      className: "krm-stats-grid",
      style: {
        marginBottom: 24,
        borderRadius: "var(--radius-lg)",
        border: "1px solid " + (sub.status === "expired" ? "var(--danger, #ef4444)" : sub.status === "pending" ? "var(--warning-border, #fcd34d)" : "var(--border)"),
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-plan-summary",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 20px",
        borderRight: "1px solid var(--border)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".05em",
        marginBottom: 6
      }
    }, T("Current plan")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-sm)"
      }
    }, sub.status === "trial" ? "Trial — " + sub.plan.name : sub.plan.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 20px",
        borderRight: "1px solid var(--border)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".05em",
        marginBottom: 6
      }
    }, T("Status")), /*#__PURE__*/React.createElement(Badge, {
      tone: SUB_STATUS_TONE[sub.status] || "neutral"
    }, (sub.status || "").replace("_", " "))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 20px",
        borderRight: "1px solid var(--border)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".05em",
        marginBottom: 6
      }
    }, T("Started")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        color: "var(--text-body)",
        fontSize: "var(--text-sm)"
      }
    }, fmtDate(sub.started_at || sub.created_at))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 20px",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".05em",
        marginBottom: 6
      }
    }, sub.status === "expired" ? T("Expired on") : sub.status === "pending" ? T("Activates on") : T("Renews")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        color: sub.status === "expired" ? "var(--danger)" : "var(--text-body)",
        fontSize: "var(--text-sm)"
      }
    }, fmtDate(sub.renews_at)))), allSubs.length > 0 && allSubs.map(function (s, idx) {
      var lim = s.jobs_limit;
      var used = s.jobs_used || 0;
      var rem = s.jobs_remaining;
      var full = lim !== null && rem <= 0;
      var planName = s.plan ? s.plan.name : T("Plan");
      var isCustom = s.job_post_limit != null;
      var label = isCustom ? planName + " · Custom slots (Admin assigned)" : planName;
      var statusTone = {
        active: "var(--brand)",
        trial: "var(--brand)",
        pending: "var(--warning, #f59e0b)",
        expired: "var(--danger)",
        canceled: "var(--text-faint)"
      };
      var barColor = full ? "var(--danger)" : lim !== null && used / lim > 0.8 ? "var(--warning, #f59e0b)" : "var(--brand)";
      return /*#__PURE__*/React.createElement("div", {
        key: s.id,
        style: {
          padding: "12px 20px",
          borderTop: "1px solid var(--border)",
          background: idx % 2 === 0 ? "var(--surface-sunken, var(--surface-card))" : "var(--surface-card)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: "var(--text-faint)",
          textTransform: "uppercase",
          letterSpacing: ".05em"
        }
      }, T("Live job posts")), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: statusTone[s.status] || "var(--text-muted)",
          fontWeight: 600,
          background: "var(--surface-page)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-full)",
          padding: "1px 8px"
        }
      }, label), full && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)"
        }
      }, T("Close a job to free a slot, or upgrade your plan for more."))), lim !== null ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          color: full ? "var(--danger)" : "var(--text-body)",
          whiteSpace: "nowrap"
        }
      }, used, " / ", lim, " \xB7 ", full ? T("Limit reached") : rem + " remaining") : /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: 4
        }
      }, I("infinity", 13), " ", T("Unlimited"))), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginBottom: lim !== null ? 6 : 0
        }
      }, I("calendar", 12), /*#__PURE__*/React.createElement("span", null, "Started ", fmtDate(s.started_at)), /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-faint)"
        }
      }, "\xB7"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: s.status === "expired" ? "var(--danger)" : "var(--text-muted)"
        }
      }, s.renews_at ? "Expires " + fmtDate(s.renews_at) : T("No expiry"))), lim !== null && /*#__PURE__*/React.createElement("div", {
        style: {
          height: 5,
          borderRadius: 99,
          background: "var(--border)",
          overflow: "hidden"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: "100%",
          borderRadius: 99,
          width: Math.min(100, lim > 0 ? Math.round(used / lim * 100) : 0) + "%",
          background: barColor
        }
      })));
    }), featured.pool > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-faint)",
        textTransform: "uppercase",
        letterSpacing: ".05em"
      }
    }, T("Featured credits")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, T("Free boosts included in your active plan"), allSubs.length > 1 ? "s" : "")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: featured.remaining <= 0 ? "var(--text-muted)" : "var(--text-body)",
        whiteSpace: "nowrap"
      }
    }, featured.used, " / ", featured.pool, " \xB7 ", featured.remaining <= 0 ? T("All used") : featured.remaining + " remaining")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 5,
        borderRadius: 99,
        background: "var(--border)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        borderRadius: 99,
        width: Math.min(100, featured.pool > 0 ? Math.round(featured.used / featured.pool * 100) : 0) + "%",
        background: featured.remaining <= 0 ? "var(--warning, #f59e0b)" : "var(--accent, var(--brand))"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 6,
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, I("star", 12), /*#__PURE__*/React.createElement("span", null, T("Use a credit to feature a job free. After they run out, featuring costs the pay-per-boost price.")))), allSubs.length === 0 && quota.limit === null && sub.status !== "expired" && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface-sunken, var(--surface-card))",
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, I("infinity", 14), " Unlimited job posts included in this plan")), sub && sub.status === "pending" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "12px 16px",
        background: "var(--warning-subtle, #fffbeb)",
        border: "1px solid var(--warning-border, #fcd34d)",
        borderRadius: "var(--radius-md)",
        color: "var(--warning-fg, #92400e)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, I("clock", 16), " ", T("Awaiting payment confirmation from admin. Your plan will activate automatically once confirmed.")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: load
    }, T("Check now"))), sub && sub.status === "expired" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--danger-subtle)",
        border: "1px solid var(--danger-border, #fca5a5)",
        borderRadius: "var(--radius-md)",
        color: "var(--danger)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        marginBottom: 20
      }
    }, I("alert-circle", 16), " Your subscription has expired. Choose a plan below to continue posting jobs."), /*#__PURE__*/React.createElement("div", {
      className: "krm-plans-wrap",
      style: {
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-plans-carousel",
      ref: carRef,
      onScroll: onCarScroll,
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 16
      }
    }, plans.map(p => {
      const current = p.id === currentPlanId;
      const popular = /professional/i.test(p.name) && !/year|annual/i.test(p.name);
      const isCustom = planIsCustom(p);
      const isFree = planIsFree(p);
      const isTrialPlan = planIsTrial(p);
      // A $0 plan (free OR trial) is one-time per company — gate it client-side so the card
      // shows T("Already used") (disabled) instead of letting the employer click through to a 422.
      const zeroCostUsed = (isFree || isTrialPlan) && usedPlanIds.indexOf(p.id) !== -1;
      const dark = isCustom;
      const textStrong = dark ? "var(--text-on-dark, #fff)" : "var(--text-strong)";
      const textMuted = dark ? "var(--text-on-dark-mut, rgba(255,255,255,0.65))" : "var(--text-muted)";
      const textBody = dark ? "rgba(255,255,255,0.9)" : "var(--text-body)";
      const checkColor = dark ? "#fff" : "var(--brand)";
      return /*#__PURE__*/React.createElement(Card, {
        key: p.id,
        featured: popular,
        padding: 24,
        style: {
          border: current ? "1.5px solid var(--brand)" : dark ? "none" : undefined,
          background: dark ? "var(--stone-900, #1a1a1a)" : undefined
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap"
        }
      }, /*#__PURE__*/React.createElement("h3", {
        style: {
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: textStrong
        }
      }, p.name), popular && /*#__PURE__*/React.createElement(Badge, {
        tone: "accent"
      }, T("Popular")), current && /*#__PURE__*/React.createElement(Badge, {
        tone: "brand"
      }, T("Current")), !isCustom && planHasDiscount(p) && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: "#fff",
          background: "#16a34a",
          padding: "2px 9px",
          borderRadius: 999
        }
      }, "Save ", p.discount_percent, "%")), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginTop: 12,
          flexWrap: "wrap"
        }
      }, isCustom ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-4xl)",
          fontWeight: 800,
          color: textStrong
        }
      }, T("Custom")) : isTrialPlan ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-4xl)",
          fontWeight: 800,
          color: textStrong
        }
      }, p.trial_days || 7), /*#__PURE__*/React.createElement("span", {
        style: {
          color: textMuted,
          fontSize: "var(--text-sm)"
        }
      }, "days free")) : isFree ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-4xl)",
          fontWeight: 800,
          color: textStrong
        }
      }, T("Free")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-4xl)",
          fontWeight: 800,
          color: textStrong,
          whiteSpace: "nowrap"
        }
      }, "$", planHasDiscount(p) ? planCharge(p) : p.price), /*#__PURE__*/React.createElement("span", {
        style: {
          color: textMuted,
          fontSize: "var(--text-sm)",
          whiteSpace: "nowrap"
        }
      }, "/ ", p.interval), planHasDiscount(p) ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: textMuted,
          fontSize: "var(--text-sm)",
          textDecoration: "line-through",
          whiteSpace: "nowrap",
          flexBasis: "100%"
        }
      }, "$", p.price) : null)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 9,
          margin: "18px 0"
        }
      }, p.job_post_limit != null && /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          fontSize: "var(--text-sm)",
          color: textBody
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: checkColor,
          flexShrink: 0
        }
      }, I("briefcase", 16)), p.job_post_limit, " active job post", p.job_post_limit !== 1 ? "s" : ""), planFeatures(p).map((f, idx) => /*#__PURE__*/React.createElement("div", {
        key: idx,
        style: {
          display: "flex",
          gap: 8,
          fontSize: "var(--text-sm)",
          color: textBody
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: checkColor,
          flexShrink: 0
        }
      }, I("check", 16)), f))), /*#__PURE__*/React.createElement(Button, {
        variant: current ? "secondary" : dark ? "secondary" : popular ? "primary" : "ghost",
        block: true,
        disabled: current || zeroCostUsed,
        style: dark && !current && !zeroCostUsed ? {
          background: "#fff",
          color: "var(--stone-900, #1a1a1a)",
          border: "none"
        } : undefined,
        onClick: () => {
          if (current || zeroCostUsed) return;
          if (isCustom) {
            window.location.href = "mailto:sales@krama.com?subject=" + encodeURIComponent(T("Enterprise plan inquiry"));
            return;
          }
          setCheckout(p);
        }
      }, current ? T("Current plan") : zeroCostUsed ? T("Already used") : isCustom ? T("Contact sales") : isTrialPlan ? "Start " + (p.trial_days || 7) + "-Day Trial" : isFree ? T("Get started") : T("Upgrade")));
    })), plans.length > 1 && /*#__PURE__*/React.createElement("div", {
      className: "krm-plans-dots"
    }, plans.map(function (_, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        className: "krm-plan-dot" + (i === activeCard ? " is-active" : ""),
        onClick: function () {
          scrollToCard(i);
        }
      });
    }))), /*#__PURE__*/React.createElement(PremiumSlotCard, null), /*#__PURE__*/React.createElement("div", {
      className: "krm-table-wrap"
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 22px",
        borderBottom: "1px solid var(--border)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, T("Billing history")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 0.9fr 1fr 1fr 0.8fr 44px",
        padding: "10px 22px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", null, T("Invoice")), /*#__PURE__*/React.createElement("span", null, T("Date")), /*#__PURE__*/React.createElement("span", null, T("Amount")), /*#__PURE__*/React.createElement("span", null, T("Type")), /*#__PURE__*/React.createElement("span", null, T("Method")), /*#__PURE__*/React.createElement("span", null, T("Status")), /*#__PURE__*/React.createElement("span", null)), invSlice.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "24px 22px",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)",
        textAlign: "center"
      }
    }, T("No payments yet.")), invSlice.map((inv, i) => /*#__PURE__*/React.createElement("div", {
      key: inv.id,
      style: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 0.9fr 1fr 1fr 0.8fr 44px",
        alignItems: "center",
        padding: "13px 22px",
        borderBottom: i < invSlice.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, inv.invoice_no || "#" + inv.id), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, fmtDate(inv.created_at)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, "$", Number(inv.amount).toLocaleString(), inv.is_tax_invoice && Number(inv.vat_amount) > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: "var(--text-xs)",
        fontWeight: 500,
        color: "var(--text-faint)"
      }
    }, "incl. $", Number(inv.vat_amount).toLocaleString(), " VAT")), /*#__PURE__*/React.createElement("span", null, inv.is_tax_invoice ? /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, T("Tax invoice")) : /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, T("Invoice"))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        textTransform: "uppercase"
      }
    }, inv.method), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Badge, {
      tone: inv.status === "paid" ? "success" : inv.status === "refunded" ? "neutral" : "warning"
    }, inv.status)), /*#__PURE__*/React.createElement("span", null, inv.status === "paid" && /*#__PURE__*/React.createElement("button", {
      title: T("Download invoice"),
      onClick: () => emp.downloadInvoice(inv.id),
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: "var(--surface-card)",
        color: "var(--text-muted)",
        cursor: "pointer"
      }
    }, I("download", 15))))), /*#__PURE__*/React.createElement("div", {
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
    }, payMeta.total > 0 ? "Showing " + ((invSafe - 1) * INV_PER + 1) + "–" + ((invSafe - 1) * INV_PER + invSlice.length) + " of " + payMeta.total : T("No payments yet.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: invSafe <= 1 || payLoading,
      onClick: () => {
        var p = invSafe - 1;
        setInvPage(p);
        fetchPayHistory(p);
      }
    }, T("Previous")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: invSafe >= invPages || payLoading,
      onClick: () => {
        var p = invSafe + 1;
        setInvPage(p);
        fetchPayHistory(p);
      }
    }, T("Next"))))))), /*#__PURE__*/React.createElement(CheckoutModal, {
      plan: checkout,
      onClose: () => setCheckout(null),
      onPaid: load
    }));
  }
  function Team({
    user
  }) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [inviteName, setInviteName] = React.useState("");
    const [inviteEmail, setInviteEmail] = React.useState("");
    const [invitePassword, setInvitePassword] = React.useState("");
    const [inviteRole, setInviteRole] = React.useState("recruitment");
    const [inviting, setInviting] = React.useState(false);
    const [msg, setMsg] = React.useState(null);
    const [pwdModal, setPwdModal] = React.useState(null);
    const [newPwd, setNewPwd] = React.useState("");
    const [pwdBusy, setPwdBusy] = React.useState(false);
    const flash = (m, ok) => {
      setMsg({
        text: m,
        ok: ok !== false
      });
      setTimeout(() => setMsg(null), 3500);
    };
    const load = React.useCallback(function () {
      setLoading(true);
      emp.fetchTeam().then(function (d) {
        setData(d);
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }, []);
    React.useEffect(function () {
      load();
    }, [load]);
    const invite = () => {
      if (!inviteName.trim() || !inviteEmail.trim()) return;
      setInviting(true);
      emp.inviteRecruiter({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole
      }).then(function () {
        flash((inviteRole === "company_admin" ? "Admin" : "Recruiter") + " added. Set their password below.");
        setInviteOpen(false);
        setInviteName("");
        setInviteEmail("");
        setInvitePassword("");
        setInviteRole("recruitment");
        load();
      }).catch(function (e) {
        flash(e && e.message || "Failed to add member.", false);
      }).finally(function () {
        setInviting(false);
      });
    };
    const remove = member => {
      if (!window.confirm('Remove ' + member.name + ' from the team?')) return;
      emp.removeTeamMember(member.id).then(function () {
        flash("Team member removed.");
        load();
      }).catch(function (e) {
        flash(e && e.message || "Failed.", false);
      });
    };
    const changeRole = (member, role) => {
      emp.updateMemberRole(member.id, role).then(function () {
        flash("Role updated to " + (role === "company_admin" ? "Admin" : "Recruiter") + ".");
        load();
      }).catch(function (e) {
        flash(e && e.message || "Failed to change role.", false);
      });
    };
    const setPassword = () => {
      if (!newPwd || newPwd.length < 8) {
        flash("Password must be at least 8 characters.", false);
        return;
      }
      setPwdBusy(true);
      emp.setMemberPassword(pwdModal.id, newPwd).then(function () {
        flash("Password updated for " + pwdModal.name + ".");
        setPwdModal(null);
        setNewPwd("");
        setPwdBusy(false);
      }).catch(function (e) {
        flash(e && e.message || "Failed.", false);
        setPwdBusy(false);
      });
    };
    if (loading) return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        color: "var(--text-muted)"
      }
    }, "Loading\u2026");
    const recruiters = data ? data.recruiters || [] : [];
    const owner = data ? data.owner : null;
    // Owner (company_role null) and company_admin can manage the team; recruiters can only view.
    const isTeamAdmin = user && user.company_role !== "recruitment";
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        maxWidth: 860
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Team",
      sub: "Add admins (full control) or recruiters (post jobs you approve) to your company.",
      action: isTeamAdmin ? /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: I("user-plus", 15),
        onClick: () => setInviteOpen(true)
      }, "Add member") : null
    }), msg && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: msg.ok ? "var(--success-subtle)" : "var(--danger-subtle)",
        color: msg.ok ? "var(--success)" : "var(--danger)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        marginBottom: 14
      }
    }, msg.text), /*#__PURE__*/React.createElement(Card, {
      padding: 0,
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Team members"), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, 1 + recruiters.length, " member", recruiters.length !== 0 ? "s" : "")), owner && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 22px",
        borderBottom: recruiters.length > 0 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: owner.name,
      src: owner.avatar_url,
      size: 38
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)"
      }
    }, owner.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, owner.email)), /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "Company admin")), recruiters.map((r, i) => /*#__PURE__*/React.createElement("div", {
      key: r.id,
      className: "krm-team-row",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 22px",
        borderBottom: i < recruiters.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.name,
      src: r.avatar_url,
      size: 38
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-team-name",
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)"
      }
    }, r.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, r.email)), /*#__PURE__*/React.createElement("div", {
      className: "krm-team-actions",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0
      }
    }, isTeamAdmin ? /*#__PURE__*/React.createElement(Select, {
      value: r.company_role || "recruitment",
      onChange: e => changeRole(r, e.target.value),
      options: [{
        value: "company_admin",
        label: "Admin"
      }, {
        value: "recruitment",
        label: "Recruiter"
      }],
      size: "sm",
      containerStyle: {
        minWidth: 120
      }
    }) : /*#__PURE__*/React.createElement(Badge, {
      tone: r.company_role === "company_admin" ? "brand" : "neutral"
    }, r.company_role === "company_admin" ? "Admin" : "Recruiter"), isTeamAdmin && /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: I("key", 13),
      onClick: () => {
        setPwdModal(r);
        setNewPwd("");
      }
    }, "Set password"), isTeamAdmin && /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => remove(r)
    }, "Remove")))), recruiters.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "28px 22px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "No recruiters yet. Add a recruiter to let them post jobs on your company's behalf.")), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      style: {
        background: "var(--surface-sunken, var(--surface-page))",
        border: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 4
      }
    }, "How team roles work"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", null, "Company admin"), " \u2014 can manage the company profile, billing, and approve or reject recruiter job postings.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "Recruiter"), " \u2014 can create and edit job postings, but each post must be approved by the company admin before it goes live.")), inviteOpen && /*#__PURE__*/React.createElement("div", {
      onClick: () => setInviteOpen(false),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: "100%",
        maxWidth: 420,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        fontWeight: 700,
        fontSize: "var(--text-md)",
        color: "var(--text-strong)"
      }
    }, "Add team member"), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Create an account linked to your company. An ", /*#__PURE__*/React.createElement("strong", null, "Admin"), " has full control; a ", /*#__PURE__*/React.createElement("strong", null, "Recruiter"), " posts jobs that you approve."), /*#__PURE__*/React.createElement(Input, {
      label: "Full name",
      value: inviteName,
      onChange: e => setInviteName(e.target.value),
      placeholder: "e.g. Sokha Dara"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Email address",
      type: "email",
      value: inviteEmail,
      onChange: e => setInviteEmail(e.target.value),
      placeholder: "member@company.com"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Role",
      value: inviteRole,
      onChange: e => setInviteRole(e.target.value),
      options: [{
        value: "recruitment",
        label: "Recruiter (you approve their jobs)"
      }, {
        value: "company_admin",
        label: "Admin (full control)"
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "14px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setInviteOpen(false),
      style: {
        flex: 1
      }
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        flex: 1
      },
      disabled: !inviteName.trim() || !inviteEmail.trim() || inviting,
      onClick: invite
    }, inviting ? "Adding…" : "Add member")))), pwdModal && /*#__PURE__*/React.createElement("div", {
      onClick: () => setPwdModal(null),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: "100%",
        maxWidth: 380,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        fontWeight: 700,
        fontSize: "var(--text-md)",
        color: "var(--text-strong)"
      }
    }, "Set password for ", pwdModal.name), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px"
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "New password",
      type: "password",
      value: newPwd,
      onChange: e => setNewPwd(e.target.value),
      placeholder: "At least 8 characters"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "14px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setPwdModal(null),
      style: {
        flex: 1
      }
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        flex: 1
      },
      disabled: !newPwd || newPwd.length < 8 || pwdBusy,
      onClick: setPassword
    }, pwdBusy ? "Updating…" : "Set password")))));
  }

  // ── Messages ───────────────────────────────────────────────────────────────
  function Messages({
    user
  }) {
    const [convs, setConvs] = React.useState([]);
    const [activeConv, setActiveConv] = React.useState(null);
    const [msgs, setMsgs] = React.useState([]);
    const [body, setBody] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [msgLoading, setMsgLoading] = React.useState(false);
    const bottomRef = React.useRef(null);
    const lastIdRef = React.useRef(0);
    const activeId = activeConv ? activeConv.id : null;
    function fmtTime(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      const now = new Date();
      const diff = now - d;
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return Math.floor(diff / 60000) + "m";
      if (diff < 86400000) return Math.floor(diff / 3600000) + "h";
      return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    }
    function otherParty(conv) {
      if (!user || !user.role) return {};
      return user.role.slug === "employer" ? conv.candidate || {} : conv.employer || {};
    }
    function reloadConvs() {
      emp.fetchConversations().then(function (d) {
        setConvs(d.data || []);
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }
    function reloadMsgs(convId) {
      emp.fetchMessages(convId).then(function (d) {
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
      emp.fetchNewMessages(convId, lastIdRef.current).then(function (d) {
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
      const t = setInterval(function () {
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
      const t = setInterval(function () {
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
      emp.sendMessage(activeId, body.trim()).then(function (msg) {
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
    }, "Conversations"), loading && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "Loading\u2026"), !loading && convs.length === 0 && /*#__PURE__*/React.createElement("div", {
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
    }, "No conversations yet."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        fontSize: 12,
        color: "var(--text-faint)"
      }
    }, "Start a conversation from an applicant's profile.")), convs.map(function (conv) {
      const other = otherParty(conv);
      const latest = conv.latest_message;
      const isActive = activeId === conv.id;
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
    }, "Select a conversation to read messages")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
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
    }, "Loading\u2026"), msgs.map(function (msg) {
      const mine = msg.sender_id === user.id;
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
    }, sending ? "…" : "Send")))));
  }
  function BoostModal({
    job,
    onClose,
    onDone
  }) {
    const [quote, setQuote] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [method, setMethod] = React.useState("khqr");
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState("");
    const [billCur, setBillCur] = React.useState("USD"); // billing currency: USD or KHR
    const [fxRate, setFxRate] = React.useState(null); // NBC USD→KHR rate for the riel option
    const [khqr, setKhqr] = React.useState(null);
    const [paymentId, setPaymentId] = React.useState(null);
    const [waiting, setWaiting] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);
    const [notConfirmed, setNotConfirmed] = React.useState(false);
    React.useEffect(function () {
      if (!job) {
        setQuote(null);
        return;
      }
      setLoading(true);
      setErr("");
      setQuote(null);
      setBillCur("USD");
      setKhqr(null);
      setPaymentId(null);
      setWaiting(false);
      setDone(false);
      setAttempts(0);
      setNotConfirmed(false);
      emp.boostQuote(job.id).then(function (q) {
        setQuote(q);
        setLoading(false);
      }).catch(function (e) {
        setErr(e && e.message || "Failed to load boost details.");
        setLoading(false);
      });
    }, [job && job.id]);
    React.useEffect(function () {
      emp.exchangeRate().then(function (d) {
        if (d && d.rate) setFxRate(Number(d.rate));
      }).catch(function () {});
    }, []);

    // Poll for gateway confirmation; alert on failure / non-confirmation (see subscriptions/credits).
    React.useEffect(function () {
      if (!waiting || !paymentId || done) return;
      var POLL_LIMIT = 22; // ~90s at 4s intervals before prompting the employer to retry
      var t = setInterval(function () {
        emp.verifyPayment(paymentId).then(function (r) {
          if (r && r.status === "paid") {
            setDone(true);
            setNotConfirmed(false);
            onDone && onDone("Job featured — payment confirmed!");
            return;
          }
          if (r && (r.status === "failed" || r.status === "canceled" || r.status === "declined")) {
            setNotConfirmed(true);
            return;
          }
          setAttempts(function (n) {
            var next = n + 1;
            if (next >= POLL_LIMIT) setNotConfirmed(true);
            return next;
          });
        }).catch(function () {});
      }, 4000);
      return function () {
        clearInterval(t);
      };
    }, [waiting, paymentId, done]);
    var startGateway = function (id) {
      if (method === "khqr") {
        setWaiting(true);
        emp.generateKhqr(id).then(function (d) {
          setKhqr(d.qr);
        }).catch(function (e) {
          setErr(e && e.message || "Could not generate KHQR.");
        });
      } else if (method === "card") {
        setWaiting(true);
        emp.abaForm(id, "cards").then(abaSubmitForm).catch(function (e) {
          setErr(e && e.message || "Could not start card payment.");
        });
      } else if (method === "aba") {
        setWaiting(true);
        emp.abaForm(id).then(abaSubmitForm).catch(function (e) {
          setErr(e && e.message || "Could not start ABA payment.");
        });
      } else {
        onDone && onDone("Payment pending — the job will be featured once an admin confirms it.");
      } // cod/acleda/wing → admin confirms
    };
    var retryPayment = function () {
      if (!paymentId) {
        onClose();
        return;
      }
      setNotConfirmed(false);
      setAttempts(0);
      setErr("");
      startGateway(paymentId);
    };
    if (!job) return null;
    var days = quote ? quote.boost_days : 30;
    var hasCredits = quote && quote.credits_remaining > 0;
    var price = quote ? quote.boost_price : null;
    var baseCur = quote ? quote.boost_currency : "USD";
    // KHR is offered only when the base price is USD and we have a live NBC rate.
    var canKhr = fxRate && String(baseCur).toUpperCase() === "USD" && Number(price) > 0;
    var payCur = canKhr ? billCur : baseCur;
    var payAmt = canKhr && billCur === "KHR" ? Math.round(Number(price) * fxRate) : Number(price);
    var fmtMoney = function (cur, amt) {
      return String(cur).toUpperCase() === "KHR" ? "៛" + Math.round(amt).toLocaleString() : "$" + Number(amt).toFixed(2);
    };
    var priceLabel = fmtMoney(payCur, payAmt);
    var methods = [{
      v: "khqr",
      l: "KHQR"
    }, {
      v: "aba",
      l: "ABA"
    }, {
      v: "acleda",
      l: "ACLEDA"
    }, {
      v: "wing",
      l: "Wing"
    }, {
      v: "card",
      l: "Card"
    }, {
      v: "cod",
      l: "Cash"
    }];
    var submit = function () {
      setBusy(true);
      setErr("");
      emp.boostJob(job.id, hasCredits ? null : method, !hasCredits && canKhr ? billCur : undefined).then(function (r) {
        setBusy(false);
        // Credit-covered (or otherwise no charge) → featured immediately.
        if (!r || !r.requires_payment) {
          onDone("Job featured for " + days + " days!");
          return;
        }
        var id = r.payment && r.payment.id;
        if (!id) {
          setErr("Could not start the payment.");
          return;
        }
        setPaymentId(id);
        startGateway(id); // KHQR/ABA/Card → live checkout + poll; cod/acleda/wing → pending-admin
      }).catch(function (e) {
        setBusy(false);
        setErr(e && e.message || "Could not feature the job.");
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 260,
        background: "var(--surface-overlay)",
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
        maxWidth: 440,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--accent, #f59e0b)",
        display: "inline-flex"
      }
    }, I("star", 18)), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)"
      }
    }, "Feature this job"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, job.title))), notConfirmed ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        border: "1px solid var(--warning-border, #fcd34d)",
        background: "var(--warning-subtle, #fef3c7)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--warning, #d97706)",
        flexShrink: 0
      }
    }, I("triangle-alert", 20)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-strong)"
      }
    }, "Your payment wasn't successful."), /*#__PURE__*/React.createElement("br", null), "This job is ", /*#__PURE__*/React.createElement("strong", null, "not featured yet"), ". If you just completed payment it can take a moment to confirm \u2014 otherwise please try the payment again.")), err && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-xs)"
      }
    }, err)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px 18px",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "I'll finish later"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("refresh-cw", 15),
      onClick: retryPayment
    }, "Try payment again"))) : khqr ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "#fff"
      }
    }, /*#__PURE__*/React.createElement(KhqrCanvas, {
      value: khqr,
      size: 200
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        textAlign: "center",
        lineHeight: 1.55
      }
    }, "Scan with any Cambodian banking app to pay ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, priceLabel), ". This confirms automatically once paid."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--brand)"
      }
    }), "Waiting for payment\u2026")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px 18px"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      onClick: onClose
    }, "I'll finish later"))) : waiting ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, method === "card" ? "Complete your Visa / Mastercard payment in the window that opened." : "Complete your ABA payment to feature this job."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--brand)"
      }
    }), "Waiting for payment confirmation\u2026"), err && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-xs)"
      }
    }, err)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px 18px"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      onClick: onClose
    }, "I'll finish later"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20
      }
    }, loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "Loading\u2026") : quote && quote.already_featured ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, "This job is already featured.") : hasCredits ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, "Feature this job at the top of listings for ", /*#__PURE__*/React.createElement("strong", null, days, " days"), ".", /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: "10px 14px",
        background: "var(--surface-sunken, var(--surface-page))",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, I("check-circle", 15), /*#__PURE__*/React.createElement("span", null, "Uses ", /*#__PURE__*/React.createElement("strong", null, "1"), " of your ", /*#__PURE__*/React.createElement("strong", null, quote.credits_remaining), " included featured credits \u2014 no charge."))) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, "You have no featured credits left. Feature this job for ", /*#__PURE__*/React.createElement("strong", null, days, " days"), " for ", /*#__PURE__*/React.createElement("strong", null, priceLabel), ".", canKhr && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--text-muted)",
        display: "block",
        marginBottom: 6
      }
    }, "Pay in"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, [{
      v: "USD",
      l: fmtMoney("USD", Number(price)) + " · USD"
    }, {
      v: "KHR",
      l: fmtMoney("KHR", Number(price) * fxRate) + " · KHR"
    }].map(function (c) {
      var on = billCur === c.v;
      return /*#__PURE__*/React.createElement("button", {
        key: c.v,
        type: "button",
        onClick: function () {
          setBillCur(c.v);
        },
        style: {
          flex: 1,
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          border: "1.5px solid " + (on ? "var(--brand)" : "var(--border)"),
          background: on ? "var(--brand-subtle)" : "var(--surface-page)",
          color: on ? "var(--text-brand)" : "var(--text-muted)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          cursor: "pointer"
        }
      }, c.l);
    })), billCur === "KHR" && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 6
      }
    }, "At the NBC rate (\u17DB", Math.round(fxRate).toLocaleString(), " / US$1).")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--text-muted)",
        display: "block",
        marginBottom: 6
      }
    }, "Payment method"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6
      }
    }, methods.map(function (m) {
      return /*#__PURE__*/React.createElement("button", {
        key: m.v,
        onClick: function () {
          setMethod(m.v);
        },
        style: {
          padding: "6px 12px",
          borderRadius: "var(--radius-full)",
          border: "1px solid " + (method === m.v ? "var(--brand)" : "var(--border)"),
          background: method === m.v ? "var(--brand-subtle)" : "var(--surface-page)",
          color: method === m.v ? "var(--text-brand)" : "var(--text-muted)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          cursor: "pointer"
        }
      }, m.l);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 10
      }
    }, "Payment is confirmed by an admin. The job becomes featured once the payment is marked paid."))), err && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-xs)",
        marginTop: 10
      }
    }, err)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px 18px",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), !loading && quote && !quote.already_featured && /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: busy,
      onClick: submit
    }, busy ? "Working…" : hasCredits ? "Feature for " + days + " days" : "Pay " + priceLabel)))));
  }

  // Premium homepage slot — paid, time-boxed placement above the regular Featured companies.
  function PremiumSlotCard() {
    const [st, setSt] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [modal, setModal] = React.useState(false);
    const [flash, setFlash] = React.useState("");
    const load = React.useCallback(function () {
      setLoading(true);
      emp.premiumSlotStatus().then(function (d) {
        setSt(d);
        setLoading(false);
      }).catch(function () {
        setLoading(false);
      });
    }, []);
    React.useEffect(function () {
      load();
    }, [load]);
    var fmtDate = function (iso) {
      if (!iso) return "";
      var d = new Date(iso);
      return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getFullYear();
    };
    var money = function (cur, amt) {
      return String(cur).toUpperCase() === "KHR" ? "៛" + Math.round(amt).toLocaleString() : "$" + Number(amt).toFixed(2);
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-table-wrap",
      style: {
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 0,
      style: {
        border: "1px solid #E4C36A"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: "var(--radius-md)",
        background: "linear-gradient(180deg,#F7CE63,#D99A1F)",
        color: "#4a3300"
      }
    }, I("star", 16)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Premium homepage slot")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px"
      }
    }, loading || !st ? /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "Loading\u2026") : st.paid_active ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--text-brand)",
        fontWeight: 700
      }
    }, I("check-circle", 15), " Your company is Premium featured"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, "Active until ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, fmtDate(st.premium_until)), " \xB7 ", st.days_remaining, " days left")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: I("refresh-cw", 15),
      onClick: function () {
        setModal(true);
      }
    }, "Renew (", money(st.currency, st.price), ")")) : st.comp ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--text-brand)",
        fontWeight: 700
      }
    }, I("check-circle", 15), " Your company is featured as Premium by Krama \u2014 no charge.")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6,
        maxWidth: 470
      }
    }, "Feature your company at the top of the homepage \u2014 above the regular Featured companies, with a gold highlight \u2014 for ", /*#__PURE__*/React.createElement("strong", null, st.days, " days"), ".", /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, st.used, " / ", st.limit, " slots taken.")), st.is_full && !st.can_buy ? /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      disabled: true
    }, "Premium is full") : /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("star", 15),
      onClick: function () {
        setModal(true);
      }
    }, "Get premium slot (", money(st.currency, st.price), ")")), flash && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, flash))), modal && /*#__PURE__*/React.createElement(PremiumSlotModal, {
      status: st,
      onClose: function () {
        setModal(false);
      },
      onDone: function (m) {
        setModal(false);
        setFlash(m);
        load();
      }
    }));
  }
  function PremiumSlotModal({
    status,
    onClose,
    onDone
  }) {
    const [method, setMethod] = React.useState("khqr");
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState("");
    const [billCur, setBillCur] = React.useState("USD");
    const [fxRate, setFxRate] = React.useState(null);
    const [khqr, setKhqr] = React.useState(null);
    const [paymentId, setPaymentId] = React.useState(null);
    const [waiting, setWaiting] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const [attempts, setAttempts] = React.useState(0);
    const [notConfirmed, setNotConfirmed] = React.useState(false);
    React.useEffect(function () {
      emp.exchangeRate().then(function (d) {
        if (d && d.rate) setFxRate(Number(d.rate));
      }).catch(function () {});
    }, []);
    React.useEffect(function () {
      if (!waiting || !paymentId || done) return;
      var POLL_LIMIT = 22;
      var t = setInterval(function () {
        emp.verifyPayment(paymentId).then(function (r) {
          if (r && r.status === "paid") {
            setDone(true);
            setNotConfirmed(false);
            onDone && onDone("Payment confirmed — your company is now Premium!");
            return;
          }
          if (r && (r.status === "failed" || r.status === "canceled" || r.status === "declined")) {
            setNotConfirmed(true);
            return;
          }
          setAttempts(function (n) {
            var next = n + 1;
            if (next >= POLL_LIMIT) setNotConfirmed(true);
            return next;
          });
        }).catch(function () {});
      }, 4000);
      return function () {
        clearInterval(t);
      };
    }, [waiting, paymentId, done]);
    var startGateway = function (id) {
      if (method === "khqr") {
        setWaiting(true);
        emp.generateKhqr(id).then(function (d) {
          setKhqr(d.qr);
        }).catch(function (e) {
          setErr(e && e.message || "Could not generate KHQR.");
        });
      } else if (method === "card") {
        setWaiting(true);
        emp.abaForm(id, "cards").then(abaSubmitForm).catch(function (e) {
          setErr(e && e.message || "Could not start card payment.");
        });
      } else if (method === "aba") {
        setWaiting(true);
        emp.abaForm(id).then(abaSubmitForm).catch(function (e) {
          setErr(e && e.message || "Could not start ABA payment.");
        });
      } else {
        onDone && onDone("Payment pending — your company becomes Premium once an admin confirms it.");
      }
    };
    var retryPayment = function () {
      if (!paymentId) {
        onClose();
        return;
      }
      setNotConfirmed(false);
      setAttempts(0);
      setErr("");
      startGateway(paymentId);
    };
    var price = status ? status.price : 0;
    var baseCur = status ? status.currency : "USD";
    var days = status ? status.days : 30;
    var canKhr = fxRate && String(baseCur).toUpperCase() === "USD" && Number(price) > 0;
    var payCur = canKhr ? billCur : baseCur;
    var payAmt = canKhr && billCur === "KHR" ? Math.round(Number(price) * fxRate) : Number(price);
    var fmtMoney = function (cur, amt) {
      return String(cur).toUpperCase() === "KHR" ? "៛" + Math.round(amt).toLocaleString() : "$" + Number(amt).toFixed(2);
    };
    var priceLabel = fmtMoney(payCur, payAmt);
    var methods = [{
      v: "khqr",
      l: "KHQR"
    }, {
      v: "aba",
      l: "ABA"
    }, {
      v: "acleda",
      l: "ACLEDA"
    }, {
      v: "wing",
      l: "Wing"
    }, {
      v: "card",
      l: "Card"
    }, {
      v: "cod",
      l: "Cash"
    }];
    var submit = function () {
      setBusy(true);
      setErr("");
      emp.premiumSlotCheckout(method, canKhr ? billCur : undefined).then(function (r) {
        setBusy(false);
        if (!r || !r.requires_payment) {
          onDone("Your company is now Premium!");
          return;
        }
        var id = r.payment && r.payment.id;
        if (!id) {
          setErr("Could not start the payment.");
          return;
        }
        setPaymentId(id);
        startGateway(id);
      }).catch(function (e) {
        setBusy(false);
        setErr(e && e.message || "Could not start the purchase.");
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 260,
        background: "var(--surface-overlay)",
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
        maxWidth: 440,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: "var(--radius-md)",
        background: "linear-gradient(180deg,#F7CE63,#D99A1F)",
        color: "#4a3300"
      }
    }, I("star", 16)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)"
      }
    }, "Get a premium slot")), notConfirmed ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        border: "1px solid var(--warning-border, #fcd34d)",
        background: "var(--warning-subtle, #fef3c7)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--warning, #d97706)",
        flexShrink: 0
      }
    }, I("triangle-alert", 20)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-strong)"
      }
    }, "Your payment wasn't confirmed."), /*#__PURE__*/React.createElement("br", null), "If you just paid it can take a moment \u2014 otherwise please try again.")), err && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-xs)",
        marginTop: 10
      }
    }, err)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px 18px",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "I'll finish later"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("refresh-cw", 15),
      onClick: retryPayment
    }, "Try payment again"))) : khqr ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "#fff"
      }
    }, /*#__PURE__*/React.createElement(KhqrCanvas, {
      value: khqr,
      size: 200
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        textAlign: "center",
        lineHeight: 1.55
      }
    }, "Scan with any Cambodian banking app to pay ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, priceLabel), ". This confirms automatically once paid."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--brand)"
      }
    }), "Waiting for payment\u2026")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px 18px"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      onClick: onClose
    }, "I'll finish later"))) : waiting ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, method === "card" ? "Complete your Visa / Mastercard payment in the window that opened." : "Complete your ABA payment to activate your premium slot."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-brand)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--brand)"
      }
    }), "Waiting for payment confirmation\u2026"), err && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-xs)"
      }
    }, err)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px 18px"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      onClick: onClose
    }, "I'll finish later"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, "Feature your company above the regular Featured companies (gold highlight) for ", /*#__PURE__*/React.createElement("strong", null, days, " days"), " for ", /*#__PURE__*/React.createElement("strong", null, priceLabel), ".", canKhr && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--text-muted)",
        display: "block",
        marginBottom: 6
      }
    }, "Pay in"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, [{
      v: "USD",
      l: fmtMoney("USD", Number(price)) + " · USD"
    }, {
      v: "KHR",
      l: fmtMoney("KHR", Number(price) * fxRate) + " · KHR"
    }].map(function (c) {
      var on = billCur === c.v;
      return /*#__PURE__*/React.createElement("button", {
        key: c.v,
        type: "button",
        onClick: function () {
          setBillCur(c.v);
        },
        style: {
          flex: 1,
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          border: "1.5px solid " + (on ? "var(--brand)" : "var(--border)"),
          background: on ? "var(--brand-subtle)" : "var(--surface-page)",
          color: on ? "var(--text-brand)" : "var(--text-muted)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          cursor: "pointer"
        }
      }, c.l);
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--text-muted)",
        display: "block",
        marginBottom: 6
      }
    }, "Payment method"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6
      }
    }, methods.map(function (m) {
      return /*#__PURE__*/React.createElement("button", {
        key: m.v,
        onClick: function () {
          setMethod(m.v);
        },
        style: {
          padding: "6px 12px",
          borderRadius: "var(--radius-full)",
          border: "1px solid " + (method === m.v ? "var(--brand)" : "var(--border)"),
          background: method === m.v ? "var(--brand-subtle)" : "var(--surface-page)",
          color: method === m.v ? "var(--text-brand)" : "var(--text-muted)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          cursor: "pointer"
        }
      }, m.l);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 10
      }
    }, "KHQR / ABA / Card confirm automatically. Cash / ACLEDA / Wing are confirmed by an admin."))), err && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--danger)",
        fontSize: "var(--text-xs)",
        marginTop: 10
      }
    }, err)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px 18px",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: busy,
      onClick: submit
    }, busy ? "Working…" : "Pay " + priceLabel)))));
  }
  function PlanPickerModal({
    picker,
    onPick,
    onClose
  }) {
    if (!picker) return null;
    var fmtDate = function (iso) {
      if (!iso) return "No expiry";
      var d = new Date(iso);
      return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getFullYear();
    };
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 250,
        background: "var(--surface-overlay)",
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
        maxWidth: 440,
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
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Choose a plan for this job"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, "You have more than one active plan. Pick which one to spend a job slot from.")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, picker.options.map(function (s) {
      var planName = s.plan ? s.plan.name : "Plan";
      var isCustom = s.job_post_limit != null;
      var rem = s.jobs_limit == null ? "Unlimited" : s.jobs_remaining + " of " + s.jobs_limit + " left";
      return /*#__PURE__*/React.createElement("button", {
        key: s.id,
        onClick: function () {
          onPick(s.id);
        },
        style: {
          textAlign: "left",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-page)",
          padding: "12px 14px",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)",
          fontSize: "var(--text-sm)"
        }
      }, planName, isCustom ? " · Custom slots (Admin assigned)" : ""), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          gap: 5
        }
      }, I("calendar", 12), " Expires ", fmtDate(s.renews_at))), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: "var(--text-brand)",
          whiteSpace: "nowrap"
        }
      }, rem));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 22px 18px",
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"))));
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
      return emp.fetchSupportThread().then(function (d) {
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
      emp.sendSupportMessage(text).then(function () {
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
    }, "Loading\u2026") : msgs.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
      emp.fetchSupportConfig().then(setCfg).catch(function () {
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
  function App() {
    const [page, setPage] = React.useState("dashboard");
    // Language lives in App state purely so changing it re-renders the tree — T() reads the
    // global, so without a state change the new strings would not appear until a reload.
    // Seeded through KIT_LANGS so a language this kit has no dictionary for shows as English.
    const [lang, setLang] = React.useState(KIT_LANGS[window.KRAMA_LANG] ? window.KRAMA_LANG : "en");
    const selectLang = function (code) {
      if (window.KRAMA_SET_LANG) window.KRAMA_SET_LANG(code);
      setLang(window.KRAMA_LANG);
    };
    const [authUser, setAuthUser] = React.useState(null);
    const [authLoading, setAuthLoading] = React.useState(true);
    const [company, setCompany] = React.useState(null);
    const [companyLoaded, setCompanyLoaded] = React.useState(false); // true once the company fetch settles (distinguishes "loading" from "no company yet")
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [jobs, setJobs] = React.useState([]);
    const [jobsLoading, setJobsLoading] = React.useState(true);
    const [posting, setPosting] = React.useState(null);
    const [viewingJob, setViewingJob] = React.useState(null);
    const [sub, setSub] = React.useState(undefined);
    const [quota, setQuota] = React.useState({
      used: 0,
      remaining: null,
      limit: null
    });
    const [allSubs, setAllSubs] = React.useState([]);
    const [planPicker, setPlanPicker] = React.useState(null);
    const [unreadMsg, setUnreadMsg] = React.useState(0);
    const [supportUnread, setSupportUnread] = React.useState(0);
    const [toast, setToast] = React.useState("");
    React.useEffect(() => {
      emp.fetchMe().then(function (u) {
        setAuthUser(u);
        setAuthLoading(false);
      }).catch(function () {
        setAuthLoading(false);
      });
    }, []);
    const loadJobs = React.useCallback(function () {
      setJobsLoading(true);
      emp.fetchJobs().then(function (d) {
        setJobs(d.data || []);
        setJobsLoading(false);
      }).catch(function () {
        setJobsLoading(false);
      });
    }, []);
    const loadSub = React.useCallback(function () {
      emp.fetchSubscription().then(function (r) {
        setSub(r && r.subscription || null);
        setQuota({
          used: r.jobs_used || 0,
          remaining: r.jobs_remaining !== undefined ? r.jobs_remaining : null,
          limit: r.jobs_limit !== undefined ? r.jobs_limit : null
        });
        setAllSubs(Array.isArray(r.all_subscriptions) ? r.all_subscriptions : []);
      }).catch(function () {
        setSub(null);
      });
    }, []);

    // Active/trial subscriptions that still have an open slot, soonest-expiry first.
    const postableSubs = React.useCallback(function () {
      return (allSubs || []).filter(function (s) {
        var live = s.status === "active" || s.status === "trial";
        var notExpired = !s.renews_at || new Date(s.renews_at) > new Date();
        var hasRoom = s.jobs_limit == null || s.jobs_remaining != null && s.jobs_remaining > 0;
        return live && notExpired && hasRoom;
      }).sort(function (a, b) {
        var ax = a.renews_at ? new Date(a.renews_at).getTime() : Infinity;
        var bx = b.renews_at ? new Date(b.renews_at).getTime() : Infinity;
        return ax - bx;
      });
    }, [allSubs]);

    // Publish a job. One eligible plan → publish directly; several → let the user pick.
    const publishJob = React.useCallback(function (jobId, successMsg) {
      var msg = successMsg || "Job published!";
      loadJobs(); // reflect any just-created draft immediately (e.g. picker cancelled)
      var opts = postableSubs();
      var finish = function () {
        setToast(msg);
        setTimeout(function () {
          setToast("");
        }, 3000);
        loadJobs();
        loadSub();
      };
      var fail = function (e) {
        setToast("Error: " + (e && e.message));
        setTimeout(function () {
          setToast("");
        }, 4000);
      };
      if (opts.length > 1) {
        setPlanPicker({
          jobId: jobId,
          options: opts,
          successMsg: msg
        });
        return;
      }
      // 0 or 1 eligible plan — publish directly; API auto-picks or returns a clear error.
      emp.submitJob(jobId, opts.length === 1 ? opts[0].id : undefined).then(finish).catch(fail);
    }, [postableSubs, loadJobs, loadSub]);
    const confirmPlanPick = function (subscriptionId) {
      var pk = planPicker;
      if (!pk) return;
      setPlanPicker(null);
      emp.submitJob(pk.jobId, subscriptionId).then(function () {
        setToast(pk.successMsg);
        setTimeout(function () {
          setToast("");
        }, 3000);
        loadJobs();
        loadSub();
      }).catch(function (e) {
        setToast("Error: " + (e && e.message));
        setTimeout(function () {
          setToast("");
        }, 4000);
      });
    };
    React.useEffect(function () {
      if (!authUser) return;
      emp.fetchCompany().then(setCompany).catch(function () {
        setCompany(null);
      }).then(function () {
        setCompanyLoaded(true);
      });
      loadSub();
      loadJobs();
    }, [authUser, loadJobs, loadSub]);

    // Poll unread message count every 15s
    React.useEffect(function () {
      if (!authUser) return;
      function pollUnread() {
        emp.fetchUnreadCount().then(function (d) {
          setUnreadMsg(d.count || 0);
        }).catch(function () {});
        // Support replies arrive out-of-band (an agent answering in Telegram), so there is
        // nothing to push — piggyback on the existing 15s poll rather than adding a second one.
        emp.fetchSupportUnread().then(function (d) {
          setSupportUnread(d.count || 0);
        }).catch(function () {});
      }
      pollUnread();
      var t = setInterval(pollUnread, 15000);
      return function () {
        clearInterval(t);
      };
    }, [authUser]);
    const handlePost = () => {
      setPosting({
        mode: "create"
      });
    };
    const handleLogout = () => {
      var done = function () {
        localStorage.removeItem("krama_access_token");
        localStorage.removeItem("krama_refresh_token");
        localStorage.removeItem("krama_admin_token");
        localStorage.removeItem("krama_admin_refresh_token");
        window.location.href = HOME_URL;
      };
      emp.logout().then(done).catch(done); // redirect home even if the API call fails
    };
    if (authLoading) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-page)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 36,
          height: 36,
          border: "3px solid var(--border)",
          borderTopColor: "var(--brand)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }
      }), /*#__PURE__*/React.createElement("style", null, "@keyframes spin{to{transform:rotate(360deg)}}"));
    }
    if (!authUser) return /*#__PURE__*/React.createElement(EmployerLogin, {
      onLogin: setAuthUser
    });
    const companyPending = jobs.filter(j => j.status === "company_pending").length;
    const totalApps = jobs.reduce((s, j) => s + (j.applications_count || 0), 0);
    // Company admin sees pending-review badge on jobs tab; recruiters see awaiting-review count
    // Alert badge on Plan & billing when a subscription is pending payment/approval.
    const badges = {
      jobs: companyPending,
      applicants: totalApps,
      messages: unreadMsg,
      support: supportUnread,
      billing: sub && sub.status === "pending" ? 1 : 0
    };
    const titles = {
      dashboard: T("Dashboard"),
      jobs: T("Job postings"),
      applicants: T("Applicant tracking"),
      cvmatch: T("CV Match"),
      talent: T("Find candidates"),
      messages: T("Messages"),
      team: T("Team"),
      company: T("Company profile"),
      billing: T("Plan & billing"),
      support: T("Help & support"),
      profile: T("My Profile")
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        minHeight: "100vh",
        background: "var(--surface-page)"
      }
    }, sidebarOpen && /*#__PURE__*/React.createElement("div", {
      className: "krm-sidebar-backdrop open",
      onClick: () => setSidebarOpen(false)
    }), /*#__PURE__*/React.createElement(Sidebar, {
      page: page,
      onNav: setPage,
      company: company,
      badges: badges,
      open: sidebarOpen,
      onClose: () => setSidebarOpen(false),
      user: authUser,
      lang: lang,
      onLang: selectLang
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column"
      }
    }, /*#__PURE__*/React.createElement(Topbar, {
      title: titles[page] || page,
      user: authUser,
      onLogout: handleLogout,
      onPost: handlePost,
      onNav: setPage,
      onMenu: () => setSidebarOpen(o => !o)
    }), page === "dashboard" && /*#__PURE__*/React.createElement(Overview, {
      jobs: jobs,
      loading: jobsLoading,
      onNav: setPage
    }), page === "jobs" && /*#__PURE__*/React.createElement(JobsManage, {
      jobs: jobs,
      loading: jobsLoading,
      reload: loadJobs,
      onPost: handlePost,
      onPublish: publishJob,
      sub: sub,
      quota: quota,
      onBilling: () => setPage("billing"),
      onView: j => setViewingJob(j),
      onEdit: j => setPosting({
        mode: "edit",
        job: j
      }),
      onClone: j => setPosting({
        mode: "clone",
        job: j
      }),
      user: authUser
    }), page === "applicants" && /*#__PURE__*/React.createElement(Applicants, {
      jobs: jobs,
      onGoToMessages: () => setPage("messages")
    }), page === "cvmatch" && /*#__PURE__*/React.createElement(EmployerCvMatch, null), page === "talent" && /*#__PURE__*/React.createElement(TalentSearch, {
      jobs: jobs,
      onGoToMessages: () => setPage("messages")
    }), page === "team" && isCompanyAdmin(authUser) && /*#__PURE__*/React.createElement(Team, {
      user: authUser
    }), page === "company" && (!companyLoaded ? /*#__PURE__*/React.createElement("div", {
      className: "krm-page-pad",
      style: {
        padding: 28,
        color: "var(--text-muted)"
      }
    }, "Loading\u2026") : company ? /*#__PURE__*/React.createElement(CompanyProfile, {
      company: company,
      onSaved: setCompany,
      jobs: jobs
    }) : /*#__PURE__*/React.createElement(CreateCompanyForm, {
      onCreated: function (c) {
        setCompany(c);
      }
    })), page === "messages" && /*#__PURE__*/React.createElement(Messages, {
      user: authUser
    }), page === "billing" && /*#__PURE__*/React.createElement(Billing, {
      onSubChange: loadSub
    }), page === "profile" && /*#__PURE__*/React.createElement(MyProfile, {
      user: authUser,
      onUserUpdate: u => setAuthUser(u)
    }), page === "support" && /*#__PURE__*/React.createElement(HelpSupport, {
      user: authUser,
      onRead: function () {
        setSupportUnread(0);
      }
    })), /*#__PURE__*/React.createElement(JobFormModal, {
      open: !!posting,
      mode: posting && posting.mode,
      job: posting && posting.job,
      onClose: () => setPosting(null),
      onCreated: function (msg) {
        loadJobs();
        setToast(msg || "Done");
        setTimeout(function () {
          setToast("");
        }, 3000);
      },
      onPublishRequest: publishJob,
      user: authUser
    }), /*#__PURE__*/React.createElement(PlanPickerModal, {
      picker: planPicker,
      onPick: confirmPlanPick,
      onClose: () => setPlanPicker(null)
    }), toast && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 300,
        background: "var(--success)",
        color: "#fff",
        borderRadius: "var(--radius-md)",
        padding: "12px 20px",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        boxShadow: "var(--shadow-lg)",
        animation: "krmrise var(--dur-base) var(--ease-out)"
      }
    }, toast), /*#__PURE__*/React.createElement(JobViewModal, {
      job: viewingJob,
      onClose: () => setViewingJob(null)
    }));
  }
  window.KramaEmployerApp = App;
  window.KRAMA_EMPLOYER_READY = true;
})();