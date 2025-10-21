// 전역 변수
let currentLocation = null;
let restaurants = [];
let filteredRestaurants = [];

// API 설정
// 구글 플레이스 API 설정
const GOOGLE_API_KEY = 'AIzaSyBkzxl2A6COd8pt8kAF6ZdooWMQ4faqQdg';
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

// DOM 요소들
const locationInput = document.getElementById('locationInput');
const categoryFilter = document.getElementById('categoryFilter');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const emptyState = document.getElementById('emptyState');
const resultsTitle = document.getElementById('resultsTitle');
const resultsCount = document.getElementById('resultsCount');
const restaurantList = document.getElementById('restaurantList');

// 탭 관련 요소들
const searchTab = document.getElementById('searchTab');
const favoritesTab = document.getElementById('favoritesTab');
const myRestaurantsTab = document.getElementById('myRestaurantsTab');
const favorites = document.getElementById('favorites');
const myRestaurants = document.getElementById('myRestaurants');
const favoritesList = document.getElementById('favoritesList');
const myRestaurantsList = document.getElementById('myRestaurantsList');
const favoritesCount = document.getElementById('favoritesCount');
const myRestaurantsCount = document.getElementById('myRestaurantsCount');
const addRestaurantBtn = document.getElementById('addRestaurantBtn');


// 즐겨찾기 API 함수들
async function addToFavorites(restaurant) {
    try {
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(restaurant)
        });
        
        if (response.ok) {
            console.log('즐겨찾기에 추가됨:', restaurant.name);
            return true;
        } else {
            console.error('즐겨찾기 추가 실패');
            return false;
        }
    } catch (error) {
        console.error('즐겨찾기 추가 오류:', error);
        return false;
    }
}

async function removeFromFavorites(placeId) {
    try {
        const response = await fetch(`/api/favorites/${placeId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('즐겨찾기에서 제거됨:', placeId);
            return true;
        } else {
            console.error('즐겨찾기 제거 실패');
            return false;
        }
    } catch (error) {
        console.error('즐겨찾기 제거 오류:', error);
        return false;
    }
}

async function getFavorites() {
    try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
            return await response.json();
        } else {
            console.error('즐겨찾기 조회 실패');
            return [];
        }
    } catch (error) {
        console.error('즐겨찾기 조회 오류:', error);
        return [];
    }
}

async function isFavorite(placeId) {
    try {
        const response = await fetch(`/api/favorites/${placeId}`);
        if (response.ok) {
            const data = await response.json();
            return data.isFavorite;
        } else {
            return false;
        }
    } catch (error) {
        console.error('즐겨찾기 확인 오류:', error);
        return false;
    }
}

// 사용자 맛집 API 함수들
async function addUserRestaurant(restaurant) {
    try {
        const response = await fetch('/api/user-restaurants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(restaurant)
        });
        
        if (response.ok) {
            console.log('사용자 맛집 등록됨:', restaurant.name);
            return true;
        } else {
            console.error('사용자 맛집 등록 실패');
            return false;
        }
    } catch (error) {
        console.error('사용자 맛집 등록 오류:', error);
        return false;
    }
}

async function getUserRestaurants() {
    try {
        const response = await fetch('/api/user-restaurants');
        if (response.ok) {
            return await response.json();
        } else {
            console.error('사용자 맛집 조회 실패');
            return [];
        }
    } catch (error) {
        console.error('사용자 맛집 조회 오류:', error);
        return [];
    }
}

async function deleteUserRestaurant(id) {
    try {
        const response = await fetch(`/api/user-restaurants/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('사용자 맛집 삭제됨:', id);
            return true;
        } else {
            console.error('사용자 맛집 삭제 실패');
            return false;
        }
    } catch (error) {
        console.error('사용자 맛집 삭제 오류:', error);
        return false;
    }
}

// 구글 Places API (New) types 배열을 한국어 음식 종류로 변환
function getKoreanFoodCategory(types) {
    if (!types || types.length === 0) return '기타';
    
    // 새로운 Places API의 세분화된 장소 유형 매핑
    const specificTypeMap = {
        // 한식
        'korean_restaurant': '한식',
        'korean_bbq_restaurant': '한식',
        'korean_fried_chicken_restaurant': '한식',
        'korean_meat_dishes_restaurant': '한식',
        'korean_noodles_restaurant': '한식',
        'korean_rice_dishes_restaurant': '한식',
        'korean_seafood_restaurant': '한식',
        'korean_soup_restaurant': '한식',
        
        // 중식
        'chinese_restaurant': '중식',
        'cantonese_restaurant': '중식',
        'dim_sum_restaurant': '중식',
        'hunan_restaurant': '중식',
        'szechuan_restaurant': '중식',
        
        // 일식
        'japanese_restaurant': '일식',
        'japanese_curry_restaurant': '일식',
        'japanese_noodles_restaurant': '일식',
        'japanese_rice_bowl_restaurant': '일식',
        'japanese_sushi_restaurant': '일식',
        'ramen_restaurant': '일식',
        'sushi_restaurant': '일식',
        'tempura_restaurant': '일식',
        'tonkatsu_restaurant': '일식',
        'udon_restaurant': '일식',
        
        // 양식
        'american_restaurant': '양식',
        'barbecue_restaurant': '양식',
        'breakfast_restaurant': '양식',
        'brunch_restaurant': '양식',
        'burger_restaurant': '양식',
        'chicken_restaurant': '양식',
        'fast_food_restaurant': '양식',
        'french_restaurant': '양식',
        'german_restaurant': '양식',
        'greek_restaurant': '양식',
        'hamburger_restaurant': '양식',
        'hot_dog_restaurant': '양식',
        'italian_restaurant': '양식',
        'mediterranean_restaurant': '양식',
        'mexican_restaurant': '양식',
        'pizza_restaurant': '양식',
        'sandwich_restaurant': '양식',
        'seafood_restaurant': '양식',
        'southern_restaurant': '양식',
        'spanish_restaurant': '양식',
        'steak_house': '양식',
        'turkish_restaurant': '양식',
        
        // 아시안
        'asian_restaurant': '아시안',
        'filipino_restaurant': '아시안',
        'indian_restaurant': '아시안',
        'indonesian_restaurant': '아시안',
        'malaysian_restaurant': '아시안',
        'nepalese_restaurant': '아시안',
        'singaporean_restaurant': '아시안',
        'thai_restaurant': '아시안',
        'vietnamese_restaurant': '아시안',
        
        // 카페 & 디저트
        'cafe': '카페',
        'coffee_shop': '카페',
        'bubble_tea_shop': '카페',
        'dessert_shop': '디저트',
        'ice_cream_shop': '디저트',
        'bakery': '디저트',
        'donut_shop': '디저트',
        'frozen_yogurt_shop': '디저트',
        'gelato_shop': '디저트',
        'pie_shop': '디저트',
        'tart_shop': '디저트',
        
        // 기타
        'bar': '바',
        'beer_bar': '바',
        'cocktail_bar': '바',
        'wine_bar': '바',
        'night_club': '클럽',
        'liquor_store': '주류점',
        'meal_delivery': '배달음식',
        'meal_takeaway': '포장마차'
    };
    
    // 구체적인 타입이 있으면 우선 사용
    for (const type of types) {
        if (specificTypeMap[type]) {
            return specificTypeMap[type];
        }
    }
    
    // 일반적인 타입들
    if (types.includes('restaurant') || types.includes('food')) {
        return '음식점';
    }
    
    return '기타';
}

