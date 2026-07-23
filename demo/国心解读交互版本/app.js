const sceneToScreen = {
  home: "screen-home",
  chat: "screen-chat",
  login: "screen-login",
  profile: "screen-profile",
  users: "screen-users",
  invite: "screen-invite",
  paywall: "screen-paywall",
  member: "screen-member",
  service: "screen-service",
  paid: "screen-paid",
  confirm: "screen-confirm",
  progress: "screen-progress",
  reports: "screen-reports",
  detail: "screen-detail",
};

const AUTH_STORAGE_KEY = "mingli-agent-logged-in";
const USAGE_STORAGE_KEY = "mingli-agent-daily-questions";
const CHAT_HISTORY_STORAGE_KEY = "mingli-agent-chat-history";
const PLAN_STORAGE_KEY = "mingli-agent-active-plan";
const BAZI_STORAGE_KEY = "mingli-agent-bazi-profile";
const BAZI_USERS_STORAGE_KEY = "mingli-agent-bazi-users";
const SELECTED_BAZI_USER_STORAGE_KEY = "mingli-agent-selected-bazi-user";
const BENEFIT_GRANTS_STORAGE_KEY = "mingli-agent-benefit-grants";
const REPORT_10_GRANT_TOKEN = "report10-20260722";
const DAILY_QUESTION_LIMIT = 3;
const EXPERIENCE_STORAGE_KEYS = [
  AUTH_STORAGE_KEY,
  USAGE_STORAGE_KEY,
  CHAT_HISTORY_STORAGE_KEY,
  PLAN_STORAGE_KEY,
  BAZI_STORAGE_KEY,
  BAZI_USERS_STORAGE_KEY,
  SELECTED_BAZI_USER_STORAGE_KEY,
  BENEFIT_GRANTS_STORAGE_KEY,
];
const FALLBACK_BACK_SCENES = {
  chat: "home",
  profile: "chat",
  users: "home",
  invite: "home",
  paywall: "profile",
  member: "paywall",
  service: "paywall",
  paid: "paywall",
  confirm: "profile",
  progress: "confirm",
  reports: "home",
  detail: "reports",
};
const HOME_QUESTION_BANKS = [
  [
    "最近做决定总犹豫，适合怎么调整？",
    "今年更适合稳守还是主动变化？",
    "最近总觉得心里不踏实，应该怎么调整？",
  ],
  [
    "最近工作有变化，我该把握还是观望？",
    "一段关系反复拉扯，我该怎么判断？",
    "接下来三个月，我最需要注意什么？",
  ],
  [
    "我最近应该把精力放在哪件事上？",
    "遇到重要选择时，我最容易忽略什么？",
    "最近状态起伏大，怎样让自己稳定下来？",
  ],
];
const FOLLOWUP_BANKS = [
  {
    heading: "先把判断依据问清",
    lead: "从条件、情绪和风险三个方向继续，不重复刚才的结论。",
    items: [
      ["这件事现在最需要先确认什么？", "找到影响决定的核心条件"],
      ["我该怎样判断自己不是在冲动？", "分清情绪和真实需求"],
      ["下一步怎样做风险更小？", "把行动拆成可回退的小步骤"],
    ],
  },
  {
    heading: "再确认边界和信号",
    lead: "这一轮适合判断继续、调整或暂停的条件。",
    items: [
      ["什么迹象说明我应该继续？", "识别值得推进的正向信号"],
      ["如果事情偏离预期，我该怎么调整？", "提前准备调整和止损方式"],
      ["我需要提前和谁说清楚？", "减少后续沟通中的误解"],
    ],
  },
  {
    heading: "换个角度看这件事",
    lead: "从关系、取舍和长期影响三个方向重新判断。",
    items: [
      ["这件事会影响我和谁的关系？", "提前看见关系中的连锁反应"],
      ["我真正需要放下的是什么？", "分清必要坚持和无效消耗"],
      ["半年后回看，我会更在意什么？", "用长期视角校准当前选择"],
    ],
  },
  {
    heading: "把答案落到未来七天",
    lead: "把判断变成看得见、做得到的近期行动。",
    items: [
      ["这周最值得完成的一件事是什么？", "先抓住回报最高的动作"],
      ["我应该先停止哪种消耗？", "为重要事情腾出精力"],
      ["七天后用什么结果判断方向对不对？", "为行动设置清晰的验证点"],
    ],
  },
];
const REPORT_KEYWORDS = [
  "工作", "事业", "职场", "跳槽", "创业", "财富", "财运", "投资",
  "感情", "婚姻", "关系", "家庭", "沟通", "选择", "决定", "犹豫",
  "变化", "时机", "机会", "健康", "情绪", "焦虑", "行动", "方向",
  "风险", "学习", "考试", "合作", "人际", "子女", "父母",
];
const PROVINCE_CITIES = {
  "北京市": ["北京市"],
  "天津市": ["天津市"],
  "上海市": ["上海市"],
  "重庆市": ["重庆市"],
  "河北省": ["石家庄市", "唐山市", "秦皇岛市", "保定市"],
  "山西省": ["太原市", "大同市", "运城市"],
  "内蒙古自治区": ["呼和浩特市", "包头市", "鄂尔多斯市"],
  "辽宁省": ["沈阳市", "大连市", "鞍山市"],
  "吉林省": ["长春市", "吉林市", "延边州"],
  "黑龙江省": ["哈尔滨市", "齐齐哈尔市", "牡丹江市"],
  "广东省": ["广州市", "深圳市", "佛山市", "东莞市"],
  "浙江省": ["杭州市", "宁波市", "温州市"],
  "江苏省": ["南京市", "苏州市", "无锡市"],
  "安徽省": ["合肥市", "芜湖市", "黄山市"],
  "山东省": ["济南市", "青岛市", "烟台市"],
  "四川省": ["成都市", "绵阳市", "乐山市"],
  "河南省": ["郑州市", "洛阳市", "开封市"],
  "福建省": ["福州市", "厦门市", "泉州市"],
  "江西省": ["南昌市", "赣州市", "上饶市"],
  "湖北省": ["武汉市", "宜昌市", "襄阳市"],
  "湖南省": ["长沙市", "株洲市", "衡阳市"],
  "广西壮族自治区": ["南宁市", "桂林市", "柳州市"],
  "海南省": ["海口市", "三亚市", "儋州市"],
  "贵州省": ["贵阳市", "遵义市", "黔东南州"],
  "云南省": ["昆明市", "大理州", "丽江市"],
  "西藏自治区": ["拉萨市", "日喀则市", "林芝市"],
  "陕西省": ["西安市", "咸阳市", "宝鸡市"],
  "甘肃省": ["兰州市", "天水市", "酒泉市"],
  "青海省": ["西宁市", "海东市", "海西州"],
  "宁夏回族自治区": ["银川市", "石嘴山市", "中卫市"],
  "新疆维吾尔自治区": ["乌鲁木齐市", "喀什地区", "伊犁州"],
  "香港特别行政区": ["香港"],
  "澳门特别行政区": ["澳门"],
  "台湾省": ["台北市", "高雄市", "台中市"],
  "其他": ["其他"],
};

function resetExperienceIfRequested() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("reset") !== "1") return;
  EXPERIENCE_STORAGE_KEYS.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // A restricted WebView may not expose persistent storage.
    }
  });
  url.searchParams.delete("reset");
  url.searchParams.set("scene", "home");
  window.history.replaceState({}, "", url);
}

resetExperienceIfRequested();

function applyBenefitGrantIfRequested() {
  const url = new URL(window.location.href);
  const grantToken = url.searchParams.get("grant");
  if (grantToken !== REPORT_10_GRANT_TOKEN) return;

  try {
    const appliedGrants = JSON.parse(
      window.localStorage.getItem(BENEFIT_GRANTS_STORAGE_KEY) || "[]",
    );
    const normalizedGrants = Array.isArray(appliedGrants) ? appliedGrants : [];
    if (!normalizedGrants.includes(grantToken)) {
      const storedPlan = JSON.parse(window.localStorage.getItem(PLAN_STORAGE_KEY) || "null");
      const currentReports = Number.isInteger(storedPlan?.reportCredits)
        ? storedPlan.reportCredits
        : 0;
      window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({
        expiresAt: Number(storedPlan?.expiresAt) || 0,
        reportCredits: currentReports + 10,
      }));
      window.localStorage.setItem(
        BENEFIT_GRANTS_STORAGE_KEY,
        JSON.stringify([...normalizedGrants, grantToken]),
      );
    }
  } catch {
    // The test grant requires persistent storage and is ignored in restricted WebViews.
  }

  url.searchParams.delete("grant");
  url.searchParams.set("scene", "reports");
  window.history.replaceState({}, "", url);
}

applyBenefitGrantIfRequested();

