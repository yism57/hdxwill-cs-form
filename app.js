/* =========
   EmailJS 설정 (본인 값)
   ========= */
const EMAILJS_PUBLIC_KEY = "ja5K0BCuskcLni0DO";
const EMAILJS_SERVICE_ID = "service_l775u5e";
const EMAILJS_TEMPLATE_ID = "template_u0wh7gm";

/* =========
   Profile 저장 키
   ========= */
const PROFILE_KEY = "hdx_cs_profile_v1";

/* =========
   국가 목록
   ========= */
const COUNTRIES = [
  "Germany","Austria","Switzerland","France","Italy","Spain","Portugal","Netherlands","Belgium","Luxembourg",
  "United Kingdom","Ireland","Denmark","Sweden","Norway","Finland","Iceland",
  "Poland","Czechia","Slovakia","Hungary","Romania","Bulgaria","Greece","Croatia","Slovenia","Serbia",
  "Bosnia and Herzegovina","Montenegro","North Macedonia",
  "Kosovo","Albania","Türkiye","Israel","Tunisia",
  "Lithuania","Latvia","Estonia","Ukraine","Moldova","Georgia"
];

function $(id){ return document.getElementById(id); }

function fillCountries(){
  const sel = $("country");
  if (!sel) return;
  // 기존 option 유지(placeholder 1개) 후 추가
  COUNTRIES.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

function loadProfile(){
  try{
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && p.company && p.agent) return p;
    return null;
  }catch{
    return null;
  }
}

function saveProfile(p){
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

/* =========
   Profile UI (prompt 차단 문제 해결)
   ========= */
function setupProfileUI(){
  const profileText = $("profileText");
  const editor = $("profileEditor");
  const editBtn = $("editProfileBtn");
  const saveBtn = $("saveProfileBtn");
  const cancelBtn = $("cancelProfileBtn");
  const companyInput = $("companyInput");
  const agentInput = $("agentInput");
  const msg = $("profileMsg");

  // hidden fields in form (EmailJS 전송용)
  const companyHidden = document.querySelector('input[name="company"]');
  const agentHidden = document.querySelector('input[name="agent"]');

  const applyProfileToUI = (p) => {
    const text = `${p.company} / ${p.agent}`;
    profileText.textContent = text;
    if (companyHidden) companyHidden.value = p.company;
    if (agentHidden) agentHidden.value = p.agent;
  };

  // 초기 로드
  const p = loadProfile();
  if (p) {
    applyProfileToUI(p);
  } else {
    profileText.textContent = "Not set";
    // hidden 값도 비워 둠 (제출 전에 반드시 저장하게 유도)
    if (companyHidden) companyHidden.value = "";
    if (agentHidden) agentHidden.value = "";
  }

  // 편집 열기
  editBtn?.addEventListener("click", () => {
    msg.textContent = "";
    const current = loadProfile();
    companyInput.value = current?.company || (companyHidden?.value || "");
    agentInput.value = current?.agent || (agentHidden?.value || "");
    editor.style.display = "block";
  });

  // 취소
  cancelBtn?.addEventListener("click", () => {
    msg.textContent = "";
    editor.style.display = "none";
  });

  // 저장
  saveBtn?.addEventListener("click", () => {
    msg.textContent = "";
    const company = companyInput.value.trim();
    const agent = agentInput.value.trim();

    if (!company || !agent) {
      msg.textContent = "Company and Agent are required.";
      return;
    }

    const newP = { company, agent };
    saveProfile(newP);
    applyProfileToUI(newP);
    editor.style.display = "none";
  });
}

/* =========
   EmailJS 전송
   ========= */
function setupEmailJS(){
  if (!window.emailjs) {
    console.error("EmailJS not loaded.");
    return;
  }

  emailjs.init(EMAILJS_PUBLIC_KEY);

  const form = $("csForm");
  const status = $("status");
  const btn = $("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.classList.remove("error");
    status.textContent = "";

    // 프로필 저장 여부 확인 (company/agent 필수)
    const company = (document.querySelector('input[name="company"]')?.value || "").trim();
    const agent = (document.querySelector('input[name="agent"]')?.value || "").trim();

    if (!company || !agent) {
      status.classList.add("error");
      status.textContent = "Please set Profile (Company / Agent) first.";
      // 편집창 열어주기
      const editor = $("profileEditor");
      if (editor) editor.style.display = "block";
      return;
    }

    if (!form.checkValidity()) {
      status.classList.add("error");
      status.textContent = "Please fill all required fields.";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending...";

    const templateParams = {
      company,
      agent,
      country: $("country").value,
      clinic_name: $("clinic_name").value,
      clinic_address: $("clinic_address").value,
      clinic_phone: $("clinic_phone").value,
      dentist_name: $("dentist_name").value,
      device_name: $("device_name").value,
      device_sn: $("device_sn").value,
      teamviewer_id: $("teamviewer_id").value,
      teamviewer_pw: $("teamviewer_pw").value,
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      status.textContent = "OK. Email sent.";
      form.reset();
      $("country").value = "";
      $("device_name").value = "";
    } catch (err) {
  console.error("EmailJS error:", err);

  const reason =
    err?.text ||
    err?.message ||
    (typeof err === "string" ? err : JSON.stringify(err));

  status.classList.add("error");
  status.textContent = `Failed to send: ${reason}`;
} finally {

      btn.disabled = false;
      btn.textContent = "Submit";
    }
  });
}

/* =========
   Service Worker 등록
   ========= */
function registerSW(){
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(console.error);
}

/* init */
fillCountries();
setupProfileUI();
setupEmailJS();
registerSW();
