/**
 * Dados admin (Appwrite).
 * Permissões de documentos usam apenas roles suportadas pelo projeto (ex.: users, user:id).
 * `Role.label()` não está disponível em todos os planos/configurações — evitar nesse cliente.
 */
import { account, databases } from "../context/appwriteConfig";
import { ID, Permission, Query, Role } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "";
const USER_PROFILE_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_USER_PROFILE_COLLECTION_ID || "";
const SERVICES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_SERVICES_COLLECTION_ID || "";
const BOOKINGS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_BOOKINGS_COLLECTION_ID || "";
const BLOCKS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_BLOCKS_COLLECTION_ID || "bloqueios";
const BLOCKS_FIELDS = {
  professionalProfileId:
    import.meta.env.VITE_APPWRITE_BLOCKS_FIELD_PROFESSIONAL_PROFILE || "profissionalId",
  professionalUserId:
    import.meta.env.VITE_APPWRITE_BLOCKS_FIELD_PROFESSIONAL_USER || null,
  date: import.meta.env.VITE_APPWRITE_BLOCKS_FIELD_DATE || "data",
  startTime: import.meta.env.VITE_APPWRITE_BLOCKS_FIELD_START_TIME || "horaInicio",
  endTime: import.meta.env.VITE_APPWRITE_BLOCKS_FIELD_END_TIME || "horaFim",
  reason: import.meta.env.VITE_APPWRITE_BLOCKS_FIELD_REASON || "motivo",
};

/**
 * Nomes dos atributos na coleção de agendamentos (Console → Attributes).
 * Schema agenda-loja (coleção agendamentos): clienteId, profissionalId, servicoId, data (datetime), hora, status.
 * Sobrescreva com VITE_APPWRITE_BOOKINGS_FIELD_* se o projeto usar outros keys.
 */
const BOOKING_FIELDS = {
  userId: import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_USER_ID || "clienteId",
  professionalProfileId:
    import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_PROFESSIONAL_PROFILE || "profissionalId",
  professionalUserId:
    import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_PROFESSIONAL_USER || "professionalUserId",
  professionalLabel:
    import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_PROFESSIONAL_LABEL || "professionalLabel",
  serviceId: import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_SERVICE_ID || "servicoId",
  serviceName: import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_SERVICE_NAME || "serviceName",
  servicePrice: import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_SERVICE_PRICE || "servicePrice",
  date: import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_DATE || "data",
  time: import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_TIME || "hora",
  status: import.meta.env.VITE_APPWRITE_BOOKINGS_FIELD_STATUS || "status",
};

const BOOKING_STATUS_CREATE =
  import.meta.env.VITE_APPWRITE_BOOKINGS_STATUS_DEFAULT || "AGENDADO";

/** ISO datetime local para o atributo `data` (datetime no Appwrite). */
function bookingDateTimeForSchema(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = (timeStr || "12:00").split(":").map((x) => Number(x) || 0);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
}

/** Início e fim do dia local em ISO, para filtrar por `data` (datetime). */
function localDayRangeIso(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return [start.toISOString(), end.toISOString()];
}

/** Expõe campos do documento com as chaves que o UI espera (camelCase da app). */
function mapBookingDocument(doc) {
  if (!doc) return doc;
  const rawDt = doc[BOOKING_FIELDS.date];
  let dateForUi = rawDt;
  let dateIso = rawDt;
  if (rawDt != null && rawDt !== "") {
    const parsed = new Date(rawDt);
    if (!Number.isNaN(parsed.getTime())) {
      dateForUi = parsed.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        weekday: "short",
      });
      dateIso = parsed.toISOString().slice(0, 10);
    }
  }
  const sid = doc[BOOKING_FIELDS.serviceId];
  const pid = doc[BOOKING_FIELDS.professionalProfileId];
  return {
    ...doc,
    userId: doc[BOOKING_FIELDS.userId],
    professionalProfileId: pid,
    professionalUserId: doc[BOOKING_FIELDS.professionalUserId],
    professionalLabel: doc[BOOKING_FIELDS.professionalLabel] ?? pid,
    serviceId: sid,
    serviceName: doc[BOOKING_FIELDS.serviceName] ?? (sid != null ? String(sid) : undefined),
    servicePrice: doc[BOOKING_FIELDS.servicePrice],
    date: dateForUi,
    dateIso,
    time: doc[BOOKING_FIELDS.time],
    status: doc[BOOKING_FIELDS.status],
  };
}