// 식당 이름을 기반으로 음식 종류 추정
function getCategoryFromName(restaurantName) {
    if (!restaurantName) return null;
    
    const name = restaurantName.toLowerCase();
    
    // 한식 키워드
    if (name.includes('한식') || name.includes('김치') || name.includes('비빔밥') || 
        name.includes('불고기') || name.includes('갈비') || name.includes('삼겹살') ||
        name.includes('된장') || name.includes('김밥') || name.includes('떡볶이')) {
        return '한식';
    }
    
    // 중식 키워드
    if (name.includes('중식') || name.includes('중국') || name.includes('짜장') || 
        name.includes('짬뽕') || name.includes('탕수육') || name.includes('마파두부') ||
        name.includes('딤섬') || name.includes('중화요리')) {
        return '중식';
    }
    
    // 일식 키워드
    if (name.includes('일식') || name.includes('일본') || name.includes('스시') || 
        name.includes('라멘') || name.includes('우동') || name.includes('돈카츠') ||
        name.includes('사시미') || name.includes('텐푸라') || name.includes('규동')) {
        return '일식';
    }
    
    // 이탈리아 음식점 키워드 (양식보다 우선)
    if (name.includes('이탈리아') || name.includes('이태리') || name.includes('파스타') || 
        name.includes('피자') || name.includes('리조또') || name.includes('스테이크') ||
        name.includes('italian') || name.includes('pasta') || name.includes('pizza') ||
        name.includes('risotto') || name.includes('gnocchi') || name.includes('bruschetta')) {
        console.log('✅ 이름에서 이탈리아 음식점 발견');
        return '이탈리아 음식점';
    }
    
    // 프랑스 음식점 키워드
    if (name.includes('프랑스') || name.includes('french') || name.includes('프렌치') ||
        name.includes('크레페') || name.includes('크로와상') || name.includes('부야베스') ||
        name.includes('라타투이') || name.includes('퀴시') || name.includes('비스트로')) {
        console.log('✅ 이름에서 프랑스 음식점 발견');
        return '프랑스 음식점';
    }
    
    // 멕시코 음식점 키워드
    if (name.includes('멕시코') || name.includes('mexican') || name.includes('타코') ||
        name.includes('부리토') || name.includes('퀘사디아') || name.includes('나초') ||
        name.includes('치미차가') || name.includes('엔칠라다')) {
        console.log('✅ 이름에서 멕시코 음식점 발견');
        return '멕시코 음식점';
    }
    
    // 태국 음식점 키워드
    if (name.includes('태국') || name.includes('thai') || name.includes('팟타이') ||
        name.includes('똠얌') || name.includes('커리') || name.includes('파드') ||
        name.includes('쏨땀') || name.includes('라브') || name.includes('마사만')) {
        console.log('✅ 이름에서 태국 음식점 발견');
        return '태국 음식점';
    }
    
    // 베트남 음식점 키워드
    if (name.includes('베트남') || name.includes('vietnamese') || name.includes('분짜') ||
        name.includes('포') || name.includes('반미') || name.includes('고이꾸온') ||
        name.includes('쌀국수') || name.includes('봄샐러드')) {
        console.log('✅ 이름에서 베트남 음식점 발견');
        return '베트남 음식점';
    }
    
    // 인도 음식점 키워드
    if (name.includes('인도') || name.includes('indian') || name.includes('커리') ||
        name.includes('나안') || name.includes('빈달루') || name.includes('티카') ||
        name.includes('마살라') || name.includes('탄두리') || name.includes('비리야니')) {
        console.log('✅ 이름에서 인도 음식점 발견');
        return '인도 음식점';
    }
    
    // 양식 키워드 (이탈리아 음식점 키워드에 해당하지 않을 경우)
    if (name.includes('양식') || name.includes('서양') || name.includes('레스토랑') ||
        name.includes('브런치') || name.includes('샐러드') || name.includes('스테이크') ||
        name.includes('restaurant') || name.includes('bistro') || name.includes('grill')) {
        console.log('✅ 이름에서 양식 발견');
        return '양식';
    }
    
    // 아시안 키워드
    if (name.includes('태국') || name.includes('베트남') || name.includes('인도') || 
        name.includes('태국') || name.includes('커리') || name.includes('팟타이') ||
        name.includes('똠얌') || name.includes('분짜')) {
        return '아시안';
    }
    
    return null;
}

// Place Details API에서 음식 종류 추출 (개선된 버전)
function getCategoryFromPlaceDetails(placeDetails) {
    if (!placeDetails) return null;
    
    console.log('🔍 Place Details 분석 중:', placeDetails.name, placeDetails.types);
    
    // types 배열에서 더 구체적인 분류
    if (placeDetails.types) {
        const specificTypeMap = {
            'meal_takeaway': '포장마차',
            'cafe': '카페',
            'bar': '바',
            'bakery': '베이커리',
            'meal_delivery': '배달음식',
            'night_club': '클럽',
            'liquor_store': '주류점',
            'pizza': '이탈리아 음식점',
            'hamburger': '양식',
            'sandwich': '양식',
            'sushi': '일식',
            'ramen': '일식',
            'chinese_restaurant': '중식',
            'korean_restaurant': '한식',
            'japanese_restaurant': '일식',
            'italian_restaurant': '이탈리아 음식점',
            'mexican_restaurant': '멕시코 음식점',
            'thai_restaurant': '태국 음식점',
            'vietnamese_restaurant': '베트남 음식점',
            'indian_restaurant': '인도 음식점',
            'french_restaurant': '프랑스 음식점',
            'american_restaurant': '미국 음식점'
        };
        
        for (const type of placeDetails.types) {
            if (specificTypeMap[type]) {
                console.log('✅ Place Details에서 분류 발견:', type, '→', specificTypeMap[type]);
                return specificTypeMap[type];
            }
        }
    }
    
    // editorial_summary에서 음식 종류 추출
    if (placeDetails.editorial_summary && placeDetails.editorial_summary.overview) {
        const summary = placeDetails.editorial_summary.overview.toLowerCase();
        console.log('📝 editorial_summary:', summary);
        
        if (summary.includes('이탈리아') || summary.includes('이태리') || summary.includes('italian')) {
            console.log('✅ editorial_summary에서 이탈리아 발견');
            return '이탈리아 음식점';
        }
        if (summary.includes('일본') || summary.includes('japanese') || summary.includes('스시')) {
            console.log('✅ editorial_summary에서 일식 발견');
            return '일식';
        }
        if (summary.includes('중국') || summary.includes('chinese') || summary.includes('짜장')) {
            console.log('✅ editorial_summary에서 중식 발견');
            return '중식';
        }
        if (summary.includes('한국') || summary.includes('korean') || summary.includes('한식')) {
            console.log('✅ editorial_summary에서 한식 발견');
            return '한식';
        }
        if (summary.includes('프랑스') || summary.includes('french')) {
            console.log('✅ editorial_summary에서 프랑스 발견');
            return '프랑스 음식점';
        }
        if (summary.includes('멕시코') || summary.includes('mexican')) {
            console.log('✅ editorial_summary에서 멕시코 발견');
            return '멕시코 음식점';
        }
        if (summary.includes('태국') || summary.includes('thai')) {
            console.log('✅ editorial_summary에서 태국 발견');
            return '태국 음식점';
        }
        if (summary.includes('베트남') || summary.includes('vietnamese')) {
            console.log('✅ editorial_summary에서 베트남 발견');
            return '베트남 음식점';
        }
        if (summary.includes('인도') || summary.includes('indian')) {
            console.log('✅ editorial_summary에서 인도 발견');
            return '인도 음식점';
        }
    }
    
    console.log('❌ Place Details에서 분류 정보 없음');
    return null;
}