function readStoredLogin() {
  try {
    return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberLogin() {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
  } catch {
    // Some App WebViews disable storage; the current session can still continue.
  }
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readDailyUsage() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(USAGE_STORAGE_KEY) || "null");
    if (stored?.date === todayKey() && Number.isInteger(stored.used)) {
      return Math.min(Math.max(stored.used, 0), DAILY_QUESTION_LIMIT);
    }
  } catch {
    // Invalid or unavailable storage starts a fresh in-memory daily allowance.
  }
  return 0;
}

function rememberDailyUsage() {
  try {
    window.localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({
      date: todayKey(),
      used: questionsUsedToday,
    }));
  } catch {
    // The current session still keeps the correct remaining count.
  }
}

function readChatHistory() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((item) => (
      typeof item?.question === "string" && typeof item?.answer === "string"
    )).slice(-12);
  } catch {
    return [];
  }
}

function rememberChatHistory() {
  try {
    window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistory.slice(-12)));
  } catch {
    // Chat remains available for the current session when storage is unavailable.
  }
}

function isValidBaziProfile(stored) {
  const requiredKeys = [
    "gender", "genderValue", "calendar", "year", "month", "day", "hour",
    "province", "city", "birthday", "birthTime", "birthPlace",
  ];
  const hasRequiredValues = stored && requiredKeys.every((key) => (
    typeof stored[key] === "string" && stored[key].trim()
  ));
  const hasValidMinute = stored?.hour === "unknown" || (
    typeof stored?.minute === "string" && stored.minute.trim()
  );
  return Boolean(hasRequiredValues && hasValidMinute);
}

function normalizeBaziUser(profile, index = 0) {
  return {
    ...profile,
    id: String(profile.id || (index === 0 ? "bazi-self" : `bazi-user-${index + 1}`)),
    name: String(profile.name || (index === 0 ? "自己" : `用户${index + 1}`)),
    relation: String(profile.relation || (index === 0 ? "本人" : "其他")),
  };
}

function readBaziUsers() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(BAZI_USERS_STORAGE_KEY) || "[]");
    if (Array.isArray(stored)) {
      const users = stored.filter(isValidBaziProfile).map(normalizeBaziUser);
      if (users.length) return users;
    }

    const legacy = JSON.parse(window.localStorage.getItem(BAZI_STORAGE_KEY) || "null");
    if (isValidBaziProfile(legacy)) return [normalizeBaziUser(legacy, 0)];
  } catch {
    // Missing or invalid information will be collected before the next question.
  }
  return [];
}

function readSelectedBaziUserId(users) {
  try {
    const storedId = window.localStorage.getItem(SELECTED_BAZI_USER_STORAGE_KEY) || "";
    if (users.some((user) => user.id === storedId)) return storedId;
  } catch {
    // Selection falls back to the first available user.
  }
  return users[0]?.id || "";
}

function getSelectedBaziProfile() {
  return baziUsers.find((user) => user.id === selectedBaziUserId) || null;
}

function rememberBaziUsers() {
  try {
    window.localStorage.setItem(BAZI_USERS_STORAGE_KEY, JSON.stringify(baziUsers));
    window.localStorage.setItem(SELECTED_BAZI_USER_STORAGE_KEY, selectedBaziUserId);
    if (baziProfile) window.localStorage.setItem(BAZI_STORAGE_KEY, JSON.stringify(baziProfile));
    else window.localStorage.removeItem(BAZI_STORAGE_KEY);
  } catch {
    // The current session still retains the selected information.
  }
}

function readActivePlan() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PLAN_STORAGE_KEY) || "null");
    const expiresAt = Number(stored?.expiresAt) || 0;
    const reportCredits = Number.isInteger(stored?.reportCredits) ? stored.reportCredits : 0;
    if (expiresAt > Date.now() || reportCredits > 0) {
      return {
        expiresAt,
        reportCredits,
      };
    }
  } catch {
    // Invalid or unavailable storage falls back to the free daily allowance.
  }
  return null;
}

function rememberActivePlan() {
  try {
    window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(activePlan));
  } catch {
    // The activated rights remain available for the current session.
  }
}

function activateSelectedPackage() {
  const previousExpiry = Number(activePlan?.expiresAt) || 0;
  const currentExpiry = previousExpiry > Date.now() ? previousExpiry : Date.now();
  const currentReports = Number(activePlan?.reportCredits) || 0;
  activePlan = {
    expiresAt: selectedPackage.days > 0
      ? currentExpiry + (selectedPackage.days * 24 * 60 * 60 * 1000)
      : previousExpiry,
    reportCredits: currentReports + selectedPackage.reports,
  };
  rememberActivePlan();
}

function consumeReportCredit() {
  if (!activePlan || activePlan.reportCredits < 1) return false;
  activePlan = {
    ...activePlan,
    reportCredits: activePlan.reportCredits - 1,
  };
  rememberActivePlan();
  return true;
}

let isLoggedIn = readStoredLogin();
let pendingAuthScene = "";
let pendingQuestion = "";
let pendingBaziAction = "";
let pendingAfterLoginAction = "";
let questionsUsedToday = readDailyUsage();
let sessionStarted = false;
let chatHistory = readChatHistory();
let activePlan = readActivePlan();
let baziUsers = readBaziUsers();
let selectedBaziUserId = readSelectedBaziUserId(baziUsers);
let baziProfile = getSelectedBaziProfile();
let currentScene = "";
const sceneHistory = [];
let homeQuestionBankIndex = 0;
let followupBatchOffset = 0;
let editingBaziUserId = "";
let pendingDeleteBaziUserId = "";
let inviteIdentityConfirmed = false;
let baziFormReturnScene = "";
let pendingFeedbackQuestion = "";
let selectedPackage = {
  name: "新人体验包",
  price: "9.9",
  original: "19.9",
  days: 7,
  reports: 1,
};

function renderAuthState() {
  document.documentElement.dataset.loggedIn = isLoggedIn ? "true" : "false";

  document.querySelectorAll("[data-profile-avatar]").forEach((node) => {
    node.textContent = isLoggedIn ? "王" : "游";
  });
  document.querySelectorAll("[data-profile-name]").forEach((node) => {
    node.textContent = isLoggedIn ? "王女士" : "未登录用户";
  });
  document.querySelectorAll("[data-profile-copy]").forEach((node) => {
    node.textContent = isLoggedIn ? "已保存昵称、问答记录和报告" : "登录后保存昵称、问答记录和报告";
  });
  document.querySelectorAll("[data-profile-action]").forEach((node) => {
    node.textContent = isLoggedIn ? "已登录" : "登录";
  });
  document.querySelectorAll("[data-report-list-copy]").forEach((node) => {
    node.textContent = isLoggedIn
      ? "查看已生成、生成中和失败返还的报告。"
      : "登录后可查看已生成、生成中和失败返还的报告。";
  });
  document.querySelectorAll("[data-guest-only]").forEach((node) => {
    node.hidden = isLoggedIn;
  });
  document.querySelectorAll("[data-report-row]").forEach((node) => {
    node.classList.toggle("locked", !isLoggedIn);
  });
  document.querySelectorAll("[data-report-copy]").forEach((node) => {
    node.textContent = isLoggedIn ? node.dataset.reportCopy : node.dataset.reportGuestCopy;
  });
  document.querySelectorAll("[data-report-action]").forEach((node) => {
    node.textContent = isLoggedIn ? "查看" : "登录";
  });
}

function renderHomeQuestions() {
  const bank = HOME_QUESTION_BANKS[homeQuestionBankIndex];
  document.querySelectorAll("[data-home-question-list] .question-chip").forEach((button, index) => {
    const question = bank[index];
    if (!question) return;
    button.dataset.question = question;
    button.textContent = question;
  });
}

function hasBaziProfile() {
  return Boolean(baziProfile);
}

function selectedChatHistory() {
  return chatHistory.filter((item) => (
    item.baziUserId
      ? item.baziUserId === selectedBaziUserId
      : selectedBaziUserId === baziUsers[0]?.id
  ));
}

function reportKeywordsForCurrentUser() {
  const questions = selectedChatHistory().map((item) => item.question);
  const scored = REPORT_KEYWORDS.map((keyword, order) => ({
    keyword,
    order,
    count: questions.reduce((total, question) => (
      total + (String(question).split(keyword).length - 1)
    ), 0),
  }));
  return scored
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count || a.order - b.order)
    .slice(0, 3)
    .map(({ keyword }) => keyword);
}

function renderReportDirection() {
  const history = selectedChatHistory();
  const keywords = reportKeywordsForCurrentUser();
  const reportFocus = keywords.length
    ? keywords.join(" · ")
    : "整体命理 · 近期状态 · 行动建议";
  const reportCopy = history.length
    ? (keywords.length
      ? `将围绕“${keywords.join("、")}”等近期问题，结合八字系统整理。`
      : "将结合近期问答与八字，提炼状态、原因和行动建议。")
    : "结合八字与问答内容系统整理，报告额度独立计算。";
  const progressCopy = keywords.length
    ? `正在围绕“${keywords.join("、")}”梳理八字与历史问答。`
    : "正在结合八字与历史问题梳理解读重点。";

  document.querySelectorAll("[data-report-direction]").forEach((node) => {
    node.textContent = reportCopy;
  });
  document.querySelectorAll("[data-confirm-report-direction]").forEach((node) => {
    node.textContent = reportFocus;
  });
  document.querySelectorAll("[data-progress-report-direction]").forEach((node) => {
    node.textContent = progressCopy;
  });
}

