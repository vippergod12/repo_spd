/**
 * Helper PUBG tier — map tên tier sang CSS class màu sắc.
 * Tier badges hiển thị ở ProductCard, trang chi tiết acc, filter chip.
 */

import type { PubgTier } from '../types';

/** Convert tier display name (vd "Ace Master") → CSS modifier slug. */
export function tierClass(tier?: string | null): string {
  if (!tier) return '';
  return 'tier-' + tier.toLowerCase().replace(/\s+/g, '-');
}

/** Tất cả tier hiển thị ở filter / dropdown — sort theo độ "đẳng cấp". */
export const ALL_TIERS: PubgTier[] = [
  'Conqueror',
  'Ace Master',
  'Ace Dominator',
  'Ace',
  'Crown',
  'Diamond',
  'Platinum',
  'Gold',
  'Silver',
  'Bronze',
];

/** Map tier → màu hex (cho inline style nếu cần). */
export const TIER_COLOR: Record<string, string> = {
  Conqueror: '#ff3da6',
  'Ace Master': '#b347ff',
  'Ace Dominator': '#b347ff',
  Ace: '#b347ff',
  Crown: '#ffd700',
  Diamond: '#00d4ff',
  Platinum: '#b8c5d6',
  Gold: '#f5a623',
  Silver: '#94a3b8',
  Bronze: '#c2773a',
};

/** Server PUBG PC chính. */
export const ALL_SERVERS = ['AS', 'SEA', 'EU', 'NA', 'KR/JP', 'SA', 'OC', 'Global'] as const;

/** Loại đăng ký Steam (cho biết acc có đổi mail được không). */
export const REGISTER_METHODS = [
  'Steam Mail',     // có quyền truy cập mail đăng ký → đổi mail được
  'Steam Phone',    // gắn SĐT, không có mail full
  'Steam Full',     // mail + phone + secret answer — full quyền
  'Other',
] as const;
