/**
 * Index colours. The key matches `categories.accent` in the database,
 * so a category's colour is editable from the dashboard.
 */
export const indexColours = {
  school: "var(--idx-school)",
  paper: "var(--idx-paper)",
  writing: "var(--idx-writing)",
  art: "var(--idx-art)",
  office: "var(--idx-office)",
  learning: "var(--idx-learning)",
} as const;

export type IndexColour = keyof typeof indexColours;

/** Inline style that drives `.idx-edge` and any colour-marked child. */
export function indexStyle(accent: IndexColour) {
  return { "--idx": indexColours[accent] } as React.CSSProperties;
}
