interface Props {
  items?: string[];
}

const DEFAULT_ITEMS = [
  'PUBG: BATTLEGROUNDS — STEAM PC',
  'GLACIER M416 · AWM FOOL · AKM JADE TWILIGHT',
  'CONQUEROR · ACE · CROWN · DIAMOND',
  'BẢO HÀNH TRỌN ĐỜI',
  'GIAO ACC 5 PHÚT QUA TELEGRAM / ZALO',
  'FULL MAIL · ĐỔI HOTMAIL · ĐỔI MẬT KHẨU',
  'THANH TOÁN MOMO · BANKING · CRYPTO',
];

export default function Marquee({ items = DEFAULT_ITEMS }: Props) {
  const list = [...items, ...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {list.map((it, i) => (
          <span key={i} className="marquee-item">
            {it}
            <span className="marquee-sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
