import { databases } from "../context/appwriteConfig";
import { ID, Permission, Query, Role } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "";
const GALLERY_GROUPS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_GALLERY_GROUPS_COLLECTION_ID || "";

const MISSING_ENV_ERROR = "Defina VITE_APPWRITE_GALLERY_GROUPS_COLLECTION_ID no .env.";

export async function listGalleryGroups() {
  if (!DATABASE_ID || !GALLERY_GROUPS_COLLECTION_ID) {
    return { success: false, error: MISSING_ENV_ERROR, data: [] };
  }
  try {
    const res = await databases.listDocuments(DATABASE_ID, GALLERY_GROUPS_COLLECTION_ID, [
      Query.orderAsc("ordem"),
      Query.limit(100),
    ]);
    return { success: true, data: res.documents };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao carregar galerias.", data: [] };
  }
}

export async function createGalleryGroup({ titulo, ordem }) {
  if (!DATABASE_ID || !GALLERY_GROUPS_COLLECTION_ID) {
    return { success: false, error: MISSING_ENV_ERROR };
  }
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      GALLERY_GROUPS_COLLECTION_ID,
      ID.unique(),
      { titulo: titulo.trim(), fotos: [], ordem },
      [Permission.read(Role.any())]
    );
    return { success: true, data: doc };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao criar fileira." };
  }
}

export async function updateGalleryGroup(id, fields) {
  if (!DATABASE_ID || !GALLERY_GROUPS_COLLECTION_ID) {
    return { success: false, error: MISSING_ENV_ERROR };
  }
  try {
    await databases.updateDocument(DATABASE_ID, GALLERY_GROUPS_COLLECTION_ID, id, fields);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao atualizar fileira." };
  }
}

export async function deleteGalleryGroup(id) {
  if (!DATABASE_ID || !GALLERY_GROUPS_COLLECTION_ID) {
    return { success: false, error: MISSING_ENV_ERROR };
  }
  try {
    await databases.deleteDocument(DATABASE_ID, GALLERY_GROUPS_COLLECTION_ID, id);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao excluir fileira." };
  }
}
