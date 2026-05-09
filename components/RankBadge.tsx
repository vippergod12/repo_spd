/**
 * Hiển thị rank PUBG PC theo style gaming với màu sắc đặc trưng.
 *   Bronze / Silver / Gold / Platinum / Diamond / Master / Grandmaster
 */

interface Props {
  rank?: string | null;
  className?: string;
}

const RANK_CLASS: Record<string, string> = {
  Bronze: 'rank-bronze',
  Silver: 'rank-silver',
  Gold: 'rank-gold',
  Platinum: 'rank-platinum',
  Diamond: 'rank-diamond',
  Master: 'rank-master',
  Grandmaster: 'rank-grandmaster',
};

export default function RankBadge({ rank, className = '' }: Props) {
  if (!rank) return null;
  const klass = RANK_CLASS[rank] ?? '';
  return (
    <span className={`rank-badge ${klass} ${className}`.trim()}>
      {rank}
    </span>
  );
}
