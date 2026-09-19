"use client";

import { FormEvent, useState } from "react";
import {
  PackageSearch,
  Search,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import styles from "./TrackingBlock.module.css";

const STATUS_MAP: Record<string, string> = {
  china_warehouse: "На складе в Китае",
  in_transit: "В пути",
  bishkek_arrived: "Прибыл в Бишкек",
  sorting: "На сортировке",
  ready_pickup: "Готов к выдаче",
  completed: "Выдано",
  problem: "Требует внимания",
};

type Shipment = {
  tracking_code: string;
  status: string;
};

export default function TrackingBlock() {
  const [trackCode, setTrackCode] = useState("");
  const [result, setResult] = useState<Shipment | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = trackCode.trim().toUpperCase();

    if (!code || loading) return;

    setLoading(true);
    setSearched(false);
    setResult(null);

    const { data, error } = await supabase
      .from("shipments")
      .select("tracking_code,status")
      .eq("tracking_code", code)
      .maybeSingle();

    setLoading(false);
    setSearched(true);

    if (error || !data) {
      setResult(null);
      return;
    }

    setResult(data);
  }

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.heading}>
          <div className={styles.headingIcon} aria-hidden="true">
            <PackageSearch />
          </div>

          <div>
            <h2>Отследить посылку</h2>
            <p>Узнайте статус посылки</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.inputWrap}>
            <Search className={styles.searchIcon} aria-hidden="true" />

            <input
              value={trackCode}
              onChange={(event) => {
                setTrackCode(event.target.value);

                if (searched) {
                  setSearched(false);
                  setResult(null);
                }
              }}
              placeholder="Введите трек-код"
              aria-label="Введите трек-код"
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <button
            type="submit"
            className={styles.searchButton}
            disabled={!trackCode.trim() || loading}
          >
            {loading ? (
              <LoaderCircle
                className={styles.loader}
                aria-hidden="true"
              />
            ) : (
              "Найти"
            )}
          </button>
        </form>

        {searched && result && (
          <div className={styles.result}>
            <div className={styles.resultLeft}>
              <CheckCircle2 aria-hidden="true" />

              <div>
                <span className={styles.resultCode}>
                  {result.tracking_code}
                </span>

                <strong>
                  {STATUS_MAP[result.status] ?? result.status}
                </strong>
              </div>
            </div>
          </div>
        )}

        {searched && !result && (
          <div className={styles.notFound}>
            Трек-код не найден
          </div>
        )}
      </div>
    </section>
  );
}