(function () {
  "use strict";
  var state = { mode: "zh", active: 0 };
  var doc = null;
  var icons = ["01", "02", "03", "04", "05", "06", "07", "08", "09"];
const exact = new Map(Object.entries({
  "TBY 电商业务介绍": "TBY E-Commerce Business Introduction",
  "电商含义": "What E-Commerce Means",
  "不是只在线卖货": "E-Commerce Is Not Just Online Selling",
  "我们公司的电商": "Our Company's E-Commerce Business",
  "核心经营问题": "Core Operating Questions",
  "给IT的理解": "How IT Should Understand the Business",
  "主营平台": "Main Sales Platforms",
  "Amazon：重点主线": "Amazon: The Main Priority",
  "TikTok Shop": "TikTok Shop",
  "Shopify": "Shopify",
  "Walmart": "Walmart",
  "B2B渠道": "B2B Channels",
  "中国市场": "China Market",
  "产品与系统": "Products and Systems",
  "主要产品线": "Main Product Lines",
  "IT要识别的编码": "Codes IT Needs to Recognize",
  "为什么对象管理重要": "Why Object Management Matters",
  "历史数据基础": "Historical Data Foundation",
  "Amazon 运营": "Amazon Operations",
  "如何运转": "How It Works",
  "Listing页面": "Listing Page",
  "Review与信任": "Reviews and Trust",
  "广告流量": "Advertising Traffic",
  "促销工具": "Promotion Tools",
  "库存履约": "Inventory and Fulfillment",
  "合规与Case": "Compliance and Cases",
  "日常工作": "Daily Work",
  "看目标差距": "Check Target Gaps",
  "看广告效率": "Check Advertising Efficiency",
  "看库存风险": "Check Inventory Risk",
  "看页面问题": "Check Listing Page Issues",
  "看异常信号": "Check Abnormal Signals",
  "数据分析": "Data Analysis",
  "核心KPI": "Core KPIs",
  "为什么要统一口径": "Why Definitions Must Be Unified",
  "数据维度": "Data Dimensions",
  "目前适合自动化": "Suitable Automation Opportunities Now",
  "AI Agent ": "AI Agent",
  "当前工作痛点": "Current Work Pain Points",
  "数据分散": "Scattered Data",
  "报表人工": "Manual Reporting",
  "任务分散": "Scattered Tasks",
  "经验难沉淀": "Experience Is Hard to Retain",
  "版本管理弱": "Weak Version Management",
  "什么适合Agent化": "What Is Suitable for Agents",
  "适合的工作": "Suitable Work",
  "不适合直接自动化": "Not Suitable for Direct Automation",
  "推荐模式": "Recommended Mode",
  "判断标准": "Evaluation Criteria",
  "Agent场景设计": "Agent Scenario Design",
  "KPI报表Agent": "KPI Reporting Agent",
  "Amazon运营Agent": "Amazon Operations Agent",
  "广告Agent": "Advertising Agent",
  "库存Agent": "Inventory Agent",
  "Listing Agent": "Listing Agent",
  "Case Agent": "Case Agent",
  "B2B Agent": "B2B Agent",
  "会议任务Agent": "Meeting Task Agent",
  "合规Label Agent": "Compliance Label Agent",
  "TBY 业务 需要配合什么": "What TBY Business Needs to Provide",
  "整理SOP": "Organize SOPs",
  "统一数据口径": "Unify Data Definitions",
  "提供样例资料": "Provide Sample Materials",
  "定义阈值规则": "Define Threshold Rules",
  "明确权限边界": "Clarify Permission Boundaries",
  "建立反馈机制": "Build a Feedback Mechanism",
  "IT需要做什么": "What IT Needs to Do",
  "数据接入": "Data Integration",
  "数据底座": "Data Foundation",
  "Agent框架": "Agent Framework",
  "前端与看板": "Frontend and Dashboards",
  "权限与安全": "Permissions and Security",
  "落地方式": "Implementation Approach",
  "建议优先项目": "Recommended Priority Projects"
}));
const replacements = [
  ["电商", "e-commerce"], ["商品展示", "product display"], ["流量获取", "traffic acquisition"], ["下单支付", "checkout and payment"], ["仓库发货", "warehouse fulfillment"], ["售后复购", "after-sales repurchase"], ["每个环节", "each step"], ["后台", "backend systems"], ["数据", "data"], ["规则", "rules"], ["人工判断", "human judgment"], ["业务系统", "business system"], ["网站", "website"], ["多品牌", "multiple brands"], ["多产品", "multiple products"], ["多平台", "multiple platforms"], ["为主", "as the main channel"], ["同时有", "also including"], ["核心", "core"], ["平台", "platform"], ["判断", "evaluate"], ["重点产品", "priority products"], ["新品机会", "new product opportunities"], ["不同平台", "different platforms"], ["费用", "fees"], ["广告", "advertising"], ["达人", "creators"], ["内容", "content"], ["促销", "promotions"], ["销量", "units sold"], ["销售额", "sales revenue"], ["广告费", "ad spend"], ["成本", "cost"], ["毛利", "gross profit"], ["库存", "inventory"], ["效期", "shelf life"], ["业务流", "business flow"], ["数据流", "data flow"], ["任务流", "task flow"], ["上架", "listing"], ["销售", "sales"], ["复购", "repeat purchase"], ["运营", "operations"], ["设计", "design"], ["供应商", "suppliers"], ["协同", "collaboration"], ["目标差距", "target gap"], ["异常", "abnormality"], ["提醒", "alert"], ["报表", "report"], ["清洗", "clean"], ["合并", "merge"], ["计算", "calculate"], ["检查", "check"], ["决策", "decision-making"], ["输入", "input"], ["动作", "action"], ["输出", "output"], ["人工", "human"], ["确认", "confirm"], ["草稿", "draft"], ["证据", "evidence"], ["邮件", "email"], ["任务单", "task brief"], ["预算", "budget"], ["审批", "approval"], ["权限", "permissions"], ["安全", "security"], ["目标", "goal"], ["范围", "scope"], ["减少", "reduce"], ["风险", "risk"], ["责任人", "owner"], ["截止时间", "deadline"], ["复盘", "review"]
];
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function englishText(zh) {
  var source = String(zh || "").trim();
  if (!source) return "";
  if (/^https?:\/\//i.test(source)) return source;
  if (window.TBY_EN && Object.prototype.hasOwnProperty.call(window.TBY_EN, zh)) return window.TBY_EN[zh];
  if (window.TBY_EN && Object.prototype.hasOwnProperty.call(window.TBY_EN, source)) return window.TBY_EN[source];
  if (exact.has(source)) return exact.get(source);
  var text = source
    .replace(/：/g, ": ")
    .replace(/、/g, ", ")
    .replace(/，/g, ", ")
    .replace(/。/g, ". ")
    .replace(/等/g, " etc.");
  for (var i = 0; i < replacements.length; i++) {
    text = text.split(replacements[i][0]).join(replacements[i][1]);
  }
  return text && text !== source ? text : "Business point: " + source;
}
function appMode() {
  return document.documentElement.lang === "en" ? "en" : "zh";
}
function modeLabel() {
  return state.mode === "en" ? "English reading" : "中文阅读";
}
function renderText(zh) {
  var en = englishText(zh);
  if (/^https?:\/\//i.test(zh)) {
    return '<a href="' + escapeHtml(zh) + '" target="_blank" rel="noopener">' + escapeHtml(zh) + "</a>";
  }
  if (state.mode === "en") return '<span class="en-text stable-en">' + escapeHtml(en) + "</span>";
  return '<span class="zh-text">' + escapeHtml(zh) + "</span>";
}
function renderHeading(zh) { return renderText(zh); }
function flatten(node, list) {
  list = list || [];
  list.push(node);
  (node.children || []).forEach(function (child) { flatten(child, list); });
  return list;
}
function collectLeafItems(node) {
  var items = [];
  var walk = function (n) {
    if (!n.children || n.children.length === 0) items.push(n.zh);
    else n.children.forEach(walk);
  };
  (node.children || []).forEach(walk);
  return items;
}
function renderBullet(value) { return "<li>" + renderText(value.zh || value) + "</li>"; }
function renderSubgroup(group) {
  var leaves = collectLeafItems(group).slice(0, 4).map(function (zh) { return { zh: zh }; });
  return '<section class="subblock"><h5>' + renderHeading(group.zh) + '</h5><ul class="mini-list">' + leaves.map(renderBullet).join("") + "</ul></section>";
}
function renderModule(module, index) {
  var children = module.children || [];
  var directLeaves = children.filter(function (c) { return !c.children || c.children.length === 0; });
  var groups = children.filter(function (c) { return c.children && c.children.length > 0; });
  var leafSource = directLeaves.length ? directLeaves.map(function (c) { return c.zh; }) : collectLeafItems(module);
  var summaryItems = leafSource.slice(0, 3).map(function (zh) { return { zh: zh }; });
  var hiddenItems = leafSource.slice(3).map(function (zh) { return { zh: zh }; });
  var detailGroups = groups.slice(0, 4);
  var hasDetails = hiddenItems.length || detailGroups.length;
  return '<article class="module-card compact-card"><div class="module-head"><span class="module-index">' +
    String(index + 1).padStart(2, "0") + "</span><h4>" + renderHeading(module.zh) + "</h4></div>" +
    (summaryItems.length ? '<ul class="clean-list">' + summaryItems.map(renderBullet).join("") + "</ul>" : "") +
    (hasDetails ? '<details class="details-block"><summary>' + (state.mode === "en" ? "More details" : "展开详情") + "</summary>" +
      (hiddenItems.length ? '<ul class="mini-list extra-list">' + hiddenItems.map(renderBullet).join("") + "</ul>" : "") +
      (detailGroups.length ? '<div class="subgrid compact-subgrid">' + detailGroups.map(renderSubgroup).join("") + "</div>" : "") +
    "</details>" : "") +
    "</article>";
}
function renderKeyTakeaways(section) {
  var items = (section.children || []).slice(0, 3).map(function (child) {
    var first = collectLeafItems(child)[0] || child.zh;
    return '<div class="takeaway"><span class="pill green">' + renderHeading(child.zh) + "</span><p>" + renderText(first) + "</p></div>";
  }).join("");
  return items ? '<div class="takeaways compact-takeaways">' + items + "</div>" : "";
}
function renderNav() {
  var nav = document.getElementById("tby-nav-list");
  if (!nav || !doc) return;
  nav.innerHTML = '<span class="tmx-nav-caption">' + (state.mode === "en" ? "TBY Sections" : "TBY 章节") + "</span>" +
    doc.sections.map(function (section, index) {
      var label = state.mode === "en" ? englishText(section.zh) : section.zh;
      return '<button class="tmx-nav-item' + (state.active === index ? " tmx-active" : "") + '" data-index="' + index + '" type="button">' +
        '<span class="tmx-nav-num">' + (icons[index] || String(index + 1).padStart(2, "0")) + "</span><span>" + escapeHtml(label) + "</span></button>";
    }).join("");
  nav.querySelectorAll(".tmx-nav-item").forEach(function (btn) {
    btn.addEventListener("click", function () { showSection(Number(btn.dataset.index)); });
  });
}
function renderSection() {
  var content = document.getElementById("tby-content");
  if (!content || !doc) return;
  var section = doc.sections[state.active];
  var modules = section.children || [];
  var count = flatten(section, []).length;
  var heroDesc = state.mode === "en"
    ? "Presented as a structured business briefing. Core points are shown first, with details expandable."
    : "按业务介绍文档展示，默认只显示核心内容，更多信息可展开。";
  content.innerHTML =
    '<div class="tmx-hero"><h3>' + renderHeading(section.zh) + "</h3><p>" + escapeHtml(heroDesc) + "</p></div>" +
    '<div class="doc-meta"><span class="pill green">' + escapeHtml(modeLabel()) + '</span><span class="pill yellow">' + modules.length +
    ' modules</span><span class="pill purple">' + count + " source points</span></div>" +
    renderKeyTakeaways(section) +
    '<h3 class="section-title">' + (state.mode === "en" ? "Brief Modules" : "精简模块") + "</h3>" +
    '<div class="module-grid">' + modules.map(renderModule).join("") + "</div>";
}
function showSection(index) {
  state.active = index;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  renderNav();
  renderSection();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function renderTby() {
  if (!doc) return;
  state.mode = appMode();
  renderNav();
  renderSection();
}
function boot(json) {
  doc = json;
  state.mode = appMode();
  renderNav();
  renderSection();
}
var langBtn = document.getElementById("lang-toggle");
if (langBtn) langBtn.addEventListener("click", function () { setTimeout(renderTby, 0); });
window.renderTby = renderTby;
if (window.TBY_DOCUMENT) {
  boot(window.TBY_DOCUMENT);
} else {
  var fallback = document.getElementById("tby-content");
  if (fallback) fallback.innerHTML = '<div class="card empty"><h4>数据加载失败</h4><p>TBY document not loaded.</p></div>';
}
})();
