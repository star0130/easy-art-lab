// 규칙 기반 추천 엔진 (순수 함수) — 생성형 AI를 사용하지 않는다.
// 새 레시피가 추가되어도 이 파일은 수정할 필요가 없다. 가중치는 config.js에서 조정한다.
import { RECOMMEND_WEIGHTS, DURATION_BUCKETS } from './config';

const PREP_ORDER = ['하', '중', '상'];

function overlapFraction(selected, target) {
  if (!selected || selected.length === 0) return { fraction: 0.5, matched: [] };
  if (!target || target.length === 0) return { fraction: 0.3, matched: [] };
  const matched = selected.filter((s) => target.includes(s));
  return { fraction: matched.length / selected.length, matched };
}

function scoreGrade(recipe, answers) {
  if (!answers.grade) return { score: RECOMMEND_WEIGHTS.grade * 0.5, matched: false, known: recipe.grades.length > 0 };
  if (recipe.grades.length === 0) {
    return { score: RECOMMEND_WEIGHTS.grade * 0.3, matched: false, known: false };
  }
  if (recipe.grades.includes(answers.grade)) {
    return { score: RECOMMEND_WEIGHTS.grade, matched: true, known: true };
  }
  // 인접 학년(한 학년 차이)에는 약간의 부분 점수를 준다.
  const nearby = recipe.grades.some((g) => Math.abs(g - answers.grade) === 1);
  return { score: nearby ? RECOMMEND_WEIGHTS.grade * 0.25 : 0, matched: false, known: true };
}

function scorePrepAndDuration(recipe, answers) {
  const prepWeight = RECOMMEND_WEIGHTS.prepAndDuration * 0.6;
  const durationWeight = RECOMMEND_WEIGHTS.prepAndDuration * 0.4;

  let prepScore = prepWeight * 0.5; // 미기재 시 중립
  let prepKnown = false;
  if (recipe.prepLevel !== '미기재' && answers.prepLevel) {
    prepKnown = true;
    const diff = Math.abs(PREP_ORDER.indexOf(recipe.prepLevel) - PREP_ORDER.indexOf(answers.prepLevel));
    if (diff === 0) prepScore = prepWeight;
    else if (diff === 1) prepScore = prepWeight * 0.4;
    else prepScore = 0;
  }

  let durationScore = durationWeight * 0.5; // 미기재 시 중립 (필수 제외 조건으로 쓰지 않음)
  let durationKnown = false;
  const bucket = DURATION_BUCKETS.find((b) => b.key === answers.durationBucket);
  if (recipe.durationMinutes != null && bucket && bucket.max != null) {
    durationKnown = true;
    durationScore = recipe.durationMinutes <= bucket.max ? durationWeight : durationWeight * 0.2;
  } else if (bucket && bucket.max == null) {
    durationScore = durationWeight; // "상관없어요"
  }

  return { score: prepScore + durationScore, prepKnown, durationKnown };
}

export function scoreRecipe(recipe, answers) {
  const grade = scoreGrade(recipe, answers);
  const activity = overlapFraction(answers.activityTypes, recipe.activityTypes);
  const materials = overlapFraction(answers.materialTags, recipe.materialTags);
  const topics = overlapFraction(answers.topics, recipe.topics);
  const prepDuration = scorePrepAndDuration(recipe, answers);

  const score =
    grade.score +
    activity.fraction * RECOMMEND_WEIGHTS.activityType +
    materials.fraction * RECOMMEND_WEIGHTS.materials +
    topics.fraction * RECOMMEND_WEIGHTS.topics +
    prepDuration.score;

  return {
    recipe,
    score,
    detail: { grade, activity, materials, topics, prepDuration },
  };
}

function buildReasons({ recipe, detail }, answers) {
  const reasons = [];
  const caveats = [];

  if (detail.grade.matched) {
    reasons.push(`선생님이 고르신 ${answers.grade}학년에 바로 쓸 수 있는 수업이에요.`);
  } else if (detail.grade.known) {
    reasons.push(`요청하신 학년과 정확히 같지는 않지만(${recipe.grades.join(', ')}학년 자료), 가장 가까운 수업이에요.`);
  } else {
    caveats.push('이 수업은 추천 학년이 아직 명확히 검토되지 않았어요.');
  }

  if (detail.activity.matched.length) {
    reasons.push(`선호하신 활동(${detail.activity.matched.join(', ')})과 잘 맞아요.`);
  }
  if (detail.materials.matched.length) {
    reasons.push(`가지고 계신 재료(${detail.materials.matched.join(', ')})로 준비할 수 있어요.`);
  }
  if (detail.topics.matched.length) {
    reasons.push(`관심 있다고 하신 주제(${detail.topics.matched.join(', ')})를 다루는 수업이에요.`);
  }
  if (!detail.prepDuration.durationKnown && recipe.durationMinutes == null) {
    caveats.push('실제 소요 시간은 아직 확인되지 않았어요. 학급 상황에 맞게 조절해 주세요.');
  }

  if (reasons.length === 0) {
    reasons.push('조건을 완전히 만족하는 수업을 찾지 못해, 조건을 일부 완화해 가장 비슷한 수업을 추천해드려요.');
  }

  return { reasons, caveats };
}

/**
 * @param {Array} recipes - recipes.json의 recipes 배열
 * @param {Object} answers - 테스트 응답
 * @returns {{ best: Object, alternatives: Object[], relaxed: boolean }}
 */
export function recommend(recipes, answers) {
  const active = recipes.filter((r) => r.active);
  const scored = active.map((r) => scoreRecipe(r, answers)).sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { best: null, alternatives: [], relaxed: false };
  }

  const [bestScored, ...rest] = scored;
  const best = { ...bestScored.recipe, ...buildReasons(bestScored, answers), score: bestScored.score };

  // 대안 2개는 가능하면 best와 활동유형/주제가 겹치지 않는 쪽을 우선한다(다양성 확보).
  const diverse = rest.filter(
    (s) =>
      !s.recipe.activityTypes.some((t) => best.activityTypes.includes(t)) ||
      !s.recipe.topics.some((t) => best.topics.includes(t))
  );
  const pool = diverse.length >= 2 ? diverse : rest;
  const alternatives = pool.slice(0, 2).map((s) => ({ ...s.recipe, ...buildReasons(s, answers), score: s.score }));

  const relaxed = bestScored.detail.grade.matched === false;

  return { best, alternatives, relaxed };
}

/** 오늘의 수업 뽑기: 학년만 보고 활성 레시피 중 무작위 1개 (이전 추천 제외 가능) */
export function pickRandomByGrade(recipes, grade, excludeId) {
  const active = recipes.filter((r) => r.active);
  const inGrade = active.filter((r) => r.grades.includes(grade));
  const pool = (inGrade.length > 0 ? inGrade : active).filter((r) => r.id !== excludeId);
  const finalPool = pool.length > 0 ? pool : active;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}
