(function () {
  var PRIVATE_KEY  = "97f50d81-fa60-4197-9b5d-cb407d6b46c4";
  var ASSISTANT_ID = "2709b9d9-4bae-4a7a-ad86-8153b36feff7";

  /* ── Inject styles ── */
  var style = document.createElement("style");
  style.textContent = [
    "#vc-btn{position:fixed;bottom:100px;right:28px;z-index:9000;width:56px;height:56px;border-radius:14px;background:var(--accent,#C8922A);color:#fff;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(200,146,42,.45);display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s,box-shadow .2s;}",
    "#vc-btn:hover{background:var(--accent-dark,#a87420);transform:translateY(-2px);box-shadow:0 10px 28px rgba(200,146,42,.55);}",
    "#vc-btn svg{width:26px;height:26px;fill:#fff;display:block;}",

    "#vc-bubble{position:fixed;bottom:168px;right:28px;z-index:9001;background:#fff;color:var(--navy,#0B1F3A);border-radius:14px 14px 4px 14px;padding:12px 16px;max-width:220px;font-size:13.5px;line-height:1.45;font-family:inherit;box-shadow:0 8px 28px rgba(11,31,58,.16);opacity:0;transform:translateY(8px) scale(.95);transition:opacity .3s,transform .3s;pointer-events:none;}",
    "#vc-bubble.show{opacity:1;transform:none;pointer-events:auto;}",
    "#vc-bubble strong{display:block;margin-bottom:3px;font-size:14px;color:var(--navy,#0B1F3A);}",
    "#vc-bubble-dismiss{position:absolute;top:7px;right:10px;background:none;border:none;font-size:16px;line-height:1;cursor:pointer;color:var(--muted,#5a6a7e);padding:0;}",
    "#vc-bubble-dismiss:hover{color:var(--navy,#0B1F3A);}",

    "#vc-panel{position:fixed;bottom:168px;right:28px;z-index:9000;width:360px;max-height:520px;background:#fff;border-radius:18px;box-shadow:0 16px 48px rgba(11,31,58,.18);display:flex;flex-direction:column;overflow:hidden;transform:scale(.92) translateY(12px);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;}",
    "#vc-panel.open{opacity:1;transform:none;pointer-events:auto;}",
    "#vc-head{background:var(--navy,#0B1F3A);color:#fff;padding:14px 18px;display:flex;align-items:center;gap:10px;font-weight:600;font-size:15px;}",
    "#vc-head span{flex:1;}",
    "#vc-head button{background:none;border:none;color:rgba(255,255,255,.7);font-size:20px;cursor:pointer;line-height:1;padding:0;}",
    "#vc-head button:hover{color:#fff;}",
    "#vc-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f7f9fc;}",
    ".vc-msg{max-width:82%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5;word-break:break-word;}",
    ".vc-msg.bot{background:#fff;color:var(--text,#1a2535);align-self:flex-start;box-shadow:0 2px 8px rgba(11,31,58,.07);border-bottom-left-radius:4px;}",
    ".vc-msg.user{background:var(--accent,#C8922A);color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}",
    ".vc-msg.typing{color:var(--muted,#5a6a7e);font-style:italic;}",
    "#vc-form{display:flex;gap:8px;padding:12px 14px;border-top:1px solid var(--line,#dde3ee);background:#fff;}",
    "#vc-input{flex:1;border:1px solid var(--line,#dde3ee);border-radius:999px;padding:9px 14px;font-size:14px;outline:none;font-family:inherit;color:var(--text,#1a2535);background:#f7f9fc;}",
    "#vc-input:focus{border-color:var(--accent,#C8922A);background:#fff;}",
    "#vc-send{width:38px;height:38px;border-radius:50%;background:var(--accent,#C8922A);color:#fff;border:none;display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;flex-shrink:0;transition:background .15s;}",
    "#vc-send:hover{background:var(--accent-dark,#a87420);}"
  ].join("");
  document.head.appendChild(style);

  /* ── Inject HTML ── */
  var html = [
    '<button id="vc-btn" aria-label="Open chat">',
    '  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
    '    <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/>',
    '  </svg>',
    '</button>',
    '<div id="vc-bubble" role="status" aria-live="polite">',
    '  <button id="vc-bubble-dismiss" aria-label="Dismiss">×</button>',
    '  <strong>👋 Need help?</strong>',
    '  Ask me about products, decoration options, or how to place an order!',
    '</div>',
    '<div id="vc-panel" role="dialog" aria-label="Chat assistant">',
    '  <div id="vc-head"><span>Apollo Assistant</span><button id="vc-close" aria-label="Close chat">×</button></div>',
    '  <div id="vc-msgs"></div>',
    '  <form id="vc-form" autocomplete="off">',
    '    <input id="vc-input" type="text" placeholder="Ask anything…" />',
    '    <button id="vc-send" type="submit">➤</button>',
    '  </form>',
    '</div>'
  ].join("");
  var wrap = document.createElement("div");
  wrap.innerHTML = html;
  document.body.appendChild(wrap);

  /* ── Logic ── */
  var panel    = document.getElementById("vc-panel");
  var bubble   = document.getElementById("vc-bubble");
  var msgs     = document.getElementById("vc-msgs");
  var input    = document.getElementById("vc-input");
  var form     = document.getElementById("vc-form");
  var btn      = document.getElementById("vc-btn");
  var closeBtn = document.getElementById("vc-close");
  var dismissBtn = document.getElementById("vc-bubble-dismiss");
  var history = [];
  var bubbleTimer = null;
  var greeted = false;

  function hideBubble() {
    bubble.classList.remove("show");
    clearTimeout(bubbleTimer);
  }

  /* Show bubble once per session only */
  if (!sessionStorage.getItem("vc_bubble_shown")) {
    setTimeout(function () {
      bubble.classList.add("show");
      sessionStorage.setItem("vc_bubble_shown", "1");
      bubbleTimer = setTimeout(hideBubble, 6000);
    }, 1500);
  }

  dismissBtn.addEventListener("click", hideBubble);

  function addMsg(text, role) {
    var el = document.createElement("div");
    el.className = "vc-msg " + role;
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function setOpen(open) {
    panel.classList.toggle("open", open);
    if (open) {
      hideBubble();
      input.focus();
      if (!greeted) greet();
    }
  }

  btn.addEventListener("click", function () { setOpen(!panel.classList.contains("open")); });
  closeBtn.addEventListener("click", function () { setOpen(false); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMsg(text, "user");
    sendMessage(text);
  });

  /* Ask the Vapi assistant for a reply given the current input messages. */
  function postChat(inputMessages) {
    return fetch("https://api.vapi.ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + PRIVATE_KEY
      },
      body: JSON.stringify({ assistantId: ASSISTANT_ID, input: inputMessages })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var reply = "Sorry, I didn't get a response.";
      if (data.output && data.output.length) {
        var assistantMsg = null;
        for (var i = 0; i < data.output.length; i++) {
          if (data.output[i].role === "assistant") { assistantMsg = data.output[i]; }
        }
        var msg = assistantMsg || data.output[data.output.length - 1];
        var raw = msg && msg.content;
        if (Array.isArray(raw)) {
          reply = raw.map(function (c) { return c.text || c.content || ""; }).join("");
        } else if (typeof raw === "string" && raw) {
          reply = raw;
        }
      } else if (data.message || data.reply || data.text) {
        reply = data.message || data.reply || data.text;
      }
      return reply;
    });
  }

  /* On open, have the assistant speak first instead of a hardcoded line. */
  function greet() {
    if (greeted) return;
    greeted = true;
    var typing = addMsg("…", "bot typing");
    // Hidden trigger so the assistant produces its own opening message;
    // this turn is kept in history for context but not shown as a user bubble.
    history.push({ role: "user", content: "Hi" });
    postChat(history.slice())
      .then(function (reply) {
        history.push({ role: "assistant", content: reply });
        typing.className = "vc-msg bot";
        typing.textContent = reply;
        msgs.scrollTop = msgs.scrollHeight;
      })
      .catch(function () {
        history.pop();
        typing.className = "vc-msg bot";
        typing.textContent = "Thanks for reaching out to Apollo! How can I help you today?";
      });
  }

  function sendMessage(text) {
    var typing = addMsg("Thinking…", "bot typing");
    history.push({ role: "user", content: text });
    postChat(history.slice())
      .then(function (reply) {
        history.push({ role: "assistant", content: reply });
        typing.className = "vc-msg bot";
        typing.textContent = reply;
        msgs.scrollTop = msgs.scrollHeight;
      })
      .catch(function () {
        history.pop();
        typing.className = "vc-msg bot";
        typing.textContent = "Connection error — please try again.";
      });
  }
})();
