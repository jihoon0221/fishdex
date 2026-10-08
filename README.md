# 손맛어보 (Fishdex)

사진을 찍어 어종을 판별하고 나만의 도감을 채우는 낚시 도감 웹앱.
소프트웨어공학 CSE406 Phase 1 스크래치 프로젝트.

## 실행 방법

Node.js 18 이상이 필요합니다.

```bash
npm install
npm start          # → http://localhost:3000
npm test           # 데모 시나리오 검증 (node:test)
```

- 처음 실행하면 `data/fishdex.db`가 만들어지고 예시 데이터(20종, 포인트 19곳, 조과 34건)가 채워집니다.
- **데모 계정: `지훈` / `1234`** (예시 유저 새벽찌, 우럭사냥꾼 등도 비밀번호는 모두 `1234`)
- 회원가입한 새 계정은 0 XP, Lv.1에서 시작합니다. 시연 시나리오의 수치는 지훈 계정 기준입니다.
- 화면에서 **Shift+R**을 누르면 DB가 seed 상태로 초기화됩니다. 로그인은 유지됩니다.

## 주요 기능

| 기능 | CRUD | 설명 |
|---|---|---|
| 로그인 / 회원가입 | – | 닉네임과 비밀번호, 쿠키 세션 |
| 도감 | Read | 20종. 수집한 어종은 일러스트로, 미수집 어종은 실루엣으로 표시 |
| 촬영 등록 | Create | 사진 업로드 → 판별 후보 3개 → 길이, 날짜, 장소, 메모 입력 → XP, 레벨, 도전과제 축하 연출 |
| 조황 지도 | Read | 모든 유저의 기록. 가까운 지역은 숫자로 묶여 표시 |
| 내 기록 | Update / Delete | 본인 기록만 수정하거나 삭제 가능 |
| 설정 | – | 로그아웃, 효과음 켜기/끄기와 볼륨, 한국어/English 전환, 데모 데이터 초기화 |

- **일러스트**: 20종을 실제 어류 사진을 참고해 종마다 체형, 지느러미, 입, 꼬리, 무늬를 따로 정의해 SVG로 그립니다(`public/fish.js`). 광어는 위에서 본 납작한 몸, 갈치는 리본형, 학꽁치는 긴 아래턱으로 표현했습니다.
- **효과음**: Web Audio API로 합성하므로 소리 파일이 없습니다. 사진 판별, 등록, 도전과제, 레벨 업, 삭제 때 재생됩니다.
- **한/영 전환**: 화면 문구, 어종 이름과 설명, 낚시 포인트 이름, 칭호, 도전과제, 서버 오류 메시지가 모두 바뀝니다. 설정은 브라우저에 저장됩니다.

> 어종 판별은 프로토타입이라 고정 응답(참돔 94% / 감성돔 4% / 볼락 2%)을 돌려줍니다.

## 기술 스택

- **Frontend**: HTML, CSS, Vanilla JavaScript (빌드 도구 없음)
- **Backend**: Node.js 18+, Express 4
- **DB**: SQLite (better-sqlite3), 파일 `data/fishdex.db`
- **파일 업로드**: multer → `uploads/` 폴더
- **인증**: Node 내장 `crypto.scrypt` 비밀번호 해시 + httpOnly 쿠키 세션 (sessions 테이블)
- **테스트**: node:test

## 아키텍처

```
┌──────────────────────────────┐
│ 브라우저                      │
│ index.html · styles.css      │
│ app.js (화면) · api.js (fetch)│
│ progress.js (XP/레벨 계산)    │◀── 서버와 같은 파일 공유
└──────────────┬───────────────┘
               │ REST (JSON, multipart/form-data)
               │ + 세션 쿠키 (fishdex_sid)
┌──────────────▼───────────────┐
│ Express (server.js)          │
│  ├─ routes/api.js  REST API  │
│  ├─ progress.js    XP·레벨·도전과제 │
│  └─ static: public/, uploads/│
└───────┬──────────────┬───────┘
        │              │
┌───────▼──────┐ ┌─────▼────────┐
│ SQLite       │ │ uploads/     │
│ species      │ │ 조과 사진 파일 │
│ spots        │ └──────────────┘
│ catches      │
│ users        │
│ sessions     │
└──────────────┘
```

## 폴더 구조

