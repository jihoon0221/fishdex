// app.js의 SPECIES / SPOTS / seed() 데이터를 그대로 옮긴 파일
const DEMO_USER = '지훈';
const DEMO_PASSWORD = '1234'; // 시연용: seed 유저 전원 공통 비밀번호

// 일러스트: body(체형) · dorsal(등지느러미) · anal(뒷·배지느러미) · tail(꼬리) · mouth(입) · pat(무늬) — public/fish.js가 그린다
// c: [등 색, 배 색, 지느러미 색]
const SPECIES = [
 {id:1, name:'감성돔', en:'Black porgy', hab:'sea', rar:'normal', avg:35,
  desc:'갯바위 낚시의 상징. 경계심이 강해 밑밥과 채비 운용이 승부를 가른다. 겨울철 남해·서해 남부에서 주로 낚인다.',
  descEn:'The icon of rock-shore fishing. It is wary by nature, so chumming and rig control decide the game. Mostly caught in winter along the south and southwest coasts.',
  art:{c:['#4E5A62','#D6DDDF','#3E4A52'], body:{h:27,hb:.86,hump:.4,sn:.62,ped:6.5,mo:3}, dorsal:{t:'spiny',a:.3,m:.66,b:.86,hs:12,hsoft:9,n:11}, anal:{a:.62,b:.83,h:8}, tail:{t:'fork',len:36,h:24,fork:12}, pat:[{t:'bands',n:7,a:.25,b:.85,w:4.5,col:'#2C353B',o:.16}]}},
 {id:2, name:'참돔', en:'Red seabream', hab:'sea', rar:'rare', avg:45,
  desc:'붉은 몸에 푸른 반점이 흩뿌려진 바다의 귀족. 타이라바·참돔 지깅으로 남해 먼바다에서 대물이 올라온다.',
  descEn:'The noble of the sea: a red body sprinkled with blue spots. Big ones come up from the offshore South Sea on tai-rubber and jigging rigs.',
  art:{c:['#D9576A','#F9D6D0','#C64459'], body:{h:28,hb:.85,hump:.38,sn:.66,ped:6,mo:3}, dorsal:{t:'spiny',a:.28,m:.64,b:.86,hs:13,hsoft:9,n:12}, anal:{a:.62,b:.84,h:8}, tail:{t:'fork',len:38,h:26,fork:15}, pat:[{t:'spots',n:22,col:'#6EC1E8',o:.9,r:1.2,zone:'top'}]}},
 {id:3, name:'우럭', en:'Korean rockfish', hab:'sea', rar:'common', avg:30,
  desc:'표준명은 조피볼락. 어초와 암반 지대에 붙어 살며 선상 낚시 입문 어종으로 가장 흔하다.',
  descEn:'Officially called the jacopever. It lives around reefs and rocky bottoms and is the most common first catch on boat trips.',
  art:{c:['#4A4238','#AFA693','#3A332B'], body:{h:24,hb:.92,hump:.32,sn:.3,ped:8,head:.33,eye:.22,mo:1}, dorsal:{t:'spiny',a:.3,m:.66,b:.86,hs:12,hsoft:8,n:12}, anal:{a:.64,b:.82,h:8}, tail:{t:'trunc',len:30,h:20}, mouth:'big', extra:['spines'], pat:[{t:'mottle',n:10,col:'#231E19',o:.3}]}},
 {id:4, name:'광어', en:'Olive flounder', hab:'sea', rar:'normal', avg:45,
  desc:'표준명은 넙치. 모래 바닥에 납작 엎드려 있다가 먹이를 덮친다. 다운샷 채비로 서해에서 많이 낚인다.',
  descEn:'A flatfish that lies flat on sandy bottoms and ambushes its prey. Commonly caught in the West Sea on drop-shot rigs.',
  art:{c:['#6B6343','#C9C1A0','#57502F'], form:'flat'}},
 {id:5, name:'농어', en:'Japanese sea bass', hab:'sea', rar:'normal', avg:55,
  desc:'은빛 몸통과 큰 입. 루어 낚시꾼들이 "손맛의 왕"으로 꼽는다. 여름 밤 갯바위와 방파제에서 노린다.',
  descEn:'A silver body and a big mouth. Lure anglers call it the king of the pull. Targeted from rocks and breakwaters on summer nights.',
  art:{c:['#5E707A','#E8EEF0','#4F5F68'], body:{h:19,hb:.85,hump:.42,sn:.22,ped:6,head:.3,eye:.17,mo:0}, dorsal:{t:'double',a:.3,m:.5,g:.55,b:.74,hs:10,hsoft:8,n:9}, anal:{a:.62,b:.78,h:7}, tail:{t:'fork',len:34,h:22,fork:9}, mouth:'big', pat:[{t:'spots',n:16,col:'#2A3338',o:.55,r:.9,zone:'top'}]}},
 {id:6, name:'고등어', en:'Chub mackerel', hab:'sea', rar:'common', avg:28,
  desc:'등의 푸른 물결무늬가 특징. 가을 방파제 카드채비에 떼로 올라와 초보도 손맛을 보기 쉽다.',
  descEn:'Known for the blue wavy pattern on its back. In autumn whole schools hit sabiki rigs off breakwaters, so even beginners get bites.',
  art:{c:['#2C6B78','#EEF3F2','#24525C'], body:{h:16,hb:.88,hump:.42,sn:.22,ped:3,head:.25,mo:0,xT:148}, dorsal:{t:'double',a:.3,m:.45,g:.58,b:.68,hs:9,hsoft:7,n:8,finlets:5}, anal:{a:.6,b:.7,h:6,finlets:5}, tail:{t:'fork',len:36,h:23,fork:22}, pat:[{t:'wave',col:'#14363E',o:.75,n:11}]}},
 {id:7, name:'전갱이', en:'Horse mackerel', hab:'sea', rar:'common', avg:22,
  desc:'옆줄을 따라 단단한 모비늘이 이어진다. 아징(아지 루어)으로 밤 방파제에서 인기.',
  descEn:'Hard scutes run along its lateral line. A night-time favorite on breakwaters with light aji-ing lures.',
  art:{c:['#6E8A80','#ECF1EC','#5B7469'], body:{h:17,hb:.85,hump:.4,sn:.25,ped:3,head:.25,eye:.24,mo:0}, dorsal:{t:'double',a:.3,m:.44,g:.48,b:.82,hs:9,hsoft:5,n:8}, anal:{a:.58,b:.82,h:5}, tail:{t:'fork',len:36,h:22,fork:20}, pat:[{t:'stripe',yf:.42,w:3,col:'#D8C35E',o:.5},{t:'scutes',col:'#C9B25A',o:.9}]}},
 {id:8, name:'볼락', en:'Darbled rockfish', hab:'sea', rar:'normal', avg:20,
  desc:'큰 눈으로 밤에 먹이를 찾는다. 남해 볼락 루어는 겨울 밤낚시의 꽃.',
  descEn:'It hunts at night with its big eyes. Rockfish lure fishing on the South Sea is the highlight of winter nights.',
  art:{c:['#7A5C47','#DDCBB8','#644A37'], body:{h:23,hb:.88,hump:.36,sn:.38,ped:7,head:.3,eye:.3,mo:1}, dorsal:{t:'spiny',a:.3,m:.64,b:.84,hs:12,hsoft:8,n:12}, anal:{a:.63,b:.82,h:8}, tail:{t:'trunc',len:30,h:20}, pat:[{t:'bands',n:5,a:.3,b:.85,w:6,col:'#3B2A1E',o:.25}]}},
 {id:9, name:'쥐노래미', en:'Fat greenling', hab:'sea', rar:'common', avg:30,
  desc:'동해·서해 연안 암초 지대 어디서나 만나는 친숙한 손님. 겨울에 산란을 위해 연안으로 붙는다.',
  descEn:'A familiar visitor around coastal reefs on the East and West seas. It moves inshore in winter to spawn.',
  art:{c:['#6A5A3E','#D4C6A4','#584A30'], body:{h:18,hb:.88,hump:.38,sn:.3,ped:6.5,head:.26,mo:1}, dorsal:{t:'long',a:.27,b:.92,hs:7}, anal:{a:.5,b:.9,h:6}, tail:{t:'trunc',len:28,h:17}, pat:[{t:'mottle',n:9,col:'#3A2F1C',o:.3}]}},
 {id:10, name:'학꽁치', en:'Halfbeak', hab:'sea', rar:'common', avg:25,
  desc:'아래턱이 바늘처럼 길게 뻗은 날씬한 물고기. 초겨울 방파제에서 떼로 몰려다닌다.',
  descEn:'A slender fish whose lower jaw sticks out like a needle. It gathers in schools around breakwaters in early winter.',
  art:{c:['#5D8E95','#F0F5F4','#4A7680'], body:{x0:24,xT:158,h:8,hb:.95,hump:.45,sn:.2,ped:3,head:.18,eye:.42,mo:0}, dorsal:{t:'soft',shape:'rear',a:.72,b:.86,hs:5}, anal:{a:.72,b:.86,h:4.5,pelvic:.5}, tail:{t:'fork',len:28,h:13,fork:11}, mouth:'beak', pat:[{t:'stripe',yf:.5,w:2.2,col:'#3F7F8A',o:.55}]}},
 {id:11, name:'방어', en:'Japanese amberjack', hab:'sea', rar:'rare', avg:70,
  desc:'옆구리를 가로지르는 노란 띠. 겨울 제주와 동해에서 지깅으로 대물이 낚인다.',
  descEn:'A yellow stripe runs along its side. Big ones are jigged in winter off Jeju and in the East Sea.',
  art:{c:['#3D6687','#EFF2F3','#D3B13E'], body:{h:19,hb:.88,hump:.42,sn:.28,ped:3.5,head:.26,eye:.17,mo:1}, dorsal:{t:'double',a:.3,m:.38,g:.42,b:.75,hs:4,hsoft:6,n:5}, anal:{a:.6,b:.76,h:5}, tail:{t:'fork',len:38,h:26,fork:23}, pat:[{t:'stripe',yf:.46,w:3.4,col:'#E4C13E',o:.9}]}},
 {id:12, name:'돌돔', en:'Striped beakperch', hab:'sea', rar:'legend', avg:45,
  desc:'일곱 줄 검은 띠의 갯바위 제왕. 이빨로 성게와 소라를 부숴 먹는다. 꾼들의 평생 목표.',
  descEn:'King of the rocky shore with seven black bands. It crushes sea urchins and turban shells with its beak-like teeth. A lifetime goal for many anglers.',
  art:{c:['#5A6670','#E8EBE8','#2D363C'], body:{h:30,hb:.85,hump:.38,sn:.62,ped:7,head:.25,eye:.18,mo:2}, dorsal:{t:'spiny',a:.32,m:.64,b:.86,hs:13,hsoft:10,n:11}, anal:{a:.62,b:.84,h:9}, tail:{t:'fork',len:32,h:23,fork:6}, pat:[{t:'bands',n:7,a:.06,b:.86,w:8,col:'#15191C',o:.88}]}},
 {id:13, name:'쏘가리', en:'Mandarin fish', hab:'fresh', rar:'rare', avg:30,
  desc:'표범 무늬를 두른 민물의 제왕. 맑은 여울 바위틈에 숨어 산다. 금어기를 꼭 확인할 것.',
  descEn:'The leopard-spotted king of freshwater. It hides between rocks in clear rapids. Always check the closed season.',
  art:{c:['#8A7A44','#EAE1B8','#6E6033'], body:{h:22,hb:.86,hump:.36,sn:.28,ped:7,head:.3,eye:.18,mo:0}, dorsal:{t:'spiny',a:.3,m:.62,b:.86,hs:11,hsoft:9,n:12}, anal:{a:.62,b:.82,h:8}, tail:{t:'round',len:30,h:19}, mouth:'big', pat:[{t:'spots',n:26,col:'#3A2D12',o:.6,r:2.1,zone:'all'}]}},
 {id:14, name:'배스', en:'Largemouth bass', hab:'fresh', rar:'common', avg:35,
  desc:'커다란 입의 외래 어종. 전국 저수지와 댐에서 루어 낚시 대상어로 가장 사랑받는다.',
  descEn:'An introduced species with a huge mouth. The most loved lure target in reservoirs and dam lakes across the country.',
  art:{c:['#4F6B3A','#E0E7C9','#3E5530'], body:{h:22,hb:.88,hump:.4,sn:.25,ped:7,head:.3,eye:.18,mo:0}, dorsal:{t:'double',a:.3,m:.52,g:.53,b:.8,hs:10,hsoft:9,n:9}, anal:{a:.62,b:.8,h:8}, tail:{t:'fork',len:32,h:21,fork:8}, mouth:'big', pat:[{t:'stripe',yf:.5,w:4.5,col:'#26361A',o:.45,blotch:true}]}},
 {id:15, name:'붕어', en:'Crucian carp', hab:'fresh', rar:'common', avg:24,
  desc:'민물낚시의 근본. 찌 올림의 맛 하나로 밤을 새우게 만드는 어종.',
  descEn:'The root of freshwater fishing. The rise of a float alone keeps anglers up all night.',
  art:{c:['#7D7A3E','#EAE3AE','#655F2C'], body:{h:27,hb:.9,hump:.4,sn:.45,ped:7,head:.24,eye:.17,mo:1}, dorsal:{t:'soft',shape:'long',a:.36,b:.78,hs:11}, anal:{a:.66,b:.8,h:8}, tail:{t:'fork',len:36,h:24,fork:13}, pat:[{t:'scale',col:'#655F2C',o:.35}]}},
 {id:16, name:'잉어', en:'Common carp', hab:'fresh', rar:'normal', avg:55,
  desc:'강과 호수의 힘센 거구. 릴 낚싯대를 휘게 만드는 묵직한 손맛이 일품이다.',
  descEn:'A powerful giant of rivers and lakes. Its heavy pull that bends a reel rod is the best part.',
  art:{c:['#8E6B33','#ECD9A9','#9A5A2E'], body:{h:24,hb:.9,hump:.38,sn:.42,ped:7.5,head:.25,eye:.16,mo:2}, dorsal:{t:'soft',shape:'long',a:.34,b:.8,hs:11}, anal:{a:.67,b:.8,h:8}, tail:{t:'fork',len:36,h:24,fork:12}, mouth:'barbel', pat:[{t:'scale',col:'#73552A',o:.4}]}},
 {id:17, name:'끄리', en:'Korean piscivorous chub', hab:'fresh', rar:'normal', avg:25,
  desc:'ㄹ자로 굽은 입이 특징인 육식성 민물고기. 강 여울에서 스푼과 미노우에 잘 반응한다.',
  descEn:'A predatory freshwater fish with an S-shaped, wavy mouth. It reacts well to spoons and minnows in river rapids.',
  art:{c:['#62788C','#EEF2F3','#4F6476'], body:{h:16,hb:.9,hump:.4,sn:.25,ped:5,head:.26,eye:.18,mo:0}, dorsal:{t:'soft',a:.44,b:.56,hs:10}, anal:{a:.62,b:.78,h:7}, tail:{t:'fork',len:34,h:20,fork:15}, mouth:'wavy', pat:[{t:'bands',n:9,a:.3,b:.88,w:3,col:'#3D5A78',o:.14}]}},
 {id:18, name:'꺽지', en:'Korean aucha perch', hab:'fresh', rar:'rare', avg:15,
  desc:'우리나라 고유종. 아가미 뚜껑의 푸른 점이 표식. 계곡 돌 밑 텃세가 강하다.',
  descEn:'Endemic to Korea and marked by a blue spot on its gill cover. Fiercely territorial under stones in mountain streams.',
  art:{c:['#4E5E44','#CED4BB','#3D4A35'], body:{h:21,hb:.88,hump:.36,sn:.3,ped:7,head:.3,eye:.19,mo:0}, dorsal:{t:'spiny',a:.3,m:.62,b:.86,hs:11,hsoft:9,n:12}, anal:{a:.62,b:.82,h:8}, tail:{t:'round',len:28,h:18}, mouth:'big', extra:['opercle'], pat:[{t:'bands',n:6,a:.3,b:.86,w:6,col:'#22291D',o:.3}]}},
 {id:19, name:'무지개송어', en:'Rainbow trout', hab:'fresh', rar:'normal', avg:40,
  desc:'옆구리의 분홍 띠가 무지개처럼 빛난다. 겨울 관리형 낚시터와 평창 송어축제의 주인공.',
  descEn:'The pink band on its side shines like a rainbow. Star of winter managed ponds and the Pyeongchang trout festival.',
  art:{c:['#6E7D6A','#F3EDE6','#5B6A57'], body:{h:19,hb:.88,hump:.42,sn:.3,ped:6,head:.25,eye:.16,mo:1}, dorsal:{t:'soft',a:.4,b:.52,hs:9,adipose:true}, anal:{a:.66,b:.78,h:6}, tail:{t:'fork',len:32,h:20,fork:6}, extra:['tailspots'], pat:[{t:'stripe',yf:.5,w:6,col:'#E07A8C',o:.55},{t:'spots',n:30,col:'#2E352B',o:.75,r:.8,zone:'all'}]}},
 {id:20, name:'갈치', en:'Largehead hairtail', hab:'sea', rar:'normal', avg:90,
  desc:'칼처럼 길고 은빛으로 빛나는 몸. 가을밤 집어등 아래 선상에서 줄줄이 올라온다.',
  descEn:'Long like a sword and shining silver. On autumn nights they come up one after another under the boat lights.',
  art:{c:['#AEBBC1','#F2F5F6','#9DB0B8'], form:'ribbon'}},
];

