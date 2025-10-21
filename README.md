# 🍽️ 맛집 찾기 웹사이트

구글 Places API를 활용한 실제 맛집 검색 및 관리 시스템입니다.

## 🚀 주요 기능

- **실제 맛집 검색**: 구글 Places API를 통한 실시간 맛집 정보
- **즐겨찾기 관리**: 마음에 드는 맛집을 즐겨찾기에 추가/제거
- **개인 맛집 등록**: 직접 맛집을 등록하고 관리
- **카테고리 필터링**: 한식, 중식, 일식, 양식 등으로 필터링
- **반응형 디자인**: 모바일과 데스크톱에서 모두 최적화

## 📁 프로젝트 구조

```
vibe02/
├── 📁 public/                    # 프론트엔드 파일들
│   ├── index.html               # 메인 HTML
│   ├── styles.css               # CSS 스타일
│   ├── script.js                # JavaScript 로직
│   └── images/
│       └── food.jpg             # 기본 음식 이미지
├── 📁 server/                   # 백엔드 서버
│   ├── proxy-server.js          # Express 서버
│   ├── database.js              # 데이터베이스 관리
│   └── routes/                  # API 라우트 (향후 확장)
├── 📁 data/                     # 데이터 파일
│   └── restaurants.db           # SQLite 데이터베이스
├── 📁 docs/                     # 문서
│   ├── API_SETUP.md             # API 설정 가이드
│   ├── NEW_API_SETUP.md         # 새 API 설정 가이드
│   └── RUN_INSTRUCTIONS.md      # 실행 방법
├── 📁 scripts/                  # 실행 스크립트
│   ├── start_server.bat         # Windows 실행 스크립트
│   └── start_server.sh          # Linux/Mac 실행 스크립트
├── package.json                 # Node.js 의존성
└── README.md                    # 프로젝트 개요
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 서버 실행
```bash
npm start
```

### 3. 웹사이트 접속
브라우저에서 `http://localhost:3002` 접속

## 🔧 API 설정

실제 맛집 데이터를 사용하려면 구글 Places API 키가 필요합니다.

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 및 Places API 활성화
3. API 키 생성
4. `public/script.js`에서 `GOOGLE_API_KEY` 설정

자세한 설정 방법은 `docs/` 폴더의 가이드를 참고하세요.

## 💡 사용 방법

1. **맛집 검색**: 지역명 입력 후 검색 (예: "강남구", "홍대")
2. **즐겨찾기**: 하트 버튼을 눌러 즐겨찾기에 추가
3. **개인 맛집 등록**: "내 맛집" 탭에서 직접 맛집 등록
4. **카테고리 필터**: 드롭다운에서 원하는 음식 종류 선택

## 🎯 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript (ES6+)
- **백엔드**: Node.js, Express.js
- **데이터베이스**: SQLite3
- **API**: Google Places API (New)
- **스타일링**: Font Awesome, 반응형 CSS

## 📝 라이선스

이 프로젝트는 개인 학습 목적으로 제작되었습니다.

## 🤝 기여하기

버그 리포트나 기능 제안은 언제든 환영합니다!
