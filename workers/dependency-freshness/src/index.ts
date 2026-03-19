import semver from 'semver';

export interface Env {
  NPM_CACHE?: KVNamespace;
}

interface PackageMeta {
  name: string;
  latest: string | null;
  versions: string[];
  deprecated: Record<string, string>;
  latestPublished: string | null;
  fetchedAt: string;
}

interface PackageResult {
  name: string;
  current: string;
  latest: string | null;
  suggest: string;
  compatible: string | null;
  type: 'prod' | 'dev';
  outdated: boolean;
  breaking: boolean;
  stale: boolean;
  stalenessDays: number | null;
  deprecated: boolean;
  deprecatedLatest: boolean;
  lastPublished: string | null;
  notes?: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

const bad = (message: string, status = 400) => json({ error: message }, status);

// Consider a package "stale" when it has not shipped a release in ~18 months.
const STALE_THRESHOLD_DAYS = 540;

async function fetchPackageMeta(name: string, env: Env, includePrerelease: boolean): Promise<PackageMeta> {
  const cacheKey = `pkg:${name}:${includePrerelease ? 'pr' : 'stable'}`;
  const cached = env.NPM_CACHE && await env.NPM_CACHE.get<PackageMeta>(cacheKey, { type: 'json' });
  if (cached) return { deprecated: {}, latestPublished: null, ...cached };

  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
    headers: { 'User-Agent': 'workerscando-dependency-freshness/1.0' },
    cf: { cacheEverything: true, cacheTtl: 300 },
  });

  if (!res.ok) {
    throw new Error(`npm registry returned ${res.status}`);
  }

  const data = await res.json<any>();
  const versionsAll = Object.keys(data.versions || {});
  const versions = versionsAll
    .filter(v => includePrerelease || !semver.prerelease(v))
    .sort(semver.rcompare);

  const latestTag = data['dist-tags']?.latest as string | undefined;
  const latest = latestTag && (!semver.prerelease(latestTag) || includePrerelease)
    ? latestTag
    : versions[0] || null;

  const deprecated: Record<string, string> = {};
  for (const [version, info] of Object.entries<any>(data.versions || {})) {
    if (info?.deprecated) deprecated[version] = String(info.deprecated);
  }

  const timeMap = data.time || {};
  const latestPublished = latest && typeof timeMap[latest] === 'string'
    ? timeMap[latest]
    : (versions[0] && typeof timeMap[versions[0]] === 'string' ? timeMap[versions[0]] : null);

  const meta: PackageMeta = {
    name,
    latest: latest || null,
    versions,
    deprecated,
    latestPublished,
    fetchedAt: new Date().toISOString(),
  };

  if (env.NPM_CACHE) {
    // Short TTL so registry changes propagate quickly
    await env.NPM_CACHE.put(cacheKey, JSON.stringify(meta), { expirationTtl: 1800 });
  }

  return meta;
}

function safeSuggestion(range: string, min: semver.SemVer | null, meta: PackageMeta, includePrerelease: boolean): { suggest: string; compatible: string | null; breaking: boolean; outdated: boolean; notes?: string } {
  const { latest, versions } = meta;
  if (!latest || !min) return { suggest: range, compatible: null, breaking: false, outdated: false };

  const isExact = Boolean(semver.valid(range));
  const satisfiesLatest = semver.satisfies(latest, range, { includePrerelease });
  const compatible = semver.maxSatisfying(versions, range, { includePrerelease });
  const sameMajor = versions.find(v => semver.major(v) === semver.major(min) && (includePrerelease || !semver.prerelease(v)));
  const breaking = semver.major(latest) !== semver.major(min);

  let suggest = range;

  if (!satisfiesLatest) {
    if (range.startsWith('^') && compatible) {
      suggest = `^${compatible}`;
    } else if (range.startsWith('~') && compatible) {
      suggest = `~${compatible}`;
    } else if (range === '*' || range.toLowerCase() === 'latest') {
      suggest = latest;
    } else if (isExact && sameMajor && sameMajor !== range) {
      // Pinned version: offer latest within same major as safe bump
      suggest = sameMajor;
    } else if (compatible) {
      suggest = compatible;
    } else {
      suggest = latest;
    }
  }

  const outdated = !satisfiesLatest || (isExact && suggest !== range);
  const notes = outdated && breaking ? 'Latest release is a new major version' : undefined;

  return { suggest, compatible: compatible || null, breaking: breaking && outdated, outdated, notes };
}

function buildInstallScript(pkgs: PackageResult[]): string | null {
  const upgrades = pkgs.filter(p => p.outdated).map(p => `${p.name}@${p.suggest}`);
  if (!upgrades.length) return null;
  return `npm install ${upgrades.join(' ')}`;
}

