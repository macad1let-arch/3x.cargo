"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import {
  Scale,
  Ruler,
  Truck,
  MessageCircle,
  Send,
  Package,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

export default function CalculatorPage() {
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width,  setWidth]  = useState("");
  const [height, setHeight] = useState("");

  const PRICE = 2.8;
  const pw = parseFloat(weight) || 0;
  const vw =
    parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(height) > 0
      ? (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 6000
      : 0;
  const cw    = Math.max(pw, vw);
  const price = pw > 0 ? (cw * PRICE).toFixed(2) : null;
  const isVol = vw > pw && pw > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geologica:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }

        :root {
          --blue:   #005eaa;
          --blue-d: #004a8a;
          --blue-l: #e8f2fb;
          --navy:   #0a1e3d;
          --white:  #ffffff;
          --bg:     #f5f7fa;
          --border: #dce4ef;
          --text:   #0d1a2e;
          --text2:  #3d5270;
          --text3:  #7a8fa8;
          --r:      12px;
          --r-lg:   18px;
          --r-xl:   24px;
        }

        .page {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Geologica', -apple-system, sans-serif;
          color: var(--text);
        }

        .hdr {
          background: var(--white);
          border-bottom: 1.5px solid var(--border);
          position: sticky; top: 0; z-index: 100;
        }
        .hdr-inner {
          max-width: 640px; margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          height: 66px;
        }
        .logo { text-decoration: none; font-size: 1.6rem; font-weight: 900; letter-spacing: -0.04em; line-height: 1; }
        .logo-b { color: var(--blue); }
        .logo-d { color: var(--text2); font-weight: 400; }
        .logo-c { color: var(--text); }
        .back {
          display: flex; align-items: center; gap: 5px;
          font-size: 13px; font-weight: 600; color: var(--text2);
          text-decoration: none; transition: color .15s;
        }
        .back:hover { color: var(--blue); }

        .main {
          max-width: 640px; margin: 0 auto;
          padding: 40px 24px 80px;
        }

        .eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--blue-l); color: var(--blue);
          font-size: 11px; font-weight: 700;
          padding: 5px 13px; border-radius: 999px;
          letter-spacing: .07em; text-transform: uppercase;
          margin-bottom: 14px;
        }
        h1 {
          font-size: clamp(1.9rem, 5vw, 2.6rem);
          font-weight: 900; letter-spacing: -0.04em;
          color: var(--text); line-height: 1.05; margin-bottom: 32px;
        }

        .card {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: var(--r-xl);
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 2px 16px rgba(0,94,170,.06);
        }

        .card-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }

        .field-lbl {
          font-size: 11px; font-weight: 700; color: var(--text3);
          text-transform: uppercase; letter-spacing: .07em;
          display: flex; align-items: center; gap: 5px;
          margin-bottom: 8px;
        }

        .inp-wrap { position: relative; }
        .inp-ico { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #b0bfcc; pointer-events: none; }
        .inp {
          width: 100%; height: 54px;
          padding: 0 48px 0 44px;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: var(--r);
          font-size: 16px; font-weight: 600; color: var(--text);
          font-family: inherit; outline: none;
          transition: border-color .15s, box-shadow .15s, background .15s;
          -moz-appearance: textfield;
        }
        .inp::-webkit-outer-spin-button, .inp::-webkit-inner-spin-button { -webkit-appearance: none; }
        .inp:focus { border-color: var(--blue); background: var(--white); box-shadow: 0 0 0 3px rgba(0,94,170,.1); }
        .inp::placeholder { color: #b8c5d0; font-weight: 400; }
        .inp-unit { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 800; color: #b0bfcc; pointer-events: none; }

        .sep { display: flex; align-items: center; gap: 10px; }
        .sep-line { flex: 1; height: 1px; background: var(--border); }
        .sep-lbl { font-size: 11px; font-weight: 700; color: #b8c5d0; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }

        .dims-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        @media (max-width: 440px) { .dims-grid { grid-template-columns: 1fr; gap: 8px; } }

        .rate-hdr {
          background: linear-gradient(108deg, #0a1e3d 0%, #003b73 100%);
          padding: 18px 28px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .rate-lbl  { font-size: 11px; color: rgba(255,255,255,.4); font-weight: 600; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 4px; }
        .rate-val  { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1; }
        .rate-val span { font-size: 14px; font-weight: 500; color: rgba(255,255,255,.45); margin-left: 5px; }
        .rate-right { text-align: right; }
        .rate-route { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.7); }
        .rate-days  { font-size: 12px; color: rgba(255,255,255,.35); margin-top: 3px; }

        .breakdown {
          padding: 0 28px 24px;
          display: flex; flex-direction: column; gap: 0;
        }
        .brow-wrap {
          background: var(--bg);
          border-radius: var(--r-lg);
          overflow: hidden;
          border: 1.5px solid var(--border);
          margin-bottom: 12px;
        }
        .brow {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }
        .brow:last-child { border-bottom: none; }
        .brow-lbl { color: var(--text2); }
        .brow-val { font-weight: 700; color: var(--text); }
        .brow-total { background: var(--blue-l); }
        .brow-total .brow-lbl { color: var(--text2); font-weight: 700; font-size: 14px; }
        .brow-total .brow-val { font-size: 24px; font-weight: 900; color: var(--blue); letter-spacing: -0.03em; }

        .empty-cost {
          display: flex; align-items: center; justify-content: center;
          padding: 20px; color: var(--text3); font-size: 14px; font-weight: 500;
          gap: 8px;
        }

        .cta-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; height: 56px;
          background: var(--blue); color: #fff;
          border: none; border-radius: var(--r-lg);
          font-size: 15px; font-weight: 800; font-family: inherit;
          letter-spacing: -0.01em; cursor: pointer; text-decoration: none;
          box-shadow: 0 4px 18px rgba(0,94,170,.3);
          transition: background .15s, transform .1s;
        }
        .cta-btn:hover { background: var(--blue-d); transform: translateY(-1px); }
        .cta-btn:active { transform: scale(.98); }

        @keyframes up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        .anim { animation: up .3s cubic-bezier(.22,1,.36,1) both; }

        .status-block {
          border-radius: var(--r-lg);
          padding: 15px 18px;
          display: flex; gap: 12px; align-items: flex-start;
          margin-bottom: 12px;
        }
        .sv { background: #fffbeb; border: 1.5px solid #fde68a; }
        .sp { background: #f0fdf4; border: 1.5px solid #86efac; }
        .s-icon { width: 34px; height: 34px; flex-shrink: 0; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
        .sv .s-icon { background: #fef3c7; }
        .sp .s-icon { background: #dcfce7; }
        .s-title { font-size: 14px; font-weight: 800; margin-bottom: 3px; letter-spacing: -0.02em; }
        .sv .s-title { color: #92400e; }
        .sp .s-title { color: #166534; }
        .s-desc { font-size: 13px; line-height: 1.6; }
        .sv .s-desc { color: #78350f; }
        .sp .s-desc { color: #15803d; }

        .info-card {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: var(--r-xl);
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 2px 16px rgba(0,94,170,.06);
        }
        .irow {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          font-size: 13px; color: var(--text2); line-height: 1.6;
        }
        .irow:last-child { border-bottom: none; }
        .irow-icon { width: 30px; height: 30px; flex-shrink: 0; border-radius: 8px; background: var(--blue-l); display: flex; align-items: center; justify-content: center; margin-top: 1px; }

        .note {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 13px 16px;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: var(--r-lg);
          font-size: 13px; color: var(--text2); line-height: 1.6;
          margin-bottom: 12px;
          box-shadow: 0 2px 16px rgba(0,94,170,.04);
        }
        .note-icon { width: 28px; height: 28px; flex-shrink: 0; border-radius: 7px; background: var(--blue-l); display: flex; align-items: center; justify-content: center; }

        .special {
          background: linear-gradient(108deg, #0a1e3d 0%, #003b73 100%);
          border-radius: var(--r-xl);
          padding: 24px 28px;
          margin-bottom: 12px;
        }
        .sp-title { font-size: 18px; font-weight: 900; color: #fff; letter-spacing: -0.03em; margin-bottom: 6px; }
        .sp-sub { font-size: 13px; color: rgba(255,255,255,.55); line-height: 1.65; margin-bottom: 16px; }
        .sp-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .sp-item { display: flex; gap: 10px; align-items: flex-start; }
        .sp-item-ico { width: 26px; height: 26px; flex-shrink: 0; border-radius: 7px; background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; margin-top: 1px; }
        .sp-item-txt { font-size: 13px; color: rgba(255,255,255,.6); line-height: 1.55; padding-top: 4px; }
        .sp-cta { font-size: 14px; color: rgba(255,255,255,.8); font-weight: 500; line-height: 1.65; margin-bottom: 16px; }
        .socials { display: flex; gap: 8px; }
        .soc {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 12px; border-radius: var(--r);
          font-size: 14px; font-weight: 700; text-decoration: none;
          transition: opacity .15s, transform .1s;
        }
        .soc:hover { opacity: .88; transform: translateY(-1px); }
        .soc-wa { background: #25d366; color: #fff; }
        .soc-tg { background: #2aabee; color: #fff; }

        .bcards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 380px) { .bcards { grid-template-columns: 1fr; } }
        .bc {
          background: var(--white); border: 1.5px solid var(--border);
          border-radius: var(--r-lg); padding: 14px 15px;
          display: flex; align-items: flex-start; gap: 11px;
          box-shadow: 0 2px 16px rgba(0,94,170,.04);
        }
        .bc-ico { width: 38px; height: 38px; flex-shrink: 0; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .bc-title { font-size: 13px; font-weight: 800; color: var(--text); margin-bottom: 2px; }
        .bc-desc  { font-size: 12px; color: var(--text3); line-height: 1.45; }
      `}</style>

      <div className="page">

        {/* HEADER */}
        <header className="hdr">
          <div className="hdr-inner">
            <a href="/" className="logo">
              <span className="logo-b">3x</span>
              <span className="logo-d">.</span>
              <span className="logo-c">cargo</span>
            </a>
            <a href="/" className="back">
              <ArrowLeft size={15} /> На главную
            </a>
          </div>
        </header>

        <main className="main">

          <div className="eyebrow"><Package size={10} /> Быстрый расчёт</div>
          <h1>Рассчитать стоимость</h1>

          {/* MAIN CARD */}
          <div className="card">

            <div className="rate-hdr">
              <div>
                <div className="rate-lbl">Стандартный тариф</div>
                <div className="rate-val">$2.8 <span>за кг</span></div>
              </div>
              <div className="rate-right">
                <div className="rate-route">Китай → Бишкек</div>
                <div className="rate-days">7–12 дней</div>
              </div>
            </div>

            <div className="card-body">

              {/* Weight */}
              <div>
                <div className="field-lbl"><Scale size={12} /> Фактический вес</div>
                <div className="inp-wrap">
                  <span className="inp-ico"><Scale size={16} /></span>
                  <input className="inp" type="number" placeholder="Например: 5.0" min="0" step="0.1"
                    value={weight} onChange={e => setWeight(e.target.value)}
                  />
                  <span className="inp-unit">кг</span>
                </div>
              </div>

              {/* Divider */}
              <div className="sep">
                <div className="sep-line" />
                <span className="sep-lbl">Размеры коробки</span>
                <div className="sep-line" />
              </div>

              {/* Dims */}
              <div className="dims-grid">
                {[
                  { ph: "Длина",  val: length, set: setLength },
                  { ph: "Ширина", val: width,  set: setWidth  },
                  { ph: "Высота", val: height, set: setHeight },
                ].map(({ ph, val, set }) => (
                  <div key={ph} className="inp-wrap">
                    <span className="inp-ico"><Ruler size={14} /></span>
                    <input className="inp" type="number" placeholder={ph} min="0" step="1"
                      value={val} onChange={e => set(e.target.value)}
                      style={{ paddingLeft: 38, fontSize: 14 }}
                    />
                    <span className="inp-unit">см</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Breakdown */}
            <div className="breakdown">
              <div className="brow-wrap">
                {pw > 0 ? (
                  <>
                    <div className="brow">
                      <span className="brow-lbl">Вес</span>
                      <span className="brow-val">{pw.toFixed(2)} кг</span>
                    </div>
                    {vw > 0 && (
                      <div className="brow">
                        <span className="brow-lbl">Объёмный вес (Д×Ш×В / 6000)</span>
                        <span className="brow-val">{vw.toFixed(2)} кг</span>
                      </div>
                    )}
                    <div className="brow">
                      <span className="brow-lbl">Тариф</span>
                      <span className="brow-val">$2.8 / кг</span>
                    </div>
                    <div className="brow brow-total">
                      <span className="brow-lbl">Итого</span>
                      <span className="brow-val">${price}</span>
                    </div>
                  </>
                ) : (
                  <div className="empty-cost">
                    <Scale size={16} />
                    Введите вес для расчёта
                  </div>
                )}
              </div>

              <a href="/register" className="cta-btn">
                Оформить доставку <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* STATUS — только при объёмном */}
          {isVol && (
            <div className="status-block anim sv">
              <div className="s-icon">
                <AlertTriangle size={17} color="#b45309" />
              </div>
              <div>
                <div className="s-title">Коробка занимает много места</div>
                <div className="s-desc">
                  Большая коробка занимает много места в фуре, даже если внутри лёгкие вещи. Поэтому стоимость рассчитывается по объёму.
                </div>
              </div>
            </div>
          )}

          {/* INFO ROWS — только при объёмном */}
          {isVol && (
            <div className="info-card anim">
              <div className="irow">
                <div className="irow-icon"><Package size={14} color="#005eaa" /></div>
                <div>
                  Если посылка лёгкая, но объёмная — стоимость рассчитывается по <strong style={{ color: "#0d1a2e" }}>объёмному весу</strong>.
                  Формула: Длина × Ширина × Высота / 6000
                </div>
              </div>
              <div className="irow">
                <div className="irow-icon"><Truck size={14} color="#005eaa" /></div>
                <div>
                  <strong style={{ color: "#0d1a2e" }}>Расчётный вес: {cw.toFixed(2)} кг</strong>
                  {" "}— к оплате по объёму
                </div>
              </div>
              <div className="irow">
                <div className="irow-icon"><DollarSign size={14} color="#005eaa" /></div>
                <div><strong style={{ color: "#0d1a2e" }}>Стоимость доставки: ${price}</strong></div>
              </div>
            </div>
          )}

          {/* NOTE */}
          <div className="note">
            <div className="note-icon"><Lightbulb size={14} color="#005eaa" /></div>
            <div>
              <strong style={{ color: "#0d1a2e" }}>Точная стоимость</strong> подтверждается после приёмки на складе в Китае.
              Финальная цена может незначительно отличаться после взвешивания.
            </div>
          </div>

          {/* SPECIAL */}
          <div className="special">
            <div className="sp-title">Специальные тарифы от $0.80 за кг</div>
            <div className="sp-sub">
              Если вы заказываете крупные партии товаров и тяжёлые грузы —
              мы можем предложить вам индивидуальные условия доставки.
            </div>
            <div className="sp-cta">
              Напишите нам — обсудим и предложим выгодные условия именно для вас
            </div>
            <div className="socials">
              <a href="https://wa.me/996220343053" target="_blank" rel="noreferrer" className="soc soc-wa">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href="https://t.me/Kin69der" target="_blank" rel="noreferrer" className="soc soc-tg">
                <Send size={16} /> Telegram
              </a>
            </div>
          </div>

          {/* BOTTOM CARDS */}
          <div className="bcards">
            <div className="bc">
              <div className="bc-ico" style={{ background: "#e8f2fb" }}>
                <Tag size={18} color="#005eaa" />
              </div>
              <div>
                <div className="bc-title">Выгодные тарифы</div>
                <div className="bc-desc">Работаем напрямую с перевозчиками</div>
              </div>
            </div>
            <div className="bc">
              <div className="bc-ico" style={{ background: "#e8f9f2" }}>
                <ShieldCheck size={18} color="#00a86b" />
              </div>
              <div>
                <div className="bc-title">Без скрытых платежей</div>
                <div className="bc-desc">Цена фиксируется и не меняется</div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}