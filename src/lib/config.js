// 추천 알고리즘 설정 — 데이터/화면 코드를 건드리지 않고 이 파일만 수정해 가중치를 조정할 수 있다.
export const RECOMMEND_WEIGHTS = {
  grade: 40, // 1순위: 학년 일치
  activityType: 25, // 2순위: 선호 활동 유형 일치
  materials: 15, // 3순위: 사용 가능한 준비물 일치
  topics: 15, // 4순위: 수업의 교육적 목적(관심 경험) 일치
  prepAndDuration: 5, // 5순위: 준비 부담 및 수업 시간 조건
};

export const GRADES = [1, 2, 3, 4, 5, 6];

export const ACTIVITY_TYPES = [
  '그리기·회화',
  '조형·입체 표현',
  '공예·만들기',
  '디자인',
  '사진·영상',
  '디지털 미술·에듀테크',
  '감상·비평',
  '융합미술',
];

export const TOPICS = [
  '자연·계절',
  '환경·생태',
  '우리 동네·지역',
  '생활·일상',
  '인물·자화상',
  '동물·식물',
  '감정·상상',
  '전통문화·국가유산',
  '시각문화·미디어',
  '사회·공동체·참여',
  '이야기·문학',
  '과학·미래',
  '무늬·패턴',
];

export const MATERIAL_TAGS = [
  { key: '종이류', label: '종이류 (도화지·색종이 등)' },
  { key: '채색도구', label: '채색도구 (물감·색연필 등)' },
  { key: '가위·풀·테이프', label: '가위·풀·테이프' },
  { key: '점토·클레이', label: '점토·클레이' },
  { key: '디지털기기', label: '태블릿·스마트기기' },
  { key: '재활용품', label: '재활용품 (우유갑·철사 등)' },
  { key: '사진자료', label: '사진 자료/인쇄물' },
];

export const PREP_LEVELS = [
  { key: '하', label: '간단하게 (준비물 적게)' },
  { key: '중', label: '보통' },
  { key: '상', label: '정성껏 (준비물 많아도 OK)' },
];

export const DURATION_BUCKETS = [
  { key: 'short', label: '40분 이내 (1차시)', max: 40 },
  { key: 'medium', label: '80분 (2차시)', max: 80 },
  { key: 'long', label: '2차시 이상', max: Infinity },
  { key: 'any', label: '상관없어요', max: null },
];