function activeUserInitial() {
  return Array.from(baziProfile?.name?.trim() || "")[0] || "八";
}

function renderActiveBaziUser() {
  document.querySelectorAll("[data-active-user-name]").forEach((node) => {
    node.textContent = baziProfile?.name || "输入八字更了解TA";
  });
  document.querySelectorAll("[data-active-user-avatar]").forEach((node) => {
    node.textContent = activeUserInitial();
  });
  document.querySelectorAll("[data-avatar-active-name]").forEach((node) => {
    node.textContent = baziProfile?.name || "请先添加八字用户";
  });
  document.querySelectorAll("[data-user-switcher-action]").forEach((node) => {
    node.textContent = baziProfile ? "切换" : "添加";
  });
  document.querySelectorAll("[data-confirm-user]").forEach((node) => {
    node.textContent = baziProfile ? `${baziProfile.name} · ${baziProfile.relation}` : "尚未选择";
  });
}

function createAvatarUserOption(user) {
  const button = document.createElement("button");
  const selected = user.id === selectedBaziUserId;
  button.type = "button";
  button.className = "avatar-user-option";
  button.dataset.selectUser = user.id;
  button.dataset.userSelected = selected ? "true" : "false";
  button.setAttribute("aria-pressed", selected ? "true" : "false");
  button.setAttribute("aria-label", `${selected ? "当前" : "选择"}${user.name}用于解读`);

  const avatar = document.createElement("span");
  avatar.className = "avatar-user-circle";
  avatar.textContent = user.name.slice(0, 1);
  if (selected) {
    const check = document.createElement("b");
    check.textContent = "✓";
    avatar.append(check);
  }
  const name = document.createElement("small");
  name.textContent = user.name;
  button.append(avatar, name);
  return button;
}

function createUserSummary(user, compact = false) {
  const wrapper = document.createElement(compact ? "button" : "article");
  wrapper.className = compact ? "user-picker-option" : "bazi-user-card";
  if (compact) {
    wrapper.type = "button";
    wrapper.dataset.selectUser = user.id;
  }
  wrapper.dataset.userSelected = user.id === selectedBaziUserId ? "true" : "false";

  const avatar = document.createElement("span");
  avatar.className = "bazi-user-avatar";
  avatar.textContent = user.name.slice(0, 1);

  const copy = document.createElement("span");
  copy.className = "bazi-user-card-copy";
  const title = document.createElement("strong");
  title.textContent = user.name;
  const relation = document.createElement("small");
  relation.textContent = `${user.relation} · ${user.gender} · ${user.birthday}`;
  const place = document.createElement("em");
  place.textContent = `${user.birthTime} · ${user.birthPlace}`;
  copy.append(title, relation, place);

  const selected = document.createElement(compact ? "b" : "button");
  if (!compact) {
    selected.type = "button";
    selected.className = "bazi-user-card-status";
    selected.dataset.selectUser = user.id;
    selected.setAttribute("aria-label", `选择${user.name}用于问答`);
  }
  selected.textContent = user.id === selectedBaziUserId ? "当前" : "选择";
  wrapper.append(avatar, copy, selected);

  if (!compact) {
    const actions = document.createElement("div");
    actions.className = "bazi-user-card-actions";
    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.dataset.selectUser = user.id;
    selectButton.textContent = user.id === selectedBaziUserId ? "正在使用" : "用于问答";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.dataset.editUser = user.id;
    editButton.textContent = "编辑";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.deleteUser = user.id;
    deleteButton.textContent = "删除";
    actions.append(selectButton, editButton, deleteButton);
    wrapper.append(actions);
  }
  return wrapper;
}

function renderBaziUserLists() {
  const list = document.querySelector("[data-bazi-user-list]");
  const inlineLists = document.querySelectorAll("[data-inline-user-list]");
  const avatarLists = document.querySelectorAll("[data-avatar-user-list]");
  if (list) list.replaceChildren();
  inlineLists.forEach((inlineList) => inlineList.replaceChildren());
  avatarLists.forEach((avatarList) => avatarList.replaceChildren());

  if (!baziUsers.length) {
    const empty = document.createElement("div");
    empty.className = "bazi-user-empty";
    const title = document.createElement("strong");
    title.textContent = "还没有八字用户";
    const copy = document.createElement("span");
    copy.textContent = "先新增自己或家人的八字，之后问答时即可选择。";
    empty.append(title, copy);
    list?.append(empty);

    inlineLists.forEach((inlineList) => inlineList.append(empty.cloneNode(true)));
    avatarLists.forEach((avatarList) => {
      const avatarEmpty = document.createElement("span");
      avatarEmpty.className = "avatar-user-empty";
      avatarEmpty.textContent = "暂无用户，点击右侧添加";
      avatarList.append(avatarEmpty);
    });
    return;
  }

  baziUsers.forEach((user) => {
    list?.append(createUserSummary(user));
    inlineLists.forEach((inlineList) => inlineList.append(createUserSummary(user, true)));
    avatarLists.forEach((avatarList) => avatarList.append(createAvatarUserOption(user)));
  });
}

function closeAllInlineUserPickers() {
  document.querySelectorAll("[data-inline-user-picker]").forEach((shell) => {
    shell.classList.remove("expanded");
    const panel = shell.querySelector("[data-inline-user-panel]");
    const trigger = shell.querySelector("[data-open-user-picker]");
    if (panel) panel.hidden = true;
    trigger?.setAttribute("aria-expanded", "false");
  });
}

function toggleInlineUserPicker(trigger) {
  if (!isLoggedIn) {
    pendingAuthScene = currentScene || "home";
    pendingAfterLoginAction = "user-picker";
    openLoginModal();
    return;
  }
  const triggerElement = trigger && typeof trigger.closest === "function" ? trigger : null;
  const shell = triggerElement?.closest("[data-inline-user-picker]")
    || document.querySelector(`#${sceneToScreen[currentScene]} [data-inline-user-picker]`);
  if (!shell) return;
  const panel = shell.querySelector("[data-inline-user-panel]");
  const willOpen = Boolean(panel?.hidden);
  closeAllInlineUserPickers();
  if (!willOpen || !panel) return;
  renderBaziUserLists();
  panel.hidden = false;
  shell.classList.add("expanded");
  shell.querySelector("[data-open-user-picker]")?.setAttribute("aria-expanded", "true");
}

function selectBaziUser(userId, { close = true } = {}) {
  const selected = baziUsers.find((user) => user.id === userId);
  if (!selected) return;
  selectedBaziUserId = selected.id;
  baziProfile = selected;
  rememberBaziUsers();
  renderSavedBaziProfile();
  renderBaziUserLists();
  renderChatHistory();
  sessionStarted = selectedChatHistory().length > 0;
  renderChatIntro(sessionStarted);
  updateFollowups();
  if (close) {
    closeAllInlineUserPickers();
    closeModal();
  }
}

function renderSavedBaziProfile() {
  renderActiveBaziUser();
  renderReportDirection();
  document.querySelectorAll("[data-profile-bazi-summary]").forEach((node) => {
    node.hidden = !baziProfile;
  });
  document.querySelectorAll("[data-profile-bazi-empty]").forEach((node) => {
    node.hidden = Boolean(baziProfile);
  });
  document.querySelectorAll("[data-edit-bazi]").forEach((button) => {
    button.hidden = !baziProfile;
  });
  if (!baziProfile) return;

  document.querySelectorAll("[data-profile-bazi]").forEach((node) => {
    const value = baziProfile[node.dataset.profileBazi] || "-";
    if (node.matches("input")) node.value = value;
    else node.textContent = value;
  });
  document.querySelectorAll("[data-confirm-bazi]").forEach((node) => {
    node.textContent = `${baziProfile.birthday} · ${baziProfile.birthTime} · ${baziProfile.birthPlace}`;
  });
}

function replaceSelectOptions(select, options, placeholder) {
  if (!select) return;
  select.replaceChildren();
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.append(placeholderOption);
  options.forEach(({ value, label }) => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = label;
    select.append(option);
  });
}

function getBaziSelect(name) {
  return document.querySelector(`[data-bazi-select="${name}"]`);
}

function getBaziChoice(group) {
  return document.querySelector(`[data-bazi-choice="${group}"].selected`)?.dataset.value || "";
}

