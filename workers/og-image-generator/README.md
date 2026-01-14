# Dynamic OG Image Generator

A Cloudflare Worker that generates beautiful Open Graph images on-the-fly using SVG.

## Development

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run deploy
```

## Usage

### Generate OG Image

```
GET /api/og?title=Hello+World&theme=midnight&layout=standard
```

### Parameters

- `title` (required): Main title text
- `subtitle` (optional): Secondary text
- `author` (optional): Author name
- `domain` (optional): Website domain
- `theme` (optional): Color theme (midnight, sunset, ocean, forest, minimal, rose)
- `layout` (optional): Layout style (standard, centered, minimal, bold)
- `emoji` (optional): Emoji to display
- `date` (optional): Date string

## Examples

```
/api/og?title=My+Blog+Post&author=John+Doe&theme=sunset&layout=centered
/api/og?title=Hello+World&subtitle=Welcome&theme=midnight&emoji=🚀
```
