import { databases } from "../context/appwriteConfig";
import { ID, Permission, Query, Role } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "";
const FINANCIAL_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_FINANCIAL_COLLECTION_ID || "financeiro";

export const TRANSACTION_TYPES = {
  ENTRADA: "Entrada",
  SAIDA: "Saida",
};

export const EXPENSE_CATEGORIES = [
  { value: "material", label: "Material de Uso" },
  { value: "produto_consumo", label: "Produto de Consumo" },
  { value: "outros_gastos", label: "Outros Gastos" },
];

export const INCOME_CATEGORIES = [
  { value: "venda_produto", label: "Venda de Produto" },
  { value: "outros_receita", label: "Outras Receitas" },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryLabel(value) {
  return ALL_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function mapTransaction(doc) {
  if (!doc) return doc;
  return {
    ...doc,
    tipo: doc.tipo,
    categoria: doc.categoria,
    descricao: doc.descricao,
    valor: Number(doc.valor) || 0,
    data: doc.data ? String(doc.data).slice(0, 10) : "",
    observacoes: doc.observacoes ?? "",
  };
}

/** Lista transações, opcionalmente filtradas por ano e mês (1-12). */
export async function listTransactions({ year, month } = {}) {
  if (!DATABASE_ID || !FINANCIAL_COLLECTION_ID) {
    return {
      success: false,
      error: "Defina VITE_APPWRITE_FINANCIAL_COLLECTION_ID no .env.",
      data: [],
    };
  }
  try {
    const queries = [Query.orderDesc("data"), Query.limit(500)];

    if (year && month) {
      const monthStr = String(month).padStart(2, "0");
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const nextMonthStr = String(nextMonth).padStart(2, "0");
      queries.push(Query.greaterThanEqual("data", `${year}-${monthStr}-01`));
      queries.push(Query.lessThan("data", `${nextYear}-${nextMonthStr}-01`));
    } else if (year) {
      queries.push(Query.greaterThanEqual("data", `${year}-01-01`));
      queries.push(Query.lessThan("data", `${year + 1}-01-01`));
    }

    const res = await databases.listDocuments(
      DATABASE_ID,
      FINANCIAL_COLLECTION_ID,
      queries
    );
    return { success: true, data: res.documents.map(mapTransaction) };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Erro ao listar transações.",
      data: [],
    };
  }
}

export async function createTransaction({
  tipo,
  categoria,
  descricao,
  valor,
  data,
  observacoes = "",
}) {
  if (!DATABASE_ID || !FINANCIAL_COLLECTION_ID) {
    return {
      success: false,
      error: "Defina VITE_APPWRITE_FINANCIAL_COLLECTION_ID no .env.",
    };
  }

  const numValor =
    typeof valor === "number" ? valor : Number(String(valor).replace(",", "."));

  if (
    !tipo ||
    !categoria ||
    !descricao?.trim() ||
    Number.isNaN(numValor) ||
    numValor <= 0 ||
    !data
  ) {
    return {
      success: false,
      error: "Preencha tipo, categoria, descrição, valor e data.",
    };
  }

  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      FINANCIAL_COLLECTION_ID,
      ID.unique(),
      {
        tipo,
        categoria,
        descricao: descricao.trim(),
        valor: numValor,
        data,
        observacoes: observacoes.trim(),
      },
      [
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    return { success: true, data: mapTransaction(doc) };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao criar transação." };
  }
}

export async function deleteTransaction(transactionId) {
  if (!DATABASE_ID || !FINANCIAL_COLLECTION_ID) {
    return {
      success: false,
      error: "Defina VITE_APPWRITE_FINANCIAL_COLLECTION_ID no .env.",
    };
  }
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      FINANCIAL_COLLECTION_ID,
      transactionId
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || "Erro ao excluir transação." };
  }
}
