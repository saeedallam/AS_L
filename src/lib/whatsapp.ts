/**
 * Builds a wa.me link. Returns null when no number is configured,
 * so callers can hide the button instead of rendering a dead link.
 */
export function buildWhatsAppUrl(
  number: string,
  message?: string,
): string | null {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
