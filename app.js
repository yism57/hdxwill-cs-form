const PROFILE_KEY = "cs_intake_profile_v1";

/**
 * EmailJS IDs (여기 3개만 너의 값으로 교체하면 됨)
 * - EmailJS docs: init(publicKey) + sendForm(serviceID, templateID, form) :contentReference[oaicite:3]{index=3}
 */
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

function getProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (p.company && p.agent) return p;
    return null;
  } catch {
    return null;
  }
}

function setProfile(p) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

document.addEventListener("DOMContentLoaded", () => {
  // Init EmailJS
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const profileText = document.getElementById("profileText");
  const profileForm = document.getElementById("profileForm");
  const editProfileBtn = document.getElementById("editProfileBtn");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const companyName = document.getElementById("companyName");
  const agentName = document.getElementById("agentName");
  const profileMsg = document.getElementById("profileMsg");

  const intakeForm = document.getElementById("intakeForm");
  const submitMsg = document.getElementById("submitMsg");
  const submitBtn = document.getElementById("submitBtn");

  // Load profile on startup
  const p = getProfile();
  if (p) {
    profileText.textContent = `${p.company} / ${p.agent}`;
    profileForm.style.display = "none";
  } else {
    profileText.textContent = "Not set";
    profileForm.style.display = "block";
  }

  // Edit profile
  editProfileBtn.addEventListener("click", () => {
    const current = getProfile();
    if (current) {
      companyName.value = current.company;
      agentName.value = current.agent;
    }
    profileForm.style.display = "block";
    profileMsg.textContent = "";
  });

  // Save profile
  saveProfileBtn.addEventListener("click", () => {
    const company = companyName.value.trim();
    const agent = agentName.value.trim();

    if (!company || !agent) {
      profileMsg.textContent = "Company Name and Agent Name are required.";
      return;
    }

    setProfile({ company, agent });
    profileText.textContent = `${company} / ${agent}`;
    profileForm.style.display = "none";
    profileMsg.textContent = "";
  });

  // Submit via EmailJS
  intakeForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // EmailJS로 보낼 거라 기본 submit 막음

    const prof = getProfile();
    if (!prof) {
      submitMsg.style.color = "#b00020";
      submitMsg.textContent = "Please set Profile (Company/Agent) first.";
      profileForm.style.display = "block";
      return;
    }

    // hidden fields 채우기 (템플릿에서 {{company}}, {{agent}} 로 사용)
    document.getElementById("mailCompany").value = prof.company;
    document.getElementById("mailAgent").value = prof.agent;

    // 기본 검증: required는 브라우저가 해주지만, 혹시 대비해서 메시지 처리
    if (!intakeForm.checkValidity()) {
      submitMsg.style.color = "#b00020";
      submitMsg.textContent = "Please fill in all required fields.";
      return;
    }

    try {
      submitBtn.disabled = true;
      submitMsg.style.color = "#555";
      submitMsg.textContent = "Sending...";

      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, intakeForm);

      submitMsg.style.color = "#1F6F45";
      submitMsg.textContent = "Sent. Thank you!";
      intakeForm.reset(); // 폼 초기화 (Profile은 유지)
    } catch (err) {
      submitMsg.style.color = "#b00020";
      submitMsg.textContent = "Failed to send. Please try again or contact admin.";
      // 콘솔에서 원인 확인 가능
      console.error(err);
    } finally {
      submitBtn.disabled = false;
    }
  });
});
