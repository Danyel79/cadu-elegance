// src/services/appwriteConfig.js
import { Client, Account } from "appwrite";

// Substitua pelos valores do seu Appwrite
const APPWRITE_ENDPOINT = "https://[SEU_APPWRITE_HOST]/v1";
const APPWRITE_PROJECT = "[SEU_PROJECT_ID]";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT);

const account = new Account(client);

export { client, account };