// 구글 API types를 한국어 설명으로 변환
function getKoreanDescription(types) {
    if (!types || types.length === 0) return '맛집 정보';
    
    const descriptionMap = {
        'restaurant': '맛집',
        'meal_takeaway': '포장마차',
        'food': '음식점',
        'cafe': '카페',
        'bar': '바',
        'bakery': '베이커리',
        'meal_delivery': '배달음식',
        'night_club': '클럽',
        'liquor_store': '주류점',
        'point_of_interest': '관광지',
        'establishment': '업소'
    };
    
    const koreanTypes = types.map(type => descriptionMap[type] || type).filter(Boolean);
    return koreanTypes.length > 0 ? koreanTypes.join(', ') : '맛집 정보';
}

// 장소 카테고리 분류 (기존 함수 유지)
function categorizePlace(categoryName) {
    if (!categoryName) return '기타';
    
    const category = categoryName.toLowerCase();
    
    if (category.includes('한식') || category.includes('김치') || category.includes('비빔밥')) {
        return '한식';
    } else if (category.includes('중식') || category.includes('중국') || category.includes('짜장')) {
        return '중식';
    } else if (category.includes('일식') || category.includes('일본') || category.includes('스시') || category.includes('라멘')) {
        return '일식';
    } else if (category.includes('양식') || category.includes('서양') || category.includes('이탈리안') || category.includes('프랑스')) {
        return '양식';
    } else if (category.includes('카페') || category.includes('커피') || category.includes('음료')) {
        return '카페';
    } else if (category.includes('디저트') || category.includes('베이커리') || category.includes('케이크')) {
        return '디저트';
    } else {
        return '기타';
    }
}

// 가격 레벨 텍스트 변환
function getPriceLevelText(priceLevel) {
    switch(priceLevel) {
        case 0: return '가격 정보 없음';
        case 1: return '만원 이하 (점심 추천!)';
        case 2: return '1-2만원 (가성비 최고!)';
        case 3: return '2-3만원 (보통)';
        case 4: return '3만원 이상 (고급)';
        default: return '가격 정보 없음';
    }
}

// 구글 플레이스 사진 URL 생성 (새로운 Places API 형식)
function getGooglePhotoUrl(photoReference, maxWidth = 400) {
    if (!photoReference) return null;
    
    // 새로운 Places API의 사진 참조 형식 확인
    if (photoReference.startsWith('places/')) {
        // 새로운 형식: places/ChIJ.../photos/...
        return `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}`;
    } else {
        // 기존 형식: ChIJ... (fallback)
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
    }
}

// 기본 음식 이미지 생성 함수
function getDefaultFoodImage() {
    // 프로젝트의 food.jpg 파일 사용
    return 'images/food.jpg';
}

// 음식 사진을 우선적으로 선택하는 함수 (강화된 버전)
function getBestFoodPhoto(restaurant) {
    if (!restaurant.photos || restaurant.photos.length === 0) {
        return getDefaultFoodImage();
    }
    
    const photos = restaurant.photos;
    
    // 1. 사진들을 점수로 평가하여 음식 사진일 가능성이 높은 것 선택
    const scoredPhotos = photos.map((photo, index) => {
        let score = 0;
        
        // 크기 점수 (적절한 크기일수록 높은 점수)
        if (photo.width && photo.height) {
            const area = photo.width * photo.height;
            if (area >= 500000) score += 5; // 500x1000 이상 (고화질)
            else if (area >= 300000) score += 4; // 300x1000 이상
            else if (area >= 150000) score += 3; // 300x500 이상
            else if (area >= 75000) score += 2; // 300x250 이상
            else if (area >= 50000) score += 1; // 250x200 이상
        }
        
        // 가로세로 비율 점수 (음식 사진은 보통 4:3 또는 16:9 비율)
        if (photo.width && photo.height) {
            const ratio = photo.width / photo.height;
            if (ratio >= 1.2 && ratio <= 1.8) score += 5; // 4:3 비율 (음식 사진에 최적)
            else if (ratio >= 1.5 && ratio <= 2.2) score += 4; // 16:9 비율
            else if (ratio >= 1.0 && ratio <= 2.5) score += 3; // 가로형
            else if (ratio > 0.8 && ratio < 1.2) score += 2; // 정사각형
            else score += 1; // 세로형
        }
        
        // 순서 점수 (뒤쪽 사진일수록 음식 사진일 가능성이 높음)
        // 첫 번째 사진은 보통 외관, 마지막 사진들은 음식일 가능성이 높음
        if (index === 0) score -= 2; // 첫 번째 사진은 외관일 가능성 높음
        else if (index >= photos.length - 3) score += 4; // 마지막 3개 사진
        else if (index >= photos.length - 5) score += 2; // 마지막 5개 사진
        else score += 1; // 중간 사진들
        
        // 사진 인덱스 기반 점수 (뒤쪽일수록 높은 점수)
        score += (photos.length - index) * 0.8;
        
        // 최소 크기 요구사항 (너무 작은 사진 제외)
        if (photo.width && photo.width < 150) score = 0;
        if (photo.height && photo.height < 100) score = 0;
        
        // 최대 크기 제한 (너무 큰 사진은 외관일 가능성 높음)
        if (photo.width && photo.width > 2000) score -= 1;
        if (photo.height && photo.height > 1500) score -= 1;
        
        return { photo, score, index };
    });
    
    // 점수가 높은 순으로 정렬
    scoredPhotos.sort((a, b) => b.score - a.score);
    
    // 상위 3개 사진 중에서 선택 (더 안전한 선택)
    const topPhotos = scoredPhotos.slice(0, 3);
    
    // 최고 점수 사진 선택 (점수가 0보다 큰 경우만)
    const selectedPhoto = topPhotos.find(p => p.score > 0) || photos[0];
    
    console.log(`🍽️ ${restaurant.name} 사진 선택:`, {
        totalPhotos: photos.length,
        selectedIndex: selectedPhoto.index,
        score: selectedPhoto.score,
        dimensions: `${selectedPhoto.photo.width}x${selectedPhoto.photo.height}`
    });
    
    return getGooglePhotoUrl(selectedPhoto.photo.photo_reference, 400);
}

