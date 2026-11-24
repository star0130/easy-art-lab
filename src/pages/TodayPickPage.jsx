import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Character from '../components/Character';
import ChoiceGrid from '../components/ChoiceGrid';
import Button from '../components/Button';
import RecipeDetail from '../components/RecipeDetail';
import { CHARACTERS } from '../lib/images';
import { GRADES } from '../lib/config';
import { pickRandomByGrade } from '../lib/recommend';
import recipesData from '../data/recipes.json';

export default function TodayPickPage() {
  const navigate = useNavigate();
  const [grade, setGrade] = useState(null);
  const [picked, setPicked] = useState(null);

  const draw = (g) => {
    const target = g ?? grade;
    const recipe = pickRandomByGrade(recipesData.recipes, target, picked ? picked.id : null);
    setPicked(recipe);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/result?recipe=${picked.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('아래 링크를 복사하세요', url);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 gap-6">
      <Character src={CHARACTERS.flutter} alt="설레는 피터 캐릭터" size={120} />
      <h1 className="text-2xl font-bold text-navy">오늘의 수업 뽑기</h1>
      <p className="text-navy/70 text-sm -mt-3">학년만 고르면 오늘 바로 할 수 있는 수업을 뽑아드려요</p>

      <ChoiceGrid
        options={GRADES.map((g) => ({ key: g, label: `${g}학년` }))}
        selected={grade != null ? [grade] : []}
        onToggle={(g) => {
          setGrade(g);
          draw(g);
        }}
        columns={3}
      />

      {picked && (
        <>
          <RecipeDetail recipe={picked} onShare={handleShare} compactActions />
          <Button variant="peach" onClick={() => draw()}>
            🎲 다시 뽑기
          </Button>
        </>
      )}

      <Button variant="ghost" onClick={() => navigate('/')}>
        처음으로
      </Button>
    </div>
  );
}
