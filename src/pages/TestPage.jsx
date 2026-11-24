import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Character from '../components/Character';
import ProgressBar from '../components/ProgressBar';
import ChoiceGrid from '../components/ChoiceGrid';
import Button from '../components/Button';
import { CHARACTERS } from '../lib/images';
import { GRADES, ACTIVITY_TYPES, PREP_LEVELS, MATERIAL_TAGS, TOPICS, DURATION_BUCKETS } from '../lib/config';
import { recommend } from '../lib/recommend';
import recipesData from '../data/recipes.json';

const MAX_TOPIC_PICKS = 3;

const STEPS = [
  {
    key: 'grade',
    multi: false,
    title: '이번 수업은 몇 학년인가요?',
    character: CHARACTERS.brush,
    options: GRADES.map((g) => ({ key: g, label: `${g}학년` })),
  },
  {
    key: 'activityTypes',
    multi: true,
    title: '선호하는 미술 활동을 골라주세요',
    sub: '여러 개를 고를 수 있어요',
    character: CHARACTERS.brush,
    options: ACTIVITY_TYPES,
    columns: 2,
  },
  {
    key: 'prepLevel',
    multi: false,
    title: '수업 준비 부담은 어느 정도가 좋을까요?',
    character: CHARACTERS.shrug,
    options: PREP_LEVELS,
    columns: 1,
  },
  {
    key: 'materialTags',
    multi: true,
    title: '지금 바로 쓸 수 있는 재료가 있나요?',
    sub: '해당하는 걸 모두 골라주세요',
    character: CHARACTERS.brush,
    options: MATERIAL_TAGS,
    columns: 2,
  },
  {
    key: 'topics',
    multi: true,
    title: '어떤 수업 경험을 중요하게 생각하세요?',
    sub: `최대 ${MAX_TOPIC_PICKS}개까지 고를 수 있어요`,
    character: CHARACTERS.brush,
    options: TOPICS,
    columns: 2,
  },
  {
    key: 'durationBucket',
    multi: false,
    title: '수업에 쓸 수 있는 시간은 얼마나 되나요?',
    character: CHARACTERS.flutter,
    options: DURATION_BUCKETS,
    columns: 1,
  },
];

export default function TestPage() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    grade: null,
    activityTypes: [],
    prepLevel: null,
    materialTags: [],
    topics: [],
    durationBucket: null,
  });

  const step = STEPS[stepIndex];
  const value = answers[step.key];
  const selected = step.multi ? value : value != null ? [value] : [];

  const canProceed = step.multi ? selected.length > 0 : value != null;

  const handleToggle = (key) => {
    setAnswers((prev) => {
      if (!step.multi) {
        return { ...prev, [step.key]: key };
      }
      const current = prev[step.key];
      if (current.includes(key)) {
        return { ...prev, [step.key]: current.filter((k) => k !== key) };
      }
      if (step.key === 'topics' && current.length >= MAX_TOPIC_PICKS) {
        return { ...prev, [step.key]: [...current.slice(1), key] };
      }
      return { ...prev, [step.key]: [...current, key] };
    });
  };

  const goBack = () => {
    if (stepIndex === 0) navigate('/');
    else setStepIndex((i) => i - 1);
  };

  const goNext = () => {
    if (stepIndex === STEPS.length - 1) {
      const result = recommend(recipesData.recipes, answers);
      navigate('/result', { state: { answers, result } });
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const normalizedOptions = useMemo(
    () => step.options.map((o) => (typeof o === 'string' ? o : { key: o.key, label: o.label })),
    [step]
  );

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 gap-6">
      <ProgressBar step={stepIndex + 1} total={STEPS.length} />

      <Character src={step.character} alt="안내 캐릭터" size={110} />

      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-navy">{step.title}</h2>
        {step.sub && <p className="text-sm text-navy/60 mt-1">{step.sub}</p>}
      </div>

      <ChoiceGrid
        options={normalizedOptions}
        selected={selected.map((s) => s)}
        onToggle={handleToggle}
        multi={step.multi}
        columns={step.columns || 2}
      />

      <div className="flex gap-3 mt-4 w-full max-w-xs">
        <Button variant="secondary" onClick={goBack} className="flex-1">
          이전
        </Button>
        <Button variant="primary" onClick={goNext} disabled={!canProceed} className="flex-1">
          {stepIndex === STEPS.length - 1 ? '결과 보기' : '다음'}
        </Button>
      </div>
    </div>
  );
}
