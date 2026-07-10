import { databases } from "../context/appwriteConfig";
import { ID, Permission, Query, Role } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "";
const SITE_CONTENT_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_SITE_CONTENT_COLLECTION_ID || "";

export async function getSiteContent() {
  if (!DATABASE_ID || !SITE_CONTENT_COLLECTION_ID) {
    return {
      success: false,
      error: "Defina VITE_APPWRITE_SITE_CONTENT_COLLECTION_ID no .env.",
      data: null,
    };
  }
  try {
    const res = await databases.listDocuments(DATABASE_ID, SITE_CONTENT_COLLECTION_ID, [
      Query.limit(1),
    ]);
    return { success: true, data: res.documents[0] || null };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao carregar conteúdo institucional.",
      data: null,
    };
  }
}

export async function saveSiteContent(existingId, fields) {
  if (!DATABASE_ID || !SITE_CONTENT_COLLECTION_ID) {
    return { success: false, error: "Defina VITE_APPWRITE_SITE_CONTENT_COLLECTION_ID no .env." };
  }
  try {
    if (existingId) {
      await databases.updateDocument(DATABASE_ID, SITE_CONTENT_COLLECTION_ID, existingId, fields);
    } else {
      await databases.createDocument(
        DATABASE_ID,
        SITE_CONTENT_COLLECTION_ID,
        ID.unique(),
        fields,
        [Permission.read(Role.any())]
      );
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao salvar conteúdo institucional." };
  }
}
