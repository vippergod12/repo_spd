import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

/**
 * Seed dữ liệu mẫu cho R.E.P.O — shop bán account PUBG: BATTLEGROUNDS PC.
 *
 * - 1 admin (tài khoản từ env)
 * - 8 danh mục (theo tier Conqueror→Bronze + nhóm "Glacier", "Mythic", "Starter")
 * - 25 account thực tế: tên, rank, level, server, skin tag, K/D, win rate, có Mythic
 *
 * Toàn bộ dùng UPSERT (ON CONFLICT) nên có thể chạy đi chạy lại an toàn.
 */

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL chưa được cấu hình trong .env');
    process.exit(1);
  }

  const sql = neon(url);

  /* ============== 1. Admin ============== */
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin@123';
  const passwordHash = await bcrypt.hash(password, 10);

  await sql`
    INSERT INTO admins (username, password_hash)
    VALUES (${username}, ${passwordHash})
    ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;
  console.log(`[1/3] Đã tạo/cập nhật admin: ${username}`);

  /* ============== 2. Categories ============== */
  // Ảnh dùng Unsplash gaming/PUBG-style. Có thể đổi qua admin sau.
  const categories: { name: string; slug: string; image_url: string; description: string }[] = [
    {
      name: 'Acc Conqueror',
      slug: 'acc-conqueror',
      image_url:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&auto=format&fit=crop',
      description:
        'Acc Conqueror PUBG: BATTLEGROUNDS — top tier season hiện tại. Đầy đủ skin Glacier, KDR cao, win rate top 1%.',
    },
    {
      name: 'Acc Ace · Ace Master',
      slug: 'acc-ace',
      image_url:
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=900&auto=format&fit=crop',
      description:
        'Acc Ace / Ace Master — tier cao thứ 2 chỉ sau Conqueror. Phù hợp cho player muốn chiến rank competitive.',
    },
    {
      name: 'Acc Crown · Diamond',
      slug: 'acc-crown-diamond',
      image_url:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&auto=format&fit=crop',
      description:
        'Acc tier Crown / Diamond — đủ skin & level cao, phù hợp vào ranked mà không quá đắt.',
    },
    {
      name: 'Acc Full Glacier (M416 / AKM / AWM)',
      slug: 'acc-full-glacier',
      image_url:
        'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&auto=format&fit=crop',
      description:
        'Acc có đầy đủ bộ Glacier huyền thoại — M416, AKM, AWM Glacier. Skin tier mythic siêu hiếm.',
    },
    {
      name: 'Acc Mythic / Limited Edition',
      slug: 'acc-mythic-limited',
      image_url:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&auto=format&fit=crop',
      description:
        'Acc PUBG: BATTLEGROUNDS PC có set mythic / limited edition: Wanderer Set, Werewolf, PGC Crown, Pillage Set, Twitch Drops Bronze Crown — chỉ có ở PC, không có ở Mobile.',
    },
    {
      name: 'Acc Starter (giá rẻ)',
      slug: 'acc-starter-gia-re',
      image_url:
        'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=900&auto=format&fit=crop',
      description:
        'Acc giá rẻ cho người mới — tier Bronze/Silver/Gold, level vừa đủ, phù hợp tập làm quen game.',
    },
    {
      name: 'Acc Steam Lv cao + Inventory',
      slug: 'acc-steam-level-cao',
      image_url:
        'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=900&auto=format&fit=crop',
      description:
        'Acc Steam level cao kèm inventory CS:GO / Rust / DOTA2. Hoá ra acc PUBG nhưng giá trị Steam library cao.',
    },
    {
      name: 'Acc Server Riêng (KR/JP, EU, NA)',
      slug: 'acc-server-rieng',
      image_url:
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&auto=format&fit=crop',
      description:
        'Acc đăng ký ở server riêng (Korea/Japan, Europe, North America) — phù hợp player muốn chiến server ít lag, ít cheat.',
    },
  ];

  for (const c of categories) {
    await sql`
      INSERT INTO categories (name, slug, image_url, description)
      VALUES (${c.name}, ${c.slug}, ${c.image_url}, ${c.description})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        image_url = EXCLUDED.image_url,
        description = EXCLUDED.description,
        updated_at = NOW()
    `;
  }
  console.log(`[2/3] Đã tạo ${categories.length} danh mục.`);

  /* ============== 3. Products (accounts) ============== */
  type SeedAcc = {
    slug: string;
    name: string;
    description: string;
    price: number;
    sale_price?: number;
    sale_end_at?: string;
    image_url: string;
    images?: string[];
    category_slug: string;
    colors: string[];                 // skin tags
    account_code: string;
    tier: string;
    steam_level?: number;
    pubg_level?: number;
    server: string;
    hours_played?: number;
    skin_count?: number;
    has_mythic?: boolean;
    register_method: string;
    gcoin_balance?: number;
    kd_ratio?: number;
    win_rate?: number;
    is_hero?: boolean;
    featured_rank?: number;
  };

  const SALE_END = (days: number) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  // Pool ảnh PUBG PC: gaming setup, FPS gameplay, esports tournament, RGB
  // mechanical keyboard, dark monitor — tone esports gaming PC.
  // Mọi ảnh từ Unsplash (free) — có thể đổi qua admin panel.
  const IMG = {
    pubg1:  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop', // PC gaming setup RGB
    pubg2:  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop', // Esports player headset
    pubg3:  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop', // Gaming controller dark
    pubg4:  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&auto=format&fit=crop', // Esports arena monitors
    pubg5:  'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200&auto=format&fit=crop', // Gaming PC RGB tower
    pubg6:  'https://images.unsplash.com/photo-1591840205063-39c7f7e64f12?w=1200&auto=format&fit=crop', // Mechanical keyboard close-up
    pubg7:  'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=1200&auto=format&fit=crop', // Gaming desk dark
    pubg8:  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&auto=format&fit=crop', // Esports gameplay screen
    pubg9:  'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&auto=format&fit=crop', // FPS gamer focused
    pubg10: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&auto=format&fit=crop', // Battle royale aesthetic
  };

  const products: SeedAcc[] = [
    // ============== CONQUEROR ==============
    {
      slug: 'acc-conqueror-sea-glacier-trinity',
      name: 'Conqueror SEA — Trinity Glacier (M416 + AKM + AWM)',
      description:
        'Acc top server SEA season hiện tại — Conqueror rank #87. Đầy đủ Glacier M416, AKM Glacier Diadem, AWM Pyromaniac. Outfit: Trench Coat full set, Wanderer Set season 27. KDR 5.21, win rate 14.2%. Hotmail full quyền — đăng nhập Steam an toàn vĩnh viễn.',
      price: 28_500_000,
      sale_price: 25_900_000,
      sale_end_at: SALE_END(14),
      image_url: IMG.pubg1,
      images: [IMG.pubg1, IMG.pubg4, IMG.pubg5],
      category_slug: 'acc-conqueror',
      colors: ['Glacier M416', 'Glacier AWM', 'Wanderer Set', 'Conqueror Title'],
      account_code: '#REPO1024',
      tier: 'Conqueror',
      steam_level: 88,
      pubg_level: 256,
      server: 'SEA',
      hours_played: 2840,
      skin_count: 187,
      has_mythic: true,
      register_method: 'Steam Full',
      gcoin_balance: 15600,
      kd_ratio: 5.21,
      win_rate: 14.2,
      is_hero: true,
      featured_rank: 1,
    },
    {
      slug: 'acc-conqueror-as-fpp-glacier-m416',
      name: 'Conqueror AS FPP — Glacier M416 + KDR 4.8',
      description:
        'Acc Conqueror server Asia mode FPP. Glacier M416, AKM Glacier, set Trench Coat đen. Match history toàn top 5. Mua xong là chiến rank ngay.',
      price: 18_900_000,
      image_url: IMG.pubg2,
      images: [IMG.pubg2, IMG.pubg3],
      category_slug: 'acc-conqueror',
      colors: ['Glacier M416', 'Glacier AKM', 'Trench Coat'],
      account_code: '#REPO1031',
      tier: 'Conqueror',
      steam_level: 64,
      pubg_level: 198,
      server: 'AS',
      hours_played: 1980,
      skin_count: 124,
      has_mythic: true,
      register_method: 'Steam Mail',
      gcoin_balance: 8420,
      kd_ratio: 4.82,
      win_rate: 12.8,
      featured_rank: 2,
    },
    {
      slug: 'acc-conqueror-eu-tpp-collection',
      name: 'Conqueror EU TPP — Bộ sưu tập 200+ skin',
      description:
        'Acc Conqueror server Europe TPP. Bộ skin sưu tập từ season 5: Glacier, Goldfish Kar98K, Hong Kong Kar98K, Diadem AKM, Ribbon Pyromaniac AWM. Ngân sách lớn.',
      price: 32_000_000,
      image_url: IMG.pubg3,
      category_slug: 'acc-conqueror',
      colors: ['Glacier M416', 'Glacier AWM', 'Goldfish Kar98K', 'Hong Kong Kar98K'],
      account_code: '#REPO1042',
      tier: 'Conqueror',
      steam_level: 102,
      pubg_level: 312,
      server: 'EU',
      hours_played: 3420,
      skin_count: 213,
      has_mythic: true,
      register_method: 'Steam Full',
      gcoin_balance: 22340,
      kd_ratio: 4.45,
      win_rate: 11.6,
      featured_rank: 3,
    },

    // ============== ACE ==============
    {
      slug: 'acc-ace-master-sea-fool-m416',
      name: 'Ace Master SEA — Fool M416 + AWM Pyromaniac',
      description:
        'Acc Ace Master season hiện tại. Có Fool M416 cực hiếm, AWM Pyromaniac, KDR 3.8. Phù hợp cho player muốn lên Conqueror season tới.',
      price: 12_500_000,
      sale_price: 10_900_000,
      sale_end_at: SALE_END(10),
      image_url: IMG.pubg4,
      category_slug: 'acc-ace',
      colors: ['Fool M416', 'Pyromaniac AWM'],
      account_code: '#REPO1058',
      tier: 'Ace Master',
      steam_level: 42,
      pubg_level: 142,
      server: 'SEA',
      hours_played: 1240,
      skin_count: 98,
      has_mythic: true,
      register_method: 'Steam Mail',
      gcoin_balance: 5210,
      kd_ratio: 3.84,
      win_rate: 9.4,
      featured_rank: 4,
    },
    {
      slug: 'acc-ace-dominator-as-budget',
      name: 'Ace Dominator AS — Acc giá tốt cho ranked',
      description:
        'Acc Ace Dominator server Asia. Skin vừa đủ: Ice Fang M416, Goldfish Kar98K. KDR 3.2. Giá tốt cho người chơi ranked.',
      price: 5_800_000,
      image_url: IMG.pubg5,
      category_slug: 'acc-ace',
      colors: ['Ice Fang M416', 'Goldfish Kar98K'],
      account_code: '#REPO1063',
      tier: 'Ace Dominator',
      steam_level: 28,
      pubg_level: 96,
      server: 'AS',
      hours_played: 720,
      skin_count: 56,
      register_method: 'Steam Mail',
      gcoin_balance: 1820,
      kd_ratio: 3.21,
      win_rate: 7.8,
    },
    {
      slug: 'acc-ace-na-tpp-clean',
      name: 'Ace NA TPP — Acc clean, mới mua',
      description:
        'Acc Ace server North America TPP. Profile clean, ít trận, skin cơ bản. Phù hợp player muốn boost lên Ace Master nhanh.',
      price: 4_200_000,
      image_url: IMG.pubg6,
      category_slug: 'acc-ace',
      colors: ['Diadem AKM'],
      account_code: '#REPO1071',
      tier: 'Ace',
      steam_level: 22,
      pubg_level: 78,
      server: 'NA',
      hours_played: 380,
      skin_count: 32,
      register_method: 'Steam Full',
      gcoin_balance: 980,
      kd_ratio: 2.94,
      win_rate: 6.5,
    },

    // ============== CROWN / DIAMOND ==============
    {
      slug: 'acc-crown-sea-glacier-m416-only',
      name: 'Crown SEA — Có Glacier M416',
      description:
        'Acc Crown SEA — đặc biệt có Glacier M416 (skin ultimate cấp 7). Cực hiếm ở tier Crown. KDR 2.8.',
      price: 8_500_000,
      image_url: IMG.pubg7,
      category_slug: 'acc-crown-diamond',
      colors: ['Glacier M416'],
      account_code: '#REPO1082',
      tier: 'Crown',
      steam_level: 35,
      pubg_level: 110,
      server: 'SEA',
      hours_played: 980,
      skin_count: 78,
      has_mythic: true,
      register_method: 'Steam Mail',
      gcoin_balance: 3240,
      kd_ratio: 2.84,
      win_rate: 7.2,
    },
    {
      slug: 'acc-diamond-as-balanced',
      name: 'Diamond AS — Inventory cân bằng 70 skin',
      description:
        'Acc Diamond server Asia. Inventory đa dạng 70+ skin súng & outfit. KDR 2.5, win 6.1%. Acc đẹp, có thể giữ lâu dài.',
      price: 3_400_000,
      image_url: IMG.pubg8,
      category_slug: 'acc-crown-diamond',
      colors: ['Diadem AKM', 'School Skirt'],
      account_code: '#REPO1095',
      tier: 'Diamond',
      steam_level: 26,
      pubg_level: 84,
      server: 'AS',
      hours_played: 540,
      skin_count: 71,
      register_method: 'Steam Mail',
      gcoin_balance: 1240,
      kd_ratio: 2.51,
      win_rate: 6.1,
    },
    {
      slug: 'acc-diamond-eu-cheap',
      name: 'Diamond EU — Acc giá rẻ entry-level',
      description:
        'Acc Diamond server Europe — giá entry-level cho người chơi muốn vào ranked Crown. Skin trung bình.',
      price: 1_900_000,
      sale_price: 1_650_000,
      sale_end_at: SALE_END(7),
      image_url: IMG.pubg9,
      category_slug: 'acc-crown-diamond',
      colors: ['Standard M416'],
      account_code: '#REPO1102',
      tier: 'Diamond',
      steam_level: 18,
      pubg_level: 62,
      server: 'EU',
      hours_played: 320,
      skin_count: 28,
      register_method: 'Steam Mail',
      gcoin_balance: 540,
      kd_ratio: 2.14,
      win_rate: 5.8,
    },

    // ============== FULL GLACIER ==============
    {
      slug: 'acc-full-glacier-trinity-collector',
      name: 'Full Glacier Trinity — Collector Edition',
      description:
        'Acc collector chỉ tập trung skin: M416 Glacier, AKM Glacier, AWM Glacier (đầy đủ bộ 3). Hệ rank không cao (Diamond) nhưng giá trị inventory tới 35tr.',
      price: 22_000_000,
      image_url: IMG.pubg4,
      category_slug: 'acc-full-glacier',
      colors: ['Glacier M416', 'Glacier AKM', 'Glacier AWM'],
      account_code: '#REPO1115',
      tier: 'Diamond',
      steam_level: 30,
      pubg_level: 95,
      server: 'AS',
      hours_played: 480,
      skin_count: 145,
      has_mythic: true,
      register_method: 'Steam Full',
      gcoin_balance: 4820,
      kd_ratio: 2.6,
      win_rate: 5.4,
    },
    {
      slug: 'acc-full-glacier-m416-akm-platinum',
      name: 'Glacier M416 + AKM — Tier Platinum',
      description:
        'Acc Platinum nhưng có 2 skin Glacier ultimate: M416 và AKM. Phù hợp player chơi casual nhưng yêu skin đẹp.',
      price: 14_500_000,
      sale_price: 12_900_000,
      sale_end_at: SALE_END(12),
      image_url: IMG.pubg1,
      category_slug: 'acc-full-glacier',
      colors: ['Glacier M416', 'Glacier AKM'],
      account_code: '#REPO1124',
      tier: 'Platinum',
      steam_level: 24,
      pubg_level: 78,
      server: 'SEA',
      hours_played: 360,
      skin_count: 92,
      has_mythic: true,
      register_method: 'Steam Mail',
      gcoin_balance: 2140,
      kd_ratio: 2.32,
      win_rate: 4.8,
    },
    {
      slug: 'acc-glacier-awm-only-rare',
      name: 'Glacier AWM Only — Acc sniper',
      description:
        'Acc dành riêng cho dân sniper — có Glacier AWM (skin cực hiếm) + bộ Kar98K Hong Kong. Ngân sách vừa.',
      price: 9_800_000,
      image_url: IMG.pubg2,
      category_slug: 'acc-full-glacier',
      colors: ['Glacier AWM', 'Hong Kong Kar98K'],
      account_code: '#REPO1138',
      tier: 'Crown',
      steam_level: 28,
      pubg_level: 84,
      server: 'AS',
      hours_played: 620,
      skin_count: 64,
      has_mythic: true,
      register_method: 'Steam Mail',
      gcoin_balance: 1820,
      kd_ratio: 3.12,
      win_rate: 6.4,
    },

    // ============== MYTHIC / LIMITED EDITION (PC) ==============
    {
      slug: 'acc-pgc-wanderer-full-mythic',
      name: 'PGC Crown + Wanderer Set + Full Mythic Outfit',
      description:
        'Acc collector PUBG PC: PGC 2023 Crown (esports skin chỉ có khi tham gia event PUBG Global Championship), Wanderer Set season 27 (mythic ultimate), Werewolf Halloween. Inventory hiếm có ở thị trường VN.',
      price: 38_000_000,
      image_url: IMG.pubg5,
      images: [IMG.pubg5, IMG.pubg9],
      category_slug: 'acc-mythic-limited',
      colors: ['PGC 2023 Crown', 'Wanderer Set', 'Werewolf Set', 'Conqueror Title'],
      account_code: '#REPO1145',
      tier: 'Crown',
      steam_level: 56,
      pubg_level: 184,
      server: 'AS',
      hours_played: 1640,
      skin_count: 198,
      has_mythic: true,
      register_method: 'Steam Full',
      gcoin_balance: 18420,
      kd_ratio: 3.24,
      win_rate: 7.8,
      featured_rank: 5,
    },
    {
      slug: 'acc-trench-coat-rare-set',
      name: 'Trench Coat — Set hiếm season 4 PC',
      description:
        'Acc có Trench Coat full set (skin season 4 PUBG PC hiếm — không có ở Mobile), kèm School Skirt + bộ skin gun trung bình. Diamond tier.',
      price: 4_800_000,
      image_url: IMG.pubg6,
      category_slug: 'acc-mythic-limited',
      colors: ['Trench Coat', 'School Skirt'],
      account_code: '#REPO1156',
      tier: 'Diamond',
      steam_level: 22,
      pubg_level: 72,
      server: 'SEA',
      hours_played: 420,
      skin_count: 58,
      has_mythic: true,
      register_method: 'Steam Mail',
      gcoin_balance: 980,
      kd_ratio: 2.42,
      win_rate: 5.6,
    },

    // ============== STARTER (giá rẻ) ==============
    {
      slug: 'acc-bronze-starter-sea-cheap',
      name: 'Acc Bronze Starter SEA — Giá tốt nhất',
      description:
        'Acc starter mới chiến PUBG. Bronze tier, level 18, vài skin cơ bản. Phù hợp người mới làm quen game.',
      price: 350_000,
      image_url: IMG.pubg6,
      category_slug: 'acc-starter-gia-re',
      colors: [],
      account_code: '#REPO1163',
      tier: 'Bronze',
      steam_level: 5,
      pubg_level: 18,
      server: 'SEA',
      hours_played: 28,
      skin_count: 4,
      register_method: 'Steam Mail',
      gcoin_balance: 120,
      kd_ratio: 0.84,
      win_rate: 2.1,
    },
    {
      slug: 'acc-silver-fresh-as',
      name: 'Acc Silver fresh AS — Mua chơi giải trí',
      description:
        'Acc Silver server Asia, profile sạch, vài bộ skin cơ bản. Giá tốt cho student / người mới.',
      price: 480_000,
      image_url: IMG.pubg10,
      category_slug: 'acc-starter-gia-re',
      colors: [],
      account_code: '#REPO1171',
      tier: 'Silver',
      steam_level: 8,
      pubg_level: 28,
      server: 'AS',
      hours_played: 64,
      skin_count: 8,
      register_method: 'Steam Mail',
      gcoin_balance: 240,
      kd_ratio: 1.18,
      win_rate: 3.2,
    },
    {
      slug: 'acc-gold-pubg-fresh-na',
      name: 'Acc Gold NA — Khởi đầu hành trình ranked',
      description:
        'Acc Gold server North America. Profile clean, 12 bộ skin cơ bản. Giá phù hợp với học sinh sinh viên.',
      price: 750_000,
      sale_price: 620_000,
      sale_end_at: SALE_END(7),
      image_url: IMG.pubg7,
      category_slug: 'acc-starter-gia-re',
      colors: [],
      account_code: '#REPO1182',
      tier: 'Gold',
      steam_level: 12,
      pubg_level: 38,
      server: 'NA',
      hours_played: 120,
      skin_count: 14,
      register_method: 'Steam Mail',
      gcoin_balance: 380,
      kd_ratio: 1.48,
      win_rate: 4.1,
    },
    {
      slug: 'acc-platinum-as-budget',
      name: 'Acc Platinum AS — Budget',
      description:
        'Acc Platinum server Asia, ngân sách thấp. Có 18 skin, KDR 1.8. Phù hợp player solo casual.',
      price: 1_200_000,
      image_url: IMG.pubg8,
      category_slug: 'acc-starter-gia-re',
      colors: [],
      account_code: '#REPO1191',
      tier: 'Platinum',
      steam_level: 16,
      pubg_level: 48,
      server: 'AS',
      hours_played: 180,
      skin_count: 18,
      register_method: 'Steam Mail',
      gcoin_balance: 480,
      kd_ratio: 1.82,
      win_rate: 4.6,
    },

    // ============== STEAM HIGH LEVEL ==============
    {
      slug: 'acc-steam-lv120-pubg-platinum',
      name: 'Steam Lv 120 — Inventory CS:GO + DOTA2 + PUBG',
      description:
        'Acc Steam level 120, có inventory CS:GO (skin AK Redline, Karambit Doppler), DOTA2 immortal items, PUBG Platinum tier. Tổng giá trị inventory > 50tr.',
      price: 18_500_000,
      image_url: IMG.pubg9,
      category_slug: 'acc-steam-level-cao',
      colors: ['CS:GO Redline AK', 'Karambit Doppler', 'DOTA2 Immortal'],
      account_code: '#REPO1204',
      tier: 'Platinum',
      steam_level: 120,
      pubg_level: 88,
      server: 'EU',
      hours_played: 5240,
      skin_count: 142,
      register_method: 'Steam Full',
      gcoin_balance: 2840,
      kd_ratio: 2.21,
      win_rate: 5.4,
    },
    {
      slug: 'acc-steam-lv65-pubg-diamond',
      name: 'Steam Lv 65 — Acc gaming general + PUBG Diamond',
      description:
        'Acc Steam level 65, sở hữu 80+ game (bao gồm Cyberpunk 2077, Elden Ring, GTA V). PUBG tier Diamond.',
      price: 7_400_000,
      image_url: IMG.pubg10,
      category_slug: 'acc-steam-level-cao',
      colors: ['80+ Steam games'],
      account_code: '#REPO1212',
      tier: 'Diamond',
      steam_level: 65,
      pubg_level: 72,
      server: 'AS',
      hours_played: 2840,
      skin_count: 64,
      register_method: 'Steam Mail',
      gcoin_balance: 1240,
      kd_ratio: 2.32,
      win_rate: 5.1,
    },

    // ============== SERVER RIÊNG ==============
    {
      slug: 'acc-kr-jp-server-conqueror',
      name: 'Acc KR/JP Server — Conqueror',
      description:
        'Acc đăng ký server Korea/Japan — server ít cheat nhất PUBG, ping ~30ms từ VN. Conqueror tier, full Glacier M416.',
      price: 24_000_000,
      image_url: IMG.pubg1,
      category_slug: 'acc-server-rieng',
      colors: ['Glacier M416', 'AWM Glacier'],
      account_code: '#REPO1224',
      tier: 'Conqueror',
      steam_level: 48,
      pubg_level: 168,
      server: 'KR/JP',
      hours_played: 1820,
      skin_count: 124,
      has_mythic: true,
      register_method: 'Steam Full',
      gcoin_balance: 6240,
      kd_ratio: 4.18,
      win_rate: 11.2,
      featured_rank: 6,
    },
    {
      slug: 'acc-eu-server-ace-fpp',
      name: 'Acc EU Server FPP — Ace Master',
      description:
        'Acc Ace Master server Europe FPP. Phù hợp player muốn chơi FPP competitive ở server EU (giải EMEA).',
      price: 11_500_000,
      image_url: IMG.pubg3,
      category_slug: 'acc-server-rieng',
      colors: ['Ice Fang M416', 'Goldfish Kar98K'],
      account_code: '#REPO1233',
      tier: 'Ace Master',
      steam_level: 38,
      pubg_level: 124,
      server: 'EU',
      hours_played: 1240,
      skin_count: 72,
      register_method: 'Steam Mail',
      gcoin_balance: 2840,
      kd_ratio: 3.62,
      win_rate: 8.4,
    },
    {
      slug: 'acc-na-server-crown-budget',
      name: 'Acc NA Server — Crown',
      description:
        'Acc Crown server North America, budget. Phù hợp player muốn chiến NA mà không tốn quá nhiều.',
      price: 3_200_000,
      image_url: IMG.pubg6,
      category_slug: 'acc-server-rieng',
      colors: ['Diadem AKM'],
      account_code: '#REPO1242',
      tier: 'Crown',
      steam_level: 18,
      pubg_level: 64,
      server: 'NA',
      hours_played: 380,
      skin_count: 32,
      register_method: 'Steam Mail',
      gcoin_balance: 720,
      kd_ratio: 2.42,
      win_rate: 5.8,
    },
    {
      slug: 'acc-sa-server-diamond-cheap',
      name: 'Acc SA Server — Diamond giá rẻ',
      description:
        'Acc Diamond server South America — server ít người chơi, dễ leo rank. Giá rẻ.',
      price: 1_800_000,
      sale_price: 1_500_000,
      sale_end_at: SALE_END(10),
      image_url: IMG.pubg10,
      category_slug: 'acc-server-rieng',
      colors: [],
      account_code: '#REPO1251',
      tier: 'Diamond',
      steam_level: 14,
      pubg_level: 52,
      server: 'SA',
      hours_played: 240,
      skin_count: 22,
      register_method: 'Steam Mail',
      gcoin_balance: 380,
      kd_ratio: 1.94,
      win_rate: 4.8,
    },
  ];

  for (const p of products) {
    const images = p.images && p.images.length > 0 ? p.images : [p.image_url];
    await sql`
      INSERT INTO products (
        category_id, name, slug, description, price, sale_price, sale_end_at,
        image_url, images, colors, is_active, is_hero, featured_rank,
        account_code, tier, steam_level, pubg_level, server,
        hours_played, skin_count, has_mythic, register_method,
        gcoin_balance, is_sold, kd_ratio, win_rate
      )
      SELECT c.id, ${p.name}, ${p.slug}, ${p.description}, ${p.price},
             ${p.sale_price ?? null}, ${p.sale_end_at ?? null},
             ${p.image_url}, ${images}::text[],
             ${p.colors}::text[], TRUE, ${p.is_hero ?? false}, ${p.featured_rank ?? null},
             ${p.account_code}, ${p.tier}, ${p.steam_level ?? null}, ${p.pubg_level ?? null}, ${p.server},
             ${p.hours_played ?? null}, ${p.skin_count ?? null}, ${p.has_mythic ?? false}, ${p.register_method},
             ${p.gcoin_balance ?? null}, FALSE, ${p.kd_ratio ?? null}, ${p.win_rate ?? null}
      FROM categories c
      WHERE c.slug = ${p.category_slug}
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        sale_price = EXCLUDED.sale_price,
        sale_end_at = EXCLUDED.sale_end_at,
        image_url = EXCLUDED.image_url,
        images = CASE
          WHEN cardinality(products.images) <= 1 THEN EXCLUDED.images
          ELSE products.images
        END,
        colors = EXCLUDED.colors,
        is_hero = EXCLUDED.is_hero,
        featured_rank = EXCLUDED.featured_rank,
        account_code = EXCLUDED.account_code,
        tier = EXCLUDED.tier,
        steam_level = EXCLUDED.steam_level,
        pubg_level = EXCLUDED.pubg_level,
        server = EXCLUDED.server,
        hours_played = EXCLUDED.hours_played,
        skin_count = EXCLUDED.skin_count,
        has_mythic = EXCLUDED.has_mythic,
        register_method = EXCLUDED.register_method,
        gcoin_balance = EXCLUDED.gcoin_balance,
        kd_ratio = EXCLUDED.kd_ratio,
        win_rate = EXCLUDED.win_rate,
        updated_at = NOW()
    `;
  }
  console.log(`[3/3] Đã tạo ${products.length} account PUBG.`);
  console.log('\n✓ Seed hoàn tất. Vào http://localhost:3000 để xem website.');
  console.log(`✓ Admin login: ${username} / ${password} → http://localhost:3000/admin/login`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
