"use client";
import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Кнопка */}
      <button
        onClick={() => setOpen(!open)}
        style={{ position: "fixed", bottom: 80, right: 20, zIndex: 999, width: 56, height: 56, borderRadius: "50%", background: "#005eaa", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,94,170,.4)" }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      {/* Окно чата */}
      {open && (
        <div style={{ position: "fixed", bottom: 90, right: 20, zIndex: 998, width: 320, height: 420, background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,.15)", border: "1.5px solid #dce4ef", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Хедер */}
          <div style={{ background: "#005eaa", padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>3X Cargo</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>Онлайн · отвечаем быстро</div>
            </div>
          </div>

          {/* Сообщения — сюда потом подключишь ИИ */}
          <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#f0f4f8", borderRadius: "12px 12px 12px 4px", padding: "10px 14px", fontSize: 13, color: "#0d1a2e", maxWidth: "80%" }}>
              Привет! Чем могу помочь? 👋
            </div>
          </div>

          {/* Инпут */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #dce4ef", display: "flex", gap: 8 }}>
            <input
              placeholder="Написать сообщение..."
              style={{ flex: 1, height: 40, padding: "0 12px", border: "1.5px solid #dce4ef", borderRadius: 20, fontSize: 13, fontFamily: "inherit", outline: "none", color: "#0d1a2e", background: "#f5f7fa" }}
            />
            <button style={{ width: 40, height: 40, borderRadius: "50%", background: "#005eaa", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}