/* 우클링 하루연애 — 구글 시트 자동수집 (Google Apps Script)
 *
 * 역할: 신청 폼(app.js sendToSheet)이 보내는 JSON을 받아 시트에 한 줄씩 append.
 *   - "전체" 탭: 모든 신청.
 *   - "{회차} {성별}" 탭: 예) "1회차 남", "1회차 여" — 매칭용 자동 분류.
 *   - 시간대 6칸: 가능한 시간대만 색칠(여=핑크, 남=파랑). 그 외 셀은 색 없음.
 *
 * 코드를 고쳤으면 반드시 재배포:
 *   배포 → 배포 관리 → ✏️ → 버전 "새 버전" → 배포  (URL 그대로 유지)
 */

var HEADERS = [
  '타임스탬프', '회차', '닉네임', '나이', '성별', 'MBTI',
  '관심클래스', '활동지역', '예산', '시간대',
  '내취향', '원하는상대', '연락처', '인스타',
  '개인정보동의', '후기동의',
];

/* 시간대 6칸. h=열 제목(날짜), v=폼이 저장하는 실제 값. */
var SLOTS = [
  { h: '10/2 낮', v: '금(10/2) 낮' },
  { h: '10/2 밤', v: '금(10/2) 저녁' },
  { h: '10/3 낮', v: '토(10/3) 낮' },
  { h: '10/3 밤', v: '토(10/3) 저녁' },
  { h: '10/4 낮', v: '일(10/4) 낮' },
  { h: '10/4 밤', v: '일(10/4) 저녁' },
];

var FULL_HEADERS = HEADERS.concat(SLOTS.map(function (s) { return s.h; }));

/* 시간대 색칠 색: 여=핑크, 남=파랑. (그 외 성별은 회색) */
var GENDER_COLORS = { '여': '#F4B7C6', '남': '#A9CBEA' };
var DEFAULT_SLOT_COLOR = '#D9D9D9';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    appendRow_(data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function appendRow_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var round = String(data['회차'] || '').trim() || '미분류';
  var gender = String(data['성별'] || '').trim() || '미분류';
  writeRow_(getOrCreateSheet_(ss, '전체'), data, gender);
  writeRow_(getOrCreateSheet_(ss, round + ' ' + gender), data, gender);
}

function writeRow_(sheet, data, gender) {
  var base = HEADERS.map(function (key) {
    if (key === '타임스탬프') {
      return data['타임스탬프'] ? data['타임스탬프'] : new Date();
    }
    return data[key] != null ? data[key] : '';
  });
  sheet.appendRow(base.concat(SLOTS.map(function () { return ''; })));
  colorRow_(sheet, sheet.getLastRow(), data, gender);
}

/* 시간대 칸만 색칠: 가능한 시간대 = 성별색(여 핑크 / 남 파랑). 기본칸은 색 없음. */
function colorRow_(sheet, r, data, gender) {
  var times = String(data['시간대'] || '');
  var color = GENDER_COLORS[gender] || DEFAULT_SLOT_COLOR;
  var startCol = HEADERS.length + 1;
  var bg = SLOTS.map(function (s) {
    return times.indexOf(s.v) !== -1 ? color : null;
  });
  sheet.getRange(r, startCol, 1, SLOTS.length).setBackgrounds([bg]);
}

function getOrCreateSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  ensureHeader_(sheet);
  return sheet;
}

function ensureHeader_(sheet) {
  var n = FULL_HEADERS.length;
  var firstOk = sheet.getLastRow() >= 1 && sheet.getRange(1, 1).getValue() === FULL_HEADERS[0];
  var lastOk = sheet.getLastRow() >= 1 && sheet.getRange(1, n).getValue() === FULL_HEADERS[n - 1];
  if (firstOk && lastOk) return;
  if (!firstOk && sheet.getLastRow() >= 1) sheet.insertRowBefore(1);
  sheet.getRange(1, 1, 1, n).setValues([FULL_HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* =====================================================================
 * (1회 실행) 이미 들어간 모든 탭을 새 규칙으로 재정리:
 *   - 기존 셀 색칠 전부 지우기(기본칸 성별색 등)
 *   - 시간대 칸만 성별색(여 핑크/남 파랑)으로 다시 색칠
 * 편집기에서 reformatAllTabs 선택 → 실행.
 * ===================================================================== */
function reformatAllTabs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheets().forEach(function (sheet) {
    if (sheet.getLastRow() < 1) return;
    if (sheet.getRange(1, 1).getValue() !== '타임스탬프') return;

    sheet.getRange(1, 1, 1, FULL_HEADERS.length).setValues([FULL_HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setConditionalFormatRules([]);

    var last = sheet.getLastRow();
    if (last < 2) return;

    // 데이터 영역 색칠 전부 초기화 → 시간대 칸만 다시 색칠
    sheet.getRange(2, 1, last - 1, FULL_HEADERS.length).setBackground(null);
    var vals = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
    for (var i = 0; i < vals.length; i++) {
      var data = {};
      for (var c = 0; c < HEADERS.length; c++) data[HEADERS[c]] = vals[i][c];
      colorRow_(sheet, 2 + i, data, String(data['성별'] || '').trim());
    }
  });
  SpreadsheetApp.flush();
  Logger.log('재정리 완료');
}
