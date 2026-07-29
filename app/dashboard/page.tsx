"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { FaPhone, FaTelegram, FaWhatsapp } from "react-icons/fa6";
import {
  Client,
  getClient,
  getShipmentCounts,
  getUnreadCount,
} from "@/lib/supabase-dashboard";

// Р•РґРёРЅР°СЏ РїР°Р»РёС‚СЂР°: РѕРґРёРЅ Р°РєС†РµРЅС‚ (NAVY), GREEN вЂ” С‚РѕР»СЊРєРѕ РєР°Рє СЃРµРјР°РЅС‚РёС‡РµСЃРєРёР№ СЃРёРіРЅР°Р»
// "РЅСѓР¶РЅРѕ РґРµР№СЃС‚РІРёРµ" (РіРѕС‚РѕРІРѕ Рє РІС‹РґР°С‡Рµ). РќРёРєР°РєРѕРіРѕ СЃС‚Р°С‚СѓСЃ-СЂР°РґСѓР¶РЅРѕРіРѕ РєРѕРґРёСЂРѕРІР°РЅРёСЏ,
// РЅРёРєР°РєРёС… РіСЂР°РґРёРµРЅС‚РѕРІ вЂ” РїР»РѕСЃРєРёРµ РїРѕРІРµСЂС…РЅРѕСЃС‚Рё, СЂР°Р·РЅРёС†Р° С‚РѕР»СЊРєРѕ РІ РЅР°СЃС‹С‰РµРЅРЅРѕСЃС‚Рё С„РѕРЅР°.
const NAVY = "#123B9F";
const TEXT = "#0A1E3D";
const MUTED = "#64748B";
const RED = "#F2384A";
const BLUE = "#1769E8";
const GREEN = "#08A66A";
const VIOLET = "#7047EB";
const BORDER = "#E5EAF2";
const TINT = "#EEF3FF"; // СЃРІРµС‚Р»Р°СЏ Р·Р°Р»РёРІРєР° РїРѕРґ Р°РєС†РµРЅС‚РЅС‹Рµ Р±Р»РѕРєРё
const WAREHOUSE_PHONE = "18745081507";
const WAREHOUSE_REGION = "е№їдёњзњЃ е№їе·ћеё‚ иЌ”ж№ѕеЊє";
const WAREHOUSE_LOCATION = "з«™е‰Ќи·Їе®‡е®™йћ‹еџЋDеЊє512-жЎЈеЏЈ";

type ClientWithAmount = Client & { amount_due?: number };

function CopyIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function Chevron({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ReadyIcon({ size = 46 }: { size?: number }) {
  return (
    <img
      src="/icons/dashboard/ready.svg"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
    />
  );
}

function ChinaIcon() {
  return <img src="/icons/dashboard/china.svg" alt="" aria-hidden="true" />;
}

function TruckIcon() {
  return <img src="/icons/dashboard/truck.svg" alt="" aria-hidden="true" />;
}

function IssuedIcon() {
  return <img src="/icons/dashboard/issued.svg" alt="" aria-hidden="true" />;
}

function readyText(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${count} РїРѕСЃС‹Р»РѕРє РіРѕС‚РѕРІС‹ Рє РІС‹РґР°С‡Рµ`;
  }

  if (last === 1) {
    return `${count} РїРѕСЃС‹Р»РєР° РіРѕС‚РѕРІР° Рє РІС‹РґР°С‡Рµ`;
  }

  if (last >= 2 && last <= 4) {
    return `${count} РїРѕСЃС‹Р»РєРё РіРѕС‚РѕРІС‹ Рє РІС‹РґР°С‡Рµ`;
  }

  return `${count} РїРѕСЃС‹Р»РѕРє РіРѕС‚РѕРІС‹ Рє РІС‹РґР°С‡Рµ`;
}

export default function DashboardHome() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [client, setClient] = useState<ClientWithAmount | null>(null);
  const [counts, setCounts] = useState({
    china: 0,
    transit: 0,
    sorting: 0,
    ready: 0,
  });
  const [unread, setUnread] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"code" | "address" | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;
      if (!user) {
        setLoading(false);
        return;
      }

      const clientData = (await getClient(user.id)) as ClientWithAmount | null;
      if (!active) return;
      if (!clientData) {
        setLoading(false);
        return;
      }

      setClient(clientData);

      const [shipmentCounts, unreadCount] = await Promise.all([
        getShipmentCounts(clientData.client_code),
        getUnreadCount(clientData.client_code),
      ]);

      if (!active) return;
      setCounts(shipmentCounts);
      setUnread(unreadCount);
      setTotalOrders(clientData.total_orders ?? 0);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [supabase]);

  const firstName =
    client?.first_name || client?.full_name?.split(" ")[0] || "РљР»РёРµРЅС‚";

  const issuedCount = Math.max(
    totalOrders -
      (counts.china + counts.transit + counts.sorting + counts.ready),
    0
  );

  const amountDue = client?.amount_due ?? 0;
  const clientCode = client?.client_code || "вЂ”";
  const warehouseRecipient = `йѕ™з”џ ${clientCode}`;
  const warehouseAddress = `${warehouseRecipient}\n${WAREHOUSE_PHONE}\n${WAREHOUSE_REGION}\n${WAREHOUSE_LOCATION} ${clientCode}`;

  async function copyText(value: string, type: "code" | "address") {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1500);
  }

  if (loading) {
    return (
      <main className="loading">
        <div />
        <style jsx>{`
          .loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #fff;
          }
          .loading div {
            width: 32px;
            height: 32px;
            border: 3px solid #e8edf2;
            border-top-color: ${NAVY};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="screen">
        {/* РҐРµРґРµСЂ вЂ” РѕС‚РґРµР»СЊРЅРѕ СЃРІРµСЂС…Сѓ, Р±РµР· РєР°СЂС‚РѕС‡РєРё Рё Р±РµР· РіСЂР°РґРёРµРЅС‚Р° */}
        <header className="header">
          <div className="user">
            <div className="avatar">{(firstName[0] || "A").toUpperCase()}</div>
            <div>
              <p>Р—РґСЂР°РІСЃС‚РІСѓР№С‚Рµ</p>
              <h1>{firstName}</h1>
            </div>
          </div>

          <Link href="/dashboard/notifications" className="bell" aria-label="РЈРІРµРґРѕРјР»РµРЅРёСЏ">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M24 13a8 8 0 0 0-16 0c0 9-4 11-4 11h24s-4-2-4-11Z" />
              <path d="M19 28a3.5 3.5 0 0 1-6 0M16 5V3" />
            </svg>
            {unread > 0 && <i />}
          </Link>
        </header>

        <section className="clientCode">
          <span>Р’Р°С€ РєР»РёРµРЅС‚СЃРєРёР№ РєРѕРґ</span>
          <div>
            <strong>{clientCode}</strong>
            <button
              type="button"
              onClick={() => copyText(client?.client_code || "", "code")}
              aria-label="РЎРєРѕРїРёСЂРѕРІР°С‚СЊ РєР»РёРµРЅС‚СЃРєРёР№ РєРѕРґ"
            >
              <CopyIcon size={22} />
            </button>
          </div>
        </section>

        {counts.ready > 0 && (
          <Link href="/dashboard/orders?status=ready" className="ready">
            <div className="readyIcon">
              <ReadyIcon />
            </div>
            <div>
              <strong>{readyText(counts.ready)}</strong>
              <p>
                Рљ РѕРїР»Р°С‚Рµ
                <b>{amountDue.toLocaleString("ru-RU")} СЃРѕРј</b>
              </p>
            </div>
            <Chevron size={18} />
          </Link>
        )}

        <div className="search">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="14" cy="14" r="10" />
            <path d="m22 22 7 7" />
          </svg>
          <input
            type="text"
            placeholder="Р’РІРµРґРёС‚Рµ С‚СЂРµРє-РєРѕРґ"
            aria-label="Р’РІРµРґРёС‚Рµ С‚СЂРµРє-РєРѕРґ"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                window.location.href = "/dashboard/orders";
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              window.location.href = "/dashboard/orders";
            }}
          >
            РќР°Р№С‚Рё
          </button>
        </div>

        <section className="orders">
          <div className="sectionTitle">
            <h2>Р’Р°С€Рё Р·Р°РєР°Р·С‹</h2>
            <Link href="/dashboard/orders">
              Р’СЃРµ Р·Р°РєР°Р·С‹ <Chevron size={18} />
            </Link>
          </div>

          <div className="orderGrid">
            <Link href="/dashboard/orders?status=china" className="orderCard china">
              <div>
                <strong>{counts.china}</strong>
                <span>Р’ РљРёС‚Р°Рµ</span>
              </div>
              <div className="orderIcon">
                <ChinaIcon />
              </div>
            </Link>

            <Link href="/dashboard/orders?status=transit" className="orderCard transit">
              <div>
                <strong>{counts.transit}</strong>
                <span>Р’ РїСѓС‚Рё</span>
              </div>
              <div className="orderIcon">
                <TruckIcon />
              </div>
            </Link>

            <Link href="/dashboard/orders?status=ready" className="orderCard readyOrder">
              <div>
                <strong>{counts.ready}</strong>
                <span>Р“РѕС‚РѕРІРѕ Рє РІС‹РґР°С‡Рµ</span>
              </div>
              <div className="orderIcon">
                <ReadyIcon size={30} />
              </div>
            </Link>

            <Link href="/dashboard/orders?status=issued" className="orderCard issued">
              <div>
                <strong>{issuedCount}</strong>
                <span>Р’С‹РґР°РЅРѕ</span>
              </div>
              <div className="orderIcon">
                <IssuedIcon />
              </div>
            </Link>
          </div>

          <div className="storage">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v6M12 7h.01" />
            </svg>
            <span>Р‘РµСЃРїР»Р°С‚РЅРѕРµ С…СЂР°РЅРµРЅРёРµ вЂ” 7 РґРЅРµР№</span>
          </div>
        </section>

        <section className="warehouse">
          <div className="warehouseHead">
            <div className="warehouseTitle">
              <div className="pin">
                <svg viewBox="0 0 32 38" aria-hidden="true">
                  <path d="M29 15c0 9-13 20-13 20S3 24 3 15a13 13 0 1 1 26 0Z" />
                  <circle cx="16" cy="15" r="4" />
                </svg>
              </div>
              <h2>РђРґСЂРµСЃ СЃРєР»Р°РґР°</h2>
            </div>
            <button
              type="button"
              className="copyAddressIcon"
              onClick={() => copyText(warehouseAddress, "address")}
              aria-label={
                copied === "address" ? "РђРґСЂРµСЃ СЃРєРѕРїРёСЂРѕРІР°РЅ" : "РЎРєРѕРїРёСЂРѕРІР°С‚СЊ Р°РґСЂРµСЃ СЃРєР»Р°РґР°"
              }
              title={copied === "address" ? "РђРґСЂРµСЃ СЃРєРѕРїРёСЂРѕРІР°РЅ" : "РЎРєРѕРїРёСЂРѕРІР°С‚СЊ Р°РґСЂРµСЃ"}
            >
              <CopyIcon size={18} />
            </button>
          </div>

          <div className="warehouseBody">
            <div className="addrRow">
              <span className="addrLabel">РџРѕР»СѓС‡Р°С‚РµР»СЊ</span>
              <span className="addrValue">{warehouseRecipient}</span>
            </div>
            <div className="addrRow">
              <span className="addrLabel">РўРµР»РµС„РѕРЅ</span>
              <span className="addrValue">{WAREHOUSE_PHONE}</span>
            </div>
            <div className="addrRow">
              <span className="addrLabel">РђРґСЂРµСЃ</span>
              <span className="addrValue">
                {WAREHOUSE_REGION}
                <br />
                {WAREHOUSE_LOCATION} <b>{clientCode}</b>
              </span>
            </div>
          </div>

          <Link href="/dashboard/instructions#warehouse-address" className="addressGuide">
            РљР°Рє Р·Р°РїРѕР»РЅРёС‚СЊ Р°РґСЂРµСЃ
            <Chevron size={15} />
          </Link>
        </section>

        <section className="contactSection" aria-label="РљРѕРЅС‚Р°РєС‚С‹">
          <div className="contacts">
            <a href={process.env.NEXT_PUBLIC_WHATSAPP_URL || "/dashboard/support"}>
              <FaWhatsapp className="whatsapp" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
            <a href={process.env.NEXT_PUBLIC_TELEGRAM_URL || "/dashboard/support"}>
              <FaTelegram className="telegram" aria-hidden="true" />
              <span>Telegram</span>
            </a>
            <a href={process.env.NEXT_PUBLIC_PHONE_URL || "/dashboard/support"}>
              <FaPhone className="phone" aria-hidden="true" />
              <span>РџРѕР·РІРѕРЅРёС‚СЊ</span>
            </a>
          </div>
        </section>
      </div>

      {copied && (
        <div className="toast" role="status">
          {copied === "code" ? "РљРѕРґ СЃРєРѕРїРёСЂРѕРІР°РЅ" : "РђРґСЂРµСЃ СЃРєРѕРїРёСЂРѕРІР°РЅ"}
        </div>
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          min-height: 100%;
          overflow-x: clip;
          background: #f6f8fb;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        button,
        input,
        a {
          font: inherit;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        button:focus-visible,
        a:focus-visible,
        input:focus-visible {
          outline: 3px solid rgba(11, 49, 140, 0.2);
          outline-offset: 2px;
        }

        .page {
          min-height: 100%;
          display: flex;
          justify-content: center;
          background: #f6f8fb;
          color: ${TEXT};
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .screen {
          width: 100%;
          max-width: 430px;
          padding: max(14px, env(safe-area-inset-top)) 16px 18px;
          background: #fff;
        }

        /* ===== Header ===== */

        .header {
          min-height: 46px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 44px;
          height: 44px;
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 50%;
          background: ${TINT};
          color: ${NAVY};
          font-size: 21px;
          font-weight: 600;
        }

        .user p,
        .user h1 {
          margin: 0;
        }

        .user p {
          color: ${MUTED};
          font-size: 13px;
          line-height: 18px;
        }

        .user h1 {
          margin-top: 1px;
          color: ${TEXT};
          font-size: 20px;
          line-height: 24px;
          font-weight: 700;
        }

        .bell {
          width: 44px;
          height: 44px;
          position: relative;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f3f4f7;
          color: ${MUTED};
        }

        .bell svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .bell i {
          width: 7px;
          height: 7px;
          position: absolute;
          top: 6px;
          right: 7px;
          border-radius: 50%;
          background: ${NAVY};
        }

        /* ===== Client code вЂ” РµРґРёРЅСЃС‚РІРµРЅРЅС‹Р№ "hero" Р°РєС†РµРЅС‚РЅС‹Р№ Р±Р»РѕРє, РїР»РѕСЃРєР°СЏ Р·Р°Р»РёРІРєР° ===== */

        .clientCode {
          margin-top: 14px;
          padding: 16px;
          border-radius: 16px;
          background: ${TINT};
          text-align: center;
        }

        .clientCode > span {
          display: block;
          color: ${NAVY};
          opacity: 0.75;
          font-size: 13px;
          line-height: 18px;
        }

        .clientCode > div {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
        }

        .clientCode strong {
          overflow: hidden;
          color: ${NAVY};
          font-size: clamp(32px, 9vw, 36px);
          line-height: 40px;
          font-weight: 700;
          letter-spacing: 0.2px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .clientCode button {
          width: 38px;
          height: 38px;
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: ${NAVY};
          cursor: pointer;
        }

        /* ===== Ready-to-collect banner вЂ” РµРґРёРЅСЃС‚РІРµРЅРЅС‹Р№ СЃРµРјР°РЅС‚РёС‡РµСЃРєРёР№ (РЅРµ-Р°РєС†РµРЅС‚РЅС‹Р№) С†РІРµС‚ ===== */

        .ready {
          min-height: 66px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #f2faf5;
          color: ${TEXT};
          text-decoration: none;
        }

        .readyIcon {
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          color: ${GREEN};
        }

        .readyIcon img {
          width: 40px;
          height: 40px;
          display: block;
        }

        .ready strong {
          display: block;
          color: ${TEXT};
          font-size: 14px;
          line-height: 19px;
          font-weight: 600;
        }

        .ready p {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 3px 0 0;
          color: ${MUTED};
          font-size: 13px;
        }

        .ready b {
          color: ${GREEN};
          font-size: 14px;
          font-weight: 700;
        }

        .ready > svg {
          width: 16px;
          height: 16px;
          flex: 0 0 auto;
          margin-left: auto;
          fill: none;
          stroke: ${MUTED};
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ===== Search ===== */

        .search {
          height: 54px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          padding: 0 6px 0 14px;
          border: 0.5px solid ${BORDER};
          border-radius: 14px;
          background: #fff;
        }

        .search > svg {
          width: 20px;
          height: 20px;
          flex: 0 0 auto;
          fill: none;
          stroke: ${MUTED};
          stroke-width: 1.8;
          stroke-linecap: round;
        }

        .search input {
          min-width: 0;
          height: 100%;
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          color: ${TEXT};
          font-size: 14px;
        }

        .search input::placeholder {
          color: ${MUTED};
          opacity: 1;
        }

        .search button {
          height: 42px;
          min-width: 82px;
          padding: 0 15px;
          border: 0;
          border-radius: 10px;
          background: ${NAVY};
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        /* ===== Orders ===== */

        .orders {
          margin-top: 18px;
        }

        .sectionTitle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .sectionTitle h2 {
          margin: 0;
          color: ${TEXT};
          font-size: 18px;
          line-height: 24px;
          font-weight: 700;
        }

        .sectionTitle a {
          display: flex;
          align-items: center;
          gap: 2px;
          color: ${NAVY};
          min-height: 40px;
          margin: -8px -4px -8px 0;
          padding: 0 4px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }

        .orderGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .orderCard {
          min-height: 84px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid transparent;
          text-decoration: none;
        }

        .orderCard > div:first-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .orderCard strong {
          font-size: 26px;
          line-height: 1;
          font-weight: 700;
        }

        .orderCard span {
          color: ${MUTED};
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }

        .orderIcon {
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 10px;
        }

        .orderIcon img {
          width: 28px;
          height: 28px;
          display: block;
        }

        .china {
          border-color: #f9e4e6;
          background: #fff8f8;
        }

        .china strong {
          color: ${RED};
        }

        .china .orderIcon {
          background: #fff0f1;
        }

        .transit {
          border-color: #e2eaf8;
          background: #f7f9ff;
        }

        .transit strong {
          color: ${BLUE};
        }

        .transit .orderIcon {
          background: #edf3ff;
        }

        .readyOrder {
          border-color: #dfeee6;
          background: #f5fbf8;
        }

        .readyOrder strong {
          color: ${GREEN};
        }

        .readyOrder .orderIcon {
          background: #eaf7f0;
        }

        .issued {
          border-color: #ece7fa;
          background: #faf8ff;
        }

        .issued strong {
          color: ${VIOLET};
        }

        .issued .orderIcon {
          background: #f2eeff;
        }

        .storage {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
          color: ${MUTED};
        }

        .storage svg {
          width: 16px;
          height: 16px;
          flex: 0 0 auto;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
        }

        .storage span {
          color: ${MUTED};
          font-size: 12.5px;
        }

        /* ===== Warehouse address ===== */

        .warehouse {
          margin-top: 16px;
          padding: 14px;
          border: 0.5px solid ${BORDER};
          border-radius: 14px;
          background: #fff;
        }

        .warehouseHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 34px;
        }

        .warehouseTitle {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pin {
          width: 18px;
          height: 20px;
          display: grid;
          place-items: center;
          color: ${NAVY};
        }

        .pin svg {
          width: 16px;
          height: 19px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .warehouse h2 {
          margin: 0;
          color: ${TEXT};
          font-size: 15px;
          line-height: 20px;
          font-weight: 600;
        }

        .copyAddressIcon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 9px;
          background: ${TINT};
          color: ${NAVY};
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
        }

        .copyAddressIcon:hover {
          background: #e2eaff;
        }

        .copyAddressIcon:active {
          transform: scale(0.96);
        }

        .warehouseBody {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 0.5px solid ${BORDER};
        }

        .addrRow {
          display: grid;
          grid-template-columns: 84px minmax(0, 1fr);
          gap: 8px;
          padding: 5px 0;
          font-size: 13.5px;
          line-height: 1.6;
        }

        .addrRow + .addrRow {
          border-top: 0.5px solid #f0f1f4;
        }

        .addrLabel {
          color: ${MUTED};
        }

        .addrValue {
          color: ${TEXT};
          overflow-wrap: anywhere;
        }

        .addrValue b {
          font-weight: 700;
        }

        /* РљРЅРѕРїРєР°-РїРѕРґСЃРєР°Р·РєР° РѕСЃС‚Р°С‘С‚СЃСЏ Р’РќРЈРўР Р РєР°СЂС‚РѕС‡РєРё Р°РґСЂРµСЃР° вЂ” С‚Р°Рє РѕРЅР° РіР°СЂР°РЅС‚РёСЂРѕРІР°РЅРЅРѕ
           РїРѕРїР°РґР°РµС‚ РІ РїРµСЂРІС‹Р№ СЌРєСЂР°РЅ РІРјРµСЃС‚Рµ СЃ Р°РґСЂРµСЃРѕРј, Р° РЅРµ С‚РµСЂСЏРµС‚СЃСЏ РіРґРµ-С‚Рѕ РЅРёР¶Рµ */
        .addressGuide {
          width: 100%;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 10px;
          padding: 9px 12px;
          border: 0;
          border-radius: 10px;
          background: ${TINT};
          color: ${NAVY};
          font-size: 13px;
          line-height: 18px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s ease;
        }

        .addressGuide:hover {
          background: #e2eaff;
          text-decoration: none;
        }

        /* ===== Contacts ===== */

        .contactSection {
          margin-top: 10px;
          margin-bottom: 0;
        }

        .contacts {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .contacts a {
          height: 50px;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 0.5px solid ${BORDER};
          border-radius: 12px;
          background: #fff;
          color: ${TEXT};
          text-decoration: none;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .contacts a:hover {
          border-color: #c3cddc;
          background: #fbfcff;
        }

        .contacts svg {
          width: 20px;
          height: 20px;
          flex: 0 0 auto;
          display: block;
        }

        /* Р‘СЂРµРЅРґРѕРІС‹Рµ С†РІРµС‚Р° РјРµСЃСЃРµРЅРґР¶РµСЂРѕРІ вЂ” РµРґРёРЅСЃС‚РІРµРЅРЅРѕРµ РѕСЃРѕР·РЅР°РЅРЅРѕРµ РёСЃРєР»СЋС‡РµРЅРёРµ РёР·
           РµРґРёРЅРѕРіРѕ Р°РєС†РµРЅС‚Р°: СЌС‚Рѕ СѓР·РЅР°РІР°РµРјС‹Рµ Р»РѕРіРѕС‚РёРїС‹, Р° РЅРµ СЃС‚Р°С‚СѓСЃ-РёРЅРґРёРєР°С†РёСЏ */
        .contacts .whatsapp {
          color: #25d366;
        }

        .contacts .telegram {
          color: #229ed9;
        }

        .contacts .phone {
          color: ${NAVY};
        }

        .contacts span {
          overflow: hidden;
          font-size: 13px;
          font-weight: 500;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .chat-widget,
        .chatWidget,
        #chat-widget,
        [data-chat-widget],
        [data-support-widget],
        .chat-widget-button,
        .support-chat-button,
        .floating-chat-button,
        .chat-toggle,
        button[aria-label*="С‡Р°С‚" i],
        button[title*="С‡Р°С‚" i],
        button[aria-label*="СЃРѕРѕР±С‰" i],
        button[title*="СЃРѕРѕР±С‰" i],
        button[aria-label*="support" i] {
          display: none !important;
        }

        /* ===== Р¤РёРЅР°Р»СЊРЅР°СЏ РєРѕРјРїРѕР·РёС†РёСЏ РїРѕ СѓС‚РІРµСЂР¶РґС‘РЅРЅРѕРјСѓ РјР°РєРµС‚Сѓ ===== */
        .page { background: #f7f9fc; }
        .screen {
          max-width: 430px;
          padding: max(20px, env(safe-area-inset-top)) 18px
            calc(104px + env(safe-area-inset-bottom));
          background: #fff;
        }
        .header { min-height: 54px; }
        .user { gap: 13px; }
        .avatar {
          width: 52px; height: 52px;
          background: #edf3ff;
          font-size: 25px; font-weight: 650;
        }
        .user p {
          font-size: 14px; line-height: 18px; letter-spacing: -0.1px;
        }
        .user h1 {
          margin-top: 2px;
          font-size: 23px; line-height: 27px;
          font-weight: 700; letter-spacing: -0.45px;
        }
        .bell {
          width: 48px; height: 48px;
          background: #f5f7fb; color: #52627a;
        }
        .bell svg { width: 25px; height: 25px; stroke-width: 1.75; }
        .bell i {
          width: 8px; height: 8px; top: 5px; right: 6px;
          box-shadow: 0 0 0 3px #f5f7fb;
        }
        .clientCode {
          min-height: 112px;
          display: flex; flex-direction: column; justify-content: center;
          margin-top: 20px; padding: 15px 18px 17px;
          border: 1px solid #d8e3f7;
          border-radius: 20px; background: #eef3ff;
        }
        .clientCode > span {
          color: ${NAVY}; opacity: 1;
          font-size: 14px; line-height: 19px; font-weight: 450;
        }
        .clientCode > div { gap: 9px; margin-top: 3px; }
        .clientCode strong {
          font-size: clamp(38px, 11vw, 48px);
          line-height: 52px; font-weight: 750; letter-spacing: 0.35px;
        }
        .clientCode button { width: 36px; height: 40px; border-radius: 9px; }
        .ready {
          min-height: 64px; margin-top: 14px; padding: 11px 15px;
          border: 1px solid #dcefe5;
          border-radius: 16px; background: #f6fbf8;
        }
        .search {
          height: 60px; gap: 12px; margin-top: 16px;
          padding: 0 7px 0 16px;
          border: 1px solid ${BORDER}; border-radius: 17px;
        }
        .search > svg {
          width: 24px; height: 24px;
          stroke: #64748b; stroke-width: 1.7;
        }
        .search input { font-size: 15.5px; letter-spacing: -0.1px; }
        .search button {
          height: 48px; min-width: 94px; padding: 0 20px;
          border-radius: 13px; font-size: 15px; font-weight: 650;
        }
        .orders { margin-top: 24px; }
        .sectionTitle { margin-bottom: 12px; }
        .sectionTitle h2 {
          font-size: 18px; line-height: 24px;
          font-weight: 650; letter-spacing: -0.2px;
        }
        .sectionTitle a {
          gap: 3px; font-size: 14px; font-weight: 650;
        }
        .orderGrid { gap: 12px; }
        .orderCard {
          min-height: 100px; padding: 15px;
          border-radius: 18px;
        }
        .orderCard > div:first-child { gap: 7px; }
        .orderCard strong {
          font-size: 32px; line-height: 34px;
          font-weight: 700; letter-spacing: -0.7px;
        }
        .orderCard span {
          max-width: 94px; color: #52627a;
          font-size: 13.5px; line-height: 17px;
          font-weight: 600; white-space: normal;
        }
        .orderIcon {
          width: 44px; height: 44px; border-radius: 13px;
        }
        .orderIcon img { width: 30px; height: 30px; }
        .china { border-color: #f8dfe2; background: #fff9f9; }
        .china .orderIcon { background: #fff1f2; }
        .transit { border-color: #dce6f7; background: #f8faff; }
        .transit .orderIcon { background: #edf3ff; }
        .readyOrder { border-color: #d8eee3; background: #f7fcf9; }
        .readyOrder .orderIcon { background: #eaf8f1; }
        .issued { border-color: #e9e1fb; background: #faf9ff; }
        .issued .orderIcon { background: #f2eeff; }
        .storage {
          min-height: 42px; justify-content: center;
          gap: 8px; margin-top: 10px; padding: 0 12px;
          border: 1px solid #dfe8fa; border-radius: 13px;
          background: #f5f8ff; color: ${BLUE};
        }
        .storage svg {
          width: 18px; height: 18px;
          stroke: ${BLUE}; stroke-width: 1.9;
        }
        .storage span {
          color: #344054; font-size: 13px;
          line-height: 18px; font-weight: 500;
        }
        .warehouse {
          margin-top: 20px; padding: 16px;
          border: 1px solid ${BORDER}; border-radius: 20px;
        }
        .warehouseHead { min-height: 40px; }
        .warehouseTitle { gap: 9px; }
        .pin { width: 22px; height: 26px; }
        .pin svg { width: 20px; height: 24px; stroke-width: 2; }
        .warehouse h2 {
          font-size: 18px; line-height: 24px;
          font-weight: 700; letter-spacing: -0.25px;
        }
        .copyAddressIcon {
          width: 40px; height: 40px; border-radius: 12px;
        }
        .warehouseBody {
          margin-top: 11px; padding-top: 12px;
          border-top: 1px solid ${BORDER};
        }
        .addrRow {
          grid-template-columns: 88px minmax(0, 1fr);
          gap: 12px; padding: 8px 0;
          font-size: 14px; line-height: 1.55;
        }
        .addrRow + .addrRow { border-top: 0; }
        .addrLabel { color: #718096; }
        .addrValue { color: #111827; font-weight: 450; }
        .addressGuide {
          min-height: 52px; gap: 6px;
          margin-top: 13px; padding: 12px 14px;
          border-radius: 14px;
          font-size: 14px; line-height: 20px; font-weight: 650;
        }
        .contactSection { margin-top: 14px; }

        .toast {
          position: fixed;
          bottom: calc(76px + env(safe-area-inset-bottom));
          left: 50%;
          z-index: 20;
          padding: 10px 14px;
          transform: translateX(-50%);
          border-radius: 10px;
          background: ${TEXT};
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        @media (max-width: 370px) {
          .screen {
            padding-right: 12px;
            padding-left: 12px;
          }

          .clientCode strong {
            font-size: 28px;
          }

          .orderGrid {
            gap: 8px;
          }

          .orderCard {
            padding: 10px 12px;
          }

          .orderIcon {
            width: 34px;
            height: 34px;
          }

          .contacts {
            gap: 6px;
          }

          .contacts span {
            font-size: 12px;
          }
        }

        @media (max-width: 430px) and (max-height: 760px) {
          .screen {
            padding-top: max(10px, env(safe-area-inset-top));
            padding-bottom: 12px;
          }

          .clientCode {
            margin-top: 8px;
            padding: 12px 14px;
          }

          .ready {
            margin-top: 10px;
          }

          .search {
            margin-top: 10px;
          }

          .orders {
            margin-top: 14px;
          }

          .warehouse {
            margin-top: 12px;
            padding: 12px 14px;
          }

          .contactSection {
            margin-top: 8px;
          }
        }

        @media (min-width: 431px) {
          .screen {
            box-shadow: none;
          }
        }
      `}</style>
    </main>
  );
}