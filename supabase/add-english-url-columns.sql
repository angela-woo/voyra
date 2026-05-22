-- Add English slug columns for SEO-friendly URLs
ALTER TABLE travel_plans ADD COLUMN IF NOT EXISTS country_en text;
ALTER TABLE travel_plans ADD COLUMN IF NOT EXISTS city_en text;

-- Japanese cities
UPDATE travel_plans SET country_en = 'japan', city_en = 'tokyo'       WHERE city = '도쿄';
UPDATE travel_plans SET country_en = 'japan', city_en = 'osaka'       WHERE city = '오사카';
UPDATE travel_plans SET country_en = 'japan', city_en = 'kyoto'       WHERE city = '교토';
UPDATE travel_plans SET country_en = 'japan', city_en = 'nara'        WHERE city = '나라';

-- European cities
UPDATE travel_plans SET country_en = 'france',      city_en = 'paris'        WHERE city = '파리';
UPDATE travel_plans SET country_en = 'spain',       city_en = 'barcelona'    WHERE city = '바르셀로나';
UPDATE travel_plans SET country_en = 'spain',       city_en = 'madrid'       WHERE city = '마드리드';
UPDATE travel_plans SET country_en = 'italy',       city_en = 'rome'         WHERE city = '로마';
UPDATE travel_plans SET country_en = 'italy',       city_en = 'florence'     WHERE city = '피렌체';
UPDATE travel_plans SET country_en = 'italy',       city_en = 'milan'        WHERE city = '밀라노';
UPDATE travel_plans SET country_en = 'uk',          city_en = 'london'       WHERE city = '런던';
UPDATE travel_plans SET country_en = 'germany',     city_en = 'berlin'       WHERE city = '베를린';
UPDATE travel_plans SET country_en = 'germany',     city_en = 'munich'       WHERE city = '뮌헨';
UPDATE travel_plans SET country_en = 'netherlands', city_en = 'amsterdam'    WHERE city = '암스테르담';
UPDATE travel_plans SET country_en = 'czech',       city_en = 'prague'       WHERE city = '프라하';
UPDATE travel_plans SET country_en = 'austria',     city_en = 'vienna'       WHERE city = '비엔나';
UPDATE travel_plans SET country_en = 'switzerland', city_en = 'zurich'       WHERE city = '취리히';
UPDATE travel_plans SET country_en = 'denmark',     city_en = 'copenhagen'   WHERE city = '코펜하겐';
UPDATE travel_plans SET country_en = 'finland',     city_en = 'helsinki'     WHERE city = '헬싱키';
UPDATE travel_plans SET country_en = 'sweden',      city_en = 'stockholm'    WHERE city = '스톡홀름';
UPDATE travel_plans SET country_en = 'norway',      city_en = 'oslo'         WHERE city = '오슬로';
UPDATE travel_plans SET country_en = 'belgium',     city_en = 'brussels'     WHERE city = '브뤼셀';
UPDATE travel_plans SET country_en = 'hungary',     city_en = 'budapest'     WHERE city = '부다페스트';
UPDATE travel_plans SET country_en = 'poland',      city_en = 'warsaw'       WHERE city = '바르샤바';
UPDATE travel_plans SET country_en = 'greece',      city_en = 'athens'       WHERE city = '아테네';
UPDATE travel_plans SET country_en = 'portugal',    city_en = 'lisbon'       WHERE city = '리스본';

-- Southeast Asia
UPDATE travel_plans SET country_en = 'thailand',   city_en = 'bangkok'      WHERE city = '방콕';
UPDATE travel_plans SET country_en = 'thailand',   city_en = 'chiangmai'    WHERE city = '치앙마이';
UPDATE travel_plans SET country_en = 'indonesia',  city_en = 'bali'         WHERE city = '발리';
UPDATE travel_plans SET country_en = 'singapore',  city_en = 'singapore'    WHERE city = '싱가포르';
UPDATE travel_plans SET country_en = 'vietnam',    city_en = 'hanoi'        WHERE city = '하노이';
UPDATE travel_plans SET country_en = 'vietnam',    city_en = 'ho-chi-minh'  WHERE city = '호치민';
UPDATE travel_plans SET country_en = 'malaysia',   city_en = 'kuala-lumpur' WHERE city = '쿠알라룸푸르';

