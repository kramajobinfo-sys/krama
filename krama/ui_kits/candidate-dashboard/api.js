var cand = (function () {
  // On localhost (XAMPP) the Laravel API lives under /krama/krama-api/public; on hosting the web root IS the API, so /api.
  var BASE = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : (window.location.protocol + "//" + window.location.host + "/api");
  var TOKEN_KEY = "krama_access_token";

  function token() { return localStorage.getItem(TOKEN_KEY) || ""; }

  function req(method, path, body) {
    var opts = {
      method: method,
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token() },
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    return fetch(BASE + path, opts).then(function (r) {
      if (r.status === 204) return null;
      return r.json().then(function (d) {
        if (!r.ok) throw new Error(d.message || ("HTTP " + r.status));
        return d;
      });
    });
  }

  return {
    // Auth
    login: function (email, password) {
      return fetch(BASE + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.access_token) { localStorage.setItem(TOKEN_KEY, d.access_token); }
        return d;
      });
    },
    logout: function () {
      return req("POST", "/auth/logout").finally(function () {
        localStorage.removeItem(TOKEN_KEY);
      });
    },

    // Profile
    fetchMe: function () { return req("GET", "/auth/me"); },
    updateMe: function (data) { return req("PATCH", "/auth/me", data); },
    changePassword: function (currentPassword, newPassword) { return req("POST", "/auth/me/password", { current_password: currentPassword, password: newPassword, password_confirmation: newPassword }); },
    uploadAvatar: function (file) {
      var form = new FormData();
      form.append("avatar", file);
      return fetch(BASE + "/auth/me/avatar", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token() },
        body: form,
      }).then(function (r) { return r.json().then(function(d){ if(!r.ok) throw new Error(d.message||"Upload failed"); return d; }); });
    },

    // Resume
    fetchResume: function () { return req("GET", "/candidate/resume"); },
    saveResume: function (data) { return req("PUT", "/candidate/resume", data); },
    uploadCv: function (file) {
      var form = new FormData();
      form.append("cv", file);
      return fetch(BASE + "/candidate/resume/upload", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token() },
        body: form,
      }).then(function (r) { return r.json().then(function(d){ if(!r.ok) throw new Error(d.message||"Upload failed"); return d; }); });
    },
    downloadCv: function () {
      return fetch(BASE + "/candidate/resume/cv", {
        headers: { "Authorization": "Bearer " + token() },
      }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      });
    },

    // Applications
    fetchApplications: function (stage, page) {
      var qs = "?per_page=10&page=" + (page || 1);
      if (stage && stage !== "all") qs += "&stage=" + stage;
      return req("GET", "/candidate/applications" + qs);
    },
    withdrawApplication: function (id) { return req("DELETE", "/applications/" + id); },

    // Saved jobs
    fetchSavedJobs: function (page) {
      return req("GET", "/candidate/saved-jobs?per_page=10&page=" + (page || 1));
    },
    saveJob: function (jobId) { return req("POST", "/jobs/" + jobId + "/save"); },
    unsaveJob: function (jobId) { return req("DELETE", "/jobs/" + jobId + "/save"); },

    // Public jobs (used by Overview preview)
    fetchJobs: function (params) {
      var qs = Object.entries(params || {}).filter(function (e) { return e[1] !== undefined && e[1] !== ""; })
        .map(function (e) { return encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1]); }).join("&");
      return req("GET", "/jobs" + (qs ? "?" + qs : ""));
    },

    // Profile-matched recommendations
    fetchRecommended: function (page, search) {
      var qs = "per_page=12&page=" + (page || 1);
      if (search) qs += "&search=" + encodeURIComponent(search);
      return req("GET", "/candidate/recommended?" + qs);
    },

    // Company following
    fetchFollowing: function () { return req("GET", "/candidate/following"); },
    followCompany: function (id) { return req("POST", "/companies/" + id + "/follow"); },
    unfollowCompany: function (id) { return req("DELETE", "/companies/" + id + "/follow"); },

    // Job alerts
    fetchAlerts: function () { return req("GET", "/candidate/alerts"); },
    createAlert: function (data) { return req("POST", "/candidate/alerts", data); },
    deleteAlert: function (id) { return req("DELETE", "/candidate/alerts/" + id); },

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

    token: token,
  };
})();
