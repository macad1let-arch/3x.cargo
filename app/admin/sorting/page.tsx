"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import * as XLSX from "xlsx";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Batch = { id: number; batch_code: string; status: string; total_shipments: number; total_weight: number; created_at: string; };
type ExpectedItem = { client_code: string; tracking_code: string; weight: number; status: string; };
type ScannedItem = { tracking_code: string; client_code: string | null; weight: number | null; matched: boolean; unknown: boolean; timestamp: Date; };
type ClientGroup = { client_code: string; expected: ExpectedItem[]; scanned: ScannedItem[]; };

const RATE = 2.8;

export default function SortingPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [expectedItems, setExpectedItems] = useState<ExpectedItem[]>([]);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [printClient, setPrintClient] = useState<ClientGroup | null>(null);
  const [searchExpected, setSearchExpected] = useState("");
  const scanRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("batches").select("*").order("created_at", { ascending: false }).then(({ data }) => setBatches(data || []));
  }, []);

  const loadBatch = useCallback(async (batch: Batch) => {
    setLoadingBatch(true);
    setScannedItems([]);
    const { data } = await supabase.from("shipments").select("client_code, tracking_code, weight, status").eq("batch_code", batch.batch_code);
    setExpectedItems(data || []);
    setSelectedBatch(batch);
    setLoadingBatch(false);
    setTimeout(() => scanRef.current?.focus(), 100);
  }, []);

  const handleScan = useCallback(() => {
    const code = scanInput.trim().toUpperCase();
    if (!code) return;
    const matched = expectedItems.find(e => e.tracking_code.toUpperCase() === code);
    if (scannedItems.find(s => s.tracking_code === code)) { setScanInput(""); return; }
    setScannedItems(prev => [{ tracking_code: code, client_code: matched?.client_code || null, weight: matched?.weight || null, matched: !!matched, unknown: !matched, timestamp: new Date() }, ...prev]);
    setScanInput("");
    if (matched) setExpandedClients(prev => new Set([...prev, matched.client_code]));
  }, [scanInput, expectedItems, scannedItems]);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target?.result as ArrayBuffer), { type: "array" });
        const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        const batchCode = rows[0]?.batch_code || "";
        if (batchCode) {
          const { data: ex } = await supabase.from("batches").select("id").eq("batch_code", batchCode).single();
          if (!ex) await supabase.from("batches").insert({ batch_code: batchCode, status: "china_warehouse", origin_city: "Гуанчжоу", destination_city: "Бишкек", total_shipments: rows.length, total_weight: rows.reduce((s: number, r: any) => s + (parseFloat(r.weight) || 0), 0) });
        }
        const shipments = rows.filter(r => r.tracking_code).map(r => ({ client_code: r.client_code || "unknown", tracking_code: String(r.tracking_code).trim(), batch_code: r.batch_code || batchCode, status: r.status || "china_warehouse", location: r.location || "Гуанчжоу", weight: parseFloat(r.weight) || null }));
        await supabase.from("shipments").upsert(shipments, { onConflict: "tracking_code" });
        const { data: nb } = await supabase.from("batches").select("*").order("created_at", { ascending: false });
        setBatches(nb || []);
        alert(`✅ Загружено ${shipments.length} посылок`);
      } catch { alert("Ошибка при загрузке"); }
      setUploading(false);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const clientGroups = useCallback((): ClientGroup[] => {
    const groups: Record<string, ClientGroup> = {};
    expectedItems.forEach(item => {
      if (!groups[item.client_code]) groups[item.client_code] = { client_code: item.client_code, expected: [], scanned: [] };
      groups[item.client_code].expected.push(item);
    });
    scannedItems.forEach(item => { if (item.client_code && groups[item.client_code]) groups[item.client_code].scanned.push(item); });
    return Object.values(groups).sort((a, b) => {
      const aC = a.scanned.length >= a.expected.length; const bC = b.scanned.length >= b.expected.length;
      if (aC && !bC) return 1; if (!aC && bC) return -1;
      return b.scanned.length - a.scanned.length;
    });
  }, [expectedItems, scannedItems])();

  const filteredGroups = searchExpected ? clientGroups.filter(g => g.client_code.toLowerCase().includes(searchExpected.toLowerCase())) : clientGroups;
  const totalScanned = scannedItems.filter(s => s.matched).length;
  const totalExpected = expectedItems.length;
  const unknownScanned = scannedItems.filter(s => s.unknown).length;
  const progress = totalExpected > 0 ? Math.round((totalScanned / totalExpected) * 100) : 0;

  const handlePrint = (group: ClientGroup) => { setPrintClient(group); setTimeout(() => window.print(), 200); };

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-label { display: block !important; }
          @page { size: 100mm 150mm; margin: 0; }
        }
        #print-label { display: none; }
        .sort-scroll::-webkit-scrollbar { width: 4px; }
        .sort-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div id="print-label" style={{ fontFamily: "Arial, sans-serif", padding: "5mm", color: "#000" }}>
        {printClient && <>
          <div style={{ borderBottom: "2px solid #000", paddingBottom: 4, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
            <div><div style={{ fontSize: 16, fontWeight: 900 }}>3X CARGO</div><div style={{ fontSize: 8, color: "#555" }}>Гуанчжоу → Бишкек</div></div>
            <div style={{ textAlign: "right", fontSize: 8, color: "#555" }}><div>{new Date().toLocaleDateString("ru-RU")}</div><div>Партия: {selectedBatch?.batch_code}</div></div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 6 }}>Клиент: {printClient.client_code}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8, marginBottom: 6 }}>
            <thead><tr style={{ background: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: "3px 4px", textAlign: "left" }}>№</th>
              <th style={{ border: "1px solid #ccc", padding: "3px 4px", textAlign: "left" }}>Трек-код</th>
              <th style={{ border: "1px solid #ccc", padding: "3px 4px", textAlign: "right" }}>Вес, кг</th>
              <th style={{ border: "1px solid #ccc", padding: "3px 4px", textAlign: "right" }}>Сумма, $</th>
            </tr></thead>
            <tbody>{printClient.expected.map((item, idx) => (
              <tr key={item.tracking_code}>
                <td style={{ border: "1px solid #ccc", padding: "2px 4px" }}>{idx + 1}</td>
                <td style={{ border: "1px solid #ccc", padding: "2px 4px", fontFamily: "monospace", fontSize: 7 }}>{item.tracking_code}</td>
                <td style={{ border: "1px solid #ccc", padding: "2px 4px", textAlign: "right" }}>{item.weight ?? "—"}</td>
                <td style={{ border: "1px solid #ccc", padding: "2px 4px", textAlign: "right" }}>{item.weight ? (item.weight * RATE).toFixed(2) : "—"}</td>
              </tr>
            ))}</tbody>
            <tfoot><tr style={{ background: "#f0f0f0", fontWeight: 700 }}>
              <td colSpan={2} style={{ border: "1px solid #ccc", padding: "3px 4px" }}>Итого: {printClient.expected.length} посылок</td>
              <td style={{ border: "1px solid #ccc", padding: "3px 4px", textAlign: "right" }}>{printClient.expected.reduce((s, i) => s + (i.weight || 0), 0).toFixed(2)}</td>
              <td style={{ border: "1px solid #ccc", padding: "3px 4px", textAlign: "right" }}>${printClient.expected.reduce((s, i) => s + (i.weight || 0) * RATE, 0).toFixed(2)}</td>
            </tr></tfoot>
          </table>
          <div style={{ fontSize: 7, color: "#666", borderTop: "1px solid #ddd", paddingTop: 4 }}>Вопросы: +996 220 343 053 • ул. Логвиненко 55А, Бишкек • 3xcargo.kg</div>
        </>}
      </div>

      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Сортировка</h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Приёмка и сверка партий</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleExcelUpload} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "10px 18px", fontSize: 14, fontWeight: 600, color: "#334155", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              {uploading ? "Загрузка..." : "Загрузить Excel"}
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>1</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Выберите партию</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <button onClick={() => setShowBatchDropdown(!showBatchDropdown)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                <span>{selectedBatch ? `${selectedBatch.batch_code} — ${selectedBatch.status}` : "Выберите партию..."}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showBatchDropdown && (
                <div style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 4px)", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,.1)", zIndex: 50, overflow: "hidden" }}>
                  {batches.map(b => (
                    <button key={b.id} onClick={() => { loadBatch(b); setShowBatchDropdown(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", fontSize: 14, border: "none", background: "none", cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{b.batch_code}</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{b.total_shipments} посылок • {b.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedBatch && (
              <button onClick={() => loadBatch(selectedBatch)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </button>
            )}
          </div>
          {selectedBatch && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
              {[
                { label: "Ожидается", value: totalExpected, color: "#0f172a", bg: "#f8fafc", border: "#e2e8f0" },
                { label: "Отсканировано", value: totalScanned, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
                { label: "Неизвестных", value: unknownScanned, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
                { label: "Прогресс", value: `${progress}%`, color: progress === 100 ? "#16a34a" : "#ea580c", bg: progress === 100 ? "#f0fdf4" : "#fff7ed", border: progress === 100 ? "#bbf7d0" : "#fed7aa" },
              ].map(stat => (
                <div key={stat.label} style={{ background: stat.bg, border: `1.5px solid ${stat.border}`, borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, marginTop: 14, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#2563eb", borderRadius: 99, transition: "width .4s" }} />
            </div>
          </>}
        </div>

        {selectedBatch && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>2</div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Список по клиентам</span>
                <span style={{ marginLeft: "auto", background: "#f1f5f9", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 700, color: "#64748b" }}>{filteredGroups.length} клиентов</span>
              </div>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Поиск по коду клиента..." value={searchExpected} onChange={e => setSearchExpected(e.target.value)}
                  style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 14px 10px 36px", fontSize: 14, color: "#334155", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div className="sort-scroll" style={{ maxHeight: 560, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {loadingBatch ? <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, color: "#94a3b8" }}>Загрузка...</div>
                : filteredGroups.map(group => {
                  const sc = group.scanned.length, ex = group.expected.length;
                  const isComplete = sc >= ex && ex > 0, isPartial = sc > 0 && !isComplete;
                  const isExpanded = expandedClients.has(group.client_code);
                  const tw = group.expected.reduce((s, i) => s + (i.weight || 0), 0);
                  return (
                    <div key={group.client_code} style={{ border: `1.5px solid ${isComplete ? "#bbf7d0" : isPartial ? "#bfdbfe" : "#e2e8f0"}`, borderRadius: 14, overflow: "hidden", background: isComplete ? "#f0fdf4" : isPartial ? "#eff6ff" : "#fff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer" }} onClick={() => { setExpandedClients(prev => { const n = new Set(prev); n.has(group.client_code) ? n.delete(group.client_code) : n.add(group.client_code); return n; }); }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: isComplete ? "#22c55e" : isPartial ? "#3b82f6" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {isComplete ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isPartial ? "#fff" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{group.client_code}</div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{sc}/{ex} посылок • {tw.toFixed(1)} кг • ${(tw * RATE).toFixed(2)}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); handlePrint(group); }}
                          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", flexShrink: 0 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                          Печать
                        </button>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "none", transition: ".2s" }}><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      {isExpanded && (
                        <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 14px 12px" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead><tr>
                              <th style={{ textAlign: "left", padding: "4px 0", color: "#94a3b8", fontWeight: 600 }}>Трек-код</th>
                              <th style={{ textAlign: "right", padding: "4px 0", color: "#94a3b8", fontWeight: 600 }}>Вес</th>
                              <th style={{ textAlign: "right", padding: "4px 0", color: "#94a3b8", fontWeight: 600 }}>Статус</th>
                            </tr></thead>
                            <tbody>{group.expected.map(item => {
                              const ok = group.scanned.some(s => s.tracking_code === item.tracking_code.toUpperCase());
                              return (
                                <tr key={item.tracking_code} style={{ borderTop: "1px solid #f8fafc" }}>
                                  <td style={{ padding: "5px 0", fontFamily: "monospace", fontSize: 11, color: "#334155" }}>{item.tracking_code}</td>
                                  <td style={{ padding: "5px 0", textAlign: "right", color: "#64748b" }}>{item.weight ?? "—"} кг</td>
                                  <td style={{ padding: "5px 0", textAlign: "right" }}>{ok ? <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ Есть</span> : <span style={{ color: "#cbd5e1" }}>— Ждём</span>}</td>
                                </tr>
                              );
                            })}</tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>3</div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Сканирование</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>
                    <input ref={scanRef} value={scanInput} onChange={e => setScanInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleScan()}
                      placeholder="Сканируйте или введите трек-код..."
                      style={{ width: "100%", border: "2px solid #bfdbfe", borderRadius: 12, padding: "13px 14px 13px 42px", fontSize: 14, fontFamily: "monospace", color: "#0f172a", outline: "none", background: "#eff6ff", boxSizing: "border-box" }}
                      onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = "#bfdbfe"; e.target.style.background = "#eff6ff"; }}
                      autoFocus />
                  </div>
                  <button onClick={handleScan} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "0 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Добавить</button>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Нажмите Enter или кнопку. Поддерживается USB-сканер штрихкодов.</p>
              </div>

              <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Журнал сканирования</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{scannedItems.length} записей</span>
                </div>
                <div className="sort-scroll" style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {scannedItems.length === 0
                    ? <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, color: "#94a3b8" }}>Отсканированные посылки появятся здесь</div>
                    : scannedItems.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, background: item.unknown ? "#fef2f2" : "#f0fdf4", borderRadius: 12, padding: "10px 14px" }}>
                        {item.unknown
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.tracking_code}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{item.unknown ? "Не найден в партии" : `${item.client_code} • ${item.weight ?? "—"} кг`}</div>
                        </div>
                        <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>{item.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
                        <button onClick={() => setScannedItems(prev => prev.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", flexShrink: 0, padding: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {unknownScanned > 0 && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{unknownScanned} посылок не найдено в партии</div>
                    <div style={{ fontSize: 12, color: "#ef4444", marginTop: 2 }}>Трек-коды отсутствуют в загруженном списке</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedBatch && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "80px 0", textAlign: "center", border: "2px dashed #e2e8f0" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto 16px", display: "block" }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#94a3b8" }}>Выберите партию для начала сортировки</p>
            <p style={{ fontSize: 13, color: "#cbd5e1", marginTop: 6 }}>или загрузите Excel файл с новой партией</p>
          </div>
        )}
      </div>
    </>
  );
}