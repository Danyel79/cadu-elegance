import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  listProfessionals,
  listServicesCatalog,
  listBookingsForProfessional,
  listProfessionalBlocksForDate,
  createBookingRecord,
} from "../../services/adminDataService";
import ClientLayout from "./ClientLayout";

const AVAILABLE_TIMES = [
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
const DAYS_AHEAD = 14;

function formatPtBrDate(date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

function formatDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildDays() {
  return Array.from({ length: DAYS_AHEAD }, (_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() + idx);
    return {
      label: formatPtBrDate(date),
      value: formatDateInput(date),
      date,
    };
  });
}

export default function ClientBookAppointment() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [profRes, svcRes] = await Promise.all([listProfessionals(), listServicesCatalog()]);

      if (!profRes.success) {
        setError(profRes.error || "Erro ao carregar profissionais.");
      } else {
        setProfessionals(profRes.data);
      }

      if (!svcRes.success) {
        setError((prev) => prev || svcRes.error || "Erro ao carregar serviços.");
      } else {
        setServices(svcRes.data);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const [blockedSlots, setBlockedSlots] = useState([]);

  function timeToMinutes(value) {
    const [hours, minutes] = String(value).split(":").map((v) => Number(v) || 0);
    return hours * 60 + minutes;
  }

  useEffect(() => {
    if (!selectedProfessional || !selectedDate) {
      setBookedSlots([]);
      setBlockedSlots([]);
      return;
    }

    async function loadBusyTimes() {
      setError("");
      setSlotsLoading(true);
      console.log("[BOOK] loading busy times — profId:", selectedProfessional.$id, "date:", selectedDate);
      const [bookingRes, blockRes] = await Promise.all([
        listBookingsForProfessional(selectedProfessional.$id, selectedDate),
        listProfessionalBlocksForDate(selectedProfessional.$id, selectedDate),
      ]);

      console.log("[BOOK] blockRes.success:", blockRes.success, "data:", blockRes.data, "error:", blockRes.error);

      if (bookingRes.success) {
        setBookedSlots(
          bookingRes.data
            .filter((b) => (b.status || "").toUpperCase() !== "CANCELADO")
            .map((b) => b.time)
        );
      } else {
        setError(bookingRes.error || "Erro ao carregar horários ocupados.");
      }

      if (blockRes.success) {
        setBlockedSlots(blockRes.data);
      } else {
        setError((prev) => prev || blockRes.error || "Erro ao carregar bloqueios.");
      }
      setSlotsLoading(false);
    }

    loadBusyTimes();
  }, [selectedProfessional, selectedDate]);

  const professionalServices = useMemo(() => {
    if (!selectedProfessional || !Array.isArray(selectedProfessional.services)) return [];
    const allowedIds = new Set(selectedProfessional.services.map(String));
    return services.filter((svc) => allowedIds.has(String(svc.$id)));
  }, [selectedProfessional, services]);

  const blockedRanges = useMemo(() => {
    if (!blockedSlots || !selectedDate) return [];
    return blockedSlots
      .filter((slot) => slot.startTime && slot.endTime)
      .map((slot) => ({
        start: timeToMinutes(slot.startTime),
        end: timeToMinutes(slot.endTime),
      }));
  }, [blockedSlots, selectedDate]);

  const fullDayBlocked = useMemo(() => {
    return Boolean(
      blockedSlots?.some(
        (slot) => slot.startTime === "00:00" && slot.endTime === "23:59"
      )
    );
  }, [blockedSlots, selectedDate]);

  const availableTimes = useMemo(() => {
    return AVAILABLE_TIMES.filter((time) => {
      if (bookedSlots.includes(time) || fullDayBlocked) return false;
      const minutes = timeToMinutes(time);
      return !blockedRanges.some((range) => range.start <= minutes && minutes <= range.end);
    });
  }, [bookedSlots, blockedRanges, fullDayBlocked]);

  const days = useMemo(buildDays, []);

  function selectProfessional(professional) {
    setSelectedProfessional(professional);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setConfirmation(null);
  }

  function selectService(service) {
    setSelectedService(service);
    setSelectedDate("");
    setSelectedTime("");
    setConfirmation(null);
  }

  async function handleCreateBooking() {
    if (!user || !selectedProfessional || !selectedService || !selectedDate || !selectedTime) {
      setError("Selecione profissional, serviço, data e horário antes de confirmar.");
      return;
    }

    setCreating(true);
    setError("");

    const res = await createBookingRecord({
      userId: user.$id,
      professionalProfileId: selectedProfessional.$id,
      serviceId: selectedService.$id,
      date: selectedDate,
      time: selectedTime,
    });

    setCreating(false);

    if (res.success) {
      setConfirmation({
        professional: selectedProfessional.nickName || selectedProfessional.userId,
        service: selectedService.name,
        date: selectedDate,
        time: selectedTime,
      });
      setSelectedProfessional(null);
      setSelectedService(null);
      setSelectedDate("");
      setSelectedTime("");
      setBookedSlots([]);
    } else {
      setError(res.error || "Falha ao criar o agendamento.");
    }
  }

  const sectionHeadingStyle = { margin: 0, color: "#d1b76b" };

  return (
    <ClientLayout backTo="/client" backLabel="← Área do cliente">
        <header style={{ marginBottom: "42px" }}>
          <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px" }}>
            Agendamento exclusivo
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 2.8vw, 3.4rem)",
              marginBottom: "14px",
              color: "#f6f2e8",
            }}
          >
            Marcar horário com profissional
          </h1>
          <p style={{ maxWidth: "740px", lineHeight: 1.8, color: "#beb7a3" }}>
            Escolha apenas entre profissionais e serviços que já existem no sistema. Depois selecione a data e o horário disponíveis.
          </p>
        </header>

        <div style={{ display: "grid", gap: "28px" }}>
          <section style={{ display: "grid", gap: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
              <div>
                <h2 style={sectionHeadingStyle}>1. Selecione um profissional</h2>
                <p style={{ margin: "8px 0 0", color: "#beb7a3" }}>
                  Profissionais com serviços cadastrados aparecem aqui para agendar.
                </p>
              </div>
            </div>

            {loading && <p>Carregando profissionais e serviços…</p>}
            {error && <p style={{ color: "#f18f01" }}>{error}</p>}
            {!loading && professionals.length === 0 && (
              <p style={{ color: "#beb7a3" }}>Nenhum profissional cadastrado ainda.</p>
            )}

            <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {professionals.map((professional) => {
                const availableServices = Array.isArray(professional.services)
                  ? professional.services.length
                  : 0;
                const active = selectedProfessional?.$id === professional.$id;
                return (
                  <button
                    key={professional.$id}
                    type="button"
                    onClick={() => selectProfessional(professional)}
                    style={{
                      textAlign: "left",
                      borderRadius: "22px",
                      border: active ? "1px solid #d1b76b" : "1px solid rgba(209, 183, 107, 0.18)",
                      background: active ? "rgba(209, 183, 107, 0.08)" : "rgba(255,255,255,0.03)",
                      color: "inherit",
                      padding: "22px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div>
                        <h3 style={{ margin: 0, color: "#d1b76b" }}>{professional.nickName || professional.userId}</h3>
                        <p style={{ margin: "6px 0 0", color: "#beb7a3" }}>
                          {availableServices} serviço(s) atribuídos
                        </p>
                      </div>
                      <span className="material-symbols-outlined" style={{ color: "#d1b76b", fontSize: "28px" }}>
                        person
                      </span>
                    </div>
                    <p style={{ margin: 0, color: "#beb7a3" }}>
                      {professional.roles?.length ? professional.roles.join(", ") : null}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedProfessional && (
            <section style={{ display: "grid", gap: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                <div>
                  <h2 style={sectionHeadingStyle}>2. Selecione o serviço</h2>
                  <p style={{ margin: "8px 0 0", color: "#beb7a3" }}>
                    Apenas serviços atribuídos ao profissional aparecem aqui.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => selectProfessional(null)}
                  style={{
                    border: "1px solid rgba(209, 183, 107, 0.24)",
                    background: "transparent",
                    color: "#d1b76b",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  Mudar profissional
                </button>
              </div>

              {professionalServices.length === 0 ? (
                <p style={{ color: "#beb7a3" }}>
                  Este profissional não tem serviços atribuídos ou os serviços correspondentes não existem mais.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                  {professionalServices.map((service) => {
                    const active = selectedService?.$id === service.$id;
                    return (
                      <button
                        key={service.$id}
                        type="button"
                        onClick={() => selectService(service)}
                        style={{
                          textAlign: "left",
                          borderRadius: "22px",
                          border: active ? "1px solid #d1b76b" : "1px solid rgba(209, 183, 107, 0.18)",
                          background: active ? "rgba(209, 183, 107, 0.08)" : "rgba(255,255,255,0.03)",
                          color: "inherit",
                          padding: "22px",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <h3 style={{ margin: 0, color: "#d1b76b" }}>{service.name}</h3>
                          <strong style={{ color: "#d1b76b" }}>
                            {Number(service.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </strong>
                        </div>
                        <p style={{ margin: 0, color: "#beb7a3" }}>
                          {service.description || "Serviço cadastrado pelo administrador."}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {selectedService && (
            <section style={{ display: "grid", gap: "18px" }}>
              <h2 style={sectionHeadingStyle}>3. Selecione data e horário</h2>
              <p style={{ margin: "8px 0 0", color: "#beb7a3" }}>
                Escolha o dia e horário disponíveis para o profissional.
              </p>

              <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                {days.map((day) => {
                  const isSelected = selectedDate === day.value;
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => { setSelectedDate(day.value); setSelectedTime(""); }}
                      className={`day-btn${isSelected ? " day-btn--selected" : ""}`}
                    >
                      <span style={{ display: "block", color: "#beb7a3", marginBottom: "6px" }}>{day.label}</span>
                      <strong>{day.date.toLocaleDateString("pt-BR")}</strong>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div>
                  <p style={{ margin: "18px 0 8px", color: "#beb7a3" }}>
                    Horários disponíveis em {selectedDate}
                  </p>
                  {slotsLoading ? (
                    <p style={{ color: "#beb7a3" }}>Verificando horários…</p>
                  ) : availableTimes.length === 0 ? (
                    <p style={{ color: "#f18f01" }}>
                      Nenhum horário livre para este dia. Escolha outra data.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`time-slot-btn${selectedTime === time ? " time-slot-btn--selected" : ""}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {selectedDate && selectedTime && (
            <section style={{ padding: "24px", borderRadius: "24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(209, 183, 107, 0.18)" }}>
              <h2 style={sectionHeadingStyle}>4. Confirme o agendamento</h2>
              <div style={{ display: "grid", gap: "10px", marginTop: "18px", color: "#beb7a3" }}>
                <span>Profissional: {selectedProfessional.nickName || selectedProfessional.userId}</span>
                <span>Serviço: {selectedService.name}</span>
                <span>Data: {selectedDate}</span>
                <span>Horário: {selectedTime}</span>
              </div>
              <button
                type="button"
                onClick={handleCreateBooking}
                disabled={creating}
                style={{
                  marginTop: "24px",
                  background: "#d1b76b",
                  color: "#080808",
                  border: "none",
                  borderRadius: "16px",
                  padding: "16px 24px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {creating ? "Confirmando…" : "Confirmar agendamento"}
              </button>
            </section>
          )}

          {confirmation && (
            <section style={{ padding: "24px", borderRadius: "24px", background: "rgba(209, 183, 107, 0.08)", border: "1px solid #d1b76b" }}>
              <h2 style={{ margin: 0, color: "#080808" }}>Agendamento confirmado</h2>
              <p style={{ margin: "14px 0 0", color: "#080808" }}>
                Seu horário foi reservado com {confirmation.professional} para o serviço {confirmation.service} em {confirmation.date} às {confirmation.time}.
              </p>
              <Link
                to="/client/bookings"
                style={{
                  display: "inline-flex",
                  marginTop: "20px",
                  color: "#080808",
                  background: "#f6f2e8",
                  padding: "12px 20px",
                  borderRadius: "14px",
                  textDecoration: "none",
                  fontWeight: "700",
                }}
              >
                Ver meus agendamentos
              </Link>
            </section>
          )}

        </div>
    </ClientLayout>
  );
}
