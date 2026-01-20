# WorkersCanDo

**100 micro-tools in 100 days — all powered by Cloudflare Workers.**

We're building a collection of fast, free, and focused developer tools that run at the edge. Each tool solves one problem really well, and you can learn how it works under the hood.

## What is This?

WorkersCanDo is more than just a tool collection — it's a learning journey. We're exploring what's possible with Cloudflare Workers by building real, useful tools and sharing everything along the way.

Whether you're curious about edge computing, want to learn serverless development, or just need a quick tool that works — you're in the right place.

## The Challenge

**100 tools. 100 days. Zero excuses.**

Every tool we build is:
- ⚡ **Fast** — deployed globally on 300+ edge locations
- 🎯 **Focused** — does one thing and does it well
- 🆓 **Free** — no auth, no limits, just use it
- 📖 **Open** — learn from the code, contribute your ideas

## Live Tools

Here are some tools already live and ready to use:

| Tool | What it does |
|------|--------------|
| **URL Metadata API** | Extract title, description, OG tags from any URL |
| **Dynamic OG Images** | Generate social sharing images on the fly |
| *...and more coming every day* | |

Check out all projects at [workerscando.com/projects](https://workerscando.com/projects)

## Learn With Us

This project is perfect if you want to:

- **Learn Cloudflare Workers** — see real examples of what's possible
- **Understand edge computing** — why it's fast and when to use it
- **Build your own tools** — use our code as a starting point
- **Contribute ideas** — suggest tools you wish existed

## Get Involved

### Suggest a Tool

Have an idea for a micro-tool? We'd love to hear it! Great suggestions are:
- Small and focused (one clear purpose)
- Useful for developers or everyday users
- Possible to build with Cloudflare Workers

### Contribute Code

Want to build a tool yourself? Even better! Check our docs for guidelines on how to contribute.

### Follow the Journey

Star this repo to follow along as we build all 100 tools. We share what we learn, including the mistakes.

## Running Locally

### Frontend (Next.js)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### Backend Workers (Cloudflare)
```bash
# Install all worker dependencies
cd workers && npm run install:all

# Run a specific worker locally
npm run dev:url-metadata      # http://localhost:8787
npm run dev:og-image          # http://localhost:8787
npm run dev:url-shortener     # http://localhost:8787
```

## Deployment

### Frontend → Vercel
```bash
git push origin main    # Auto-deploys via Vercel
```

### Workers → Cloudflare
```bash
cd workers

# Deploy a single worker
npm run deploy:url-metadata
npm run deploy:og-image
npm run deploy:url-shortener

# Deploy ALL workers at once
npm run deploy:all
```

## Architecture

This project uses a **decoupled architecture**:

- **Frontend**: Next.js deployed on **Vercel**
- **Backend APIs**: Cloudflare Workers deployed separately

### API Endpoints (Cloudflare Workers)

| Tool | API URL |
|------|---------|
| URL Metadata API | `https://url-metadata-api.brogee9o9.workers.dev/api/metadata` |
| OG Image Generator | `https://og-image-generator.brogee9o9.workers.dev/api/og` |
| URL Shortener | `https://urlshortener.brogee9o9.workers.dev/api/shorten` |

## Project Structure

**One repo, separate deployments:**

```
workerscando/
├── src/                        # Frontend (Next.js) → Deploy to Vercel
│   ├── app/                    # App Router pages
│   ├── components/             # UI components
│   ├── lib/                    # Utilities & data
│   └── styles/                 # CSS modules
│
├── workers/                    # Backend (Cloudflare Workers) → Deploy to Cloudflare
│   ├── url-metadata/           # Tool 1: URL Metadata API
│   ├── og-image/               # Tool 2: OG Image Generator
│   ├── url-shortener/          # Tool 3: URL Shortener
│   ├── shared/                 # Shared utilities
│   └── package.json            # Scripts to manage all workers
│
├── public/                     # Static assets
└── package.json                # Frontend dependencies
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel
- **Tools Backend**: Cloudflare Workers

## Why Cloudflare Workers?

### What are Cloudflare Workers?

**Beginner:**
Cloudflare Workers let you run your code on servers all around the world, so your site and APIs are super fast for everyone. You don’t need to manage any servers—just write your code and deploy. It’s perfect for building tools, APIs, and microservices that need to be fast and reliable.

**Expert:**
Cloudflare Workers are serverless functions running at Cloudflare’s edge network (300+ locations). They enable ultra-low-latency APIs, microservices, and dynamic content, with instant cold starts and global scaling. Workers are ideal for edge-first architectures, JAMstack, and modern web apps that demand performance and resilience.

We're proving that you can build genuinely useful tools with Workers, and we want to show you how.

## Links

- 🌐 **Website**: [workerscando.com](https://workerscando.com)
- 📚 **Docs**: [workerscando.com/docs](https://workerscando.com/docs)
- 🛠️ **All Projects**: [workerscando.com/projects](https://workerscando.com/projects)

---

**Built with curiosity by developers who believe in learning by doing.**

Questions? Ideas? Open an issue — we read everything.