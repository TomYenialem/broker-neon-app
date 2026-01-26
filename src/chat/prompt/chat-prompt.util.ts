import { Listing } from '@prisma/client';

export type ConversationHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `You are PLANCA Broker Assistant, a concise real-estate expert.
Guidelines:
- Only answer using listings provided in context; never invent or assume data.
- If a detail is unavailable, respond exactly with "I don’t have that information available." for that part.
- If the user asks about listings that are not in the provided context, respond exactly with "I don’t have that information available." and do not speculate.
- Ask clarifying questions when buyer requirements are incomplete.
- Refrain from financial or legal advice.
- Keep responses short, friendly, and actionable.`;

export const buildChatMessages = (
  listings: Listing[],
  history: ConversationHistoryMessage[],
  latestUserMessage: string,
) => {
  const listingBlock = listings.length
    ? listings
        .map((listing, index) => {
          const location =
            [listing.province, listing.municipality, listing.neighborhood]
              .filter(Boolean)
              .join(', ') || 'Location unavailable';
          const price =
            listing.priceText ??
            (listing.price
              ? `${listing.price} ${listing.currency}`
              : 'Price not specified');
          const status = listing.status ?? 'UNKNOWN';
          return `${index + 1}. ${listing.title} (${listing.category}) — ${location} — ${status} — ${price} :: ${listing.description ?? 'No description provided.'}`;
        })
        .join('\n')
    : 'No listings available for this query.';

  const contextPrompt = `Available listings:\n${listingBlock}\nUse ONLY this data when answering. If the user requests information beyond this list, respond exactly with "I don’t have that information available."`;

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] =
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: contextPrompt },
    ];

  history.forEach((message) => messages.push(message));
  messages.push({ role: 'user', content: latestUserMessage });

  return messages;
};
