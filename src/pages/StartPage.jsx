import { useNavigate } from 'react-router-dom';
import Character from '../components/Character';
import Button from '../components/Button';
import { CHARACTERS } from '../lib/images';

export default function StartPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center gap-6">
      <div className="text-sm tracking-widest font-semibold text-navy/60">EASY ART LAB</div>
      <Character src={CHARACTERS.greeting} alt="인사하는 피터 캐릭터" size={180} />
      <h1 className="text-3xl sm:text-4xl font-bold text-navy">오늘 뭐 그리지?</h1>
      <p className="text-navy/70 max-w-sm leading-relaxed">
        간단한 취향 테스트로
        <br />
        우리 반에 꼭 맞는 미술 수업을 찾아드려요.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
        <Button variant="primary" onClick={() => navigate('/test')}>
          취향 테스트로 찾기
        </Button>
        <Button variant="secondary" onClick={() => navigate('/today')}>
          오늘의 수업 뽑기
        </Button>
      </div>

      <div className="flex items-center gap-3 mt-10 max-w-sm text-left bg-white/50 rounded-2xl px-4 py-3">
        <Character src={CHARACTERS.brushPalette} alt="붓과 팔레트를 든 피터 캐릭터" size={56} />
        <p className="text-xs text-navy/60 leading-relaxed text-center">
          EASY ART LAB은 이지미술 교육연구회가
          <br />
          직접 만들고 검토한 수업만 추천해요.
        </p>
      </div>
    </div>
  );
}
