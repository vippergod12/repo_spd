interface Props {
  imageUrl?: string;
}

export default function StorySection({ imageUrl }: Props) {
  const hasImage = Boolean(imageUrl && imageUrl.length > 0);

  return (
    <section className="section section-dark">
      <div className="container story-grid">
        <div
          className={`story-image ${hasImage ? '' : 'story-image-empty'}`}
          style={hasImage ? { backgroundImage: `url(${imageUrl})` } : undefined}
          aria-hidden
        />
        <div className="story-content">
          <span className="section-eyebrow">Câu chuyện R.E.P.O</span>
          <h2>Mỗi acc — một chặng đường battle royale</h2>
          <p>
            R.E.P.O bắt đầu từ năm 2021 — khi PUBG: BATTLEGROUNDS chuyển sang
            free-to-play và cộng đồng PC Việt Nam bùng nổ. Chúng tôi là nhóm
            game thủ PUBG chuyên nghiệp tự xây kho acc bằng cách <strong>tự cày
            rank</strong> & thu mua acc từ player cao thủ — rồi chuyển nhượng
            lại cho game thủ mới muốn sở hữu acc Conqueror, full Glacier
            mà không phải cày 6 tháng.
          </p>
          <ul className="story-list">
            <li>
              <strong>100% acc thật — verify in-game</strong>
              <span>Mọi acc đều có screenshot inventory, match history, tier mới nhất trước khi lên kệ.</span>
            </li>
            <li>
              <strong>Bảo hành trọn đời</strong>
              <span>Mất acc do shop = đền 100%. Hỗ trợ đổi mật khẩu, mail, hotmail bất cứ lúc nào.</span>
            </li>
            <li>
              <strong>Giao acc trong 5 phút</strong>
              <span>Sau khi thanh toán, info acc được gửi qua Telegram / Zalo private chat — không qua bên thứ ba.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
