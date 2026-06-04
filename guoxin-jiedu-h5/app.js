// ==========================================================================
// 1. Initial State & Seed Data (using LocalStorage for persistence)
// ==========================================================================
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
    jieduCount: 0,
    lastJieduTime: "无"
  }
];

const DEFAULT_RECORDS = [
  {
    id: "r1",
    profileId: "p1",
    profileName: "王建国",
    title: "个人表达与近期状态梳理",
    time: "2026-05-20 14:30",
    directions: ["近期状态", "情绪状态"],
    content: null // Content will be dynamically generated on view
  },
  {
    id: "r2",
    profileId: "p2",
    profileName: "李兰珍",
    title: "健康作息与家庭情绪照护建议",
    time: "2026-05-30 09:12",
    directions: ["健康作息", "家庭关系"],
    content: null
  }
];

const state = {
  profiles: [],
  records: [],
  credits: 1,
  activeProfileId: "p1",
  activeRecordId: "",
  fontScale: "standard",
  researchInterval: null,
  researchStep: 0,
  chatStep: 1, // 1: Welcome & Direction Setup, 2: Confirmation
  selectedDirections: []
};

// Initialize State from LocalStorage or seed data
function initState() {
  const savedProfiles = localStorage.getItem("gx_profiles");
  const savedRecords = localStorage.getItem("gx_records");
  const savedCredits = localStorage.getItem("gx_credits");

  state.profiles = savedProfiles ? JSON.parse(savedProfiles) : [...DEFAULT_PROFILES];
  state.records = savedRecords ? JSON.parse(savedRecords) : [...DEFAULT_RECORDS];
  state.credits = savedCredits !== null ? parseInt(savedCredits, 10) : 1;
  
  // Set initial active profile if exists
  if (state.profiles.length > 0) {
    state.activeProfileId = state.profiles[0].id;
  }
  
  saveState();
  syncUIData();
}

function saveState() {
  localStorage.setItem("gx_profiles", JSON.stringify(state.profiles));
  localStorage.setItem("gx_records", JSON.stringify(state.records));
  localStorage.setItem("gx_credits", state.credits.toString());
}

