// src/context/appwriteClientExample.js
import AppwriteClient from "./appwriteClient";

async function demo() {
  const dbId = "[SEU_DATABASE_ID]";
  const collectionId = "[SUA_COLLECTION_ID]";

  const createRes = await AppwriteClient.createDocument({
    databaseId: dbId,
    collectionId,
    data: {
      title: "Meu documento",
      content: "Conteúdo de exemplo",
    },
    permissions: AppwriteClient.setDocumentReadRoleAny(),
  });

  if (!createRes.success) {
    console.error("Erro ao criar documento", createRes.error);
    return;
  }

  console.log("Documento criado", createRes.data);

  const item = await AppwriteClient.getDocument({
    databaseId: dbId,
    collectionId,
    documentId: createRes.data.$id,
  });

  console.log("Documento recuperado", item.data);
}

demo();