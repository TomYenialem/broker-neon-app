import { Listing, ListingCategory, Prisma } from '@prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export type ConversationHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ListingStatsSummary = {
  totalActive: number;
  byCategory: Record<ListingCategory, number>;
};

const SYSTEM_PROMPT = `
You are PLANCA Broker Assistant, a concise listings expert.

Respond ONLY in JSON with this exact shape:
{
  "summary": "Single short sentence with <b>important info</b>",
  "listings": [
    {
      "id": "string",
      "title": "<b>Title</b>",
      "price": "<b>Price or priceText</b>",
      "link": "Direct listing URL"
    }
  ]
}

Guidelines:
- Include at most 3 listings (pick the most relevant by recency/featured status).
- Each listing must contain ONLY id, title, price (prefer priceText if available), and link.
- No descriptions, images, bullets, uiHints, or extra commentary.
- If a field is missing, set that field value to "<b>I don’t have that information available.</b>" but still include other available listings.
- Never fabricate listings beyond the provided context.
`;

const extractImageUrls = (images: Listing['images']): string[] => {
  if (!Array.isArray(images)) {
    return [];
  }

  return (images as Prisma.JsonArray)
    .map((img) => {
      if (typeof img === 'string') {
        return img;
      }

      if (typeof img === 'object' && img !== null) {
        const record = img as Record<string, Prisma.JsonValue>;
        const urlValue = record.url;
        if (typeof urlValue === 'string') {
          return urlValue;
        }
      }

      return null;
    })
    .filter((url): url is string => Boolean(url));
};

export const buildChatMessages = (
  listings: Listing[],
  history: ConversationHistoryMessage[],
  latestUserMessage: string,
  stats?: ListingStatsSummary,
): ChatCompletionMessageParam[] => {
  const listingsJson = listings.slice(0, 3).map((listing) => ({
    id: listing.id,
    title: `<b>${listing.title}</b>`,
    price: `<b>${listing.priceText ?? (listing.price ? `${listing.price} ${listing.currency}` : 'Price not specified')}</b>`,
    link: `/listing/${listing.id}`,
  }));

  const statsSummary = stats
    ? `Total active: ${stats.totalActive}. Cars: ${stats.byCategory.CAR ?? 0}. Houses: ${stats.byCategory.HOUSE ?? 0}. Land: ${stats.byCategory.LAND ?? 0}. Machines: ${stats.byCategory.MACHINE ?? 0}.`
    : 'No stats available.';

  const contextPrompt = `Listings data (max 3 items):\n${JSON.stringify(
    listingsJson,
    null,
    2,
  )}\n\nStats: ${statsSummary}\nUse ONLY this data. If a specific detail is missing, set that field value to "<b>I don’t have that information available.</b>" but still answer with the available listings.`;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: contextPrompt },
  ];

  history.forEach((message) => messages.push(message));
  messages.push({ role: 'user', content: latestUserMessage });

  return messages;
};
