/* 우클링 하루연애 — 신청 폼 로직
   - CONFIG 한 곳에서 회차/키를 관리한다.
   - Web3Forms 호출은 submitApplication() 안에만 둔다 (나중에 이 함수만 교체).
   - 신청 성공 시에만 메타 픽셀 Lead 를 쏜다.
*/

/* ===================== CONFIG (여기만 수정) ===================== */
const CONFIG = {
  // Web3Forms 액세스 키. 대시보드에서 발급받아 넣는다. (공개돼도 되는 값)
  WEB3FORMS_KEY: "90e5c40b-58b7-4049-a370-97a65890beba",

  // 메타 픽셀 ID (참조용). 실제 init/PageView 는 index.html <head> 에서 이 ID 로 실행된다.
  // 변경 시 <head> 의 fbq('init') 값과 <noscript> 를 함께 바꿀 것.
  PIXEL_ID: "1087820957038013",

  // 현재 모집 회차. 회차가 바뀌면 이 숫자만 바꾼다.
  ROUND: 1,

  // 완료 화면에서 유도할 우클링 인스타 주소.
  INSTAGRAM_URL: "https://www.instagram.com/ucling.official/",
};
/* =============================================================== */

const ROUND_LABEL = `${CONFIG.ROUND}회차`; // 예: "1회차"

/* 메타 픽셀 init + PageView 는 index.html <head> 에 인라인으로 있다 (표준 설치).
   여기서는 신청 성공 시 Lead 만 쏜다. 픽셀 ID 변경은 <head> 의 fbq('init') 값을 수정. */

/* ---------- 회차 텍스트 반영 ---------- */
document.getElementById("roundBadge").textContent =
  `우클링 하루연애 ${ROUND_LABEL} 신청`;
document.getElementById("roundLead").textContent =
  `지금은 ${ROUND_LABEL}를 모집 중이에요.`;
const instaCta = document.getElementById("instaCta");
if (instaCta) instaCta.href = CONFIG.INSTAGRAM_URL;

/* ---------- 저장 로직 (교체 지점) ----------
   나중에 Apps Script / 백엔드로 바꿀 땐 이 함수 내부만 수정한다.
   성공하면 resolve, 실패하면 throw. */
async function submitApplication(data) {
  const payload = {
    access_key: CONFIG.WEB3FORMS_KEY,
    subject: `[우클링 하루연애] ${ROUND_LABEL} 신청 — ${data["닉네임"] || ""}`,
    회차: ROUND_LABEL, // 숨은 값: 회차별로 신청을 구분
    ...data,
  };

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok || !result.success) {
    throw new Error(result.message || "제출에 실패했습니다.");
  }
  return result;
}

/* ---------- 폼 검증 ---------- */
const form = document.getElementById("applyForm");
const errorBox = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
  errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}
function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
}

function collect() {
  // 시간대: 복수 선택 → 문자열로 합침
  const times = Array.from(
    form.querySelectorAll('input[name="시간대"]:checked')
  ).map((el) => el.value);

  return {
    닉네임: form.nickname.value.trim(),
    나이: form.age.value.trim(),
    성별: (form.querySelector('input[name="성별"]:checked') || {}).value || "",
    MBTI: form.mbti.value,
    관심클래스:
      (form.querySelector('input[name="관심클래스"]:checked') || {}).value || "",
    활동지역: form.region.value.trim(),
    시간대: times.join(", "),
    원하는상대: form.wish.value.trim(),
    연락처: form.contact.value.trim(),
    인스타: form.insta.value.trim(),
    개인정보동의: form.agree.checked ? "동의" : "",
    _시간대개수: times.length, // 검증용 (전송에는 무의미하지만 남겨도 무방)
  };
}

function validate(d) {
  if (!d.닉네임) return "닉네임을 입력해주세요.";
  if (!d.나이) return "나이를 입력해주세요.";
  if (Number(d.나이) < 18) return "만 18세 이상만 신청할 수 있어요.";
  if (!d.성별) return "성별을 선택해주세요.";
  if (!d.MBTI) return "MBTI를 선택해주세요.";
  if (!d.관심클래스) return "관심 클래스 결을 선택해주세요.";
  if (!d.활동지역) return "활동 지역을 입력해주세요.";
  if (d._시간대개수 === 0) return "가능한 시간대를 하나 이상 선택해주세요.";
  if (!d.연락처) return "연락처를 입력해주세요.";
  if (!d.개인정보동의) return "개인정보 수집·이용에 동의해주세요. (필수)";
  return null;
}

/* ---------- 제출 ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  // 허니팟: 봇이 채우면 조용히 무시
  if (form.botcheck && form.botcheck.checked) return;

  const data = collect();
  const err = validate(data);
  if (err) {
    showError(err);
    return;
  }

  delete data._시간대개수; // 전송 데이터에서 검증용 필드 제거

  submitBtn.disabled = true;
  submitBtn.textContent = "보내는 중…";

  try {
    await submitApplication(data);

    // 성공한 순간에만 Lead 발사 (전환 추적의 핵심)
    if (typeof fbq === "function") {
      fbq("track", "Lead");
    }

    // 폼 → 완료 화면
    document.getElementById("apply").hidden = true;
    const done = document.getElementById("done");
    done.hidden = false;
    done.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err2) {
    showError("제출 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.");
    submitBtn.disabled = false;
    submitBtn.textContent = "신청하기";
  }
});
