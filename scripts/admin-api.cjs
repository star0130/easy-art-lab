/*
 * 로컬 전용 관리자 API (Vite 개발 서버 미들웨어)
 * ------------------------------------------------------------
 * `npm run dev`로 로컬 개발 서버를 띄운 동안에만 동작한다. 정적 빌드(dist)나
 * 배포된 사이트에는 포함되지 않는다 (vite.config.js에서 configureServer 훅으로만 등록).
 *
 * /admin 페이지가 이 API를 호출해 data-sources/recipes_source.json과
 * public/recipes/ 이미지를 직접 읽고 쓴다. 저장할 때마다 build-data.cjs를
 * 다시 실행해 src/data/recipes.json을 갱신한다.
 */
const fs = require('fs');
const path = require('path');
const { buildData, JSON_SOURCE, orderFromId } = require('./build-data.cjs');

const ROOT = path.join(__dirname, '..');
const RECIPES_IMG_DIR = path.join(ROOT, 'public', 'recipes');
const ALLOWED_IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(body);
}

function loadSource() {
  return JSON.parse(fs.readFileSync(JSON_SOURCE, 'utf-8'));
}

function saveSource(source) {
  fs.writeFileSync(JSON_SOURCE, JSON.stringify(source, null, 2), 'utf-8');
}

// '미기재' 플레이스홀더는 편집 폼에서는 빈 값으로 보여준다.
function blankIfPlaceholder(v) {
  return v === '미기재' ? '' : v;
}

function toFormShape(effective) {
  return {
    id: effective.id,
    title: effective.title,
    grades: effective.grades,
    activity_types: effective.activityTypes,
    topics: effective.topics,
    materials: effective.materialsRaw,
    prep_level: blankIfPlaceholder(effective.prepLevel),
    duration_minutes: effective.durationMinutes,
    summary: effective.summary,
    steps: effective.steps,
    tip: blankIfPlaceholder(effective.tip),
    video_url: effective.videoUrl,
    image_file: effective.imageFile,
    active: effective.active,
    // 참고용 읽기 전용 정보 (관리자 폼에서 수정하지 않음)
    _readOnly: {
      gradeEvidence: blankIfPlaceholder(effective.gradeEvidence),
      periodLabel: blankIfPlaceholder(effective.periodLabel),
      curriculumCode: blankIfPlaceholder(effective.curriculumCode),
      reviewStatus: blankIfPlaceholder(effective.reviewStatus),
      reviewMemo: effective.reviewMemo || '',
    },
  };
}

function nextId(source) {
  let maxOrder = 0;
  for (const r of source.recipes) {
    const o = orderFromId(r.id);
    if (o && o > maxOrder) maxOrder = o;
  }
  return `ART${maxOrder + 1}`;
}

const EDITABLE_FIELDS = [
  'title', 'grades', 'activity_types', 'topics', 'materials', 'prep_level',
  'duration_minutes', 'summary', 'steps', 'tip', 'video_url', 'image_file', 'active',
];

function applyPatch(entry, patch) {
  for (const key of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      entry[key] = patch[key];
    }
  }
  return entry;
}

function createAdminMiddleware() {
  return async function adminMiddleware(req, res, next) {
    if (!req.url.startsWith('/api/admin/')) return next();

    try {
      // GET /api/admin/recipes — 전체 레시피 목록(폼 입력용 형태)
      if (req.method === 'GET' && req.url === '/api/admin/recipes') {
        const effective = buildData({ silent: true });
        return sendJson(res, 200, { recipes: effective.map(toFormShape) });
      }

      // PUT /api/admin/recipes/:id — 기존 레시피 수정
      const putMatch = req.method === 'PUT' && req.url.match(/^\/api\/admin\/recipes\/([^/]+)$/);
      if (putMatch) {
        const id = decodeURIComponent(putMatch[1]);
        const patch = JSON.parse(await readBody(req));
        const source = loadSource();
        const entry = source.recipes.find((r) => r.id === id);
        if (!entry) return sendJson(res, 404, { error: '레시피를 찾을 수 없습니다.' });
        applyPatch(entry, patch);
        saveSource(source);
        const effective = buildData({ silent: true });
        return sendJson(res, 200, { ok: true, recipes: effective.map(toFormShape) });
      }

      // POST /api/admin/recipes — 새 레시피 추가
      if (req.method === 'POST' && req.url === '/api/admin/recipes') {
        const patch = JSON.parse(await readBody(req));
        const source = loadSource();
        const id = nextId(source);
        const entry = applyPatch(
          { id, grades: [], activity_types: [], topics: [], steps: [], active: true },
          patch
        );
        source.recipes.unshift(entry);
        saveSource(source);
        const effective = buildData({ silent: true });
        return sendJson(res, 201, { ok: true, id, recipes: effective.map(toFormShape) });
      }

      // POST /api/admin/images — 이미지 업로드 (base64)
      if (req.method === 'POST' && req.url === '/api/admin/images') {
        const { filename, dataBase64 } = JSON.parse(await readBody(req));
        const ext = path.extname(filename || '').toLowerCase();
        if (!ALLOWED_IMAGE_EXT.has(ext)) {
          return sendJson(res, 400, { error: '지원하지 않는 이미지 형식입니다. (png/jpg/webp/gif/svg)' });
        }
        const safeName = `${Date.now()}_${path.basename(filename).replace(/[^\w.\-가-힣]/g, '_')}`;
        fs.mkdirSync(RECIPES_IMG_DIR, { recursive: true });
        fs.writeFileSync(path.join(RECIPES_IMG_DIR, safeName), Buffer.from(dataBase64, 'base64'));
        return sendJson(res, 200, { ok: true, filename: safeName });
      }

      return sendJson(res, 404, { error: 'Not found' });
    } catch (err) {
      console.error('[admin-api]', err);
      return sendJson(res, 500, { error: String((err && err.message) || err) });
    }
  };
}

module.exports = { createAdminMiddleware };
