export type Verdict = 'yes' | 'kinda' | 'no';
export type VerdictConfidence = 'high' | 'medium';
export type SortOption = 'votes' | 'name' | 'price';

export interface PricingDetail {
  plan: string;
  basis: string;
  unit: string;
  source: string;
  checkedOn: string;
  confidence: string;
  notes: string;
  native: string;
}

export interface PriorArtEntry {
  name: string;
  url: string;
  desc: string;
}

export interface AppData {
  slug: string;
  name: string;
  domain: string;
  category: string;
  subcategory: string | null;
  tagline: string;
  priceMonthly: number | null;
  pricing: PricingDetail;
  verdict: Verdict;
  verdictConfidence: VerdictConfidence;
  verdictSummary: string;
  coreLoopDIY: string | null;
  diyTimeEstimate: string;
  requirements: string[];
  whatYouLose: string[];
  moatTags: string[];
  moatNotes: string | null;
  whyPeopleStillPay: string | null;
  priorArt: PriorArtEntry[];
  relatedSlugs: string[];
  pagePriority: number;
  verifiedOneShot: boolean;
  notes: string;
  reportedReplacements: number;
  prompt: string | null;
}

export interface AppRow {
  slug: string;
  name: string;
  domain: string;
  category: string;
  priceMonthly: number | null;
  verdict: Verdict;
  votes: number;
  pagePriority: number;
  reportedReplacements: number;
}

export interface FilterState {
  verdict: 'all' | Verdict;
  category: string;
  teamSize: number;
  sort: SortOption;
  search: string;
}

export interface Stats {
  peakDay: number;
  viewsToday: number;
  views7d: number;
  visitors7d: number;
}
