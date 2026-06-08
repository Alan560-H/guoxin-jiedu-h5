// ==========================================================================
// 1. Initial State & Seed Data (using LocalStorage for persistence)
// ==========================================================================
const CONTENT_VERSION = 2;
const DEFAULT_CREDITS = 3;
const CREDIT_DEFAULT_VERSION = "default-credits-3-v2";

const DEFAULT_PROFILES = [
  {
    id: "p1",
    name: "王建国",
    relation: "self",
    relationText: "自己",
    gender: "male",
    genderText: "男",
    birthYear: 1962,
    birthMonth: 10,
    birthDay: 1,
    birthHour: "12:00",
    birthPlace: "北京市东城区",
    calendarType: "solar",
    calendarTypeText: "公历",
    useTrueSolarTime: false,
    jieduCount: 3,
    lastJieduTime: "2026-05-20 14:30"
  },
  {
    id: "p2",
    name: "李兰珍",
    relation: "parent",
    relationText: "父母",
    gender: "female",
    genderText: "女",
    birthYear: 1940,
    birthMonth: 3,
    birthDay: 15,
    birthHour: "08:15",
    birthPlace: "上海市静安区",
    calendarType: "lunar",
    calendarTypeText: "农历",
    useTrueSolarTime: true,
    jieduCount: 1,
    lastJieduTime: "2026-05-30 09:12"
  },
  {
    id: "p3",
    name: "王小梅",
    relation: "child",
    relationText: "子女",
    gender: "female",
    genderText: "女",
    birthYear: 1991,
    birthMonth: 5,
    birthDay: 12,
    birthHour: "18:30",
    birthPlace: "江苏省苏州市",
    calendarType: "solar",
    calendarTypeText: "公历",
    useTrueSolarTime: false,
    jieduCount: 0,
    lastJieduTime: "无"
  }
];

const DEFAULT_RECORDS = [
  {
    id: "r1",
    profileId: "p1",
    profileName: "王建国",
    title: "个人表达与近期状态解读",
    time: "2026-05-20 14:30",
    directions: ["近期状态", "情绪状态"],
    content: null,
    contentVersion: CONTENT_VERSION
  },
  {
    id: "r2",
    profileId: "p2",
    profileName: "李兰珍",
    title: "健康作息与家庭情绪照护建议",
    time: "2026-05-30 09:12",
    directions: ["健康作息", "家庭关系"],
    content: null,
    contentVersion: CONTENT_VERSION
  }
];

const state = {
  profiles: [],
  records: [],
  credits: DEFAULT_CREDITS,
  isLoggedIn: false,
  activeProfileId: "p1",
  activeRecordId: "",
  editingProfileId: "",
  fontScale: "standard",
  researchInterval: null,
  researchStep: 0,
  chatStep: 1, // 1: Welcome & Direction Setup, 2: Confirmation
  selectedDirections: [],
  userQuestion: "",
  voiceRecognition: null,
  isVoiceListening: false
};

let pendingLoginAction = null;

// Initialize State from LocalStorage or seed data
function initState() {
  const savedProfiles = localStorage.getItem("gx_profiles");
  const savedRecords = localStorage.getItem("gx_records");
  const savedCredits = localStorage.getItem("gx_credits");
  const savedCreditDefaultVersion = localStorage.getItem("gx_credit_default_version");
  const savedLogin = localStorage.getItem("gx_logged_in");

  state.profiles = savedProfiles ? JSON.parse(savedProfiles) : [...DEFAULT_PROFILES];
  state.records = savedRecords ? JSON.parse(savedRecords) : [...DEFAULT_RECORDS];
  state.credits = savedCredits !== null && savedCreditDefaultVersion === CREDIT_DEFAULT_VERSION
    ? parseInt(savedCredits, 10)
    : DEFAULT_CREDITS;
  state.isLoggedIn = savedLogin === "true";

  state.profiles = state.profiles.map(profile => ({
    ...profile,
    useTrueSolarTime: Boolean(profile.useTrueSolarTime)
  }));
  
  // Set initial active profile if exists
  if (state.profiles.length > 0) {
    state.activeProfileId = state.profiles[0].id;
  }

  state.records = state.records.map(record => {
    const profile = state.profiles.find(p => p.id === record.profileId);
    if (!profile) return record;

    const directions = record.directions && record.directions.length ? record.directions : ["家庭关系"];
    if (record.contentVersion !== CONTENT_VERSION) {
      return {
        ...record,
        title: `${directions.slice(0, 2).join("与")}生活参考解读`,
        directions,
        content: generateDynamicReportContent(profile, directions, record.userQuestion || ""),
        contentVersion: CONTENT_VERSION
      };
    }
    return record;
  });
  
  saveState();
  syncUIData();
}

function saveState() {
  localStorage.setItem("gx_profiles", JSON.stringify(state.profiles));
  localStorage.setItem("gx_records", JSON.stringify(state.records));
  localStorage.setItem("gx_credits", state.credits.toString());
  localStorage.setItem("gx_credit_default_version", CREDIT_DEFAULT_VERSION);
  localStorage.setItem("gx_logged_in", state.isLoggedIn ? "true" : "false");
}

function resetState() {
  localStorage.removeItem("gx_profiles");
  localStorage.removeItem("gx_records");
  localStorage.removeItem("gx_credits");
  localStorage.removeItem("gx_credit_default_version");
  localStorage.removeItem("gx_logged_in");
  state.profiles = [...DEFAULT_PROFILES];
  state.records = [...DEFAULT_RECORDS];
  state.credits = DEFAULT_CREDITS;
  state.isLoggedIn = false;
  state.activeProfileId = "p1";
  state.activeRecordId = "";
  state.editingProfileId = "";
  state.selectedDirections = [];
  state.userQuestion = "";
  state.voiceRecognition = null;
  state.isVoiceListening = false;
  pendingLoginAction = null;
  saveState();
  syncUIData();
  closeProfilePicker();
  navigateTo("screen-home");
  openLoginModal();
  alert("数据已恢复为默认演示状态");
}

