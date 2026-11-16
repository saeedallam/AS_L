# Design toolkit

What is installed in this repository, and how to use it.

## Skills (`.claude/skills/`)

Installed with `npx ui-ux-pro-max-cli` (`uipro init --ai claude`). They load
automatically for any Claude Code session opened in this repository.

| Skill | Use it for |
| --- | --- |
| `ui-ux-pro-max` | Palettes, font pairings, UX guidelines, per-stack UI patterns |
| `design-system` | Design tokens: primitive → semantic → component |
| `ui-styling` | shadcn/ui, Tailwind and accessible component patterns |
| `brand` | Brand voice and visual identity |
| `design`, `slides`, `banner-design` | Logos, presentations, banners |

Upstream: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT).
Update with `uipro init --ai claude`.

## Command: `/web-interface-guidelines`

`.claude/commands/web-interface-guidelines.md` — Vercel's checklist for
accessibility, performance and interaction. Run it against a file before
merging UI work:

```
/web-interface-guidelines src/components/catalog/product-card.tsx
```

Upstream: https://github.com/vercel-labs/web-interface-guidelines (MIT).

## shadcn/ui

`components.json` is configured for Tailwind v4, the App Router and the `@/`
alias. Components land in `src/components/ui/`.

```bash
npx shadcn@latest add button dialog input table
```

The CSS variables shadcn expects (`--primary`, `--muted-foreground`,
`--border`, `--ring`, ...) are defined in `src/app/globals.css` and mapped to
the store palette, so added components match the site without editing.

Our own tokens sit beside them: `brand` (blue), `gold` (amber), `heading`,
`surface`, `subtle`, `line`, `whatsapp`.

## Magic UI

Registered in `components.json` as `@magicui`:

```bash
npx shadcn@latest add @magicui/marquee
```

`motion` is already installed. Magic UI components are animated, so keep them
to a few accents and check them under `prefers-reduced-motion`, which
`globals.css` already honours.

## Icons

`lucide-react` is installed and is the icon set used throughout the site.

## Other references

- https://21st.dev — a component gallery to browse for ideas. Nothing to
  install; copy a pattern and rebuild it with our tokens.
