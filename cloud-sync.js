// Joshua GPS — cloud sync.
//
// Turns the app's browser-only storage into a real per-account cloud store:
//   - Real sign up / sign in / sign out via Supabase Auth (email + password).
//   - On sign in, the account's data is pulled from Supabase into localStorage.
//   - Whenever the app saves one of the synced keys, it is pushed back up.
// The app's existing code keeps reading/writing localStorage exactly as before;
// this layer keeps localStorage in sync with the cloud behind the scenes.
//
// If Supabase isn't configured yet, this falls back to the original offline
// login (admin / bigblaze or 1 / 1) so nothing breaks before setup.

(function () {
  "use strict";

  // localStorage keys that hold per-user data and should follow the account.
  var SYNCED_KEYS = [
    "joshuaGpsLocalUpdateState", // daily logs, backups, generated "today"
    "joshuaGpsProjectNotes",     // project notes
    "joshuaGpsMeetingSummaries", // meeting summaries
    "joshuaGpsGroqKey"           // the user's own Groq API key
  ];
  var TABLE = "user_data";

  // --- DOM handles (login overlay + sidebar account area) ---
  var overlay = document.getElementById("login-overlay");
  var form = document.getElementById("login-form");
  var emailEl = document.getElementById("login-email");
  var passEl = document.getElementById("login-password");
  var errEl = document.getElementById("login-error");
  var msgEl = document.getElementById("login-message");
  var submitBtn = document.getElementById("login-btn");
  var toggleEl = document.getElementById("login-toggle");
  var subtitleEl = document.getElementById("login-subtitle");
  var footerEl = document.getElementById("sidebar-footer");
  var accountEl = document.getElementById("account-email");
  var logoutBtn = document.getElementById("logout-btn");

  function showErr(text) { if (errEl) { errEl.textContent = text; errEl.style.display = "block"; } }
  function showMsg(text) { if (msgEl) { msgEl.textContent = text; msgEl.style.display = "block"; } }
  function clearNotes() {
    if (errEl) errEl.style.display = "none";
    if (msgEl) msgEl.style.display = "none";
  }

  function showLogin() {
    if (overlay) {
      overlay.style.display = "flex";
      overlay.classList.remove("login-fade-out");
    }
    if (footerEl) footerEl.style.display = "none";
  }

  function hideLogin() {
    if (!overlay) return;
    overlay.classList.add("login-fade-out");
    setTimeout(function () { overlay.style.display = "none"; }, 400);
    if (passEl) passEl.value = "";
  }

  // ----------------------------------------------------------------------
  // Fallback: Supabase not set up yet -> keep the old local-only login.
  // ----------------------------------------------------------------------
  var CFG = window.SUPABASE_CONFIG || {};
  var configured =
    typeof CFG.url === "string" && typeof CFG.anonKey === "string" &&
    CFG.url.indexOf("YOUR_") === -1 && CFG.anonKey.indexOf("YOUR_") === -1 &&
    CFG.url.length > 10 && CFG.anonKey.length > 10;
  var hasSdk = window.supabase && typeof window.supabase.createClient === "function";

  if (!configured || !hasSdk) {
    console.warn("[cloud-sync] Supabase not configured — running in offline/local-only mode.");
    setupLocalOnlyFallback();
    return;
  }

  function setupLocalOnlyFallback() {
    if (subtitleEl) subtitleEl.textContent = "Sign in to continue (offline mode)";
    if (toggleEl) toggleEl.style.display = "none";
    if (footerEl) footerEl.style.display = "none";
    if (emailEl) {
      emailEl.type = "text"; // avoid native email validation blocking "admin"/"1"
      emailEl.setAttribute("placeholder", "Username");
    }
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearNotes();
      var user = (emailEl ? emailEl.value : "").trim();
      var pass = passEl ? passEl.value : "";
      if ((user === "admin" && pass === "bigblaze") || (user === "1" && pass === "1")) {
        hideLogin();
      } else {
        showErr("Incorrect username or password.");
        if (passEl) passEl.value = "";
      }
    });
  }

  // ----------------------------------------------------------------------
  // Cloud mode.
  // ----------------------------------------------------------------------
  var client = window.supabase.createClient(CFG.url, CFG.anonKey);
  window.gpsCloud = { client: client };

  var currentUserId = null;
  var pendingKeys = {};
  var flushTimer = null;

  // --- Push: intercept saves to synced keys and upload them (debounced) ---
  // NOTE: you cannot override localStorage.setItem by assigning to the instance
  // (localStorage is an exotic object — `localStorage.setItem = fn` just stores
  // an item literally named "setItem"). We must patch Storage.prototype.
  var storageProto = Object.getPrototypeOf(window.localStorage);
  var nativeSetItem = storageProto.setItem;
  // Un-wrapped setter so cloud -> local writes don't echo back up to the cloud.
  function rawSetItem(key, value) { nativeSetItem.call(window.localStorage, key, value); }

  storageProto.setItem = function (key, value) {
    nativeSetItem.call(this, key, value);
    if (this === window.localStorage && currentUserId && SYNCED_KEYS.indexOf(key) !== -1) {
      pendingKeys[key] = true;
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = setTimeout(flush, 400);
    }
  };

  // Make sure pending uploads are sent before the app is backgrounded or closed
  // (important on mobile, where timers/network are frozen on suspend).
  function flushNow() {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    flush();
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flushNow();
  });
  window.addEventListener("pagehide", flushNow);

  function flush() {
    flushTimer = null;
    if (!currentUserId) return;
    var keys = Object.keys(pendingKeys);
    pendingKeys = {};
    if (!keys.length) return;
    var now = new Date().toISOString();
    var rows = keys.map(function (k) {
      return { user_id: currentUserId, key: k, value: window.localStorage.getItem(k), updated_at: now };
    });
    client.from(TABLE).upsert(rows, { onConflict: "user_id,key" }).then(function (res) {
      if (res.error) {
        console.error("[cloud-sync] upload failed", res.error);
        keys.forEach(function (k) { pendingKeys[k] = true; }); // retry on next change
      }
    });
  }

  // --- Pull: replace local synced keys with this account's cloud copy ---
  function pullAll(userId) {
    return client.from(TABLE).select("key,value").eq("user_id", userId).then(function (res) {
      if (res.error) { console.error("[cloud-sync] download failed", res.error); return; }
      SYNCED_KEYS.forEach(function (k) { window.localStorage.removeItem(k); });
      (res.data || []).forEach(function (row) {
        if (row && row.value != null) rawSetItem(row.key, row.value);
      });
    });
  }

  function reRender() {
    if (typeof window.renderAll === "function") {
      try { window.renderAll(); } catch (e) { /* data may not be loaded yet; script.js will render */ }
    }
  }

  // --- Session handling ---
  function onSignedIn(session) {
    if (currentUserId === session.user.id) return;
    currentUserId = session.user.id;
    if (accountEl) accountEl.textContent = session.user.email || "";
    if (footerEl) footerEl.style.display = "flex";
    pullAll(currentUserId).then(function () {
      hideLogin();
      reRender();
    });
  }

  function onSignedOut() {
    currentUserId = null;
    pendingKeys = {};
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    SYNCED_KEYS.forEach(function (k) { window.localStorage.removeItem(k); });
    showLogin();
    reRender();
  }

  client.auth.getSession().then(function (r) {
    var session = r.data && r.data.session;
    if (session) onSignedIn(session); else showLogin();
  });

  client.auth.onAuthStateChange(function (event, session) {
    if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
      onSignedIn(session);
    } else if (event === "SIGNED_OUT") {
      onSignedOut();
    }
  });

  // --- Login / sign-up form ---
  var mode = "signin";

  function applyMode() {
    clearNotes();
    if (mode === "signin") {
      if (submitBtn) submitBtn.textContent = "Sign In";
      if (toggleEl) toggleEl.textContent = "Need an account? Sign up";
      if (subtitleEl) subtitleEl.textContent = "Please sign in to continue";
    } else {
      if (submitBtn) submitBtn.textContent = "Create account";
      if (toggleEl) toggleEl.textContent = "Have an account? Sign in";
      if (subtitleEl) subtitleEl.textContent = "Create your account";
    }
  }

  if (toggleEl) {
    toggleEl.style.display = "inline-block";
    toggleEl.addEventListener("click", function (e) {
      e.preventDefault();
      mode = mode === "signin" ? "signup" : "signin";
      applyMode();
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearNotes();
      var email = (emailEl ? emailEl.value : "").trim();
      var password = passEl ? passEl.value : "";
      if (!email || !password) { showErr("Please enter your email and password."); return; }
      if (mode === "signup" && password.length < 6) {
        showErr("Password must be at least 6 characters.");
        return;
      }

      var label = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Please wait..."; }
      function done() { if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; } }

      if (mode === "signup") {
        client.auth.signUp({ email: email, password: password }).then(function (res) {
          done();
          if (res.error) { showErr(res.error.message); return; }
          if (res.data && res.data.session) return; // onAuthStateChange takes over
          // No session yet => email confirmation is on.
          showMsg("Account created. Check your email to confirm, then sign in.");
          mode = "signin";
          applyMode();
        }).catch(function (ex) { done(); showErr(ex.message || "Sign up failed."); });
      } else {
        client.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
          done();
          if (res.error) { showErr(res.error.message); if (passEl) passEl.value = ""; }
        }).catch(function (ex) { done(); showErr(ex.message || "Sign in failed."); });
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logoutBtn.disabled = true;
      // Close the mobile slide-out menu if it's open.
      var sb = document.getElementById("sidebar");
      var sbo = document.getElementById("sidebar-overlay");
      if (sb) sb.classList.remove("sidebar-open");
      if (sbo) sbo.classList.remove("active");
      // Force the local sign-out immediately so the UI always reacts, even if
      // the network call to revoke the session is slow or fails.
      var finish = function () { onSignedOut(); logoutBtn.disabled = false; };
      try {
        var p = client.auth.signOut();
        if (p && typeof p.then === "function") {
          p.then(finish, finish);
          setTimeout(finish, 1500); // safety net if signOut never settles
        } else {
          finish();
        }
      } catch (e) {
        finish();
      }
    });
  }
})();
