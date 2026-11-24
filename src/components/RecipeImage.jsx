import { useState } from 'react';
import { recipeImage, isPlaceholder } from '../lib/images';

export default function RecipeImage({ recipe, className = '', zoomable = true }) {
  const [zoomed, setZoomed] = useState(false);
  const src = recipeImage(recipe);
  const placeholder = isPlaceholder(recipe);

  return (
    <>
      <div
        className={`relative rounded-2xl overflow-hidden bg-white border border-navy/10 ${className} ${
          zoomable ? 'cursor-zoom-in' : ''
        }`}
        onClick={() => zoomable && setZoomed(true)}
      >
        <img
          src={src}
          alt={recipe ? `${recipe.title} 레시피 이미지` : '레시피 이미지 준비 중'}
          className="w-full h-full object-contain"
        />
        {placeholder && (
          <span className="absolute top-2 right-2 text-[11px] bg-navy/80 text-cream px-2 py-0.5 rounded-full">
            준비 중
          </span>
        )}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-navy/80 flex items-center justify-center p-6 no-print"
          onClick={() => setZoomed(false)}
        >
          <img src={src} alt="확대 이미지" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </>
  );
}