// ==========================================================================
// 2. Navigation & Screen Flow Engine
// ==========================================================================
const SCREENS = [
  "screen-home",
  "screen-profiles",
  "screen-create-profile",
  "screen-chat-setup",
  "screen-researching",
  "screen-detail",
  "screen-records",
  "screen-credits"
];

const LOGIN_REQUIRED_SCREENS = new Set([
  "screen-profiles",
  "screen-create-profile",
  "screen-chat-setup",
  "screen-researching",
  "screen-detail",
  "screen-records",
  "screen-credits"
]);

function navigateTo(screenId) {
  if (LOGIN_REQUIRED_SCREENS.has(screenId) && !requireLogin(() => navigateTo(screenId))) {
    return;
  }

  // Hide active screen transitions
  SCREENS.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("active");
    }
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add("active");
    // Trigger scroll to top on enter
    const content = targetScreen.querySelector(".screen-content");
    if (content) content.scrollTop = 0;
  }

  // Sync dev panel active buttons
  const devButtons = document.querySelectorAll(".dev-btn[data-screen]");
  devButtons.forEach(btn => {
    if (btn.getAttribute("data-screen") === screenId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Page-specific render actions
  if (screenId === "screen-profiles") {
    renderProfilesList();
  } else if (screenId === "screen-records") {
    renderRecordsList();
  } else if (screenId === "screen-detail") {
    renderDetailReport();
  } else if (screenId === "screen-chat-setup") {
    setupChatScreen();
  }
}

// Back buttons logic
function handleBack() {
  const activeScreen = document.querySelector(".screen.active");
  if (!activeScreen) return;

  const id = activeScreen.id;
  if (id === "screen-profiles" || id === "screen-chat-setup" || id === "screen-records" || id === "screen-credits") {
    navigateTo("screen-home");
  } else if (id === "screen-create-profile") {
    state.editingProfileId = "";
    resetProfileForm();
    syncProfileFormMode();
    navigateTo("screen-profiles");
  } else if (id === "screen-detail") {
    navigateTo("screen-records");
  } else if (id === "screen-researching") {
    navigateTo("screen-home");
  }
}

// ==========================================================================
// 3. UI Renderer Functions
// ==========================================================================
function syncUIData() {
  // Update credit badges
  const creditElements = document.querySelectorAll(".credit-count");
  creditElements.forEach(el => {
    el.textContent = state.credits;
  });

  // Sync info in developer/admin panel
  const devLogin = document.getElementById("dev-info-login");
  const devCredits = document.getElementById("dev-info-credits");
  const devProfiles = document.getElementById("dev-info-profiles");
  const devRecords = document.getElementById("dev-info-records");
  if (devLogin) devLogin.textContent = state.isLoggedIn ? "已登录" : "未登录";
  if (devCredits) devCredits.textContent = state.credits;
  if (devProfiles) devProfiles.textContent = state.profiles.length;
  if (devRecords) devRecords.textContent = state.records.length;
}

function requireLogin(afterLogin) {
  if (state.isLoggedIn) {
    return true;
  }

  pendingLoginAction = typeof afterLogin === "function" ? afterLogin : null;
  openLoginModal();
  return false;
}

function openLoginModal() {
  const modal = document.getElementById("modal-login");
  if (modal) {
    modal.classList.add("active");
  }
}

function closeLoginModal() {
  const modal = document.getElementById("modal-login");
  if (modal) {
    modal.classList.remove("active");
  }
}

function handleLoginConfirm() {
  state.isLoggedIn = true;
  saveState();
  syncUIData();
  closeLoginModal();

  const action = pendingLoginAction;
  pendingLoginAction = null;
  if (action) {
    action();
  }
}

function openProfilesPage() {
  if (!requireLogin(openProfilesPage)) {
    return;
  }
  navigateTo("screen-profiles");
}

function openProfilePicker() {
  if (!requireLogin(openProfilePicker)) {
    return;
  }

  renderProfilePicker();
  const modal = document.getElementById("modal-profile-picker");
  if (modal) {
    modal.classList.add("active");
  }
}

function closeProfilePicker() {
  const modal = document.getElementById("modal-profile-picker");
  if (modal) {
    modal.classList.remove("active");
  }
}

function renderProfilePicker() {
  const container = document.getElementById("profile-picker-list");
  if (!container) return;
  container.innerHTML = "";

  if (state.profiles.length === 0) {
    container.innerHTML = `
      <div class="empty-state compact-empty-state">
        <div class="empty-state-icon">档</div>
        <p>您还没有创建心语档案，可以先为自己或家人创建一个档案。</p>
      </div>
    `;
    return;
  }

  state.profiles.forEach(profile => {
    const item = document.createElement("button");
    item.className = "profile-picker-item";
    item.type = "button";
    item.onclick = () => chooseProfileAndStart(profile.id);
    item.innerHTML = `
      <span class="profile-picker-main">
        <strong>${profile.name}</strong>
        <span>${profile.relationText} · ${profile.genderText} · ${profile.birthYear}年</span>
      </span>
      <span class="profile-picker-meta">
        ${profile.jieduCount} 次解读
      </span>
    `;
    container.appendChild(item);
  });
}

function chooseProfileAndStart(profileId) {
  closeProfilePicker();
  startJieduWithProfile(profileId);
}

// --- 2. Profiles Page ---
function renderProfilesList() {
  const container = document.getElementById("profiles-list-container");
  container.innerHTML = "";

  if (state.profiles.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">档</div>
        <p>您还没有创建心语档案，可以先为自己或家人创建一个档案。</p>
      </div>
    `;
    return;
  }

  state.profiles.forEach(profile => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-title">
        <span>${profile.name}</span>
        <span class="card-tag">${profile.relationText}</span>
      </div>
      <div class="profile-card-grid">
        <div class="profile-meta-item">性别：<strong>${profile.genderText}</strong></div>
        <div class="profile-meta-item">出生年份：<strong>${profile.birthYear}年</strong></div>
        <div class="profile-meta-item">历法：<strong>${profile.calendarTypeText}</strong></div>
        <div class="profile-meta-item">真太阳时：<strong>${getTrueSolarTimeText(profile)}</strong></div>
        <div class="profile-meta-item">出生地：<strong>${profile.birthPlace || '未填写'}</strong></div>
        <div class="profile-meta-item" style="grid-column: span 2;">已完成解读：<strong>${profile.jieduCount} 次</strong></div>
        <div class="profile-meta-item" style="grid-column: span 2;">最近解读：<strong>${profile.lastJieduTime}</strong></div>
      </div>
      <div class="profile-actions">
        <button class="btn btn-primary" onclick="startJieduWithProfile('${profile.id}')">开始解读</button>
        <button class="btn btn-secondary" onclick="viewProfileRecords('${profile.id}')">查看记录</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTrueSolarTimeText(profile) {
  return profile && profile.useTrueSolarTime ? "已勾选" : "未勾选";
}

function startJieduWithProfile(profileId) {
  if (!requireLogin(() => startJieduWithProfile(profileId))) {
    return;
  }

  const profile = state.profiles.find(p => p.id === profileId);
  if (!profile) {
    openProfilePicker();
    return;
  }

  state.activeProfileId = profileId;
  navigateTo("screen-chat-setup");
}

function viewProfileRecords(profileId) {
  if (!requireLogin(() => viewProfileRecords(profileId))) {
    return;
  }

  state.activeProfileId = profileId;
  navigateTo("screen-records");
}

// --- 3. Create / Edit Profile Form ---
function openCreateProfile() {
  if (!requireLogin(openCreateProfile)) {
    return;
  }

  state.editingProfileId = "";
  resetProfileForm();
  syncProfileFormMode();
  navigateTo("screen-create-profile");
}

function openEditProfile(profileId) {
  if (!requireLogin(() => openEditProfile(profileId))) {
    return;
  }

  const profile = state.profiles.find(p => p.id === profileId);
  if (!profile) {
    openCreateProfile();
    return;
  }

  state.editingProfileId = profileId;
  fillProfileForm(profile);
  syncProfileFormMode();
  navigateTo("screen-create-profile");
}

function initProfileForm() {
  // Populate Years (1930 to Current Year)
  const yearSelect = document.getElementById("form-birth-year");
  yearSelect.innerHTML = `<option value="">请选择年份</option>`;
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1930; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = `${y}年`;
    yearSelect.appendChild(opt);
  }

  // Populate Months (1 to 12)
  const monthSelect = document.getElementById("form-birth-month");
  monthSelect.innerHTML = `<option value="">月份</option>`;
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = `${m}月`;
    monthSelect.appendChild(opt);
  }

  // Populate Days (1 to 31)
  const daySelect = document.getElementById("form-birth-day");
  daySelect.innerHTML = `<option value="">日期</option>`;
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = `${d}日`;
    daySelect.appendChild(opt);
  }

  // Hook up relation chips
  const relationChips = document.querySelectorAll("#relation-chips-group .chip-btn");
  relationChips.forEach(chip => {
    chip.addEventListener("click", () => {
      relationChips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
    });
  });

  // Hook up gender chips
  const genderChips = document.querySelectorAll("#gender-chips-group .chip-btn");
  genderChips.forEach(chip => {
    chip.addEventListener("click", () => {
      genderChips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
    });
  });

  // Hook up calendar chips
  const calendarChips = document.querySelectorAll("#calendar-chips-group .chip-btn");
  calendarChips.forEach(chip => {
    chip.addEventListener("click", () => {
      calendarChips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
    });
  });
}

function syncProfileFormMode() {
  const isEditing = Boolean(state.editingProfileId);
  const title = document.getElementById("profile-form-title");
  const primaryBtn = document.getElementById("profile-form-primary-btn");
  const secondaryBtn = document.getElementById("profile-form-secondary-btn");

  if (title) title.textContent = isEditing ? "编辑心语档案" : "创建心语档案";
  if (primaryBtn) primaryBtn.textContent = isEditing ? "保存修改并开始解读" : "保存档案并开始解读";
  if (secondaryBtn) secondaryBtn.textContent = isEditing ? "仅保存修改" : "仅保存档案";
}

function setChipSelection(groupId, value) {
  const chips = document.querySelectorAll(`#${groupId} .chip-btn`);
  chips.forEach(chip => {
    chip.classList.toggle("selected", chip.getAttribute("data-value") === value);
  });
}

function resetProfileForm() {
  document.getElementById("form-name").value = "";
  document.getElementById("form-birth-place").value = "";
  document.getElementById("form-birth-year").value = "";
  document.getElementById("form-birth-month").value = "";
  document.getElementById("form-birth-day").value = "";
  document.getElementById("form-birth-hour").value = "";
  document.getElementById("form-true-solar-time").checked = false;
  setChipSelection("relation-chips-group", "");
  setChipSelection("gender-chips-group", "");
  setChipSelection("calendar-chips-group", "solar");
}

function fillProfileForm(profile) {
  document.getElementById("form-name").value = profile.name || "";
  document.getElementById("form-birth-place").value = profile.birthPlace === "未填写" ? "" : profile.birthPlace || "";
  document.getElementById("form-birth-year").value = profile.birthYear || "";
  document.getElementById("form-birth-month").value = profile.birthMonth || "";
  document.getElementById("form-birth-day").value = profile.birthDay || "";
  document.getElementById("form-birth-hour").value = profile.birthHour === "未知" ? "" : profile.birthHour || "";
  document.getElementById("form-true-solar-time").checked = Boolean(profile.useTrueSolarTime);
  setChipSelection("relation-chips-group", profile.relation || "");
  setChipSelection("gender-chips-group", profile.gender || "");
  setChipSelection("calendar-chips-group", profile.calendarType || "solar");
}

function handleSaveProfile(startImmediately) {
  if (!requireLogin(() => handleSaveProfile(startImmediately))) {
    return;
  }

  const nameInput = document.getElementById("form-name").value.trim();
  
  // Get selections from chips
  const activeRelationChip = document.querySelector("#relation-chips-group .chip-btn.selected");
  const relation = activeRelationChip ? activeRelationChip.getAttribute("data-value") : "";
  const relationText = activeRelationChip ? activeRelationChip.textContent : "";

  const activeGenderChip = document.querySelector("#gender-chips-group .chip-btn.selected");
  const gender = activeGenderChip ? activeGenderChip.getAttribute("data-value") : "";
  const genderText = activeGenderChip ? activeGenderChip.textContent : "";

  const activeCalendarChip = document.querySelector("#calendar-chips-group .chip-btn.selected");
  const calendarType = activeCalendarChip ? activeCalendarChip.getAttribute("data-value") : "solar";
  const calendarTypeText = activeCalendarChip ? activeCalendarChip.textContent : "公历";

  const year = document.getElementById("form-birth-year").value;
  const month = document.getElementById("form-birth-month").value;
  const day = document.getElementById("form-birth-day").value;
  const hour = document.getElementById("form-birth-hour").value;
  const place = document.getElementById("form-birth-place").value.trim();
  const useTrueSolarTime = document.getElementById("form-true-solar-time").checked;

  // Validate form fields
  if (!nameInput) {
    alert("请输入姓名或称呼");
    return;
  }
  if (!relation) {
    alert("请选择与我的关系");
    return;
  }
  if (!gender) {
    alert("请选择性别");
    return;
  }
  if (!year || !month || !day) {
    alert("请选择完整的出生日期");
    return;
  }

  const existingProfile = state.editingProfileId
    ? state.profiles.find(p => p.id === state.editingProfileId)
    : null;
  const targetId = existingProfile ? existingProfile.id : "p_" + Date.now();
  const profileData = {
    id: targetId,
    name: nameInput,
    relation: relation,
    relationText: relationText,
    gender: gender,
    genderText: genderText,
    birthYear: parseInt(year, 10),
    birthMonth: parseInt(month, 10),
    birthDay: parseInt(day, 10),
    birthHour: hour || "未知",
    birthPlace: place || "未填写",
    calendarType: calendarType,
    calendarTypeText: calendarTypeText,
    useTrueSolarTime: useTrueSolarTime,
    jieduCount: existingProfile ? existingProfile.jieduCount : 0,
    lastJieduTime: existingProfile ? existingProfile.lastJieduTime : "无"
  };

  if (existingProfile) {
    const index = state.profiles.findIndex(p => p.id === existingProfile.id);
    state.profiles[index] = profileData;
    state.records = state.records.map(record => (
      record.profileId === existingProfile.id
        ? { ...record, profileName: profileData.name }
        : record
    ));
  } else {
    state.profiles.push(profileData);
  }

  state.activeProfileId = targetId;
  saveState();
  syncUIData();

  state.editingProfileId = "";
  resetProfileForm();
  syncProfileFormMode();

  if (startImmediately) {
    navigateTo("screen-chat-setup");
  } else {
    navigateTo("screen-profiles");
  }
}

// --- 4. Chat Setup Screen ---
function setupChatScreen() {
  const profile = state.profiles.find(p => p.id === state.activeProfileId);
  if (!profile) {
    navigateTo("screen-home");
    return;
  }

  // Reset dialogue
  state.chatStep = 1;
  state.selectedDirections = ["家庭关系"];
  state.userQuestion = "";
  stopVoiceInput();
  
  const history = document.getElementById("chat-setup-history");
  history.innerHTML = `
    <div class="chat-current-profile-card">
      <div>
        <div class="mini-label">当前心语档案</div>
        <strong>${profile.name}（${profile.relationText}）</strong>
      </div>
      <button onclick="openProfilePicker()">切换档案</button>
    </div>
    <!-- Teacher Welcome -->
    <div class="message-bubble teacher">
      <div class="chat-avatar"><img src="assets/xinyu-teacher.svg" alt="心语老师"></div>
      <div class="message-content">
        您好，我是心语老师。接下来我会根据您选择的心语档案，通过几个简单问题，为您整理一份生活与心理参考。
      </div>
    </div>
  `;

  // Draw directions selection card
  const interactive = document.getElementById("chat-interactive-area");
  interactive.innerHTML = `
    <div class="chat-setup-card">
      <div class="chat-setup-title">
        <svg class="title-icon" aria-hidden="true"><use href="assets/direction-icons.svg#icon-cloud"></use></svg>
        请点选本次解读关注方向（可多选）
      </div>
      <div class="direction-grid">
        <div class="direction-chip selected" data-dir="家庭关系"><span class="icon"><svg aria-hidden="true"><use href="assets/direction-icons.svg#icon-family"></use></svg></span>家庭关系</div>
        <div class="direction-chip" data-dir="情绪状态"><span class="icon"><svg aria-hidden="true"><use href="assets/direction-icons.svg#icon-mood"></use></svg></span>情绪状态</div>
        <div class="direction-chip" data-dir="健康作息"><span class="icon"><svg aria-hidden="true"><use href="assets/direction-icons.svg#icon-health"></use></svg></span>健康作息</div>
        <div class="direction-chip" data-dir="事业方向"><span class="icon"><svg aria-hidden="true"><use href="assets/direction-icons.svg#icon-work"></use></svg></span>事业方向</div>
        <div class="direction-chip" data-dir="财务规划"><span class="icon"><svg aria-hidden="true"><use href="assets/direction-icons.svg#icon-money"></use></svg></span>财务规划</div>
        <div class="direction-chip" data-dir="子女关系"><span class="icon"><svg aria-hidden="true"><use href="assets/direction-icons.svg#icon-children"></use></svg></span>子女关系</div>
        <div class="direction-chip" data-dir="近期状态"><span class="icon"><svg aria-hidden="true"><use href="assets/direction-icons.svg#icon-recent"></use></svg></span>近期状态</div>
      </div>
      <button class="btn btn-primary" id="chat-btn-next" onclick="processChatStep1()">下一步，确认档案信息</button>
      <div class="chat-input-row">
        <button class="voice-btn" id="chat-voice-btn" type="button" aria-label="语音输入转文字" onclick="startVoiceInput()">
          <svg aria-hidden="true"><use href="assets/direction-icons.svg#icon-mic"></use></svg>
        </button>
        <input
          class="chat-text-field"
          id="chat-text-input"
          type="text"
          placeholder="输入问题，或点选上方方向"
          autocomplete="off"
          enterkeyhint="send"
          onkeydown="handleChatInputKey(event)"
        >
        <button class="send-btn" id="chat-send-btn" type="button" onclick="sendChatText()">发送</button>
      </div>
      <div class="chat-input-hint" id="chat-input-hint">可以输入想问的问题，也可以点麦克风说话转文字。</div>
    </div>
  `;

  // Add click listener for directions
  const chips = interactive.querySelectorAll(".direction-chip");
  const nextBtn = interactive.querySelector("#chat-btn-next");

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const dir = chip.getAttribute("data-dir");
      if (state.selectedDirections.includes(dir)) {
        state.selectedDirections = state.selectedDirections.filter(d => d !== dir);
        chip.classList.remove("selected");
      } else {
        state.selectedDirections.push(dir);
        chip.classList.add("selected");
      }

      // Check disabled state
      if (state.selectedDirections.length > 0) {
        nextBtn.classList.remove("btn-disabled");
      } else {
        nextBtn.classList.add("btn-disabled");
      }
    });
  });
}

