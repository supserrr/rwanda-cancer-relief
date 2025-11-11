/**
 * Utility helpers for selecting featured counselors for display.
 *
 * Provides a deterministic ranking algorithm that favours availability,
 * oncology-aligned specialties, and demonstrated engagement through session
 * completions.
 */

export interface RankableCounselor {
  /** Unique identifier for the counselor. */
  id: string;
  /** Display name, used for debug output and alphabetical tiebreaks. */
  name?: string;
  /** Primary specialty label. */
  specialty?: string;
  /** Additional specialties or focus areas. */
  specializations?: string[];
  /** Canonical availability indicator (e.g. available, busy, offline). */
  availability?: string;
  /** Rich availability tokens sourced from metadata. */
  availabilityStatus?: string;
  /** Raw availability value prior to normalisation. */
  rawAvailabilityStatus?: string;
  /** Readable availability label. */
  availabilityDisplay?: string;
  /** Whether the counselor is currently accepting new patients. */
  acceptingNewPatients?: boolean;
  /** Number of completed sessions attributed to the counselor. */
  completedSessions?: number;
  /** Total recorded sessions. */
  totalSessions?: number;
  /** Years of experience used as tertiary tiebreaker. */
  experience?: number;
  /** Timestamp representing the most recent profile update. */
  updatedAt?: Date;
  /** Timestamp representing the most recent login. */
  lastLogin?: Date;
  /** Timestamp for the most recently completed session. */
  lastCompletedSessionAt?: Date;
  /** Timestamp for the next scheduled session. */
  nextSessionAt?: Date;
  /** Creation timestamp used as ultimate fallback for recency. */
  createdAt?: Date;
}

export interface FeaturedCounselorOptions {
  /**
   * Domain-specific keywords that should be prioritised when matching
   * counselor specialties. Defaults to oncology and critical-care phrases.
   */
  focusKeywords?: string[];
  /** When enabled, capture diagnostic data for logging. */
  debug?: boolean;
}

export interface FeaturedCounselorSelection<T> {
  /** Highest ranked counselor or `null` when no candidates exist. */
  featured: T | null;
  /** Ordered list of remaining candidates, excluding the featured entry. */
  runnersUp: T[];
  /** Optional debug payload describing ranking decisions. */
  debugLog: Array<Record<string, unknown>>;
}

const DEFAULT_FOCUS_KEYWORDS = [
  'cancer',
  'oncology',
  'palliative',
  'critical',
  'hematology',
  'radiation',
  'chemotherapy',
];

const AVAILABILITY_PRIORITY: Record<string, number> = {
  available: 0,
  open: 0,
  accepting: 0,
  limited: 1,
  waitlist: 1,
  waitlisted: 1,
  busy: 2,
  booked: 2,
  partial: 2,
  offline: 3,
  unavailable: 3,
  inactive: 3,
  away: 3,
  outofoffice: 3,
};

interface PreparedCandidate<T> {
  counselor: T;
  availabilityToken: string;
  availabilityRank: number;
  focusMatch: boolean;
  completedSessions: number;
  recencyScore: number;
  recencyDate?: Date;
  experienceScore: number;
}

/**
 * Normalize an availability string by trimming whitespace, lowering the case,
 * and stripping connecting punctuation.
 *
 * @param value Raw availability token.
 * @returns Normalised availability token suitable for comparison.
 */
const normaliseStatus = (value?: string): string => {
  if (!value) {
    return '';
  }
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
};

/**
 * Evaluate a counselor's availability, returning a comparable token and rank.
 *
 * @param candidate Counselor candidate to evaluate.
 * @returns Normalised availability token and priority rank.
 */
const evaluateAvailability = (candidate: RankableCounselor): { token: string; rank: number } => {
  const candidates = [
    candidate.rawAvailabilityStatus,
    candidate.availabilityStatus,
    candidate.availability,
    candidate.availabilityDisplay,
  ];

  let token = '';
  for (const value of candidates) {
    const normalised = normaliseStatus(value);
    if (normalised.length === 0) {
      continue;
    }
    token = normalised;
    break;
  }

  if (!token) {
    token = 'busy';
  }

  let rank = AVAILABILITY_PRIORITY[token] ?? 2;
  if (candidate.acceptingNewPatients === false && rank < 3) {
    rank += 1;
  }

  return {
    token,
    rank: Math.min(rank, 4),
  };
};

/**
 * Determine if a counselor's specialty aligns with the provided keywords.
 *
 * @param candidate Counselor candidate to inspect.
 * @param keywords List of focus keywords.
 * @returns True when a specialty (or specialisation) contains a keyword.
 */
const hasFocusSpecialty = (candidate: RankableCounselor, keywords: string[]): boolean => {
  const haystack: string[] = [];
  if (candidate.specialty) {
    haystack.push(candidate.specialty);
  }
  if (Array.isArray(candidate.specializations)) {
    haystack.push(...candidate.specializations);
  }

  if (haystack.length === 0) {
    return false;
  }

  const lowerKeywords = keywords.map((keyword) => keyword.toLowerCase());
  return haystack.some((value) => {
    const subject = value.toLowerCase();
    return lowerKeywords.some((keyword) => subject.includes(keyword));
  });
};