function normalizeBlockDate(value) {
  if (!value) return value;
  return String(value).slice(0, 10);
}

function mapBlockDocument(doc) {
  if (!doc) return doc;
  return {
    ...doc,
    professionalProfileId: doc[BLOCKS_FIELDS.professionalProfileId],
    professionalUserId:
      BLOCKS_FIELDS.professionalUserId != null
        ? doc[BLOCKS_FIELDS.professionalUserId]
        : undefined,
    date: normalizeBlockDate(doc[BLOCKS_FIELDS.date]),
    startTime: doc[BLOCKS_FIELDS.startTime],
    endTime: doc[BLOCKS_FIELDS.endTime],
    reason: doc[BLOCKS_FIELDS.reason],
  };
}

/** Mensagens para 401 em listagens da coleção de agendamentos. */
function formatBookingsListError(e, fallback) {
  const raw = (e && e.message) || "";
  const coll =
    BOOKINGS_COLLECTION_ID ||
    "(defina VITE_APPWRITE_BOOKINGS_COLLECTION_ID no .env)";
  if (raw.includes("collections.read") || raw.includes("general_unauthorized_scope")) {
    return (
      "Este build pede a coleção «" +
      coll +
      "» na API do Appwrite. Se na consola o ID da coleção for outro (ex.: «agendamentos»), " +
      "altere VITE_APPWRITE_BOOKINGS_COLLECTION_ID no ficheiro .env para coincidir exactamente com Settings → Name na coleção. " +
      "Depois reinicie o Vite (npm run dev). " +
      "Se o ID já for o correcto: Databases → essa coleção → Permissions → Read para Users."
    );
  }
  return raw || fallback;
}

const APP_ROLES = ["admin", "profissional", "client"];

const ROLE_SORT_ORDER = { admin: 0, profissional: 1, client: 2 };

/** Normaliza para array único, válido e ordenado (mínimo `client` se vazio). */
export function normalizeRolesSelection(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return ["client"];
  const set = new Set();
  for (const r of roles) {
    const x = String(r).toLowerCase();
    if (APP_ROLES.includes(x)) set.add(x);
  }
  if (set.size === 0) return ["client"];
  return [...set].sort((a, b) => (ROLE_SORT_ORDER[a] ?? 9) - (ROLE_SORT_ORDER[b] ?? 9));
}

export function rolesSelectionEqual(storedRoles, draftRoles) {
  const a = normalizeRolesSelection(storedRoles).join("|");
  const b = normalizeRolesSelection(draftRoles).join("|");
  return a === b;
}

export function isAdminProfile(profile) {
  if (!profile?.roles?.length) return false;
  return profile.roles.some((r) => String(r).toLowerCase() === "admin");
}

export function isProfessionalProfile(profile) {
  if (!profile?.roles?.length) return false;
  return profile.roles.some((r) => String(r).toLowerCase() === "profissional");
}

export async function getMyUserProfile(userId) {
  if (!DATABASE_ID || !USER_PROFILE_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env." };
  }
  try {
    const res = await databases.listDocuments(DATABASE_ID, USER_PROFILE_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    const doc = res.documents[0];
    if (!doc) return { success: false, error: "Perfil não encontrado." };
    return { success: true, data: doc };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao carregar perfil.",
    };
  }
}

