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
   Base64 (DataURL) helper
   ========= */
function readFileAsDataURL(file){
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const r = new FileReader();
    r.onload = () => resolve(r.result); // data:image/...;base64,...
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* =========
   Profile UI
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

  const companyHidden = document.querySelector('input[name="company"]');
  const agentHidden = document.querySelector('input[name="agent"]');

  const applyProfileToUI = (p) => {
    profileText.textContent = `${p.company} / ${p.agent}`;
    if (companyHidden) companyHidden.value = p.company;
    if (agentHidden) agentHidden.value = p.agent;
  };

  const p = loadProfile();
  if (p) {
    applyProfileToUI(p);
  } else {
    profileText.textContent = "Not set";
    if (companyHidden) companyHidden.value = "";
    if (agentHidden) agentHidden.value = "";
  }

  editBtn?.addEventListener("click", () => {
    msg.textContent = "";
    const current = loadProfile();
    companyInput.value = current?.company || (companyHidden?.value || "");
    agentInput.value = current?.agent || (agentHidden?.value || "");
    editor.style.display = "block";
  });

  cancelBtn?.addEventListener("click", () => {
    msg.textContent = "";
    editor.style.display = "none";
  });

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
   SN/TV 모드 UI 토글 (Text <-> Photo)
   ========= */
function setupSnTvModeUI(){
  const snText = $("device_sn");
  const snPhotoWrap = $("snPhotoWrap");
  const snPhoto = $("sn_photo");
  const snHint = $("snPhotoHint");

  const tvTextWrap = $("tvTextWrap");
  const tvId = $("teamviewer_id");
  const tvPw = $("teamviewer_pw");
  const tvPhotoWrap = $("tvPhotoWrap");
  const tvPhoto = $("tv_photo");
  const tvHint = $("tvPhotoHint");

  const getRadioValue = (name) =>
    document.querySelector(`input[name="${name}"]:checked`)?.value;

  function applyModes(){
    const snMode = getRadioValue("sn_mode") || "text";
    const tvMode = getRadioValue("tv_mode") || "text";

    // SN
    if (snMode === "text") {
      snText.required = true;
      if (snPhoto) snPhoto.required = false;
      if (snPhotoWrap) snPhotoWrap.style.display = "none";
    } else {
      snText.required = false;
      if (snPhoto) snPhoto.required = true;
      if (snPhotoWrap) snPhotoWrap.style.display = "block";
    }

    // TeamViewer
    if (tvMode === "text") {
      tvId.required = true;
      tvPw.required = true;
      if (tvPhoto) tvPhoto.required = false;
      if (tvTextWrap) tvTextWrap.style.display = "block";
      if (tvPhotoWrap) tvPhotoWrap.style.display = "none";
    } else {
      tvId.required = false;
      tvPw.required = false;
      if (tvPhoto) tvPhoto.required = true;
      if (tvTextWrap) tvTextWrap.style.display = "none";
      if (tvPhotoWrap) tvPhotoWrap.style.display = "block";
    }
  }

  document.querySelectorAll('input[name="sn_mode"]').forEach(r => r.addEventListener("change", applyModes));
  document.querySelectorAll('input[name="tv_mode"]').forEach(r => r.addEventListener("change", applyModes));

  snPhoto?.addEventListener("change", () => {
    snHint.textContent = snPhoto.files?.[0] ? `Selected: ${snPhoto.files[0].name}` : "";
  });
  tvPhoto?.addEventListener("change", () => {
    tvHint.textContent = tvPhoto.files?.[0] ? `Selected: ${tvPhoto.files[0].name}` : "";
  });

  applyModes();
}

function resetSnTvUI(){
  // 라디오 기본값(text)로 복귀
  const snTextRadio = document.querySelector('input[name="sn_mode"][value="text"]');
  const tvTextRadio = document.querySelector('input[name="tv_mode"][value="text"]');
  if (snTextRadio) snTextRadio.checked = true;
  if (tvTextRadio) tvTextRadio.checked = true;

  // 힌트 제거
  if ($("snPhotoHint")) $("snPhotoHint").textContent = "";
  if ($("tvPhotoHint")) $("tvPhotoHint").textContent = "";

  // 모드 반영
  setupSnTvModeUI();
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
      const editor = $("profileEditor");
      if (editor) editor.style.display = "block";
      return;
    }

    // required 검사
    if (!form.checkValidity()) {
      status.classList.add("error");
      status.textContent = "Please fill all required fields.";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending...";

    // 모드
    const snMode = document.querySelector('input[name="sn_mode"]:checked')?.value || "text";
    const tvMode = document.querySelector('input[name="tv_mode"]:checked')?.value || "text";

    // 사진(DataURL)
    const snPhotoFile = $("sn_photo")?.files?.[0] || null;
    const tvPhotoFile = $("tv_photo")?.files?.[0] || null;

    const deviceSnPhotoDataUrl = await readFileAsDataURL(snPhotoFile);
    const teamviewerPhotoDataUrl = await readFileAsDataURL(tvPhotoFile);

    const templateParams = {
      company,
      agent,
      country: $("country").value,
      clinic_name: $("clinic_name").value,
      clinic_address: $("clinic_address").value,
      clinic_phone: $("clinic_phone").value,
      dentist_name: $("dentist_name").value,
      device_name: $("device_name").value,

      // 텍스트(모드에 따라 빈 값일 수 있음)
      device_sn: $("device_sn").value || "",
      teamviewer_id: $("teamviewer_id")?.value || "",
      teamviewer_pw: $("teamviewer_pw")?.value || "",

      // 모드 + 사진
      sn_mode: snMode,
      tv_mode: tvMode,
      device_sn_photo_dataurl: deviceSnPhotoDataUrl,
      teamviewer_photo_dataurl: teamviewerPhotoDataUrl,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        { publicKey: EMAILJS_PUBLIC_KEY }
      );

      status.textContent = "OK. Email sent.";

      // reset (프로필 hidden 값은 유지)
      form.reset();

      // select 기본값 복귀
      $("country").value = "";
      $("device_name").value = "";

      // 프로필 hidden 값 다시 적용 (reset이 기본값으로 되돌릴 수 있어서)
      const p = loadProfile();
      if (p) {
        document.querySelector('input[name="company"]').value = p.company;
        document.querySelector('input[name="agent"]').value = p.agent;
      }

      // 모드 UI 초기화
      resetSnTvUI();

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
setupSnTvModeUI();
setupEmailJS();
registerSW();
