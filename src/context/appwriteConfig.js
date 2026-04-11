// src/context/appwriteConfig.js
import { Client, Account, Databases, Storage, Teams } from "appwrite";

// Cloud: https://cloud.appwrite.io/v1 | self-host: https://seu-dominio/v1
const APPWRITE_ENDPOINT =
  import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT = import.meta.env.VITE_APPWRITE_PROJECT_ID || "";

if (!APPWRITE_PROJECT && import.meta.env.DEV) {
  console.warn(
    "[Appwrite] Defina VITE_APPWRITE_PROJECT_ID no ficheiro .env (ver .env.example)."
  );
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const teams = new Teams(client);

export { client, account, databases, storage, teams };