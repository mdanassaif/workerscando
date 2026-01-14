# URL Metadata API

A Cloudflare Worker that extracts metadata from any URL instantly at the edge. Extracts Open Graph data, Twitter cards, favicons, and more.

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

### Extract Metadata

```
GET /?url=https://example.com
```

### Parameters

- `url` (required): The URL to extract metadata from (must be URL-encoded)

### Response

Returns JSON with extracted metadata including:
- `title` - Page title
- `description` - Page description
- `image` - Open Graph image
- `favicon` - Site favicon
- `openGraph` - Open Graph data
- `twitter` - Twitter Card data
- `favicons` - Favicon data

## Examples

```
/?url=https://www.cloudflare.com
/?url=https%3A%2F%2Fexample.com
```
