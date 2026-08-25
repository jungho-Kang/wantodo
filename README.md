# wantodo

주간(월~일) 단위로 할 일을 관리하는 React Native(Expo) 투두 앱입니다.
요일별 할일 배정, Backlog, Focus Session(타이머), Weekly Reset, 통계
화면 등을 갖추고 있습니다.

> 처음 이 프로젝트를 받았고 개발 환경이 하나도 없다면(Git/Node.js/VS Code
> 등을 설치해본 적 없다면) **[ONBOARDING.md](./ONBOARDING.md)** 를 먼저
> 보세요. 터미널 여는 법부터 하나하나 설명되어 있습니다.

## 기술 스택

| 분야 | 사용 기술 |
|---|---|
| 프레임워크 | [Expo](https://expo.dev) (managed workflow), React Native 0.86 |
| 언어 | TypeScript |
| 라우팅/네비게이션 | [expo-router](https://docs.expo.dev/router/introduction/) (파일 기반 라우팅) |
| 상태 관리 | [Zustand](https://github.com/pmndrs/zustand) |
| 로컬 데이터베이스 | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (SQL 직접 작성, ORM 없음) |
| 애니메이션/제스처 | [Reanimated](https://docs.swmansion.com/react-native-reanimated/) 4 + [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) 2 |
| 설정 영속화 | AsyncStorage (zustand `persist` 미들웨어) |
| 날짜 처리 | [date-fns](https://date-fns.org/) |
| 아이콘 | [@expo/vector-icons](https://icons.expo.fyi/) (MaterialIcons) |
| 캘린더 연동 | [expo-calendar](https://docs.expo.dev/versions/latest/sdk/calendar/) |
| 로컬 알림 | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) |

네이티브 코드(`android/`, `ios/` 폴더)가 없는 **managed workflow**라
Xcode/Android Studio 없이도 [Expo Go](https://expo.dev/go) 앱만으로
실제 휴대폰에서 바로 실행/확인할 수 있습니다.

## 주요 기능

### ✅ 구현 완료

| 화면 | 설명 |
|---|---|
| **Home** | Week View / List View 전환, 좌우 스와이프(다음날 이동 / 액션 메뉴), Long-press로 드래그해서 다른 요일·Backlog로 이동, 요일별 완료/전체 진행도("1/2") 표시 |
| **Focus Session** | 타이머(휠 피커) + Task 선택 후 순서대로 완료 처리 |
| **Statistics** | Backlog(완료 체크, 요일 배정, 오른쪽 스와이프로 삭제+확인 Alert) / Activity(히트맵+통계) / Archive 3개 탭 |
| **Weekly Reset** | 지난주 미완료 Task를 새 요일에 배정 (실수 시 되돌리기 가능) |
| **Settings** | General, Design(팔레트/폰트/다크모드), Account, Wishlist(빈 상태), Custom palette |
| Task Action 메뉴 | Top task 지정, Repeat weekly, 캘린더에 일정 추가, Edit, Add note, Move up/down(순서변경), Delete |
| 로컬 알림 | Weekly reminder(매주 월 09:00) / Evening reminder(매일 20:00) — Expo Go에서는 비활성화, 실제 빌드에서만 동작 |

### ⏸️ 구현하지 않음 (의도적 보류)

| 기능 | 보류 이유 |
|---|---|
| 로그인 + 클라우드 동기화 | 실제 OAuth 계정, 기기 간 동기화용 백엔드 서버 필요 |
| Wishlist 실제 데이터 (기능 요청 게시판) | 여러 사용자 데이터를 모으는 커뮤니티 기능이라 서버 필요 |
| Changelog / About / Imprint / Privacy / Terms 내용 | 실제 법적·사업자 정보가 있어야 하는 내용이라 임의로 작성하지 않음 |

## 시작하기

이미 Git/Node.js가 설치돼 있다면:

```bash
git clone <이 저장소 주소>
cd wantodo
npm install
npx expo start --tunnel
```

터미널에 뜨는 QR 코드를 휴대폰의 **Expo Go** 앱으로 스캔하면 실행됩니다.

> `expo-router`가 끌어오는 일부 패키지가 npm의 엄격한 peer-dependency
> 검사와 충돌해서, 원래는 `npm install` 실행 시마다 `--legacy-peer-deps`
> 플래그가 필요했습니다. 지금은 저장소에 포함된 `.npmrc`가 이 설정을
> 프로젝트 전체(로컬 + EAS Build 클라우드 빌드 포함)에 자동 적용해서,
> 플래그 없이 그냥 `npm install`만 실행하면 됩니다.

터미널/Git/Node.js가 처음이라면 **[ONBOARDING.md](./ONBOARDING.md)** 를 참고하세요.

## ⚠️ 클론(clone) 받았다면 먼저 확인 — 저장 위치

**이 폴더를 OneDrive, Dropbox, Google Drive 등 클라우드 동기화가 걸린
경로(예: `바탕화면`이 OneDrive 백업으로 연결돼 있는 경우) 안에 두지
마세요.** Windows에서 클라우드 백업/동기화 에이전트가 프로젝트 파일을
"클라우드 플레이스홀더"로 바꿔버리면 Metro 번들러가 파일을 심볼릭
링크로 착각해 `EINVAL: invalid argument, readlink ...` 에러로 죽고,
Expo Router의 기본 안내 화면만 뜹니다.

- **권장**: `C:\projects\...`, `C:\dev\...`처럼 동기화되지 않는 로컬
  폴더에 클론하세요.
- 이미 동기화 폴더 안에서 문제가 났다면: 프로젝트를 동기화 안 되는
  폴더로 **복사**(단순 이동이 아니라 `Copy-Item -Recurse`처럼 파일
  내용을 다시 읽어써야 클라우드 플레이스홀더 속성이 사라집니다) 후,
  새 위치에서 다시 `npm install` 하세요.

## 실행 중 자주 겪는 문제

**QR 스캔이 안 될 때** (같은 Wi-Fi인데도 연결 안 됨):

```bash
npx expo start --tunnel
```

**"Project is incompatible with this version of Expo Go"**: Play
Store의 Expo Go가 이 프로젝트의 Expo SDK 버전을 아직 지원 못 하는
경우입니다. 아래 링크를 휴대폰 브라우저로 열어 해당 SDK 버전용 Expo Go
APK를 사이드로드하세요 (출처를 알 수 없는 앱 설치 허용 필요):

```
https://expo.dev/go?sdkVersion=57&platform=android&device=true
```

**번들링이 500 에러로 실패**: 의존성이 꼬였을 가능성이 있습니다.

```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --tunnel --clear
```

**Android에서 뒤로가기를 누르면 앱이 종료됨**: 코드 버그가 아니라 Expo
Go 자체의 알려진 문제입니다 (Android의 predictive back gesture가 Expo
Go에서만 강제로 켜져 있음). dev build/production build로 넘어가면
해결됩니다.

## APK로 빌드하기 (EAS Build)

Expo Go 대신 실제 설치 가능한 APK 파일이 필요하면(로컬 알림 기능도
Expo Go에서는 비활성화되어 있어 이 방법으로만 확인 가능), Android
Studio 설치 없이 클라우드에서 빌드하는 **EAS Build**를 사용합니다.

모든 단계를 터미널에서만 진행합니다 (expo.dev 웹사이트에서 별도로
"Create a project" 같은 걸 누를 필요 없음 - 아래 명령어들이 전부 알아서
처리합니다).

### 1. Expo 계정 만들기 (없다면)

https://expo.dev 에서 회원가입만 해둡니다. 가입 후 웹사이트가 프로젝트를
만들라고 유도해도 **웹에서는 아무것도 누르지 말고, 아래 2번부터 터미널로
진행**하세요.

### 2. eas-cli 설치 + 로그인

```bash
npm install -g eas-cli
eas login
```
방금 만든 Expo 계정으로 로그인합니다.

로그인이 잘 됐는지 확인하려면:
```bash
eas whoami
```
로그인된 계정 이름이 출력되면 정상입니다 (에러가 나면 로그인이 안 된 것).

### 3. 프로젝트를 EAS와 연결 + `eas.json` 생성

```bash
eas build:configure
```

중간에 나오는 질문에는 이렇게 답하면 됩니다:
- **"Which account should own this project?"** → 본인 개인 계정(Personal) 선택 - Organization은 여러 명이 같이 쓰는 팀용이라 개인 프로젝트에는 필요 없음
- **"Would you like to automatically create an EAS project for @계정/프로젝트명?"** → **Y**
- **"Which platforms would you like to configure for EAS Build?"** → **Android** (iOS는 지금 필요 없음, All 선택하지 않기)

정상적으로 끝나면 이런 식으로 출력됩니다:

```
EAS project not configured.
√ Which account should own this project? » jungho-kang
√ Would you like to automatically create an EAS project for @jungho-kang/wantodo? ... yes
✔ Created @jungho-kang/wantodo: https://expo.dev/accounts/jungho-kang/projects/wantodo on EAS
✔ Linked local project to EAS project 5a0a6a65-73df-42d9-a38a-e9a3e7e51d8d

√ Which platforms would you like to configure for EAS Build? » Android

✔ Generated eas.json. Learn more: https://docs.expo.dev/build-reference/eas-json/

🎉 Your project is ready to build.
```

이 과정에서 `app.json`의 `extra.eas.projectId`에 프로젝트 ID가
자동으로 등록되고, `eas.json` 파일도 루트에 새로 생성됩니다. 생성된
내용은 대략 이렇습니다:

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 4. `eas.json`에 APK 설정 한 줄 추가

기본 생성 결과에는 APK로 뽑는 설정이 빠져있습니다 (그대로 두면
`preview`도 Play Store용 `.aab`가 나옵니다). `eas.json`을 열어서
`preview` 항목에 `"android": { "buildType": "apk" }`를 추가하세요:

```json
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
```

### 5. 빌드 실행

```bash
eas build --platform android --profile preview
```

**꼭 `--profile preview`로 실행하세요** (`production`이 아님) - APK가
나오는 프로필입니다.

이 명령어 실행 중에도 질문이 몇 개 더 나옵니다:
- **"What would you like your Android application id to be?"** → 기본
  제안값(예: `com.계정명.wantodo`) 그대로 Enter
- **"Generate a new Android Keystore?"** → **Y** (앱 서명용 키. 처음
  빌드라면 새로 만들면 되고, EAS가 계정에 안전하게 보관하며 다음
  빌드부터 자동 재사용함)

git에 커밋/push하지 않아도 됩니다 - `eas build`는 로컬 프로젝트 폴더를
그대로 압축해서 업로드하는 방식이라(`.git`, `node_modules`,
`.gitignore`에 걸린 파일 제외) 로컬에 저장만 해두면 반영됩니다.

클라우드에서 빌드가 진행됩니다 (보통 몇 분~20분, 무료 티어는 대기열
있을 수 있음). 끝나면 터미널과 https://expo.dev 대시보드에 다운로드
링크가 뜹니다.

**"Install dependencies" 단계에서 빌드가 실패하는 경우**: peer
dependency 충돌 때문일 가능성이 높습니다. 이 저장소에는 이미
`.npmrc`(`legacy-peer-deps=true`)가 포함돼 있어 보통 문제없지만, 혹시
이 파일이 없거나 지워졌다면 프로젝트 루트에 다시 만들어주세요.

### 6. 폰에 설치

링크를 폰 브라우저로 열어 `.apk` 다운로드 후, "출처를 알 수 없는 앱"
설치를 허용하고 설치합니다.

이렇게 빌드하면 Expo Go에서 막혀있던 **로컬 알림**과 **Android
뒤로가기 버그**가 둘 다 정상 동작합니다.

## 프로젝트 구조

```
wantodo/
├── app/                  # 화면 라우팅 (expo-router 파일 기반)
│   ├── index.tsx         # Home
│   ├── focus.tsx         # Focus Session
│   ├── statistics.tsx    # Statistics
│   ├── weekly-reset.tsx  # Weekly Reset
│   └── settings/         # Settings 하위 화면들
├── src/
│   ├── components/       # 여러 화면에서 재사용하는 Bottom Sheet 등
│   ├── db/                # SQLite 스키마 + 쿼리
│   ├── features/          # 화면별 로직/컴포넌트 (home, focus, statistics, weeklyreset)
│   ├── lib/                # 날짜 유틸, 알림 스케줄링
│   ├── store/              # Zustand 스토어 (task, drag, settings)
│   └── theme/               # 색상, 팔레트, 타이포그래피
├── ONBOARDING.md          # 개발 환경이 없는 사람을 위한 처음부터 안내
└── app.json                # Expo 설정
```