function setBaziChoice(group, value) {
  const control = document.querySelector(`[data-bazi-group="${group}"]`);
  control?.classList.remove("invalid");
  document.querySelectorAll(`[data-bazi-choice="${group}"]`).forEach((button) => {
    const selected = button.dataset.value === value;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function updateBaziCityOptions(preferredValue = "") {
  const citySelect = getBaziSelect("city");
  const previousValue = preferredValue || citySelect?.value || "";
  const province = getBaziSelect("province")?.value || "";
  const options = (PROVINCE_CITIES[province] || []).map((city) => ({ value: city, label: city }));
  replaceSelectOptions(citySelect, options, "城市");
  if (options.some(({ value }) => value === previousValue)) citySelect.value = previousValue;
}

function renderBaziDateTimeDisplay() {
  const dateTimeInput = document.querySelector("[data-bazi-datetime]");
  const display = document.querySelector("[data-bazi-datetime-display]");
  const unknown = Boolean(document.querySelector("[data-bazi-time-unknown]")?.checked);
  if (!dateTimeInput || !display) return;

  const [dateValue = "", timeValue = ""] = dateTimeInput.value.split("T");
  if (!dateValue) {
    display.textContent = "请选择出生日期与时间";
    display.closest(".bazi-datetime-main")?.classList.remove("has-value");
    return;
  }

  const [year, month, day] = dateValue.split("-");
  const dateCopy = `${year}年${Number(month)}月${Number(day)}日`;
  display.textContent = unknown
    ? `${dateCopy} · 时辰不确定`
    : `${dateCopy} ${timeValue.slice(0, 5)}`;
  display.closest(".bazi-datetime-main")?.classList.add("has-value");
}

function updateBaziDateTimeState(preferredDate = "", preferredTime = "") {
  const dateTimeInput = document.querySelector("[data-bazi-datetime]");
  const unknown = Boolean(document.querySelector("[data-bazi-time-unknown]")?.checked);
  if (!dateTimeInput) return;

  const [currentDate = "", currentTime = ""] = dateTimeInput.value.split("T");
  const dateValue = preferredDate || currentDate || dateTimeInput.dataset.dateValue || "";
  const timeValue = preferredTime
    || currentTime.slice(0, 5)
    || dateTimeInput.dataset.timeValue
    || "12:00";
  const today = new Date();
  const maxDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  dateTimeInput.dataset.dateValue = dateValue;
  dateTimeInput.dataset.timeValue = timeValue;
  dateTimeInput.type = unknown ? "date" : "datetime-local";
  dateTimeInput.min = unknown ? "1940-01-01" : "1940-01-01T00:00";
  dateTimeInput.max = unknown ? maxDate : `${maxDate}T23:59`;
  dateTimeInput.value = unknown
    ? dateValue
    : (dateValue ? `${dateValue}T${timeValue}` : "");
  dateTimeInput.classList.remove("invalid");
  renderBaziDateTimeDisplay();
}

function initializeBaziSelectors() {
  replaceSelectOptions(
    getBaziSelect("province"),
    Object.keys(PROVINCE_CITIES).map((province) => ({ value: province, label: province })),
    "省份",
  );
  updateBaziCityOptions();
  updateBaziDateTimeState();
}

function prepareBaziForm() {
  const error = document.querySelector("[data-bazi-error]");
  if (error) error.hidden = true;
  document.querySelectorAll("#modal-bazi .invalid").forEach((element) => {
    element.classList.remove("invalid");
  });
  const profile = editingBaziUserId
    ? (baziUsers.find((user) => user.id === editingBaziUserId) || {})
    : {};
  const nameInput = document.querySelector("[data-bazi-name]");
  const relationSelect = document.querySelector("[data-bazi-relation]");
  if (nameInput) nameInput.value = profile.name || "";
  if (relationSelect) {
    relationSelect.value = profile.relation || (baziUsers.length === 0 ? "本人" : "家人");
  }
  setBaziChoice("gender", profile.genderValue || "");
  setBaziChoice("calendar", profile.calendar || "solar");

  const dateTimeInput = document.querySelector("[data-bazi-datetime]");
  const unknownTime = document.querySelector("[data-bazi-time-unknown]");
  if (unknownTime) unknownTime.checked = profile.hour === "unknown";
  const dateValue = profile.year && profile.month && profile.day
    ? `${profile.year}-${String(profile.month).padStart(2, "0")}-${String(profile.day).padStart(2, "0")}`
    : "";
  const timeValue = profile.hour && profile.hour !== "unknown"
    ? `${String(profile.hour).padStart(2, "0")}:${String(profile.minute || "0").padStart(2, "0")}`
    : "12:00";
  if (dateTimeInput) {
    dateTimeInput.value = "";
    dateTimeInput.dataset.dateValue = "";
    dateTimeInput.dataset.timeValue = "";
  }
  updateBaziDateTimeState(dateValue, timeValue);
  getBaziSelect("province").value = profile.province || "";
  updateBaziCityOptions(profile.city || "");
  const trueSolarTime = document.querySelector("[data-true-solar-time]");
  if (trueSolarTime) trueSolarTime.checked = Boolean(profile.trueSolarTime);
  const authorize = document.querySelector("[data-bazi-authorize]");
  if (authorize) authorize.checked = false;
}

function configureBaziModal(action) {
  const isReport = action.startsWith("report");
  const isEdit = action === "edit" || action === "report-edit";
  const isShared = action === "shared";
  const eyebrow = document.querySelector("[data-bazi-eyebrow]");
  const title = document.querySelector("[data-bazi-title]");
  const copy = document.querySelector("[data-bazi-copy]");
  const saveButton = document.querySelector("[data-bazi-save]");
  const authorization = document.querySelector("[data-bazi-authorization]");
  if (eyebrow) {
    eyebrow.textContent = isShared
      ? "好友邀请填写"
      : isEdit
        ? "修改八字用户"
        : isReport
          ? "生成报告前"
          : action === "create"
            ? "新增八字用户"
            : "开始问答前";
  }
  if (title) title.textContent = isEdit ? "编辑八字信息" : "填写八字信息";
  if (copy) {
    copy.textContent = isShared
      ? "请填写你的出生信息。确认授权后，邀请人可在国心解读中为你发起问答或生成报告。"
      : isEdit
        ? "修改后，新的问答与报告将使用更新后的八字信息。"
        : isReport
      ? "问答中已保存的八字会直接复用。当前没有完整资料，请先选择出生信息。"
      : "填写称呼、关系和出生信息，保存后即可在问答时选择这位用户。";
  }
  if (saveButton) {
    saveButton.textContent = isShared
      ? "确认授权并提交"
      : isReport
          ? "保存并继续生成报告"
          : isEdit
            ? "保存修改"
            : action === "create"
              ? "保存八字用户"
              : "保存并开始问答";
  }
  if (authorization) authorization.hidden = !isShared;
}

function requestBaziProfile(question, action = "question", userId = "") {
  pendingAuthScene = action === "question" ? "chat" : "";
  pendingQuestion = question;
  pendingBaziAction = action;
  editingBaziUserId = userId;
  if (["create", "edit"].includes(action)) baziFormReturnScene = currentScene;
  configureBaziModal(action);
  prepareBaziForm();
  closeAllInlineUserPickers();
  openModal("bazi");
}

function startReportFlow() {
  if (!isLoggedIn) {
    pendingAfterLoginAction = "report";
    openLoginModal();
    return;
  }
  if (!hasBaziProfile()) {
    requestBaziProfile("", "report");
    return;
  }
  renderSavedBaziProfile();
  setScene((activePlan?.reportCredits || 0) > 0 ? "confirm" : "paywall");
}

function editBaziForReport() {
  if (!isLoggedIn) {
    pendingAfterLoginAction = "report";
    openLoginModal();
    return;
  }
  requestBaziProfile("", "report-edit", selectedBaziUserId);
}

function generateReport() {
  if (!hasBaziProfile()) {
    requestBaziProfile("", "report");
    return;
  }
  if (!consumeReportCredit()) {
    setScene("paywall");
    return;
  }
  renderQuestionUsage();
  setScene("progress");
}

function saveBaziFromModal() {
  const dateTimeInput = document.querySelector("[data-bazi-datetime]");
  const timeUnknown = Boolean(document.querySelector("[data-bazi-time-unknown]")?.checked);
  const [selectedDate = "", selectedTime = ""] = (dateTimeInput?.value || "").split("T");
  const [selectedYear = "", selectedMonth = "", selectedDay = ""] = selectedDate.split("-");
  const [selectedHour = "", selectedMinute = ""] = timeUnknown
    ? ["unknown", ""]
    : selectedTime.split(":");
  const profile = {
    name: document.querySelector("[data-bazi-name]")?.value.trim() || "",
    relation: document.querySelector("[data-bazi-relation]")?.value || "",
    genderValue: getBaziChoice("gender"),
    calendar: getBaziChoice("calendar"),
    year: selectedYear,
    month: selectedMonth ? String(Number(selectedMonth)) : "",
    day: selectedDay ? String(Number(selectedDay)) : "",
    hour: selectedHour,
    minute: selectedMinute,
    province: getBaziSelect("province")?.value || "",
    city: getBaziSelect("city")?.value || "",
    trueSolarTime: Boolean(document.querySelector("[data-true-solar-time]")?.checked),
  };
  let complete = true;
  [
    document.querySelector("[data-bazi-name]"),
    document.querySelector("[data-bazi-relation]"),
  ].forEach((field) => {
    const invalid = !field?.value;
    field?.classList.toggle("invalid", invalid);
    if (invalid) complete = false;
  });
  ["gender", "calendar"].forEach((group) => {
    const control = document.querySelector(`[data-bazi-group="${group}"]`);
    const value = group === "gender" ? profile.genderValue : profile[group];
    const invalid = !value;
    control?.classList.toggle("invalid", invalid);
    if (invalid) complete = false;
  });
  ["province", "city"].forEach((name) => {
    const select = getBaziSelect(name);
    const invalid = !profile[name];
    select?.classList.toggle("invalid", invalid);
    if (invalid) complete = false;
  });
  const invalidDateTime = !profile.year
    || !profile.month
    || !profile.day
    || (!timeUnknown && (!profile.hour || !profile.minute))
    || !dateTimeInput?.validity.valid;
  dateTimeInput?.classList.toggle("invalid", invalidDateTime);
  if (invalidDateTime) complete = false;
  const authorize = document.querySelector("[data-bazi-authorize]");
  if (pendingBaziAction === "shared" && !authorize?.checked) {
    authorize?.closest("[data-bazi-authorization]")?.classList.add("invalid");
    complete = false;
  } else {
    authorize?.closest("[data-bazi-authorization]")?.classList.remove("invalid");
  }

  const error = document.querySelector("[data-bazi-error]");
  if (!complete) {
    if (error) error.hidden = false;
    const firstInvalid = document.querySelector("#modal-bazi .invalid");
    (firstInvalid?.matches(".segmented-control")
      ? firstInvalid.querySelector("button")
      : firstInvalid)?.focus();
    return;
  }

  if (error) error.hidden = true;
  const calendarLabel = profile.calendar === "lunar" ? "农历" : "公历";
  const genderLabel = profile.genderValue === "male" ? "男" : "女";
  profile.gender = genderLabel;
  profile.birthday = `${calendarLabel} ${profile.year} 年 ${profile.month} 月 ${profile.day} 日`;
  profile.birthTime = profile.hour === "unknown"
    ? "时辰不确定"
    : `${String(profile.hour).padStart(2, "0")}:${String(profile.minute).padStart(2, "0")}${profile.trueSolarTime ? "（真太阳时）" : ""}`;
  profile.birthPlace = `${profile.province} ${profile.city}`;
  profile.id = editingBaziUserId || `bazi-${Date.now()}`;
  const existingIndex = baziUsers.findIndex((user) => user.id === profile.id);
  if (existingIndex >= 0) baziUsers.splice(existingIndex, 1, profile);
  else baziUsers.push(profile);
  selectedBaziUserId = profile.id;
  baziProfile = profile;
  rememberBaziUsers();
  renderSavedBaziProfile();
  renderBaziUserLists();
  const question = pendingQuestion;
  const nextAction = pendingBaziAction;
  pendingQuestion = "";
  pendingAuthScene = "";
  pendingBaziAction = "";
  editingBaziUserId = "";
  closeModal();

  if (nextAction === "shared") {
    window.requestAnimationFrame(() => openModal("share-success"));
  } else if (nextAction === "report" || nextAction === "report-edit") {
    window.requestAnimationFrame(startReportFlow);
  } else if (nextAction === "edit" || nextAction === "create") {
    const returnScene = ["home", "chat", "users"].includes(baziFormReturnScene)
      ? baziFormReturnScene
      : "users";
    baziFormReturnScene = "";
    window.requestAnimationFrame(() => setScene(returnScene));
  } else if (question) {
    window.requestAnimationFrame(() => appendQuestion(question));
  } else {
    focusChatComposer();
  }
}

function updatePromoCountdown() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const remaining = Math.max(end.getTime() - now.getTime(), 0);
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const values = {
    "[data-countdown-hours]": hours,
    "[data-countdown-minutes]": minutes,
    "[data-countdown-seconds]": seconds,
  };
  Object.entries(values).forEach(([selector, value]) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = String(value).padStart(2, "0");
  });
}

function startPromoCountdown() {
  updatePromoCountdown();
  window.setInterval(updatePromoCountdown, 1000);
}

function selectPackage(button) {
  if (button.dataset.packageName) {
    selectedPackage = {
      name: button.dataset.packageName,
      price: button.dataset.packagePrice,
      original: button.dataset.packageOriginal || "",
      days: Number(button.dataset.packageDays),
      reports: Number(button.dataset.packageReports),
    };
  }

  const name = document.querySelector("[data-payment-name]");
  const copy = document.querySelector("[data-payment-copy]");
  const price = document.querySelector("[data-payment-price]");
  const original = document.querySelector("[data-payment-original]");
  const paidSummary = document.querySelector("[data-paid-summary]");
  const paidCopy = document.querySelector("[data-paid-copy]");
  const paymentButton = document.querySelector("[data-payment-button]");
  const servicePackage = document.querySelector("[data-service-package]");
  const reportOnly = selectedPackage.days === 0 && selectedPackage.reports > 0;
  const serviceCopy = reportOnly
    ? `客服将协助确认 ${selectedPackage.reports} 次报告额度的购买与开通。`
    : `客服将协助确认 ${selectedPackage.days} 天问答权益和 ${selectedPackage.reports} 次报告额度。`;
  if (name) name.textContent = `联系客服购买${selectedPackage.name}`;
  if (copy) copy.textContent = serviceCopy;
  if (price) price.textContent = `¥${selectedPackage.price}`;
  if (original) {
    original.hidden = !selectedPackage.original;
    original.textContent = selectedPackage.original ? `¥${selectedPackage.original}` : "";
  }
  if (paidSummary) {
    paidSummary.textContent = reportOnly
      ? `${selectedPackage.name} · ${selectedPackage.reports} 次完整报告额度`
      : `${selectedPackage.name} · ${selectedPackage.days} 天问答不限次 + ${selectedPackage.reports} 次深度报告`;
  }
  if (paidCopy) {
    paidCopy.textContent = reportOnly
      ? "报告额度已到账。生成报告会优先复用问答时保存的八字，普通问答次数不受影响。"
      : "问答权益和报告额度均已开通。普通问答不会扣报告额度，只有确认生成报告时才扣除。";
  }
  if (paymentButton) paymentButton.textContent = `前往客服咨询 ¥${selectedPackage.price}`;
  if (servicePackage) servicePackage.textContent = `${selectedPackage.name} · ¥${selectedPackage.price}`;
}

function updateShareLink() {
  const input = document.querySelector("[data-share-link]");
  if (!input) return;
  const base = window.location.origin.startsWith("http")
    ? `${window.location.origin}${window.location.pathname}`
    : "http://10.247.29.5:4173/index.html";
  input.value = `${base}?scene=invite&from=guoxin`;
}

function openLoginModal(context = "chat") {
  const inviteContext = context === "invite";
  const title = document.querySelector("[data-login-title]");
  const copy = document.querySelector("[data-login-copy]");
  const submit = document.querySelector("[data-login-submit]");
  if (title) {
    title.textContent = inviteContext
      ? "登录后填写八字"
      : "还差一步即可和 AI 对话聊天";
  }
  if (copy) {
    copy.textContent = inviteContext
      ? "请先登录确认身份，再填写出生信息并授权给邀请人使用。"
      : "登录后保存八字用户、问答记录和报告，每天可免费问 3 次，第二天自动恢复。";
  }
  if (submit) submit.textContent = inviteContext ? "登录并填写" : "登录并继续";
  openModal("login");
}

function openUserPicker(trigger) {
  toggleInlineUserPicker(trigger);
}

function createBaziUser(action = "create") {
  if (!isLoggedIn) {
    pendingAuthScene = action === "shared"
      ? "invite"
      : (["home", "chat"].includes(currentScene) ? currentScene : "users");
    pendingAfterLoginAction = action === "shared" ? "invite-fill" : "create-user";
    openLoginModal(action === "shared" ? "invite" : "chat");
    return;
  }
  requestBaziProfile("", action);
}

function openShareInvite() {
  if (!isLoggedIn) {
    pendingAuthScene = ["home", "chat"].includes(currentScene) ? currentScene : "users";
    pendingAfterLoginAction = "share";
    openLoginModal();
    return;
  }
  updateShareLink();
  openModal("share");
}

async function copyShareLink(button) {
  const input = document.querySelector("[data-share-link]");
  if (!input) return;
  let copied = false;
  try {
    await navigator.clipboard.writeText(input.value);
    copied = true;
  } catch {
    input.select();
    copied = document.execCommand?.("copy") || false;
  }
  button.textContent = copied ? "邀请链接已复制" : "长按链接复制";
  window.setTimeout(() => {
    button.textContent = "复制邀请链接";
  }, 1800);
}

function deleteBaziUser(userId) {
  baziUsers = baziUsers.filter((user) => user.id !== userId);
  if (selectedBaziUserId === userId) {
    selectedBaziUserId = baziUsers[0]?.id || "";
  }
  baziProfile = getSelectedBaziProfile();
  rememberBaziUsers();
  renderSavedBaziProfile();
  renderBaziUserLists();
  renderChatHistory();
  sessionStarted = selectedChatHistory().length > 0;
  updateFollowups();
}

function openModal(name) {
  const layer = document.querySelector("[data-modal-layer]");
  if (!layer) return;

  layer.hidden = false;
  document.querySelectorAll("[data-modal-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.modalPanel !== name;
  });
}