function getChatTextInput() {
  return document.getElementById("chat-text-input");
}

function setChatInputHint(text, status) {
  const hint = document.getElementById("chat-input-hint");
  if (!hint) return;

  hint.textContent = text;
  hint.classList.remove("success", "warning");
  if (status) {
    hint.classList.add(status);
  }
}

function setVoiceButtonListening(isListening) {
  const voiceButton = document.getElementById("chat-voice-btn");
  if (voiceButton) {
    voiceButton.classList.toggle("listening", isListening);
    voiceButton.setAttribute("aria-label", isListening ? "停止语音输入" : "语音输入转文字");
  }
}

function appendChatMessage(role, text) {
  const history = document.getElementById("chat-setup-history");
  if (!history) return;

  const message = document.createElement("div");
  message.className = `message-bubble ${role}`;
  if (role === "teacher") {
    message.innerHTML = `
      <div class="chat-avatar"><img src="assets/xinyu-teacher.svg" alt="心语老师"></div>
      <div class="message-content">${escapeHtml(text)}</div>
    `;
  } else {
    message.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
  }

  history.appendChild(message);
  setTimeout(scrollChatHistoryToBottom, 50);
}

function handleChatInputKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendChatText();
  }
}

function sendChatText() {
  const input = getChatTextInput();
  if (!input) return;

  const text = input.value.trim();
  if (!text) {
    setChatInputHint("请先输入想问的问题，或点麦克风说话。", "warning");
    input.focus();
    return;
  }

  state.userQuestion = state.userQuestion ? `${state.userQuestion}；${text}` : text;
  appendChatMessage("user", text);
  appendChatMessage("teacher", `收到，我会把“${text}”作为本次补充问题。您还可以继续点选关注方向，确认后我会一起整理。`);

  input.value = "";
  input.focus();
  setChatInputHint("已记录补充问题，可以继续输入，也可以点“下一步”确认档案信息。", "success");
}

