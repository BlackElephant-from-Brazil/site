/**
 * Avaliações do Google (Places API New) — SERVER-SIDE apenas.
 * Usado pela page.tsx (Server Component) da LP; nunca importar num client
 * component (a chave vive em process.env e não pode ir para o browser).
 *
 * Variáveis de ambiente (.env.local):
 *   GOOGLE_PLACES_API_KEY  → chave da Places API (New) do Google Cloud
 *   GOOGLE_PLACE_ID        → opcional; se faltar, resolve por pesquisa de texto
 *
 * Sem chave configurada devolve null e a LP usa os cartões de fallback
 * (array GOOGLE_REVIEWS no SiteGoogleLandingClient).
 */

export type GoogleReviewsData = {
  rating: number;
  count: number;
  reviews: { name: string; date: string; rating: number; text: string; photo?: string }[];
};

// Nome + coordenadas usados para resolver o Place ID quando GOOGLE_PLACE_ID
// não está definido. O locationBias é OBRIGATÓRIO na prática: a pesquisa por
// texto sem coordenadas devolve vazio para este negócio (testado 2026-07).
const PLACE_QUERY = 'BlackElephant do Brasil';
const PLACE_BIAS = { latitude: -23.0291199, longitude: -46.9838694 };

type PlaceDetails = {
  rating?: number;
  userRatingCount?: number;
  reviews?: {
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: { text?: string };
    authorAttribution?: { displayName?: string; photoUri?: string };
  }[];
};

async function resolvePlaceId(key: string): Promise<string | null> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({
      textQuery: PLACE_QUERY,
      locationBias: { circle: { center: PLACE_BIAS, radius: 2000 } },
    }),
    // o Place ID praticamente nunca muda — cache de 24h
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { places?: { id?: string }[] };
  return data.places?.[0]?.id ?? null;
}

export async function getGoogleReviews(locale: string): Promise<GoogleReviewsData | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  try {
    const placeId = process.env.GOOGLE_PLACE_ID || (await resolvePlaceId(key));
    if (!placeId) return null;

    const lang = locale === 'en' ? 'en' : 'pt';
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=${lang}`, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
      },
      // avaliações mudam devagar — cache de 6h poupa quota da API
      next: { revalidate: 21600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PlaceDetails;

    const reviews = (data.reviews ?? [])
      .filter((r) => typeof r.rating === 'number' && r.text?.text)
      // A Places API devolve no máximo 5 avaliações por local; o carrossel na
      // LP mostra até 3 de cada vez, então com >3 já há o que paginar.
      .slice(0, 5)
      .map((r) => ({
        name: r.authorAttribution?.displayName || 'Cliente Google',
        date: r.relativePublishTimeDescription || '',
        rating: r.rating!,
        text: r.text!.text!,
        photo: r.authorAttribution?.photoUri || undefined,
      }));

    if (!data.rating || !reviews.length) return null;
    return { rating: data.rating, count: data.userRatingCount ?? reviews.length, reviews };
  } catch {
    // Falha de rede/quota não pode derrubar a página — cai no fallback estático.
    return null;
  }
}