function closeModal() {
  const layer = document.querySelector("[data-modal-layer]");
  if (!layer) return;

  layer.hidden = true;
  document.querySelectorAll("[data-modal-panel]").forEach((panel) => {
    panel.hidden = true;
  });
}

function completeLogin(defaultScene) {
  isLoggedIn = true;
  rememberLogin();
  renderAuthState();

  if (selectedChatHistory().length > 0 && !sessionStarted) {
    sessionStarted = true;
    renderChatHistory();
    renderChatIntro(true);
  }

  const nextScene = pendingAuthScene || defaultScene;
  const nextQuestion = pendingQuestion;
  const nextAction = pendingAfterLoginAction;
  pendingAuthScene = "";
  pendingQuestion = "";
  pendingAfterLoginAction = "";
  if (nextScene) {
    setScene(nextScene);
  }
  if (nextQuestion) {
    window.requestAnimationFrame(() => appendQuestion(nextQuestion));
  } else if (nextAction === "report") {
    window.requestAnimationFrame(startReportFlow);
  } else if (nextAction === "user-picker") {
    window.requestAnimationFrame(() => openUserPicker());
  } else if (nextAction === "create-user") {
    window.requestAnimationFrame(() => createBaziUser("create"));
  } else if (nextAction === "share") {
    window.requestAnimationFrame(openShareInvite);
  } else if (nextAction === "invite-fill") {
    inviteIdentityConfirmed = true;
    window.requestAnimationFrame(() => createBaziUser("shared"));
  }
}