```
fishdex/
├─ server.js         Express 앱, 정적 파일 + API 연결
├─ db.js             SQLite 연결, 테이블 생성, 비어 있으면 seed
├─ seed.js           어종 20 · 포인트 19 · 예시 조과 34 · 예시 유저
├─ progress.js       XP / 레벨 / 칭호 / 도전과제 (서버·브라우저 공용)
├─ messages.js       서버 오류 메시지 영어판 (X-Lang 헤더)
├─ routes/api.js     REST API
├─ test/progress.test.js  데모 시나리오 검증
├─ data/             fishdex.db
├─ uploads/          업로드된 사진
└─ public/
   ├─ index.html, styles.css
   ├─ app.js          화면 로직
   ├─ api.js          서버 호출
   ├─ fish.js         물고기 일러스트 생성 (SVG)
   ├─ i18n.js         한국어/English 문구와 설정 저장
   └─ sound.js        효과음 (Web Audio)
```

## API

| 메서드 | 경로 | 로그인 | 설명 |
|---|---|---|---|
| POST | `/api/login` | | `{name, password}` → 세션 쿠키 발급 |
| POST | `/api/signup` | | `{name, password}` 가입 후 바로 로그인 |
| POST | `/api/logout` | | 세션 삭제 |
| GET | `/api/me` | ✓ | `{user, xp, lv, title, pct, cur, next, speciesIds, achievements}` |
| GET | `/api/species` | | 20종 (이름, 서식지, 희귀도, 일러스트 파라미터 등) |
| GET | `/api/spots` | | 낚시 포인트 `[{n, lat, lon}]` |
| GET | `/api/catches?sid=` | | 전체 유저 조과 (지도용) |
| POST | `/api/identify` | | multipart `photo` → 판별 후보 3개 (참돔 1순위 고정 응답, 0.8~1.2초 지연) |
| POST | `/api/catches` | ✓ | multipart: `photo`(선택), `sid, len, spot, lat, lon, date, memo` → `{catch, before, after, isNew, newAch}` |
| PUT | `/api/catches/:id` | ✓ | JSON `{sid, len, spot, date, memo}`. 본인 기록만. 장소가 바뀌면 좌표 갱신 |
| DELETE | `/api/catches/:id` | ✓ | 본인 기록만. 사진 파일도 삭제 |
| POST | `/api/demo/reset` | | DB를 seed 상태로 초기화 (Shift+R) |

유효성 검사(sid 1~20, len 1~300, date 필수, 좌표 필수)에 실패하면 `400 {error: "한국어 메시지"}`를 돌려주고, 프론트는 이 메시지를 토스트로 띄웁니다.

## 게임 규칙

- XP = 10 + round(길이cm ÷ 5) + 희귀도 보너스(흔함 0, 보통 5, 희귀 15, 전설 40) + 그 유저의 첫 어종이면 30
- 날짜순으로, 같은 날짜면 id순으로 누적
- 레벨 기준 누적 XP: 0, 60, 140, 240, 360, 500, 660, 840, 1040, 1260, 1500 (최대 Lv.10)
- 도전과제 9개: 첫 손맛, 어보 입문(5종), 열 칸의 어보(10종), 어보 완성(20종), 대물 사냥꾼(50cm), 바다와 강, 전국 일주(6곳), 한 우물 파기(같은 어종 5마리), 전설의 손맛

## 데모 시나리오 (3분 영상)

장면별 조작, 내레이션, 문제 해결은 [DEMO_SCRIPT.md](DEMO_SCRIPT.md)에 있습니다.

1. 지훈 / 1234로 로그인 → 메인 도감 (9종, Lv.5, 448 XP)
2. 촬영 등록에서 참돔 사진 업로드 → 판별 1순위 참돔 94%
3. 장소 "거제 지세포", 길이 45 입력 후 등록
4. 축하 화면: +64 XP → "열 칸의 어보" 달성 → Lv.5에서 Lv.6
5. [조황 지도에서 보기] → 거제에 새 찌가 떨어지고 오른쪽에 NEW 카드
6. 내 기록에서 수정 → 삭제

`npm test`가 1번과 4번의 수치(448/Lv.5 → 512/Lv.6, dex10)를 자동으로 검증합니다.

## 생성형 AI 사용 내역

- 프론트엔드 디자인과 화면 로직(HTML/CSS/JS): Claude로 생성한 뒤 팀이 검토하고 수정
- 백엔드(Express API, SQLite 스키마, seed, 로그인 세션, 테스트): Claude Code로 생성한 뒤 팀이 검토하고 수정