/**
 * Extract a consistent completed-session metric used for tie-breaking.
 *
 * @param candidate Counselor candidate to inspect.
 * @returns Number of completed sessions or zero when unavailable.
 */
const extractCompletedSessions = (candidate: RankableCounselor): number => {
  if (typeof candidate.completedSessions === 'number' && Number.isFinite(candidate.completedSessions)) {
    return candidate.completedSessions;
  }
  if (typeof candidate.totalSessions === 'number' && Number.isFinite(candidate.totalSessions)) {
    return candidate.totalSessions;
  }
  return 0;
};

/**
 * Resolve the most appropriate recency timestamp for a counselor candidate.
 *
 * @param candidate Counselor candidate to inspect.
 * @returns The most recent relevant timestamp, if present.
 */
const resolveRecencyDate = (candidate: RankableCounselor): Date | undefined => {
  return (
    candidate.updatedAt ??
    candidate.lastCompletedSessionAt ??
    candidate.lastLogin ??
    candidate.nextSessionAt ??
    candidate.createdAt
  );
};

/**
 * Prepare counselor candidates with derived ranking metadata.
 *
 * @param counselors Counselor candidates to prepare.
 * @param keywords Focus keywords for specialty matching.
 * @returns Prepared candidate objects with ranking scores.
 */
const prepareCandidates = <T extends RankableCounselor>(
  counselors: T[],
  keywords: string[],
): PreparedCandidate<T>[] => {
  return counselors.map((counselor) => {
    const availability = evaluateAvailability(counselor);
    const focusMatch = hasFocusSpecialty(counselor, keywords);
    const completedSessions = extractCompletedSessions(counselor);
    const recencyDate = resolveRecencyDate(counselor);
    const experienceScore =
      typeof counselor.experience === 'number' && Number.isFinite(counselor.experience)
        ? counselor.experience
        : 0;

    return {
      counselor,
      availabilityToken: availability.token,
      availabilityRank: availability.rank,
      focusMatch,
      completedSessions,
      recencyDate,
      recencyScore: recencyDate ? recencyDate.getTime() : 0,
      experienceScore,
    };
  });
};

/**
 * Selects a featured counselor and ranked alternates based on availability,
 * specialty focus, and session engagement.
 *
 * @param counselors Counselor records to evaluate.
 * @param options Optional ranking configuration.
 * @returns Selected featured counselor, ordered alternates, and debug metadata.
 */
export const selectFeaturedCounselors = <T extends RankableCounselor>(
  counselors: T[],
  options?: FeaturedCounselorOptions,
): FeaturedCounselorSelection<T> => {
  if (!Array.isArray(counselors) || counselors.length === 0) {
    return { featured: null, runnersUp: [], debugLog: [] };
  }

  const focusKeywords = (options?.focusKeywords ?? DEFAULT_FOCUS_KEYWORDS).filter(
    (keyword) => typeof keyword === 'string' && keyword.trim().length > 0,
  );

  const prepared = prepareCandidates(counselors, focusKeywords);

  prepared.sort((a, b) => {
    if (a.availabilityRank !== b.availabilityRank) {
      return a.availabilityRank - b.availabilityRank;
    }
    if (a.focusMatch !== b.focusMatch) {
      return a.focusMatch ? -1 : 1;
    }
    if (a.completedSessions !== b.completedSessions) {
      return b.completedSessions - a.completedSessions;
    }
    if (a.recencyScore !== b.recencyScore) {
      return b.recencyScore - a.recencyScore;
    }
    if (a.experienceScore !== b.experienceScore) {
      return b.experienceScore - a.experienceScore;
    }

    const nameA = (a.counselor.name ?? '').toLowerCase();
    const nameB = (b.counselor.name ?? '').toLowerCase();
    if (nameA && nameB) {
      return nameA.localeCompare(nameB);
    }
    if (nameA) {
      return -1;
    }
    if (nameB) {
      return 1;
    }
    return 0;
  });

  const sortedCounselors = prepared.map((entry) => entry.counselor);
  const featured = sortedCounselors[0] ?? null;
  const runnersUp = sortedCounselors.slice(1);

  const debugLog =
    options?.debug === true
      ? prepared.map((entry, index) => ({
          rank: index + 1,
          id: entry.counselor.id,
          name: entry.counselor.name ?? null,
          availability: entry.availabilityToken,
          availabilityRank: entry.availabilityRank,
          focusMatch: entry.focusMatch,
          completedSessions: entry.completedSessions,
          recency: entry.recencyDate ? entry.recencyDate.toISOString() : null,
          experience: entry.experienceScore,
        }))
      : [];

  return {
    featured,
    runnersUp,
    debugLog,
  };
};


