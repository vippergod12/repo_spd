'use client';

import Reveal from '../Reveal';

export default function BigCTA() {
  return (
    <section className="section section-cta">
      <Reveal variant="fade-up">
        <div className="container cta-grid">
          <h2>
            <span>Một acc PUBG</span>
            <span className="cta-italic">cho chiến binh</span>
            <span>battlegrounds.</span>
          </h2>
          <a
            href="/tu-van"
            className="cta-link"
          >
            Tìm acc theo yêu cầu ↗
          </a>
        </div>
      </Reveal>
    </section>
  );
}
