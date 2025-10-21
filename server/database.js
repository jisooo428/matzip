const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로 (Vercel에서는 메모리 데이터베이스 사용)
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction ? ':memory:' : path.join(__dirname, '..', 'data', 'restaurants.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('데이터베이스 연결 오류:', err.message);
    } else {
        console.log(`SQLite 데이터베이스에 연결되었습니다. (${isProduction ? '메모리' : '파일'})`);
    }
});

// 테이블 생성
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // 즐겨찾기 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                place_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT,
                address TEXT,
                rating REAL,
                review_count INTEGER,
                distance REAL,
                phone TEXT,
                website TEXT,
                description TEXT,
                price_level INTEGER,
                photos TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('즐겨찾기 테이블 생성 오류:', err.message);
                reject(err);
            } else {
                console.log('즐겨찾기 테이블이 생성되었습니다.');
            }
        });

        // 사용자 등록 맛집 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS user_restaurants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                address TEXT NOT NULL,
                rating REAL DEFAULT 0,
                review_count INTEGER DEFAULT 0,
                distance REAL DEFAULT 0,
                phone TEXT,
                website TEXT,
                description TEXT,
                price_level INTEGER DEFAULT 0,
                photos TEXT,
                user_notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('사용자 맛집 테이블 생성 오류:', err.message);
                reject(err);
            } else {
                console.log('사용자 맛집 테이블이 생성되었습니다.');
                resolve();
            }
        });
    });
}

// 즐겨찾기 추가
function addFavorite(restaurant) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT OR REPLACE INTO favorites 
            (place_id, name, category, address, rating, review_count, distance, phone, website, description, price_level, photos)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            restaurant.place_id || restaurant.id,
            restaurant.name,
            restaurant.category,
            restaurant.address,
            restaurant.rating,
            restaurant.reviewCount,
            restaurant.distance,
            restaurant.phone || '',
            restaurant.website || '',
            restaurant.description || '',
            restaurant.priceLevel || 0,
            JSON.stringify(restaurant.photos || [])
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error('즐겨찾기 추가 오류:', err.message);
                reject(err);
            } else {
                console.log(`즐겨찾기 추가됨: ${restaurant.name} (ID: ${this.lastID})`);
                resolve(this.lastID);
            }
        });
    });
}

// 즐겨찾기 제거
function removeFavorite(placeId) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM favorites WHERE place_id = ?';
        
        db.run(sql, [placeId], function(err) {
            if (err) {
                console.error('즐겨찾기 제거 오류:', err.message);
                reject(err);
            } else {
                console.log(`즐겨찾기 제거됨: ${placeId} (${this.changes}개 행 삭제)`);
                resolve(this.changes);
            }
        });
    });
}

// 즐겨찾기 목록 조회
function getFavorites() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM favorites ORDER BY created_at DESC';
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('즐겨찾기 조회 오류:', err.message);
                reject(err);
            } else {
                const favorites = rows.map(row => ({
                    id: row.place_id,
                    place_id: row.place_id,
                    name: row.name,
                    category: row.category,
                    address: row.address,
                    rating: row.rating,
                    reviewCount: row.review_count,
                    distance: row.distance,
                    phone: row.phone,
                    website: row.website,
                    description: row.description,
                    priceLevel: row.price_level,
                    photos: JSON.parse(row.photos || '[]'),
                    isFavorite: true,
                    createdAt: row.created_at
                }));
                resolve(favorites);
            }
        });
    });
}

// 즐겨찾기 여부 확인
function isFavorite(placeId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT COUNT(*) as count FROM favorites WHERE place_id = ?';
        
        db.get(sql, [placeId], (err, row) => {
            if (err) {
                console.error('즐겨찾기 확인 오류:', err.message);
                reject(err);
            } else {
                resolve(row.count > 0);
            }
        });
    });
}

// 사용자 맛집 등록
function addUserRestaurant(restaurant) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO user_restaurants 
            (name, category, address, rating, review_count, distance, phone, website, description, price_level, photos, user_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            restaurant.name,
            restaurant.category,
            restaurant.address,
            restaurant.rating || 0,
            restaurant.reviewCount || 0,
            restaurant.distance || 0,
            restaurant.phone || '',
            restaurant.website || '',
            restaurant.description || '',
            restaurant.priceLevel || 0,
            JSON.stringify(restaurant.photos || []),
            restaurant.userNotes || ''
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error('사용자 맛집 등록 오류:', err.message);
                reject(err);
            } else {
                console.log(`사용자 맛집 등록됨: ${restaurant.name} (ID: ${this.lastID})`);
                resolve(this.lastID);
            }
        });
    });
}

// 사용자 맛집 목록 조회
function getUserRestaurants() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM user_restaurants ORDER BY created_at DESC';
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('사용자 맛집 조회 오류:', err.message);
                reject(err);
            } else {
                const restaurants = rows.map(row => ({
                    id: `user_${row.id}`,
                    place_id: `user_${row.id}`,
                    name: row.name,
                    category: row.category,
                    address: row.address,
                    rating: row.rating,
                    reviewCount: row.review_count,
                    distance: row.distance,
                    phone: row.phone,
                    website: row.website,
                    description: row.description,
                    priceLevel: row.price_level,
                    photos: JSON.parse(row.photos || '[]'),
                    userNotes: row.user_notes,
                    isUserRestaurant: true,
                    createdAt: row.created_at
                }));
                resolve(restaurants);
            }
        });
    });
}

// 사용자 맛집 수정
function updateUserRestaurant(id, restaurant) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE user_restaurants 
            SET name = ?, category = ?, address = ?, rating = ?, review_count = ?, 
                distance = ?, phone = ?, website = ?, description = ?, price_level = ?, 
                photos = ?, user_notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const params = [
            restaurant.name,
            restaurant.category,
            restaurant.address,
            restaurant.rating || 0,
            restaurant.reviewCount || 0,
            restaurant.distance || 0,
            restaurant.phone || '',
            restaurant.website || '',
            restaurant.description || '',
            restaurant.priceLevel || 0,
            JSON.stringify(restaurant.photos || []),
            restaurant.userNotes || '',
            id
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error('사용자 맛집 수정 오류:', err.message);
                reject(err);
            } else {
                console.log(`사용자 맛집 수정됨: ${restaurant.name} (${this.changes}개 행 수정)`);
                resolve(this.changes);
            }
        });
    });
}

// 사용자 맛집 삭제
function deleteUserRestaurant(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM user_restaurants WHERE id = ?';
        
        db.run(sql, [id], function(err) {
            if (err) {
                console.error('사용자 맛집 삭제 오류:', err.message);
                reject(err);
            } else {
                console.log(`사용자 맛집 삭제됨: ${id} (${this.changes}개 행 삭제)`);
                resolve(this.changes);
            }
        });
    });
}

// 데이터베이스 연결 종료
function closeDatabase() {
    return new Promise((resolve) => {
        db.close((err) => {
            if (err) {
                console.error('데이터베이스 연결 종료 오류:', err.message);
            } else {
                console.log('데이터베이스 연결이 종료되었습니다.');
            }
            resolve();
        });
    });
}

module.exports = {
    initializeDatabase,
    addFavorite,
    removeFavorite,
    getFavorites,
    isFavorite,
    addUserRestaurant,
    getUserRestaurants,
    updateUserRestaurant,
    deleteUserRestaurant,
    closeDatabase
};
