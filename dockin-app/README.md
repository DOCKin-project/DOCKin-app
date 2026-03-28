# DOCKin App

Expo 기반 DOCKin 프론트엔드 앱입니다. 웹 배포는 Vercel 기준으로 구성되어 있습니다.

## Service

- Production URL: [https://dockin-app.vercel.app](https://dockin-app.vercel.app)

## Stack

- Expo 54
- React Native Web
- Expo Router
- Vercel

## Local Development

```bash
npm install
npm run web
```

## Web Build

```bash
npm run build:web
```

정상 빌드 시 정적 결과물은 `dist` 폴더에 생성됩니다.

## Vercel Deployment

Vercel 프로젝트 생성 시 아래 값으로 설정합니다.

- Application Preset: `Other`
- Root Directory: `dockin-app`
- Install Command: `npm install`
- Build Command: `npm run build:web`
- Output Directory: `dist`

## Environment Variables

운영 배포에서는 아래 환경변수를 설정해야 합니다.

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain
```

- 운영 웹은 `https` API를 사용해야 합니다.
- `http://3.34.181.59:8080` 같은 비보안 주소를 그대로 쓰면 브라우저나 WebView에서 차단될 수 있습니다.

## Vercel Analytics

Vercel Analytics가 연결되어 있습니다.

- Package: `@vercel/analytics`
- Entry: [app/_layout.tsx](/Users/emfpdlzj/Desktop/DOCKin/DOCKin-app/dockin-app/app/_layout.tsx)
- Web 환경에서만 `<Analytics />`를 렌더링합니다.

배포 후 Vercel 대시보드에서 Analytics를 활성화하면 방문 데이터가 수집됩니다.

## Project Structure

```text
dockin-app/
├── app/
├── assets/
├── src/
├── package.json
├── vercel.json
└── README.md
```
