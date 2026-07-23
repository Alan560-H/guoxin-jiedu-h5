const ACCOUNT_KEY = "guoxin-recharge-account";
const MEMBERSHIP_KEY = "guoxin-recharge-membership";
const COUNTDOWN_KEY = "guoxin-recharge-countdown";

function resetRechargeIfRequested() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("reset") !== "1") return;
  [ACCOUNT_KEY, MEMBERSHIP_KEY, COUNTDOWN_KEY].forEach((key) => {
    try { window.localStorage.removeItem(key); } catch { /* session-only fallback */ }
  });
  url.searchParams.delete("reset");
  window.history.replaceState({}, "", url);
}

resetRechargeIfRequested();

const plans = Array.from(document.querySelectorAll("[data-plan]"));
let selectedPlan = plans.find((plan) => plan.classList.contains("selected")) || plans[0];
let account = readJson(ACCOUNT_KEY);
let membership = readJson(MEMBERSHIP_KEY) || { expiresAt: 0, reportCredits: 0 };
let codeCountdown = 0;
let codeTimer;

function readJson(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The current H5 session can continue if persistent storage is unavailable.
  }
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatPhone(value) {
  const phone = digits(value).slice(0, 11);
  return phone.replace(/(\d{3})(?=\d)/, "$1 ").replace(/(\d{4})(?=\d)/, "$1 ");
}

function maskPhone(value) {
  const phone = digits(value);
  return phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : phone;
}

function currentPlan() {
  return {
    sku: selectedPlan.dataset.sku,
    name: selectedPlan.dataset.name,
    price: selectedPlan.dataset.price,
    original: selectedPlan.dataset.original,
    days: Number(selectedPlan.dataset.days),
    reports: Number(selectedPlan.dataset.reports),
  };
}

function renderPlan() {
  plans.forEach((plan) => {
    const selected = plan === selectedPlan;
    plan.classList.toggle("selected", selected);
    plan.setAttribute("aria-pressed", selected ? "true" : "false");
  });
  const plan = currentPlan();
  document.querySelector("[data-checkout-price]").textContent = `¥${plan.price}`;
  document.querySelector("[data-checkout-original]").textContent = `¥${plan.original}`;
  document.querySelector("[data-checkout-label]").textContent = account ? "实付金额" : "待支付";
  document.querySelector("[data-checkout-button]").textContent = account ? `微信支付 ¥${plan.price}` : "登录后开通";
}

function renderAccount() {
  const title = document.querySelector("[data-account-title]");
  const copy = document.querySelector("[data-account-copy]");
  const avatar = document.querySelector("[data-account-avatar]");
  const accountButtons = document.querySelectorAll("[data-account-button], .recharge-account-action");
  if (!account?.phone) {
    title.textContent = "尚未绑定手机号";
    copy.textContent = "先选套餐，支付前完成账号绑定";
    avatar.textContent = "未";
    accountButtons.forEach((button) => { button.textContent = button.classList.contains("recharge-account-action") ? "登录" : "绑定"; });
  } else {
    title.textContent = maskPhone(account.phone);
    copy.textContent = membership.expiresAt > Date.now() ? `会员有效至 ${formatDate(membership.expiresAt)}` : "充值后权益将保存在该账号";
    avatar.textContent = account.phone.slice(-1);
    accountButtons.forEach((button) => { button.textContent = button.classList.contains("recharge-account-action") ? "账号" : "切换"; });
  }
  renderPlan();
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function openSheet(name) {
  document.querySelector("[data-overlay]").hidden = false;
  document.querySelectorAll("[data-sheet]").forEach((sheet) => { sheet.hidden = sheet.dataset.sheet !== name; });
  document.body.classList.add("recharge-modal-open");
  if (name === "login") {
    const phoneInput = document.querySelector("[data-phone-input]");
    phoneInput.value = account?.phone ? formatPhone(account.phone) : "";
    window.setTimeout(() => phoneInput.focus(), 80);
  }
}

function closeSheets() {
  document.querySelector("[data-overlay]").hidden = true;
  document.querySelectorAll("[data-sheet]").forEach((sheet) => { sheet.hidden = true; });
  document.body.classList.remove("recharge-modal-open");
}

function showToast(message) {
  const toast = document.querySelector("[data-recharge-toast]");
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2200);
}

function showLoginError(message) {
  const error = document.querySelector("[data-login-error]");
  error.textContent = message;
  error.hidden = !message;
}

