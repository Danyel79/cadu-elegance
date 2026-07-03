import { databases, storage } from "../context/appwriteConfig";
import { ID, Permission, Query, Role } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "";
const PRODUCTS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || "produtos";
const BUCKET_ID =
  import.meta.env.VITE_APPWRITE_PRODUCTS_BUCKET_ID || "produto-imagens";

/** Mapeia documento Appwrite → objeto usado na UI */
function mapProduct(doc) {
  if (!doc) return doc;
  return {
    ...doc,
    // aliases em português para uso simples no JSX
    name: doc.nome,
    category: doc.categoria,
    price: doc.preco,
    stock: doc.estoque,
    active: doc.ativo,
    imageId: doc.fotoFileId,
  };
}

export async function listProducts({ category, activeOnly = true } = {}) {
  try {
    const queries = [Query.orderAsc("nome"), Query.limit(500)];
    if (activeOnly) queries.push(Query.equal("ativo", true));
    if (category && category !== "all")
      queries.push(Query.equal("categoria", category));
    const res = await databases.listDocuments(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      queries
    );
    return { success: true, data: res.documents.map(mapProduct) };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao listar produtos.",
      data: [],
    };
  }
}

export async function listAllProductsAdmin() {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      [Query.orderAsc("nome"), Query.limit(500)]
    );
    return { success: true, data: res.documents.map(mapProduct) };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao listar produtos.",
      data: [],
    };
  }
}

export async function createProduct({ name, category, price, stock, imageId }) {
  if (!name?.trim() || price == null) {
    return { success: false, error: "Nome e preço são obrigatórios." };
  }
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      ID.unique(),
      {
        nome: name.trim(),
        categoria: category?.trim() || "",
        preco: Number(String(price).replace(",", ".")),
        estoque: Number(stock) || 0,
        ativo: true,
        fotoFileId: imageId || null,
      },
      [Permission.read(Role.users())]
    );
    return { success: true, data: mapProduct(doc) };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao criar produto." };
  }
}

export async function updateProduct(productId, data) {
  // Converte aliases UI → campos Appwrite se necessário
  const payload = {};
  if (data.name !== undefined) payload.nome = data.name;
  if (data.nome !== undefined) payload.nome = data.nome;
  if (data.category !== undefined) payload.categoria = data.category;
  if (data.categoria !== undefined) payload.categoria = data.categoria;
  if (data.price !== undefined) payload.preco = Number(data.price);
  if (data.preco !== undefined) payload.preco = Number(data.preco);
  if (data.stock !== undefined) payload.estoque = Number(data.stock);
  if (data.estoque !== undefined) payload.estoque = Number(data.estoque);
  if (data.active !== undefined) payload.ativo = data.active;
  if (data.ativo !== undefined) payload.ativo = data.ativo;
  if (data.imageId !== undefined) payload.fotoFileId = data.imageId;
  if (data.fotoFileId !== undefined) payload.fotoFileId = data.fotoFileId;
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      productId,
      payload
    );
    return { success: true, data: mapProduct(doc) };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao atualizar produto." };
  }
}

export async function deleteProduct(productId) {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      productId
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao deletar produto." };
  }
}

export async function uploadProductImage(file) {
  try {
    const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file, [
      Permission.read(Role.any()),   // imagens de produto são públicas
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ]);
    return { success: true, fileId: uploaded.$id };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao fazer upload da imagem.",
    };
  }
}

export function getProductImagePreviewUrl(fileId) {
  if (!fileId) return null;
  // Usa o endpoint "view" (não o "preview") — transformações de imagem
  // ficam bloqueadas (403) no plano gratuito do Appwrite Cloud.
  const endpoint = (
    import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  ).replace(/\/$/, "");
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || "";
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
}

export async function listCategories() {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      [Query.limit(500)]
    );
    const cats = [
      ...new Set(res.documents.map((d) => d.categoria).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, "pt"));
    return { success: true, data: cats };
  } catch {
    return { success: true, data: [] };
  }
}