function startVoiceInput() {
  const input = getChatTextInput();
  if (!input) return;

  if (state.isVoiceListening) {
    stopVoiceInput();
    setChatInputHint("已停止语音输入，可以修改文字后发送。", "success");
    input.focus();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    input.value = input.value || "我想了解最近和家人沟通时需要注意什么";
    setChatInputHint("当前浏览器暂不支持语音识别，已填入一段示例文字，可修改后发送。", "warning");
    input.focus();
    return;
  }

  let voiceErrorText = "";
  const recognition = new SpeechRecognition();
  state.voiceRecognition = recognition;
  state.isVoiceListening = true;
  setVoiceButtonListening(true);
  setChatInputHint("正在听您说话，识别到的文字会自动填入输入框。", "success");

  recognition.lang = "zh-CN";
  recognition.interimResults = true;
  recognition.continuous = false;

  let finalTranscript = "";
  recognition.onresult = event => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    input.value = `${finalTranscript}${interimTranscript}`.trim();
  };

  recognition.onerror = event => {
    const errorMap = {
      "not-allowed": "浏览器没有获得麦克风权限，请允许后再试。",
      "no-speech": "刚才没有识别到声音，可以再点一次麦克风。",
      "audio-capture": "没有检测到可用麦克风。",
      "network": "语音识别网络暂时不可用，可以先手动输入。"
    };
    voiceErrorText = errorMap[event.error] || "语音识别暂时不可用，可以先手动输入。";
  };

  recognition.onend = () => {
    state.isVoiceListening = false;
    state.voiceRecognition = null;
    setVoiceButtonListening(false);
    if (voiceErrorText) {
      setChatInputHint(voiceErrorText, "warning");
    } else if (input.value.trim()) {
      setChatInputHint("语音文字已填入，可以修改后发送。", "success");
    } else {
      setChatInputHint("未识别到文字，可以再点麦克风试一次，或直接输入。", "warning");
    }
    input.focus();
  };

  try {
    recognition.start();
  } catch (error) {
    state.isVoiceListening = false;
    state.voiceRecognition = null;
    setVoiceButtonListening(false);
    setChatInputHint("语音输入启动失败，可以先手动输入。", "warning");
    input.focus();
  }
}

