// Krama employer API client — wraps the Laravel backend for the employer dashboard.
(function () {
  // On localhost (XAMPP) the Laravel API lives under /krama/krama-api/public; on hosting the web root IS the API, so /api.
  const BASE = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : (window.location.protocol + "//" + window.location.host + "/api");
  const TOKEN_KEY = "krama_employer_token";
  const REFRESH_KEY = "krama_employer_refresh_token";

  function getToken() { return localStorage.getItem(TOKEN_KEY); }

  function headers(extra) {
    return Object.assign({ "Content-Type": "application/json", Authorization: "Bearer " + getToken() }, extra);
  }

  var _refreshing = null;

  function refreshToken() {
    if (_refreshing) return _refreshing;
    var refreshTok = localStorage.getItem(REFRESH_KEY);
    if (!refreshTok) return Promise.reject(new Error("No refresh token"));
    _refreshing = fetch(BASE + "/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + refreshTok },
    }).then(function (r) {
      return r.json().then(function (d) {
        _refreshing = null;
        if (!r.ok) { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); return Promise.reject(new Error("Session expired")); }
        localStorage.setItem(TOKEN_KEY, d.access_token);
        if (d.refresh_token) localStorage.setItem(REFRESH_KEY, d.refresh_token);
        return d.access_token;
      });
    }).catch(function (e) { _refreshing = null; return Promise.reject(e); });
    return _refreshing;
  }

  function req(method, path, body, _retried) {
    var opts = { method: method, headers: headers() };
    if (body !== undefined) opts.body = JSON.stringify(body);
    return fetch(BASE + path, opts).then(function (r) {
      return r.json().then(function (d) {
        if (r.status === 401 && !_retried) {
          return refreshToken().then(function () { return req(method, path, body, true); });
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

  window.KRAMA_EMPLOYER_API = {
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
          if (!u || !u.role || u.role.slug !== "employer") {
            return Promise.reject(new Error("Access denied. Employer credentials required."));
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
          if (!u.role || u.role.slug !== "employer") { localStorage.removeItem(TOKEN_KEY); return null; }
          return u;
        })
        .catch(function () { localStorage.removeItem(TOKEN_KEY); return null; });
    },

    updateMe: function (data) { return req("PATCH", "/auth/me", data); },

    // Telegram alerts (deep-link connect flow)
    telegramLink:   function () { return req("POST", "/employer/telegram/link", {}); },
    telegramStatus: function () { return req("GET",  "/employer/telegram/status"); },
    telegramUnlink: function () { return req("POST", "/employer/telegram/unlink", {}); },
    telegramTest:   function () { return req("POST", "/employer/telegram/test", {}); },
    uploadAvatar: function (file) {
      var token = getToken();
      var form = new FormData();
      form.append("avatar", file);
      return fetch(BASE + "/auth/me/avatar", { method: "POST", headers: { Authorization: "Bearer " + token }, body: form })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.user || d; }); });
    },

    // Company
    fetchCompany: function () { return req("GET", "/employer/company"); },
    updateCompany: function (id, data) { return req("PUT", "/companies/" + id, data); },
    createCompany: function (data) { return req("POST", "/companies", data); },
    // Gallery
    uploadGalleryPhoto: function (id, file) {
      var token = getToken(); var fd = new FormData(); fd.append("photo", file);
      return fetch(BASE + "/companies/" + id + "/gallery", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.photo || d; }); });
    },
    updateGalleryCaption: function (id, photoId, caption) { return req("PATCH", "/companies/" + id + "/gallery/" + photoId, { caption: caption }); },
    deleteGalleryPhoto: function (id, photoId) { return req("DELETE", "/companies/" + id + "/gallery/" + photoId); },
    uploadAboutImage: function (id, file) {
      var token = getToken(); var fd = new FormData(); fd.append("image", file);
      return fetch(BASE + "/companies/" + id + "/about-image", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.company || d; }); });
    },
    uploadCoverBanner: function (id, file) {
      var token = getToken(); var fd = new FormData(); fd.append("image", file);
      return fetch(BASE + "/companies/" + id + "/cover-banner", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.company || d; }); });
    },
    // Awards
    createAward: function (id, data) { return req("POST", "/companies/" + id + "/awards", data); },
    uploadAwardImage: function (id, awardId, file) {
      var token = getToken(); var fd = new FormData(); fd.append("image", file);
      return fetch(BASE + "/companies/" + id + "/awards/" + awardId + "/image", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.award || d; }); });
    },
    deleteAward: function (id, awardId) { return req("DELETE", "/companies/" + id + "/awards/" + awardId); },
    uploadCompanyLogo: function (id, file) {
      var token = getToken();
      var form = new FormData();
      form.append("logo", file);
      return fetch(BASE + "/companies/" + id + "/logo", { method: "POST", headers: { Authorization: "Bearer " + token }, body: form })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.company || d; }); });
    },

    // Jobs
    fetchJobs: function () { return req("GET", "/employer/jobs?per_page=100"); },
    uploadJobImage: function (file) {
      var token = getToken(); var fd = new FormData(); fd.append("image", file);
      return fetch(BASE + "/employer/upload/image", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || "Upload failed"); return d.url; }); });
    },
    createJob: function (data) { return req("POST", "/jobs", data); },
    updateJob: function (id, data) { return req("PUT", "/jobs/" + id, data); },
    deleteJob: function (id) { return req("DELETE", "/jobs/" + id); },
    submitJob: function (id, subscriptionId) { return req("PATCH", "/jobs/" + id + "/submit", subscriptionId ? { subscription_id: subscriptionId } : undefined); },
    boostQuote: function (id) { return req("GET", "/employer/jobs/" + id + "/boost"); },
    boostJob: function (id, method) { return req("POST", "/employer/jobs/" + id + "/boost", method ? { method: method } : {}); },
    closeJob: function (id) { return req("PATCH", "/jobs/" + id + "/close"); },
    companyApproveJob: function (id, subscriptionId) { return req("PATCH", "/employer/jobs/" + id + "/approve", subscriptionId ? { subscription_id: subscriptionId } : undefined); },
    companyRejectJob: function (id, reason) { return req("PATCH", "/employer/jobs/" + id + "/reject", { reason: reason }); },

    // Team management
    fetchTeam: function () { return req("GET", "/employer/team"); },
    inviteRecruiter: function (data) { return req("POST", "/employer/team", data); },
    removeTeamMember: function (id) { return req("DELETE", "/employer/team/" + id); },
    setMemberPassword: function (id, password) { return req("PATCH", "/employer/team/" + id + "/password", { password: password }); },

    // Applicants
    fetchJobApplications: function (jobId, stage) {
      return req("GET", "/employer/jobs/" + jobId + "/applications" + (stage ? "?stage=" + stage : ""));
    },
    updateApplicationStage: function (id, stage) { return req("PATCH", "/applications/" + id + "/stage", { stage: stage }); },
    downloadCv: function (applicationId) {
      var token = getToken();
      return fetch(BASE + "/applications/" + applicationId + "/cv", {
        headers: { Authorization: "Bearer " + token },
      }).then(function (r) {
        if (r.status === 403) return Promise.reject(new Error("This candidate has set their CV to private."));
        if (!r.ok) return Promise.reject(new Error("CV download failed (" + r.status + ")"));
        var cd = r.headers.get("Content-Disposition");
        var fname = "candidate_cv.pdf";
        if (cd) { var m = cd.match(/filename="?([^"]+)"?/); if (m) fname = m[1]; }
        return r.blob().then(function (blob) {
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url; a.download = fname;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        });
      });
    },

    // Plans + billing
    fetchPlans: function () { return req("GET", "/plans"); },
    fetchSubscription: function () { return req("GET", "/employer/subscription"); },
    fetchPayments: function (page) { return req("GET", "/employer/payments?per_page=10&page=" + (page || 1)); },
    changePassword: function (currentPassword, newPassword) { return req("POST", "/auth/me/password", { current_password: currentPassword, password: newPassword, password_confirmation: newPassword }); },
    subscribe: function (planId, method) {
      return req("POST", "/employer/subscribe", { plan_id: planId, method: method });
    },
    generateKhqr: function (paymentId) { return req("POST", "/employer/payments/" + paymentId + "/khqr"); },
    stripeCheckout: function (paymentId) { return req("POST", "/employer/payments/" + paymentId + "/stripe-checkout"); },
    verifyPayment: function (paymentId) { return req("GET", "/employer/payments/" + paymentId + "/verify"); },

    // CV Match (credits-based)
    cvMatchCandidates: function () { return req("GET", "/employer/cv-match/candidates"); },
    cvMatchCredits: function () { return req("GET", "/employer/cv-match/credits"); },
    cvMatchBuyCredits: function () { return req("POST", "/employer/cv-match/buy-credits"); },
    cvMatchRun: function (payload) { return req("POST", "/employer/cv-match/run", payload); },
    cvMatchHistory: function () { return req("GET", "/employer/cv-match/history"); },
    cvMatchHistoryShow: function (id) { return req("GET", "/employer/cv-match/history/" + id); },

    // Messaging
    fetchConversations: function () { return req("GET", "/conversations"); },
    startConversation: function (data) { return req("POST", "/conversations", data); },
    fetchMessages: function (convId, page) { return req("GET", "/conversations/" + convId + "?per_page=50&page=" + (page || 1)); },
    fetchNewMessages: function (convId, afterId) { return req("GET", "/conversations/" + convId + "/messages?after=" + (afterId || 0)); },
    sendMessage: function (convId, body) { return req("POST", "/conversations/" + convId + "/messages", { body: body }); },
    fetchUnreadCount: function () { return req("GET", "/conversations/unread"); },

    // Notifications
    fetchNotifications: function () { return req("GET", "/notifications"); },
    fetchNotifUnread: function () { return req("GET", "/notifications/unread"); },
    markNotifRead: function (id) { return req("POST", "/notifications/" + id + "/read"); },
    markAllNotifRead: function () { return req("POST", "/notifications/read-all"); },

    // Reference data
    fetchCategories: function () { return req("GET", "/categories"); },
    fetchLocations: function () { return req("GET", "/locations"); },
    fetchExperienceLevels: function () { return req("GET", "/experience-levels"); },
  };
})();
