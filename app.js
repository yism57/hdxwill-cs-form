/* =========
   EmailJS 설정 (여기 3개만 본인 값으로 바꾸세요)
   ========= */
const EMAILJS_PUBLIC_KEY = "ja5K0BCuskcLni0DO";
const EMAILJS_SERVICE_ID = "service_l775u5e";
const EMAILJS_TEMPLATE_ID = "template_u0wh7gm";

/* =========
   국가 목록 (유럽 + 요청국 포함)
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
  COUNTRIES.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

/* =========
   Profile 편집 (회사/에이전트 값도 같이 바꿈)
   ========= */
function setupProfileEdit(){
  const btn = $("editProfileBtn");
  btn.addEventListener("click", () => {
    const currentCompany = $("company").value || "HDX";
    const currentAgent = $("agent").value || "SM";

    const company = prompt("Company (for email):", currentCompany);
    if (company === null) return;

    const agent = prompt("Agent (for email):", currentAgent);
    if (agent === null) return;

    $("company").value = company.trim() || currentCompany;
    $("agent").value = agent.trim() || currentAgent;

    $("profileText").textContent = `${$("company").value} / ${$("agent").value}`;
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

    // 필수값 체크 (브라우저 기본 validation + 추가 안전)
    if (!form.checkValidity()) {
      status.classList.add("error");
      status.textContent = "Please fill all required fields.";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending...";

    // 템플릿 변수명 = name 속성 그대로 사용
    const templateParams = {
      company: $("company").value,
      agent: $("agent").value,

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

      // reset 후 드롭다운 placeholder로 되돌림
      $("country").value = "";
      $("device_name").value = "";
    } catch (err) {
      console.error(err);
      status.classList.add("error");
      status.textContent = "Failed to send. Check EmailJS keys / template variables.";
    } finally {
      btn.disabled = false;
      btn.textContent = "Submit";
    }
  });
}

/* =========
   Service Worker 등록 (PWA)
   ========= */
function registerSW(){
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(console.error);
}

/* init */
fillCountries();
setupProfileEdit();
setupEmailJS();
registerSW();
