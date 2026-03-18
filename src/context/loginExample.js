// src/context/loginExample.js
import { login, logout, getCurrentUser, updateUserProfile } from "./authService";

async function runLoginExample() {
  const email = "usuario@exemplo.com";
  const senha = "suaSenhaForte123";

  const resultado = await login(email, senha);

  if (!resultado.success) {
    console.error("Falha no login:", resultado.error);
    return;
  }

  console.log("Login feito com sucesso:", resultado.data);

  const userResult = await getCurrentUser();
  if (userResult.success) {
    console.log("Usuário atual:", userResult.data);
  } else {
    console.error("Erro ao buscar usuário:", userResult.error);
  }

  const profileUpdate = await updateUserProfile({
    name: "Nome Atualizado",
    prefs: { theme: "dark" },
  });

  if (profileUpdate.success) {
    console.log("Perfil atualizado:", profileUpdate.data);
  } else {
    console.error("Falha ao atualizar perfil:", profileUpdate.error);
  }

  const out = await logout();
  if (out.success) {
    console.log("Logout feito com sucesso.");
  } else {
    console.error("Falha no logout:", out.error);
  }
}

runLoginExample();