// 구글 Place Details API로 상세 정보 가져오기
async function getPlaceDetails(placeId) {
    if (GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
        return null;
    }
    
    try {
        const proxyUrl = `http://localhost:3002/api/place-details?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            console.error('Place Details API 오류:', response.status);
            return null;
        }
        
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Place Details API 호출 중 오류:', error);
        return null;
    }
}

// 리뷰 요약 생성 (최대 3개)
function getReviewsSummary(reviews) {
    if (!reviews || reviews.length === 0) return '';
    
    const maxReviews = 3;
    const reviewTexts = reviews.slice(0, maxReviews).map(review => {
        const text = review.text || '';
        const truncatedText = text.length > 100 ? text.substring(0, 100) + '...' : text;
        return `<div class="review-item">
            <div class="review-rating">${'★'.repeat(review.rating || 0)}${'☆'.repeat(5 - (review.rating || 0))}</div>
            <div class="review-text">${truncatedText}</div>
            <div class="review-author">- ${review.author_name || '익명'}</div>
        </div>`;
    }).join('');
    
    return `<div class="reviews-summary">
        <h4><i class="fas fa-comments"></i> 최근 리뷰</h4>
        ${reviewTexts}
    </div>`;
}

// 두 좌표 간 거리 계산 (km)
function calculateDistance(loc1, loc2) {
    if (!loc1 || !loc2) return 0;
    
    const R = 6371; // 지구 반지름 (km)
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // 소수점 첫째자리까지
}

// 구글 플레이스 API 호출 함수 (프록시 서버 사용) - 다양한 키워드로 검색
async function searchGooglePlaces(query, maxResults = 60) {
    if (GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
        console.log('구글 API 키가 설정되지 않음');
        return [];
    }
    
    console.log('🔍 구글 Places API (New) 검색 중:', query, `(최대 ${maxResults}개)`);
    
    try {
        // 저렴한 점심 맛집을 강조하는 검색 키워드
        const searchQueries = [
            `${query} 만원 맛집`,
            `${query} 만원대 맛집`,
            `${query} 저렴한 점심`,
            `${query} 가성비 점심`,
            `${query} 1만원 맛집`,
            `${query} 2만원 맛집`,
            `${query} 점심 맛집`,
            `${query} 가성비 맛집`,
            `${query} 저렴한 맛집`,
            `${query} 맛집`
        ];
        
        let allResults = [];
        const seenIds = new Set();
        
        // 각 키워드로 검색
        for (let i = 0; i < searchQueries.length; i++) {
            const searchQuery = searchQueries[i];
            console.log(`🔍 키워드 ${i + 1}/${searchQueries.length} 검색:`, searchQuery);
            
            try {
                // 새로운 API를 사용하여 위치 기반 검색 (카테고리 필터링 포함)
                const selectedCategory = categoryFilter.value;
                const proxyUrl = getSearchUrlWithTypeFilter(searchQuery, selectedCategory);
                
                console.log('🔗 프록시 서버 URL:', proxyUrl);
                
                const response = await fetch(proxyUrl);
                console.log('📡 프록시 서버 응답 상태:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ 프록시 서버 오류 응답:', errorText);
                    continue; // 다음 키워드로 계속
                }
                
                const data = await response.json();
                console.log(`📊 키워드 "${searchQuery}" 결과:`, data.results?.length || 0, '개');
                
                if (data.results && data.results.length > 0) {
                    const processedResults = await Promise.all(data.results.map(async (place) => {
                        console.log('🏪 구글 장소 처리 중:', place.name);
                        
                        // Place Details API로 상세 정보 가져오기
                        const placeDetails = await getPlaceDetails(place.place_id);
                        
                        // 분류 우선순위: Place Details > 이름 > types
                        const detailsCategory = placeDetails ? getCategoryFromPlaceDetails(placeDetails) : null;
                        const nameCategory = getCategoryFromName(place.name);
                        const typeCategory = getKoreanFoodCategory(place.types);
                        const finalCategory = detailsCategory || nameCategory || typeCategory;
                        
                        console.log('🏷️ 최종 분류 결과:', {
                            name: place.name,
                            detailsCategory,
                            nameCategory,
                            typeCategory,
                            finalCategory
                        });
                        
                        return {
                            id: place.place_id,
                            name: place.name,
                            category: finalCategory,
                            address: place.formatted_address,
                            rating: place.rating || 0,
                            reviewCount: place.user_ratings_total || 0,
                            distance: calculateDistance(currentLocation, {
                                lat: place.geometry.location.lat,
                                lng: place.geometry.location.lng
                            }),
                            phone: place.formatted_phone_number || '',
                            url: place.website || '',
                            description: getKoreanDescription(place.types),
                            priceLevel: place.price_level || 0,
                            photos: place.photos || [],
                            reviews: place.reviews || [],
                            placeId: place.place_id,
                            placeDetails: placeDetails // 상세 정보 저장
                        };
                    }));
                    
                    // 중복 제거하면서 추가
                    for (const result of processedResults) {
                        if (!seenIds.has(result.id)) {
                            seenIds.add(result.id);
                            allResults.push(result);
                        }
                    }
                    
                    console.log(`✅ 키워드 "${searchQuery}" 처리 완료:`, processedResults.length, '개 (총', allResults.length, '개)');
                }
                
                // 키워드 간 잠시 대기 (API 제한 방지)
                if (i < searchQueries.length - 1) {
                    console.log('⏳ 다음 키워드 검색 대기 중... (1초)');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (error) {
                console.error(`❌ 키워드 "${searchQuery}" 검색 중 오류:`, error);
                continue; // 다음 키워드로 계속
            }
        }
        
        // 고급 레스토랑 필터링 및 가격대별 정렬
        const affordableResults = allResults.filter(restaurant => {
            // 가격 레벨 3 이상(비싼 곳)은 제외
            if (restaurant.priceLevel && restaurant.priceLevel >= 3) {
                return false;
            }
            
            // 이름에 고급/프리미엄/파인다이닝/고깃집 등이 포함된 곳 제외
            const name = restaurant.name.toLowerCase();
            const excludeKeywords = [
                '고우가', '파인다이닝', '프리미엄', '고급', '럭셔리', '미슐랭', '스타', 'chef', 'fine dining',
                '고깃집', '고기집', '삼겹살', '갈비', '바베큐', 'bbq', '스테이크', 'steak', '육류', '고기',
                '한우', '구이', '로스구이', '숯불', '참치', '회', '초밥', '스시', '오마카세',
                '회식', '술집', '호프', '펜션', '모텔', '호텔'
            ];
            return !excludeKeywords.some(keyword => name.includes(keyword));
        });
        
        // 가격대별로 정렬하여 가성비 좋은 곳 우선 표시
        affordableResults.sort((a, b) => {
            // 가격 레벨이 낮은 순으로 정렬 (1-2만원대 우선)
            const priceA = a.priceLevel || 0;
            const priceB = b.priceLevel || 0;
            if (priceA !== priceB) {
                return priceA - priceB;
            }
            // 가격이 같으면 평점 높은 순
            return (b.rating || 0) - (a.rating || 0);
        });
        
        allResults = affordableResults;
        
        // 자연스러운 결과 수 (최대 60개로 제한)
        const finalResults = allResults.slice(0, Math.min(maxResults, allResults.length));
        console.log('🎉 최종 검색 결과:', finalResults.length, '개 (만원대 점심 맛집 필터링 완료)');
        console.log('💰 가격대 분포:', finalResults.map(r => `${r.name}: ${r.priceLevel || 0}레벨`).slice(0, 5));
        return finalResults;
        
    } catch (error) {
        console.error('❌ 구글 API 검색 중 오류:', error);
        console.error('❌ 오류 타입:', error.name);
        console.error('❌ 오류 메시지:', error.message);
        return [];
    }
}

// 시뮬레이션 맛집 데이터 생성
function generateSimulatedRestaurants(query) {
    const simulatedRestaurants = [
        {
            id: `sim_${query}_1`,
            name: `${query} 맛있는 한식당`,
            category: "한식",
            address: `${query} 테헤란로 123`,
            rating: 4.3,
            reviewCount: Math.floor(Math.random() * 200) + 50,
            distance: (Math.random() * 2 + 0.1).toFixed(1),
            phone: "02-1234-5678",
            description: "정통 한식의 맛을 느낄 수 있는 곳"
        },
        {
            id: `sim_${query}_2`,
            name: `${query} 도쿄 스시`,
            category: "일식",
            address: `${query} 선릉로 456`,
            rating: 4.7,
            reviewCount: Math.floor(Math.random() * 150) + 30,
            distance: (Math.random() * 2 + 0.2).toFixed(1),
            phone: "02-2345-6789",
            description: "신선한 회와 정통 스시"
        },
        {
            id: `sim_${query}_3`,
            name: `${query} 이탈리안 비스트로`,
            category: "양식",
            address: `${query} 도곡로 789`,
            rating: 4.1,
            reviewCount: Math.floor(Math.random() * 180) + 40,
            distance: (Math.random() * 2 + 0.3).toFixed(1),
            phone: "02-3456-7890",
            description: "정통 이탈리안 파스타와 피자"
        },
        {
            id: `sim_${query}_4`,
            name: `${query} 차이나 팰리스`,
            category: "중식",
            address: `${query} 봉은사로 321`,
            rating: 4.2,
            reviewCount: Math.floor(Math.random() * 220) + 60,
            distance: (Math.random() * 2 + 0.4).toFixed(1),
            phone: "02-4567-8901",
            description: "정통 중국 요리의 진수"
        },
        {
            id: `sim_${query}_5`,
            name: `${query} 카페 드 파리`,
            category: "카페",
            address: `${query} 언주로 654`,
            rating: 4.5,
            reviewCount: Math.floor(Math.random() * 120) + 25,
            distance: (Math.random() * 2 + 0.5).toFixed(1),
            phone: "02-5678-9012",
            description: "아늑한 분위기의 프랑스 카페"
        },
        {
            id: `sim_${query}_6`,
            name: `${query} 디저트 하우스`,
            category: "디저트",
            address: `${query} 삼성로 987`,
            rating: 4.4,
            reviewCount: Math.floor(Math.random() * 160) + 35,
            distance: (Math.random() * 2 + 0.6).toFixed(1),
            phone: "02-6789-0123",
            description: "수제 디저트의 달콤한 맛"
        }
    ];
    
    // 거리순으로 정렬
    return simulatedRestaurants.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

// 샘플 맛집 데이터
const sampleRestaurants = [
    {
        id: 1,
        name: "맛있는 한식당",
        category: "한식",
        address: "서울시 강남구 테헤란로 123",
        rating: 4.5,
        reviewCount: 128,
        distance: 0.3,
        description: "정통 한식의 맛을 느낄 수 있는 곳"
    },
    {
        id: 2,
        name: "도쿄 스시",
        category: "일식",
        address: "서울시 강남구 선릉로 456",
        rating: 4.8,
        reviewCount: 89,
        distance: 0.5,
        description: "신선한 회와 정통 스시"
    },
    {
        id: 3,
        name: "이탈리안 비스트로",
        category: "양식",
        address: "서울시 강남구 도곡로 789",
        rating: 4.3,
        reviewCount: 156,
        distance: 0.7,
        description: "정통 이탈리안 파스타와 피자"
    },
    {
        id: 4,
        name: "차이나 팰리스",
        category: "중식",
        address: "서울시 강남구 봉은사로 321",
        rating: 4.2,
        reviewCount: 203,
        distance: 0.9,
        description: "정통 중국 요리의 진수"
    },
    {
        id: 5,
        name: "카페 드 파리",
        category: "카페",
        address: "서울시 강남구 언주로 654",
        rating: 4.6,
        reviewCount: 95,
        distance: 1.2,
        description: "아늑한 분위기의 프랑스 카페"
    },
    {
        id: 6,
        name: "디저트 하우스",
        category: "디저트",
        address: "서울시 강남구 삼성로 987",
        rating: 4.4,
        reviewCount: 167,
        distance: 1.5,
        description: "수제 디저트의 달콤한 맛"
    },
    {
        id: 7,
        name: "맛있는 치킨집",
        category: "한식",
        address: "서울시 강남구 역삼로 147",
        rating: 4.1,
        reviewCount: 234,
        distance: 0.8,
        description: "바삭한 치킨과 다양한 소스"
    },
    {
        id: 8,
        name: "라멘 마스터",
        category: "일식",
        address: "서울시 강남구 선릉로 258",
        rating: 4.7,
        reviewCount: 112,
        distance: 1.1,
        description: "진한 돈코츠 라멘의 진수"
    }
];

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    searchBtn.addEventListener('click', searchRestaurants);
    categoryFilter.addEventListener('change', filterRestaurants);
    
    // 탭 전환 이벤트
    searchTab.addEventListener('click', () => switchTab('search'));
    favoritesTab.addEventListener('click', () => switchTab('favorites'));
    myRestaurantsTab.addEventListener('click', () => switchTab('myRestaurants'));
    
    // 맛집 추가 버튼
    addRestaurantBtn.addEventListener('click', showAddRestaurantModal);
    
    // 엔터키로 검색
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchRestaurants();
        }
    });
    
    // 초기 로드 시 즐겨찾기와 내 맛집 로드
    loadFavorites();
    loadMyRestaurants();
});


// 맛집 검색
async function searchRestaurants() {
    const location = locationInput.value.trim();
    
    if (!location) {
        alert('지역을 입력하거나 현재 위치를 사용해주세요.');
        return;
    }

    showLoading();
    
    try {
        // 구글 플레이스 API로 실제 맛집 데이터 검색 (평점 포함) - 최대 60개
        console.log('🔍 구글 API 검색 시작:', location);
        const searchResults = await searchGooglePlaces(location, 60);
        
        console.log('📊 구글 API 검색 결과:', searchResults);
        console.log('📊 결과 개수:', searchResults.length);
        
        if (searchResults.length === 0) {
            // 구글 API 결과가 없으면 시뮬레이션 데이터 사용
            console.log('❌ 구글 API 결과 없음, 시뮬레이션 데이터 사용');
            restaurants = [...sampleRestaurants];
            alert('해당 지역에서 맛집을 찾을 수 없어 샘플 데이터를 표시합니다.');
        } else {
            restaurants = searchResults;
            console.log('🎉 구글 플레이스 API 데이터 사용 중:', restaurants.length, '개');
            console.log('실제 평점 정보 포함:', restaurants.map(r => ({ 
                name: r.name, 
                rating: r.rating, 
                reviewCount: r.reviewCount 
            })));
        }
        
        filteredRestaurants = [...restaurants];
        
        hideLoading();
        displayResults();
        
    } catch (error) {
        console.error('맛집 검색 중 오류 발생:', error);
        console.error('오류 상세:', error.message);
        
        // API 오류 시 샘플 데이터 사용
        restaurants = [...sampleRestaurants];
        filteredRestaurants = [...restaurants];
        
        hideLoading();
        displayResults();
        
        // 더 자세한 오류 메시지 표시
        let errorMessage = '맛집 검색 중 오류가 발생했습니다.';
        if (error.message.includes('API 키가 설정되지 않았습니다')) {
            errorMessage = 'API 키가 설정되지 않았습니다. 샘플 데이터를 표시합니다.';
        } else if (error.message.includes('CORS')) {
            errorMessage = 'CORS 오류가 발생했습니다. 로컬 서버를 사용해주세요.';
        } else if (error.message.includes('HTTP error')) {
            errorMessage = 'API 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        alert(errorMessage + ' 샘플 데이터를 표시합니다.');
    }
}

// 맛집 필터링
function filterRestaurants() {
    const category = categoryFilter.value;
    
    if (category === '') {
        filteredRestaurants = [...restaurants];
    } else {
        filteredRestaurants = restaurants.filter(restaurant => 
            restaurant.category === category
        );
    }
    
    displayResults();
}

// 새로운 Places API의 장소 유형을 활용한 고급 필터링
function getPlaceTypeForCategory(category) {
    const categoryToTypeMap = {
        '한식': 'korean_restaurant',
        '중식': 'chinese_restaurant', 
        '일식': 'japanese_restaurant',
        '양식': 'american_restaurant',
        '아시안': 'asian_restaurant',
        '카페': 'cafe',
        '디저트': 'dessert_shop',
        '바': 'bar'
    };
    
    return categoryToTypeMap[category] || null;
}

// API 호출 시 장소 유형 필터링 적용
function getSearchUrlWithTypeFilter(query, category) {
    let baseUrl = `http://localhost:3002/api/places?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    
    // 현재 위치가 있으면 위치 기반 검색 추가
    if (currentLocation) {
        baseUrl += `&location=${currentLocation.lat},${currentLocation.lng}&radius=5000`;
    }
    
    // 카테고리별 장소 유형 필터링
    const placeType = getPlaceTypeForCategory(category);
    if (placeType) {
        baseUrl += `&type=${placeType}`;
    }
    
    return baseUrl;
}


// 결과 표시
function displayResults() {
    if (filteredRestaurants.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    results.classList.remove('hidden');
    
    resultsTitle.textContent = `검색 결과 (${locationInput.value})`;
    resultsCount.textContent = filteredRestaurants.length;
    
    restaurantList.innerHTML = '';
    
    filteredRestaurants.forEach(restaurant => {
        const restaurantCard = createRestaurantCard(restaurant);
        restaurantList.appendChild(restaurantCard);
    });
}

// 맛집 카드 생성
function createRestaurantCard(restaurant, isFavorite = false) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    
    // 사진 섹션 (음식 사진 우선 선택)
    const photoUrl = getBestFoodPhoto(restaurant);
    
    const photoSection = `
        <div class="restaurant-photo">
            <img src="${photoUrl}" alt="${restaurant.name}" loading="lazy" 
                 onerror="this.src='${getDefaultFoodImage()}'">
        </div>
    `;
    
    // 평점이 있는 경우에만 별표 표시
    const ratingSection = restaurant.rating > 0 ? 
        `<div class="restaurant-rating">
            <span class="stars">${'★'.repeat(Math.floor(restaurant.rating))}${'☆'.repeat(5 - Math.floor(restaurant.rating))}</span>
            <span class="rating-text">${restaurant.rating} (${restaurant.reviewCount}리뷰)</span>
        </div>` : 
        `<div class="restaurant-rating">
            <span class="rating-text">평점 정보 없음</span>
        </div>`;
    
    // 전화번호가 있는 경우 표시
    const phoneSection = restaurant.phone ? 
        `<div class="restaurant-phone">
            <i class="fas fa-phone"></i>
            ${restaurant.phone}
        </div>` : '';
    
    // 가격 레벨 표시 (구글 API) - 가격 정보가 있을 때만 표시
    const priceLevel = restaurant.priceLevel && restaurant.priceLevel > 0 ? 
        `<div class="restaurant-price price-level-${restaurant.priceLevel}">
            <i class="fas fa-won-sign"></i>
            ${'$'.repeat(restaurant.priceLevel)} (${getPriceLevelText(restaurant.priceLevel)})
        </div>` : '';
    
    // 리뷰 요약 (최대 2개)
    const reviewsSummary = restaurant.reviews && restaurant.reviews.length > 0 ? 
        `<div class="restaurant-reviews">
            <h4><i class="fas fa-comments"></i> 최근 리뷰</h4>
            ${restaurant.reviews.slice(0, 2).map(review => `
                <div class="review-item">
                    <div class="review-rating">${'★'.repeat(review.rating || 0)}${'☆'.repeat(5 - (review.rating || 0))}</div>
                    <div class="review-text">${(review.text || '').substring(0, 80)}${(review.text || '').length > 80 ? '...' : ''}</div>
                    <div class="review-author">- ${review.author_name || '익명'}</div>
                </div>
            `).join('')}
        </div>` : '';
    
    card.innerHTML = `
        ${photoSection}
        <div class="restaurant-content">
            <div class="restaurant-header">
                <div>
                    <div class="restaurant-name">${restaurant.name}</div>
                    ${ratingSection}
                </div>
                <div class="restaurant-header-right">
                <div class="restaurant-category">${restaurant.category}</div>
                    ${!isFavorite ? `<button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite('${restaurant.place_id || restaurant.id}', this)">
                        <i class="fas fa-heart"></i>
                    </button>` : ''}
                </div>
            </div>
            <div class="restaurant-address">
                <i class="fas fa-map-marker-alt"></i>
                ${restaurant.address}
            </div>
            ${phoneSection}
            ${priceLevel}
            ${reviewsSummary}
        </div>
    `;
    
    // 카드 클릭 이벤트 (상세 정보 표시)
    card.addEventListener('click', () => {
        showRestaurantDetail(restaurant);
    });
    
    return card;
}

// 맛집 상세 정보 표시
function showRestaurantDetail(restaurant) {
    const stars = '★'.repeat(Math.floor(restaurant.rating)) + 
                 '☆'.repeat(5 - Math.floor(restaurant.rating));
    
    // 사진 섹션 (음식 사진 우선 선택)
    const photoUrl = getBestFoodPhoto(restaurant);
    
    const photoSection = `
        <div style="width: 100%; height: 200px; border-radius: 10px; overflow: hidden; margin-bottom: 1rem;">
            <img src="${photoUrl}" alt="${restaurant.name}" style="width: 100%; height: 100%; object-fit: cover;"
                 onerror="this.src='food.jpg'">
        </div>
    `;
    
    // 리뷰 섹션
    const reviewsSection = restaurant.reviews && restaurant.reviews.length > 0 ? 
        `<div style="margin-bottom: 2rem;">
            <h3 style="color: #667eea; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-comments"></i> 리뷰 (${restaurant.reviews.length}개)
            </h3>
            ${restaurant.reviews.map(review => `
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 0.8rem; border-left: 3px solid #667eea;">
                    <div style="color: #ffd700; font-size: 0.9rem; margin-bottom: 0.5rem;">
                        ${'★'.repeat(review.rating || 0)}${'☆'.repeat(5 - (review.rating || 0))}
                    </div>
                    <div style="color: #555; line-height: 1.4; margin-bottom: 0.5rem;">
                        ${review.text || '리뷰 내용 없음'}
                    </div>
                    <div style="color: #888; font-size: 0.8rem; font-style: italic;">
                        - ${review.author_name || '익명'} (${new Date(review.time * 1000).toLocaleDateString('ko-KR')})
                    </div>
                </div>
            `).join('')}
        </div>` : '';
    
    const detail = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h2 style="color: #333; margin: 0;">${restaurant.name}</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
                </div>
                ${photoSection}
                <div style="background: #667eea; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 1rem;">${restaurant.category}</div>
                <div style="margin-bottom: 1rem;">
                    <div style="color: #ffd700; font-size: 1.2rem; margin-bottom: 0.5rem;">${stars}</div>
                    <div style="color: #666;">평점 ${restaurant.rating} (${restaurant.reviewCount}개 리뷰)</div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <div style="font-weight: bold; margin-bottom: 0.5rem;">주소</div>
                    <div style="color: #666;">${restaurant.address}</div>
                </div>
                ${restaurant.phone ? `
                <div style="margin-bottom: 1rem;">
                    <div style="font-weight: bold; margin-bottom: 0.5rem;">전화번호</div>
                    <div style="color: #666;">${restaurant.phone}</div>
                </div>
                ` : ''}
                ${reviewsSection}
                <div style="display: flex; gap: 1rem;">
                    <button onclick="navigateToRestaurant('${restaurant.address}', '${restaurant.name}')" style="flex: 1; background: #667eea; color: white; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-directions"></i> 길찾기
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="flex: 1; background: #6c757d; color: white; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer;">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', detail);
}

// 길찾기 기능 (구글지도)
function navigateToRestaurant(address, restaurantName = '') {
    // 가게 이름과 주소를 함께 검색
    const searchQuery = restaurantName ? `${restaurantName} ${address}` : address;
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
    window.open(url, '_blank');
}

// 로딩 상태 표시
function showLoading() {
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    emptyState.classList.add('hidden');
}

// 로딩 상태 숨기기
function hideLoading() {
    loading.classList.add('hidden');
}

// 빈 상태 표시
function showEmptyState() {
    emptyState.classList.remove('hidden');
    results.classList.add('hidden');
}

// 빈 상태 숨기기
function hideEmptyState() {
    emptyState.classList.add('hidden');
}

// API 상태 업데이트 (요소가 존재할 때만)
function updateApiStatus() {
    const apiStatus = document.getElementById('apiStatus');
    const apiDescription = document.getElementById('apiDescription');
    
    // 요소가 존재하지 않으면 함수 종료
    if (!apiStatus || !apiDescription) {
        return;
    }
    
    if (GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
        apiStatus.textContent = 'API 키 미설정 - 시뮬레이션 데이터 사용';
        apiStatus.style.color = '#ffc107';
        apiDescription.textContent = '현재는 시뮬레이션 데이터를 표시합니다 (검색한 지역명이 포함된 가상 맛집)';
    } else {
        apiStatus.textContent = '구글 플레이스 API 설정됨 - 실제 평점 포함 맛집 데이터 사용';
        apiStatus.style.color = '#28a745';
        apiDescription.textContent = '구글 플레이스 API를 통해 실제 맛집 정보와 평점을 가져옵니다';
    }
}

// 탭 전환 함수
function switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // 모든 섹션 숨기기
    results.classList.add('hidden');
    favorites.classList.add('hidden');
    myRestaurants.classList.add('hidden');
    
    // 선택된 탭 활성화
    switch(tabName) {
        case 'search':
            searchTab.classList.add('active');
            results.classList.remove('hidden');
            break;
        case 'favorites':
            favoritesTab.classList.add('active');
            favorites.classList.remove('hidden');
            loadFavorites();
            break;
        case 'myRestaurants':
            myRestaurantsTab.classList.add('active');
            myRestaurants.classList.remove('hidden');
            loadMyRestaurants();
            break;
    }
}

