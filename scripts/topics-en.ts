export interface TopicEn {
  city: string
  country: string
  type: string    // hyphenated slug suffix
  keyword: string // target SEO keyword
}

export const topicsEn: TopicEn[] = [
  // Japan — Tokyo
  { city: 'Tokyo', country: 'Japan', type: 'shinjuku-guide', keyword: 'tokyo shinjuku travel guide' },
  { city: 'Tokyo', country: 'Japan', type: 'shibuya-guide', keyword: 'tokyo shibuya things to do' },
  { city: 'Tokyo', country: 'Japan', type: 'best-restaurants', keyword: 'best restaurants in tokyo' },
  { city: 'Tokyo', country: 'Japan', type: 'cherry-blossom-guide', keyword: 'tokyo cherry blossom spots' },
  { city: 'Tokyo', country: 'Japan', type: 'budget-travel', keyword: 'tokyo travel on a budget' },
  { city: 'Tokyo', country: 'Japan', type: 'shopping-guide', keyword: 'best shopping in tokyo' },
  { city: 'Tokyo', country: 'Japan', type: 'day-trips', keyword: 'best day trips from tokyo' },
  // Japan — Osaka
  { city: 'Osaka', country: 'Japan', type: 'dotonbori-guide', keyword: 'osaka dotonbori travel guide' },
  { city: 'Osaka', country: 'Japan', type: 'street-food-guide', keyword: 'osaka street food guide' },
  { city: 'Osaka', country: 'Japan', type: 'usj-guide', keyword: 'osaka universal studios japan guide' },
  // Japan — Kyoto
  { city: 'Kyoto', country: 'Japan', type: 'temples-guide', keyword: 'kyoto temples travel guide' },
  { city: 'Kyoto', country: 'Japan', type: 'gion-guide', keyword: 'kyoto gion district guide' },
  { city: 'Kyoto', country: 'Japan', type: 'day-trips', keyword: 'best day trips from kyoto' },
  // Japan — Others
  { city: 'Fukuoka', country: 'Japan', type: 'food-guide', keyword: 'fukuoka food travel guide' },
  { city: 'Sapporo', country: 'Japan', type: 'winter-guide', keyword: 'sapporo winter travel guide' },
  // Southeast Asia — Bali
  { city: 'Bali', country: 'Indonesia', type: 'ubud-guide', keyword: 'bali ubud travel guide' },
  { city: 'Bali', country: 'Indonesia', type: 'best-beaches', keyword: 'best beaches in bali' },
  { city: 'Bali', country: 'Indonesia', type: 'budget-travel', keyword: 'bali travel on a budget' },
  { city: 'Bali', country: 'Indonesia', type: 'temples-guide', keyword: 'bali temples travel guide' },
  { city: 'Bali', country: 'Indonesia', type: 'surfing-guide', keyword: 'bali surfing guide for beginners' },
  // Southeast Asia — Bangkok
  { city: 'Bangkok', country: 'Thailand', type: 'temples-guide', keyword: 'bangkok temples travel guide' },
  { city: 'Bangkok', country: 'Thailand', type: 'street-food-guide', keyword: 'bangkok street food guide' },
  { city: 'Bangkok', country: 'Thailand', type: 'shopping-guide', keyword: 'best shopping in bangkok' },
  { city: 'Bangkok', country: 'Thailand', type: 'budget-travel', keyword: 'bangkok budget travel guide' },
  // Southeast Asia — Others
  { city: 'Chiang Mai', country: 'Thailand', type: 'temples-guide', keyword: 'chiang mai temples guide' },
  { city: 'Da Nang', country: 'Vietnam', type: 'beach-guide', keyword: 'da nang beach travel guide' },
  { city: 'Hanoi', country: 'Vietnam', type: 'food-guide', keyword: 'hanoi food travel guide' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', type: 'travel-tips', keyword: 'ho chi minh city travel tips' },
  { city: 'Phuket', country: 'Thailand', type: 'beach-guide', keyword: 'phuket beach travel guide' },
  { city: 'Singapore', country: 'Singapore', type: 'food-guide', keyword: 'singapore food travel guide' },
  { city: 'Singapore', country: 'Singapore', type: 'budget-travel', keyword: 'singapore budget travel tips' },
  // Korea — English-speaking travelers
  { city: 'Seoul', country: 'South Korea', type: 'kpop-guide', keyword: 'seoul kpop travel guide' },
  { city: 'Seoul', country: 'South Korea', type: 'street-food-guide', keyword: 'seoul street food guide' },
  { city: 'Seoul', country: 'South Korea', type: 'shopping-guide', keyword: 'best shopping in seoul' },
  { city: 'Seoul', country: 'South Korea', type: 'nightlife-guide', keyword: 'seoul nightlife guide' },
  { city: 'Seoul', country: 'South Korea', type: 'budget-travel', keyword: 'seoul budget travel tips' },
  { city: 'Busan', country: 'South Korea', type: 'beach-guide', keyword: 'busan beach travel guide' },
  { city: 'Jeju Island', country: 'South Korea', type: 'nature-guide', keyword: 'jeju island nature travel guide' },
  // Europe
  { city: 'Paris', country: 'France', type: 'first-timers-guide', keyword: 'paris travel guide first time' },
  { city: 'Paris', country: 'France', type: 'budget-travel', keyword: 'paris travel on a budget' },
  { city: 'Paris', country: 'France', type: 'best-restaurants', keyword: 'best restaurants in paris' },
  { city: 'Paris', country: 'France', type: 'hidden-gems', keyword: 'paris hidden gems off the beaten path' },
  { city: 'Barcelona', country: 'Spain', type: 'complete-guide', keyword: 'barcelona travel guide' },
  { city: 'Barcelona', country: 'Spain', type: 'food-guide', keyword: 'barcelona food travel guide' },
  { city: 'Rome', country: 'Italy', type: 'complete-guide', keyword: 'rome travel guide first time' },
  { city: 'Rome', country: 'Italy', type: 'food-guide', keyword: 'rome food travel guide' },
  { city: 'London', country: 'UK', type: 'budget-travel', keyword: 'london budget travel tips' },
  { city: 'London', country: 'UK', type: 'food-guide', keyword: 'london food travel guide' },
  { city: 'Amsterdam', country: 'Netherlands', type: 'complete-guide', keyword: 'amsterdam travel guide' },
  { city: 'Prague', country: 'Czech Republic', type: 'budget-travel', keyword: 'prague budget travel guide' },
  // Middle East
  { city: 'Dubai', country: 'UAE', type: 'budget-travel', keyword: 'dubai budget travel tips' },
  { city: 'Dubai', country: 'UAE', type: 'food-guide', keyword: 'dubai food travel guide' },
  { city: 'Istanbul', country: 'Turkey', type: 'food-guide', keyword: 'istanbul food travel guide' },
  // Americas
  { city: 'New York', country: 'USA', type: 'budget-travel', keyword: 'new york budget travel tips' },
  { city: 'Los Angeles', country: 'USA', type: 'complete-guide', keyword: 'los angeles travel guide' },
  // Oceania
  { city: 'Sydney', country: 'Australia', type: 'complete-guide', keyword: 'sydney travel guide' },
]