function startCodeCountdown() {
  const button = document.querySelector("[data-send-code]");
  codeCountdown = 60;
  button.disabled = true;
  button.textContent = `${codeCountdown}s`;
  window.clearInterval(codeTimer);
  codeTimer = window.setInterval(() => {
    codeCountdown -= 1;
    if (codeCountdown <= 0) {
      window.clearInterval(codeTimer);
      button.disabled = false;
      button.textContent = "重新获取";
      return;
    }
    button.textContent = `${codeCountdown}s`;
  }, 1000);
}

function preparePayment() {
  const plan = currentPlan();
  document.querySelector("[data-payment-plan-name]").textContent = plan.name;
  document.querySelector("[data-payment-account]").textContent = maskPhone(account.phone);
  document.querySelector("[data-payment-days]").textContent = `${plan.days} 天`;
  document.querySelector("[data-payment-reports]").textContent = `${plan.reports} 次`;
  document.querySelector("[data-payment-original]").textContent = `¥${plan.original}`;
  document.querySelector("[data-payment-price]").textContent = `¥${plan.price}`;
  document.querySelector("[data-confirm-payment]").textContent = `确认微信支付 ¥${plan.price}`;
  openSheet("payment");
}

function completePayment() {
  const plan = currentPlan();
  const base = Math.max(Date.now(), Number(membership.expiresAt) || 0);
  membership = {
    sku: plan.sku,
    name: plan.name,
    expiresAt: base + plan.days * 24 * 60 * 60 * 1000,
    reportCredits: (Number(membership.reportCredits) || 0) + plan.reports,
    updatedAt: Date.now(),
  };
  writeJson(MEMBERSHIP_KEY, membership);
  renderAccount();
  document.querySelector("[data-success-copy]").textContent = `已开通${plan.name}，有效至 ${formatDate(membership.expiresAt)}`;
  document.querySelector("[data-success-account]").textContent = maskPhone(account.phone);
  document.querySelector("[data-success-reports]").textContent = `+${plan.reports} 次`;
  openSheet("success");
}

function initCountdown() {
  let end = Number(window.localStorage.getItem(COUNTDOWN_KEY));
  if (!end || end <= Date.now()) {
    end = Date.now() + 5 * 60 * 60 * 1000;
    try { window.localStorage.setItem(COUNTDOWN_KEY, String(end)); } catch { /* session-only fallback */ }
  }
  const node = document.querySelector("[data-recharge-countdown]");
  const tick = () => {
    let left = Math.max(0, end - Date.now());
    if (left === 0) {
      end = Date.now() + 5 * 60 * 60 * 1000;
      try { window.localStorage.setItem(COUNTDOWN_KEY, String(end)); } catch { /* session-only fallback */ }
      left = end - Date.now();
    }
    const totalSeconds = Math.floor(left / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    node.textContent = `${hours}:${minutes}:${seconds}`;
  };
  tick();
  window.setInterval(tick, 1000);
}

plans.forEach((plan) => plan.addEventListener("click", () => { selectedPlan = plan; renderPlan(); }));
document.querySelectorAll("[data-open-login]").forEach((button) => button.addEventListener("click", () => openSheet("login")));
document.querySelector("[data-phone-input]").addEventListener("input", (event) => { event.target.value = formatPhone(event.target.value); showLoginError(""); });
document.querySelector("[data-code-input]").addEventListener("input", (event) => { event.target.value = digits(event.target.value).slice(0, 6); showLoginError(""); });

document.querySelector("[data-send-code]").addEventListener("click", () => {
  const phone = digits(document.querySelector("[data-phone-input]").value);
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    showLoginError("请输入正确的 11 位手机号");
    return;
  }
  showLoginError("");
  startCodeCountdown();
  showToast(`验证码已发送至 ${maskPhone(phone)}`);
});

document.querySelector("[data-bind-account]").addEventListener("click", () => {
  const phone = digits(document.querySelector("[data-phone-input]").value);
  const code = digits(document.querySelector("[data-code-input]").value);
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    showLoginError("请输入正确的 11 位手机号");
    return;
  }
  if (code.length !== 6) {
    showLoginError("请输入 6 位验证码");
    return;
  }
  account = { phone, boundAt: Date.now() };
  writeJson(ACCOUNT_KEY, account);
  renderAccount();
  preparePayment();
});

document.querySelector("[data-checkout-button]").addEventListener("click", () => {
  if (!account?.phone) openSheet("login");
  else preparePayment();
});
document.querySelector("[data-confirm-payment]").addEventListener("click", completePayment);
document.querySelector("[data-close-success]").addEventListener("click", closeSheets);
document.querySelector("[data-overlay]").addEventListener("click", closeSheets);
document.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheets));
document.querySelector("[data-recharge-back]").addEventListener("click", () => {
  if (window.history.length > 1) window.history.back();
  else window.location.href = "index.html?scene=home";
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSheets(); });

renderAccount();
initCountdown();
