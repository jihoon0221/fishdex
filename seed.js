// app.js의 SPECIES / SPOTS / seed() 데이터를 그대로 옮긴 파일
const DEMO_USER = '지훈';
const DEMO_PASSWORD = '1234'; // 시연용: seed 유저 전원 공통 비밀번호

const SPECIES = [
 {id:1, name:'감성돔', en:'Black porgy', hab:'sea', rar:'normal', c:['#4E5A62','#C9D1D3','#3E4A52'], h:26,fork:6,d:12,tail:'fork', pat:{t:'bands',n:6,col:'#2C353B',o:.18}, avg:35, desc:'갯바위 낚시의 상징. 경계심이 강해 밑밥과 채비 운용이 승부를 가른다. 겨울철 남해·서해 남부에서 주로 낚인다.'},
 {id:2, name:'참돔', en:'Red seabream', hab:'sea', rar:'rare', c:['#D9576A','#F6C9C4','#C24459'], h:27,fork:8,d:11,tail:'fork', pat:{t:'spots',n:16,col:'#7FC7E8',o:.9,r:1.3}, avg:45, desc:'붉은 몸에 푸른 반점이 흩뿌려진 바다의 귀족. 타이라바·참돔 지깅으로 남해 먼바다에서 대물이 올라온다.'},
 {id:3, name:'우럭', en:'Korean rockfish', hab:'sea', rar:'common', c:['#4A4238','#A89F8E','#3A332B'], h:24,fork:0,d:14,tail:'round', pat:{t:'mottle',n:9,col:'#231E19',o:.35}, avg:30, desc:'표준명은 조피볼락. 어초와 암반 지대에 붙어 살며 선상 낚시 입문 어종으로 가장 흔하다.'},
 {id:4, name:'광어', en:'Olive flounder', hab:'sea', rar:'normal', c:['#6B6343','#C9C1A0','#57502F'], h:34,fork:-2,d:6,tail:'round', pat:{t:'spots',n:22,col:'#3A351F',o:.35,r:2.4}, avg:45, desc:'표준명은 넙치. 모래 바닥에 납작 엎드려 있다가 먹이를 덮친다. 다운샷 채비로 서해에서 많이 낚인다.'},
 {id:5, name:'농어', en:'Sea bass', hab:'sea', rar:'normal', c:['#64757E','#E3E9EB','#52626B'], h:18,fork:9,d:10,tail:'fork', pat:{t:'spots',n:10,col:'#2A3338',o:.55,r:1.1,top:true}, avg:55, desc:'은빛 몸통과 큰 입. 루어 낚시꾼들이 \"손맛의 왕\"으로 꼽는다. 여름 밤 갯바위와 방파제에서 노린다.'},
 {id:6, name:'고등어', en:'Chub mackerel', hab:'sea', rar:'common', c:['#2C6B78','#E6EDEC','#24525C'], h:16,fork:15,d:7,tail:'fork', pat:{t:'wave',col:'#14363E',o:.7}, avg:28, desc:'등의 푸른 물결무늬가 특징. 가을 방파제 카드채비에 떼로 올라와 초보도 손맛을 보기 쉽다.'},
 {id:7, name:'전갱이', en:'Horse mackerel', hab:'sea', rar:'common', c:['#6E8A80','#E5ECE6','#5B7469'], h:17,fork:14,d:8,tail:'fork', pat:{t:'stripe',col:'#C9B25A',o:.55}, avg:22, desc:'옆줄을 따라 단단한 모비늘이 이어진다. 아징(아지 루어)으로 밤 방파제에서 인기.'},
 {id:8, name:'볼락', en:'Darbled rockfish', hab:'sea', rar:'normal', c:['#7A5C47','#D8C4B0','#644A37'], h:22,fork:1,d:13,tail:'round', pat:{t:'bands',n:5,col:'#3B2A1E',o:.3}, avg:20, desc:'큰 눈으로 밤에 먹이를 찾는다. 남해 볼락 루어는 겨울 밤낚시의 꽃.'},
 {id:9, name:'쥐노래미', en:'Greenling', hab:'sea', rar:'common', c:['#6A5A3E','#CDBF9D','#584A30'], h:18,fork:2,d:9,tail:'round', pat:{t:'mottle',n:8,col:'#3A2F1C',o:.3}, avg:30, desc:'동해·서해 연안 암초 지대 어디서나 만나는 친숙한 손님. 겨울에 산란을 위해 연안으로 붙는다.'},
 {id:10, name:'학꽁치', en:'Halfbeak', hab:'sea', rar:'common', c:['#5D8E95','#EDF3F2','#4A7680'], h:8,fork:10,d:5,tail:'fork', pat:{t:'stripe',col:'#2F6E78',o:.5}, avg:25, desc:'아래턱이 바늘처럼 길게 뻗은 날씬한 물고기. 초겨울 방파제에서 떼로 몰려다닌다.'},
 {id:11, name:'방어', en:'Yellowtail', hab:'sea', rar:'rare', c:['#3D6687','#ECEFF0','#C9A93A'], h:20,fork:17,d:8,tail:'fork', pat:{t:'stripe',col:'#E4C13E',o:.85}, avg:70, desc:'옆구리를 가로지르는 노란 띠. 겨울 제주와 동해에서 지깅으로 대물이 낚인다.'},
 {id:12, name:'돌돔', en:'Striped beakperch', hab:'sea', rar:'legend', c:['#3F4A52','#D9DDD9','#2D363C'], h:30,fork:4,d:13,tail:'fork', pat:{t:'bands',n:7,col:'#15191C',o:.85}, avg:45, desc:'일곱 줄 검은 띠의 갯바위 제왕. 이빨로 성게와 소라를 부숴 먹는다. 꾼들의 평생 목표.'},
 {id:13, name:'쏘가리', en:'Mandarin fish', hab:'fresh', rar:'rare', c:['#8A7A44','#E3D9AE','#6E6033'], h:22,fork:-1,d:14,tail:'round', pat:{t:'spots',n:20,col:'#3A2D12',o:.55,r:2.6}, avg:30, desc:'표범 무늬를 두른 민물의 제왕. 맑은 여울 바위틈에 숨어 산다. 금어기를 꼭 확인할 것.'},
 {id:14, name:'배스', en:'Largemouth bass', hab:'fresh', rar:'common', c:['#4F6B3A','#DCE3C4','#3E5530'], h:22,fork:3,d:11,tail:'round', pat:{t:'stripe',col:'#26361A',o:.55,thick:true}, avg:35, desc:'커다란 입의 외래 어종. 전국 저수지와 댐에서 루어 낚시 대상어로 가장 사랑받는다.'},
 {id:15, name:'붕어', en:'Crucian carp', hab:'fresh', rar:'common', c:['#7D7A3E','#E6DFA8','#655F2C'], h:28,fork:6,d:9,tail:'fork', pat:{t:'scale'}, avg:24, desc:'민물낚시의 근본. 찌 올림의 맛 하나로 밤을 새우게 만드는 어종.'},
 {id:16, name:'잉어', en:'Common carp', hab:'fresh', rar:'normal', c:['#8E6B33','#E8D3A0','#73552A'], h:24,fork:7,d:10,tail:'fork', pat:{t:'scale'}, avg:55, desc:'강과 호수의 힘센 거구. 릴 낚싯대를 휘게 만드는 묵직한 손맛이 일품이다.'},
 {id:17, name:'끄리', en:'Korean chub', hab:'fresh', rar:'normal', c:['#62788C','#EAEFF0','#4F6476'], h:15,fork:11,d:7,tail:'fork', pat:{t:'none'}, avg:25, desc:'ㄹ자로 굽은 입이 특징인 육식성 민물고기. 강 여울에서 스푼과 미노우에 잘 반응한다.'},
 {id:18, name:'꺽지', en:'Aucha perch', hab:'fresh', rar:'rare', c:['#4E5E44','#C9CFB5','#3D4A35'], h:21,fork:-1,d:13,tail:'round', pat:{t:'bands',n:6,col:'#22291D',o:.35}, avg:15, desc:'우리나라 고유종. 아가미 뚜껑의 푸른 점이 표식. 계곡 돌 밑 텃세가 강하다.'},
 {id:19, name:'무지개송어', en:'Rainbow trout', hab:'fresh', rar:'normal', c:['#6E7D6A','#F0E9E2','#5B6A57'], h:18,fork:4,d:8,tail:'fork', pat:{t:'rainbow'}, avg:40, desc:'옆구리의 분홍 띠가 무지개처럼 빛난다. 겨울 관리형 낚시터와 평창 송어축제의 주인공.'},
 {id:20, name:'갈치', en:'Hairtail', hab:'sea', rar:'normal', c:['#B5C1C6','#EEF2F3','#A0AEB4'], h:7,fork:0,d:3,tail:'needle', pat:{t:'none'}, avg:90, desc:'칼처럼 길고 은빛으로 빛나는 몸. 가을밤 집어등 아래 선상에서 줄줄이 올라온다.'},
];

