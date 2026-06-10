/**
 * Lightweight, dependency-free rendering for assistant messages.
 *
 * Two jobs:
 *  1. Turn the model's plain text into safe HTML (escaped first, then a tiny
 *     subset of Markdown: **bold**, `code`, bullet lines, line breaks).
 *  2. Extract navigation chips — routes the model cited that actually exist in the
 *     user's accessible catalog — so the UI can offer validated "Open" buttons and
 *     never a hallucinated link.
 */

export interface NavChip {
  route: string;
  label: string;
}

export interface FormattedMessage {
  html: string;
  chips: NavChip[];
}

/** Matches route-like tokens such as /conge or /admin/actes/sanctions. */
const ROUTE_TOKEN = /\/[A-Za-z][\w-]*(?:\/[A-Za-z][\w-]*)*/g;

export function formatAssistantMessage(
  text: string,
  routeLabels: Map<string, string>,
): FormattedMessage {
  const chips = extractChips(text, routeLabels);
  const html = toSafeHtml(text);
  return { html, chips };
}

function extractChips(text: string, routeLabels: Map<string, string>): NavChip[] {
  const seen = new Set<string>();
  const chips: NavChip[] = [];
  const matches = text.match(ROUTE_TOKEN) ?? [];
  for (const raw of matches) {
    const route = trimTrailingPunctuation(raw);
    const label = resolveRoute(route, routeLabels);
    if (label && !seen.has(label.route)) {
      seen.add(label.route);
      chips.push(label);
    }
  }
  return chips;
}

/**
 * Resolve a cited token to a real accessible route. Tries the exact route first,
 * then the longest known prefix (so /conge/123 still maps to /conge).
 */
function resolveRoute(token: string, routeLabels: Map<string, string>): NavChip | null {
  if (routeLabels.has(token)) {
    return { route: token, label: routeLabels.get(token)! };
  }
  let best: string | null = null;
  for (const route of routeLabels.keys()) {
    if (token.startsWith(route + '/') && (!best || route.length > best.length)) {
      best = route;
    }
  }
  return best ? { route: best, label: routeLabels.get(best)! } : null;
}

function trimTrailingPunctuation(token: string): string {
  return token.replace(/[).,;:!?»"']+$/, '');
}

function toSafeHtml(text: string): string {
  const escaped = escapeHtml(text);

  return escaped
    .split('\n')
    .map(line => {
      const trimmed = line.trimStart();
      if (/^([-*•])\s+/.test(trimmed)) {
        return `<span class="md-bullet">${inline(trimmed.replace(/^([-*•])\s+/, ''))}</span>`;
      }
      const numbered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
      if (numbered) {
        return `<span class="md-step"><b>${numbered[1]}.</b> ${inline(numbered[2])}</span>`;
      }
      return inline(line);
    })
    .join('<br>');
}

function inline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