// 즐겨찾기 로드
async function loadFavorites() {
    try {
        const favoritesData = await getFavorites();
        displayFavorites(favoritesData);
    } catch (error) {
        console.error('즐겨찾기 로드 오류:', error);
    }
}

// 즐겨찾기 표시
function displayFavorites(favoritesData) {
    favoritesCount.textContent = favoritesData.length;
    
    if (favoritesData.length === 0) {
        favoritesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>즐겨찾기가 없습니다</h3>
                <p>맛집을 검색하고 하트를 눌러 즐겨찾기에 추가해보세요</p>
            </div>
        `;
        return;
    }
    
    favoritesList.innerHTML = '';
    favoritesData.forEach(restaurant => {
        const restaurantCard = createRestaurantCard(restaurant, false);
        // 즐겨찾기 상태로 설정
        const favoriteBtn = restaurantCard.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.classList.add('favorited');
        }
        favoritesList.appendChild(restaurantCard);
    });
}

// 내 맛집 로드
async function loadMyRestaurants() {
    try {
        const myRestaurantsData = await getUserRestaurants();
        displayMyRestaurants(myRestaurantsData);
    } catch (error) {
        console.error('내 맛집 로드 오류:', error);
    }
}

// 내 맛집 표시
function displayMyRestaurants(restaurantsData) {
    myRestaurantsCount.textContent = restaurantsData.length;
    
    if (restaurantsData.length === 0) {
        myRestaurantsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>등록된 맛집이 없습니다</h3>
                <p>맛집 추가 버튼을 눌러 맛집을 등록해보세요</p>
            </div>
        `;
        return;
    }
    
    myRestaurantsList.innerHTML = '';
    restaurantsData.forEach(restaurant => {
        const restaurantCard = createUserRestaurantCard(restaurant);
        myRestaurantsList.appendChild(restaurantCard);
    });
}

