// Structured Data Parser — Extract steps, fees, links from AI responses
// Powers the rich message rendering on the frontend

export interface StructuredStep {
  number: number;
  text: string;
}

export interface StructuredFee {
  amount: string;
  description: string;
}

export interface StructuredLink {
  url: string;
  label: string;
}

export interface StructuredData {
  steps: StructuredStep[];
  fees: StructuredFee[];
  links: StructuredLink[];
  hasSteps: boolean;
  hasFees: boolean;
  hasLinks: boolean;
}

/**
 * Parse AI response text into structured data for rich rendering.
 */
export function parseStructuredData(text: string): StructuredData {
  const steps = extractSteps(text);
  const fees = extractFees(text);
  const links = extractLinks(text);

  return {
    steps,
    fees,
    links,
    hasSteps: steps.length > 0,
    hasFees: fees.length > 0,
    hasLinks: links.length > 0,
  };
}

/**
 * Extract numbered steps (e.g., "1. Do this", "2. Do that").
 */
function extractSteps(text: string): StructuredStep[] {
  const steps: StructuredStep[] = [];
  const stepRegex = /^\s*(\d+)[.)]\s+(.+)$/gm;

  let match;
  while ((match = stepRegex.exec(text)) !== null) {
    steps.push({
      number: parseInt(match[1], 10),
      text: match[2].trim(),
    });
  }

  return steps;
}

/**
 * Extract fees/costs (e.g., "KES 7,550", "KES 0 (Free)").
 */
function extractFees(text: string): StructuredFee[] {
  const fees: StructuredFee[] = [];
  const feeRegex = /KES\s*([\d,]+(?:\.\d{2})?)\s*(\([^)]*\))?/gi;

  let match;
  while ((match = feeRegex.exec(text)) !== null) {
    const amount = `KES ${match[1]}`;
    const description = match[2] ? match[2].replace(/[()]/g, "").trim() : "";

    // Avoid duplicates
    if (!fees.some((f) => f.amount === amount)) {
      fees.push({ amount, description });
    }
  }

  // Check for "Free" or "no cost"
  if (/\bfree\b/i.test(text) && fees.length === 0) {
    fees.push({ amount: "KES 0", description: "Free" });
  }

  return fees;
}

/**
 * Extract URLs from text.
 */
function extractLinks(text: string): StructuredLink[] {
  const links: StructuredLink[] = [];
  const urlRegex = /https?:\/\/[^\s,)]+/gi;

  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0].replace(/[.)]+$/, ""); // strip trailing punctuation
    const domain = new URL(url).hostname.replace("www.", "");
    const label = domain.includes(".go.ke") ? `${domain} (Official)` : domain;

    if (!links.some((l) => l.url === url)) {
      links.push({ url, label });
    }
  }

  return links;
}
