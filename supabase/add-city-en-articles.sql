-- articles 테이블에 city_en, country_en 컬럼 추가
ALTER TABLE articles ADD COLUMN IF NOT EXISTS city_en text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS country_en text;

-- 주요 도시 영문 매핑 (Korean city → English slug)
UPDATE articles SET city_en = 'tokyo',       country_en = 'japan'                   WHERE city = '도쿄';
UPDATE articles SET city_en = 'osaka',       country_en = 'japan'                   WHERE city = '오사카';
UPDATE articles SET city_en = 'kyoto',       country_en = 'japan'                   WHERE city = '교토';
UPDATE articles SET city_en = 'fukuoka',     country_en = 'japan'                   WHERE city = '후쿠오카';
UPDATE articles SET city_en = 'sapporo',     country_en = 'japan'                   WHERE city = '삿포로';
UPDATE articles SET city_en = 'nagoya',      country_en = 'japan'                   WHERE city = '나고야';
UPDATE articles SET city_en = 'okinawa',     country_en = 'japan'                   WHERE city = '오키나와';
UPDATE articles SET city_en = 'nara',        country_en = 'japan'                   WHERE city = '나라';
UPDATE articles SET city_en = 'seoul',       country_en = 'south-korea'             WHERE city = '서울';
UPDATE articles SET city_en = 'busan',       country_en = 'south-korea'             WHERE city = '부산';
UPDATE articles SET city_en = 'jeju',        country_en = 'south-korea'             WHERE city = '제주';
UPDATE articles SET city_en = 'bangkok',     country_en = 'thailand'                WHERE city = '방콕';
UPDATE articles SET city_en = 'chiangmai',   country_en = 'thailand'                WHERE city = '치앙마이';
UPDATE articles SET city_en = 'bali',        country_en = 'indonesia'               WHERE city = '발리';
UPDATE articles SET city_en = 'singapore',   country_en = 'singapore'               WHERE city = '싱가포르';
UPDATE articles SET city_en = 'danang',      country_en = 'vietnam'                 WHERE city = '다낭';
UPDATE articles SET city_en = 'hanoi',       country_en = 'vietnam'                 WHERE city = '하노이';
UPDATE articles SET city_en = 'hochiminh',   country_en = 'vietnam'                 WHERE city = '호치민';
UPDATE articles SET city_en = 'nhatrang',    country_en = 'vietnam'                 WHERE city = '나트랑';
UPDATE articles SET city_en = 'cebu',        country_en = 'philippines'             WHERE city = '세부';
UPDATE articles SET city_en = 'boracay',     country_en = 'philippines'             WHERE city = '보라카이';
UPDATE articles SET city_en = 'manila',      country_en = 'philippines'             WHERE city = '마닐라';
UPDATE articles SET city_en = 'taipei',      country_en = 'taiwan'                  WHERE city = '타이베이';
UPDATE articles SET city_en = 'taichung',    country_en = 'taiwan'                  WHERE city = '타이중';
UPDATE articles SET city_en = 'guam',        country_en = 'guam'                    WHERE city = '괌';
UPDATE articles SET city_en = 'saipan',      country_en = 'northern-mariana-islands' WHERE city = '사이판';
UPDATE articles SET city_en = 'paris',       country_en = 'france'                  WHERE city = '파리';
UPDATE articles SET city_en = 'london',      country_en = 'uk'                      WHERE city = '런던';
UPDATE articles SET city_en = 'barcelona',   country_en = 'spain'                   WHERE city = '바르셀로나';
UPDATE articles SET city_en = 'madrid',      country_en = 'spain'                   WHERE city = '마드리드';
UPDATE articles SET city_en = 'rome',        country_en = 'italy'                   WHERE city = '로마';
UPDATE articles SET city_en = 'florence',    country_en = 'italy'                   WHERE city = '피렌체';
UPDATE articles SET city_en = 'milan',       country_en = 'italy'                   WHERE city = '밀라노';
UPDATE articles SET city_en = 'venice',      country_en = 'italy'                   WHERE city = '베네치아';
UPDATE articles SET city_en = 'amsterdam',   country_en = 'netherlands'             WHERE city = '암스테르담';
UPDATE articles SET city_en = 'berlin',      country_en = 'germany'                 WHERE city = '베를린';
UPDATE articles SET city_en = 'munich',      country_en = 'germany'                 WHERE city = '뮌헨';
UPDATE articles SET city_en = 'lisbon',      country_en = 'portugal'                WHERE city = '리스본';
UPDATE articles SET city_en = 'vienna',      country_en = 'austria'                 WHERE city = '비엔나';
UPDATE articles SET city_en = 'prague',      country_en = 'czech'                   WHERE city = '프라하';
UPDATE articles SET city_en = 'budapest',    country_en = 'hungary'                 WHERE city = '부다페스트';
UPDATE articles SET city_en = 'zurich',      country_en = 'switzerland'             WHERE city = '취리히';
UPDATE articles SET city_en = 'copenhagen',  country_en = 'denmark'                 WHERE city = '코펜하겐';
UPDATE articles SET city_en = 'stockholm',   country_en = 'sweden'                  WHERE city = '스톡홀름';
UPDATE articles SET city_en = 'helsinki',    country_en = 'finland'                 WHERE city = '헬싱키';
UPDATE articles SET city_en = 'oslo',        country_en = 'norway'                  WHERE city = '오슬로';
UPDATE articles SET city_en = 'dubai',       country_en = 'uae'                     WHERE city = '두바이';
UPDATE articles SET city_en = 'istanbul',    country_en = 'turkey'                  WHERE city = '이스탄불';
UPDATE articles SET city_en = 'newyork',     country_en = 'usa'                     WHERE city = '뉴욕';
UPDATE articles SET city_en = 'losangeles',  country_en = 'usa'                     WHERE city = '로스앤젤레스';
UPDATE articles SET city_en = 'lasvegas',    country_en = 'usa'                     WHERE city = '라스베이거스';
UPDATE articles SET city_en = 'sydney',      country_en = 'australia'               WHERE city = '시드니';
UPDATE articles SET city_en = 'melbourne',   country_en = 'australia'               WHERE city = '멜버른';
UPDATE articles SET city_en = 'vancouver',   country_en = 'canada'                  WHERE city = '밴쿠버';
UPDATE articles SET city_en = 'toronto',     country_en = 'canada'                  WHERE city = '토론토';
UPDATE articles SET city_en = 'kualalumpur', country_en = 'malaysia'                WHERE city = '쿠알라룸푸르';
UPDATE articles SET city_en = 'athens',      country_en = 'greece'                  WHERE city = '아테네';
UPDATE articles SET city_en = 'hongkong',    country_en = 'hong-kong'               WHERE city = '홍콩';

-- 확인 쿼리
SELECT city, city_en, country_en, count(*) as article_count
FROM articles
WHERE published = true
GROUP BY city, city_en, country_en
ORDER BY article_count DESC;
