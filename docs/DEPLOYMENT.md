# 🚀 Vercel 배포 가이드

## 📋 배포 전 준비사항

### 1. Google Places API 키 준비
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 및 Places API 활성화
3. API 키 생성 및 복사

### 2. GitHub 저장소 생성
1. [GitHub](https://github.com) 접속
2. 새 저장소 생성 (예: `restaurant-finder`)
3. 로컬 프로젝트를 GitHub에 푸시

## 🔧 Vercel 배포 단계

### 1단계: Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭

### 2단계: 프로젝트 연결
1. GitHub 저장소 선택
2. "Import" 클릭
3. 프로젝트 설정 확인

### 3단계: 환경변수 설정
Vercel 대시보드에서 다음 환경변수 추가:

```
GOOGLE_API_KEY=your_actual_api_key_here
NODE_ENV=production
```

### 4단계: 배포 설정
- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: `npm run build`
- **Output Directory**: public
- **Install Command**: `npm install`

### 5단계: 배포 실행
1. "Deploy" 버튼 클릭
2. 배포 완료까지 대기 (약 2-3분)
3. 제공된 URL로 접속 테스트

## ⚠️ 주의사항

### 데이터베이스 제한
- Vercel에서는 SQLite 파일 시스템이 제한적
- 현재 메모리 데이터베이스 사용 (서버 재시작 시 데이터 초기화)
- 영구 저장이 필요한 경우 외부 데이터베이스 사용 권장

### API 키 보안
- 환경변수로 API 키 관리
- GitHub에 API 키 직접 노출 금지
- Vercel 대시보드에서만 설정

## 🔄 자동 배포 설정

GitHub에 코드를 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

## 🛠️ 문제 해결

### 1. 빌드 실패
- `package.json`의 의존성 확인
- Node.js 버전 호환성 확인

### 2. API 오류
- 환경변수 설정 확인
- Google API 키 유효성 검증

### 3. 데이터베이스 오류
- 메모리 데이터베이스 사용 중
- 영구 저장이 필요한 경우 외부 DB 연동

## 📊 배포 후 확인사항

1. **웹사이트 접속**: 제공된 Vercel URL 확인
2. **API 테스트**: 맛집 검색 기능 테스트
3. **반응형 확인**: 모바일/데스크톱에서 UI 확인
4. **성능 확인**: 페이지 로딩 속도 확인

## 🎯 다음 단계

- [ ] 외부 데이터베이스 연동 (MongoDB, PostgreSQL)
- [ ] 사용자 인증 시스템 추가
- [ ] 이미지 업로드 기능
- [ ] 실시간 알림 기능
