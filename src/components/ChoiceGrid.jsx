export default function ChoiceGrid({ options, selected, onToggle, multi = false, columns = 2 }) {
  const gridCols = columns === 3 ? 'sm:grid-cols-3' : columns === 1 ? '' : 'sm:grid-cols-2';
  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-3 w-full max-w-xl mx-auto`}>
      {options.map((opt) => {
        const key = typeof opt === 'string' ? opt : opt.key;
        const label = typeof opt === 'string' ? opt : opt.label;
        const isSelected = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            aria-pressed={isSelected}
            className={[
              'rounded-2xl px-5 py-4 text-base font-medium border-2 transition-all text-left',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/40',
              isSelected
                ? 'bg-navy text-cream border-navy shadow-md scale-[1.02]'
                : 'bg-white/70 text-navy border-navy/15 hover:border-navy/40 hover:bg-white',
            ].join(' ')}
          >
            {label}
            {multi && (
              <span className="block text-xs mt-1 opacity-60">
                {isSelected ? '선택됨 · 눌러서 해제' : '여러 개 선택 가능'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
