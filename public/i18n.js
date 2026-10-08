/* ---------- 설정 (이 브라우저에만 저장) ---------- */
const SETTINGS = (() => {
  const def = { lang: 'ko', sound: true, volume: 70 };
  try { return { ...def, ...JSON.parse(localStorage.getItem('fishdex-settings') || '{}') }; } catch (_) { return def; }
})();
function saveSettings() { try { localStorage.setItem('fishdex-settings', JSON.stringify(SETTINGS)); } catch (_) {} }

/* ---------- 한국어 / English ---------- */
const LANG = {
  ko: {
    'brand': '손맛어보', 'brand.tag': '오늘 낚은 물고기로 채우는 나만의 바다 도감',
    'tab.dex': '도감', 'tab.reg': '촬영 등록', 'tab.map': '조황 지도', 'tab.ach': '도전과제', 'tab.log': '내 기록', 'tab.set': '설정',
    'nav': '주요 메뉴', 'lvchip': '내 레벨 보기', 'close': '닫기',
    'hab.sea': '바다', 'hab.fresh': '민물', 'hab.seaSp': '바다 어종', 'hab.freshSp': '민물 어종',
    'rar.common': '흔함', 'rar.normal': '보통', 'rar.rare': '희귀', 'rar.legend': '전설',
    'titles': ['', '물때 모르는 초보', '찌 보는 눈', '입질 감별사', '손맛 수집가', '갯바위 단골', '포인트 개척자', '대물 사냥꾼', '바다의 기록자', '어보 편찬자', '전설의 조사'],
    'ach.first': ['첫 손맛', '처음으로 물고기를 등록하기'], 'ach.dex5': ['어보 입문', '서로 다른 어종 5종 수집'],
    'ach.dex10': ['열 칸의 어보', '서로 다른 어종 10종 수집'], 'ach.dex20': ['어보 완성', '도감의 모든 어종 20종 수집'],
    'ach.big': ['대물 사냥꾼', '50cm 이상 물고기 낚기'], 'ach.both': ['바다와 강', '바다 어종과 민물 어종 모두 낚기'],
    'ach.tour': ['전국 일주', '서로 다른 장소 6곳에서 기록'], 'ach.same': ['한 우물 파기', '같은 어종 5마리 낚기'],
    'ach.legend': ['전설의 손맛', '전설 등급 어종 낚기'],
    'unit.fish': n => `${n}<small> 마리</small>`, 'unit.caught': n => `${n}마리`, 'unit.species': n => `${n}종`, 'unit.records': n => `${n}건`,

    'dex.angler': lv => `Lv.${lv} 조사`, 'dex.max': '최고 레벨', 'dex.next': n => `다음 레벨까지 ${n} XP`,
    'dex.found': '수집한 어종', 'dex.total': '총 조과', 'dex.best': '최대어',
    'dex.title': '나의 어보', 'dex.sub': '사진으로 등록한 물고기가 도감에 채워집니다. 빈 칸은 아직 만나지 못한 어종이에요.',
    'dex.all': '전체', 'dex.locked': '미발견', 'dex.maxLen': n => `최대 ${n}cm`,
    'sp.unknown': '미발견 어종', 'sp.unknownText': n => `아직 이 어종을 낚지 못했어요. 다른 조사들은 이 어종을 <b>${n}번</b> 기록했습니다.${n ? ' 조황 지도에서 어디서 잡혔는지 확인해 보세요.' : ''}`,
    'sp.snap': '촬영해서 등록하기', 'sp.onMap': '지도에서 보기', 'sp.mine': '내 조과', 'sp.myBest': '내 최대어', 'sp.all': '전체 유저 기록', 'sp.myRecords': '나의 기록',

    'reg.title': '오늘의 조과 등록', 'reg.sub': '사진을 올리면 어종을 판별하고, 위치를 찍으면 조황 지도에 공유됩니다.',
    'reg.s1': '사진으로 어종 판별', 'reg.s1sub': '물고기 옆모습이 잘 보이게 찍어주세요.', 'reg.photoAlt': '올린 사진',
    'reg.drop': '사진 촬영 또는 업로드', 'reg.dropSub': '클릭하거나 사진을 끌어다 놓으세요', 'reg.scanning': 'AI 판별 중…',
    'reg.result': '판별 결과 · 하나를 고르세요',
    'reg.s2': '조과 정보', 'reg.s2sub': '길이와 장소를 입력하면 경험치가 쌓여요.',
    'f.species': '어종', 'f.speciesPh': '사진을 올리거나 직접 선택', 'f.len': '길이 (cm)', 'f.date': '날짜', 'f.spot': '장소',
    'f.spotHint': '목록에서 고르거나 아래 지도를 눌러 위치를 찍으세요', 'f.choose': '선택', 'f.memo': '메모', 'f.memoHint': '채비, 물때, 미끼 등',
    'f.memoPh': '예: 3물, 크릴 밑밥, 갯바위 홈통', 'f.photo': '사진',
    'reg.submit': '어보에 등록하기',
    'reg.needSp': '어종을 선택해 주세요.', 'reg.needLen': '길이를 cm 단위로 입력해 주세요.', 'reg.needSpot': '장소를 고르거나 지도를 눌러 위치를 찍어 주세요.',

    'cel.label': '등록 완료', 'cel.new': '새 어종 발견!', 'cel.done': '조과 등록 완료', 'cel.ach': '도전과제 달성',
    'cel.lvUp': '레벨 업!', 'cel.newTitle': '새 칭호', 'cel.titleGot': '새 칭호를 얻었어요.', 'cel.continue': '계속하기',
    'cel.toDex': '도감 보기', 'cel.toMap': '조황 지도에서 보기',

    'map.title': '조황 지도', 'map.sub': '모든 조사들의 기록이 지도에 모입니다. 가까운 곳의 기록은 숫자로 묶여 보여요.',
    'map.filter': '어종 필터', 'map.allSp': n => `전체 어종 (${n})`, 'map.near': s => `${s} 인근`, 'map.back': '← 전체 조황',
    'map.stat': (n, k, m) => `${n}건 · ${k}종 · 최대 ${m}cm`, 'map.recent': '최근 조황',
    'map.recentSub': n => `${n}건 · 지도의 묶음이나 찌를 누르면 그 지역 기록이 여기 나와요.`,
    'map.mine': '내 기록', 'map.cluster': '숫자 = 인근 기록 묶음', 'map.photo': s => `${s} 사진`,
    'map.east': '동 해', 'map.west': '서 해', 'map.south': '남 해',

    'ach.title': '도전과제', 'ach.sub': (d, n) => `${d} / ${n} 달성 · 물고기를 등록할 때마다 경험치가 오르고 레벨이 올라갑니다.`,
    'ach.rank': '이번 시즌 랭킹', 'ach.formula': '경험치 = 10 + 길이÷5 + 희귀도 보너스 + 새 어종 30',

    'log.title': '내 조과 기록', 'log.sub': '등록한 기록을 수정하거나 삭제할 수 있어요. 삭제하면 지도와 도감에서도 빠집니다.',
    'log.add': '+ 새 조과 등록', 'log.ask': '삭제할까요?', 'log.del': '삭제', 'log.cancel': '취소', 'log.edit': '수정',
    'log.empty': '아직 기록이 없어요. 첫 물고기를 등록해 보세요.', 'log.deleted': (s, n) => `${s} ${n}cm 기록을 삭제했어요.`,
    'log.search': '검색', 'log.searchPh': '어종, 장소, 메모', 'log.count': (m, n) => `${n}건 중 ${m}건`,
    'log.sort': '정렬', 'log.sort.new': '최신순', 'log.sort.old': '오래된순', 'log.sort.big': '큰 순', 'log.sort.small': '작은 순',
    'log.noResult': '검색 결과가 없어요. 다른 단어로 찾아보세요.',
    'map.everyone': '모든 조사', 'map.onlyMine': '내 기록만', 'photo.view': '사진 크게 보기',
    'edit.title': '기록 수정', 'edit.save': '저장', 'edit.done': '기록을 수정했어요.',

    'login.title': '로그인', 'login.sub': '닉네임과 비밀번호로 들어가요. 처음이면 회원가입을 눌러 주세요.', 'login.demo': '데모 계정 · 지훈 / 1234',
    'login.name': '닉네임', 'login.pw': '비밀번호', 'login.signup': '회원가입', 'login.need': '닉네임과 비밀번호를 입력해 주세요.',
    'login.again': '다시 로그인해 주세요.', 'server.down': '서버에 연결하지 못했어요. npm start로 서버를 켰는지 확인해 주세요.',
    'demo.reset': '데모 데이터로 초기화했어요.',

    'set.title': '설정', 'set.sub': '계정, 소리, 언어를 바꿀 수 있어요.',
    'set.account': '계정', 'set.loggedIn': n => `<b>${n}</b> 님으로 로그인 중`, 'set.logout': '로그아웃',
    'set.sound': '소리', 'set.soundSub': '사진 판별, 등록, 도전과제, 레벨 업 때 효과음이 나와요.', 'set.on': '켜기', 'set.off': '끄기',
    'set.volume': '볼륨', 'set.preview': '미리 듣기',
    'set.lang': '언어', 'set.langSub': '화면에 쓰는 언어를 고르세요.',
    'set.demo': '데모 데이터', 'set.demoSub': '모든 기록을 처음 상태로 되돌려요. Shift+R과 같아요.', 'set.reset': '초기화', 'set.resetAsk': '정말 초기화할까요?',
  },
  en: {
    'brand': 'Fishdex', 'brand.tag': 'Your own sea dex, filled with the fish you catch',
    'tab.dex': 'Dex', 'tab.reg': 'Log catch', 'tab.map': 'Catch map', 'tab.ach': 'Achievements', 'tab.log': 'My log', 'tab.set': 'Settings',
    'nav': 'Main menu', 'lvchip': 'View my level', 'close': 'Close',
    'hab.sea': 'Sea', 'hab.fresh': 'Freshwater', 'hab.seaSp': 'Sea species', 'hab.freshSp': 'Freshwater species',
    'rar.common': 'Common', 'rar.normal': 'Normal', 'rar.rare': 'Rare', 'rar.legend': 'Legend',
    'titles': ['', 'Tide Rookie', 'Float Watcher', 'Bite Reader', 'Pull Collector', 'Rock Regular', 'Spot Pioneer', 'Trophy Hunter', 'Sea Chronicler', 'Fishdex Editor', 'Legendary Angler'],
    'ach.first': ['First Bite', 'Log your first fish'], 'ach.dex5': ['Dex Beginner', 'Collect 5 different species'],
    'ach.dex10': ['Ten-Slot Dex', 'Collect 10 different species'], 'ach.dex20': ['Dex Complete', 'Collect all 20 species'],
    'ach.big': ['Trophy Hunter', 'Catch a fish of 50cm or more'], 'ach.both': ['Sea and River', 'Catch both a sea and a freshwater species'],
    'ach.tour': ['Nationwide Tour', 'Log catches at 6 different spots'], 'ach.same': ['One Well Deep', 'Catch 5 of the same species'],
    'ach.legend': ['Legendary Pull', 'Catch a legend-rarity species'],
    'unit.fish': n => `${n}<small> fish</small>`, 'unit.caught': n => `${n} caught`, 'unit.species': n => `${n} species`, 'unit.records': n => `${n} ${n === 1 ? 'catch' : 'catches'}`,

    'dex.angler': lv => `Lv.${lv} Angler`, 'dex.max': 'Max level', 'dex.next': n => `${n} XP to next level`,
    'dex.found': 'Species found', 'dex.total': 'Total catches', 'dex.best': 'Biggest',
    'dex.title': 'My Fishdex', 'dex.sub': 'Fish you log with a photo fill the dex. Empty slots are species you have not met yet.',
    'dex.all': 'All', 'dex.locked': 'Not found', 'dex.maxLen': n => `max ${n}cm`,
    'sp.unknown': 'Undiscovered species', 'sp.unknownText': n => `You haven't caught this one yet. Other anglers have logged it <b>${n} times</b>.${n ? ' Check the catch map to see where.' : ''}`,
    'sp.snap': 'Snap and log it', 'sp.onMap': 'View on map', 'sp.mine': 'My catches', 'sp.myBest': 'My biggest', 'sp.all': 'All anglers', 'sp.myRecords': 'My records',

    'reg.title': "Log today's catch", 'reg.sub': 'Upload a photo to identify the species, then pin the spot to share it on the catch map.',
    'reg.s1': 'Identify from photo', 'reg.s1sub': 'Shoot the fish from the side so its whole body shows.', 'reg.photoAlt': 'Uploaded photo',
    'reg.drop': 'Take or upload a photo', 'reg.dropSub': 'Click or drag a photo here', 'reg.scanning': 'Identifying…',
    'reg.result': 'Results · pick one',
    'reg.s2': 'Catch details', 'reg.s2sub': 'Enter the length and spot to earn XP.',
    'f.species': 'Species', 'f.speciesPh': 'Upload a photo or choose', 'f.len': 'Length (cm)', 'f.date': 'Date', 'f.spot': 'Spot',
    'f.spotHint': 'Pick from the list or tap the map below', 'f.choose': 'Choose', 'f.memo': 'Memo', 'f.memoHint': 'Rig, tide, bait…',
    'f.memoPh': 'e.g. spring tide, krill chum, rock gully', 'f.photo': 'Photo',
    'reg.submit': 'Add to Fishdex',
    'reg.needSp': 'Please choose a species.', 'reg.needLen': 'Please enter the length in cm.', 'reg.needSpot': 'Pick a spot or tap the map to pin a location.',

    'cel.label': 'Catch logged', 'cel.new': 'New species!', 'cel.done': 'Catch logged', 'cel.ach': 'Achievement unlocked',
    'cel.lvUp': 'Level up!', 'cel.newTitle': 'New title', 'cel.titleGot': 'You earned a new title.', 'cel.continue': 'Continue',
    'cel.toDex': 'View dex', 'cel.toMap': 'See on catch map',

    'map.title': 'Catch map', 'map.sub': "Every angler's catches gather here. Nearby records are grouped into numbered clusters.",
    'map.filter': 'Species filter', 'map.allSp': n => `All species (${n})`, 'map.near': s => `Near ${s}`, 'map.back': '← All catches',
    'map.stat': (n, k, m) => `${n} ${n === 1 ? 'catch' : 'catches'} · ${k} species · max ${m}cm`, 'map.recent': 'Recent catches',
    'map.recentSub': n => `${n} ${n === 1 ? 'catch' : 'catches'} · Tap a cluster or float on the map to see that area here.`,
    'map.mine': 'My catches', 'map.cluster': 'Number = nearby catches', 'map.photo': s => `${s} photo`,
    'map.east': 'East Sea', 'map.west': 'Yellow Sea', 'map.south': 'South Sea',

    'ach.title': 'Achievements', 'ach.sub': (d, n) => `${d} / ${n} unlocked · Every fish you log earns XP and raises your level.`,
    'ach.rank': 'Season ranking', 'ach.formula': 'XP = 10 + length÷5 + rarity bonus + 30 for a new species',

    'log.title': 'My catch log', 'log.sub': 'Edit or delete your records. Deleted catches also leave the map and the dex.',
    'log.add': '+ Log a catch', 'log.ask': 'Delete this?', 'log.del': 'Delete', 'log.cancel': 'Cancel', 'log.edit': 'Edit',
    'log.empty': 'No records yet. Log your first fish.', 'log.deleted': (s, n) => `Deleted ${s} ${n}cm.`,
    'log.search': 'Search', 'log.searchPh': 'Species, spot or memo', 'log.count': (m, n) => `${m} of ${n}`,
    'log.sort': 'Sort', 'log.sort.new': 'Newest', 'log.sort.old': 'Oldest', 'log.sort.big': 'Longest', 'log.sort.small': 'Shortest',
    'log.noResult': 'No matches. Try another word.',
    'map.everyone': 'Everyone', 'map.onlyMine': 'Mine only', 'photo.view': 'View photo',
    'edit.title': 'Edit record', 'edit.save': 'Save', 'edit.done': 'Record updated.',

    'login.title': 'Log in', 'login.sub': 'Sign in with your nickname and password. New here? Tap Sign up.', 'login.demo': 'Demo account · 지훈 / 1234',
    'login.name': 'Nickname', 'login.pw': 'Password', 'login.signup': 'Sign up', 'login.need': 'Enter your nickname and password.',
    'login.again': 'Please log in again.', 'server.down': "Can't reach the server. Check that it is running with npm start.",
    'demo.reset': 'Reset to the demo data.',

    'set.title': 'Settings', 'set.sub': 'Manage your account, sound and language.',
    'set.account': 'Account', 'set.loggedIn': n => `Logged in as <b>${n}</b>`, 'set.logout': 'Log out',
    'set.sound': 'Sound', 'set.soundSub': 'Plays effects when you identify a photo, log a catch, unlock an achievement or level up.', 'set.on': 'On', 'set.off': 'Off',
    'set.volume': 'Volume', 'set.preview': 'Preview',
    'set.lang': 'Language', 'set.langSub': 'Choose the display language.',
    'set.demo': 'Demo data', 'set.demoSub': 'Restore every record to the starting state. Same as Shift+R.', 'set.reset': 'Reset', 'set.resetAsk': 'Reset everything?',
  },
};

// t('key') 또는 t('key', 인자...) — 함수형 문구는 인자로 채운다
function t(key, ...args) {
  const v = (LANG[SETTINGS.lang] || LANG.ko)[key] ?? LANG.ko[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}
const isEn = () => SETTINGS.lang === 'en';
