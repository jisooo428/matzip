# 맛집 찾기 웹사이트 실행 방법

## 🚀 실행 방법

### 1단계: Node.js 설치 확인
```bash
node --version
npm --version
```

### 2단계: 의존성 설치
```bash
npm install
```

### 3단계: 프록시 서버 실행
```bash
npm start
```

### 4단계: 웹사이트 접속
브라우저에서 `http://localhost:3001` 접속

## 🔧 문제 해결

### CORS 오류 해결
- **문제**: 구글 Places API는 브라우저에서 직접 호출 불가
- **해결**: 프록시 서버를 통해 API 호출

### 프록시 서버가 실행되지 않는 경우
1. **포트 충돌**: 3001번 포트가 사용 중인지 확인
2. **의존성 설치**: `npm install` 실행
3. **Node.js 버전**: Node.js 14 이상 필요

### API 키 설정
`script.js` 파일에서 `GOOGLE_API_KEY` 설정:
```javascript
const GOOGLE_API_KEY = '여기에_실제_API_키_입력';
```

## 📁 파일 구조
```
vibe02/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일시트
├── script.js           # JavaScript (프론트엔드)
├── proxy-server.js     # 프록시 서버 (백엔드)
├── package.json        # Node.js 의존성
└── RUN_INSTRUCTIONS.md # 실행 방법 안내
```

## 🎯 사용 방법

1. **프록시 서버 실행**: `npm start`
2. **브라우저 접속**: `http://localhost:3001`
3. **맛집 검색**: 지역명 입력 후 검색
4. **실제 데이터**: 구글 Places API를 통한 실제 맛집 정보

## ⚠️ 주의사항

- 프록시 서버가 실행 중이어야 웹사이트가 정상 작동
- 구글 API 키가 설정되어야 실제 데이터 사용 가능
- 월 6,250회까지 무료 사용 가능
