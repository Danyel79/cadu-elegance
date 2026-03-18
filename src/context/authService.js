// src/context/authService.js
import { account } from "./appwriteConfig";
import { ID } from "appwrite";

async function login(email, senha) {
  if (!email || !email.trim()) {
    return { success: false, error: "Email é obrigatório." };
  }

  if (!senha || !senha.trim()) {
    return { success: false, error: "Senha é obrigatória." };
  }

  try {
    const session = await account.createEmailSession(email, senha);

    return {
      success: true,
      data: {
        userId: session.userId,
        sessionId: session.$id,
        expiresAt: session.expiresAt,
      },
    };
  } catch (error) {
    const message =
      (error && error.message) ||
      (error && error.response && error.response.message) ||
      "Erro ao autenticar.";

    return {
      success: false,
      error: message,
      raw: error,
    };
  }
}

async function logout() {
  try {
    await account.deleteSession("current");

    return {
      success: true,
      message: "Logout efetuado com sucesso.",
    };
  } catch (error) {
    const message =
      (error && error.message) ||
      (error && error.response && error.response.message) ||
      "Erro ao encerrar sessão.";

    return {
      success: false,
      error: message,
      raw: error,
    };
  }
}

async function getCurrentUser() {
  try {
    const user = await account.get();
    return { success: true, data: user };
  } catch (error) {
    const message =
      (error && error.message) ||
      (error && error.response && error.response.message) ||
      "Erro ao buscar usuário atual.";

    return { success: false, error: message, raw: error };
  }
}

async function updateUserProfile({ name, email, password, oldPassword, prefs }) {
  if (!name && !email && !password && !prefs) {
    return { success: false, error: "Nenhum campo para atualizar." };
  }

  try {
    let updatedUser;

    if (name) {
      updatedUser = await account.updateName(name);
    }

    if (prefs) {
      updatedUser = await account.updatePrefs(prefs);
    }

    if (email && oldPassword) {
      updatedUser = await account.updateEmail(email, oldPassword);
    }

    if (password && oldPassword) {
      updatedUser = await account.updatePassword(password, oldPassword);
    }

    return {
      success: true,
      data: updatedUser,
      message: "Perfil atualizado com sucesso.",
    };
  } catch (error) {
    const message =
      (error && error.message) ||
      (error && error.response && error.response.message) ||
      "Erro ao atualizar perfil.";

    return { success: false, error: message, raw: error };
  }
}

async function register(name, email, senha) {
  if (!name || !name.trim()) {
    return { success: false, error: "Nome é obrigatório." };
  }

  if (!email || !email.trim()) {
    return { success: false, error: "Email é obrigatório." };
  }

  if (!senha || !senha.trim()) {
    return { success: false, error: "Senha é obrigatória." };
  }

  try {
    const user = await account.create(ID.unique(), email.trim(), senha.trim(), name.trim());

    return {
      success: true,
      data: user,
      message: "Cadastro realizado com sucesso.",
    };
  } catch (error) {
    const message =
      (error && error.message) ||
      (error && error.response && error.response.message) ||
      "Erro ao cadastrar usuário.";

    return { success: false, error: message, raw: error };
  }
}

export { login, logout, getCurrentUser, updateUserProfile, register };