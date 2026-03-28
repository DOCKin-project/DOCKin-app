# DOCKin App

Expo 기반 React Native 앱입니다. 관리자와 근로자용 화면을 함께 제공하며, 모든 AI 기능은 Spring 서버를 경유해 호출합니다.

## Stack

- Expo
- React Native
- TypeScript
- React Navigation
- Axios
- Zustand
- AsyncStorage

## Server

- 앱은 FastAPI AI 서버를 직접 호출하지 않습니다.
- 작업일지 번역, 실시간 번역, 챗봇도 모두 Spring API를 통해 요청합니다.

## Install

```bash
cd /Users/emfpdlzj/Desktop/DOCKin/DOCKin-app/dockin-app
npm install
```

## Run

```bash
npm start
```

플랫폼별 실행:

```bash
npm run android
npm run ios
npm run web
```

## Quality Check

```bash
npx tsc --noEmit
npm run lint
```

## Key Features

- 시작하기 / 로그인 / 회원가입
- 홈: 관리자 / 근로자 분기
- 작업일지 목록 / 상세 / 작성 / 수정
- 작업일지 STT 작성
- 작업일지 번역
- 실시간 음성 번역
- 채팅방 목록 / 채팅
- 챗봇
- 안전점검 / 안전 교육이수
- 근태관리
- 긴급 공지 발송
- 설정 / 로그아웃

## API Notes

- 인증 토큰은 AsyncStorage에 저장됩니다.
- 요청 시 Bearer 토큰이 자동 포함됩니다.
- 앱 서비스 레이어는 `src/services`에 분리되어 있습니다.
- 엔드포인트 이름 차이를 고려해 일부 API는 fallback 경로를 함께 지원합니다.
