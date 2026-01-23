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
    github: "https://github.com/mdanassaif/workerscando"
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
    github: "https://github.com/mdanassaif/workerscando"
  },
  {
    id: 3,
    name: "URL Shortener",
    slug: "url-shortener",
    description: "Create branded short links with real-time analytics",
    longDescription: "Shorten any URL and get real-time analytics. Track clicks, locations, referrers, and more. Deploy globally in seconds with Cloudflare Workers at the edge.",
    tag: "Tools",
    status: "live",
    day: 3,
    url: "https://workerscando.com/projects/url-shortener",
    github: "https://github.com/mdanassaif/workerscando"
  },

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