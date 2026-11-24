/*
 * 데이터 빌드 스크립트
 * ------------------------------------------------------------
 * data-sources/recipes_source.json (20개 레시피 기본 정보)과
 * data-sources/recipe_db_final.xlsx의 "대표 레시피 20개" 시트
 * (활동 순서·지도 팁·성취기준·검토 상태 등, 연구회에서 검토한 자료)를
 * 원본순서(ID) 기준으로 병합하여 src/data/recipes.json을 생성한다.
 *
 * 새 레시피를 추가하거나 수정하려면:
 *   1) data-sources/recipes_source.json 에 레시피를 추가/수정하거나
 *   2) data-sources/recipe_db_final.xlsx "대표 레시피 20개" 시트를 갱신한 뒤
 *   3) `npm run build:data` 를 다시 실행한다.
 * 추천 엔진과 화면 코드는 이 파일의 구조가 바뀌지 않는 한 수정할 필요가 없다.
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.join(__dirname, '..');
const JSON_SOURCE = path.join(ROOT, 'data-sources', 'recipes_source.json');
const XLSX_SOURCE = path.join(ROOT, 'data-sources', 'recipe_db_final.xlsx');
const OUT_PATH = path.join(ROOT, 'src', 'data', 'recipes.json');

function orderFromId(id) {
  const m = String(id).match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function splitSteps(text) {
  if (!text) return [];
  return String(text)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^\d+\.\s*/, ''));
}

const MATERIAL_TAG_RULES = [
  ['종이류', /도화지|색종이|색지|화선지|한지|A4(?!.*테이프)|16절|(^|[^A-Za-z가-힣])종이([^컵테이프]|$)/],
  ['채색도구', /물감|색연필|사인펜|네임펜|(^|[^A-Za-z가-힣])붓([^통]|$)|파스텔|채색도구|잉크펜|드로잉펜|붓펜/],
  ['가위·풀·테이프', /가위|풀|테이프|목공풀|집게|핀|자(?:,|$)|컴퍼스/],
  ['점토·클레이', /점토|클레이/],
  ['디지털기기', /태블릿|스마트기기|디지털|Canva|Google Arts|스케치북 앱|앱/],
  ['재활용품', /우유갑|철사|종이컵|모루|솜|뚜껑|아이스크림 막대/],
  ['사진자료', /사진|인쇄한/],
];

function tagMaterials(materials) {
  const tags = new Set();
  for (const m of materials) {
    for (const [tag, re] of MATERIAL_TAG_RULES) {
      if (re.test(m)) tags.add(tag);
    }
  }
  return Array.from(tags);
}

function splitMaterials(text) {
  if (!text) return [];
  let protectedText = '';
  let depth = 0;
  for (const c of text) {
    if (c === '(' || c === '（') { depth++; protectedText += c; }
    else if (c === ')' || c === '）') { depth--; protectedText += c; }
    else if (c === ',' && depth > 0) { protectedText += '\u0001'; }
    else { protectedText += c; }
  }
  return protectedText
    .split(',')
    .map((s) => s.trim().replace(/\u0001/g, ','))
    .filter(Boolean);
}

function loadXlsxByOrder() {
  const wb = XLSX.readFile(XLSX_SOURCE, { cellDates: true });
  const ws = wb.Sheets['대표 레시피 20개'];
  if (!ws) return new Map();
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const header = rows[0];
  const idx = (name) => header.indexOf(name);
  const col = {
    order: idx('원본순서'),
    grade: idx('자료 학년'),
    periodLabel: idx('차시 표기'),
    realTime: idx('실제 시간'),
    steps: idx('핵심 활동 순서'),
    tips: idx('교사 지도 팁'),
    code: idx('문서 성취기준'),
    status: idx('반영 상태'),
    memo: idx('검토 메모'),
  };
  const map = new Map();
  for (const row of rows.slice(1)) {
    const order = row[col.order];
    if (!order) continue;
    map.set(Number(order), {
      gradeEvidence: row[col.grade] || '미기재',
      periodLabel: row[col.periodLabel] || '미기재',
      realTimeNote: row[col.realTime] || '미기재',
      steps: splitSteps(row[col.steps]),
      tip: row[col.tips] || '미기재',
      curriculumCode: row[col.code] || '미기재',
      reviewStatus: row[col.status] || '미기재',
      reviewMemo: row[col.memo] || '',
    });
  }
  return map;
}

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

function buildData({ silent = false } = {}) {
  const source = JSON.parse(fs.readFileSync(JSON_SOURCE, 'utf-8'));
  const xlsxMap = loadXlsxByOrder();

  const recipes = source.recipes.map((r) => {
    const order = orderFromId(r.id);
    const extra = xlsxMap.get(order) || null;

    return {
      id: r.id,
      order,
      title: r.title,
      grades: Array.isArray(r.grades) ? r.grades : [],
      gradeEvidence: has(r, 'grade_evidence') ? r.grade_evidence : extra ? extra.gradeEvidence : '미기재',
      activityTypes: r.activity_types || [],
      topics: r.topics || [],
      materials: splitMaterials(r.materials || ''),
      materialsRaw: r.materials || '',
      materialTags: tagMaterials(splitMaterials(r.materials || '')),
      prepLevel: r.prep_level && r.prep_level.trim() ? r.prep_level.trim() : '미기재',
      durationMinutes: typeof r.duration_minutes === 'number' ? r.duration_minutes : null,
      periodLabel: has(r, 'period_label') ? r.period_label : extra ? extra.periodLabel : '미기재',
      summary: r.summary || '',
      // steps/tip 등은 한 번 관리자 페이지 등에서 직접 저장되면(JSON에 키가 생기면)
      // 그 이후로는 엑셀 원본보다 JSON 값을 우선한다.
      steps: has(r, 'steps') ? r.steps : extra ? extra.steps : [],
      tip: has(r, 'tip') ? r.tip : extra ? extra.tip : '미기재',
      curriculumCode: has(r, 'curriculum_code') ? r.curriculum_code : extra ? extra.curriculumCode : '미기재',
      reviewStatus: has(r, 'review_status') ? r.review_status : extra ? extra.reviewStatus : '미기재',
      reviewMemo: has(r, 'review_memo') ? r.review_memo : extra ? extra.reviewMemo : '',
      videoUrl: r.video_url || '',
      imageFile: r.image_file || null,
      active: r.active !== false,
    };
  });

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ recipes }, null, 2), 'utf-8');

  if (!silent) {
    console.log(`생성 완료: ${OUT_PATH} (${recipes.length}개 레시피)`);
    const withSteps = recipes.filter((r) => r.steps.length > 0).length;
    const withImage = recipes.filter((r) => r.imageFile).length;
    console.log(`- 활동 순서 확보: ${withSteps}/${recipes.length}`);
    console.log(`- 레시피 이미지 등록됨: ${withImage}/${recipes.length} (나머지는 기본 안내 이미지로 표시)`);
  }

  return recipes;
}

module.exports = { buildData, JSON_SOURCE, XLSX_SOURCE, OUT_PATH, orderFromId };

if (require.main === module) {
  buildData();
}
