// src/services/authService.js
import { account } from "./appwriteConfig";

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

export { login };