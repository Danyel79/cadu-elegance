import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  createProfessionalBlock,
  deleteProfessionalBlock,
  listUpcomingProfessionalBlocks,
} from "../../services/adminDataService";
import ProfessionalLayout from "./ProfessionalLayout";

const TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

export default function ProfessionalSchedule() {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("08:00");
  const [selectedEndTime, setSelectedEndTime] = useState("09:00");
  const [blockWholeDay, setBlockWholeDay] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const start = selectedStartTime || "08:00";
    const end = selectedEndTime || "09:00";
    if (!blockWholeDay && timeToMinutes(end) < timeToMinutes(start)) {
      setSelectedEndTime(start);
    }
  }, [selectedStartTime, selectedEndTime, blockWholeDay]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadBlocks() {
      if (!profile?.$id) return;
      const res = await listUpcomingProfessionalBlocks(profile.$id);
      if (res.success) {
        setBlockedSlots(res.data);
      } else {
        setError(res.error || "Erro ao carregar bloqueios.");
      }
    }
    loadBlocks();
  }, [profile]);

  const sortedSlots = useMemo(() => {
    return [...blockedSlots].sort((a, b) => {
      const dateCompare = (a.date || "").localeCompare(b.date || "");
      if (dateCompare !== 0) return dateCompare;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });
  }, [blockedSlots]);

  function timeToMinutes(value) {
    const [hours, minutes] = String(value).split(":").map((v) => Number(v) || 0);
    return hours * 60 + minutes;
  }

  function rangesOverlap(startA, endA, startB, endB) {
    return startA <= endB && endA >= startB;
  }

  async function refreshBlocks() {
    if (!profile?.$id) return;
    const res = await listUpcomingProfessionalBlocks(profile.$id);
    if (res.success) {
      setBlockedSlots(res.data);
    }
  }

  async function handleAddBlock() {
    setError("");
    setSuccess("");
    if (!selectedDate) {
      setError("Escolha uma data para bloquear.");
      return;
    }
    if (!blockWholeDay && (!selectedStartTime || !selectedEndTime)) {
      setError("Escolha horário de início e horário final ou marque dia inteiro.");
      return;
    }

    const startTime = blockWholeDay ? "00:00" : selectedStartTime || "08:00";
    const endTime = blockWholeDay ? "23:59" : selectedEndTime || "09:00";
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (!blockWholeDay && startMinutes > endMinutes) {
      setError("O horário final deve ser igual ou posterior ao horário de início.");
      return;
    }

    const conflict = blockedSlots.some((slot) => {
      if (slot.date !== selectedDate) return false;
      const existingStart = timeToMinutes(slot.startTime || "00:00");
      const existingEnd = timeToMinutes(slot.endTime || "23:59");
      return rangesOverlap(startMinutes, endMinutes, existingStart, existingEnd);
    });

    if (conflict) {
      setError("Já existe um bloqueio nesse dia ou horário.");
      return;
    }

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

  async function handleRemoveSlot(blockId) {
    setError("");
    setSuccess("");
    setSaving(true);
    const res = await deleteProfessionalBlock(blockId, profile.userId);
    setSaving(false);
    if (res.success) {
      setSuccess("Bloqueio removido.");
      refreshBlocks();
    } else {
      setError(res.error || "Erro ao remover bloqueio.");
    }
  }

  if (profileLoading) {
    return (
      <ProfessionalLayout>
        <p>Carregando perfil do profissional…</p>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout>
      <header style={{ marginBottom: "34px" }}>
        <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px" }}>
          Agenda de bloqueios
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 2.5vw, 3rem)",
            marginBottom: "12px",
            color: "#f6f2e8",
          }}
        >
          Bloquear horários e dias
        </h1>
        <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3" }}>
          Use esta página para impedir novos agendamentos em dias ou horários em que você não está disponível.
        </p>
      </header>

      <div style={{ display: "grid", gap: "24px", marginBottom: "28px" }}>
        <div style={{ display: "grid", gap: "18px", maxWidth: "520px" }}>
          <div style={{ display: "grid", gap: "10px" }}>
            <label style={{ color: "#beb7a3" }}>
              Data
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={{ color: "#beb7a3", display: "grid", gap: "8px" }}>
              <span>Bloquear dia inteiro</span>
              <input
                type="checkbox"
                checked={blockWholeDay}
                onChange={(event) => setBlockWholeDay(event.target.checked)}
              />
            </label>

            {!blockWholeDay && (
              <div style={{ display: "grid", gap: "12px" }}>
                <label style={{ color: "#beb7a3" }}>
                  Horário de início
                  <select value={selectedStartTime} onChange={(event) => setSelectedStartTime(event.target.value)} style={inputStyle}>
                    {TIMES.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ color: "#beb7a3" }}>
                  Horário final
                  <select value={selectedEndTime} onChange={(event) => setSelectedEndTime(event.target.value)} style={inputStyle}>
                    {TIMES.filter((time) => timeToMinutes(time) >= timeToMinutes(selectedStartTime)).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <label style={{ color: "#beb7a3" }}>
              Motivo (opcional)
              <input
                type="text"
                placeholder="Ex: horário de almoço, manutenção"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleAddBlock}
              disabled={saving}
              style={{
                padding: "14px 24px",
                borderRadius: "14px",
                border: "none",
                background: "#d1b76b",
                color: "#080808",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {saving ? "Salvando…" : "Bloquear"}
            </button>
            {success && <span style={{ color: "#22c55e" }}>{success}</span>}
          </div>

          {error && <p style={{ color: "#f18f01" }}>{error}</p>}
        </div>
      </div>

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
                    border: "1px solid rgba(209, 183, 107, 0.18)",
                    background: "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "18px", flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: 0, color: "#beb7a3" }}>
                        {fullDay ? "Dia inteiro bloqueado" : "Horário bloqueado"}
                      </p>
                      <strong style={{ color: "#f6f2e8", fontSize: "1rem" }}>
                        {slot.date} {fullDay ? "" : `• ${slot.startTime}-${slot.endTime}`}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.$id)}
                      disabled={saving}
                      style={{
                        border: "1px solid rgba(209, 183, 107, 0.25)",
                        background: "transparent",
                        color: "#d1b76b",
                        borderRadius: "12px",
                        padding: "10px 16px",
                        cursor: "pointer",
                      }}
                    >
                      Remover
                    </button>
                  </div>
                  {slot.reason && <p style={{ margin: 0, color: "#beb7a3" }}>{slot.reason}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/professional"
          style={{
            color: "#d1b76b",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Voltar para área do profissional
        </Link>
      </div>
      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
          onClick={() => signOut()}
          style={{
            border: "1px solid #d1b76b",
            background: "transparent",
            color: "#f6f2e8",
            padding: "12px 22px",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </ProfessionalLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255, 255, 255, 0.04)",
  color: "#f6f2e8",
  outline: "none",
};
