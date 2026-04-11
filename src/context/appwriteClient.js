// src/context/appwriteClient.js
import { ID, Permission, Role } from "appwrite";
import { databases, storage, teams } from "./appwriteConfig";

const AppwriteClient = {
  databases,
  storage,
  teams,

  // Utilizar backup com ID único no Appwrite (quando tiver variável de ambiente).
  createDocument: async ({ databaseId, collectionId, data, permissions = [] }) => {
    try {
      const doc = await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        data,
        permissions
      );
      return { success: true, data: doc };
    } catch (error) {
      return { success: false, error, message: error.message || "Erro ao criar documento." };
    }
  },

  getDocument: async ({ databaseId, collectionId, documentId }) => {
    try {
      const doc = await databases.getDocument(databaseId, collectionId, documentId);
      return { success: true, data: doc };
    } catch (error) {
      return { success: false, error, message: error.message || "Erro ao buscar documento." };
    }
  },

  updateDocument: async ({ databaseId, collectionId, documentId, data, permissions }) => {
    try {
      const doc = await databases.updateDocument(databaseId, collectionId, documentId, data, permissions);
      return { success: true, data: doc };
    } catch (error) {
      return { success: false, error, message: error.message || "Erro ao atualizar documento." };
    }
  },

  deleteDocument: async ({ databaseId, collectionId, documentId }) => {
    try {
      await databases.deleteDocument(databaseId, collectionId, documentId);
      return { success: true };
    } catch (error) {
      return { success: false, error, message: error.message || "Erro ao deletar documento." };
    }
  },

  uploadFile: async ({ bucketId, fileId, file, permissions = [Permission.read(Role.any())] }) => {
    try {
      const uploaded = await storage.createFile(bucketId, fileId, file, permissions);
      return { success: true, data: uploaded };
    } catch (error) {
      return { success: false, error, message: error.message || "Erro ao fazer upload." };
    }
  },

  getFile: async ({ bucketId, fileId }) => {
    try {
      const file = await storage.getFile(bucketId, fileId);
      return { success: true, data: file };
    } catch (error) {
      return { success: false, error, message: error.message || "Erro ao obter arquivo." };
    }
  },

  deleteFile: async ({ bucketId, fileId }) => {
    try {
      await storage.deleteFile(bucketId, fileId);
      return { success: true };
    } catch (error) {
      return { success: false, error, message: error.message || "Erro ao deletar arquivo." };
    }
  },

  setDocumentReadRoleAny: () => {
    return [Permission.read(Role.any())];
  },

  setDocumentReadRoleUser: (userId) => {
    return [Permission.read(Role.user(userId))];
  },

  setDocumentWriteRoleUser: (userId) => {
    return [Permission.write(Role.user(userId))];
  },
};

export default AppwriteClient;
