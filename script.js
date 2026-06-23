const state = { lang: "en", active: "dashboard" };
const storageKey = "joshuaGpsLocalUpdateState";
const projectNotesKey = "joshuaGpsProjectNotes";
const meetingSummariesKey = "joshuaGpsMeetingSummaries";

    let data = null;

    function ui(key) { return data.ui[state.lang][key]; }
    function currentLangBlock(block) { return block[state.lang]; }
    function escapeHtml(value) {
      return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
    function list(items) { return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`; }
    function pills(items, color = "") { return items.map((item) => `<span class="pill ${color}">${item}</span>`).join(""); }
    function badge(text, color = "green") { return `<span class="pill ${color}">${text}</span>`; }
    function enZh(item, enKey, zhKey) { return state.lang === "en" ? item[enKey] : item[zhKey]; }
    function readLocalState() {
      try {
        return JSON.parse(localStorage.getItem(storageKey)) || { logs: [], backups: [], generatedToday: null };
      } catch {
        return { logs: [], backups: [], generatedToday: null };
      }
    }

    function writeLocalState(localState) {
      localStorage.setItem(storageKey, JSON.stringify(localState));
    }

    function dayNumber(label) {
      const match = String(label || "").match(/\d+/);
      return match ? Number(match[0]) : 1;
    }

    function cloneValue(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function applyLocalUpdates() {
      const localState = readLocalState();
      if (localState.generatedToday) {
        data.today = localState.generatedToday;
        data.current.day = `${localState.generatedToday.day} ${localState.generatedToday.status}`;
      }

      const todayIndex = dayNumber(data.today.day) - 1;
      data.schedule = data.schedule.map((row, index) => {
        const next = [...row];
        if (index < todayIndex) next[5] = "Done";
        if (index === todayIndex) next[5] = data.today.status || "Ready";
        return next;
      });
    }

    function renderNav() {
      const nav = document.getElementById("nav");
      let lastGroup = null;
      nav.innerHTML = data.nav.map((n) => {
        const group = n.group || "GPS Site";
        let html = "";
        if (group !== lastGroup) {
          lastGroup = group;
          html += `<div class="nav-group-label">${group}</div>`;
        }
        html += `<button class="nav-btn ${state.active === n.id ? "active" : ""}" data-page="${n.id}" type="button">
          <span class="nav-icon">${n.icon}</span><span>${state.lang === "en" ? n.en : n.zh}</span>
        </button>`;
        return html;
      }).join("");
      document.querySelectorAll(".nav-btn").forEach((btn) => btn.addEventListener("click", () => showPage(btn.dataset.page)));
    }

    function renderUi() {
      document.getElementById("brand-title").textContent = ui("brandTitle");
      document.getElementById("brand-subtitle").textContent = ui("brandSubtitle");
      document.getElementById("page-title").textContent = ui("pageTitle");
      document.getElementById("page-subtitle").textContent = ui("pageSubtitle");
      document.getElementById("lang-toggle").textContent = ui("switchLang");
      document.getElementById("read-btn").textContent = ui("read");
      document.getElementById("stop-btn").textContent = ui("stop");
      document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    }

    function renderDashboard() {
      const hero = currentLangBlock(data.hero);
      const today = currentLangBlock(data.today);
      document.getElementById("dashboard").innerHTML = `
        <div class="hero"><h3>${hero.title}</h3><p>${hero.desc}</p></div>
        <div class="grid cols-4">
          ${data.dashboardCards.map((c) => `<div class="card kpi"><span class="number">${c.number}</span><span class="label">${state.lang === "en" ? c.enLabel : c.zhLabel}</span></div>`).join("")}
        </div>
        <h3 class="section-title">${state.lang === "en" ? "Home Dashboard" : "首页看板"}</h3>
        <div class="grid cols-2">
          <div class="card"><h4>${state.lang === "en" ? "Current GPS" : "当前 GPS"}</h4><p>${state.lang === "en" ? "Joshua Month 1 Dynamic Bilingual GPS Site" : "Joshua 第一个月动态双语 GPS Site"}</p>${pills([data.current.week, data.current.day], "green")}</div>
          <div class="card"><h4>${state.lang === "en" ? "Today’s Focus" : "今日重点"}</h4><p>${today.focus}</p>${pills([data.today.day, data.today.status], "yellow")}</div>
          <div class="card"><h4>${state.lang === "en" ? "Current P0 / P1 / P2" : "当前 P0 / P1 / P2"}</h4>${list([data.current.p0, data.current.p1, data.current.p2])}</div>
          <div class="card"><h4>${state.lang === "en" ? "Month Goal" : "本月总目标"}</h4><p>${state.lang === "en" ? data.monthGoal.en : data.monthGoal.zh}</p></div>
        </div>
        <h3 class="section-title">${state.lang === "en" ? "Quick entries" : "快捷入口"}</h3>
        <div class="grid cols-4">${data.nav.slice(1, 5).map((n) => `<button class="btn" type="button" onclick="showPage('${n.id}')">${state.lang === "en" ? n.en : n.zh}</button>`).join("")}</div>
      `;
    }

    function renderToday() {
      const today = currentLangBlock(data.today);
      document.getElementById("today").innerHTML = `
        <div class="hero"><h3>${state.lang === "en" ? "Today’s Task Card" : "今日任务卡"}</h3><p>${today.focus}</p></div>
        <div class="grid cols-2">
          <div class="card"><h4>Today’s Focus</h4><p>${today.focus}</p>${pills([data.today.day, data.today.status], "green")}</div>
          <div class="card"><h4>Tasks</h4>${list(today.tasks)}</div>
          <div class="card"><h4>Deliverables</h4>${list(today.deliverables)}</div>
          <div class="card"><h4>Resources</h4>${list(today.resources)}</div>
        </div>
        <h3 class="section-title">End-of-Day Check</h3>
        <div class="card">${list(today.check)}</div>
      `;
    }

    function renderWeekly() {
      document.getElementById("weekly").innerHTML = `
        <div class="hero"><h3>${state.lang === "en" ? "Weekly Plan" : "每周计划"}</h3><p>${state.lang === "en" ? "Each week has a theme, a goal, major tasks and visible outputs." : "每周都有主题、目标、主要任务和可见产出物。"}</p></div>
        <div class="grid cols-2">
          ${data.weeks.map((w) => `<div class="card">
            <h4>${w.week} | ${enZh(w, "enTitle", "zhTitle")}</h4>
            <p>${enZh(w, "enGoal", "zhGoal")}</p>
            <h4 class="section-title">${state.lang === "en" ? "Major tasks" : "主要任务"}</h4>
            ${list(state.lang === "en" ? w.enTasks : w.zhTasks)}
            <h4 class="section-title">${state.lang === "en" ? "Weekly outputs" : "周产出物"}</h4>
            <div>${pills(state.lang === "en" ? w.enOutputs : w.zhOutputs, "green")}</div>
          </div>`).join("")}
        </div>
      `;
    }

    function renderPriority() {
      document.getElementById("priority").innerHTML = `
        <div class="hero"><h3>${state.lang === "en" ? "P0 / P1 / P2 Priority" : "P0 / P1 / P2 优先级"}</h3><p>${state.lang === "en" ? "The first month stays focused: Site first, Apollo second, complex Agent work later." : "第一个月保持聚焦：Site 优先，Apollo 其次，复杂 Agent 后置。"}</p></div>
        <div class="grid cols-3">
          ${data.priorities.map((p) => `<div class="card">
            <span class="pill ${p.color}">${p.level}</span>
            <h4>${enZh(p, "enTitle", "zhTitle")}</h4>
            <h4>${state.lang === "en" ? "Tasks" : "任务内容"}</h4>
            ${list(state.lang === "en" ? p.enTasks : p.zhTasks)}
            <h4>${state.lang === "en" ? "Outputs" : "产出物"}</h4>
            <div>${pills(state.lang === "en" ? p.enOutputs : p.zhOutputs, p.color)}</div>
          </div>`).join("")}
        </div>
      `;
    }

    function renderSchedule() {
      const isEn = state.lang === "en";
      const grouped = [
        data.schedule.slice(0, 6),
        data.schedule.slice(6, 12),
        data.schedule.slice(12, 18),
        data.schedule.slice(18, 24),
      ];

      document.getElementById("schedule").innerHTML = `
        <div class="hero">
          <h3>${isEn ? "Monthly Schedule" : "月度按天拆解计划"}</h3>
          <p>${isEn ? "Click any day to see tasks and deliverables." : "点击任意一天查看任务和产出物。"}</p>
        </div>
        <div class="cal-wrapper">
          <div class="cal-grid">
            ${grouped.map((week, wi) => `
              <div class="cal-week-label">Week ${wi + 1}</div>
              ${week.map((r, di) => {
                const idx = wi * 6 + di;
                const statusClass = r[5].toLowerCase().replace(/\s+/g, "-");
                return `<div class="cal-cell status-${statusClass}" data-idx="${idx}">
                  <span class="cal-day-num">${r[0]}</span>
                  <span class="cal-theme">${r[2]}</span>
                  <span class="cal-dot"></span>
                </div>`;
              }).join("")}
            `).join("")}
          </div>
          <div class="cal-detail" id="cal-detail" aria-live="polite"></div>
        </div>
      `;

      function showDetail(idx) {
        const r = data.schedule[idx];
        const statusClass = r[5].toLowerCase().replace(/\s+/g, "-");
        document.getElementById("cal-detail").innerHTML = `
          <div class="cal-detail-header">
            <span class="cal-day-num">${r[0]}</span>
            <span class="log-meta">${r[1]}</span>
            <h4>${r[2]}</h4>
            <span class="pill ${statusClass === "ready" || statusClass === "done" ? "green" : ""}">${r[5]}</span>
          </div>
          <p><strong>${isEn ? "Tasks" : "任务"}:</strong> ${r[3]}</p>
          <p><strong>${isEn ? "Deliverables" : "产出物"}:</strong> ${r[4]}</p>
        `;
      }

      document.querySelectorAll(".cal-cell").forEach(cell => {
        cell.addEventListener("click", function () {
          document.querySelectorAll(".cal-cell").forEach(c => c.classList.remove("active"));
          this.classList.add("active");
          showDetail(+this.dataset.idx);
        });
      });

      const first = document.querySelector(".cal-cell");
      if (first) first.click();
    }

    function renderLogs() {
      const localState = readLocalState();
      const savedLogs = (localState.logs || []).slice().reverse();
      document.getElementById("logs").innerHTML = `
        <div class="hero"><h3>Daily Log</h3><p>${state.lang === "en" ? "Use this template at the end of each day. Keep it short, concrete and written in English when possible." : "每天结束时使用这个模板。内容要短、具体，尽量用英文填写。"}</p></div>
        <div class="grid cols-2">
          <div class="card"><h4>${state.lang === "en" ? "Daily Log Template" : "Daily Log 模板"}</h4><pre>${data.logTemplate.join("\\n")}</pre></div>
          <div class="card"><h4>${state.lang === "en" ? "How to use it" : "使用方法"}</h4>${list(state.lang === "en" ? ["Fill it after the daily output is finished.", "Attach screenshot or page link when available.", "Use AIX to polish the English summary.", "Move useful points into Portfolio / Final View each week."] : ["每天产出完成后填写。", "有截图或链接时一起记录。", "用 AIX 优化英文总结。", "每周把有价值内容整理进 Portfolio / Final View。"])}</div>
        </div>
        <h3 class="section-title">${state.lang === "en" ? "Update Today" : "更新今日记录"}</h3>
        <form class="update-form card" id="daily-update-form">
          <div class="form-grid">
            <label>${state.lang === "en" ? "Date" : "日期"}<input name="date" type="date" required></label>
            <label>Day<input name="day" type="text" value="${escapeHtml(data.today.day)}" required></label>
          </div>
          <label>Today’s Focus<textarea name="focus" rows="2" required>${escapeHtml(currentLangBlock(data.today).focus)}</textarea></label>
          <label>What I learned<textarea name="learned" rows="3" required></textarea></label>
          <label>What I built<textarea name="built" rows="3" required></textarea></label>
          <label>What AI helped with<textarea name="aiHelpedWith" rows="2"></textarea></label>
          <label>What I found difficult<textarea name="difficulty" rows="2"></textarea></label>
          <label>Questions<textarea name="questions" rows="2"></textarea></label>
          <label>Tomorrow’s next step<textarea name="nextStep" rows="2" required></textarea></label>
          <div class="form-actions">
            <button class="btn primary" type="submit">${state.lang === "en" ? "Submit and prepare tomorrow" : "提交并生成明天任务"}</button>
            <button class="btn" type="button" id="export-local">${state.lang === "en" ? "Export local records" : "导出本地记录"}</button>
            <button class="btn" type="button" id="reset-local">${state.lang === "en" ? "Reset local updates" : "清除本地更新"}</button>
          </div>
          <p class="form-note">${state.lang === "en" ? "This saves to this browser first. It backs up today, stores the Daily Log, and creates tomorrow’s Today card." : "这一版先保存到当前浏览器：自动备份今天，保存 Daily Log，并生成明天的 Today 卡。"}</p>
        </form>
        <h3 class="section-title">${state.lang === "en" ? "Saved Daily Logs" : "已保存 Daily Log"}</h3>
        <div id="saved-log-list">
          ${savedLogs.length ? savedLogs.map((log, i) => renderSavedLog(log, localState.logs.length - 1 - i)).join("") : `<div class="log-item"><h4>${state.lang === "en" ? "No saved logs yet" : "还没有保存的日志"}</h4><p>${state.lang === "en" ? "Submit the form above after Joshua finishes today’s work." : "Joshua 完成当天任务后，提交上面的表单。"}</p></div>`}
        </div>
      `;
    }

    function renderSavedLog(log, index) {
      return `<div class="log-item" id="log-card-${index}">
        <h4>${escapeHtml(log.day)} · ${escapeHtml(log.date)}</h4>
        <div class="log-meta">${escapeHtml(log.focus)}</div>
        <p><strong>Learned:</strong> ${escapeHtml(log.learned)}</p>
        <p><strong>Built:</strong> ${escapeHtml(log.built)}</p>
        <p><strong>Next:</strong> ${escapeHtml(log.nextStep)}</p>
        <div class="form-actions" style="margin-top:10px" id="log-actions-${index}">
          <button class="btn" type="button" onclick="editLog(${index})">Edit</button>
          <button class="btn" type="button" onclick="deleteLog(${index})">Delete</button>
        </div>
      </div>`;
    }

    function deleteLog(index) {
      const en = state.lang === "en";
      document.getElementById(`log-actions-${index}`).innerHTML = `
        <span style="color:var(--muted);font-size:14px;align-self:center">${en ? "Delete this log?" : "确认删除这条日志？"}</span>
        <button class="btn primary" type="button" onclick="confirmDeleteLog(${index})">${en ? "Yes, delete" : "确认删除"}</button>
        <button class="btn" type="button" onclick="cancelDeleteLog(${index})">${en ? "Cancel" : "取消"}</button>
      `;
    }

    function confirmDeleteLog(index) {
      const localState = readLocalState();
      localState.logs.splice(index, 1);
      writeLocalState(localState);
      renderLogs();
      bindDailyUpdateForm();
    }

    function cancelDeleteLog(index) {
      const en = state.lang === "en";
      document.getElementById(`log-actions-${index}`).innerHTML = `
        <button class="btn" type="button" onclick="editLog(${index})">${en ? "Edit" : "编辑"}</button>
        <button class="btn" type="button" onclick="deleteLog(${index})">${en ? "Delete" : "删除"}</button>
      `;
    }

    function editLog(index) {
      const localState = readLocalState();
      const log = localState.logs[index];
      const form = document.getElementById("daily-update-form");
      form.date.value = log.date || "";
      form.day.value = log.day || "";
      form.focus.value = log.focus || "";
      form.learned.value = log.learned || "";
      form.built.value = log.built || "";
      form.aiHelpedWith.value = log.aiHelpedWith || "";
      form.difficulty.value = log.difficulty || "";
      form.questions.value = log.questions || "";
      form.nextStep.value = log.nextStep || "";
      form.dataset.editIndex = index;
      form.querySelector("[type=submit]").textContent = state.lang === "en" ? "Save Changes" : "保存修改";
      form.scrollIntoView({ behavior: "smooth" });
    }

    function renderProjects() {
      document.getElementById("projects").innerHTML = `
        <div class="hero"><h3>Project Note</h3><p>${state.lang === "en" ? "Every Site demo should leave a standard project note so Joshua can explain input, process, output and learning." : "每个 Site Demo 都要留下标准 Project Note，方便 Joshua 讲清输入、过程、输出和收获。"}</p></div>
        <div class="grid cols-2">
          <div class="card"><h4>${state.lang === "en" ? "Project Note Template" : "Project Note 模板"}</h4><pre>${data.projectTemplate.join("\\n")}</pre></div>
          <div class="card"><h4>${state.lang === "en" ? "Expected project notes" : "预期项目记录"}</h4>${list(state.lang === "en" ? data.portfolio.en.projects : data.portfolio.zh.projects)}</div>
        </div>
      `;
    }

    function renderPortfolio() {
      const p = currentLangBlock(data.portfolio);
      document.getElementById("portfolio").innerHTML = `
        <div class="hero"><h3>${state.lang === "en" ? "Portfolio / Final View" : "Portfolio / 最终展示"}</h3><p>${state.lang === "en" ? "This view is for Paul, Dora, Apollo and Joshua's final reflection." : "这个视图用于 Paul、Dora、Apollo 以及 Joshua 最终复盘。"}</p></div>
        <div class="grid cols-2">
          <div class="card"><h4>What I Learned</h4>${list(p.learned)}</div>
          <div class="card"><h4>What I Built</h4>${list(p.built)}</div>
          <div class="card"><h4>Site Projects</h4>${list(p.projects)}</div>
          <div class="card"><h4>Daily Progress</h4>${list(p.progress)}</div>
          <div class="card"><h4>Final Reflection</h4><p>${p.reflection}</p></div>
          <div class="card"><h4>Next Step</h4><p>${p.next}</p></div>
        </div>
      `;
    }

    let wordDocText = "";
    let wordFileName = "";
    let wordSummary = null;
    let wordSummaryTitle = "";

    let excelWorkbook = null;
    let excelActiveSheet = "";
    let excelFileName = "";

    let xmindTree = null;
    let xmindFileName = "";

    function renderWord() {
      const en = state.lang === "en";
      const hasDoc = wordDocText.length > 0;
      const savedKey = localStorage.getItem("joshuaGpsGroqKey") || "";
      const allSummaries = JSON.parse(localStorage.getItem(meetingSummariesKey) || "[]");
      const saved = allSummaries.slice().reverse();

      document.getElementById("word").innerHTML = `
        <div class="hero">
          <h3>${en ? "Meeting Summary" : "会议总结"}</h3>
          <p>${en ? "Upload a meeting Word document and AI will extract the five key sections automatically." : "上传会议 Word 文档，AI 将自动提取五个关键部分。"}</p>
        </div>

        <div class="update-form card">
          <div class="form-grid">
            <label>${en ? "Groq API Key" : "Groq API 密钥"}<input type="password" id="word-api-key" value="${escapeHtml(savedKey)}" placeholder="gsk_..." autocomplete="off"></label>
            <div style="align-self:end"><button class="btn primary" id="word-save-key" type="button">${en ? "Save Key" : "保存密钥"}</button></div>
          </div>
          <p class="form-note">${en ? "Stored in localStorage only. Sent directly to Groq. Get a free key at console.groq.com." : "仅保存在本浏览器 localStorage，直接发送给 Groq。在 console.groq.com 获取免费密钥。"}</p>
        </div>

        <h3 class="section-title">${en ? "Upload Meeting Document" : "上传会议文档"}</h3>
        <div class="update-form card">
          <label>${en ? "Word Document (.docx)" : "Word 文档（.docx）"}<input type="file" id="word-file-input" accept=".docx" style="padding:8px 0;border:0;background:none;box-shadow:none;font:inherit"></label>
          ${hasDoc ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
            <span class="pill green">${escapeHtml(wordFileName)}</span>
            <span class="pill">${wordDocText.length} ${en ? "chars" : "字符"}</span>
            ${wordDocText.length >= 12000 ? `<span class="pill yellow">${en ? "Truncated to 12 000 chars" : "已截断至 12000 字符"}</span>` : ""}
          </div>` : ""}
          <div class="form-actions">
            <button class="btn primary" id="word-generate-btn" type="button" ${hasDoc ? "" : "disabled"}>${en ? "Generate Meeting Summary" : "生成会议总结"}</button>
          </div>
        </div>

        <div id="word-summary-wrap" style="display:${wordSummary ? "block" : "none"}">
          <h3 class="section-title">${en ? "Generated Summary" : "生成的总结"}</h3>
          ${wordSummary ? renderWordSummaryCards(wordSummary, en) : ""}
          <div class="update-form card" style="margin-top:16px">
            <label>${en ? "Summary Title" : "总结标题"}<input type="text" id="word-summary-title" value="${escapeHtml(wordSummaryTitle)}" placeholder="${escapeHtml(wordFileName)}"></label>
            <div class="form-actions" style="margin-top:10px">
              <button class="btn" id="word-edit-btn" type="button">${en ? "Edit" : "编辑"}</button>
              <button class="btn primary" id="word-save-btn" type="button">${en ? "Save Summary" : "保存总结"}</button>
            </div>
          </div>
        </div>

        <h3 class="section-title">${en ? "Saved Summaries" : "已保存总结"}</h3>
        <div id="word-saved-list">
          ${saved.length
            ? saved.map((s, i) => renderSavedWordSummary(s, allSummaries.length - 1 - i, en)).join("")
            : `<div class="log-item"><h4>${en ? "No saved summaries yet" : "还没有保存的总结"}</h4><p>${en ? "Upload a document and generate a summary to save it." : "上传文档并生成总结后即可保存。"}</p></div>`}
        </div>
      `;
    }

    function renderWordSummaryCards(s, en) {
      return `
        <div class="grid cols-2">
          <div class="card"><h4>${en ? "Meeting Purpose" : "会议目的"}</h4><p>${escapeHtml(s.meetingPurpose)}</p></div>
          <div class="card"><h4>${en ? "Key Discussion Points" : "主要讨论点"}</h4>${list(s.keyDiscussionPoints.map(p => escapeHtml(p)))}</div>
          <div class="card"><h4>${en ? "Decisions Made" : "已做决定"}</h4>${list(s.decisionsMade.map(d => escapeHtml(d)))}</div>
          <div class="card"><h4>${en ? "Action Items" : "行动项"}</h4><ul>${s.actionItems.map(a => `<li><strong>${escapeHtml(a.responsible || "—")}:</strong> ${escapeHtml(a.task)}</li>`).join("")}</ul></div>
        </div>
        <div class="card"><h4>${en ? "Deadlines and Next Steps" : "截止日期与后续步骤"}</h4>${list(s.deadlinesNextSteps.map(d => escapeHtml(d)))}</div>
      `;
    }

    function renderSavedWordSummary(s, index, en) {
      return `<div class="log-item" id="wsummary-card-${index}">
        <h4>${escapeHtml(s.title || s.fileName)} · ${escapeHtml(s.savedAt)}</h4>
        <div class="log-meta">${escapeHtml(s.meetingPurpose)}</div>
        <details style="margin-top:10px">
          <summary style="cursor:pointer;font-weight:700;font-size:13px;color:var(--primary);list-style:none">${en ? "View full summary" : "查看完整总结"}</summary>
          <div style="margin-top:12px">${renderWordSummaryCards(s, en)}</div>
        </details>
        <div class="form-actions" style="margin-top:10px" id="wsummary-actions-${index}">
          <button class="btn" type="button" onclick="deleteWordSummary(${index})">${en ? "Delete" : "删除"}</button>
        </div>
      </div>`;
    }

    function deleteWordSummary(index) {
      const en = state.lang === "en";
      document.getElementById(`wsummary-actions-${index}`).innerHTML = `
        <span style="color:var(--muted);font-size:14px;align-self:center">${en ? "Delete this summary?" : "确认删除此总结？"}</span>
        <button class="btn primary" type="button" onclick="confirmDeleteWordSummary(${index})">${en ? "Yes, delete" : "确认删除"}</button>
        <button class="btn" type="button" onclick="cancelDeleteWordSummary(${index})">${en ? "Cancel" : "取消"}</button>
      `;
    }

    function confirmDeleteWordSummary(index) {
      const all = JSON.parse(localStorage.getItem(meetingSummariesKey) || "[]");
      all.splice(index, 1);
      localStorage.setItem(meetingSummariesKey, JSON.stringify(all));
      renderWord();
      bindWordPage();
    }

    function cancelDeleteWordSummary(index) {
      const en = state.lang === "en";
      document.getElementById(`wsummary-actions-${index}`).innerHTML = `
        <button class="btn" type="button" onclick="deleteWordSummary(${index})">${en ? "Delete" : "删除"}</button>
      `;
    }

    function editWordSummaryInline() {
      const en = state.lang === "en";
      const s = wordSummary;
      const actionItemsText = s.actionItems.map(a => `${a.responsible || ""}: ${a.task}`).join("\n");
      document.getElementById("word-summary-wrap").innerHTML = `
        <h3 class="section-title">${en ? "Edit Summary" : "编辑总结"}</h3>
        <div class="update-form card">
          <label>${en ? "Meeting Purpose" : "会议目的"}<textarea id="we-purpose" rows="3">${escapeHtml(s.meetingPurpose)}</textarea></label>
          <label>${en ? "Key Discussion Points (one per line)" : "主要讨论点（每行一条）"}<textarea id="we-discussion" rows="4">${s.keyDiscussionPoints.map(p => escapeHtml(p)).join("\n")}</textarea></label>
          <label>${en ? "Decisions Made (one per line)" : "已做决定（每行一条）"}<textarea id="we-decisions" rows="4">${s.decisionsMade.map(d => escapeHtml(d)).join("\n")}</textarea></label>
          <label>${en ? 'Action Items — one per line, format: "Person: Task"' : '行动项（每行一条，格式："负责人: 任务"）'}<textarea id="we-actions" rows="4">${actionItemsText}</textarea></label>
          <label>${en ? "Deadlines and Next Steps (one per line)" : "截止日期与后续步骤（每行一条）"}<textarea id="we-deadlines" rows="4">${s.deadlinesNextSteps.map(d => escapeHtml(d)).join("\n")}</textarea></label>
          <div class="form-actions">
            <button class="btn primary" type="button" onclick="applyWordSummaryEdits()">${en ? "Apply Changes" : "应用修改"}</button>
            <button class="btn" type="button" onclick="renderWord();bindWordPage();">${en ? "Cancel" : "取消"}</button>
          </div>
        </div>
      `;
    }

    function applyWordSummaryEdits() {
      const splitLines = text => text.split("\n").map(l => l.trim()).filter(Boolean);
      wordSummary = {
        meetingPurpose: document.getElementById("we-purpose").value.trim(),
        keyDiscussionPoints: splitLines(document.getElementById("we-discussion").value),
        decisionsMade: splitLines(document.getElementById("we-decisions").value),
        actionItems: splitLines(document.getElementById("we-actions").value).map(line => {
          const idx = line.indexOf(": ");
          return idx > -1
            ? { responsible: line.slice(0, idx).trim(), task: line.slice(idx + 2).trim() }
            : { responsible: "", task: line.trim() };
        }),
        deadlinesNextSteps: splitLines(document.getElementById("we-deadlines").value)
      };
      renderWord();
      bindWordPage();
    }

    function bindWordPage() {
      const saveKeyBtn = document.getElementById("word-save-key");
      if (!saveKeyBtn) return;

      saveKeyBtn.addEventListener("click", () => {
        const key = document.getElementById("word-api-key").value.trim();
        if (key) localStorage.setItem("joshuaGpsGroqKey", key);
      });

      document.getElementById("word-file-input").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const en = state.lang === "en";
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          let text = result.value.trim();
          if (text.length > 12000) text = text.slice(0, 12000);
          wordDocText = text;
          wordFileName = file.name;
          wordSummaryTitle = file.name.replace(/\.docx$/i, "");
          wordSummary = null;
          renderWord();
          bindWordPage();
        } catch (err) {
          alert(en ? `Failed to read file: ${err.message}` : `文件读取失败：${err.message}`);
        }
      });

      const generateBtn = document.getElementById("word-generate-btn");
      if (!generateBtn) return;

      generateBtn.addEventListener("click", async () => {
        const en = state.lang === "en";
        const apiKey = localStorage.getItem("joshuaGpsGroqKey");
        if (!apiKey) {
          alert(en ? "Please save your Groq API key first." : "请先保存您的 Groq API 密钥。");
          document.getElementById("word-api-key").focus();
          return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = en ? "Generating…" : "生成中…";

        const systemPrompt = `You are a meeting notes analyst. Extract a structured summary from the provided meeting document. Return ONLY valid JSON using exactly this structure, with no extra text:
{"meetingPurpose":"string","keyDiscussionPoints":["string"],"decisionsMade":["string"],"actionItems":[{"task":"string","responsible":"string"}],"deadlinesNextSteps":["string"]}
If a section has no content use an empty array or the string "None identified".`;

        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Analyze this meeting document:\n\n${wordDocText}` }
              ]
            })
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
          }

          const json = await response.json();
          wordSummary = JSON.parse(json.choices[0].message.content);
          renderWord();
          bindWordPage();
          document.getElementById("word-summary-wrap").scrollIntoView({ behavior: "smooth" });
        } catch (err) {
          alert((en ? "Error: " : "错误：") + err.message);
          generateBtn.disabled = false;
          generateBtn.textContent = en ? "Generate Meeting Summary" : "生成会议总结";
        }
      });

      const titleInput = document.getElementById("word-summary-title");
      if (titleInput) titleInput.addEventListener("input", () => { wordSummaryTitle = titleInput.value; });

      const editBtn = document.getElementById("word-edit-btn");
      if (editBtn) editBtn.addEventListener("click", editWordSummaryInline);

      const saveBtn = document.getElementById("word-save-btn");
      if (!saveBtn) return;

      saveBtn.addEventListener("click", () => {
        if (!wordSummary) return;
        const all = JSON.parse(localStorage.getItem(meetingSummariesKey) || "[]");
        all.push({ ...wordSummary, fileName: wordFileName, title: wordSummaryTitle || wordFileName, savedAt: new Date().toISOString().slice(0, 10) });
        localStorage.setItem(meetingSummariesKey, JSON.stringify(all));
        wordSummary = null;
        wordDocText = "";
        wordFileName = "";
        wordSummaryTitle = "";
        renderWord();
        bindWordPage();
      });
    }

    function renderTest() {
      const allNotes = JSON.parse(localStorage.getItem(projectNotesKey) || "[]");
      const saved = allNotes.slice().reverse();
      document.getElementById("testPage").innerHTML = `
        <div class="hero"><h3>Project Note</h3><p>${state.lang === "en" ? "Every Site demo should leave a standard project note so Joshua can explain input, process, output and learning." : "每个 Site Demo 都要留下标准 Project Note，方便 Joshua 讲清输入、过程、输出和收获。"}</p></div>
        <div class="grid cols-2">
          <div class="card"><h4>${state.lang === "en" ? "Project Note Template" : "Project Note 模板"}</h4><pre>${data.projectTemplate.join("\\n")}</pre></div>
          <div class="card"><h4>${state.lang === "en" ? "Expected project notes" : "预期项目记录"}</h4>${list(state.lang === "en" ? data.portfolio.en.projects : data.portfolio.zh.projects)}</div>
        </div>
        <h3 class="section-title">${state.lang === "en" ? "New Project Note" : "新建项目记录"}</h3>
        <form class="update-form card" id="test-project-form">
          <div class="form-grid">
            <label>${state.lang === "en" ? "Project Name" : "项目名称"}<input name="projectName" type="text" required></label>
            <label>${state.lang === "en" ? "Date" : "日期"}<input name="date" type="date" required></label>
          </div>
          <label>${state.lang === "en" ? "Source Material" : "来源材料"}<input name="sourceMaterial" type="text"></label>
          <label>${state.lang === "en" ? "Problem" : "问题"}<textarea name="problem" rows="2" required></textarea></label>
          <label>${state.lang === "en" ? "Input" : "输入"}<textarea name="input" rows="2"></textarea></label>
          <label>${state.lang === "en" ? "AI Process" : "AI 处理过程"}<textarea name="aiProcess" rows="3"></textarea></label>
          <label>${state.lang === "en" ? "IT / Site Process" : "IT / Site 处理过程"}<textarea name="siteProcess" rows="2"></textarea></label>
          <label>${state.lang === "en" ? "Output" : "输出"}<textarea name="output" rows="2" required></textarea></label>
          <div class="form-grid">
            <label>${state.lang === "en" ? "PC Version" : "PC 端版本"}<input name="pcVersion" type="text"></label>
            <label>${state.lang === "en" ? "Mobile Version" : "手机端版本"}<input name="mobileVersion" type="text"></label>
          </div>
          <label>${state.lang === "en" ? "What I Learned" : "我学到了什么"}<textarea name="learned" rows="2" required></textarea></label>
          <label>${state.lang === "en" ? "Next Improvement" : "下一步改进"}<textarea name="nextImprovement" rows="2"></textarea></label>
          <div class="form-actions">
            <button class="btn primary" type="submit">${state.lang === "en" ? "Submit Project Note" : "提交项目记录"}</button>
          </div>
        </form>
        <h3 class="section-title">${state.lang === "en" ? "Saved Project Notes" : "已保存项目记录"}</h3>
        <div id="saved-project-list">
          ${saved.length ? saved.map((note, i) => renderSavedProjectNote(note, allNotes.length - 1 - i)).join("") : `<div class="log-item"><h4>${state.lang === "en" ? "No saved project notes yet" : "还没有保存的项目记录"}</h4><p>${state.lang === "en" ? "Fill in the form above and submit." : "填写上方表单并提交。"}</p></div>`}
        </div>
      `;
    }

    function renderSavedProjectNote(note, index) {
      const en = state.lang === "en";
      return `<div class="log-item" id="note-card-${index}">
        <h4>${escapeHtml(note.projectName)} · ${escapeHtml(note.date)}</h4>
        <div class="log-meta">${escapeHtml(note.sourceMaterial)}</div>
        <p><strong>${en ? "Problem" : "问题"}:</strong> ${escapeHtml(note.problem)}</p>
        <p><strong>${en ? "Input" : "输入"}:</strong> ${escapeHtml(note.input)}</p>
        <p><strong>${en ? "AI Process" : "AI 处理过程"}:</strong> ${escapeHtml(note.aiProcess)}</p>
        <p><strong>${en ? "IT / Site Process" : "IT / Site 处理过程"}:</strong> ${escapeHtml(note.siteProcess)}</p>
        <p><strong>${en ? "Output" : "输出"}:</strong> ${escapeHtml(note.output)}</p>
        <p><strong>PC:</strong> ${escapeHtml(note.pcVersion)} &nbsp;|&nbsp; <strong>${en ? "Mobile" : "手机端"}:</strong> ${escapeHtml(note.mobileVersion)}</p>
        <p><strong>${en ? "Learned" : "我学到了什么"}:</strong> ${escapeHtml(note.learned)}</p>
        <p><strong>${en ? "Next Improvement" : "下一步改进"}:</strong> ${escapeHtml(note.nextImprovement)}</p>
        <div class="form-actions" style="margin-top:10px" id="note-actions-${index}">
          <button class="btn" type="button" onclick="editProjectNote(${index})">${en ? "Edit" : "编辑"}</button>
          <button class="btn" type="button" onclick="deleteProjectNote(${index})">${en ? "Delete" : "删除"}</button>
        </div>
      </div>`;
    }

    function deleteProjectNote(index) {
      const en = state.lang === "en";
      document.getElementById(`note-actions-${index}`).innerHTML = `
        <span style="color:var(--muted);font-size:14px;align-self:center">${en ? "Delete this note?" : "确认删除这条记录？"}</span>
        <button class="btn primary" type="button" onclick="confirmDeleteProjectNote(${index})">${en ? "Yes, delete" : "确认删除"}</button>
        <button class="btn" type="button" onclick="cancelDeleteProjectNote(${index})">${en ? "Cancel" : "取消"}</button>
      `;
    }

    function confirmDeleteProjectNote(index) {
      const saved = JSON.parse(localStorage.getItem(projectNotesKey) || "[]");
      saved.splice(index, 1);
      localStorage.setItem(projectNotesKey, JSON.stringify(saved));
      renderTest();
      bindTestForm();
    }

    function cancelDeleteProjectNote(index) {
      const en = state.lang === "en";
      document.getElementById(`note-actions-${index}`).innerHTML = `
        <button class="btn" type="button" onclick="editProjectNote(${index})">${en ? "Edit" : "编辑"}</button>
        <button class="btn" type="button" onclick="deleteProjectNote(${index})">${en ? "Delete" : "删除"}</button>
      `;
    }

    function editProjectNote(index) {
      const saved = JSON.parse(localStorage.getItem(projectNotesKey) || "[]");
      const note = saved[index];
      const form = document.getElementById("test-project-form");
      form.projectName.value = note.projectName || "";
      form.date.value = note.date || "";
      form.sourceMaterial.value = note.sourceMaterial || "";
      form.problem.value = note.problem || "";
      form.input.value = note.input || "";
      form.aiProcess.value = note.aiProcess || "";
      form.siteProcess.value = note.siteProcess || "";
      form.output.value = note.output || "";
      form.pcVersion.value = note.pcVersion || "";
      form.mobileVersion.value = note.mobileVersion || "";
      form.learned.value = note.learned || "";
      form.nextImprovement.value = note.nextImprovement || "";
      form.dataset.editIndex = index;
      form.querySelector("[type=submit]").textContent = state.lang === "en" ? "Save Changes" : "保存修改";
      form.scrollIntoView({ behavior: "smooth" });
    }

    function bindTestForm() {
      const form = document.getElementById("test-project-form");
      if (!form) return;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const note = Object.fromEntries(new FormData(event.currentTarget).entries());
        const saved = JSON.parse(localStorage.getItem(projectNotesKey) || "[]");
        if (form.dataset.editIndex !== undefined && form.dataset.editIndex !== "") {
          saved[Number(form.dataset.editIndex)] = note;
          delete form.dataset.editIndex;
        } else {
          saved.push(note);
        }
        localStorage.setItem(projectNotesKey, JSON.stringify(saved));
        renderTest();
        bindTestForm();
      });
    }

    function renderExcelTable() {
      const en = state.lang === "en";
      if (!excelWorkbook || !excelActiveSheet) return "";
      const sheet = excelWorkbook.Sheets[excelActiveSheet];
      const ref = sheet["!ref"];
      if (!ref) return `<p style="padding:16px;color:var(--muted)">${en ? "This sheet is empty." : "此工作表为空。"}</p>`;
      const range = XLSX.utils.decode_range(ref);
      const rows = [];
      for (let r = range.s.r; r <= range.e.r; r++) {
        const row = [];
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cell = sheet[XLSX.utils.encode_cell({ r, c })];
          row.push(cell ? XLSX.utils.format_cell(cell) : "");
        }
        rows.push(row);
      }
      if (!rows.length) return `<p style="padding:16px;color:var(--muted)">${en ? "This sheet is empty." : "此工作表为空。"}</p>`;
      const [head, ...body] = rows;
      const headCells = head.map(c => `<th>${escapeHtml(c)}</th>`).join("");
      const bodyRows = body.map(row =>
        `<tr>${head.map((_, i) => `<td>${escapeHtml(row[i] ?? "")}</td>`).join("")}</tr>`
      ).join("");
      return `<table class="excel-table"><thead><tr>${headCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    }

    function renderExcel() {
      const en = state.lang === "en";
      const hasBook = excelWorkbook !== null;
      const sheets = hasBook ? excelWorkbook.SheetNames : [];
      let rowCount = 0, colCount = 0;
      if (hasBook) {
        const ref = excelWorkbook.Sheets[excelActiveSheet]["!ref"];
        if (ref) {
          const range = XLSX.utils.decode_range(ref);
          rowCount = Math.max(0, range.e.r - range.s.r);
          colCount = range.e.c - range.s.c + 1;
        }
      }

      document.getElementById("excel").innerHTML = `
        <div class="hero">
          <h3>${en ? "Excel to Table" : "表格转网页"}</h3>
          <p>${en ? "Upload an Excel or CSV file and view it as a clean, scrollable table." : "上传 Excel 或 CSV 文件，以整洁可滚动的表格形式查看。"}</p>
        </div>
        <div class="update-form card">
          <label>${en ? "File (.xlsx, .xls, .csv)" : "文件（.xlsx、.xls、.csv）"}
            <input type="file" id="excel-file-input" accept=".xlsx,.xls,.csv" style="padding:8px 0;border:0;background:none;box-shadow:none;font:inherit">
          </label>
          ${hasBook ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
            <span class="pill green">${escapeHtml(excelFileName)}</span>
            <span class="pill">${rowCount} ${en ? "rows" : "行"}</span>
            <span class="pill">${colCount} ${en ? "columns" : "列"}</span>
          </div>` : ""}
        </div>

        ${hasBook ? `
          ${sheets.length > 1 ? `
            <h3 class="section-title">${en ? "Sheets" : "工作表"}</h3>
            <div class="form-actions">
              ${sheets.map((s, i) => `<button class="btn ${s === excelActiveSheet ? "primary" : ""}" type="button" onclick="switchExcelSheet(${i})">${escapeHtml(s)}</button>`).join("")}
            </div>
          ` : ""}
          <h3 class="section-title">${escapeHtml(excelActiveSheet)}</h3>
          <div class="excel-wrap">${renderExcelTable()}</div>
        ` : ""}
      `;
    }

    function switchExcelSheet(index) {
      excelActiveSheet = excelWorkbook.SheetNames[index];
      renderExcel();
      bindExcelPage();
    }

    function bindExcelPage() {
      const input = document.getElementById("excel-file-input");
      if (!input) return;
      input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const en = state.lang === "en";
        try {
          const arrayBuffer = await file.arrayBuffer();
          excelWorkbook = XLSX.read(arrayBuffer, { type: "array" });
          excelActiveSheet = excelWorkbook.SheetNames[0];
          excelFileName = file.name;
          renderExcel();
          bindExcelPage();
        } catch (err) {
          alert(en ? `Failed to read file: ${err.message}` : `文件读取失败：${err.message}`);
        }
      });
    }

    function countXmindNodes(node) {
      return 1 + node.children.reduce((s, c) => s + countXmindNodes(c), 0);
    }

    function renderXmindNode(node, depth) {
      const hasChildren = node.children.length > 0;
      const noteHtml = node.notes ? `<div class="xmind-note">${escapeHtml(node.notes)}</div>` : "";

      if (!hasChildren) {
        return `<div class="xmind-leaf"><span class="xmind-dot">◆</span><span>${escapeHtml(node.title)}${noteHtml}</span></div>`;
      }

      if (depth === 1) {
        return `<details class="xmind-section" open>
          <summary class="xmind-section-summary">${escapeHtml(node.title)}</summary>
          <div class="xmind-section-body">
            ${noteHtml}
            ${node.children.map(c => renderXmindNode(c, 2)).join("")}
          </div>
        </details>`;
      }

      return `<details class="xmind-nested">
        <summary class="xmind-nested-summary">${escapeHtml(node.title)}</summary>
        <div class="xmind-nested-body">
          ${noteHtml}
          ${node.children.map(c => renderXmindNode(c, depth + 1)).join("")}
        </div>
      </details>`;
    }

    function parseXmindJsonTopic(topic) {
      if (!topic) return { title: "", notes: "", children: [] };
      const attached = topic.children?.attached || [];
      return {
        title: topic.title || "",
        notes: topic.notes?.plain?.content || "",
        children: attached.map(parseXmindJsonTopic)
      };
    }

    function parseXmindXmlTopic(el) {
      let title = "";
      for (const t of el.getElementsByTagName("title")) {
        if (t.parentNode === el) { title = t.textContent; break; }
      }
      let notes = "";
      for (const p of el.getElementsByTagName("plain")) {
        if (p.parentNode?.parentNode === el) { notes = p.textContent.trim(); break; }
      }
      const children = [];
      for (const ce of el.getElementsByTagName("children")) {
        if (ce.parentNode === el) {
          for (const topics of ce.getElementsByTagName("topics")) {
            if (topics.getAttribute("type") === "attached" && topics.parentNode === ce) {
              for (const t of topics.getElementsByTagName("topic")) {
                if (t.parentNode === topics) children.push(parseXmindXmlTopic(t));
              }
            }
          }
          break;
        }
      }
      return { title, notes, children };
    }

    async function parseXmindFile(file) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      if (zip.files["content.json"]) {
        const json = JSON.parse(await zip.files["content.json"].async("string"));
        const sheet = Array.isArray(json) ? json[0] : json;
        return parseXmindJsonTopic(sheet.rootTopic || sheet);
      }
      if (zip.files["content.xml"]) {
        const xmlText = await zip.files["content.xml"].async("string");
        const doc = new DOMParser().parseFromString(xmlText, "text/xml");
        const sheets = doc.getElementsByTagName("sheet");
        if (!sheets.length) throw new Error("No sheet found");
        const rootTopics = sheets[0].getElementsByTagName("topic");
        if (!rootTopics.length) throw new Error("No root topic found");
        return parseXmindXmlTopic(rootTopics[0]);
      }
      throw new Error(state.lang === "en" ? "Unrecognized XMind format" : "无法识别的 XMind 格式");
    }

    function renderXmind() {
      const en = state.lang === "en";
      const nodeCount = xmindTree ? countXmindNodes(xmindTree) - 1 : 0;
      document.getElementById("xmind").innerHTML = `
        <div class="hero">
          <h3>${en ? "Mind Map Viewer" : "思维导图查看器"}</h3>
          <p>${en ? "Upload an .xmind file to view it as a collapsible tree with content cards." : "上传 .xmind 文件，以可折叠树形结构和内容卡片的形式查看。"}</p>
        </div>
        <div class="update-form card">
          <label>${en ? "XMind File (.xmind)" : "XMind 文件（.xmind）"}
            <input type="file" id="xmind-file-input" accept=".xmind" style="padding:8px 0;border:0;background:none;box-shadow:none;font:inherit">
          </label>
          ${xmindTree ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
            <span class="pill green">${escapeHtml(xmindFileName)}</span>
            <span class="pill">${nodeCount} ${en ? "nodes" : "个节点"}</span>
          </div>` : ""}
        </div>
        ${xmindTree ? `
          <div class="hero" style="margin-top:16px">
            <h3>${escapeHtml(xmindTree.title)}</h3>
            ${xmindTree.notes ? `<p>${escapeHtml(xmindTree.notes)}</p>` : ""}
          </div>
          <div style="display:grid;gap:12px">
            ${xmindTree.children.map(c => renderXmindNode(c, 1)).join("")}
          </div>
        ` : ""}
      `;
    }

    function bindXmindPage() {
      const input = document.getElementById("xmind-file-input");
      if (!input) return;
      input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const en = state.lang === "en";
        try {
          xmindTree = await parseXmindFile(file);
          xmindFileName = file.name;
          renderXmind();
          bindXmindPage();
        } catch (err) {
          alert(en ? `Failed to read file: ${err.message}` : `文件读取失败：${err.message}`);
        }
      });
    }

    function inlineMarkdown(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`(.+?)`/g, "<code>$1</code>")
        .replace(/\[(.+?)\]\((.+?)\)/g, (_, label, url) => {
          const safe = /^(https?:\/\/|mailto:|#|\/)/.test(url) ? url : "#";
          return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        });
    }

    function parseMarkdown(md) {
      const out = [];
      let inList = false;
      for (const line of md.split("\n")) {
        if (/^### /.test(line)) {
          if (inList) { out.push("</ul>"); inList = false; }
          out.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
        } else if (/^## /.test(line)) {
          if (inList) { out.push("</ul>"); inList = false; }
          out.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
        } else if (/^# /.test(line)) {
          if (inList) { out.push("</ul>"); inList = false; }
          out.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
        } else if (/^[-*] /.test(line)) {
          if (!inList) { out.push("<ul>"); inList = true; }
          out.push(`  <li>${inlineMarkdown(line.slice(2))}</li>`);
        } else if (line.trim() === "") {
          if (inList) { out.push("</ul>"); inList = false; }
        } else {
          if (inList) { out.push("</ul>"); inList = false; }
          out.push(`<p>${inlineMarkdown(line)}</p>`);
        }
      }
      if (inList) out.push("</ul>");
      return out.join("\n");
    }

    function renderMarkdown() {
      const en = state.lang === "en";
      document.getElementById("markdown").innerHTML = `
        <div class="hero">
          <h3>${en ? "Markdown to HTML" : "Markdown 转 HTML"}</h3>
          <p>${en ? "Type or paste Markdown on the left — the formatted preview updates live on the right." : "在左侧输入或粘贴 Markdown，右侧实时显示格式化预览。"}</p>
        </div>
        <div class="grid cols-2" style="align-items:start">
          <div class="card">
            <h4>${en ? "Markdown Input" : "Markdown 输入"}</h4>
            <textarea id="md-input" rows="18" style="width:100%;margin-top:10px;border:1px solid var(--line);border-radius:12px;padding:12px;font-family:monospace;font-size:13px;resize:vertical;background:#f9fafb;color:var(--text)" placeholder="${en ? "# Heading\n\n- list item\n\n**bold text**\n\n[Link](https://example.com)" : "# 标题\n\n- 列表项\n\n**加粗文字**"}"></textarea>
            <div class="form-actions" style="margin-top:10px">
              <button class="btn primary" id="md-copy-html" type="button">${en ? "Copy HTML" : "复制 HTML"}</button>
              <button class="btn" id="md-clear" type="button">${en ? "Clear" : "清空"}</button>
            </div>
          </div>
          <div class="card">
            <h4>${en ? "Preview" : "预览"}</h4>
            <div id="md-preview" class="md-preview" style="margin-top:10px;min-height:120px"></div>
          </div>
        </div>
      `;
    }

    function bindMarkdownPage() {
      const input = document.getElementById("md-input");
      if (!input) return;
      const preview = document.getElementById("md-preview");
      const copyBtn = document.getElementById("md-copy-html");
      const clearBtn = document.getElementById("md-clear");

      input.addEventListener("input", () => {
        preview.innerHTML = parseMarkdown(input.value);
      });

      copyBtn.addEventListener("click", () => {
        const en = state.lang === "en";
        navigator.clipboard.writeText(parseMarkdown(input.value)).then(() => {
          copyBtn.textContent = en ? "Copied!" : "已复制！";
          setTimeout(() => { copyBtn.textContent = en ? "Copy HTML" : "复制 HTML"; }, 2000);
        });
      });

      clearBtn.addEventListener("click", () => {
        input.value = "";
        preview.innerHTML = "";
      });
    }

    function renderAll() {
      applyLocalUpdates();
      renderUi();
      renderNav();
      renderDashboard();
      renderToday();
      renderWeekly();
      renderPriority();
      renderSchedule();
      renderLogs();
      renderProjects();
      renderPortfolio();
      renderWord();
      renderTest();
      renderMarkdown();
      renderExcel();
      renderXmind();
      showPage(state.active, false);
      bindDailyUpdateForm();
      bindTestForm();
      bindWordPage();
      bindMarkdownPage();
      bindExcelPage();
      bindXmindPage();
    }

    function bindDailyUpdateForm() {
      const form = document.getElementById("daily-update-form");
      if (!form) return;
      form.addEventListener("submit", handleDailyUpdate);

      document.getElementById("export-local")?.addEventListener("click", exportLocalRecords);
      document.getElementById("reset-local")?.addEventListener("click", () => {
        if (!confirm(state.lang === "en" ? "Clear local updates in this browser?" : "清除当前浏览器里的本地更新？")) return;
        localStorage.removeItem(storageKey);
        fetchBaseData();
      });
    }

    function handleDailyUpdate(event) {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const log = Object.fromEntries(formData.entries());
      const localState = readLocalState();
      localState.logs = localState.logs || [];

      if (form.dataset.editIndex !== undefined && form.dataset.editIndex !== "") {
        const index = Number(form.dataset.editIndex);
        localState.logs[index] = { ...localState.logs[index], ...log };
        delete form.dataset.editIndex;
        writeLocalState(localState);
        renderLogs();
        bindDailyUpdateForm();
        return;
      }

      localState.backups = localState.backups || [];
      localState.backups.push({
        savedAt: new Date().toISOString(),
        today: cloneValue(data.today)
      });
      localState.logs.push({
        date: log.date,
        day: log.day,
        focus: log.focus,
        learned: log.learned,
        built: log.built,
        aiHelpedWith: log.aiHelpedWith,
        difficulty: log.difficulty,
        questions: log.questions,
        nextStep: log.nextStep
      });

      const nextNumber = dayNumber(log.day) + 1;
      const scheduleRow = data.schedule[nextNumber - 1] || [];
      const feedback = [log.difficulty, log.questions].filter(Boolean).join(" / ");
      const nextStep = log.nextStep || scheduleRow[2] || "Continue the next GPS task.";
      const currentResources = currentLangBlock(data.today).resources || [];
      localState.generatedToday = {
        day: `Day ${nextNumber}`,
        status: "Ready",
        en: {
          focus: nextStep,
          tasks: [
            nextStep,
            feedback ? `Review yesterday's feedback: ${feedback}` : "Review yesterday's Daily Log.",
            scheduleRow[3] || "Follow the monthly GPS schedule.",
            "Update the Daily Log at the end of the day."
          ],
          deliverables: [
            scheduleRow[4] || "Updated Daily Log",
            "One visible progress item",
            "End-of-day feedback"
          ],
          resources: currentResources,
          check: [
            "Did I address yesterday's difficulty?",
            "Did I complete one visible output?",
            "Did I update the Daily Log?"
          ]
        },
        zh: {
          focus: `根据前一天反馈继续推进：${nextStep}`,
          tasks: [
            `执行下一步：${nextStep}`,
            feedback ? `复盘昨天反馈：${feedback}` : "复盘昨天的 Daily Log。",
            scheduleRow[3] || "按月度 GPS 计划继续推进。",
            "当天结束时更新 Daily Log。"
          ],
          deliverables: [
            scheduleRow[4] || "更新后的 Daily Log",
            "一个可见进展",
            "当天反馈"
          ],
          resources: data.today.zh.resources || [],
          check: [
            "是否处理了昨天的困难？",
            "是否完成了一个可见成果？",
            "是否更新了 Daily Log？"
          ]
        }
      };

      writeLocalState(localState);
      state.active = "today";
      fetchBaseData();
    }

    function exportLocalRecords() {
      const localState = readLocalState();
      const blob = new Blob([JSON.stringify(localState, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `joshua-gps-local-records-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    }

    function showPage(id, rerenderNav = true) {
      state.active = id;
      document.querySelectorAll(".section").forEach((section) => section.classList.remove("active"));
      document.getElementById(id).classList.add("active");
      if (rerenderNav) renderNav();
      document.getElementById("sidebar").classList.remove("sidebar-open");
      document.getElementById("sidebar-overlay").classList.remove("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function toggleLang() {
      state.lang = state.lang === "en" ? "zh" : "en";
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      renderAll();
    }

    function readCurrent() {
      if (!("speechSynthesis" in window)) {
        alert(state.lang === "en" ? "This browser does not support read-aloud." : "这个浏览器不支持朗读功能。");
        return;
      }
      window.speechSynthesis.cancel();
      const section = document.getElementById(state.active);
      const text = section.innerText.replace(/\s+/g, " ").trim();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = state.lang === "en" ? "en-US" : "zh-CN";
      utterance.rate = state.lang === "en" ? 0.95 : 0.9;
      window.speechSynthesis.speak(utterance);
    }

    document.getElementById("lang-toggle").addEventListener("click", toggleLang);
    document.getElementById("read-btn").addEventListener("click", readCurrent);
    document.getElementById("stop-btn").addEventListener("click", () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    });

    function openSidebar() {
      if (window.innerWidth > 980) {
        document.querySelector(".app").classList.toggle("sidebar-collapsed");
      } else {
        document.getElementById("sidebar").classList.add("sidebar-open");
        document.getElementById("sidebar-overlay").classList.add("active");
      }
    }

    function closeSidebar() {
      document.getElementById("sidebar").classList.remove("sidebar-open");
      document.getElementById("sidebar-overlay").classList.remove("active");
    }

    document.getElementById("sidebar-toggle").addEventListener("click", openSidebar);
    document.getElementById("sidebar-close").addEventListener("click", closeSidebar);
    document.getElementById("sidebar-overlay").addEventListener("click", closeSidebar);

    function fetchBaseData() {
      fetch("data/gps.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load data/gps.json (${response.status})`);
        return response.json();
      })
      .then((json) => {
        data = json;
        renderAll();
      })
      .catch((error) => {
        document.getElementById("dashboard").innerHTML = `<div class="card"><h4>Data failed to load</h4><p>${error.message}</p><p>Please open this site through a local server, for example http://127.0.0.1:8000/index.html.</p></div>`;
      });
    }

    fetchBaseData();
