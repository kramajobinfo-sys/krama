// Krama admin API client — wraps the Laravel backend for the admin dashboard.
(function () {
  // On localhost (XAMPP) the Laravel API lives under /krama/krama-api/public; on hosting the web root IS the API, so /api.
  const BASE = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : (window.location.protocol + "//" + window.location.host + "/api");
  const TOKEN_KEY = "krama_admin_token";
  const REFRESH_KEY = "krama_admin_refresh_token";

  function getToken() { return localStorage.getItem(TOKEN_KEY); }

  function headers(extra) {
    return Object.assign({ "Content-Type": "application/json", Authorization: "Bearer " + getToken() }, extra);
  }

  function doReq(method, path, body, tok) {
    var opts = { method: method, headers: headers(tok ? { Authorization: "Bearer " + tok } : {}) };
    if (body !== undefined) opts.body = JSON.stringify(body);
    return fetch(BASE + path, opts);
  }

  var _refreshing = null;
  function refreshToken() {
    if (_refreshing) return _refreshing;
    var rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) return Promise.reject(new Error("Session expired. Please log in again."));
    _refreshing = fetch(BASE + "/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    }).then(function(r) {
      return r.json().then(function(d) {
        _refreshing = null;
        if (!r.ok) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_KEY);
          return Promise.reject(new Error("Session expired. Please log in again."));
        }
        localStorage.setItem(TOKEN_KEY, d.access_token);
        if (d.refresh_token) localStorage.setItem(REFRESH_KEY, d.refresh_token);
        return d.access_token;
      });
    }).catch(function(e) { _refreshing = null; return Promise.reject(e); });
    return _refreshing;
  }

  function req(method, path, body) {
    return doReq(method, path, body, null).then(function(r) {
      return r.json().then(function(d) {
        if (r.status === 401) {
          return refreshToken().then(function(newTok) {
            return doReq(method, path, body, newTok).then(function(r2) {
              return r2.json().then(function(d2) {
                if (!r2.ok) {
                  var _e2 = d2 && d2.errors;
                  var _m2 = _e2 ? Object.values(_e2).map(function(e){return Array.isArray(e)?e[0]:e;}).join('; ') : ((d2 && d2.message) || 'Request failed');
                  return Promise.reject(new Error(_m2));
                }
                return d2;
              });
            });
          });
        }
        if (!r.ok) {
          var _errs = d && d.errors;
          var _emsg = _errs ? Object.values(_errs).map(function(e){return Array.isArray(e)?e[0]:e;}).join('; ') : ((d && d.message) || 'Request failed');
          return Promise.reject(new Error(_emsg));
        }
        return d;
      });
    });
  }

  // Banner field mappers (API ↔ UI)
  function bannerFromApi(b) {
    return {
      id: b.id,
      title: b.title || "",
      message: b.message || "",
      cta: b.cta_label || "",
      theme: b.theme || "saffron",
      icon: b.icon || "megaphone",
      image: b.image_url || "",
      align: b.text_align || "left",
      fit: b.image_fit || "cover",
      active: !!b.is_active,
      start: b.starts_at ? String(b.starts_at).slice(0, 10) : "",
      end: b.ends_at ? String(b.ends_at).slice(0, 10) : "",
      sort_order: b.sort_order || 0,
    };
  }

  var _VALID_THEMES = { saffron: 1, teal: 1, dark: 1 };

  function bannerToApi(d) {
    return {
      title: d.title,
      message: d.message || null,
      cta_label: d.cta || null,
      cta_url: null,
      theme: _VALID_THEMES[d.theme] ? d.theme : "saffron",
      icon: d.icon || "megaphone",
      // skip image_url if it's a local data: URI (API validates URL format)
      image_url: d.image && /^https?:/.test(d.image) ? d.image : null,
      image_fit: d.fit || "cover",
      text_align: d.align || "left",
      is_active: !!d.active,
      starts_at: d.start || null,
      ends_at: d.end || null,
    };
  }

  window.KRAMA_ADMIN_API = {
    // Auth
    login: function (email, password) {
      return fetch(BASE + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok) return Promise.reject(new Error(d.message || "Login failed"));
          var u = d.user;
          if (!u || !u.role || (u.role.slug !== "admin" && u.role.slug !== "super_admin")) {
            return Promise.reject(new Error("Access denied. Admin or super-admin credentials required."));
          }
          localStorage.setItem(TOKEN_KEY, d.access_token);
          if (d.refresh_token) localStorage.setItem(REFRESH_KEY, d.refresh_token);
          return u;
        });
      });
    },

    logout: function () {
      var token = getToken();
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      if (!token) return Promise.resolve();
      return fetch(BASE + "/auth/logout", { method: "POST", headers: { Authorization: "Bearer " + token } }).catch(function () {});
    },

    fetchMe: function () {
      var token = getToken();
      if (!token) return Promise.resolve(null);
      return fetch(BASE + "/auth/me", { headers: { Authorization: "Bearer " + token } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) {
          var u = d.user || d;
          if (!u.role || (u.role.slug !== "admin" && u.role.slug !== "super_admin")) {
            localStorage.removeItem(TOKEN_KEY);
            return null;
          }
          return u;
        })
        .catch(function () { localStorage.removeItem(TOKEN_KEY); return null; });
    },

    updateMe: function (data) { return req("PATCH", "/auth/me", data); },
    changePassword: function (currentPassword, newPassword) { return req("POST", "/auth/me/password", { current_password: currentPassword, password: newPassword, password_confirmation: newPassword }); },
    uploadAvatar: function (file) {
      var token = getToken();
      var form = new FormData();
      form.append("avatar", file);
      return fetch(BASE + "/auth/me/avatar", { method: "POST", headers: { Authorization: "Bearer " + token }, body: form })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.user || d; }); });
    },

    // Dashboard KPIs
    // Accurate overview figures from a dedicated backend endpoint (exact COUNT/SUM, real
    // month-to-date revenue in USD-equivalent, and a real monthly job-post series).
    fetchStats: function () { return req("GET", "/admin/stats"); },

    // Jobs (admin listing — supports any status; public /jobs only returns published)
    fetchJobs: function (status, page, search) {
      var qs = status ? "?status=" + status + "&per_page=30&page=" + (page || 1) : "?per_page=30&page=" + (page || 1);
      if (search) qs += "&search=" + encodeURIComponent(search);
      return req("GET", "/admin/jobs" + qs);
    },

    approveJob: function (id) { return req("PATCH", "/jobs/" + id + "/approve"); },
    rejectJob: function (id, reason) { return req("PATCH", "/jobs/" + id + "/reject", { reason: reason }); },
    toggleJobFeatured: function (id) { return req("PATCH", "/admin/jobs/" + id + "/feature"); },
    // Post a job on behalf of an employer (publishes immediately for the chosen company).
    adminCreateJob: function (data) { return req("POST", "/admin/jobs", data); },
    // Edit / remove a job posted on an employer's behalf. Delete is refused by the API
    // once the job has applicants (422) — take it down instead.
    adminUpdateJob: function (id, data) { return req("PUT", "/admin/jobs/" + id, data); },
    adminDeleteJob: function (id) { return req("DELETE", "/admin/jobs/" + id); },
    adminBulkImportJobs: function (rows) { return req("POST", "/admin/jobs/bulk-import", { rows: rows }); },
    aiDraftJob: function (data) { return req("POST", "/admin/jobs/ai-draft", data); },

    // Experience levels
    fetchExperienceLevels: function () { return req("GET", "/admin/experience-levels"); },
    createExperienceLevel: function (data) { return req("POST", "/admin/experience-levels", data); },
    updateExperienceLevel: function (id, data) { return req("PUT", "/admin/experience-levels/" + id, data); },
    deleteExperienceLevel: function (id) { return req("DELETE", "/admin/experience-levels/" + id); },

    // Locations
    fetchLocations: function () { return req("GET", "/admin/locations"); },
    createLocation: function (data) { return req("POST", "/admin/locations", data); },
    updateLocation: function (id, data) { return req("PUT", "/admin/locations/" + id, data); },
    deleteLocation: function (id) { return req("DELETE", "/admin/locations/" + id); },

    // Categories
    fetchCategories: function () { return req("GET", "/admin/categories"); },
    createCategory: function (data) { return req("POST", "/admin/categories", data); },
    updateCategory: function (id, data) { return req("PUT", "/admin/categories/" + id, data); },
    deleteCategory: function (id) { return req("DELETE", "/admin/categories/" + id); },

    // Companies
    fetchCompanies: function (status, page, perPage, search) {
      var pp = perPage || 30;
      var qs = status && status !== "all" ? "?status=" + status + "&per_page=" + pp + "&page=" + (page || 1) : "?per_page=" + pp + "&page=" + (page || 1);
      if (search) qs += "&search=" + encodeURIComponent(search);
      return req("GET", "/admin/companies" + qs);
    },

    // Download a CSV export from an authenticated admin endpoint. Fetches with the bearer
    // token (a plain link can't send it), then hands the browser a Blob to save.
    downloadCsv: function (path, filename) {
      return fetch(BASE + path, { headers: { Authorization: "Bearer " + getToken() } })
        .then(function (r) { if (!r.ok) throw new Error("Export failed (HTTP " + r.status + ")"); return r.blob(); })
        .then(function (blob) {
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url; a.download = filename;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        });
    },

    // Candidates
    fetchCandidates: function (status, page, perPage, search) {
      var pp = perPage || 10;
      var qs = "?per_page=" + pp + "&page=" + (page || 1);
      if (status && status !== "all") qs += "&status=" + status;
      if (search) qs += "&search=" + encodeURIComponent(search);
      return req("GET", "/admin/candidates" + qs);
    },
    setCandidateStatus: function (id, status) { return req("PATCH", "/admin/candidates/" + id + "/status", { status: status }); },

    // All users (requires manage_users permission)
    fetchUsers: function (role, page, search) {
      var qs = "?per_page=100&page=" + (page || 1);
      if (role && role !== "all") qs += "&role=" + role;
      if (search) qs += "&search=" + encodeURIComponent(search);
      return req("GET", "/admin/users" + qs);
    },
    createUser: function (data) { return req("POST", "/admin/users", data); },
    updateUser: function (id, data) { return req("PATCH", "/admin/users/" + id, data); },
    changeUserPassword: function (id, password) { return req("PATCH", "/admin/users/" + id, { password: password }); },
    deleteUser: function (id) { return req("DELETE", "/admin/users/" + id); },
    // Per-role permissions (manage_roles). fetchRoles -> { roles:[{slug,permissions[]}], catalog:[{group,perms[]}] }.
    fetchRoles: function () { return req("GET", "/admin/roles"); },
    updateRolePermissions: function (roleId, permissions) { return req("PUT", "/admin/roles/" + roleId + "/permissions", { permissions: permissions }); },

    approveCompany: function (id) { return req("PATCH", "/admin/companies/" + id + "/approve"); },
    rejectCompany: function (id) { return req("PATCH", "/admin/companies/" + id + "/reject"); },
    suspendCompany: function (id) { return req("PATCH", "/admin/companies/" + id + "/suspend"); },
    reinstateCompany: function (id) { return req("PATCH", "/admin/companies/" + id + "/approve"); },
    verifyCompany: function (id) { return req("PATCH", "/admin/companies/" + id + "/verify"); },
    // Organization verification (free-tier eligibility): classify + verify NGO/gov/education/international.
    orgReviewCompany: function (id, data) { return req("PATCH", "/admin/companies/" + id + "/org-review", data); },
    // Fetch the private org proof document (auth-gated) as an object URL to open in a new tab —
    // a plain <a href> can't carry the Bearer token, so we fetch the blob and window.open it.
    orgDocumentUrl: function (id) {
      return fetch(BASE + "/companies/" + id + "/org-document", { headers: { Authorization: "Bearer " + getToken() } })
        .then(function (r) { if (!r.ok) throw new Error("Could not load the document (" + r.status + ")"); return r.blob(); })
        .then(function (b) { return URL.createObjectURL(b); });
    },
    // Admin creates a company shell (assign an employer to it later via addCompanyMember).
    createCompany: function (data) { return req("POST", "/admin/companies", data); },
    fetchCompanyDetail: function (id) { return req("GET", "/admin/companies/" + id); },
    updateCompany: function (id, data) { return req("PUT", "/admin/companies/" + id, data); },
    // Refused by the API (422) once the company is assigned to an employer or has jobs —
    // only an unassigned, empty admin-created shell can be removed.
    deleteCompany: function (id) { return req("DELETE", "/admin/companies/" + id); },
    // Gallery
    uploadCompanyGalleryPhoto: function (id, file) {
      var fd = new FormData(); fd.append("photo", file);
      return fetch(BASE + "/admin/companies/" + id + "/gallery", { method: "POST", headers: { Authorization: "Bearer " + getToken() }, body: fd })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.photo || d; }); });
    },
    updateCompanyGalleryCaption: function (id, photoId, caption) { return req("PATCH", "/admin/companies/" + id + "/gallery/" + photoId, { caption: caption }); },
    deleteCompanyGalleryPhoto: function (id, photoId) { return req("DELETE", "/admin/companies/" + id + "/gallery/" + photoId); },
    uploadCompanyAboutImage: function (id, file) {
      var fd = new FormData(); fd.append("image", file);
      return fetch(BASE + "/admin/companies/" + id + "/about-image", { method: "POST", headers: { Authorization: "Bearer " + getToken() }, body: fd })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.company || d; }); });
    },
    // Awards
    createCompanyAward: function (id, data) { return req("POST", "/admin/companies/" + id + "/awards", data); },
    uploadCompanyAwardImage: function (id, awardId, file) {
      var fd = new FormData(); fd.append("image", file);
      return fetch(BASE + "/admin/companies/" + id + "/awards/" + awardId + "/image", { method: "POST", headers: { Authorization: "Bearer " + getToken() }, body: fd })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.award || d; }); });
    },
    deleteCompanyAward: function (id, awardId) { return req("DELETE", "/admin/companies/" + id + "/awards/" + awardId); },
    // Company access / team: assign users with a role (company_admin = full control).
    companyMembers: function (id) { return req("GET", "/admin/companies/" + id + "/members"); },
    addCompanyMember: function (id, data) { return req("POST", "/admin/companies/" + id + "/members", data); },
    updateCompanyMember: function (id, userId, data) { return req("PATCH", "/admin/companies/" + id + "/members/" + userId, data); },
    removeCompanyMember: function (id, userId) { return req("DELETE", "/admin/companies/" + id + "/members/" + userId); },
    uploadCompanyLogo: function (id, file) {
      var form = new FormData();
      form.append("logo", file);
      return fetch(BASE + "/admin/companies/" + id + "/logo", { method: "POST", headers: { Authorization: "Bearer " + getToken() }, body: form })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.company || d; }); });
    },
    uploadCompanyCoverBanner: function (id, file) {
      var form = new FormData();
      form.append("image", file);
      return fetch(BASE + "/admin/companies/" + id + "/cover-banner", { method: "POST", headers: { Authorization: "Bearer " + getToken() }, body: form })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.company || d; }); });
    },

    // Banners
    fetchBanners: function () {
      return req("GET", "/admin/banners").then(function (data) {
        return (Array.isArray(data) ? data : (data.data || [])).map(bannerFromApi);
      });
    },

    createBanner: function (d) {
      return req("POST", "/admin/banners", bannerToApi(d)).then(bannerFromApi);
    },

    updateBanner: function (id, d) {
      return req("PUT", "/admin/banners/" + id, bannerToApi(d)).then(bannerFromApi);
    },

    deleteBanner: function (id) { return req("DELETE", "/admin/banners/" + id); },

    reorderBanners: function (ids) { return req("PATCH", "/admin/banners/reorder", { order: ids }); },

    // Payments
    fetchPayments: function (page) {
      return req("GET", "/admin/payments?page=" + (page || 1));
    },

    markPaid: function (id) { return req("POST", "/admin/payments/" + id + "/mark-paid"); },
    refundPayment: function (id) { return req("POST", "/admin/payments/" + id + "/refund"); },

    // Reports
    fetchReportSummary: function (year) { return req("GET", "/admin/reports/summary" + (year ? "?year=" + year : "")); },

    // Audit log
    fetchAuditLog: function (params) {
      params = params || {};
      var qs = "?per_page=" + (params.perPage || 30) + "&page=" + (params.page || 1);
      if (params.action) qs += "&action=" + encodeURIComponent(params.action);
      if (params.q) qs += "&q=" + encodeURIComponent(params.q);
      return req("GET", "/admin/audit" + qs);
    },

    // Plans
    fetchPlans: function () { return req("GET", "/admin/plans"); },
    createPlan: function (data) { return req("POST", "/admin/plans", data); },
    updatePlan: function (id, data) { return req("PUT", "/admin/plans/" + id, data); },
    deletePlan: function (id) { return req("DELETE", "/admin/plans/" + id); },

    // Coupons (promo / event discount codes)
    fetchCoupons: function (page, q) {
      var qs = "?per_page=50&page=" + (page || 1);
      if (q) qs += "&q=" + encodeURIComponent(q);
      return req("GET", "/admin/coupons" + qs);
    },
    createCoupon: function (data) { return req("POST", "/admin/coupons", data); },
    updateCoupon: function (id, data) { return req("PUT", "/admin/coupons/" + id, data); },
    deleteCoupon: function (id) { return req("DELETE", "/admin/coupons/" + id); },
    fetchCouponRedemptions: function (id, page) { return req("GET", "/admin/coupons/" + id + "/redemptions?per_page=50&page=" + (page || 1)); },

    // Subscriptions
    fetchSubscriptions: function (status, page) {
      var qs = "?per_page=20&page=" + (page || 1);
      if (status && status !== "all") qs += "&status=" + status;
      return req("GET", "/admin/subscriptions" + qs);
    },
    createSubscription: function (data) { return req("POST", "/admin/subscriptions", data); },
    updateSubscription: function (id, data) { return req("PUT", "/admin/subscriptions/" + id, data); },

    // Settings
    fetchSettings: function (group) { return req("GET", "/admin/settings/" + group); },
    fetchPremiumOverview: function () { return req("GET", "/admin/premium/overview"); },
    fetchNbcRate: function () { return req("GET", "/admin/exchange-rate"); },
    fetchSeoOverview: function () { return req("GET", "/admin/seo/overview"); },
    testGoogleIndexing: function () { return req("POST", "/admin/seo/indexing/test", {}); },
    fetchFeedSources: function () { return req("GET", "/admin/feed-sources"); },
    createFeedSource: function (data) { return req("POST", "/admin/feed-sources", data); },
    updateFeedSource: function (id, data) { return req("PUT", "/admin/feed-sources/" + id, data); },
    deleteFeedSource: function (id) { return req("DELETE", "/admin/feed-sources/" + id); },
    runFeedSource: function (id) { return req("POST", "/admin/feed-sources/" + id + "/run", {}); },
    updateSettings: function (group, data) { return req("PATCH", "/admin/settings/" + group, data); },
    testSmtp: function (email) { return req("POST", "/admin/settings/smtp/test", { email: email }); },
    testTelegram: function () { return req("POST", "/admin/settings/telegram/test", {}); },
    activateTelegram: function () { return req("POST", "/admin/settings/telegram/activate", {}); },
    testSms: function (phone) { return req("POST", "/admin/settings/sms/test", { phone: phone }); },
    testSocial: function () { return req("POST", "/admin/settings/social/test", {}); },

    // Image upload (banner/hero backgrounds — returns a public URL)
    uploadImage: function (file) {
      var form = new FormData();
      form.append("image", file);
      function doUp(tok) {
        return fetch(BASE + "/admin/upload/image", {
          method: "POST",
          headers: { Authorization: "Bearer " + (tok || getToken()) },
          body: form,
        }).then(function (r) {
          return r.json().then(function (d) {
            if (r.status === 401) {
              return refreshToken().then(function (newTok) { return doUp(newTok); });
            }
            if (!r.ok) throw new Error(d.message || "Upload failed");
            return d.url;
          });
        });
      }
      return doUp(null);
    },

    // Reviews
    fetchReviews: function (status, page) {
      var qs = "?status=" + (status || "pending") + "&page=" + (page || 1);
      return req("GET", "/admin/reviews" + qs);
    },
    approveReview: function (id) { return req("PATCH", "/admin/reviews/" + id + "/approve"); },
    rejectReview:  function (id) { return req("PATCH", "/admin/reviews/" + id + "/reject"); },

    // Resumes
    fetchResumes: function (q, page, perPage) {
      var qs = "?per_page=" + (perPage || 10) + "&page=" + (page || 1);
      if (q) qs += "&q=" + encodeURIComponent(q);
      return req("GET", "/admin/resumes" + qs);
    },
    fetchResume: function (id) { return req("GET", "/admin/resumes/" + id); },

    // CV matching / comparison
    cvMatchSuggest: function (referenceId, limit) { return req("POST", "/admin/cv-match/suggest", { reference_id: referenceId, limit: limit || 3 }); },
    cvMatchCompare: function (referenceId, targetIds) { return req("POST", "/admin/cv-match/compare", { reference_id: referenceId, target_ids: targetIds }); },

    // Notifications (admin's own bell)
    fetchNotifications: function () { return req("GET", "/notifications"); },
    fetchNotifUnread: function () { return req("GET", "/notifications/unread"); },
    markNotifRead: function (id) { return req("POST", "/notifications/" + id + "/read"); },
    markAllNotifRead: function () { return req("POST", "/notifications/read-all"); },

    // Community forum moderation
    forumReports: function (params) {
      params = params || {};
      var qs = "?status=" + encodeURIComponent(params.status || "open") + "&page=" + (params.page || 1);
      return req("GET", "/admin/forum/reports" + qs);
    },
    forumResolveReport: function (id, status, action) { return req("PATCH", "/admin/forum/reports/" + id, { status: status, action: action || "none" }); },
    forumAdminThreads: function (params) {
      params = params || {};
      var qs = "?page=" + (params.page || 1) + (params.q ? "&q=" + encodeURIComponent(params.q) : "") + (params.category_id ? "&category_id=" + params.category_id : "");
      return req("GET", "/admin/forum/threads" + qs);
    },
    forumModerateThread: function (id, changes) { return req("PATCH", "/admin/forum/threads/" + id + "/moderate", changes); },
    forumDeleteThread: function (id) { return req("DELETE", "/admin/forum/threads/" + id); },
    forumModerateReply: function (id, hidden) { return req("PATCH", "/admin/forum/replies/" + id + "/moderate", { is_hidden: hidden }); },
    forumDeleteReply: function (id) { return req("DELETE", "/admin/forum/replies/" + id); },
    forumCategories: function () { return req("GET", "/admin/forum/categories"); },
    forumCreateCategory: function (data) { return req("POST", "/admin/forum/categories", data); },
    forumUpdateCategory: function (id, data) { return req("PUT", "/admin/forum/categories/" + id, data); },
    forumDeleteCategory: function (id) { return req("DELETE", "/admin/forum/categories/" + id); },
  };
})();