async function parseManifest(body: any): Promise<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }> {
  if (!body) throw new Error('Missing request body');

  if (body.packageJson && typeof body.packageJson === 'object') {
    return {
      dependencies: body.packageJson.dependencies || {},
      devDependencies: body.packageJson.devDependencies || {},
    };
  }

  if (body.url && typeof body.url === 'string') {
    const res = await fetch(body.url);
    if (!res.ok) throw new Error(`Could not fetch package.json from URL (${res.status})`);
    const pkg = await res.json();
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
    };
  }

  throw new Error('Provide packageJson object or url');
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(req.url);
    if (url.pathname !== '/analyze' && url.pathname !== '/api/freshness') {
      return json({
        api: 'Dependency Freshness Check',
        endpoints: ['POST /analyze', 'POST /api/freshness'],
        sample: {
          dependencies: { react: '^18.2.0' },
          devDependencies: { eslint: '^8.55.0' },
          includeDev: true,
        },
      });
    }

    if (req.method !== 'POST') {
      return bad('Use POST with a package.json payload');
    }

    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return bad('Invalid JSON body');
    }

    const includeDev = Boolean(body.includeDev);
    const allowPrerelease = Boolean(body.allowPrerelease);

    let manifest;
    try {
      manifest = await parseManifest(body);
    } catch (e) {
      return bad(e instanceof Error ? e.message : 'Unable to read package.json');
    }

    const entries: Array<{ name: string; range: string; type: 'prod' | 'dev' }> = [];
    for (const [name, range] of Object.entries(manifest.dependencies || {})) {
      if (typeof range === 'string') entries.push({ name, range, type: 'prod' });
    }
    if (includeDev) {
      for (const [name, range] of Object.entries(manifest.devDependencies || {})) {
        if (typeof range === 'string') entries.push({ name, range, type: 'dev' });
      }
    }

    if (!entries.length) return bad('No dependencies found');
    if (entries.length > 200) return bad('Too many dependencies (limit 200)');

    const results: PackageResult[] = [];
    for (const entry of entries) {
      try {
        const meta = await fetchPackageMeta(entry.name, env, allowPrerelease);
        const min = semver.minVersion(entry.range);
        const { suggest, compatible, breaking, outdated, notes } = safeSuggestion(entry.range, min, meta, allowPrerelease);

        const resolvedVersion = compatible || (min ? min.version : null);
        const deprecatedCurrentMsg = resolvedVersion ? meta.deprecated[resolvedVersion] : undefined;
        const deprecatedLatestMsg = meta.latest ? meta.deprecated[meta.latest] : undefined;

        const lastPublished = meta.latestPublished;
        const stalenessDays = lastPublished ? Math.round((Date.now() - Date.parse(lastPublished)) / 86_400_000) : null;
        const stale = stalenessDays !== null && stalenessDays > STALE_THRESHOLD_DAYS;

        const noteParts = [];
        if (notes) noteParts.push(notes);
        if (deprecatedCurrentMsg) noteParts.push('Current range resolves to a deprecated release');
        if (deprecatedLatestMsg) noteParts.push('Latest release is marked deprecated');
        if (stale) noteParts.push(`No new release in ${stalenessDays} days`);
        const mergedNotes = noteParts.length ? noteParts.join('; ') : undefined;

        results.push({
          name: entry.name,
          current: entry.range,
          latest: meta.latest,
          suggest,
          compatible,
          type: entry.type,
          outdated,
          breaking,
          stale,
          stalenessDays,
          deprecated: Boolean(deprecatedCurrentMsg),
          deprecatedLatest: Boolean(deprecatedLatestMsg),
          lastPublished,
          notes: mergedNotes,
        });
      } catch (err) {
        results.push({
          name: entry.name,
          current: entry.range,
          latest: null,
          suggest: entry.range,
          compatible: null,
          type: entry.type,
          outdated: false,
          breaking: false,
          stale: false,
          stalenessDays: null,
          deprecated: false,
          deprecatedLatest: false,
          lastPublished: null,
          notes: err instanceof Error ? err.message : 'Failed to check',
        });
      }
    }

    const summary = {
      total: results.length,
      outdated: results.filter(r => r.outdated).length,
      breaking: results.filter(r => r.breaking).length,
      stale: results.filter(r => r.stale).length,
      deprecated: results.filter(r => r.deprecated || r.deprecatedLatest).length,
    };

    const installScript = buildInstallScript(results);

    return json({ summary, packages: results, installScript });
  },
};