export async function listProfessionals() {
  try {
    const res = await databases.listDocuments(DATABASE_ID, USER_PROFILE_COLLECTION_ID, [
      Query.contains("roles", "profissional"),
      Query.orderAsc("nickName"),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao listar profissionais.", data: [] };
  }
}

export async function listBookingsForUser(userId) {
  try {
    const res = await databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION_ID, [
      Query.equal(BOOKING_FIELDS.userId, userId),
      Query.orderDesc("$createdAt"),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents.map(mapBookingDocument) };
  } catch (e) {
    return {
      success: false,
      error: formatBookingsListError(e, "Erro ao listar agendamentos."),
      data: [],
    };
  }
}

export async function listBookingsForProfessional(professionalProfileId, date) {
  try {
    const [dayStart, dayEnd] = localDayRangeIso(date);
    const res = await databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION_ID, [
      Query.equal(BOOKING_FIELDS.professionalProfileId, professionalProfileId),
      Query.greaterThanEqual(BOOKING_FIELDS.date, dayStart),
      Query.lessThanEqual(BOOKING_FIELDS.date, dayEnd),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents.map(mapBookingDocument) };
  } catch (e) {
    return {
      success: false,
      error: formatBookingsListError(e, "Erro ao listar horários ocupados."),
      data: [],
    };
  }
}

export async function listBookingsForProfessionalSchedule(professionalProfileId) {
  if (!DATABASE_ID || !BOOKINGS_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env.", data: [] };
  }

  try {
    const res = await databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION_ID, [
      Query.equal(BOOKING_FIELDS.professionalProfileId, professionalProfileId),
      Query.greaterThanEqual(BOOKING_FIELDS.date, (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString(); })()),
      Query.orderAsc(BOOKING_FIELDS.date),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents.map(mapBookingDocument) };
  } catch (e) {
    return {
      success: false,
      error: formatBookingsListError(e, "Erro ao listar agendamentos do profissional."),
      data: [],
    };
  }
}

export async function listAllBookings() {
  if (!DATABASE_ID || !BOOKINGS_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env.", data: [] };
  }

  try {
    const res = await databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION_ID, [
      Query.orderDesc(BOOKING_FIELDS.date),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents.map(mapBookingDocument) };
  } catch (e) {
    return {
      success: false,
      error: formatBookingsListError(e, "Erro ao listar todos os agendamentos."),
      data: [],
    };
  }
}

export async function listProfessionalBlocksForDate(professionalProfileId, date) {
  if (!DATABASE_ID || !BLOCKS_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env.", data: [] };
  }

  try {
    const [y, m, d] = date.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    const nextDayStr = [
      next.getFullYear(),
      String(next.getMonth() + 1).padStart(2, "0"),
      String(next.getDate()).padStart(2, "0"),
    ].join("-");

    const res = await databases.listDocuments(DATABASE_ID, BLOCKS_COLLECTION_ID, [
      Query.equal(BLOCKS_FIELDS.professionalProfileId, professionalProfileId),
      Query.greaterThanEqual(BLOCKS_FIELDS.date, date),
      Query.lessThan(BLOCKS_FIELDS.date, nextDayStr),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents.map(mapBlockDocument) };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao listar bloqueios do profissional.",
      data: [],
    };
  }
}

export async function listUpcomingProfessionalBlocks(professionalProfileId) {
  if (!DATABASE_ID || !BLOCKS_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env.", data: [] };
  }

  try {
    const todaysDate = new Date().toISOString().slice(0, 10);
    const res = await databases.listDocuments(DATABASE_ID, BLOCKS_COLLECTION_ID, [
      Query.equal(BLOCKS_FIELDS.professionalProfileId, professionalProfileId),
      Query.greaterThanEqual(BLOCKS_FIELDS.date, todaysDate),
      Query.orderAsc(BLOCKS_FIELDS.date),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents.map(mapBlockDocument) };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao listar bloqueios do profissional.",
      data: [],
    };
  }
}

export async function createProfessionalBlock({ professionalProfileId, professionalUserId, date, startTime, endTime, reason }) {
  if (!DATABASE_ID || !BLOCKS_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env." };
  }

  if (!professionalProfileId || !professionalUserId || !date || !startTime || !endTime) {
    return { success: false, error: "Dados incompletos para criar bloqueio." };
  }

  try {
    const docData = {
      [BLOCKS_FIELDS.professionalProfileId]: professionalProfileId,
      [BLOCKS_FIELDS.date]: date,
      [BLOCKS_FIELDS.startTime]: startTime,
      [BLOCKS_FIELDS.endTime]: endTime,
      [BLOCKS_FIELDS.reason]: reason,
    };

    if (BLOCKS_FIELDS.professionalUserId) {
      docData[BLOCKS_FIELDS.professionalUserId] = professionalUserId;
    }

    const doc = await databases.createDocument(
      DATABASE_ID,
      BLOCKS_COLLECTION_ID,
      ID.unique(),
      docData,
      [
        Permission.read(Role.users()),
        Permission.write(Role.user(professionalUserId)),
        Permission.update(Role.user(professionalUserId)),
        Permission.delete(Role.user(professionalUserId)),
      ]
    );
    return { success: true, data: mapBlockDocument(doc) };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao criar bloqueio." };
  }
}

export async function deleteProfessionalBlock(blockId, professionalUserId) {
  if (!DATABASE_ID || !BLOCKS_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env." };
  }

  try {
    await databases.deleteDocument(DATABASE_ID, BLOCKS_COLLECTION_ID, blockId);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao remover bloqueio." };
  }
}

export async function updateBookingStatus(bookingId, status) {
  if (!DATABASE_ID || !BOOKINGS_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env." };
  }
  try {
    await databases.updateDocument(DATABASE_ID, BOOKINGS_COLLECTION_ID, bookingId, {
      [BOOKING_FIELDS.status]: status,
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao atualizar status do agendamento." };
  }
}

export async function createBookingRecord({ userId, professionalProfileId, serviceId, date, time }) {
  if (!userId || !professionalProfileId || !serviceId || !date || !time) {
    return { success: false, error: "Dados incompletos para criar o agendamento." };
  }

  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      BOOKINGS_COLLECTION_ID,
      ID.unique(),
      {
        [BOOKING_FIELDS.userId]: userId,
        [BOOKING_FIELDS.professionalProfileId]: professionalProfileId,
        [BOOKING_FIELDS.serviceId]: serviceId,
        [BOOKING_FIELDS.date]: bookingDateTimeForSchema(date, time),
        [BOOKING_FIELDS.time]: time,
        [BOOKING_FIELDS.status]: BOOKING_STATUS_CREATE,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.write(Role.user(userId)),
      ]
    );
    return { success: true, data: mapBookingDocument(doc) };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao criar agendamento." };
  }
}
export async function getUserProfileDocument(documentId) {
  if (!DATABASE_ID || !USER_PROFILE_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env." };
  }
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      USER_PROFILE_COLLECTION_ID,
      documentId
    );
    return { success: true, data: doc };
  } catch (e) {
    return { success: false, error: e.message || "Perfil não encontrado." };
  }
}

