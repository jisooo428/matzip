const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3002;

// CORS 설정
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (public 폴더)
app.use(express.static(path.join(__dirname, '..', 'public')));

// 구글 Places API (New) 프록시 엔드포인트 - Text Search
app.get('/api/places', async (req, res) => {
    try {
        const { query, key, pagetoken, location, radius, type } = req.query;
        
        if (!query || !key) {
            return res.status(400).json({ error: 'query와 key 파라미터가 필요합니다.' });
        }
        
        // 새로운 Places API 엔드포인트 사용
        const googleUrl = 'https://places.googleapis.com/v1/places:searchText';
        
        // FieldMask를 사용하여 필요한 필드만 요청 (최적화)
        const fieldMask = 'places.id,places.displayName,places.types,places.rating,places.userRatingCount,places.formattedAddress,places.location,places.photos,places.priceLevel';
        
        // 요청 본문 구성 (새로운 Places API 형식)
        const requestBody = {
            textQuery: query,
            languageCode: 'ko',
            regionCode: 'KR',
            maxResultCount: 20
        };
        
        // 위치 기반 검색이 있는 경우
        if (location) {
            const [lat, lng] = location.split(',');
            requestBody.locationBias = {
                circle: {
                    center: {
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lng)
                    },
                    radius: radius ? parseFloat(radius) : 5000
                }
            };
        }
        
        // 장소 유형 필터링 (새로운 API 형식)
        if (type) {
            requestBody.includedTypes = [type];
        }
        
        // Next Page Token이 있으면 추가
        if (pagetoken) {
            requestBody.pageToken = pagetoken;
            console.log('다음 페이지 토큰 사용:', pagetoken);
        }
        
        console.log('구글 Places API (New) 호출:', googleUrl);
        console.log('요청 본문:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(googleUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': key,
                'X-Goog-FieldMask': fieldMask
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        console.log('구글 Places API (New) 응답:', response.status, `결과 ${data.places?.length || 0}개`);
        
        // 기존 API 형식과 호환되도록 응답 변환
        const convertedResponse = {
            status: response.ok ? 'OK' : 'ERROR',
            results: data.places?.map(place => ({
                place_id: place.id,
                name: place.displayName?.text || place.displayName,
                types: place.types || [],
                rating: place.rating || 0,
                user_ratings_total: place.userRatingCount || 0,
                formatted_address: place.formattedAddress,
                geometry: {
                    location: {
                        lat: place.location?.latitude || 0,
                        lng: place.location?.longitude || 0
                    }
                },
                photos: place.photos?.map(photo => ({
                    photo_reference: photo.name,
                    height: photo.heightPx,
                    width: photo.widthPx
                })) || [],
                price_level: place.priceLevel || 0,
                website: place.websiteUri,
                editorial_summary: place.editorialSummary?.text,
                reviews: place.reviews?.map(review => ({
                    author_name: review.authorAttribution?.displayName,
                    rating: review.rating,
                    text: review.text?.text,
                    time: review.publishTime
                })) || []
            })) || [],
            next_page_token: data.nextPageToken
        };
        
        res.json(convertedResponse);
    } catch (error) {
        console.error('프록시 서버 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 구글 Places API (New) - Place Details 프록시 엔드포인트
app.get('/api/place-details', async (req, res) => {
    try {
        const { place_id, key } = req.query;
        
        if (!place_id || !key) {
            return res.status(400).json({ error: 'place_id와 key 파라미터가 필요합니다.' });
        }
        
        // 새로운 Places API 엔드포인트 사용 (최소 필드로 테스트)
        const googleUrl = `https://places.googleapis.com/v1/places/${place_id}`;
        const fieldMask = 'id,displayName,types,rating,userRatingCount,formattedAddress,location,photos,priceLevel';
        
        console.log('Place Details API (New) 호출:', googleUrl);
        console.log('FieldMask:', fieldMask);
        
        const response = await fetch(googleUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': key,
                'X-Goog-FieldMask': fieldMask
            }
        });
        
        const data = await response.json();
        
        console.log('Place Details API (New) 응답:', response.status);
        
        // 기존 API 형식과 호환되도록 응답 변환
        const convertedResponse = {
            status: response.ok ? 'OK' : 'ERROR',
            result: {
                place_id: data.id,
                name: data.displayName?.text || data.displayName,
                types: data.types || [],
                rating: data.rating || 0,
                user_ratings_total: data.userRatingCount || 0,
                formatted_address: data.formattedAddress,
                formatted_phone_number: data.formattedPhoneNumber,
                international_phone_number: data.internationalPhoneNumber,
                website: data.websiteUri,
                price_level: data.priceLevel || 0,
                geometry: {
                    location: {
                        lat: data.location?.latitude || 0,
                        lng: data.location?.longitude || 0
                    }
                },
                photos: data.photos?.map(photo => ({
                    photo_reference: photo.name,
                    height: photo.heightPx,
                    width: photo.widthPx
                })) || [],
                editorial_summary: data.editorialSummary?.text,
                reviews: data.reviews?.map(review => ({
                    author_name: review.authorAttribution?.displayName,
                    rating: review.rating,
                    text: review.text?.text,
                    time: review.publishTime
                })) || [],
                opening_hours: data.openingHours ? {
                    open_now: data.openingHours.openNow,
                    periods: data.openingHours.periods?.map(period => ({
                        open: {
                            day: period.open?.day,
                            time: period.open?.hour?.toString().padStart(2, '0') + 
                                  period.open?.minute?.toString().padStart(2, '0')
                        },
                        close: period.close ? {
                            day: period.close.day,
                            time: period.close.hour?.toString().padStart(2, '0') + 
                                  period.close.minute?.toString().padStart(2, '0')
                        } : null
                    })) || []
                } : null
            }
        };
        
        res.json(convertedResponse);
    } catch (error) {
        console.error('Place Details API 프록시 서버 오류:', error);
        res.status(500).json({ error: 'Place Details API 서버 오류가 발생했습니다.' });
    }
});

// 데이터베이스 초기화
db.initializeDatabase().then(() => {
    console.log('데이터베이스 초기화 완료');
}).catch(err => {
    console.error('데이터베이스 초기화 실패:', err);
});

// 즐겨찾기 API 엔드포인트들
// 즐겨찾기 추가
app.post('/api/favorites', async (req, res) => {
    try {
        const restaurant = req.body;
        const favoriteId = await db.addFavorite(restaurant);
        res.json({ success: true, id: favoriteId });
    } catch (error) {
        console.error('즐겨찾기 추가 오류:', error);
        res.status(500).json({ error: '즐겨찾기 추가에 실패했습니다.' });
    }
});

// 즐겨찾기 제거
app.delete('/api/favorites/:placeId', async (req, res) => {
    try {
        const { placeId } = req.params;
        const deletedCount = await db.removeFavorite(placeId);
        res.json({ success: true, deletedCount });
    } catch (error) {
        console.error('즐겨찾기 제거 오류:', error);
        res.status(500).json({ error: '즐겨찾기 제거에 실패했습니다.' });
    }
});

// 즐겨찾기 목록 조회
app.get('/api/favorites', async (req, res) => {
    try {
        const favorites = await db.getFavorites();
        res.json(favorites);
    } catch (error) {
        console.error('즐겨찾기 조회 오류:', error);
        res.status(500).json({ error: '즐겨찾기 조회에 실패했습니다.' });
    }
});

// 즐겨찾기 여부 확인
app.get('/api/favorites/:placeId', async (req, res) => {
    try {
        const { placeId } = req.params;
        const isFavorite = await db.isFavorite(placeId);
        res.json({ isFavorite });
    } catch (error) {
        console.error('즐겨찾기 확인 오류:', error);
        res.status(500).json({ error: '즐겨찾기 확인에 실패했습니다.' });
    }
});

// 사용자 맛집 API 엔드포인트들
// 사용자 맛집 등록
app.post('/api/user-restaurants', async (req, res) => {
    try {
        const restaurant = req.body;
        const restaurantId = await db.addUserRestaurant(restaurant);
        res.json({ success: true, id: restaurantId });
    } catch (error) {
        console.error('사용자 맛집 등록 오류:', error);
        res.status(500).json({ error: '사용자 맛집 등록에 실패했습니다.' });
    }
});

// 사용자 맛집 목록 조회
app.get('/api/user-restaurants', async (req, res) => {
    try {
        const restaurants = await db.getUserRestaurants();
        res.json(restaurants);
    } catch (error) {
        console.error('사용자 맛집 조회 오류:', error);
        res.status(500).json({ error: '사용자 맛집 조회에 실패했습니다.' });
    }
});

// 사용자 맛집 수정
app.put('/api/user-restaurants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = req.body;
        const updatedCount = await db.updateUserRestaurant(id, restaurant);
        res.json({ success: true, updatedCount });
    } catch (error) {
        console.error('사용자 맛집 수정 오류:', error);
        res.status(500).json({ error: '사용자 맛집 수정에 실패했습니다.' });
    }
});

// 사용자 맛집 삭제
app.delete('/api/user-restaurants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCount = await db.deleteUserRestaurant(id);
        res.json({ success: true, deletedCount });
    } catch (error) {
        console.error('사용자 맛집 삭제 오류:', error);
        res.status(500).json({ error: '사용자 맛집 삭제에 실패했습니다.' });
    }
});

// Vercel에서는 module.exports를 사용
module.exports = app;

// 로컬 개발 환경에서만 서버 시작
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`프록시 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
        console.log(`웹사이트: http://localhost:${PORT}`);
    });
}
