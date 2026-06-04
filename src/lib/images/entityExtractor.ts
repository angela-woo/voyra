import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface Entity {
  name: string
  nameKo: string
  type: 'attraction' | 'landmark' | 'restaurant' | 'area' | 'museum' | 'park' | 'beach' | 'temple' | 'other'
  importance: number
  searchQueries: string[]
}

export interface ExtractedEntities {
  country: string
  countryKo: string
  city: string
  cityKo: string
  mainEntity: Entity
  entities: Entity[]
}

export async function extractEntitiesFromArticle(
  title: string,
  content: string,
  city: string,
  country: string,
): Promise<ExtractedEntities> {
  const prompt = `You are a travel content entity extraction expert.

Analyze this travel article and extract all specific places, attractions, and landmarks mentioned.

Title: ${title}
City: ${city}
Country: ${country}
Content (first 2000 chars): ${content.slice(0, 2000)}

Return ONLY a JSON object (no markdown, no explanation):
{
  "country": "Japan",
  "countryKo": "일본",
  "city": "Tokyo",
  "cityKo": "도쿄",
  "mainEntity": {
    "name": "Tokyo Disneyland",
    "nameKo": "도쿄 디즈니랜드",
    "type": "attraction",
    "importance": 100,
    "searchQueries": [
      "Tokyo Disneyland Castle",
      "Tokyo Disneyland parade",
      "Tokyo Disneyland night",
      "Tokyo Disneyland entrance"
    ]
  },
  "entities": [
    {
      "name": "Tokyo Disneyland",
      "nameKo": "도쿄 디즈니랜드",
      "type": "attraction",
      "importance": 100,
      "searchQueries": ["Tokyo Disneyland Castle", "Tokyo Disneyland parade"]
    }
  ]
}

Rules:
1. Extract SPECIFIC place names, NOT generic terms
   ✓ "Tokyo Disneyland" NOT "Tokyo"
   ✓ "Senso-ji Temple" NOT "temple"
   ✓ "Shibuya Crossing" NOT "street"
2. importance: 100=title focus, 80=major mention, 60=secondary, 40=brief mention
3. searchQueries: 4 specific queries for image search, English only
4. mainEntity: the most important entity (usually from title)
5. type options: attraction/landmark/restaurant/area/museum/park/beach/temple/other
6. Max 10 entities`

  try {
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error('Entity extraction failed:', err)
    return {
      country,
      countryKo: country,
      city,
      cityKo: city,
      mainEntity: {
        name: city,
        nameKo: city,
        type: 'area',
        importance: 50,
        searchQueries: [`${city} travel`, `${city} landmark`, `${city} tourism`],
      },
      entities: [{
        name: city,
        nameKo: city,
        type: 'area',
        importance: 50,
        searchQueries: [`${city} travel`],
      }],
    }
  }
}
