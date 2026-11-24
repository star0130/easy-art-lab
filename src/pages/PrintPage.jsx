import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { recipeImage } from '../lib/images';
import recipesData from '../data/recipes.json';

export default function PrintPage() {
  const { id } = useParams();
  const recipe = recipesData.recipes.find((r) => r.id === id);

  useEffect(() => {
    if (recipe) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [recipe]);

  if (!recipe) {
    return <p className="p-8 text-center">레시피를 찾을 수 없어요.</p>;
  }

  return (
    <div className="print-page min-h-screen flex items-center justify-center bg-white p-4">
      <style>{`
        @page { size: A4; margin: 12mm; }
        .print-page img { max-width: 100%; max-height: 95vh; object-fit: contain; }
      `}</style>
      <div className="flex flex-col items-center gap-2 w-full">
        <img src={recipeImage(recipe)} alt={recipe.title} />
        <p className="text-sm text-navy/70 no-print">
          인쇄 창이 뜨지 않으면 Ctrl/Cmd+P 를 눌러주세요. ({recipe.title})
        </p>
      </div>
    </div>
  );
}