function setScene(scene, { track = true } = {}) {
  const nextScene = sceneToScreen[scene] ? scene : "home";
  const nextScreen = sceneToScreen[nextScene];

  if (track && currentScene && currentScene !== nextScene) {
    sceneHistory.push(currentScene);
    if (sceneHistory.length > 20) sceneHistory.shift();
  }
  currentScene = nextScene;

  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === nextScreen);
  });

  document.querySelectorAll(".demo-panel [data-scene]").forEach((button) => {
    button.classList.toggle("active", button.dataset.scene === nextScene);
  });

  const backButton = document.querySelector("[data-back]");
  if (backButton) backButton.hidden = nextScene === "home";

  const url = new URL(window.location.href);
  url.searchParams.set("scene", nextScene);
  window.history.replaceState({}, "", url);
}

function goBack() {
  const previousScene = sceneHistory.pop() || FALLBACK_BACK_SCENES[currentScene] || "home";
  setScene(previousScene, { track: false });
}

function answerFor(question) {
  if (/什么时候|时机|推进|信号|继续/.test(question)) {
    return "判断是否适合推进，不只看日期，更要看三个信号：关键信息已经明确、相关人的态度可以确认、最坏结果在你能承受的范围内。三个条件满足两个，再安排一个小范围动作验证。";
  }
  if (/沟通|开口|对方|关系|配合|说清楚/.test(question)) {
    return "先讲共同目标，再讲你观察到的事实，最后提出一个具体请求。一次只谈当前问题，不翻旧账，也不要替对方预设结论；如果对方暂时回避，可以约一个明确的再次沟通时间。";
  }
  if (/风险|后路|偏离|调整|暂停|边界/.test(question)) {
    return "先给这件事设三条边界：最多投入多少时间、最多承担多少成本、出现什么情况就暂停。边界提前写清楚，变化发生时就不需要在情绪里临时决定。";
  }
  if (/下一步|先做|行动|准备|怎么做/.test(question)) {
    return "把下一步缩小成一个今天可以完成、结果可验证的动作。优先确认最不确定的信息，再安排沟通或投入资源；完成后看反馈，而不是一次把整个决定做到底。";
  }
  if (/冲动|情绪|焦虑|不踏实|感受/.test(question)) {
    return "可以先把‘我现在很想做什么’和‘这件事长期需要什么’分开写。隔一晚再看，如果理由仍然成立、代价仍可接受，通常不是单纯冲动；如果理由明显变化，就先不要急着定。";
  }
  if (/决定|选择|犹豫|标准|确认/.test(question)) {
    return "先只保留三个判断标准：最重要的结果、不能突破的底线、可以承受的成本。每个选择分别对照，不追求所有方面都最好，优先选最符合核心目标且后悔成本较低的一项。";
  }
  return "先把这个问题拆成事实、担心和期待三部分。事实决定你现在能做什么，担心帮助你设置边界，期待则用来确认方向；三部分分开后，下一步通常会更清楚。";
}

function remainingQuestions() {
  return Math.max(DAILY_QUESTION_LIMIT - questionsUsedToday, 0);
}

function hasUnlimitedQuestions() {
  return Boolean(activePlan?.expiresAt > Date.now());
}

function canAskQuestion() {
  return hasUnlimitedQuestions() || remainingQuestions() > 0;
}

function renderMemberExclusivePurchase() {
  const isMember = hasUnlimitedQuestions();
  document.querySelectorAll("[data-member-exclusive]").forEach((card) => {
    card.dataset.memberActive = isMember ? "true" : "false";
  });
  document.querySelectorAll("[data-member-purchase-status]").forEach((node) => {
    node.textContent = isMember ? "会员专享加购价" : "仅限有效会员购买";
  });
  document.querySelectorAll("[data-member-exclusive-buy]").forEach((button) => {
    button.textContent = isMember ? "购买 1 次" : "会员可购";
    button.setAttribute(
      "aria-label",
      isMember ? "购买 1 次会员专属报告次数" : "查看会员专属购买条件",
    );
  });
}

function renderQuestionUsage() {
  const remaining = remainingQuestions();
  const unlimited = hasUnlimitedQuestions();
  document.querySelectorAll("[data-question-remaining]").forEach((node) => {
    node.textContent = String(remaining);
  });
  document.querySelectorAll("[data-question-limit]").forEach((node) => {
    node.textContent = String(DAILY_QUESTION_LIMIT);
  });
  document.querySelectorAll("[data-question-progress]").forEach((node) => {
    node.style.width = unlimited ? "100%" : `${(remaining / DAILY_QUESTION_LIMIT) * 100}%`;
  });
  document.querySelectorAll("[data-free-question-status]").forEach((node) => {
    node.hidden = unlimited;
  });
  document.querySelectorAll("[data-unlimited-question-status]").forEach((node) => {
    node.hidden = !unlimited;
  });
  document.querySelectorAll("[data-report-remaining]").forEach((node) => {
    node.textContent = String(activePlan?.reportCredits || 0);
  });
  renderMemberExclusivePurchase();

  const exhausted = !canAskQuestion();
  document.querySelectorAll(".composer input").forEach((input) => {
    input.dataset.defaultPlaceholder ||= input.placeholder;
    input.disabled = exhausted;
    input.placeholder = exhausted ? "今日问答已用完" : input.dataset.defaultPlaceholder;
  });
  document.querySelectorAll("[data-submit-question]").forEach((button) => {
    button.disabled = exhausted;
  });
}

function updateFollowups() {
  const panel = document.querySelector("[data-followup-panel]");
  if (!sessionStarted) {
    if (panel) panel.hidden = true;
    return;
  }
  if (panel) panel.hidden = false;

  const remaining = remainingQuestions();
  const heading = document.querySelector("[data-followup-heading]");
  const meta = document.querySelector("[data-followup-meta]");
  const lead = document.querySelector("[data-followup-lead]");
  const list = document.querySelector("[data-followup-list]");
  const empty = document.querySelector("[data-followup-empty]");

  if (!canAskQuestion()) {
    if (heading) heading.textContent = "今天先聊到这里";
    if (meta) meta.textContent = "明日恢复";
    if (lead) lead.hidden = true;
    if (list) list.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }

  const bankIndex = (Math.max(selectedChatHistory().length - 1, 0) + followupBatchOffset) % FOLLOWUP_BANKS.length;
  const bank = FOLLOWUP_BANKS[bankIndex];
  if (heading) heading.textContent = bank.heading;
  if (meta) meta.textContent = hasUnlimitedQuestions() ? "套餐期内不限次" : `还可问 ${remaining} 次`;
  if (lead) {
    lead.hidden = false;
    lead.textContent = bank.lead;
  }
  if (list) list.hidden = false;
  if (empty) empty.hidden = true;

  document.querySelectorAll("[data-followup-list] .followup-card").forEach((card, index) => {
    const item = bank.items[index];
    if (!item) return;
    card.dataset.question = item[0];
    const question = card.querySelector("[data-followup-question]");
    const copy = card.querySelector("[data-followup-copy]");
    if (question) question.textContent = item[0];
    if (copy) copy.textContent = item[1];
  });
}

