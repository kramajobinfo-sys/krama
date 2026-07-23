// Krama API client — populates window.KRAMA_DATA from the Laravel API.
// Loaded before the JSX components so KRAMA_DATA is ready at render time.
(function () {
  // On localhost (XAMPP) the Laravel API lives under /krama/krama-api/public; on hosting the web root IS the API, so /api.
  var BASE = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : (window.location.protocol + "//" + window.location.host + "/api");

  // ── Token storage ────────────────────────────────────────────────────────
  var LS_ACCESS  = "krama_access_token";
  var LS_REFRESH = "krama_refresh_token";

  function getToken()  { return localStorage.getItem(LS_ACCESS); }
  function setTokens(access, refresh) {
    localStorage.setItem(LS_ACCESS, access);
    if (refresh) localStorage.setItem(LS_REFRESH, refresh);
  }
  function clearTokens() {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
  }

  // ── Raw fetch helpers ────────────────────────────────────────────────────
  function apiFetch(method, path, body, token) {
    var headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    return fetch(BASE + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-cache",
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw e; });
      return r.json();
    });
  }

  function get(path)         { return apiFetch("GET",    path); }
  function authedGet(path)   { return apiFetch("GET",    path, null, getToken()); }
  function post(path, body)  { return apiFetch("POST",   path, body); }
  function authedPost(path, body) { return apiFetch("POST", path, body, getToken()); }
  function authedPut(path, body)  { return apiFetch("PUT", path, body, getToken()); }
  function authedDelete(path)     { return apiFetch("DELETE", path, null, getToken()); }
  // GET that attaches the token when present (guests still allowed) — lets public
  // reads reflect the current user's vote/subscribe state.
  function maybeAuthedGet(path)   { return apiFetch("GET", path, null, getToken()); }

  function qs(params) {
    var parts = [];
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v !== undefined && v !== null && v !== "") parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
    });
    return parts.length ? "?" + parts.join("&") : "";
  }

  // ── Data normalisation helpers ───────────────────────────────────────────
  function parseSalaryNum(s) {
    if (!s) return null;
    var m = String(s).replace(/[,$]/g, '').match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  }

  function fmtSalary(job) {
    if (!job.salary_min && !job.salary_max) return null;
    var sym = job.salary_currency === "USD" ? "$" : job.salary_currency + " ";
    var per = { hour: "/hr", day: "/day", month: "/mo", year: "/yr" }[job.salary_period] || "/mo";
    function fmt(n) { return n ? Number(n).toLocaleString() : null; }
    if (job.salary_min && job.salary_max) return sym + fmt(job.salary_min) + "–" + fmt(job.salary_max) + per;
    if (job.salary_max) return "Up to " + sym + fmt(job.salary_max) + per;
    return sym + fmt(job.salary_min) + "+" + per;
  }

  function fmtPostedAt(iso) {
    if (!iso) return "";
    var now  = Date.now();
    var then = new Date(iso).getTime();
    var diff = Math.max(0, now - then);
    var mins = Math.floor(diff / 60000);
    if (mins < 60)  return mins + "m ago";
    var hrs = Math.floor(mins / 60);
    if (hrs < 24)   return hrs + "h ago";
    var days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    if (days < 7)   return days + "d ago";
    return Math.floor(days / 7) + "w ago";
  }

  function fmtJobType(t) {
    return { full_time: "Full-time", part_time: "Part-time", contract: "Contract",
             internship: "Internship", temporary: "Temporary" }[t] || t;
  }

  function normaliseJob(j) {
    var co = (j.company && typeof j.company === "object") ? j.company : {};
    var companyName = co.name || (typeof j.company === "string" ? j.company : "");
    var locationName = j.location ? j.location.name : "";
    var catName = j.category ? j.category.name : "";
    var EXP_LABEL = { entry: "Entry level", junior: "Junior", mid: "Mid level", senior: "Senior", lead: "Lead", executive: "Executive" };
    return {
      id:              j.id,
      title:           j.title,
      company:         companyName,
      companyId:       j.company_id,
      companyIndustry: co.industry || "",
      companyWebsite:  co.website  || "",
      companyAddress:  co.address  || "",
      isVerified:      !!co.is_verified,
      location:        locationName || (j.is_remote ? "Remote" : ""),
      salary:          fmtSalary(j),
      type:            fmtJobType(j.job_type),
      remote:          !!j.is_remote,
      featured:        !!j.is_featured,
      postedAt:        fmtPostedAt(j.published_at || j.created_at),
      expiresAt:       j.expires_at ? String(j.expires_at).slice(0, 10) : null,
      category:        catName,
      workingDays:     j.working_days || null,
      workingTime:     j.working_time || null,
      mapLocation:     j.map_location || null,
      experienceLevel: j.experience_level ? (EXP_LABEL[j.experience_level] || j.experience_level) : null,
      description:     j.description  || null,
      requirements:    j.requirements || null,
      benefits:        j.benefits     || null,
      slug:            j.slug,
      logo:            co.logo_url || (window.KRAMA_LOGOS || {})[companyName] || null,
      salaryMin:       parseSalaryNum(j.salary_min),
      salaryMax:       parseSalaryNum(j.salary_max),
      _raw:            j,
    };
  }

  function normaliseCompany(c) {
    return {
      id:        c.id,
      name:      c.name,
      industry:  c.industry || "",
      location:  c.location ? c.location.name : "",
      openJobs:      c.open_jobs_count || 0,
      followerCount: c.follower_count  || 0,
      verified:      !!c.is_verified,
      logo:      c.logo_url || (window.KRAMA_LOGOS || {})[c.name] || null,
    };
  }

  function normaliseBanner(b) {
    return {
      id:      String(b.id),
      active:  b.is_active,
      title:   b.title,
      message: b.message || "",
      cta:     b.cta_label || "",
      ctaUrl:  b.cta_url || "",
      theme:   b.theme || "saffron",
      icon:    b.icon || "megaphone",
      image:   b.image_url || "",
      align:   b.text_align || "left",
      fit:     b.image_fit || "cover",
      start:   b.starts_at ? String(b.starts_at).slice(0, 10) : "",
      end:     b.ends_at ? String(b.ends_at).slice(0, 10) : "",
    };
  }

  // ── Bootstrap — fetch all public data, populate KRAMA_DATA in place ──────
  function init() {
    var D = window.KRAMA_DATA;

    var jobs = get("/jobs?per_page=100").then(function (r) {
      var normalised = (r.data || []).map(normaliseJob);
      D.jobs = normalised;
      // Attach logos
      var L = window.KRAMA_LOGOS || {};
      normalised.forEach(function (j) { if (!j.logo && L[j.company]) j.logo = L[j.company]; });
    }).catch(function () { /* keep static fallback */ });

    var companies = get("/companies?per_page=100").then(function (r) {
      var normalised = (r.data || []).map(normaliseCompany);
      D.companies = normalised;
      var L = window.KRAMA_LOGOS || {};
      normalised.forEach(function (c) { if (!c.logo && L[c.name]) c.logo = L[c.name]; });
    }).catch(function () {});

    var banners = get("/banners").then(function (r) {
      D.banners = (r || []).map(normaliseBanner);
    }).catch(function () {});

    var categories = get("/categories").then(function (r) {
      var cats = (r || []).map(function(c) {
        return { name: c.name, slug: c.slug, icon: c.icon || "briefcase", count: 0 };
      });
      if (cats.length > 0) D.categories = cats;
    }).catch(function () {});
    // Rebuild category counts after both jobs and categories resolve
    var catCounts = Promise.all([jobs, categories]).then(function () {
      var counts = {};
      (D.jobs || []).forEach(function (j) {
        if (j.category) counts[j.category] = (counts[j.category] || 0) + 1;
      });
      D.categories = D.categories.map(function (c) {
        return Object.assign({}, c, { count: counts[c.name] || c.count });
      });
    }).catch(function () {});

    var settings = get("/settings/homepage").then(function (s) {
      D._homepageSettings = s;
    }).catch(function () {});

    return Promise.all([jobs, companies, banners, catCounts, settings]);
  }

  // ── Auth helpers ─────────────────────────────────────────────────────────
  // identifier may be an email or a phone number.
  function login(identifier, password) {
    return post("/auth/login", { identifier: identifier, password: password }).then(function (r) {
      setTokens(r.access_token, r.refresh_token);
      window.KRAMA_AUTH.user = r.user;
      return r.user;
    });
  }

  // payload: { name, password, role, and either email OR (phone + otp) }
  function register(payload) {
    return post("/auth/register", payload).then(function (r) {
      setTokens(r.access_token, r.refresh_token);
      window.KRAMA_AUTH.user = r.user;
      return r.user;
    });
  }

  // Request an SMS OTP for phone registration.
  function requestOtp(phone) {
    return post("/auth/request-otp", { phone: phone });
  }

  function socialLogin(provider, token) {
    return post("/auth/social", { provider: provider, token: token }).then(function (r) {
      setTokens(r.access_token, r.refresh_token);
      window.KRAMA_AUTH.user = r.user;
      return r.user;
    });
  }

  function forgotPassword(email) {
    return post("/auth/password/forgot", { email: email });
  }

  function resetPassword(email, token, password, passwordConfirmation) {
    return post("/auth/password/reset", {
      email: email,
      token: token,
      password: password,
      password_confirmation: passwordConfirmation,
    });
  }

  function logout() {
    var refresh = localStorage.getItem(LS_REFRESH);
    if (getToken() && refresh) {
      authedPost("/auth/logout", { refresh_token: refresh }).catch(function () {});
    }
    clearTokens();
    window.KRAMA_AUTH.user = null;
  }

  function fetchMe() {
    if (!getToken()) return Promise.resolve(null);
    return authedGet("/auth/me").then(function (u) {
      window.KRAMA_AUTH.user = u;
      return u;
    }).catch(function () {
      clearTokens();
      return null;
    });
  }

  function applyToJob(jobId, coverNote) {
    return authedPost("/jobs/" + jobId + "/apply", { cover_note: coverNote });
  }

  function checkApplied(jobId) {
    if (!getToken()) return Promise.resolve({ applied: false });
    return authedGet("/jobs/" + jobId + "/applied");
  }

  // Public company profile — returns { company, jobs }. company includes gallery, awards, social_links.
  function fetchCompany(id) { return get("/companies/" + id); }

  // Public plans — active subscription tiers only, ordered by price (source of truth for the Pricing page).
  function fetchPlans() { return get("/plans"); }

  function saveJob(jobId)   { return authedPost("/jobs/" + jobId + "/save", {}); }
  function unsaveJob(jobId) {
    return fetch(BASE + "/jobs/" + jobId + "/save", {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + getToken() },
    }).then(function (r) { return r.json(); });
  }

  // ── Expose ────────────────────────────────────────────────────────────────
  function getMyResume() {
    return authedGet("/candidate/resume").then(function (r) { return r.resume || r; });
  }

  function updateMe(data) {
    return fetch(BASE + "/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
      body: JSON.stringify(data),
    }).then(function (r) {
      return r.json().then(function (body) {
        if (!r.ok) throw body;
        window.KRAMA_AUTH.user = body;
        return body;
      });
    });
  }

  window.KRAMA_AUTH = { user: null };
  function followCompany(id)   { return authedPost("/companies/" + id + "/follow", {}); }
  function unfollowCompany(id) {
    return fetch(BASE + "/companies/" + id + "/follow", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
    }).then(function(r) { return r.json().then(function(d){ if(!r.ok) throw new Error(d.message||"Failed"); return d; }); });
  }
  function checkFollowing(id)  { return authedGet("/companies/" + id + "/follow"); }

  function fetchReviews(companyId, page) {
    var qs = "?page=" + (page || 1);
    return fetch(BASE + "/companies/" + companyId + "/reviews" + qs)
      .then(function(r) { return r.json().then(function(d) { if (!r.ok) throw new Error(d.message || "Failed"); return d; }); });
  }
  function submitReview(companyId, data) {
    return fetch(BASE + "/companies/" + companyId + "/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
      body: JSON.stringify(data),
    }).then(function(r) { return r.json().then(function(d) { if (!r.ok) throw new Error(d.message || (d.errors ? Object.values(d.errors).flat().join("; ") : "Failed")); return d; }); });
  }

  // ── Community forum ────────────────────────────────────────────────────────
  function forumCategories()            { return maybeAuthedGet("/forum/categories"); }
  function forumThreads(params)         { return maybeAuthedGet("/forum/threads" + qs(params)); }
  function forumThread(id)              { return maybeAuthedGet("/forum/threads/" + id); }
  function forumReplies(id, page)       { return maybeAuthedGet("/forum/threads/" + id + "/replies" + qs({ page: page || 1 })); }
  function forumCreateThread(payload)   { return authedPost("/forum/threads", payload); }
  function forumUpdateThread(id, p)     { return authedPut("/forum/threads/" + id, p); }
  function forumDeleteThread(id)        { return authedDelete("/forum/threads/" + id); }
  function forumVoteThread(id)          { return authedPost("/forum/threads/" + id + "/vote", {}); }
  function forumSubscribe(id)           { return authedPost("/forum/threads/" + id + "/subscribe", {}); }
  function forumUnsubscribe(id)         { return authedDelete("/forum/threads/" + id + "/subscribe"); }
  function forumCreateReply(tid, p)     { return authedPost("/forum/threads/" + tid + "/replies", p); }
  function forumUpdateReply(id, p)      { return authedPut("/forum/replies/" + id, p); }
  function forumDeleteReply(id)         { return authedDelete("/forum/replies/" + id); }
  function forumVoteReply(id)           { return authedPost("/forum/replies/" + id + "/vote", {}); }
  function forumReport(payload)         { return authedPost("/forum/report", payload); }

  window.KRAMA_API  = {
    init: init, login: login, register: register, requestOtp: requestOtp, logout: logout,
    socialLogin: socialLogin,
    forgotPassword: forgotPassword, resetPassword: resetPassword,
    fetchMe: fetchMe, updateMe: updateMe,
    applyToJob: applyToJob, checkApplied: checkApplied, fetchCompany: fetchCompany, fetchPlans: fetchPlans,
    saveJob: saveJob, unsaveJob: unsaveJob,
    getMyResume: getMyResume,
    followCompany: followCompany, unfollowCompany: unfollowCompany, checkFollowing: checkFollowing,
    fetchReviews: fetchReviews, submitReview: submitReview,
    getToken: getToken, authedGet: authedGet, authedPost: authedPost,
    normaliseJob: normaliseJob,
    forumCategories: forumCategories, forumThreads: forumThreads, forumThread: forumThread, forumReplies: forumReplies,
    forumCreateThread: forumCreateThread, forumUpdateThread: forumUpdateThread, forumDeleteThread: forumDeleteThread,
    forumVoteThread: forumVoteThread, forumSubscribe: forumSubscribe, forumUnsubscribe: forumUnsubscribe,
    forumCreateReply: forumCreateReply, forumUpdateReply: forumUpdateReply, forumDeleteReply: forumDeleteReply,
    forumVoteReply: forumVoteReply, forumReport: forumReport,
  };
})();
