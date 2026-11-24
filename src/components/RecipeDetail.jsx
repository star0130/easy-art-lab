import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import RecipeImage from './RecipeImage';
import Button from './Button';
import Character from './Character';
import { recipeImage, CHARACTERS } from '../lib/images';

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-navy/10 text-navy',
    warn: 'bg-peach text-navy',
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${tones[tone]}`}>{children}</span>;
}

export default function RecipeDetail({ recipe, reasons, caveats, onShare, compactActions = false }) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!recipe) return null;

  const handleShare = async () => {
    if (onShare) {
      await onShare();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white/70 rounded-3xl p-5 sm:p-7 flex flex-col gap-5 text-left">
      <div className="flex flex-wrap items-center gap-2">
        {recipe.grades.length > 0 ? (
          <Badge>{recipe.grades.join(', ')}학년</Badge>
        ) : (
          <Badge tone="warn">추천 학년 검토 중</Badge>
        )}
        {recipe.activityTypes.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>

      <h3 className="text-2xl font-bold text-navy">{recipe.title}</h3>
      <p className="text-navy/80 leading-relaxed">{recipe.summary}</p>

      <RecipeImage recipe={recipe} className="w-full aspect-[4/3]" />

      {reasons && reasons.length > 0 && (
        <div>
          <h4 className="font-semibold text-navy mb-2">💡 이 수업을 추천한 이유</h4>
          <ul className="list-disc list-inside text-sm text-navy/80 space-y-1">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-navy mb-1">🎒 준비물</h4>
          <p className="text-sm text-navy/80">
            {recipe.materials.length ? recipe.materials.join(', ') : '미기재 — 영상/자료 확인 필요'}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-navy mb-1">⏱ 수업 시간</h4>
          <p className="text-sm text-navy/80">
            {recipe.durationMinutes != null ? `약 ${recipe.durationMinutes}분` : `미확인 (${recipe.periodLabel})`}
          </p>
        </div>
      </div>

      {recipe.steps && recipe.steps.length > 0 && (
        <div>
          <h4 className="font-semibold text-navy mb-1">📋 활동 순서</h4>
          <ol className="list-decimal list-inside text-sm text-navy/80 space-y-1">
            {recipe.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {recipe.tip && recipe.tip !== '미기재' && (
        <div>
          <h4 className="font-semibold text-navy mb-1">👩‍🏫 지도 팁</h4>
          <p className="text-sm text-navy/80">{recipe.tip}</p>
        </div>
      )}

      {caveats && caveats.length > 0 && (
        <div className="bg-cream rounded-xl p-3 text-xs text-navy/60 space-y-1">
          {caveats.map((c, i) => (
            <p key={i}>⚠ {c}</p>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-navy/70 text-sm no-print">
        <Character src={CHARACTERS.proud} alt="뿌듯한 피터 캐릭터" size={40} />
        <span>마음에 드셨다면 저장하거나 인쇄해서 바로 수업에 활용해 보세요!</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 no-print">
        {recipe.videoUrl && (
          <Button as="a" href={recipe.videoUrl} target="_blank" rel="noreferrer" variant="peach">
            ▶ 수업 영상 보기
          </Button>
        )}
        <Button as="a" href={recipeImage(recipe)} download variant="secondary">
          이미지 다운로드
        </Button>
        <Button as="a" href={`/print/${recipe.id}`} target="_blank" rel="noreferrer" variant="secondary">
          인쇄하기
        </Button>
        {onShare && (
          <Button variant="secondary" onClick={handleShare}>
            {copied ? '링크 복사됨!' : '결과 공유 링크 복사'}
          </Button>
        )}
        {recipe.videoUrl && !compactActions && (
          <Button variant="ghost" onClick={() => setShowQr((v) => !v)}>
            영상 QR코드 {showQr ? '숨기기' : '보기'}
          </Button>
        )}
      </div>

      {showQr && recipe.videoUrl && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <QRCodeSVG value={recipe.videoUrl} size={140} fgColor="#293D53" />
          <p className="text-xs text-navy/60">스마트폰으로 찍으면 영상으로 바로 연결돼요</p>
        </div>
      )}
    </div>
  );
}