function scrollToLatestMessage() {
  const latest = document.querySelector("#screen-chat .chat-stack > :last-child");
  latest?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderChatIntro(restored = false) {
  const intro = document.querySelector("[data-chat-intro]");
  if (!intro) return;
  intro.textContent = restored
    ? `已接上关于${baziProfile?.name || "当前用户"}的对话。今天可以继续聊，也可以换一个新方向。`
    : `我会结合${baziProfile?.name || "当前用户"}的八字与当前问题继续拆解，并更新可追问的方向。`;
}

function questionAvatarChar() {
  return activeUserInitial();
}

function setFeedbackRowState(row, state = "") {
  if (!row) return;
  row.dataset.feedbackState = state;
  const label = row.querySelector("[data-feedback-label]");
  if (label) label.textContent = state ? "感谢反馈，我们会继续优化" : "这条回答对你有帮助吗？";
  row.querySelectorAll("[data-answer-feedback]").forEach((button) => {
    const selected = button.dataset.answerFeedback === state;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function createAnswerFeedback(question, state = "") {
  const row = document.createElement("div");
  row.className = "answer-feedback";
  row.dataset.feedbackQuestion = question;

  const label = document.createElement("span");
  label.dataset.feedbackLabel = "";

  const helpful = document.createElement("button");
  helpful.type = "button";
  helpful.dataset.answerFeedback = "helpful";
  helpful.setAttribute("aria-label", "这条回答有帮助");
  helpful.innerHTML = "<b aria-hidden=\"true\">✓</b>有帮助";

  const improve = document.createElement("button");
  improve.type = "button";
  improve.dataset.answerFeedback = "unhelpful";
  improve.setAttribute("aria-label", "反馈这条回答需要改进");
  improve.innerHTML = "<b aria-hidden=\"true\">!</b>需改进";

  row.append(label, helpful, improve);
  setFeedbackRowState(row, state);
  return row;
}

function saveAnswerFeedback(question, feedback, reason = "", note = "") {
  let historyIndex = -1;
  for (let index = chatHistory.length - 1; index >= 0; index -= 1) {
    const item = chatHistory[index];
    const matchesUser = item.baziUserId
      ? item.baziUserId === selectedBaziUserId
      : selectedBaziUserId === baziUsers[0]?.id;
    if (item.question === question && matchesUser) {
      historyIndex = index;
      break;
    }
  }
  if (historyIndex < 0) return;
  chatHistory[historyIndex] = {
    ...chatHistory[historyIndex],
    feedback,
    feedbackReason: reason,
    feedbackNote: note,
  };
  rememberChatHistory();
}

function openAnswerFeedback(question) {
  pendingFeedbackQuestion = question;
  document.querySelectorAll("[data-feedback-reason]").forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });
  const note = document.querySelector("[data-feedback-note]");
  if (note) note.value = "";
  openModal("feedback");
}

function appendConversationPair(stack, question, answer, animated = true, feedback = "") {
  const userRow = document.createElement("div");
  userRow.className = `user-row${animated ? " chat-message-new" : ""}`;

  const userBubble = document.createElement("div");
  userBubble.className = "bubble user";
  userBubble.textContent = question;

  const userAvatar = document.createElement("div");
  userAvatar.className = "user-avatar";
  userAvatar.setAttribute("aria-hidden", "true");
  userAvatar.textContent = questionAvatarChar();

  userRow.append(userBubble, userAvatar);

  const assistantRow = document.createElement("div");
  assistantRow.className = `assistant-row${animated ? " chat-message-new" : ""}`;

  const seal = document.createElement("div");
  seal.className = "assistant-seal";
  seal.setAttribute("aria-hidden", "true");
  seal.textContent = "知";

  const assistantBubble = document.createElement("div");
  assistantBubble.className = "bubble assistant";
  const assistantAnswer = document.createElement("div");
  assistantAnswer.className = "assistant-answer-copy";
  assistantAnswer.textContent = answer;
  assistantBubble.append(assistantAnswer, createAnswerFeedback(question, feedback));

  assistantRow.append(seal, assistantBubble);
  stack.append(userRow, assistantRow);
}

function renderChatHistory() {
  const stack = document.querySelector("#screen-chat .chat-stack");
  if (!stack) return;
  stack.replaceChildren();
  selectedChatHistory().forEach((item) => {
    appendConversationPair(stack, item.question, item.answer, false, item.feedback || "");
  });
}

function appendQuestion(question) {
  const content = question.trim();
  if (!content) return;

  if (!isLoggedIn) {
    pendingAuthScene = "chat";
    pendingQuestion = content;
    openLoginModal();
    return;
  }

  if (!canAskQuestion()) {
    openModal("question-limit");
    return;
  }

  if (!hasBaziProfile()) {
    requestBaziProfile(content);
    return;
  }

  setScene("chat");
  const stack = document.querySelector("#screen-chat .chat-stack");
  if (!stack) return;

  if (!sessionStarted) {
    stack.replaceChildren();
    sessionStarted = true;
  }
  renderChatIntro(false);

  const answer = answerFor(content);
  appendConversationPair(stack, content, answer);
  chatHistory.push({ baziUserId: selectedBaziUserId, question: content, answer });
  rememberChatHistory();
  renderReportDirection();
  followupBatchOffset = 0;

  if (!hasUnlimitedQuestions()) {
    questionsUsedToday += 1;
    rememberDailyUsage();
  }
  renderQuestionUsage();
  updateFollowups();

  document.querySelectorAll(".composer input").forEach((input) => {
    input.value = "";
  });
  window.requestAnimationFrame(scrollToLatestMessage);
}

function submitComposer(input) {
  const question = input.value.trim();
  if (!question) {
    input.focus();
    return;
  }

  if (!isLoggedIn) {
    pendingAuthScene = "chat";
    pendingQuestion = question;
    openLoginModal();
    return;
  }

  appendQuestion(question);
}

function focusChatComposer() {
  if (!isLoggedIn) {
    pendingAuthScene = "chat";
    openLoginModal();
    return;
  }
  if (!canAskQuestion()) {
    openModal("question-limit");
    return;
  }
  setScene("chat");
  window.requestAnimationFrame(() => {
    const input = document.querySelector("#screen-chat .composer input");
    input?.focus();
    input?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

function bindSceneButtons() {
  document.addEventListener("click", (event) => {
    const backTrigger = event.target.closest("[data-back]");
    if (backTrigger) {
      event.preventDefault();
      goBack();
      return;
    }

    const loginSuccess = event.target.closest("[data-login-success]");
    if (loginSuccess) {
      event.preventDefault();
      if (event.target.closest("[data-modal-close]")) {
        closeModal();
      }
      completeLogin(loginSuccess.dataset.scene || "chat");
      return;
    }

    const paymentSuccess = event.target.closest("[data-payment-success]");
    if (paymentSuccess) {
      event.preventDefault();
      activateSelectedPackage();
      renderQuestionUsage();
      updateFollowups();
      closeModal();
      setScene(paymentSuccess.dataset.scene || "paid");
      return;
    }

    const customerServiceTrigger = event.target.closest("[data-customer-service]");
    if (customerServiceTrigger) {
      event.preventDefault();
      openModal("customer-service");
      return;
    }

    const customerServiceConnect = event.target.closest("[data-customer-service-connect]");
    if (customerServiceConnect) {
      event.preventDefault();
      const connectedCopy = document.querySelector("[data-service-connected-copy]");
      if (connectedCopy) {
        connectedCopy.textContent = "客服已收到你的咨询，可继续沟通会员、权益或报告售后问题。";
      }
      openModal("service-connected");
      return;
    }

    const answerFeedback = event.target.closest("[data-answer-feedback]");
    if (answerFeedback) {
      event.preventDefault();
      const feedbackRow = answerFeedback.closest("[data-feedback-question]");
      const question = feedbackRow?.dataset.feedbackQuestion || "";
      if (!question) return;
      if (answerFeedback.dataset.answerFeedback === "unhelpful") {
        openAnswerFeedback(question);
      } else {
        saveAnswerFeedback(question, "helpful");
        setFeedbackRowState(feedbackRow, "helpful");
      }
      return;
    }

    const feedbackReason = event.target.closest("[data-feedback-reason]");
    if (feedbackReason) {
      event.preventDefault();
      document.querySelectorAll("[data-feedback-reason]").forEach((button) => {
        const selected = button === feedbackReason;
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      return;
    }

    const submitFeedback = event.target.closest("[data-submit-feedback]");
    if (submitFeedback) {
      event.preventDefault();
      const selectedReason = document.querySelector("[data-feedback-reason].selected");
      const note = document.querySelector("[data-feedback-note]")?.value.trim() || "";
      saveAnswerFeedback(
        pendingFeedbackQuestion,
        "unhelpful",
        selectedReason?.dataset.feedbackReason || "其他",
        note,
      );
      pendingFeedbackQuestion = "";
      closeModal();
      renderChatHistory();
      window.requestAnimationFrame(scrollToLatestMessage);
      return;
    }

    const memberExclusiveBuy = event.target.closest("[data-member-exclusive-buy]");
    if (memberExclusiveBuy) {
      event.preventDefault();
      if (!isLoggedIn) {
        pendingAuthScene = "paywall";
        openLoginModal();
        return;
      }
      if (!hasUnlimitedQuestions()) {
        openModal("member-only");
        return;
      }
      selectPackage(memberExclusiveBuy);
      openModal("payment");
      return;
    }

    const openUserPickerTrigger = event.target.closest("[data-open-user-picker]");
    if (openUserPickerTrigger) {
      event.preventDefault();
      openUserPicker(openUserPickerTrigger);
      return;
    }

    const createUserTrigger = event.target.closest("[data-create-user]");
    if (createUserTrigger) {
      event.preventDefault();
      createBaziUser("create");
      return;
    }

    const selectUserTrigger = event.target.closest("[data-select-user]");
    if (selectUserTrigger) {
      event.preventDefault();
      selectBaziUser(selectUserTrigger.dataset.selectUser);
      return;
    }

    const editUserTrigger = event.target.closest("[data-edit-user]");
    if (editUserTrigger) {
      event.preventDefault();
      requestBaziProfile("", "edit", editUserTrigger.dataset.editUser);
      return;
    }

    const deleteUserTrigger = event.target.closest("[data-delete-user]");
    if (deleteUserTrigger) {
      event.preventDefault();
      pendingDeleteBaziUserId = deleteUserTrigger.dataset.deleteUser;
      openModal("delete-user");
      return;
    }

    const confirmDeleteUser = event.target.closest("[data-confirm-delete-user]");
    if (confirmDeleteUser) {
      event.preventDefault();
      deleteBaziUser(pendingDeleteBaziUserId);
      pendingDeleteBaziUserId = "";
      closeModal();
      return;
    }

    const shareUserTrigger = event.target.closest("[data-share-user]");
    if (shareUserTrigger) {
      event.preventDefault();
      openShareInvite();
      return;
    }

    const copyShareTrigger = event.target.closest("[data-copy-share-link]");
    if (copyShareTrigger) {
      event.preventDefault();
      copyShareLink(copyShareTrigger);
      return;
    }

    const inviteStart = event.target.closest("[data-invite-start]");
    if (inviteStart) {
      event.preventDefault();
      if (!inviteIdentityConfirmed) {
        pendingAuthScene = "invite";
        pendingAfterLoginAction = "invite-fill";
        openLoginModal("invite");
        return;
      }
      createBaziUser("shared");
      return;
    }

    const startReport = event.target.closest("[data-start-report]");
    if (startReport) {
      event.preventDefault();
      startReportFlow();
      return;
    }

    const editBazi = event.target.closest("[data-edit-bazi]");
    if (editBazi) {
      event.preventDefault();
      editBaziForReport();
      return;
    }

    const generateReportTrigger = event.target.closest("[data-generate-report]");
    if (generateReportTrigger) {
      event.preventDefault();
      generateReport();
      return;
    }

    const baziChoice = event.target.closest("[data-bazi-choice]");
    if (baziChoice) {
      event.preventDefault();
      setBaziChoice(baziChoice.dataset.baziChoice, baziChoice.dataset.value);
      return;
    }

    const baziSave = event.target.closest("[data-bazi-save]");
    if (baziSave) {
      event.preventDefault();
      saveBaziFromModal();
      return;
    }

    const refreshHome = event.target.closest("[data-refresh-home]");
    if (refreshHome) {
      event.preventDefault();
      homeQuestionBankIndex = (homeQuestionBankIndex + 1) % HOME_QUESTION_BANKS.length;
      renderHomeQuestions();
      return;
    }

    const refreshFollowups = event.target.closest("[data-refresh-followups]");
    if (refreshFollowups) {
      event.preventDefault();
      followupBatchOffset = (followupBatchOffset + 1) % FOLLOWUP_BANKS.length;
      updateFollowups();
      return;
    }

    const questionTrigger = event.target.closest("[data-question]");
    if (questionTrigger) {
      event.preventDefault();
      const question = questionTrigger.dataset.question || "";
      if (!isLoggedIn && questionTrigger.matches("[data-requires-login]")) {
        pendingAuthScene = questionTrigger.dataset.authScene || "chat";
        pendingQuestion = question;
        openLoginModal();
      } else {
        appendQuestion(question);
      }
      return;
    }

    const submitTrigger = event.target.closest("[data-submit-question]");
    if (submitTrigger) {
      event.preventDefault();
      const input = submitTrigger.closest(".composer")?.querySelector("input");
      if (input) submitComposer(input);
      return;
    }

    const focusTrigger = event.target.closest("[data-focus-composer]");
    if (focusTrigger) {
      event.preventDefault();
      focusChatComposer();
      return;
    }

    const authTrigger = event.target.closest("[data-requires-login]");
    if (authTrigger) {
      event.preventDefault();
      if (isLoggedIn) {
        setScene(authTrigger.dataset.authScene || authTrigger.dataset.scene || "chat");
      } else {
        pendingAuthScene = authTrigger.dataset.authScene || authTrigger.dataset.scene || "chat";
        openLoginModal();
      }
      return;
    }

    const modalTrigger = event.target.closest("[data-modal]");
    if (modalTrigger) {
      event.preventDefault();
      if (modalTrigger.dataset.modal === "payment") selectPackage(modalTrigger);
      if (modalTrigger.dataset.modal === "service-connected") {
        const connectedCopy = document.querySelector("[data-service-connected-copy]");
        if (connectedCopy) {
          connectedCopy.textContent = "套餐信息已经发送，客服会继续协助你确认购买与权益开通。";
        }
      }
      openModal(modalTrigger.dataset.modal);
      return;
    }

    const trigger = event.target.closest("[data-scene]");
    if (trigger) {
      event.preventDefault();
      if (["chat", "users"].includes(trigger.dataset.scene) && !isLoggedIn) {
        pendingAuthScene = trigger.dataset.scene;
        openLoginModal();
        return;
      }
      if (trigger.matches("[data-modal-close]")) closeModal();
      setScene(trigger.dataset.scene);
      return;
    }

    if (event.target.closest("[data-modal-close]")) {
      closeModal();
    }
  });

  document.querySelectorAll(".composer input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.isComposing) return;
      event.preventDefault();
      submitComposer(input);
    });
  });

  document.querySelector("#modal-bazi")?.addEventListener("change", (event) => {
    const select = event.target.closest("[data-bazi-select]");
    if (select) {
      select.classList.remove("invalid");
      if (select.dataset.baziSelect === "province") updateBaziCityOptions();
    }
    if (event.target.matches("[data-bazi-relation]")) event.target.classList.remove("invalid");
    if (event.target.matches("[data-bazi-authorize]")) {
      event.target.closest("[data-bazi-authorization]")?.classList.remove("invalid");
    }
  });
  document.querySelector("[data-bazi-name]")?.addEventListener("input", (event) => {
    event.target.classList.remove("invalid");
  });
  document.querySelector("[data-bazi-datetime]")?.addEventListener("input", (event) => {
    event.target.classList.remove("invalid");
    const [dateValue = "", timeValue = ""] = event.target.value.split("T");
    event.target.dataset.dateValue = dateValue;
    if (timeValue) event.target.dataset.timeValue = timeValue.slice(0, 5);
    renderBaziDateTimeDisplay();
  });
  document.querySelector("[data-bazi-time-unknown]")?.addEventListener("change", () => {
    updateBaziDateTimeState();
  });
}

function initFromUrl() {
  const scene = new URLSearchParams(window.location.search).get("scene") || "home";
  if (scene === "login") {
    setScene("home", { track: false });
    openLoginModal();
    return "home";
  }
  if (scene === "chat" && !isLoggedIn) {
    setScene("home", { track: false });
    return "home";
  }
  if (scene === "users" && !isLoggedIn) {
    setScene("home", { track: false });
    pendingAuthScene = "users";
    openLoginModal();
    return "home";
  }
  setScene(scene, { track: false });
  return scene;
}

window.addEventListener("DOMContentLoaded", () => {
  initializeBaziSelectors();
  bindSceneButtons();
  renderAuthState();
  renderHomeQuestions();
  prepareBaziForm();
  renderSavedBaziProfile();
  renderBaziUserLists();
  updateShareLink();
  startPromoCountdown();
  const initialScene = initFromUrl();
  if (isLoggedIn && chatHistory.length === 0 && questionsUsedToday > 0) {
    questionsUsedToday = 0;
    rememberDailyUsage();
  }
  sessionStarted = isLoggedIn && selectedChatHistory().length > 0;
  if (sessionStarted) {
    renderChatHistory();
    renderChatIntro(true);
  }
  renderQuestionUsage();
  updateFollowups();
  if (initialScene === "chat" && sessionStarted) {
    window.requestAnimationFrame(scrollToLatestMessage);
  }
});
