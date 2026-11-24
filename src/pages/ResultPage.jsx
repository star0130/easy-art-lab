import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Character from '../components/Character';
import Button from '../components/Button';
import RecipeDetail from '../components/RecipeDetail';
import RecipeImage from '../components/RecipeImage';
import { CHARACTERS } from '../lib/images';
import recipesData from '../data/recipes.json';

function findById(id) {
  return recipesData.recipes.find((r) => r.id === id) || null;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const stateResult = location.state && location.state.result;

  const sharedRecipe = useMemo(() => {
    const id = searchParams.get('recipe');
    return id ? findById(id) : null;
  }, [searchParams]);

  const [activeId, setActiveId] = useState(
    (stateResult && stateResult.best && stateResult.best.id) || (sharedRecipe && sharedRecipe.id) || null
  );

  // 테스트를 막 끝내고 들어온 경우에만 짧은 "두근두근" 로딩 연출을 보여준다.
  const [revealed, setRevealed] = useState(!stateResult);
  useEffect(() => {
    if (!stateResult) return;
    const t = setTimeout(() => setRevealed(true), 1100);
    return () => clearTimeout(t);
  }, [stateResult]);

  if (stateResult && !revealed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <Character src={CHARACTERS.flutter} alt="설레는 피터 캐릭터" size={150} className="animate-bounce" />
        <p className="text-lg font-semibold text-navy">두근두근… 딱 맞는 수업을 찾고 있어요!</p>
      </div>
    );
  }

  if (!stateResult && !sharedRecipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-navy/70">결과 정보를 찾을 수 없어요. 테스트를 다시 진행해 주세요.</p>
        <Button onClick={() => navigate('/test')}>취향 테스트 하러가기</Button>
      </div>
    );
  }

  // 공유 링크로 들어온 경우: 이유/대안 없이 해당 레시피만 보여준다.
  if (!stateResult) {
    return (
      <div className="min-h-screen flex flex-col items-center px-6 py-10 gap-6">
        <p className="text-sm text-navy/60">공유받은 추천 결과예요</p>
        <RecipeDetail recipe={sharedRecipe} compactActions />
        <Button variant="secondary" onClick={() => navigate('/test')}>
          나도 취향 테스트 해보기
        </Button>
      </div>
    );
  }

  const { best, alternatives, relaxed } = stateResult;
  const pool = [best, ...alternatives];
  const active = pool.find((r) => r.id === activeId) || best;

  const handleShare = async () => {
    const url = `${window.location.origin}/result?recipe=${active.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('아래 링크를 복사하세요', url);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 gap-6">
      <Character src={CHARACTERS.joy} alt="기뻐하는 피터 캐릭터" size={120} />
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy">
          {activeId === best.id ? '오늘의 미술 수업을 찾았어요! 🎉' : '이 수업은 어떠세요?'}
        </h1>
        {relaxed && activeId === best.id && (
          <p className="text-sm text-navy/60 mt-2 max-w-md mx-auto">
            조건에 꼭 맞는 자료는 아직 없지만, 가장 가까운 수업을 추천해드렸어요.
          </p>
        )}
      </div>

      <RecipeDetail recipe={active} reasons={active.reasons} caveats={active.caveats} onShare={handleShare} />

      {alternatives.length > 0 && (
        <div className="w-full max-w-2xl">
          <h4 className="font-semibold text-navy mb-3">다른 수업도 볼까요?</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {pool
              .filter((r) => r.id !== active.id)
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className="text-left bg-white/70 hover:bg-white rounded-2xl p-3 border border-navy/10 transition-colors"
                >
                  <RecipeImage recipe={r} zoomable={false} className="aspect-[4/3] mb-2" />
                  <p className="font-medium text-navy text-sm">{r.title}</p>
                  <p className="text-xs text-navy/60">
                    {r.grades.length ? `${r.grades.join(', ')}학년` : '학년 검토 중'} · {r.activityTypes.join(', ')}
                  </p>
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 no-print">
        <Button variant="secondary" onClick={() => navigate('/test')}>
          다시 테스트하기
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          처음으로
        </Button>
      </div>
    </div>
  );
}
