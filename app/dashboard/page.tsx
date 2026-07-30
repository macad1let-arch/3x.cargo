"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Info,
  MapPin,
  Phone,
  Search,
  Truck,
  Warehouse,
} from "lucide-react";
import { FaTelegram, FaWhatsapp } from "react-icons/fa6";
import {
  Client,
  getClient,
  getShipmentCounts,
  getUnreadCount,
} from "@/lib/supabase-dashboard";

const WAREHOUSE_PHONE = "18745081507";
const WAREHOUSE_REGION = "广东省 广州市 荔湾区";
const WAREHOUSE_LOCATION = "站前路宇宙鞋城D区512-档口";
const PICKUP_MAP_URL = "https://2gis.kg/bishkek/geo/15763234351117645";

type ClientWithAmount = Client & { amount_due?: number };
type CopyTarget = "code" | "address" | null;

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
  const [trackCode, setTrackCode] = useState("");
  const [copied, setCopied] = useState<CopyTarget>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
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

    loadDashboard();
    return () => {
      active = false;
    };
  }, [supabase]);

  const firstName =
    client?.first_name || client?.full_name?.split(" ")[0] || "Adilet";
  const clientCode = client?.client_code || "3X-4198";
  const issuedCount = Math.max(
    totalOrders -
      (counts.china + counts.transit + counts.sorting + counts.ready),
    0
  );
  const warehouseRecipient = `龙生 ${clientCode}`;
  const warehouseAddress = `${warehouseRecipient}\n${WAREHOUSE_PHONE}\n${WAREHOUSE_REGION}\n${WAREHOUSE_LOCATION} ${clientCode}`;

  async function copyText(value: string, target: Exclude<CopyTarget, null>) {
    await navigator.clipboard.writeText(value);
    setCopied(target);
    window.setTimeout(() => setCopied(null), 1500);
  }

  function findShipment() {
    const value = trackCode.trim();
    window.location.href = value
      ? `/dashboard/orders?tracking=${encodeURIComponent(value)}`
      : "/dashboard/orders";
  }

  if (loading) {
    return (
      <main className="loading">
        <span />
        <style jsx>{`
          .loading {
            min-height: 100dvh;
            display: grid;
            place-items: center;
            background: #fff;
          }
          .loading span {
            width: 32px;
            height: 32px;
            border: 3px solid #e5ebf4;
            border-top-color: #123b9f;
            border-radius: 50%;
            animation: spin 0.75s linear infinite;
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
        <header className="header">
          <Link href="/dashboard/profile" className="profileLink">
            <span className="avatar">{(firstName[0] || "A").toUpperCase()}</span>
            <span className="profileText">
              <small>Здравствуйте</small>
              <strong>
                {firstName}
                <ChevronRight size={17} strokeWidth={2.1} />
              </strong>
            </span>
          </Link>

          <Link
            href="/dashboard/notifications"
            className="notification"
            aria-label="Открыть уведомления"
          >
            <Bell size={23} strokeWidth={1.8} />
            {unread > 0 && <i />}
          </Link>
        </header>

        <section className="codeCard" aria-label="Ваш код клиента">
          <span>Ваш индивидуальный код</span>
          <div>
            <strong>{clientCode}</strong>
            <button
              type="button"
              onClick={() => copyText(clientCode, "code")}
              aria-label="Скопировать код"
            >
              {copied === "code" ? (
                <Check size={24} strokeWidth={2.2} />
              ) : (
                <Copy size={24} strokeWidth={1.9} />
              )}
            </button>
          </div>
        </section>

        <form
          className="tracking"
          onSubmit={(event) => {
            event.preventDefault();
            findShipment();
          }}
        >
          <label>
            <Search size={22} strokeWidth={1.8} />
            <input
              value={trackCode}
              onChange={(event) => setTrackCode(event.target.value)}
              placeholder="Введите трек-код"
              aria-label="Трек-код"
            />
          </label>
          <button type="submit">Найти</button>
        </form>

        <section className="orders">
          <div className="sectionHeading">
            <h2>Мои заказы</h2>
            <Link href="/dashboard/orders">
              Все заказы
              <ChevronRight size={18} strokeWidth={2} />
            </Link>
          </div>

          <div className="orderGrid">
            <Link href="/dashboard/orders?status=china" className="orderCard china">
              <strong>{counts.china}</strong>
              <span>В Китае</span>
              <span className="statusIcon flag">
                <img
                  src="/icons/dashboard/china.svg"
                  alt=""
                  aria-hidden="true"
                />
              </span>
            </Link>

            <Link
              href="/dashboard/orders?status=transit"
              className="orderCard transit"
            >
              <strong>{counts.transit}</strong>
              <span>В пути</span>
              <span className="statusIcon">
                <Truck size={30} strokeWidth={1.9} />
              </span>
            </Link>

            <Link href="/dashboard/orders?status=ready" className="orderCard ready">
              <strong>{counts.ready}</strong>
              <span>Готово к выдаче</span>
              <span className="statusIcon readyAsset">
                <img
                  src="/icons/dashboard/ready.svg"
                  alt=""
                  aria-hidden="true"
                />
              </span>
            </Link>

            <Link href="/dashboard/orders?status=issued" className="orderCard issued">
              <strong>{issuedCount}</strong>
              <span>Выдано</span>
              <span className="statusIcon issuedIcon">
                <img
                  src="/icons/dashboard/issued.svg"
                  alt=""
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>

          <div className="storage">
            <Info size={19} strokeWidth={1.9} />
            <span>
              Срок бесплатного хранения - <strong>7 дней</strong>
            </span>
          </div>
        </section>

        <section className="warehouse">
          <div className="warehouseHeading">
            <div>
              <Warehouse size={24} strokeWidth={1.85} />
              <h2>Адрес склада</h2>
            </div>
            <button
              type="button"
              onClick={() => copyText(warehouseAddress, "address")}
              aria-label="Скопировать адрес склада"
            >
              {copied === "address" ? (
                <Check size={22} strokeWidth={2.2} />
              ) : (
                <Copy size={21} strokeWidth={1.9} />
              )}
            </button>
          </div>

          <div className="addressRows">
            <div>
              <span>Получатель</span>
              <p>
                龙生 <b>{clientCode}</b>
              </p>
            </div>
            <div>
              <span>Телефон</span>
              <p>{WAREHOUSE_PHONE}</p>
            </div>
            <div>
              <span>Адрес</span>
              <p>
                {WAREHOUSE_REGION}
                <br />
                {WAREHOUSE_LOCATION} <b>{clientCode}</b>
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/instructions#warehouse-address"
            className="addressGuide"
          >
            <span>Как правильно заполнить адрес</span>
            <ChevronRight size={19} strokeWidth={2} />
          </Link>
        </section>

        <section className="belowFold" aria-label="Получение заказа и контакты">
          <h2 className="pickupTitle">Пункт выдачи</h2>

          <div className="pickupCard">
            <a
              href={PICKUP_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="pickupAddress"
            >
              <span className="pickupIcon">
                <MapPin size={22} strokeWidth={1.9} />
              </span>
              <span className="pickupContent">
                <strong>Логвиненко, 55А</strong>
                <small>Открыть в 2ГИС</small>
              </span>
              <ChevronRight size={19} strokeWidth={2} />
            </a>

            <div className="pickupMeta">
              <span className="pickupIcon">
                <Clock3 size={21} strokeWidth={1.9} />
              </span>
              <span className="pickupContent">
                <strong>10:00–19:00</strong>
                <small>Ежедневно</small>
              </span>
            </div>
          </div>

          <div className="contactSection">
            <h2>Связаться</h2>
            <div className="contactButtons">
              <a
                href={process.env.NEXT_PUBLIC_WHATSAPP_URL || "/dashboard/support"}
                aria-label="Написать в WhatsApp"
              >
                <FaWhatsapp className="whatsapp" />
                <span>WhatsApp</span>
              </a>
              <a
                href={process.env.NEXT_PUBLIC_TELEGRAM_URL || "/dashboard/support"}
                aria-label="Написать в Telegram"
              >
                <FaTelegram className="telegram" />
                <span>Telegram</span>
              </a>
              <a
                href={process.env.NEXT_PUBLIC_PHONE_URL || "tel:+996000000000"}
                aria-label="Позвонить"
              >
                <Phone className="phone" size={21} fill="currentColor" />
                <span>Позвонить</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {copied && (
        <div className="toast" role="status">
          {copied === "code" ? "Код скопирован" : "Адрес скопирован"}
        </div>
      )}

      <style jsx global>{`
        :root {
          --navy: #123b9f;
          --text: #0a1e3d;
          --muted: #667a98;
          --border: #dce5f1;
          --soft-blue: #eef4ff;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          min-height: 100%;
          overflow-x: hidden;
          background: #fff;
          color: var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
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
        input:focus-visible,
        a:focus-visible {
          outline: 3px solid rgba(18, 59, 159, 0.18);
          outline-offset: 2px;
        }

        .page {
          display: flex;
          justify-content: center;
          background: #fff;
        }

        .screen {
          width: 100%;
          max-width: 430px;
          padding: max(18px, env(safe-area-inset-top)) 16px 0;
          background: #fff;
        }

        .header {
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .profileLink {
          display: flex;
          align-items: center;
          gap: 10px;
          color: inherit;
          text-decoration: none;
        }

        .avatar {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #edf3ff;
          color: var(--navy);
          font-size: 20px;
          line-height: 1;
          font-weight: 620;
        }

        .profileText {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .profileText small {
          color: var(--muted);
          font-size: 12px;
          line-height: 16px;
          font-weight: 460;
        }

        .profileText strong {
          display: flex;
          align-items: center;
          gap: 3px;
          color: var(--text);
          font-size: 19px;
          line-height: 23px;
          font-weight: 680;
        }

        .profileText svg {
          color: var(--navy);
        }

        .notification {
          width: 44px;
          height: 44px;
          position: relative;
          display: grid;
          place-items: center;
          border: 1px solid #dce6f6;
          border-radius: 14px;
          background: #fff;
          color: #536883;
        }

        .notification i {
          width: 8px;
          height: 8px;
          position: absolute;
          top: 7px;
          right: 8px;
          border: 2px solid #fff;
          border-radius: 50%;
          background: var(--navy);
        }

        .codeCard {
          min-height: 112px;
          display: grid;
          align-content: center;
          margin-top: 14px;
          padding: 16px 18px;
          border: 1px solid #c9d9f7;
          border-radius: 18px;
          background: #edf3ff;
          text-align: center;
        }

        .codeCard > span {
          color: var(--navy);
          font-size: 14px;
          line-height: 18px;
          font-weight: 620;
        }

        .codeCard > div {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 6px;
        }

        .codeCard strong {
          color: var(--navy);
          font-size: clamp(36px, 10.5vw, 46px);
          line-height: 1;
          font-weight: 720;
          letter-spacing: 0.3px;
        }

        .codeCard button {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          padding: 0;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: var(--navy);
          cursor: pointer;
        }

        .tracking {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 106px;
          gap: 10px;
          margin-top: 20px;
        }

        .tracking label {
          height: 56px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 16px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: #fff;
          color: var(--muted);
          transition: border-color 0.15s ease;
        }

        .tracking label:focus-within {
          border-color: #9cb7ed;
        }

        .tracking input {
          width: 100%;
          min-width: 0;
          height: 100%;
          padding: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text);
          font-size: 15px;
          font-weight: 480;
        }

        .tracking input::placeholder {
          color: #687d9b;
          opacity: 1;
        }

        .tracking > button {
          height: 56px;
          padding: 0 18px;
          border: 0;
          border-radius: 16px;
          background: var(--navy);
          color: #fff;
          font-size: 15px;
          font-weight: 680;
          cursor: pointer;
        }

        .orders {
          margin-top: 22px;
        }

        .sectionHeading {
          min-height: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sectionHeading h2,
        .warehouseHeading h2 {
          margin: 0;
          color: var(--text);
          font-size: 17px;
          line-height: 23px;
          font-weight: 620;
          letter-spacing: 0;
        }

        .sectionHeading a {
          display: flex;
          align-items: center;
          gap: 3px;
          color: var(--navy);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .orderGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }

        .orderCard {
          min-height: 104px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 14px 15px;
          overflow: hidden;
          border: 1px solid;
          border-radius: 17px;
          text-decoration: none;
        }

        .orderCard > strong {
          font-size: 31px;
          line-height: 32px;
          font-weight: 650;
        }

        .orderCard > span:not(.statusIcon) {
          color: #556a87;
          font-size: 14px;
          line-height: 18px;
          font-weight: 620;
        }

        .statusIcon {
          width: 30px;
          height: 30px;
          position: absolute;
          top: 14px;
          right: 14px;
          display: grid;
          place-items: center;
        }

        .statusIcon > svg,
        .statusIcon > img {
          width: 30px;
          height: 30px;
          display: block;
          object-fit: contain;
        }

        .statusIcon.flag img {
          transform: scale(1.06);
        }

        .china {
          border-color: #f5d4d9;
          background: #fff7f8;
          color: #ea394d;
        }

        .transit {
          border-color: #d1e3f7;
          background: #f3f8fe;
          color: #2f74c8;
        }

        .ready {
          border-color: #cfe8dd;
          background: #f2faf6;
          color: #0a9b68;
        }

        .issued {
          border-color: #ddddf7;
          background: #f7f7ff;
          color: #5c5bd6;
        }

        .storage {
          min-height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 15px;
          color: var(--text);
          font-size: 13px;
          line-height: 18px;
          font-weight: 570;
          text-align: center;
        }

        .storage svg,
        .storage strong {
          color: var(--navy);
        }

        .storage strong {
          font-weight: 750;
        }

        .warehouse {
          margin-top: 17px;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: #fff;
        }

        .warehouseHeading {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .warehouseHeading > div {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          color: var(--navy);
        }

        .warehouseHeading h2 {
          color: var(--text);
          font-size: 17px;
          font-weight: 620;
        }

        .warehouseHeading button {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          padding: 0;
          border: 1px solid #d7e3f7;
          border-radius: 12px;
          background: var(--soft-blue);
          color: var(--navy);
          cursor: pointer;
        }

        .addressRows {
          display: grid;
          gap: 8px;
          margin-top: 13px;
        }

        .addressRows > div {
          display: grid;
          grid-template-columns: 102px minmax(0, 1fr);
          align-items: start;
          gap: 8px;
        }

        .addressRows span {
          color: #71829d;
          font-size: 12.5px;
          line-height: 19px;
          font-weight: 480;
        }

        .addressRows p {
          min-width: 0;
          margin: 0;
          color: var(--text);
          font-size: 14px;
          line-height: 19px;
          font-weight: 540;
          overflow-wrap: anywhere;
        }

        .addressRows b {
          font-weight: 750;
        }

        .addressGuide {
          min-height: 48px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 8px;
          padding: 10px 44px;
          border: 1px solid #d5e2fa;
          border-radius: 14px;
          background: #edf3ff;
          color: var(--navy);
          font-size: 13.5px;
          line-height: 18px;
          font-weight: 650;
          text-align: center;
          text-decoration: none;
        }

        .addressGuide svg {
          position: absolute;
          top: 50%;
          right: 14px;
          width: 19px;
          height: 19px;
          padding: 0;
          flex: 0 0 auto;
          border: 0;
          border-radius: 0;
          background: transparent;
          transform: translateY(-50%);
        }

        .belowFold {
          margin-top: 24px;
        }

        .pickupTitle,
        .contactSection h2 {
          margin: 0;
          color: var(--text);
          font-size: 17px;
          line-height: 22px;
          font-weight: 680;
        }

        .pickupCard {
          margin-top: 10px;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: #fff;
        }

        .pickupAddress {
          min-height: 68px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 14px;
          color: var(--text);
          text-decoration: none;
        }

        .pickupIcon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 11px;
          background: #edf3ff;
          color: var(--navy);
        }

        .pickupContent {
          min-width: 0;
          display: flex;
          flex: 1;
          flex-direction: column;
        }

        .pickupContent small {
          color: #71829d;
          font-size: 12px;
          line-height: 16px;
          font-weight: 520;
        }

        .pickupContent strong {
          color: var(--text);
          font-size: 14px;
          line-height: 19px;
          font-weight: 680;
        }

        .pickupMeta {
          min-height: 60px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 14px;
          border-top: 1px solid #edf1f6;
          background: #fff;
          color: var(--navy);
        }

        .pickupAddress > svg {
          flex: 0 0 auto;
          color: #7486a1;
        }

        .contactSection {
          margin-top: 20px;
          margin-bottom: 0;
        }

        .contactSection h2 {
          margin-bottom: 10px;
        }

        .contactButtons {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .contactButtons a {
          min-width: 0;
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 8px;
          border: 1px solid var(--border);
          border-radius: 15px;
          background: #fff;
          color: var(--text);
          font-size: 13px;
          font-weight: 620;
          text-decoration: none;
        }

        .contactButtons svg {
          width: 22px;
          height: 22px;
          flex: 0 0 auto;
        }

        .whatsapp {
          color: #09b95f;
        }

        .telegram {
          color: #229ed9;
        }

        .phone {
          color: var(--navy);
        }

        .toast {
          position: fixed;
          left: 50%;
          bottom: calc(94px + env(safe-area-inset-bottom));
          z-index: 50;
          transform: translateX(-50%);
          padding: 10px 14px;
          border-radius: 12px;
          background: var(--text);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        @media (max-width: 365px) {
          .screen {
            padding-right: 12px;
            padding-left: 12px;
          }

          .tracking {
            grid-template-columns: minmax(0, 1fr) 92px;
            gap: 8px;
          }

          .tracking label {
            padding: 0 12px;
          }

          .orderCard {
            min-height: 100px;
            padding: 13px;
          }

          .addressRows > div {
            grid-template-columns: 90px minmax(0, 1fr);
          }

          .contactButtons {
            gap: 7px;
          }

          .contactButtons a {
            gap: 5px;
            font-size: 11.5px;
          }

        }

        /*
         * На типичных мобильных viewport 740–900 px весь основной сценарий
         * завершается карточкой склада. Контакты остаются следующим экраном
         * прокрутки и не выглядывают из-под фиксированной навигации.
         */
        @media (max-height: 900px) {
          .screen {
            padding-top: max(12px, env(safe-area-inset-top));
          }

          .header {
            min-height: 44px;
          }

          .avatar {
            width: 42px;
            height: 42px;
            font-size: 19px;
          }

          .notification {
            width: 42px;
            height: 42px;
          }

          .codeCard {
            min-height: 96px;
            margin-top: 10px;
            padding: 12px 16px;
          }

          .codeCard > span {
            font-size: 13px;
            line-height: 17px;
          }

          .codeCard > div {
            margin-top: 4px;
          }

          .codeCard strong {
            font-size: clamp(34px, 10vw, 42px);
          }

          .codeCard button {
            width: 38px;
            height: 38px;
          }

          .tracking {
            grid-template-columns: minmax(0, 1fr) 102px;
            margin-top: 14px;
          }

          .tracking label,
          .tracking > button {
            height: 52px;
          }

          .orders {
            margin-top: 16px;
          }

          .sectionHeading {
            min-height: 26px;
          }

          .sectionHeading h2 {
            font-size: 17px;
            line-height: 23px;
            font-weight: 620;
          }

          .orderGrid {
            gap: 9px;
            margin-top: 10px;
          }

          .orderCard {
            min-height: 88px;
            padding: 12px 14px;
            border-radius: 16px;
          }

          .orderCard > strong {
            font-size: 28px;
            line-height: 29px;
          }

          .orderCard > span:not(.statusIcon) {
            font-size: 13px;
            line-height: 17px;
          }

          .statusIcon {
            width: 30px;
            height: 30px;
            top: 12px;
            right: 13px;
          }

          .storage {
            min-height: 22px;
            margin-top: 11px;
            font-size: 12.5px;
          }

          .warehouse {
            margin-top: 13px;
            padding: 14px;
            border-radius: 17px;
          }

          .warehouseHeading button {
            width: 42px;
            height: 42px;
          }

          .warehouseHeading h2 {
            font-size: 17px;
            line-height: 23px;
            font-weight: 620;
          }

          .addressRows {
            gap: 5px;
            margin-top: 10px;
          }

          .addressRows > div {
            grid-template-columns: 96px minmax(0, 1fr);
          }

          .addressRows span {
            font-size: 12px;
            line-height: 18px;
          }

          .addressRows p {
            font-size: 13px;
            line-height: 18px;
          }

          .addressGuide {
            min-height: 44px;
            margin-top: 7px;
            padding: 8px 42px;
            font-size: 13px;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          button,
          a {
            transition:
              transform 0.14s ease,
              background 0.14s ease,
              border-color 0.14s ease;
          }

          button:active,
          a:active {
            transform: scale(0.985);
          }
        }
      `}</style>
    </main>
  );
}