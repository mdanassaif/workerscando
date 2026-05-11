export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  tag: string;
  day: number;
  status: 'live' | 'coming';
  url?: string;
  github?: string;
}
