// 캐릭터·레시피 이미지 경로를 한 곳에서 관리한다.
// 새 레시피 이미지는 public/recipes/ 에 파일을 올리고 recipes.json(또는 원본 데이터)의
// image_file 값만 채우면 되며, 이 모듈이나 화면 코드를 수정할 필요가 없다.

export const CHARACTERS = {
  greeting: '/characters/피터인사.png', // 메인 시작 화면
  brush: '/characters/피터붓.png', // 취향 테스트 안내
  shrug: '/characters/피터어쩔.png', // 수업 준비 부담 질문
  flutter: '/characters/피터설렘.png', // 추천 결과 로딩 화면
  joy: '/characters/피터즐거움.png', // 추천 결과 발표
  proud: '/characters/피터뿌듯함.png', // 저장·인쇄 안내
  brushPalette: '/characters/피터붓파레트.png', // 브랜드 소개·안내
};

const PLACEHOLDER = '/recipes/placeholder.svg';

export function recipeImage(recipe) {
  if (!recipe || !recipe.imageFile) return PLACEHOLDER;
  return `/recipes/${recipe.imageFile}`;
}

export function isPlaceholder(recipe) {
  return !recipe || !recipe.imageFile;
}