function resetState() {
  localStorage.removeItem("gx_profiles");
  localStorage.removeItem("gx_records");
  localStorage.removeItem("gx_credits");
  state.profiles = [...DEFAULT_PROFILES];
  state.records = [...DEFAULT_RECORDS];
  state.credits = 1;
  state.activeProfileId = "p1";
  state.activeRecordId = "";
  state.selectedDirections = [];
  saveState();
  syncUIData();
  navigateTo("screen-home");
  alert("数据已重置为默认演示数据");
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

function navigateTo(screenId) {
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
  document.getElementById("dev-info-credits").textContent = state.credits;
  document.getElementById("dev-info-profiles").textContent = state.profiles.length;
  document.getElementById("dev-info-records").textContent = state.records.length;
}

// --- 2. Profiles Page ---
function renderProfilesList() {
  const container = document.getElementById("profiles-list-container");
  container.innerHTML = "";

  if (state.profiles.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👤</div>
        <p>您还没有创建心语档案，可以先为自己或家人创建一个档案。</p>
      </div>
    `;
    return;
  }

  state.profiles.forEach(profile => {
    const age = new Date().getFullYear() - profile.birthYear;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-title">
        <span>${profile.name}</span>
        <span class="card-tag">${profile.relationText}</span>
      </div>
      <div class="profile-card-grid">
        <div class="profile-meta-item">性别：<strong>${profile.genderText}</strong></div>
        <div class="profile-meta-item">年龄：<strong>${age}岁</strong></div>
        <div class="profile-meta-item">历法：<strong>${profile.calendarTypeText}</strong></div>
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

function startJieduWithProfile(profileId) {
  state.activeProfileId = profileId;
  navigateTo("screen-chat-setup");
}

function viewProfileRecords(profileId) {
  state.activeProfileId = profileId;
  navigateTo("screen-records");
}

// --- 3. Create / Edit Profile Form ---
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

function handleSaveProfile(startImmediately) {
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

  // Create new profile object
  const newId = "p_" + Date.now();
  const profile = {
    id: newId,
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
    jieduCount: 0,
    lastJieduTime: "无"
  };

  state.profiles.push(profile);
  state.activeProfileId = newId;
  saveState();
  syncUIData();

  // Reset form fields
  document.getElementById("form-name").value = "";
  document.getElementById("form-birth-place").value = "";
  document.getElementById("form-birth-year").value = "";
  document.getElementById("form-birth-month").value = "";
  document.getElementById("form-birth-day").value = "";
  document.getElementById("form-birth-hour").value = "";
  document.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("selected"));

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
  state.selectedDirections = [];
  
  const history = document.getElementById("chat-setup-history");
  history.innerHTML = `
    <!-- Teacher Welcome -->
    <div class="message-bubble teacher">
      <div class="chat-avatar"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60" alt="心语老师"></div>
      <div class="message-content">
        您好，我是心语老师。接下来我会根据您选择的档案 <strong>“${profile.name} (${profile.relationText})”</strong>，通过几个简单问题，为您整理一份生活与心理参考。
      </div>
    </div>
  `;

  // Draw directions selection card
  const interactive = document.getElementById("chat-interactive-area");
  interactive.innerHTML = `
    <div class="chat-setup-card">
      <div class="chat-setup-title">🌸 请点选本次解读关注方向（可多选）</div>
      <div class="direction-grid">
        <div class="direction-chip" data-dir="家庭关系"><span class="icon">🏡</span>家庭关系</div>
        <div class="direction-chip" data-dir="情绪状态"><span class="icon">💆</span>情绪状态</div>
        <div class="direction-chip" data-dir="健康作息"><span class="icon">🍵</span>健康作息</div>
        <div class="direction-chip" data-dir="事业方向"><span class="icon">💼</span>事业方向</div>
        <div class="direction-chip" data-dir="财务规划"><span class="icon">🪙</span>财务规划</div>
        <div class="direction-chip" data-dir="子女关系"><span class="icon">👶</span>子女关系</div>
        <div class="direction-chip" data-dir="近期状态"><span class="icon">🍂</span>近期状态</div>
      </div>
      <button class="btn btn-primary btn-disabled" id="chat-btn-next" onclick="processChatStep1()">下一步，确认档案信息</button>
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

function processChatStep1() {
  if (state.selectedDirections.length === 0) return;

  const profile = state.profiles.find(p => p.id === state.activeProfileId);
  const history = document.getElementById("chat-setup-history");
  
  // Append User message
  const userMsg = document.createElement("div");
  userMsg.className = "message-bubble user";
  userMsg.innerHTML = `
    <div class="message-content">我希望关注：${state.selectedDirections.join("、")}。</div>
  `;
  history.appendChild(userMsg);

  // Scroll to bottom
  const container = document.getElementById("screen-chat-setup").querySelector(".screen-content");
  setTimeout(() => container.scrollTop = container.scrollHeight, 50);

  // Load teacher response (Confirmation)
  setTimeout(() => {
    const teacherMsg = document.createElement("div");
    teacherMsg.className = "message-bubble teacher";
    teacherMsg.innerHTML = `
      <div class="chat-avatar"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60" alt="心语老师"></div>
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
      <div class="chat-setup-title">📝 信息核对确认</div>
      <table class="confirm-summary-table">
        <tr><td class="label">档案名称</td><td class="value">${profile.name}</td></tr>
        <tr><td class="label">与我关系</td><td class="value">${profile.relationText}</td></tr>
        <tr><td class="label">出生日期</td><td class="value">${profile.calendarTypeText} ${profile.birthYear}年${profile.birthMonth}月${profile.birthDay}日</td></tr>
        <tr><td class="label">出生时间</td><td class="value">${profile.birthHour}</td></tr>
        <tr><td class="label">出生地点</td><td class="value">${profile.birthPlace}</td></tr>
        <tr><td class="label">关注方向</td><td class="value" style="color:var(--color-primary-green); font-weight:700;">${state.selectedDirections.join("、")}</td></tr>
      </table>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:1rem;">
        <button class="btn btn-primary" onclick="confirmStartJiedu()">确认，开始本次解读</button>
        <button class="btn btn-secondary" onclick="navigateTo('screen-create-profile')">修改档案信息</button>
        <button class="btn btn-outline" onclick="setupChatScreen()">重新点选方向</button>
      </div>
    `;
    history.appendChild(confirmCard);
    
    // Smooth scroll
    setTimeout(() => container.scrollTop = container.scrollHeight, 50);

    // Empty interactive bottom area
    document.getElementById("chat-interactive-area").innerHTML = "";
  }, 400);
}

function confirmStartJiedu() {
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
    title: `${state.selectedDirections.slice(0, 2).join("与")}生活解读参考`,
    time: timeStr,
    directions: [...state.selectedDirections],
    content: generateDynamicReportContent(profile, state.selectedDirections)
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

// --- 7. Detail Report Dynamic Content Generator ---
function renderDetailReport() {
  const record = state.records.find(r => r.id === state.activeRecordId);
  const profile = record ? state.profiles.find(p => p.id === record.profileId) : null;

  if (!record || !profile) {
    navigateTo("screen-home");
    return;
  }

  // If content is not generated (legacy seeds), populate it
  if (!record.content) {
    record.content = generateDynamicReportContent(profile, record.directions);
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
      <h3 class="report-section-title">${sec.title}</h3>
      <p class="report-body-text">${sec.body.replace(/\n/g, '<br>')}</p>
    `;
    body.appendChild(secEl);
  });
}

function generateDynamicReportContent(profile, directions) {
  const age = new Date().getFullYear() - profile.birthYear;
  const isMale = profile.gender === "male";
  const name = profile.name;
  const titleName = isMale ? `${name.substring(0, 2)}先生` : `${name.substring(0, 2)}女士`;
  const isSelf = profile.relation === "self";

  const contents = [
    {
      title: "一、本次解读摘要",
      body: `根据您选择的关注方向（${directions.join("、")}），心语老师为您整理了以下关于生活与情绪起伏的宏观观察。结合东方文化中的天人合一思想及现代心理学的投射效应，本篇内容将重点探析您在当前生命周期的内在调节策略。总体来看，这组信息折射出一种“外刚内柔、谋定后动”的心境特征，需要您在节奏把控与家庭情感交互中，多一些顺其自然的包容，少一些刻意苛求的紧张。`
    },
    {
      title: "二、性格与表达方式",
      body: `根据档案信息，${titleName}在交往与行事风格上体现出东方传统中“温良恭俭”的特质，注重责任与尊严，对家人有强烈的庇护欲。然而，这种守护心强烈的表达方式，有时会转化为默默承受一切压力而不宣之于口，甚至在关心晚辈或伴侣时显得有些含蓄或严厉。在心理层面，这容易造成“内心关怀十分，言语传达三分”的落差。在东方哲学中，最高明的沟通如同“润物细无声”，建议今后在表达关爱时，尝试用温和、倾听的角色代替指导与要求。`
    },
    {
      title: "三、当前阶段状态",
      body: `处于 ${age} 岁这一阶段的${profile.relationText}，处于一个需要学会“做减法”的生命转折期。结合东方传统对时序循环的认知，这一年龄段恰如白露之后、秋分之前，万物敛藏，心境由向外探索逐步转为向内安顿。此时，容易出现对往日未竟之事的遗憾感，或者对下一代独立后产生的“空巢感”焦虑。这种内在的状态在近期较为明显，需要意识到这是正常的心理阶段转换，而非坏事，主动把生活的重心拉回到自我的兴趣和调养上。`
    }
  ];

  // Add selective modules based on user direction choices
  if (directions.includes("家庭关系") || directions.includes("子女关系")) {
    contents.push({
      title: "四、家庭关系建议",
      body: `在家庭成员的交流中，特别是在处理${isSelf ? "子女及晚辈" : "长辈与同辈"}的关系时，${titleName}需要掌握“适当退位”的艺术。东方伦理重视序齿和尊重，但在日常生活中过于强调规矩会让气氛变硬。建议：\n1. 对年轻一代的选择保持“知而不评、帮而不包”的态度。\n2. 多组织轻松的餐桌家常闲聊，将话题引向当年的传统美食或文化旧事，这能增进家族温情，拉近两代人心灵距离。`
    });
  } else {
    contents.push({
      title: "四、家庭关系建议",
      body: `家庭是心灵最安稳的港湾。对于${titleName}来说，近期在家庭中建议扮演“静观者”的角色，让家人各自承担他们的成长功课，不要因为细枝末节的琐碎小事劳心费神。在沟通时保持温柔的眼神和耐心的倾听，不仅能平复对方的情绪，也会让您自己收获更多宁静。`
    });
  }

  if (directions.includes("健康作息") || directions.includes("情绪状态")) {
    contents.push({
      title: "五、生活节奏与情绪照护",
      body: `养生之道，首重养心。东方医学提倡“子午觉”与“顺应时序”。${titleName}近期需提防因思虑过度引起的睡眠质量波动或头绪杂乱。建议：\n1. 每日在上午或傍晚安排至少20分钟的静心散步，专注观察大自然的时令变化（如风拂树梢、草木荣枯）。\n2. 睡前两小时减少接触手机等屏幕，可以泡一杯温热的淡茶（如麦冬或大枣茶），舒缓心经脉络。\n3. 在情绪低落或焦躁时，深吸气四秒，呼气六秒，默念“物来顺应，未来不迎”，调节身心共振。`
    });
  } else {
    contents.push({
      title: "五、生活节奏与情绪照护",
      body: `规律的作息是保持情绪饱满的根本。近期建议在清晨起床后进行深呼吸，并在饮食上遵循多温少凉、清淡为主的规律。遇到不顺心的事情，可以用温水擦拭额头，或者写几行大字、抚弄花草来转移思绪，以柔克刚。`
    });
  }

  // Always output actions and warm warnings
  contents.push({
    title: "六、近期可以尝试的行动建议",
    body: `1. 【东方微仪式】：挑选一个阳光和煦的早晨，煮一壶家乡的茶，在桌前给久未深聊的家人打个电话，聊聊时令，不谈决策，只道安好。\n2. 【整理心境】：整理一次房间或储物柜，把不再需要的物品妥善断舍离，这一行为在心理学上能起到显著的焦虑净化作用。\n3. 【动静相宜】：找时间出门走走，脚踏实地踩一踩泥土与草地，吸纳自然朝气，有助于提振脾胃心神。`
  });

  contents.push({
    title: "七、温馨提示",
    body: `本篇整理由心语老师结合东方经典文化观点与日常心理沟通技巧倾情输出。人生的美好在于当下的踏实。希望这份解读能如同微风一般，拂去您心头的喧嚣，为您和家人的日常生活带去一份温暖的参考和抚慰。`
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
  document.getElementById("records-profile-name").textContent = profile ? `${profile.name} 的` : "";

  if (profileRecords.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
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
      </div>
      <button class="btn btn-secondary" onclick="viewRecordDetails('${rec.id}')">查看详情</button>
    `;
    container.appendChild(card);
  });
}

function viewRecordDetails(recordId) {
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
  const checkedInput = document.querySelector('input[name="credit-pkg"]:checked');
  if (!checkedInput) {
    alert("请选择要开通的权益包");
    return;
  }

  const amount = parseInt(checkedInput.value, 10);
  const pkgName = checkedInput.getAttribute("data-name");

  // Simulate payment processing
  alert(`【模拟支付成功】\n已成功购买：${pkgName}\n解读次数增加：+${amount}次`);
  
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
});
