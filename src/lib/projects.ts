import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 1,
    name: "URL Metadata API",
    slug: "url-metadata-api",
    description: "Extract metadata from any URL instantly at the edge",
    longDescription: "A powerful API that fetches and parses metadata from any URL including title, description, Open Graph tags, favicons, and more. Built on Cloudflare Workers for lightning-fast global response times.",
    tag: "API",
    status: "live",
    day: 1,
    url: "https://url-metadata-api.brogee9o9.workers.dev/",
    github: "https://github.com"
  },
  {
    id: 2,
    name: "Dynamic OG Images",
    slug: "dynamic-og-images",
    description: "Generate beautiful Open Graph images on the fly",
    longDescription: "Create stunning, customizable Open Graph images dynamically. Perfect for blogs, social sharing, and marketing. Generates images at the edge with zero cold starts.",
    tag: "Generator",
    status: "live",
    day: 2,
    url: "https://og-image-generator.brogee9o9.workers.dev/",
    github: "https://github.com"
  },
  {
    id: 3,
    name: "QR Code Generator",
    slug: "qr-code-generator",
    description: "Generate QR codes instantly via Workers",
    tag: "Generator",
    status: "coming",
    day: 3
  },
  {
    id: 4,
    name: "JSON Formatter",
    slug: "json-formatter",
    description: "Format and validate JSON on the fly",
    tag: "Developer",
    status: "coming",
    day: 4
  },
  {
    id: 5,
    name: "Markdown Preview",
    slug: "markdown-preview",
    description: "Real-time markdown to HTML conversion",
    tag: "Developer",
    status: "coming",
    day: 5
  },
  {
    id: 6,
    name: "Color Palette",
    slug: "color-palette",
    description: "Generate beautiful color palettes instantly",
    tag: "Design",
    status: "coming",
    day: 6
  }
];

export const getProjectBySlug = (slug: string): Project | undefined => {
  return projects.find(p => p.slug === slug);
};

export const getLiveProjects = (): Project[] => {
  return projects.filter(p => p.status === 'live');
};

export const getComingProjects = (): Project[] => {
  return projects.filter(p => p.status === 'coming');
};