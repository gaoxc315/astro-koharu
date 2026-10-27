/**
 * Motion configuration normalization.
 *
 * Single source of truth for `motion:` defaults in `config/site.yaml`.
 * Defaults are applied per field, so a partial YAML section keeps the defaults
 * for every field it does not mention.
 */

import type { MotionConfig, MotionLevel, ResolvedMotionConfig } from './types';

export const MOTION_LEVELS: readonly MotionLevel[] = ['lively', 'subtle', 'reduced'];

/** Built-in click-burst petals, one gradient per file so a burst still shifts color. */
export const DEFAULT_CLICK_BURST_PETALS = [
  '/img/effects/sakura-petal-1.svg',
  '/img/effects/sakura-petal-2.svg',
  '/img/effects/sakura-petal-3.svg',
  '/img/effects/sakura-petal-4.svg',
] as const;

/** Built-in flower flanking section titles such as pinned posts. */
export const DEFAULT_SECTION_BLOOM = '/img/effects/sakura-bloom.svg';

export const MOTION_DEFAULTS: ResolvedMotionConfig = {
  level: 'lively',
  heroPetals: true,
  heroPetalSources: [],
  clickBurst: true,
  clickBurstPetals: DEFAULT_CLICK_BURST_PETALS,
  sectionBloom: DEFAULT_SECTION_BLOOM,
  footerBloom: '',
  tocPetal: '',
};

const DECORATION_EXT = /\.(svg|gif)$/i;

/** Keep a root-relative or http(s) svg/gif path. Anything else is dropped. */
function normalizeDecorationAsset(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw || raw.includes('..') || raw.includes('\\') || /\s/.test(raw)) return null;

  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      return null;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!DECORATION_EXT.test(url.pathname)) return null;
    return url.href;
  }

  const path = raw.startsWith('/') ? raw : `/${raw}`;
  if (path.startsWith('//')) return null;
  const pathname = path.split(/[?#]/)[0];
  if (!DECORATION_EXT.test(pathname)) return null;
  return path;
}

function resolvePetals(value: unknown, fallback: readonly string[]): readonly string[] {
  if (value === undefined) return fallback;
  if (value === null || value === '') return [];
  const entries = Array.isArray(value) ? value : [value];
  const petals = entries.flatMap((entry) => {
    const path = normalizeDecorationAsset(entry);
    return path ? [path] : [];
  });
  if (petals.length === 0 && !Array.isArray(value) && typeof value !== 'string') return fallback;
  return petals;
}

/** A configured svg/gif, the built-in mark when cleared, or `fallback` when the field is absent or invalid. */
function resolveBloom(value: unknown, fallback: string): string {
  if (value === undefined) return fallback;
  if (value === null || value === '') return '';
  return normalizeDecorationAsset(value) ?? fallback;
}

export function isMotionLevel(value: unknown): value is MotionLevel {
  return MOTION_LEVELS.includes(value as MotionLevel);
}

/**
 * Resolve the raw `motion:` YAML section into a fully populated config.
 * Values of the wrong type fall back to the default for that field.
 */
export function normalizeMotionConfig(raw?: Partial<MotionConfig> | null): ResolvedMotionConfig {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    level: isMotionLevel(source.level) ? source.level : MOTION_DEFAULTS.level,
    heroPetals: typeof source.heroPetals === 'boolean' ? source.heroPetals : MOTION_DEFAULTS.heroPetals,
    heroPetalSources: resolvePetals(source.heroPetal, MOTION_DEFAULTS.heroPetalSources),
    clickBurst: typeof source.clickBurst === 'boolean' ? source.clickBurst : MOTION_DEFAULTS.clickBurst,
    clickBurstPetals: resolvePetals(source.clickBurstPetal, MOTION_DEFAULTS.clickBurstPetals),
    sectionBloom: resolveBloom(source.sectionBloom, MOTION_DEFAULTS.sectionBloom),
    footerBloom: resolveBloom(source.footerBloom, MOTION_DEFAULTS.footerBloom),
    tocPetal: resolveBloom(source.tocPetal, MOTION_DEFAULTS.tocPetal),
  };
}