-- East Asia
UPDATE travel_plans SET country_en = 'taiwan',    city_en = 'taipei'       WHERE city = '타이베이';
UPDATE travel_plans SET country_en = 'hong-kong', city_en = 'hong-kong'    WHERE city = '홍콩';
UPDATE travel_plans SET country_en = 'china',     city_en = 'shanghai'     WHERE city = '상하이';
UPDATE travel_plans SET country_en = 'china',     city_en = 'beijing'      WHERE city = '베이징';

-- Middle East
UPDATE travel_plans SET country_en = 'turkey',    city_en = 'istanbul'     WHERE city = '이스탄불';
UPDATE travel_plans SET country_en = 'uae',       city_en = 'dubai'        WHERE city = '두바이';

-- South Asia
UPDATE travel_plans SET country_en = 'india',     city_en = 'mumbai'       WHERE city = '뭄바이';
UPDATE travel_plans SET country_en = 'india',     city_en = 'delhi'        WHERE city = '델리';

-- Oceania
UPDATE travel_plans SET country_en = 'australia', city_en = 'sydney'       WHERE city = '시드니';
UPDATE travel_plans SET country_en = 'australia', city_en = 'melbourne'    WHERE city = '멜버른';

-- Americas
UPDATE travel_plans SET country_en = 'usa',    city_en = 'new-york'      WHERE city = '뉴욕';
UPDATE travel_plans SET country_en = 'usa',    city_en = 'los-angeles'   WHERE city = '로스앤젤레스';
UPDATE travel_plans SET country_en = 'usa',    city_en = 'las-vegas'     WHERE city = '라스베이거스';
UPDATE travel_plans SET country_en = 'canada', city_en = 'vancouver'     WHERE city = '밴쿠버';
UPDATE travel_plans SET country_en = 'canada', city_en = 'toronto'       WHERE city = '토론토';

-- More Japanese cities
UPDATE travel_plans SET country_en = 'japan', city_en = 'fukuoka'  WHERE city = '후쿠오카';
UPDATE travel_plans SET country_en = 'japan', city_en = 'okinawa'  WHERE city = '오키나와';
UPDATE travel_plans SET country_en = 'japan', city_en = 'sapporo'  WHERE city = '삿포로';
UPDATE travel_plans SET country_en = 'japan', city_en = 'nagoya'   WHERE city = '나고야';

-- More Vietnam cities
UPDATE travel_plans SET country_en = 'vietnam', city_en = 'da-nang'     WHERE city = '다낭';
UPDATE travel_plans SET country_en = 'vietnam', city_en = 'nha-trang'   WHERE city = '나트랑';

-- Philippines
UPDATE travel_plans SET country_en = 'philippines', city_en = 'cebu'     WHERE city = '세부';
UPDATE travel_plans SET country_en = 'philippines', city_en = 'boracay'  WHERE city = '보라카이';
UPDATE travel_plans SET country_en = 'philippines', city_en = 'manila'   WHERE city = '마닐라';

-- Pacific islands
UPDATE travel_plans SET country_en = 'guam', city_en = 'guam'      WHERE city = '괌';
UPDATE travel_plans SET country_en = 'cnmi', city_en = 'saipan'    WHERE city = '사이판';

-- More Taiwan
UPDATE travel_plans SET country_en = 'taiwan', city_en = 'taichung' WHERE city = '타이중';

-- English plans (already in English)
UPDATE travel_plans SET country_en = lower(country), city_en = lower(replace(city, ' ', '-'))
WHERE language = 'en' AND country_en IS NULL;