// 사용자 맛집 카드 생성
function createUserRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    
    const photoUrl = getBestFoodPhoto(restaurant);
    
    const photoSection = `
        <div class="restaurant-photo">
            <img src="${photoUrl}" alt="${restaurant.name}" loading="lazy" 
                 onerror="this.src='${getDefaultFoodImage()}'">
        </div>
    `;
    
    const rating = restaurant.rating || 0;
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    
    const priceLevel = restaurant.priceLevel && restaurant.priceLevel > 0 ? 
        `<div class="price-level">${'$'.repeat(restaurant.priceLevel)} (${getPriceLevelText(restaurant.priceLevel)})</div>` : '';
    
    const phoneSection = restaurant.phone ? 
        `<div class="restaurant-phone"><i class="fas fa-phone"></i> ${restaurant.phone}</div>` : '';
    
    const websiteSection = restaurant.website ? 
        `<div class="restaurant-website"><i class="fas fa-globe"></i> <a href="${restaurant.website}" target="_blank">웹사이트</a></div>` : '';
    
    const userNotes = restaurant.userNotes ? 
        `<div class="user-notes"><i class="fas fa-sticky-note"></i> ${restaurant.userNotes}</div>` : '';
    
    card.innerHTML = `
        <div class="restaurant-content">
            ${photoSection}
            <div class="restaurant-info">
                <h3 class="restaurant-name">${restaurant.name}</h3>
                <div class="restaurant-category">${restaurant.category}</div>
                <div class="restaurant-rating">
                    <div class="stars">${stars}</div>
                    <div class="rating-text">평점 ${rating} (${restaurant.reviewCount}개 리뷰)</div>
                </div>
                <div class="restaurant-address">
                    <i class="fas fa-map-marker-alt"></i>
                    ${restaurant.address}
                </div>
                ${phoneSection}
                ${websiteSection}
                ${userNotes}
                ${priceLevel}
            </div>
            <div class="restaurant-actions">
                <button class="action-btn edit" onclick="editUserRestaurant(${restaurant.id.replace('user_', '')})">
                    <i class="fas fa-edit"></i>
                    수정
                </button>
                <button class="action-btn delete" onclick="deleteUserRestaurant(${restaurant.id.replace('user_', '')})">
                    <i class="fas fa-trash"></i>
                    삭제
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// 맛집 추가 모달 표시
function showAddRestaurantModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>맛집 추가</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="addRestaurantForm">
                <div class="form-group">
                    <label>맛집 이름 *</label>
                    <input type="text" id="restaurantName" required>
                </div>
                <div class="form-group">
                    <label>카테고리 *</label>
                    <select id="restaurantCategory" required>
                        <option value="">카테고리 선택</option>
                        <option value="한식">한식</option>
                        <option value="중식">중식</option>
                        <option value="일식">일식</option>
                        <option value="양식">양식</option>
                        <option value="아시안">아시안</option>
                        <option value="카페">카페</option>
                        <option value="디저트">디저트</option>
                        <option value="바">바</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>주소 *</label>
                    <input type="text" id="restaurantAddress" required>
                </div>
                <div class="form-group">
                    <label>평점</label>
                    <input type="number" id="restaurantRating" min="0" max="5" step="0.1">
                </div>
                <div class="form-group">
                    <label>전화번호</label>
                    <input type="text" id="restaurantPhone">
                </div>
                <div class="form-group">
                    <label>웹사이트</label>
                    <input type="url" id="restaurantWebsite">
                </div>
                <div class="form-group">
                    <label>설명</label>
                    <textarea id="restaurantDescription" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>개인 메모</label>
                    <textarea id="restaurantUserNotes" rows="2" placeholder="이 맛집에 대한 개인적인 메모를 작성해주세요"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-cancel" onclick="this.closest('.modal').remove()">취소</button>
                    <button type="submit" class="btn-submit">추가</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 폼 제출 이벤트
    document.getElementById('addRestaurantForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const restaurant = {
            name: document.getElementById('restaurantName').value,
            category: document.getElementById('restaurantCategory').value,
            address: document.getElementById('restaurantAddress').value,
            rating: parseFloat(document.getElementById('restaurantRating').value) || 0,
            reviewCount: 0,
            phone: document.getElementById('restaurantPhone').value,
            website: document.getElementById('restaurantWebsite').value,
            description: document.getElementById('restaurantDescription').value,
            userNotes: document.getElementById('restaurantUserNotes').value,
            distance: 0,
            priceLevel: 0,
            photos: []
        };
        
        const success = await addUserRestaurant(restaurant);
        if (success) {
            modal.remove();
            loadMyRestaurants();
            alert('맛집이 성공적으로 추가되었습니다!');
        } else {
            alert('맛집 추가에 실패했습니다. 다시 시도해주세요.');
        }
    });
}

// 사용자 맛집 삭제
async function deleteUserRestaurant(id) {
    if (confirm('정말로 이 맛집을 삭제하시겠습니까?')) {
        const success = await deleteUserRestaurant(id);
        if (success) {
            loadMyRestaurants();
            alert('맛집이 삭제되었습니다.');
        } else {
            alert('맛집 삭제에 실패했습니다.');
        }
    }
}

// 사용자 맛집 수정 (간단한 구현)
function editUserRestaurant(id) {
    alert('맛집 수정 기능은 추후 구현될 예정입니다.');
}

// 즐겨찾기 토글
async function toggleFavorite(placeId, button) {
    const isCurrentlyFavorite = button.classList.contains('favorited');
    
    if (isCurrentlyFavorite) {
        // 즐겨찾기에서 제거
        const success = await removeFromFavorites(placeId);
        if (success) {
            button.classList.remove('favorited');
            button.innerHTML = '<i class="fas fa-heart"></i>';
            // 즐겨찾기 탭이 활성화되어 있다면 새로고침
            if (favoritesTab.classList.contains('active')) {
                loadFavorites();
            }
            // 카드 자체를 제거 (즉시 UI 업데이트)
            const card = button.closest('.restaurant-card');
            if (card) {
                card.remove();
                // 즐겨찾기 개수 업데이트
                const currentCount = parseInt(favoritesCount.textContent) || 0;
                favoritesCount.textContent = Math.max(0, currentCount - 1);
            }
        }
    } else {
        // 즐겨찾기에 추가
        // 현재 검색 결과에서 해당 맛집 찾기
        const restaurant = filteredRestaurants.find(r => (r.place_id || r.id) === placeId);
        if (restaurant) {
            const success = await addToFavorites(restaurant);
            if (success) {
                button.classList.add('favorited');
                button.innerHTML = '<i class="fas fa-heart"></i>';
                // 즐겨찾기 개수 업데이트
                const currentCount = parseInt(favoritesCount.textContent) || 0;
                favoritesCount.textContent = currentCount + 1;
            }
        }
    }
}

// API 연결 테스트
async function testApiConnection() {
    if (GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
        return false;
    }
    
    try {
        const testUrl = `http://localhost:3002/api/places?query=강남구 맛집&key=${GOOGLE_API_KEY}`;
        console.log('🧪 프록시 서버 연결 테스트 시작:', testUrl);
        
        const response = await fetch(testUrl);
        console.log('🧪 프록시 서버 테스트 응답 상태:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('🧪 프록시 서버 테스트 오류 응답:', errorText);
        }
        
        return response.ok;
    } catch (error) {
        console.error('🧪 프록시 서버 연결 테스트 실패:', error);
        console.error('🧪 오류 타입:', error.name);
        console.error('🧪 오류 메시지:', error.message);
        
        // 프록시 서버가 실행되지 않은 경우
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.error('🚨 프록시 서버가 실행되지 않았습니다. npm start를 실행해주세요.');
        }
        
        return false;
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', async function() {
    // API 상태 업데이트
    updateApiStatus();
    
    // API 연결 테스트 (실제 API 키가 있는 경우)
    if (GOOGLE_API_KEY !== 'YOUR_GOOGLE_API_KEY') {
        const isConnected = await testApiConnection();
        if (isConnected) {
            console.log('✅ 구글 플레이스 API 연결 성공');
        } else {
            console.log('❌ 구글 플레이스 API 연결 실패 - API 키를 확인해주세요');
            // 문제 해결 섹션 표시
            const troubleshooting = document.getElementById('troubleshooting');
            if (troubleshooting) {
                troubleshooting.style.display = 'block';
            }
        }
    }
    
    // 페이지 로드 시 빈 상태 표시
    showEmptyState();
});
