"use client";

import { useEffect, useState } from "react";
import { Gift, GraduationCap, Package } from "lucide-react";

const SLIDE_INTERVAL = 8000;

const DELIVERIES = "500 000+";
const STUDENTS = "3 000+";

export default function TopBanner() {
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current === 0 ? 1 : 0));
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="topBanner" aria-label="Информация Alakel">
      <div className="topBannerInner">
        {/* Статистика */}
        <div
          className={`slide statsSlide ${
            activeSlide === 0 ? "active" : ""
          }`}
          aria-hidden={activeSlide !== 0}
        >
          <div className="statItem">
            <div className="iconBox iconAccent" aria-hidden="true">
              <Package size={20} strokeWidth={2} />
            </div>

            <div className="statText">
              <strong>{DELIVERIES}</strong>
              <span>доставленных грузов</span>
            </div>
          </div>

          <div className="divider" aria-hidden="true" />

          <div className="statItem">
            <div className="iconBox" aria-hidden="true">
              <GraduationCap size={20} strokeWidth={2} />
            </div>

            <div className="statText">
              <strong>{STUDENTS}</strong>
              <span>обученных клиентов</span>
            </div>
          </div>
        </div>

        {/* Бонус */}
        <div
          className={`slide bonusSlide ${
            activeSlide === 1 ? "active" : ""
          }`}
          aria-hidden={activeSlide !== 1}
        >
          <div className="bonusContent">
            <div className="iconBox iconAccent bonusIcon" aria-hidden="true">
              <Gift size={20} strokeWidth={2} />
            </div>

            <div className="bonusText">
              <strong>Получайте бонусы с каждого заказа</strong>
              <span>+100 сом за приглашённого друга</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .topBanner {
          --navy: #07337f;
          --accent: #f4b51f;

          width: 100%;
          height: 64px;

          position: relative;
          overflow: hidden;

          background: var(--navy);
          color: #ffffff;

          border-bottom: 1px solid rgba(255, 255, 255, 0.08);

          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .topBannerInner {
          width: 100%;
          max-width: 720px;
          height: 100%;

          position: relative;

          margin: 0 auto;
        }

        /* ===== SLIDES ===== */

        .slide {
          position: absolute;
          inset: 0;

          opacity: 0;
          visibility: hidden;
          pointer-events: none;

          transform: translate3d(0, 5px, 0);

          transition:
            opacity 240ms ease,
            transform 240ms ease;
        }

        .slide.active {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;

          transform: translate3d(0, 0, 0);
        }

        /* ===== ICON ===== */

        .iconBox {
          width: 38px;
          height: 38px;

          flex: 0 0 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: rgba(255, 255, 255, 0.09);
          color: rgba(255, 255, 255, 0.95);
        }

        .iconAccent {
          color: var(--accent);
        }

        /* ===== STATS ===== */

        .statsSlide {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            1px
            minmax(0, 1fr);

          align-items: center;

          padding: 0 18px;
        }

        .statItem {
          min-width: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 11px;
        }

        .statText {
          min-width: 0;

          display: flex;
          flex-direction: column;

          text-align: left;
        }

        .statText strong {
          color: #ffffff;

          font-size: 15px;
          line-height: 1.05;
          font-weight: 800;

          letter-spacing: -0.02em;

          white-space: nowrap;
        }

        .statText span {
          margin-top: 4px;

          color: rgba(255, 255, 255, 0.66);

          font-size: 11px;
          line-height: 1.1;
          font-weight: 500;

          white-space: nowrap;
        }

        .divider {
          width: 1px;
          height: 30px;

          background: rgba(255, 255, 255, 0.13);
        }

        /* ===== BONUS ===== */

        .bonusSlide {
          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0 16px;
        }

        .bonusContent {
          max-width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 11px;
        }

        .bonusText {
          min-width: 0;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .bonusText strong {
          color: #ffffff;

          font-size: 15px;
          line-height: 1.08;
          font-weight: 800;

          letter-spacing: -0.02em;

          white-space: nowrap;
        }

        .bonusText span {
          margin-top: 4px;

          color: var(--accent);

          font-size: 11.5px;
          line-height: 1.1;
          font-weight: 700;

          white-space: nowrap;
        }

        /* ===== DESKTOP ===== */

        @media (min-width: 769px) {
          .topBannerInner {
            max-width: 680px;
          }

          .statsSlide {
            padding: 0 22px;
          }

          .statText strong,
          .bonusText strong {
            font-size: 15.5px;
          }

          .statText span,
          .bonusText span {
            font-size: 11.5px;
          }
        }

        /* ===== MOBILE ===== */

        @media (max-width: 430px) {
          .topBanner {
            height: 62px;
          }

          .statsSlide {
            padding: 0 10px;
          }

          .statItem {
            gap: 7px;
          }

          .iconBox {
            width: 32px;
            height: 32px;

            flex-basis: 32px;

            border-radius: 9px;
          }

          .statText strong {
            font-size: 13px;
          }

          .statText span {
            margin-top: 3px;

            font-size: 9.8px;
          }

          .divider {
            height: 27px;
          }

          .bonusContent {
            gap: 8px;
          }

          .bonusText strong {
            font-size: 13px;
          }

          .bonusText span {
            font-size: 10.5px;
          }
        }

        /* ===== SMALL MOBILE ===== */

        @media (max-width: 360px) {
          .topBanner {
            height: 62px;
          }

          .statsSlide {
            padding: 0 7px;
          }

          .statItem {
            gap: 5px;
          }

          .iconBox {
            width: 28px;
            height: 28px;

            flex-basis: 28px;

            border-radius: 8px;
          }

          .statText strong {
            font-size: 11.5px;
          }

          .statText span {
            font-size: 8.5px;
          }

          .divider {
            height: 24px;
          }

          .bonusSlide {
            padding: 0 8px;
          }

          .bonusContent {
            gap: 7px;
          }

          .bonusText strong {
            font-size: 11.5px;
            white-space: normal;
          }

          .bonusText span {
            font-size: 9.5px;
            white-space: normal;
          }
        }

        /* ===== VERY SMALL ===== */

        @media (max-width: 320px) {
          .statsSlide {
            padding: 0 5px;
          }

          .statItem {
            gap: 4px;
          }

          .iconBox {
            width: 26px;
            height: 26px;

            flex-basis: 26px;
          }

          .statText strong {
            font-size: 10.8px;
          }

          .statText span {
            font-size: 8px;
          }

          .bonusText strong {
            font-size: 10.8px;
          }

          .bonusText span {
            font-size: 9px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .slide {
            transition: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}