# EASY ART LAB — 오늘 뭐 그리지?

화성오산 이지미술 교육연구회가 검토한 초등 미술수업을, 간단한 취향 테스트로 추천해주는 반응형 웹앱입니다.
로그인 없이 누구나 1~2분 안에 테스트를 마치고, 수업 레시피 이미지를 확인·다운로드·인쇄할 수 있습니다.

## 실행 방법

```bash
npm install
npm run dev        # 개발 서버 (http://localhost:5173)
npm run build       # 데이터 재생성 + 프로덕션 빌드 (dist/ 생성)
```

빌드된 `dist/` 폴더는 정적 호스팅(예: Netlify, GitHub Pages, 사내 웹서버)에 그대로 올리면 됩니다.
단, 클라이언트 라우팅(React Router)을 쓰므로 **모든 경로를 `index.html`로 돌려주는 SPA fallback 설정**이 필요합니다
(Netlify는 `_redirects` 파일에 `/* /index.html 200`, Apache는 `.htaccess`, nginx는 `try_files` 설정).

## 폴더 구조

```
data-sources/              # 원본 자료 (연구회가 검토한 데이터) — 여기만 고치면 됨
  recipes_source.json      # 레시피 기본 정보 (학년/활동유형/주제/준비물/요약/영상 URL 등)
  recipe_db_final.xlsx     # "대표 레시피 20개" 등 상세 시트 (활동순서/지도팁/성취기준/검토상태)

scripts/
  build-data.cjs           # 위 두 소스를 원본순서(ID) 기준으로 합쳐 src/data/recipes.json을 생성

src/
  data/recipes.json         # ⚠️ 자동 생성 파일 — 직접 수정하지 말 것 (npm run build:data로 재생성)
  lib/
    config.js                # 추천 가중치, 선택지 목록(학년/활동유형/주제/재료/준비부담/수업시간)
    recommend.js              # 규칙 기반 추천 엔진 (순수 함수, 생성형 AI 미사용)
    images.js                 # 캐릭터·레시피 이미지 경로 관리
  components/                # 공용 UI 컴포넌트
  pages/                      # 화면 (시작/테스트/결과/오늘의 수업뽑기/인쇄)

public/
  characters/                 # 이지미술 공식 캐릭터 PNG 7종 (원본 그대로, 수정 금지)
  recipes/                    # 레시피 이미지 업로드 위치 + placeholder.svg
```

## 새 수업(레시피) 추가하는 방법 — 코드 수정 불필요

1. `data-sources/recipes_source.json`에 레시피를 추가하거나, 연구회의 최종 검토 엑셀
   (`data-sources/recipe_db_final.xlsx`의 "대표 레시피 20개" 시트)에 행을 추가합니다.
   - `id`는 `ART123`처럼 숫자를 포함해야 하며, 이 숫자가 엑셀의 "원본순서"와 매칭됩니다.
   - `activity_types` / `topics`는 `src/lib/config.js`에 정의된 값만 사용해야 추천에 반영됩니다.
2. 레시피 이미지가 있다면 `public/recipes/`에 올리고, 소스 JSON의 `image_file`에 파일명을 적습니다.
   비워두면 자동으로 기본 안내 이미지가 표시됩니다.
3. `npm run build:data`를 실행해 `src/data/recipes.json`을 다시 생성합니다.
4. 끝입니다 — 추천 엔진과 화면 코드는 레시피 개수나 내용과 무관하게 동작합니다.

추천 알고리즘의 가중치(학년/활동유형/준비물/주제/준비부담·시간 우선순위)를 바꾸고 싶다면
`src/lib/config.js`의 `RECOMMEND_WEIGHTS`만 수정하면 됩니다.

## 추천 알고리즘 메모

- 생성형 AI를 쓰지 않는 규칙 기반 점수 방식입니다 (`src/lib/recommend.js`).
- 수업 시간이나 준비 난이도가 **미확인(미기재)**인 레시피는 감점하지 않고 중립 점수를 줘서,
  "미기재 = 제외"가 되지 않도록 했습니다.
- 정확히 맞는 학년 자료가 없으면 점수가 가장 높은 레시피를 "조건을 완화한 대안"으로 보여주고,
  그 사실을 화면에 안내합니다.
- 대안 2개는 가능하면 1순위 추천과 다른 활동유형·주제를 우선 보여줘 다양성을 확보합니다.

## 알려진 제한사항 (후속 작업 필요)

- 현재 20개 레시피 모두 `image_file`이 비어 있어 레시피 이미지는 기본 안내 이미지로 표시됩니다.
  연구회에서 실제 이미지를 등록하면 바로 반영됩니다.
- 일부 레시피는 "실제 수업시간"이 아직 확인되지 않아 "미확인"으로 표시됩니다(임의로 추정하지 않음).
- "반영 상태"가 "자료 반영(일부 확인 필요)"인 레시피는 결과 화면에 "자료 검토 진행 중" 배지로 표시됩니다.
- 관리자 화면·Google Sheets 연동은 이번 1차 버전에는 포함하지 않았습니다. 데이터 소스 분리 구조
  (`data-sources/` → `build-data.cjs` → `src/data/recipes.json`) 덕분에, 추후 Google Sheets에서
  데이터를 받아와 같은 형식의 `recipes.json`을 생성하도록 `build-data.cjs`만 교체하면 됩니다.
