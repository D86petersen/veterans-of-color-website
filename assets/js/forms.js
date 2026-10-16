/* ============================================================
   Veterans of Color — form handling
   ------------------------------------------------------------
   ★★★  LAUNCH CHECKLIST — READ BEFORE GOING LIVE  ★★★
   ------------------------------------------------------------
   1. Replace CONTACT_EMAIL below with the organization's real
      Gmail address (the client is creating it). Every form on
      this site (contact, donation pledge, volunteer interest)
      submits to that single address.
   2. First submission via formsubmit.co triggers a one-time
      activation email to that address — the owner must click
      "Activate" or messages will not arrive.
   ------------------------------------------------------------ */

const CONTACT_EMAIL = "d86petersen@gmail.com"; // TODO: replace with the org's Gmail before launch

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/" + encodeURIComponent(CONTACT_EMAIL);

(function () {
  "use strict";

  /**
   * Build a mailto fallback so a message is never lost, even if the
   * email API is unreachable. Shown whenever submission fails.
   */
  function fallbackHtml(data, formType) {
    var subject = encodeURIComponent("[Website " + formType + "] " + (data.name || "New message"));
    var body = encodeURIComponent(
      Object.keys(data)
        .map(function (k) { return k + ": " + data[k]; })
        .join("\n")
    );
    return (
      "We couldn't send your message automatically. Nothing was lost — " +
      "please email us directly at " +
      '<a href="mailto:' + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body + '">' + CONTACT_EMAIL + "</a>."
    );
  }

  function setStatus(form, kind, html) {
    var status = form.querySelector(".form-status");
    if (!status) return;
    status.className = "form-status form-status--" + kind;
    status.innerHTML = html;
    status.setAttribute("role", kind === "error" ? "alert" : "status");
    status.focus();
  }

  function validate(form) {
    var valid = true;
    var firstBad = null;

    form.querySelectorAll("[data-validate]").forEach(function (input) {
      var field = input.closest(".field");
      if (field) field.classList.remove("field--error");
      var value = input.value.trim();
      var bad = false;

      if (input.hasAttribute("required") && !value) bad = true;
      if (!bad && input.type === "email" && value) {
        bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      }
      if (!bad && input.type === "checkbox" && input.hasAttribute("required") && !input.checked) bad = true;

      if (bad) {
        valid = false;
        if (field) field.classList.add("field--error");
        if (!firstBad) firstBad = input;
      }
    });

    if (!valid && firstBad) firstBad.focus();
    return valid;
  }

  document.querySelectorAll("form[data-email-form]").forEach(function (form) {
    var formType = form.getAttribute("data-email-form") || "message";
    var submitBtn = form.querySelector('[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.textContent : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Honeypot: bots fill this, humans don't. */
      var honeypot = form.querySelector('input[name="_honey"]');
      if (honeypot && honeypot.value) {
        setStatus(form, "success", "Thank you — your message has been received.");
        form.reset();
        return;
      }

      if (!validate(form)) {
        setStatus(form, "error", "Please review the highlighted fields and try again.");
        return;
      }

      var data = {};
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        if (!el.name || el.name === "_honey") return;
        if (el.type === "checkbox") { data[el.name] = el.checked ? "Yes" : "No"; return; }
        data[el.name] = el.value.trim();
      });

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(
          Object.assign({ _subject: "[Website " + formType + "] " + (data.name || "New message") }, data)
        )
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed with status " + res.status);
          return res.json();
        })
        .then(function () {
          setStatus(
            form,
            "success",
            "Thank you, " + escapeHtml(data.name || "friend") +
            " — your message has been sent. We will be in touch soon."
          );
          form.reset();
        })
        .catch(function () {
          /* Never lose a message: hand the visitor a direct-email path. */
          setStatus(form, "error", fallbackHtml(data, formType));
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