export async function listServicesCatalog() {
  if (!DATABASE_ID || !SERVICES_COLLECTION_ID) {
    return { success: false, error: "Defina VITE_APPWRITE_SERVICES_COLLECTION_ID no .env.", data: [] };
  }
  try {
    const res = await databases.listDocuments(DATABASE_ID, SERVICES_COLLECTION_ID, [
      Query.limit(500),
    ]);
    const sorted = [...res.documents].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), "pt")
    );
    return { success: true, data: sorted };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao listar serviços.",
      data: [],
    };
  }
}

export async function updateServiceRecord(documentId, { name, description, price }) {
  if (!DATABASE_ID || !SERVICES_COLLECTION_ID) {
    return { success: false, error: "Defina VITE_APPWRITE_SERVICES_COLLECTION_ID no .env." };
  }
  const p = typeof price === "number" ? price : Number(String(price).replace(",", "."));
  if (!name?.trim() || !description?.trim() || Number.isNaN(p)) {
    return { success: false, error: "Preencha nome, descrição e preço válido." };
  }
  try {
    await databases.updateDocument(DATABASE_ID, SERVICES_COLLECTION_ID, documentId, {
      name: name.trim(),
      description: description.trim(),
      price: p,
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao atualizar serviço." };
  }
}

export async function deleteServiceRecord(documentId) {
  if (!DATABASE_ID || !SERVICES_COLLECTION_ID) {
    return { success: false, error: "Defina VITE_APPWRITE_SERVICES_COLLECTION_ID no .env." };
  }
  try {
    await databases.deleteDocument(DATABASE_ID, SERVICES_COLLECTION_ID, documentId);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao excluir serviço." };
  }
}

export function serviceIdsEqual(a, b) {
  const na = [...(a || [])].map(String).sort().join("|");
  const nb = [...(b || [])].map(String).sort().join("|");
  return na === nb;
}

export async function adminCreateUser({ name, email, password, role }) {
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return { success: false, error: "Nome, email e senha são obrigatórios." };
  }
  if (!DATABASE_ID || !USER_PROFILE_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env." };
  }

  const normalizedRole =
    role === "admin" ? "admin" : role === "profissional" ? "profissional" : "client";

  try {
    const newUser = await account.create({
      userId: ID.unique(),
      email: email.trim(),
      password: password.trim(),
      name: name.trim(),
    });

    await databases.createDocument(
      DATABASE_ID,
      USER_PROFILE_COLLECTION_ID,
      ID.unique(),
      {
        userId: newUser.$id,
        nickName: name.trim(),
        roles: [normalizedRole],
        services: [],
      },
      [
        Permission.read(Role.user(newUser.$id)),
        Permission.update(Role.user(newUser.$id)),
      ]
    );

    return { success: true, data: newUser };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao criar usuário." };
  }
}

export async function listUserProfiles() {
  if (!DATABASE_ID || !USER_PROFILE_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env.", data: [] };
  }
  try {
    const res = await databases.listDocuments(DATABASE_ID, USER_PROFILE_COLLECTION_ID, [
      Query.orderDesc("$createdAt"),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao listar perfis.",
      data: [],
    };
  }
}

export async function updateUserProfileRoles(documentId, roles, { services, nickName, phone } = {}) {
  if (!DATABASE_ID || !USER_PROFILE_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env." };
  }
  const normalized = normalizeRolesSelection(roles);
  const hasProfissional = normalized.includes("profissional");
  const nextServices = hasProfissional ? (Array.isArray(services) ? services : []) : [];
  const data = {
    roles: normalized,
    services: nextServices,
  };
  if (typeof nickName === "string") {
    data.nickName = nickName.trim();
  }
  if (typeof phone === "string") {
    data.phone = phone.trim();
  }
  try {
    await databases.updateDocument(
      DATABASE_ID,
      USER_PROFILE_COLLECTION_ID,
      documentId,
      data
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao atualizar permissões." };
  }
}

export async function createServiceRecord({ name, description, price }) {
  if (!DATABASE_ID || !SERVICES_COLLECTION_ID) {
    return { success: false, error: "Defina VITE_APPWRITE_SERVICES_COLLECTION_ID no .env." };
  }
  const p = typeof price === "number" ? price : Number(String(price).replace(",", "."));
  if (!name?.trim() || !description?.trim() || Number.isNaN(p)) {
    return { success: false, error: "Preencha nome, descrição e preço válido." };
  }
  try {
    await databases.createDocument(
      DATABASE_ID,
      SERVICES_COLLECTION_ID,
      ID.unique(),
      {
        name: name.trim(),
        description: description.trim(),
        price: p,
      },
      [
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao criar serviço." };
  }
}
