// Krama -- Apply modal. Multi-state: form → success. Assigns to window.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    Button,
    Input,
    Textarea,
    Avatar,
    IconButton
  } = window.KramaDesignSystem_1a6f65;
  const TR = window.KRAMA_T || function (s) {
    return s;
  };
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });
  function ApplyModal({
    job,
    onClose,
    user,
    onNav
  }) {
    const [done, setDone] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [coverNote, setCoverNote] = React.useState("");
    const [questions, setQuestions] = React.useState(job && job._raw && job._raw.screening_questions || []);
    const [answers, setAnswers] = React.useState({});
    const setAnswer = (qid, v) => setAnswers(function (a) {
      var n = Object.assign({}, a);
      n[qid] = v;
      return n;
    });
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    React.useEffect(function () {
      if (!job) return;
      if (job._raw && job._raw.screening_questions) {
        setQuestions(job._raw.screening_questions);
        return;
      }
      var id = job._raw ? job._raw.id : job.id;
      window.KRAMA_API.fetchJobDetail(id).then(function (d) {
        setQuestions(d && d.screening_questions || []);
      }).catch(function () {});
    }, [job && (job._raw ? job._raw.id : job.id)]);
    if (!job) return null;

    // Gate: must be logged in to apply
    if (!user) {
      return /*#__PURE__*/React.createElement("div", {
        onClick: onClose,
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "var(--surface-overlay)",
          backdropFilter: "blur(2px)",
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
          padding: 36,
          textAlign: "center"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--brand-subtle)",
          color: "var(--brand)",
          marginBottom: 16
        }
      }, I("lock", 24)), /*#__PURE__*/React.createElement("h2", {
        style: {
          fontSize: "var(--text-xl)",
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, TR("Sign in to apply")), /*#__PURE__*/React.createElement("p", {
        style: {
          color: "var(--text-muted)",
          marginTop: 8,
          marginBottom: 24,
          fontSize: "var(--text-sm)"
        }
      }, "You need an account to apply to ", /*#__PURE__*/React.createElement("strong", null, job.title), " and track your applications."), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 10,
          marginBottom: 12
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        block: true,
        onClick: () => {
          onClose();
          if (onNav) onNav("login");
        }
      }, TR("Sign in")), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        block: true,
        onClick: () => {
          onClose();
          if (onNav) onNav("register");
        }
      }, TR("Create account"))), /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        block: true,
        onClick: onClose
      }, TR("Cancel"))));
    }
    const submitApplication = () => {
      for (var k = 0; k < questions.length; k++) {
        var q = questions[k];
        if (!q.required) continue;
        var av = answers[q.id];
        if (av === undefined || av === null || av === "" || Array.isArray(av) && av.length === 0) {
          setError(TR("Please answer all required questions."));
          return;
        }
      }
      setError("");
      setLoading(true);
      window.KRAMA_API.applyToJob(job._raw ? job._raw.id : job.id, coverNote, answers).then(() => {
        setLoading(false);
        setDone(true);
      }).catch(e => {
        setLoading(false);
        setError(e && e.message || "Application failed. Please try again.");
      });
    };
    const fieldStyle = {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "9px 12px",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      color: "var(--text-body)",
      background: "var(--surface-page)",
      outline: "none"
    };
    const renderField = q => {
      var v = answers[q.id];
      if (q.type === "textarea") return /*#__PURE__*/React.createElement("textarea", {
        value: v || "",
        onChange: e => setAnswer(q.id, e.target.value),
        rows: 3,
        style: Object.assign({}, fieldStyle, {
          resize: "vertical"
        })
      });
      if (q.type === "number") return /*#__PURE__*/React.createElement("input", {
        type: "number",
        value: v || "",
        onChange: e => setAnswer(q.id, e.target.value),
        style: fieldStyle
      });
      if (q.type === "date") return /*#__PURE__*/React.createElement("input", {
        type: "date",
        value: v || "",
        onChange: e => setAnswer(q.id, e.target.value),
        style: fieldStyle
      });
      if (q.type === "yes_no") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 18
        }
      }, ["yes", "no"].map(function (opt) {
        return /*#__PURE__*/React.createElement("label", {
          key: opt,
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            color: "var(--text-body)"
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "radio",
          name: "q" + q.id,
          checked: v === opt,
          onChange: () => setAnswer(q.id, opt)
        }), " ", opt === "yes" ? "Yes" : "No");
      }));
      if (q.type === "single_choice") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 6
        }
      }, (q.options || []).map(function (opt) {
        return /*#__PURE__*/React.createElement("label", {
          key: opt,
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            color: "var(--text-body)"
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "radio",
          name: "q" + q.id,
          checked: v === opt,
          onChange: () => setAnswer(q.id, opt)
        }), " ", opt);
      }));
      if (q.type === "multi_choice") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 6
        }
      }, (q.options || []).map(function (opt) {
        var arr = Array.isArray(v) ? v : [];
        var on = arr.indexOf(opt) !== -1;
        return /*#__PURE__*/React.createElement("label", {
          key: opt,
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            color: "var(--text-body)"
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: on,
          onChange: () => setAnswer(q.id, on ? arr.filter(function (x) {
            return x !== opt;
          }) : arr.concat([opt]))
        }), " ", opt);
      }));
      return /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: v || "",
        onChange: e => setAnswer(q.id, e.target.value),
        maxLength: 2000,
        style: fieldStyle
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      onClick: !loading ? onClose : undefined,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "krmfade var(--dur-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: "100%",
        maxWidth: 480,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden",
        animation: "krmrise var(--dur-base) var(--ease-out)",
        padding: "36px 32px"
      }
    }, loading ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48,
        border: "3px solid var(--border-strong)",
        borderTopColor: "var(--brand)",
        borderRadius: "50%",
        animation: "krmspin 0.8s linear infinite",
        margin: "0 auto 20px"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, "Submitting your application\u2026"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 6
      }
    }, job.title, " \xB7 ", job.company)) : done ? /*#__PURE__*/React.createElement("div", {
      style: {
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
        color: "var(--success)",
        animation: "krmpop var(--dur-slow) var(--ease-spring)",
        marginBottom: 4
      }
    }, I("check", 30)), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-2xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginTop: 18
      }
    }, "Application sent!"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 8,
        maxWidth: 320,
        marginLeft: "auto",
        marginRight: "auto",
        lineHeight: 1.55
      }
    }, job.company, " has received your application for ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, job.title), "."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        justifyContent: "center",
        marginTop: 24
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, TR("Keep browsing")))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        margin: 0
      }
    }, TR("Apply for this role")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 6,
        marginBottom: 0
      }
    }, job.title, " \xB7 ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-body)"
      }
    }, job.company))), error && /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--danger-subtle)",
        color: "var(--danger)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        fontSize: "var(--text-sm)",
        marginBottom: 16
      }
    }, error), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "block",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-body)",
        marginBottom: 6
      }
    }, "Cover note ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 400,
        color: "var(--text-muted)"
      }
    }, "(optional)")), /*#__PURE__*/React.createElement(Textarea, {
      value: coverNote,
      onChange: e => setCoverNote(e.target.value),
      placeholder: TR("Tell the employer why you're a great fit…"),
      rows: 4
    })), questions.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, TR("Screening questions")), questions.map(function (q) {
      return /*#__PURE__*/React.createElement("div", {
        key: q.id
      }, /*#__PURE__*/React.createElement("label", {
        style: {
          display: "block",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--text-body)",
          marginBottom: 6
        }
      }, q.label, q.required && /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--danger)"
        }
      }, " *")), renderField(q));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      onClick: onClose
    }, TR("Cancel")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      onClick: submitApplication
    }, TR("Submit application"))))), /*#__PURE__*/React.createElement("style", null, `
          @keyframes krmfade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes krmrise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
          @keyframes krmpop { 0% { transform: scale(0.6); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
          @keyframes krmspin { to { transform: rotate(360deg); } }
        `));
  }
  window.KramaApplyModal = ApplyModal;
})();