const SPOTS = [
 {n:'인천 영흥도',lat:37.25,lon:126.47},{n:'태안 신진도',lat:36.68,lon:126.14},{n:'군산 비응항',lat:35.94,lon:126.53},
 {n:'목포 북항',lat:34.8,lon:126.38},{n:'여수 돌산',lat:34.68,lon:127.76},{n:'통영 욕지도',lat:34.63,lon:128.26},
 {n:'부산 기장',lat:35.24,lon:129.22},{n:'거제 지세포',lat:34.83,lon:128.71},{n:'포항 구룡포',lat:35.99,lon:129.56},{n:'강릉 안목',lat:37.77,lon:128.95},
 {n:'속초 동명항',lat:38.21,lon:128.6},{n:'제주 서귀포',lat:33.24,lon:126.56},{n:'울릉도 저동',lat:37.5,lon:130.91},
 {n:'춘천 의암호',lat:37.88,lon:127.69},{n:'충주호',lat:36.98,lon:128.02},{n:'안동호',lat:36.62,lon:128.86},
 {n:'대청호',lat:36.45,lon:127.5},{n:'홍천강',lat:37.69,lon:127.63},{n:'평창 오대천',lat:37.5,lon:128.55}
];

// [user, sid, len, spot, date, memo] — 배열 순서가 곧 catch id (1부터)
const ROWS = [
   [DEMO_USER,3,32,'통영 욕지도','2026-09-06','어초 포인트, 생미끼'],
   [DEMO_USER,6,29,'포항 구룡포','2026-09-12','카드채비로 연타'],
   [DEMO_USER,15,24,'충주호','2026-09-14','새벽 찌올림 대박'],
   [DEMO_USER,14,38,'대청호','2026-09-20','프로그 루어'],
   [DEMO_USER,4,51,'태안 신진도','2026-09-27','다운샷, 첫 50 넘김!'],
   [DEMO_USER,1,41,'여수 돌산','2026-10-02','물때 3물, 크릴 밑밥'],
   [DEMO_USER,7,22,'부산 기장','2026-10-04','아징 1.2g 지그헤드'],
   [DEMO_USER,3,35,'통영 욕지도','2026-10-05',''],
   [DEMO_USER,8,21,'여수 돌산','2026-09-23','볼락 루어 밤낚시'],
   [DEMO_USER,10,26,'부산 기장','2026-09-30','방파제 찌낚시'],
   ['새벽찌',2,62,'통영 욕지도','2026-10-06','타이라바 80g'],['새벽찌',1,44,'여수 돌산','2026-10-03',''],
   ['새벽찌',8,21,'통영 욕지도','2026-09-28',''],['우럭사냥꾼',3,41,'인천 영흥도','2026-10-05','선상'],
   ['우럭사냥꾼',3,38,'태안 신진도','2026-09-30',''],['우럭사냥꾼',9,33,'속초 동명항','2026-09-22',''],
   ['제주바다',11,84,'제주 서귀포','2026-10-01','지깅 120g'],['제주바다',12,48,'제주 서귀포','2026-09-18','드디어 돌돔...'],
   ['제주바다',20,96,'제주 서귀포','2026-10-06','갈치 선상'],['민물덕후',13,34,'홍천강','2026-09-25','여울 바닥층'],
   ['민물덕후',18,16,'평창 오대천','2026-09-21',''],['민물덕후',17,27,'춘천 의암호','2026-10-02',''],
   ['민물덕후',16,63,'안동호','2026-09-15','릴 대물'],['손맛중독',5,68,'강릉 안목','2026-09-11','미노우'],
   ['손맛중독',6,31,'강릉 안목','2026-10-04',''],['손맛중독',10,27,'부산 기장','2026-10-06',''],
   ['낚시왕김씨',14,45,'충주호','2026-09-29',''],['낚시왕김씨',15,31,'대청호','2026-10-03','월척!'],
   ['낚시왕김씨',19,42,'평창 오대천','2026-09-17',''],['낚시왕김씨',4,58,'군산 비응항','2026-10-01',''],
   ['서해조사',4,47,'목포 북항','2026-09-26',''],['서해조사',3,30,'군산 비응항','2026-10-05',''],
   ['서해조사',7,24,'울릉도 저동','2026-09-19',''],['울릉어부',9,36,'울릉도 저동','2026-09-23',''],
];

// 좌표 흔들기: 프론트 app.js와 같은 값이 나와야 함
function jit(id, k) { const x = Math.sin(id * 12.9898 + k * 78.233) * 43758.5453; return ((x - Math.floor(x)) - .5) * 0.14; }

function seedCatches() {
  return ROWS.map((r, i) => {
    const id = i + 1, s = SPOTS.find(p => p.n === r[3]);
    return { id, user: r[0], sid: r[1], len: r[2], spot: r[3], lat: s.lat + jit(id, 0), lon: s.lon + jit(id, 1), date: r[4], memo: r[5], photo: null };
  });
}

const USERS = [...new Set(ROWS.map(r => r[0]))];

module.exports = { DEMO_USER, DEMO_PASSWORD, SPECIES, SPOTS, ROWS, USERS, jit, seedCatches };
