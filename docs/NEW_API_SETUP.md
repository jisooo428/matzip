# 구글 Places API (New) 설정 가이드

## 🚀 새로운 Places API 설정 방법

### 1. Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성

### 2. API 활성화
1. **API 및 서비스** → **라이브러리** 이동
2. 다음 API들을 활성화:
   - **Places API (New)** ⭐ (가장 중요!)
   - **Maps JavaScript API**
   - **Geocoding API**

### 3. API 키 생성 및 설정
1. **API 및 서비스** → **사용자 인증 정보** 이동
2. **사용자 인증 정보 만들기** → **API 키** 선택
3. 생성된 API 키를 복사

### 4. API 키 제한 설정 (보안)
1. 생성된 API 키 클릭
2. **애플리케이션 제한사항**:
   - **HTTP 리퍼러(웹사이트)** 선택
   - `http://localhost:3001/*` 추가
   - `http://127.0.0.1:3001/*` 추가

3. **API 제한사항**:
   - **키 제한** 선택
   - 다음 API만 선택:
     - Places API (New)
     - Maps JavaScript API
     - Geocoding API

### 5. 결제 계정 설정
⚠️ **중요**: 새로운 Places API는 결제 계정이 필요합니다.
1. **결제** → **결제 계정 연결**
2. 신용카드 정보 입력 (무료 크레딧 제공)

### 6. API 키 적용
1. `script.js` 파일 열기
2. `GOOGLE_API_KEY` 변수에 새 API 키 입력:
```javascript
const GOOGLE_API_KEY = 'YOUR_NEW_API_KEY_HERE';
```

### 7. 서버 재시작
```bash
node proxy-server.js
```

## 🔧 문제 해결

### 403 오류가 계속 발생하는 경우:
1. **API 활성화 확인**: Places API (New)가 활성화되었는지 확인
2. **API 키 권한 확인**: API 키에 올바른 권한이 부여되었는지 확인
3. **결제 계정 확인**: 결제 계정이 연결되었는지 확인
4. **도메인 제한 확인**: localhost가 허용되었는지 확인

### 429 오류 (할당량 초과):
- Google Cloud Console에서 할당량 확인
- 무료 크레딧 사용량 확인

## 📊 새로운 API의 장점

1. **더 정확한 검색**: 세분화된 장소 유형
2. **성능 향상**: FieldMask로 필요한 데이터만 요청
3. **위치 기반 검색**: 정확한 위치 기반 필터링
4. **향상된 데이터**: 더 풍부한 장소 정보

## 💡 팁

- 무료 크레딧: 월 $200 (약 28,000회 요청)
- 요청 최적화: FieldMask 사용으로 비용 절약
- 캐싱: 동일한 검색 결과 캐싱으로 비용 절약

## 🆘 도움이 필요한 경우

문제가 발생하면 다음을 확인하세요:
1. Google Cloud Console의 오류 로그
2. 브라우저 개발자 도구의 네트워크 탭
3. 서버 콘솔의 오류 메시지
