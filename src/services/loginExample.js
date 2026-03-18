// src/services/loginExample.js
import { login } from "./authService";

async function runLoginExample() {
  const email = "usuario@exemplo.com";
  const senha = "suaSenhaForte123";

  const resultado = await login(email, senha);

  if (resultado.success) {
    console.log("Login feito com sucesso:", resultado.data);
  } else {
    console.error("Falha no login:", resultado.error);
  }
}

runLoginExample();