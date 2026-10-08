// 서버 오류 메시지 영어판 (요청 헤더 X-Lang: en 이면 영어로 응답)
const EN = {
  '로그인이 필요해요.': 'Please log in first.',
  '사진은 10MB 이하 이미지만 올릴 수 있어요.': 'Photos must be images of 10MB or less.',
  '닉네임 또는 비밀번호가 맞지 않아요.': 'Wrong nickname or password.',
  '닉네임은 2~12자로 정해 주세요.': 'Nicknames must be 2 to 12 characters.',
  '비밀번호는 4자 이상이어야 해요.': 'Passwords need at least 4 characters.',
  '이미 사용 중인 닉네임이에요.': 'That nickname is already taken.',
  '판별할 사진을 올려 주세요.': 'Please upload a photo to identify.',
  '어종을 선택해 주세요.': 'Please choose a species.',
  '길이는 1~300cm 사이로 입력해 주세요.': 'Length must be between 1 and 300cm.',
  '날짜를 입력해 주세요.': 'Please enter a date.',
  '장소를 고르거나 지도를 눌러 위치를 찍어 주세요.': 'Pick a spot or tap the map to pin a location.',
  '기록을 찾을 수 없어요.': 'That record was not found.',
  '본인 기록만 수정하거나 삭제할 수 있어요.': 'You can only edit or delete your own records.',
  '목록에 있는 장소를 골라 주세요.': 'Please choose a spot from the list.',
  '없는 API예요.': 'No such API.',
};

const localize = (req, msg) => (req && req.get('X-Lang') === 'en' && EN[msg]) || msg;

module.exports = { localize, EN };
