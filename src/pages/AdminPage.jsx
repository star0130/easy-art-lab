import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { GRADES, ACTIVITY_TYPES, TOPICS, PREP_LEVELS } from '../lib/config';

const API = '/api/admin';

function emptyForm() {
  return {
    id: null,
    title: '',
    grades: [],
    activity_types: [],
    topics: [],
    materials: '',
    prep_level: '',
    duration_minutes: '',
    summary: '',
    steps: [],
    tip: '',
    video_url: '',
    image_file: null,
    active: true,
    _readOnly: {},
  };
}

function toggleIn(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function AdminPage() {
  const [recipes, setRecipes] = useState(null);
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok'|'error', text }
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    fetch(`${API}/recipes`)
      .then((r) => r.json())
      .then((data) => setRecipes(data.recipes))
      .catch(() => setStatus({ type: 'error', text: '목록을 불러오지 못했어요. npm run dev가 켜져 있는지 확인해주세요.' }));
  };

  useEffect(load, []);

  const selectRecipe = (r) => {
    setForm({ ...r, steps: r.steps.join('\n') });
    setIsNew(false);
    setStatus(null);
  };

  const startNew = () => {
    setForm({ ...emptyForm(), steps: '' });
    setIsNew(true);
    setStatus(null);
  };

  if (recipes === null) {
    return <p className="p-8 text-center text-navy/60">불러오는 중… (개발 서버가 꺼져 있다면 npm run dev를 실행해주세요)</p>;
  }

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !form.id && !isNew) return;
    setUploading(true);
    try {
      const dataBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`${API}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, dataBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      update({ image_file: data.filename });
      setStatus({ type: 'ok', text: '이미지를 업로드했어요. 저장을 눌러야 최종 반영돼요.' });
    } catch (err) {
      setStatus({ type: 'error', text: `이미지 업로드 실패: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    const payload = {
      title: form.title,
      grades: form.grades,
      activity_types: form.activity_types,
      topics: form.topics,
      materials: form.materials,
      prep_level: form.prep_level,
      duration_minutes: form.duration_minutes === '' ? null : Number(form.duration_minutes),
      summary: form.summary,
      steps: form.steps.split('\n').map((s) => s.trim()).filter(Boolean),
      tip: form.tip,
      video_url: form.video_url,
      image_file: form.image_file,
      active: form.active,
    };
    try {
      const url = isNew ? `${API}/recipes` : `${API}/recipes/${encodeURIComponent(form.id)}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecipes(data.recipes);
      setStatus({ type: 'ok', text: '저장했어요! 화면에 바로 반영됩니다.' });
      if (isNew) {
        const saved = data.recipes.find((r) => r.id === data.id);
        if (saved) selectRecipe(saved);
      }
    } catch (err) {
      setStatus({ type: 'error', text: `저장 실패: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row gap-6 p-6 max-w-6xl mx-auto">
      <aside className="sm:w-72 shrink-0 flex flex-col gap-3">
        <Link to="/" className="text-sm text-navy/60 underline">
          ← 앱으로 돌아가기
        </Link>
        <h1 className="text-xl font-bold text-navy">레시피 관리</h1>
        <Button variant="peach" onClick={startNew}>
          + 새 레시피 추가
        </Button>
        <div className="flex flex-col gap-1 overflow-y-auto max-h-[70vh]">
          {recipes.map((r) => (
            <button
              key={r.id}
              onClick={() => selectRecipe(r)}
              className={`text-left px-3 py-2 rounded-lg text-sm border ${
                form && form.id === r.id && !isNew
                  ? 'bg-navy text-cream border-navy'
                  : 'bg-white/60 border-navy/10 hover:bg-white'
              } ${!r.active ? 'opacity-50' : ''}`}
            >
              {r.title || '(제목 없음)'}
              {!r.active && ' · 비활성'}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 bg-white/70 rounded-2xl p-6">
        {!form ? (
          <p className="text-navy/60">왼쪽에서 레시피를 선택하거나 새로 추가하세요.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-navy">
              {isNew ? '새 레시피 추가' : `수정: ${form.title || form.id}`}
            </h2>

            {status && (
              <p className={`text-sm ${status.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>{status.text}</p>
            )}

            <label className="flex flex-col gap-1 text-sm">
              수업 활동명
              <input
                className="border rounded-lg px-3 py-2"
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              영상 URL
              <input
                className="border rounded-lg px-3 py-2"
                value={form.video_url}
                onChange={(e) => update({ video_url: e.target.value })}
              />
            </label>

            <div>
              <p className="text-sm font-medium mb-1">학년</p>
              <div className="flex flex-wrap gap-2">
                {GRADES.map((g) => (
                  <label key={g} className="flex items-center gap-1 text-sm bg-cream px-2 py-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={form.grades.includes(g)}
                      onChange={() => update({ grades: toggleIn(form.grades, g) })}
                    />
                    {g}학년
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">미술 활동 유형</p>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-1 text-sm bg-cream px-2 py-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={form.activity_types.includes(t)}
                      onChange={() => update({ activity_types: toggleIn(form.activity_types, t) })}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">수업 주제</p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <label key={t} className="flex items-center gap-1 text-sm bg-cream px-2 py-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={form.topics.includes(t)}
                      onChange={() => update({ topics: toggleIn(form.topics, t) })}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              준비물 (쉼표로 구분)
              <input
                className="border rounded-lg px-3 py-2"
                value={form.materials}
                onChange={(e) => update({ materials: e.target.value })}
                placeholder="예: 도화지, 연필, 채색도구"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                준비 부담
                <select
                  className="border rounded-lg px-3 py-2"
                  value={form.prep_level}
                  onChange={(e) => update({ prep_level: e.target.value })}
                >
                  <option value="">미기재</option>
                  {PREP_LEVELS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                실제 수업 시간(분, 모르면 비워두기)
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2"
                  value={form.duration_minutes ?? ''}
                  onChange={(e) => update({ duration_minutes: e.target.value })}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              활동 소개 (한 줄 요약)
              <textarea
                className="border rounded-lg px-3 py-2"
                rows={2}
                value={form.summary}
                onChange={(e) => update({ summary: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              활동 순서 (한 줄에 하나씩)
              <textarea
                className="border rounded-lg px-3 py-2 font-mono text-xs"
                rows={5}
                value={form.steps}
                onChange={(e) => update({ steps: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              지도 팁
              <textarea
                className="border rounded-lg px-3 py-2"
                rows={2}
                value={form.tip}
                onChange={(e) => update({ tip: e.target.value })}
              />
            </label>

            <div>
              <p className="text-sm font-medium mb-1">레시피 이미지</p>
              {form.image_file && (
                <img
                  src={`/recipes/${form.image_file}`}
                  alt="미리보기"
                  className="w-40 h-auto rounded-lg border mb-2"
                />
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p className="text-xs text-navy/60 mt-1">업로드 중…</p>}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => update({ active: e.target.checked })} />
              추천 목록에 노출 (체크 해제 시 비활성화)
            </label>

            {!isNew && form._readOnly && (form._readOnly.reviewStatus || form._readOnly.curriculumCode) && (
              <div className="text-xs text-navy/50 bg-cream rounded-lg p-3">
                <p>검토 상태: {form._readOnly.reviewStatus || '미기재'}</p>
                <p>성취기준: {form._readOnly.curriculumCode || '미기재'}</p>
                {form._readOnly.reviewMemo && <p>검토 메모: {form._readOnly.reviewMemo}</p>}
              </div>
            )}

            <Button variant="primary" onClick={handleSave} disabled={saving} className="self-start">
              {saving ? '저장 중…' : '저장하기'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
