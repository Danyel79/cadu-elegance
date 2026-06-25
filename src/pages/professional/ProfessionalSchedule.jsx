import { useEffect, useMemo, useState } from "react";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  createProfessionalBlock,
  deleteProfessionalBlock,
  listUpcomingProfessionalBlocks,
} from "../../services/adminDataService";
import ProfessionalLayout from "./ProfessionalLayout";

const TIMES = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

function timeToMinutes(value) {
  const [h, m] = String(value).split(":").map((v) => Number(v) || 0);
  return h * 60 + m;
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA <= endB && endA >= startB;
}

function getDatesInRange(from, to) {
  const dates = [];
  const current = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function ProfessionalSchedule() {
  const { profile, loading: profileLoading } = useUserProfile();

  // Existing blocks
  const [blockedSlots, setBlockedSlots] = useState([]);

  // Mode: "single" or "range"
  const [blockMode, setBlockMode] = useState("single");

  // Single-date states
  const [selectedDate, setSelectedDate] = useState("");

  // Range states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Shared time states
  const [blockWholeDay, setBlockWholeDay] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState("08:00");
  const [selectedEndTime, setSelectedEndTime] = useState("09:00");
  const [reason, setReason] = useState("");

  // UI states
  const [saving, setSaving] = useState(false);
  const [rangeProgress, setRangeProgress] = useState(null); // { done, total }
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Keep endTime >= startTime
  useEffect(() => {
    if (!blockWholeDay && timeToMinutes(selectedEndTime) < timeToMinutes(selectedStartTime)) {
      setSelectedEndTime(selectedStartTime);
    }
  }, [selectedStartTime, selectedEndTime, blockWholeDay]);

  useEffect(() => {
    async function loadBlocks() {
      if (!profile?.$id) return;
      const res = await listUpcomingProfessionalBlocks(profile.$id);
      if (res.success) setBlockedSlots(res.data);
      else setError(res.error || "Erro ao carregar bloqueios.");
    }
    loadBlocks();
  }, [profile]);

  const sortedSlots = useMemo(() => {
    return [...blockedSlots].sort((a, b) => {
      const dc = (a.date || "").localeCompare(b.date || "");
      return dc !== 0 ? dc : (a.startTime || "").localeCompare(b.startTime || "");
    });
  }, [blockedSlots]);

  async function refreshBlocks() {
    if (!profile?.$id) return;
    const res = await listUpcomingProfessionalBlocks(profile.$id);
    if (res.success) setBlockedSlots(res.data);
  }

  // ── Save single date ──────────────────────────────────────────────────────
  async function handleAddSingle() {
    setError("");
    setSuccess("");
    if (!selectedDate) { setError("Escolha uma data para bloquear."); return; }
    if (!blockWholeDay && (!selectedStartTime || !selectedEndTime)) {
      setError("Escolha horário de início e fim ou marque 'Dia inteiro'."); return;
    }

    const startTime = blockWholeDay ? "00:00" : selectedStartTime;
    const endTime   = blockWholeDay ? "23:59" : selectedEndTime;

    if (!blockWholeDay && timeToMinutes(startTime) > timeToMinutes(endTime)) {
      setError("O horário final deve ser posterior ao horário de início."); return;
    }

    const conflict = blockedSlots.some((slot) => {
      if (slot.date !== selectedDate) return false;
      return rangesOverlap(
        timeToMinutes(startTime), timeToMinutes(endTime),
        timeToMinutes(slot.startTime || "00:00"), timeToMinutes(slot.endTime || "23:59")
      );
    });
    if (conflict) { setError("Já existe um bloqueio nesse dia ou horário."); return; }

    setSaving(true);
    const res = await createProfessionalBlock({
      professionalProfileId: profile.$id,
      professionalUserId: profile.userId,
      date: selectedDate,
      startTime,
      endTime,
      reason: reason.trim() || (blockWholeDay ? "Dia inteiro bloqueado" : "Horário bloqueado"),
    });
    setSaving(false);

    if (res.success) {
      setSelectedDate("");
      setSelectedStartTime("08:00");
      setSelectedEndTime("09:00");
      setReason("");
      setBlockWholeDay(false);
      setSuccess("Bloqueio salvo com sucesso.");
      refreshBlocks();
    } else {
      setError(res.error || "Erro ao salvar bloqueio.");
    }
  }

  // ── Save date range ───────────────────────────────────────────────────────
  async function handleAddRange() {
    setError("");
    setSuccess("");

    if (!dateFrom || !dateTo) { setError("Escolha a data de início e a data de fim."); return; }
    if (dateFrom > dateTo)    { setError("A data de início deve ser anterior ou igual à data de fim."); return; }
    if (!blockWholeDay && (!selectedStartTime || !selectedEndTime)) {
      setError("Escolha horário de início e fim ou marque 'Dia inteiro'."); return;
    }

    const startTime = blockWholeDay ? "00:00" : selectedStartTime;
    const endTime   = blockWholeDay ? "23:59" : selectedEndTime;

    if (!blockWholeDay && timeToMinutes(startTime) > timeToMinutes(endTime)) {
      setError("O horário final deve ser posterior ao horário de início."); return;
    }

    const dates = getDatesInRange(dateFrom, dateTo);
    if (dates.length > 90) { setError("O período não pode ser maior que 90 dias."); return; }

    setSaving(true);
    setRangeProgress({ done: 0, total: dates.length });

    let created = 0;
    let skipped = 0;

    for (const date of dates) {
      const conflict = blockedSlots.some((slot) => {
        if (slot.date !== date) return false;
        return rangesOverlap(
          timeToMinutes(startTime), timeToMinutes(endTime),
          timeToMinutes(slot.startTime || "00:00"), timeToMinutes(slot.endTime || "23:59")
        );
      });

      if (conflict) {
        skipped++;
      } else {
        const res = await createProfessionalBlock({
          professionalProfileId: profile.$id,
          professionalUserId: profile.userId,
          date,
          startTime,
          endTime,
          reason: reason.trim() || (blockWholeDay ? "Período bloqueado — dia inteiro" : "Período bloqueado"),
        });
        if (res.success) created++;
        else skipped++;
      }

      setRangeProgress((p) => ({ done: (p?.done || 0) + 1, total: dates.length }));
    }

    setSaving(false);
    setRangeProgress(null);

    if (created > 0) {
      setSuccess(
        `${created} dia(s) bloqueado(s)${skipped > 0 ? ` • ${skipped} ignorado(s) por conflito já existente` : ""}.`
      );
      setDateFrom("");
      setDateTo("");
      setReason("");
      setBlockWholeDay(false);
      refreshBlocks();
    } else {
      setError("Nenhum dia foi bloqueado. Verifique se já existem bloqueios no período selecionado.");
    }
  }

  async function handleRemoveSlot(blockId) {
    setError("");
    setSuccess("");
    setSaving(true);
    const res = await deleteProfessionalBlock(blockId, profile.userId);
    setSaving(false);
    if (res.success) { setSuccess("Bloqueio removido."); refreshBlocks(); }
    else setError(res.error || "Erro ao remover bloqueio.");
  }

  if (profileLoading) {
    return <ProfessionalLayout><p>Carregando perfil…</p></ProfessionalLayout>;
  }

  // Derived summary text
  const summaryText = (() => {
    const timeDesc = blockWholeDay
      ? "dia inteiro"
      : `das ${selectedStartTime} às ${selectedEndTime}`;

    if (blockMode === "single") {
      if (!selectedDate) return null;
      return `${formatDateBR(selectedDate)} — ${timeDesc}`;
    } else {
      if (!dateFrom && !dateTo) return null;
      const fromLabel = dateFrom ? formatDateBR(dateFrom) : "…";
      const toLabel   = dateTo   ? formatDateBR(dateTo)   : "…";
      const days = dateFrom && dateTo && dateFrom <= dateTo
        ? getDatesInRange(dateFrom, dateTo).length
        : null;
      return `De ${fromLabel} até ${toLabel}${days ? ` (${days} dia${days > 1 ? "s" : ""})` : ""} — ${timeDesc}`;
    }
  })();

  const canSave = blockMode === "single" ? !!selectedDate : (!!dateFrom && !!dateTo);

  return (
    <ProfessionalLayout>
      <header style={{ marginBottom: "34px" }}>
        <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px", fontSize: "11px" }}>
          Agenda de bloqueios
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 2.5vw, 3rem)", marginBottom: "12px", color: "#f6f2e8" }}>
          Bloquear horários e dias
        </h1>
        <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3", margin: 0 }}>
          Impeça novos agendamentos em dias ou períodos em que você não está disponível.
        </p>
      </header>

      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "grid", gap: "18px", maxWidth: "600px" }}>

          {/* ── Mode toggle ── */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { key: "single", label: "Data única" },
              { key: "range",  label: "Período (intervalo)" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setBlockMode(key); setError(""); setSuccess(""); }}
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  border: blockMode === key ? "1px solid #d1b76b" : "1px solid rgba(255,255,255,0.12)",
                  background: blockMode === key ? "rgba(209,183,107,0.12)" : "transparent",
                  color: blockMode === key ? "#d1b76b" : "#99907c",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: blockMode === key ? 700 : 400,
                  transition: "all 0.18s ease",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Date input(s) ── */}
          {blockMode === "single" ? (
            <label style={labelStyle}>
              <span style={labelTextStyle}>Data</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={inputStyle}
              />
            </label>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Data início</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    if (dateTo && e.target.value > dateTo) setDateTo(e.target.value);
                  }}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Data fim</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          )}

          {/* ── Whole-day toggle ── */}
          <button
            type="button"
            onClick={() => setBlockWholeDay((v) => !v)}
            className={`block-toggle${blockWholeDay ? " block-toggle--active" : ""}`}
          >
            <span className="block-toggle__indicator" />
            <span>
              <strong style={{ display: "block", marginBottom: "2px" }}>Bloquear dia inteiro</strong>
              <span style={{ fontSize: "0.82rem", opacity: 0.75 }}>
                {blockWholeDay
                  ? "Dia completo bloqueado — nenhum horário disponível"
                  : "Clique para bloquear o dia inteiro"}
              </span>
            </span>
          </button>

          {/* ── Time range (when not whole-day) ── */}
          {!blockWholeDay && (
            <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "1fr 1fr" }}>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Início do bloqueio</span>
                <select
                  value={selectedStartTime}
                  onChange={(e) => setSelectedStartTime(e.target.value)}
                  style={selectStyle}
                >
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Fim do bloqueio</span>
                <select
                  value={selectedEndTime}
                  onChange={(e) => setSelectedEndTime(e.target.value)}
                  style={selectStyle}
                >
                  {TIMES.filter((t) => timeToMinutes(t) >= timeToMinutes(selectedStartTime)).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* ── Reason ── */}
          <label style={labelStyle}>
            <span style={labelTextStyle}>Motivo (opcional)</span>
            <input
              type="text"
              placeholder="Ex: férias, folga, manutenção"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={inputStyle}
            />
          </label>

          {/* ── Summary ── */}
          {summaryText && (
            <div style={{
              padding: "14px 18px",
              borderRadius: "14px",
              background: "rgba(209,183,107,0.06)",
              border: "1px solid rgba(209,183,107,0.2)",
              color: "#beb7a3",
              fontSize: "0.9rem",
              lineHeight: 1.6,
            }}>
              <strong style={{ color: "#d1b76b" }}>Resumo: </strong>
              {summaryText}
              {reason.trim() && ` • ${reason.trim()}`}
            </div>
          )}

          {/* ── Progress bar (range mode saving) ── */}
          {rangeProgress && (
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#beb7a3" }}>
                <span>Salvando bloqueios…</span>
                <span>{rangeProgress.done}/{rangeProgress.total}</span>
              </div>
              <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.08)" }}>
                <div style={{
                  height: "6px",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #d1b76b, #f6e79d)",
                  width: `${(rangeProgress.done / rangeProgress.total) * 100}%`,
                  transition: "width 0.2s ease",
                }} />
              </div>
            </div>
          )}

          {error   && <p style={{ margin: 0, color: "#f18f01" }}>{error}</p>}
          {success && <p style={{ margin: 0, color: "#22c55e" }}>{success}</p>}

          {/* ── Save button ── */}
          <button
            type="button"
            onClick={blockMode === "single" ? handleAddSingle : handleAddRange}
            disabled={saving || !canSave}
            style={{
              padding: "16px 28px",
              borderRadius: "16px",
              border: "none",
              background: saving || !canSave ? "rgba(209,183,107,0.35)" : "#d1b76b",
              color: "#080808",
              cursor: saving || !canSave ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.04em",
              alignSelf: "flex-start",
            }}
          >
            {saving
              ? rangeProgress
                ? `Salvando… (${rangeProgress.done}/${rangeProgress.total})`
                : "Salvando…"
              : blockMode === "range"
              ? "Bloquear período"
              : blockWholeDay
              ? "Bloquear dia inteiro"
              : "Bloquear horário"}
          </button>
        </div>
      </div>

      {/* ── Current blocks list ── */}
      <section>
        <h2 style={{ marginBottom: "18px", color: "#d1b76b" }}>Bloqueios atuais</h2>
        {sortedSlots.length === 0 ? (
          <p style={{ color: "#beb7a3" }}>Não há bloqueios na sua agenda.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {sortedSlots.map((slot) => {
              const fullDay = slot.startTime === "00:00" && slot.endTime === "23:59";
              return (
                <div
                  key={slot.$id}
                  style={{
                    display: "grid",
                    gap: "10px",
                    padding: "18px",
                    borderRadius: "18px",
                    border: "1px solid rgba(209,183,107,0.18)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "18px", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: 0, color: "#beb7a3", fontSize: "12px" }}>
                        {fullDay ? "Dia inteiro bloqueado" : "Horário bloqueado"}
                      </p>
                      <strong style={{ color: "#f6f2e8", fontSize: "1rem" }}>
                        {formatDateBR(slot.date)}{fullDay ? "" : ` • ${slot.startTime}–${slot.endTime}`}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.$id)}
                      disabled={saving}
                      style={{
                        border: "1px solid rgba(209,183,107,0.25)",
                        background: "transparent",
                        color: "#d1b76b",
                        borderRadius: "12px",
                        padding: "10px 16px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Remover
                    </button>
                  </div>
                  {slot.reason && <p style={{ margin: 0, color: "#beb7a3", fontSize: "13px" }}>{slot.reason}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </ProfessionalLayout>
  );
}

const labelStyle = { display: "grid", gap: "8px" };

const labelTextStyle = {
  color: "#beb7a3",
  fontSize: "0.82rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f6f2e8",
  outline: "none",
  fontSize: "1rem",
  boxSizing: "border-box",
};

const selectStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#1a1a1a",
  color: "#f6f2e8",
  outline: "none",
  fontSize: "1rem",
  cursor: "pointer",
  appearance: "auto",
  boxSizing: "border-box",
};
