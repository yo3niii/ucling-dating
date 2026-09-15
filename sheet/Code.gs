/* 우클링 하루연애 — 구글 시트 자동수집 (Google Apps Script)
 *
 * 역할: 신청 폼(app.js sendToSheet)이 보내는 JSON을 받아 시트에 한 줄씩 append.
 * 이메일(Web3Forms)과 병행 — 여기서 실패해도 신청 이메일은 따로 도착한다.
 *
 * 설치/배포는 SHEET-SETUP.md 참고. 요약:
 *   1) sheets.new 로 새 시트 → 확장 프로그램 → Apps Script → 이 파일 전체 붙여넣기
 *   2) 배포 → 새 배포 → 웹 앱 → 실행: 나 / 액세스: 모든 사용자 → 배포
 *   3) 나온 /exec URL 을 app.js CONFIG.SHEET_ENDPOINT 에 붙여넣기
 */

/* 시트 컬럼 순서(고정). app.js collect() 가 만드는 한글 키와 정확히 일치.
   타임스탬프만 서버(Apps Script)에서 찍는다. 순서를 바꾸면 HEADERS 만 고치면 된다. */
var HEADERS = [
  '타임스탬프', '회차', '닉네임', '나이', '성별', 'MBTI',
  '관심클래스', '활동지역', '예산', '시간대',
  '내취향', '원하는상대', '연락처', '인스타',
  '개인정보동의', '후기동의',
];

/* 신청 폼에서 오는 POST 를 받는다. */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    appendRow_(data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* data(객체) 한 건을 시트에 append. 헤더가 없으면 먼저 만든다. */
function appendRow_(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  ensureHeader_(sheet);

  var row = HEADERS.map(function (key) {
    if (key === '타임스탬프') {
      return data['타임스탬프'] ? data['타임스탬프'] : new Date();
    }
    return data[key] != null ? data[key] : '';
  });
  sheet.appendRow(row);
}

/* 1행에 헤더가 없으면 세팅(굵게 + 고정). 이미 있으면 아무것도 안 함. */
function ensureHeader_(sheet) {
  if (sheet.getLastRow() >= 1 && sheet.getRange(1, 1).getValue() === HEADERS[0]) {
    return;
  }
  sheet.insertRowBefore(1); // 기존 데이터가 있어도 위에 헤더를 끼운다
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/* JSON 응답 헬퍼. no-cors 로 오기 때문에 프런트가 읽진 않지만, 디버깅/직접 호출용. */
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* =====================================================================
 * (선택) 기존 신청자 백필 — Apps Script 편집기에서 이 함수를 1회 직접 실행.
 * Gmail 에서 제목이 "[우클링 하루연애]" 로 시작하는 Web3Forms 알림 메일을 찾아
 * 본문을 파싱해 시트에 넣는다.
 *
 * 주의: Web3Forms 이메일 본문 포맷에 의존하는 best-effort 파서다.
 * 실행 후 시트를 눈으로 확인하고, 값이 어긋나면 그 건은 손으로 고칠 것.
 * (건수가 적으면 아예 손으로 붙여넣는 게 더 빠르고 확실하다.)
 * ===================================================================== */
function backfillFromGmail() {
  var threads = GmailApp.search('subject:"[우클링 하루연애]"', 0, 200);
  var count = 0;
  threads.forEach(function (thread) {
    thread.getMessages().forEach(function (msg) {
      var subject = msg.getSubject() || '';
      if (subject.indexOf('[우클링 하루연애]') === -1) return;

      var body = msg.getPlainBody() || '';
      var parsed = parseWeb3formsBody_(body);
      if (!parsed['닉네임'] && !parsed['연락처']) return; // 파싱 실패로 보이면 건너뜀

      // 회차는 제목에서 우선 추출 (예: "[우클링 하루연애] 1회차 신청 — 닉네임")
      var m = subject.match(/(\d+\s*회차)/);
      if (m) parsed['회차'] = m[1].replace(/\s+/g, '');

      parsed['타임스탬프'] = msg.getDate(); // 메일 수신 시각으로
      appendRow_(parsed);
      count++;
    });
  });
  Logger.log('백필 완료: ' + count + '건 추가');
}

/* Web3Forms 플레인 본문에서 "라벨 → 값" 을 뽑는다.
   본문이 "라벨: 값" 또는 "라벨\n값" 형태라고 가정하고, 다음 알려진 라벨 전까지를 값으로 본다. */
function parseWeb3formsBody_(body) {
  var labels = HEADERS.filter(function (h) { return h !== '타임스탬프'; });
  var out = {};

  // "라벨" 이 나타나는 위치를 모두 찾아 구간을 나눈다.
  var positions = [];
  labels.forEach(function (label) {
    var idx = body.indexOf(label);
    while (idx !== -1) {
      positions.push({ label: label, idx: idx });
      idx = body.indexOf(label, idx + 1);
    }
  });
  positions.sort(function (a, b) { return a.idx - b.idx; });

  for (var i = 0; i < positions.length; i++) {
    var cur = positions[i];
    var start = cur.idx + cur.label.length;
    var end = i + 1 < positions.length ? positions[i + 1].idx : body.length;
    var raw = body.substring(start, end);
    // 앞의 구분자(: 공백 개행) 제거, 뒤 공백 정리
    var val = raw.replace(/^[\s:：]+/, '').replace(/\s+$/, '').trim();
    if (out[cur.label] == null || out[cur.label] === '') out[cur.label] = val;
  }
  return out;
}