const SPOTS = [
 {n:'인천 영흥도',en:'Yeongheungdo, Incheon',lat:37.25,lon:126.47},{n:'태안 신진도',en:'Sinjindo, Taean',lat:36.68,lon:126.14},{n:'군산 비응항',en:'Bieung Port, Gunsan',lat:35.94,lon:126.53},
 {n:'목포 북항',en:'Bukhang, Mokpo',lat:34.8,lon:126.38},{n:'여수 돌산',en:'Dolsan, Yeosu',lat:34.68,lon:127.76},{n:'통영 욕지도',en:'Yokjido, Tongyeong',lat:34.63,lon:128.26},
 {n:'부산 기장',en:'Gijang, Busan',lat:35.24,lon:129.22},{n:'거제 지세포',en:'Jisepo, Geoje',lat:34.83,lon:128.71},{n:'포항 구룡포',en:'Guryongpo, Pohang',lat:35.99,lon:129.56},{n:'강릉 안목',en:'Anmok, Gangneung',lat:37.77,lon:128.95},
 {n:'속초 동명항',en:'Dongmyeong Port, Sokcho',lat:38.21,lon:128.6},{n:'제주 서귀포',en:'Seogwipo, Jeju',lat:33.24,lon:126.56},{n:'울릉도 저동',en:'Jeodong, Ulleungdo',lat:37.5,lon:130.91},
 {n:'춘천 의암호',en:'Uiam Lake, Chuncheon',lat:37.88,lon:127.69},{n:'충주호',en:'Chungju Lake',lat:36.98,lon:128.02},{n:'안동호',en:'Andong Lake',lat:36.62,lon:128.86},
 {n:'대청호',en:'Daecheong Lake',lat:36.45,lon:127.5},{n:'홍천강',en:'Hongcheon River',lat:37.69,lon:127.63},{n:'평창 오대천',en:'Odaecheon, Pyeongchang',lat:37.5,lon:128.55}
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