function stopVoiceInput() {
  if (state.voiceRecognition && state.isVoiceListening) {
    try {
      state.voiceRecognition.stop();
    } catch (error) {
      // Some browsers throw if recognition is already ending.
    }
  }
  state.isVoiceListening = false;
  state.voiceRecognition = null;
  setVoiceButtonListening(false);
}

function scrollChatHistoryToBottom() {
  const container = document.getElementById("chat-setup-history");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function processChatStep1() {
  if (state.selectedDirections.length === 0) return;

  const profile = state.profiles.find(p => p.id === state.activeProfileId);
  const history = document.getElementById("chat-setup-history");
  const questionSummary = state.userQuestion ? ` 补充问题：${state.userQuestion}` : "";
  
  // Append User message
  const userMsg = document.createElement("div");
  userMsg.className = "message-bubble user";
  userMsg.innerHTML = `
    <div class="message-content">${escapeHtml(`我希望关注：${state.selectedDirections.join("、")}。${questionSummary}`)}</div>
  `;
  history.appendChild(userMsg);

  // Scroll to bottom
  setTimeout(scrollChatHistoryToBottom, 50);

  // Load teacher response (Confirmation)
  setTimeout(() => {
    if (!document.getElementById("screen-chat-setup").classList.contains("active")) {
      return;
    }

    const teacherMsg = document.createElement("div");
    teacherMsg.className = "message-bubble teacher";
    teacherMsg.innerHTML = `
      <div class="chat-avatar"><img src="assets/xinyu-teacher.svg" alt="心语老师"></div>
      <div class="message-content">
        好的，我已经记录了您的期望。请在开始前确认以下档案信息是否准确无误：
      </div>
    `;
    history.appendChild(teacherMsg);

    // Draw confirmation table card
    const confirmCard = document.createElement("div");
    confirmCard.className = "chat-setup-card";
    confirmCard.style.marginTop = "0.75rem";
    confirmCard.innerHTML = `
      <div class="chat-setup-title">
        <svg class="title-icon" aria-hidden="true"><use href="assets/direction-icons.svg#icon-record"></use></svg>
        信息核对确认
      </div>
      <table class="confirm-summary-table">
        <tr><td class="label">档案名称</td><td class="value">${profile.name}</td></tr>
        <tr><td class="label">与我关系</td><td class="value">${profile.relationText}</td></tr>
        <tr><td class="label">出生日期</td><td class="value">${profile.calendarTypeText} ${profile.birthYear}年${profile.birthMonth}月${profile.birthDay}日</td></tr>
        <tr><td class="label">出生时间</td><td class="value">${profile.birthHour}</td></tr>
        <tr><td class="label">真太阳时</td><td class="value">${getTrueSolarTimeText(profile)}</td></tr>
        <tr><td class="label">出生地点</td><td class="value">${profile.birthPlace}</td></tr>
        <tr><td class="label">关注方向</td><td class="value" style="color:var(--color-primary-green); font-weight:700;">${state.selectedDirections.join("、")}</td></tr>
        ${state.userQuestion ? `<tr><td class="label">补充问题</td><td class="value">${escapeHtml(state.userQuestion)}</td></tr>` : ""}
      </table>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:1rem;">
        <button class="btn btn-primary" onclick="confirmStartJiedu()">确认开始解读</button>
        <button class="btn btn-secondary" onclick="openEditProfile(state.activeProfileId)">修改信息</button>
        <button class="btn btn-outline" onclick="navigateTo('screen-home')">取消</button>
      </div>
    `;
    history.appendChild(confirmCard);
    
    // Smooth scroll
    setTimeout(scrollChatHistoryToBottom, 50);

    // Empty interactive bottom area
    const interactive = document.getElementById("chat-interactive-area");
    if (interactive) {
      interactive.innerHTML = "";
    }
  }, 400);
}

function confirmStartJiedu() {
  if (!requireLogin(confirmStartJiedu)) {
    return;
  }

  // Check credit balance
  if (state.credits <= 0) {
    navigateTo("screen-credits");
    return;
  }

  // Deduct 1 credit
  state.credits--;
  saveState();
  syncUIData();

  // Navigate to research page
  navigateTo("screen-researching");
  startResearchSimulation();
}

// --- 5. Researching Page Simulation ---
function startResearchSimulation() {
  clearInterval(state.researchInterval);
  state.researchStep = 1;

  // Clear visual status
  const steps = document.querySelectorAll(".progress-timeline .timeline-step");
  steps.forEach(step => {
    step.classList.remove("completed", "active");
  });

  const setStepState = (stepIdx) => {
    steps.forEach((step, idx) => {
      const currentIdx = idx + 1;
      if (currentIdx < stepIdx) {
        step.classList.add("completed");
        step.classList.remove("active");
      } else if (currentIdx === stepIdx) {
        step.classList.add("active");
        step.classList.remove("completed");
      } else {
        step.classList.remove("completed", "active");
      }
    });
  };

  setStepState(1);

  // Interval simulation
  state.researchInterval = setInterval(() => {
    state.researchStep++;
    if (state.researchStep <= 4) {
      setStepState(state.researchStep);
    } else {
      clearInterval(state.researchInterval);
      completeResearchSimulation();
    }
  }, 2500);
}

function fastForwardResearch() {
  if (document.getElementById("screen-researching").classList.contains("active")) {
    clearInterval(state.researchInterval);
    completeResearchSimulation();
  }
}

function completeResearchSimulation() {
  const profile = state.profiles.find(p => p.id === state.activeProfileId);
  
  // Format current date
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

  // Update profile's metadata
  if (profile) {
    profile.jieduCount++;
    profile.lastJieduTime = timeStr;
  }

  // Create completed record
  const newRecordId = "r_" + Date.now();
  const newRecord = {
    id: newRecordId,
    profileId: state.activeProfileId,
    profileName: profile ? profile.name : "未知",
    title: `${state.selectedDirections.slice(0, 2).join("与")}生活参考解读`,
    time: timeStr,
    directions: [...state.selectedDirections],
    userQuestion: state.userQuestion,
    content: generateDynamicReportContent(profile, state.selectedDirections, state.userQuestion),
    contentVersion: CONTENT_VERSION
  };

  state.records.unshift(newRecord);
  state.activeRecordId = newRecordId;
  saveState();
  syncUIData();

  // Show finished modal overlays
  document.getElementById("modal-overlay-finished").classList.add("active");
}

function closeCompletionModal(targetScreen) {
  document.getElementById("modal-overlay-finished").classList.remove("active");
  if (targetScreen) {
    navigateTo(targetScreen);
  }
}

// --- 7. Detail Dynamic Content Generator ---
function renderDetailReport() {
  const record = state.records.find(r => r.id === state.activeRecordId);
  const profile = record ? state.profiles.find(p => p.id === record.profileId) : null;

  if (!record || !profile) {
    navigateTo("screen-home");
    return;
  }

  // If content is not generated (legacy seeds), populate it
  if (!record.content || record.contentVersion !== CONTENT_VERSION) {
    record.content = generateDynamicReportContent(profile, record.directions, record.userQuestion || "");
    record.contentVersion = CONTENT_VERSION;
    saveState();
  }

  // Write elements to DOM
  document.getElementById("report-profile-name").textContent = profile.name;
  document.getElementById("report-relation").textContent = profile.relationText;
  document.getElementById("report-time").textContent = record.time;
  document.getElementById("report-directions").textContent = record.directions.join("、");

  // Load section contents
  const body = document.getElementById("report-content-body");
  body.innerHTML = "";

  record.content.forEach(sec => {
    const secEl = document.createElement("div");
    secEl.className = "report-section";
    secEl.innerHTML = `
      <h3 class="report-section-title">${escapeHtml(sec.title)}</h3>
      <p class="report-body-text">${escapeHtml(sec.body).replace(/\n/g, '<br>')}</p>
    `;
    body.appendChild(secEl);
  });
}

function generateDynamicReportContent(profile, directions, userQuestion = "") {
  const age = new Date().getFullYear() - profile.birthYear;
  const isMale = profile.gender === "male";
  const name = profile.name;
  const titleName = isMale ? `${name.substring(0, 2)}先生` : `${name.substring(0, 2)}女士`;
  const isSelf = profile.relation === "self";
  const questionNote = userQuestion ? `您补充提到：“${userQuestion}”。` : "";

  const contents = [
    {
      title: "一、本次解读摘要",
      body: `根据您选择的关注方向（${directions.join("、")}），心语老师为您整理了这份生活与心理参考。${questionNote}整体来看，${titleName}重视责任、稳定与家庭联结，也容易把很多关心放在心里。近期更适合把生活节奏放慢一些，在家庭沟通、情绪照护和日常安排中多一些温和表达。`
    },
    {
      title: "二、性格与表达方式",
      body: `根据心语档案信息，${titleName}在表达方式上偏稳重，做事讲究分寸，也愿意为家人承担责任。有时真正的关心并不容易直接说出口，容易形成“心里在意，嘴上克制”的状态。建议在日常交流中多用短句表达关心，例如“我听你说”“你慢慢来”“这件事我们一起想办法”，比直接给结论更容易让家人感到被理解。`
    },
    {
      title: "三、当前阶段状态",
      body: `处于 ${age} 岁这一阶段，生活重点往往会从“向外奔忙”逐步转向“向内安顿”。这不是停下来，而是重新整理自己的精力、关系和生活秩序。近期可以把注意力放在三件事上：保持规律作息、减少无效操心、为自己保留稳定的小兴趣。`
    }
  ];

  // Add selective modules based on user direction choices
  if (directions.includes("家庭关系") || directions.includes("子女关系")) {
    contents.push({
      title: "四、家庭关系建议",
      body: `在家庭交流中，${titleName}可以尝试把“提醒”变成“陪伴”。尤其面对${isSelf ? "子女及晚辈" : "家人"}时，建议保持“知而不评、帮而不包”的态度。家庭关系最需要的是安全感，不一定每次都要讲清道理。可以多安排轻松的饭后闲聊，把话题放在生活、身体感受、旧事回忆和眼前小事上。`
    });
  } else {
    contents.push({
      title: "四、家庭关系建议",
      body: `家庭是重要的支持来源。对于${titleName}来说，近期可以少一点急着安排，多一点耐心听完。家人之间不必每句话都马上回应，有时温和的眼神、一次散步、一次简单问候，就能让关系慢慢松下来。`
    });
  }

  if (directions.includes("健康作息") || directions.includes("情绪状态")) {
    contents.push({
      title: "五、生活节奏与情绪照护",
      body: `生活节奏会直接影响情绪。近期建议把作息安排得更稳定一些，尤其注意睡前放松和白天活动。可以尝试：\n1. 上午或傍晚散步 20 分钟，感受天气、树影和身体状态。\n2. 睡前减少长时间刷手机，换成听一段舒缓音乐或泡一杯温水。\n3. 情绪烦乱时，深吸气四秒、慢慢呼气六秒，先让身体安静下来，再处理事情。`
    });
  } else {
    contents.push({
      title: "五、生活节奏与情绪照护",
      body: `规律作息是保持情绪平稳的基础。近期可以在清晨做几次深呼吸，饮食上以清淡、温和为主。遇到不顺心的事情，可以先离开争执现场，喝水、走动、写几行字，让情绪有一个缓冲。`
    });
  }

  // Always output actions and warm warnings
  contents.push({
    title: "六、近期可以尝试的行动建议",
    body: `1. 找一个天气舒服的上午，给一位家人打电话，只聊近况，不急着给建议。\n2. 整理一次房间、柜子或常用物品，把不再需要的东西慢慢处理掉。\n3. 每周安排两到三次轻松外出，散步、买菜、晒太阳都可以，让身体有稳定的活动节奏。\n4. 遇到家庭分歧时，先问一句“你现在最担心的是什么”，再表达自己的想法。`
  });

  contents.push({
    title: "七、温馨提示",
    body: `本内容由心语老师结合东方文化视角与日常心理沟通方法整理。它适合作为学习、交流和生活参考，帮助您更温和地理解自己和家人。涉及健康、法律、投资或重大人生安排时，请以专业人士意见为准。`
  });

  return contents;
}

// --- 8. Interpretation Records Page ---
function renderRecordsList() {
  const container = document.getElementById("records-list-container");
  container.innerHTML = "";

  // Find records matching current active profile
  const profile = state.profiles.find(p => p.id === state.activeProfileId);
  const profileRecords = state.records.filter(r => r.profileId === state.activeProfileId);

  // Set Profile Name Header
  document.getElementById("records-profile-name").textContent = profile ? profile.name : "";

  if (profileRecords.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">录</div>
        <p>当前档案还没有解读记录。</p>
        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="startJieduWithProfile('${state.activeProfileId}')">开始第一次解读</button>
      </div>
    `;
    return;
  }

  profileRecords.forEach(rec => {
    const card = document.createElement("div");
    card.className = "card record-item-card completed";
    card.innerHTML = `
      <div class="card-title">
        <span>${rec.title}</span>
        <span class="card-tag">已整理</span>
      </div>
      <div class="record-item-meta">
        <div>时间：${rec.time}</div>
        <div>关注：${rec.directions.join("、")}</div>
        <div>状态：已完成</div>
      </div>
      <button class="btn btn-secondary" onclick="viewRecordDetails('${rec.id}')">查看详情</button>
    `;
    container.appendChild(card);
  });
}

function viewRecordDetails(recordId) {
  if (!requireLogin(() => viewRecordDetails(recordId))) {
    return;
  }

  state.activeRecordId = recordId;
  navigateTo("screen-detail");
}

// --- 9. Purchase Credits Page ---
function selectCreditPackage(cardEl, amount) {
  const cards = document.querySelectorAll(".paywall-card");
  cards.forEach(c => c.classList.remove("selected"));
  cardEl.classList.add("selected");
  cardEl.querySelector("input").checked = true;
}

function handlePurchase() {
  if (!requireLogin(handlePurchase)) {
    return;
  }

  const checkedInput = document.querySelector('input[name="credit-pkg"]:checked');
  if (!checkedInput) {
    alert("请选择要开通的权益包");
    return;
  }

  const amount = parseInt(checkedInput.value, 10);
  const pkgName = checkedInput.getAttribute("data-name");

  alert(`【演示】\n已开通：${pkgName}\n解读次数增加：+${amount}次`);
  
  state.credits += amount;
  saveState();
  syncUIData();

  // Return to homepage
  navigateTo("screen-home");
}

// ==========================================================================
// 4. Admin / Developer Panel Control Logic
// ==========================================================================
function setFontScale(scaleClass) {
  const appEl = document.getElementById("h5-app");
  appEl.classList.remove("scale-large", "scale-xlarge");
  
  const buttons = document.querySelectorAll(".dev-btn[data-scale]");
  buttons.forEach(btn => btn.classList.remove("active"));
  
  if (scaleClass === "scale-large") {
    appEl.classList.add("scale-large");
    document.querySelector(".dev-btn[data-scale='scale-large']").classList.add("active");
  } else if (scaleClass === "scale-xlarge") {
    appEl.classList.add("scale-xlarge");
    document.querySelector(".dev-btn[data-scale='scale-xlarge']").classList.add("active");
  } else {
    document.querySelector(".dev-btn[data-scale='standard']").classList.add("active");
  }
}

function adjustCredits(change) {
  state.credits += change;
  if (state.credits < 0) state.credits = 0;
  saveState();
  syncUIData();
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  initState();
  initProfileForm();
  if (!state.isLoggedIn) {
    openLoginModal();
  }
});
