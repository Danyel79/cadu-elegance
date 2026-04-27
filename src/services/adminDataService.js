/**
 * Dados admin (Appwrite).
 * Permissões de documentos usam apenas roles suportadas pelo projeto (ex.: users, user:id).
 * `Role.label()` não está disponível em todos os planos/configurações — evitar nesse cliente.
 */
import { databases } from "../context/appwriteConfig";
import { ID, Permission, Query, Role } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "";
const USER_PROFILE_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_USER_PROFILE_COLLECTION_ID || "";
const SERVICES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_SERVICES_COLLECTION_ID || "";
const BOOKINGS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_BOOKINGS_COLLECTION_ID || "";

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
export function isProfessionalProfile(profile) {
  if (!profile?.roles?.length) return false;
  return profile.roles.some((r) => String(r).toLowerCase() === "profissional");
}

export async function listProfessionals() {
  // if (!DATABASE_ID || !USER_PROFILE_COLLECTION_ID) {
  //   return { success: false, error: "Defina VITE_APPWRITE_DATABASE_ID e VITE_APPWRITE_USER_PROFILE_COLLECTION_ID no .env.", data: [] };
  // }
  try {
    const res = await databases.listDocuments(DATABASE_ID, USER_PROFILE_COLLECTION_ID, [
      Query.equal("roles", "profissional"),
      Query.orderAsc("nickName"),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao listar profissionais.", data: [] };
  }
}

export async function listBookingsForUser(userId) {
  // if (!DATABASE_ID || !BOOKINGS_COLLECTION_ID) {
  //   return { success: false, error: "Defina VITE_APPWRITE_DATABASE_ID e VITE_APPWRITE_BOOKINGS_COLLECTION_ID no .env.", data: [] };
  // }
  try {
    const res = await databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao listar agendamentos.", data: [] };
  }
}

export async function listBookingsForProfessional(professionalProfileId, date) {
  // if (!DATABASE_ID || !BOOKINGS_COLLECTION_ID) {
  //   return { success: false, error: "Defina VITE_APPWRITE_DATABASE_ID e VITE_APPWRITE_BOOKINGS_COLLECTION_ID no .env.", data: [] };
  // }
  try {
    const res = await databases.listDocuments(DATABASE_ID, BOOKINGS_COLLECTION_ID, [
      Query.equal("professionalProfileId", professionalProfileId),
      Query.equal("date", date),
      Query.limit(500),
    ]);
    return { success: true, data: res.documents };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao listar horários ocupados.", data: [] };
  }
}

export async function createBookingRecord({
  userId,
  professionalProfileId,
  professionalUserId,
  professionalLabel,
  serviceId,
  serviceName,
  servicePrice,
  date,
  time,
}) {
  // if (!DATABASE_ID || !BOOKINGS_COLLECTION_ID) {
  //   return { success: false, error: "Defina VITE_APPWRITE_DATABASE_ID e VITE_APPWRITE_BOOKINGS_COLLECTION_ID no .env." };
  // }

  if (!userId || !professionalProfileId || !serviceId || !date || !time) {
    return { success: false, error: "Dados incompletos para criar o agendamento." };
  }

  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      BOOKINGS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        professionalProfileId,
        professionalUserId,
        professionalLabel,
        serviceId,
        serviceName,
        servicePrice,
        date,
        time,
        status: "confirmado",
      },
      [
        Permission.read(Role.user(userId)),
        Permission.write(Role.user(userId)),
      ]
    );
    return { success: true, data: doc };
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

export function serviceIdsEqual(a, b) {
  const na = [...(a || [])].map(String).sort().join("|");
  const nb = [...(b || [])].map(String).sort().join("|");
  return na === nb;
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

export async function updateUserProfileRoles(documentId, roles, { services } = {}) {
  if (!DATABASE_ID || !USER_PROFILE_COLLECTION_ID) {
    return { success: false, error: "Variáveis de base de dados em falta no .env." };
  }
  const normalized = normalizeRolesSelection(roles);
  const hasProfissional = normalized.includes("profissional");
  const nextServices = hasProfissional ? (Array.isArray(services) ? services : []) : [];
  try {
    await databases.updateDocument(
      DATABASE_ID,
      USER_PROFILE_COLLECTION_ID,
      documentId,
      {
        roles: normalized,
        services: nextServices,
      }
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
