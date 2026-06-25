import { useEffect, useRef, useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  createProduct,
  deleteProduct,
  getProductImagePreviewUrl,
  listAllProductsAdmin,
  listCategories,
  updateProduct,
  uploadProductImage,
} from "../../services/storeService";

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  stock: "",
  imageId: "",
};

function formatCurrency(v) {
  return Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function ProductForm({ initial, onSave, onCancel, submitting }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    category: initial?.category || "",
    price: initial?.price || "",
    stock: initial?.stock ?? "",
    imageId: initial?.imageId || "",
  });
  const [preview, setPreview] = useState(
    initial?.imageId ? getProductImagePreviewUrl(initial.imageId, 200) : null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef();

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const res = await uploadProductImage(file);
    setUploading(false);
    if (res.success) {
      set("imageId", res.fileId);
    } else {
      setUploadError(res.error || "Erro no upload.");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      name: form.name,
      category: form.category,
      price: Number(String(form.price).replace(",", ".")),
      stock: Number(form.stock) || 0,
      imageId: form.imageId || null,
    });
  }

  const inp = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#f6f2e8",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ color: "#beb7a3", fontSize: "12px" }}>Nome *</span>
          <input
            style={inp}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="Ex: Pomada Modeladora"
          />
        </label>
        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ color: "#beb7a3", fontSize: "12px" }}>Categoria</span>
          <input
            style={inp}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Ex: Cabelo, Barba, Skincare"
          />
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ color: "#beb7a3", fontSize: "12px" }}>
            Preço (R$) *
          </span>
          <input
            style={inp}
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
            placeholder="0,00"
          />
        </label>
        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ color: "#beb7a3", fontSize: "12px" }}>Estoque</span>
          <input
            style={inp}
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            placeholder="0"
          />
        </label>
      </div>

      {/* Upload de imagem */}
      <div style={{ display: "grid", gap: "8px" }}>
        <span style={{ color: "#beb7a3", fontSize: "12px" }}>
          Foto do produto
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          ) : (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "8px",
                border: "1px dashed rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#3a3835", fontSize: "28px" }}
              >
                image
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "#beb7a3",
              cursor: uploading ? "wait" : "pointer",
              fontSize: "13px",
            }}
          >
            {uploading
              ? "Enviando..."
              : preview
              ? "Trocar imagem"
              : "Selecionar imagem"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />
        </div>
        {uploadError && (
          <p style={{ color: "#f87171", fontSize: "12px", margin: 0 }}>
            {uploadError}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <button
          type="submit"
          disabled={submitting || uploading}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "none",
            background: submitting || uploading ? "#8a7a3a" : "#d1b76b",
            color: "#0f0e0e",
            fontWeight: "700",
            cursor: submitting || uploading ? "wait" : "pointer",
            fontSize: "14px",
          }}
        >
          {submitting ? "Salvando..." : "Salvar produto"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "#beb7a3",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminStore() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(null); // null | "create" | { edit: product }
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");

  async function reload() {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      listAllProductsAdmin(),
      listCategories(),
    ]);
    if (prodRes.success) setProducts(prodRes.data);
    else setError(prodRes.error || "Erro ao carregar produtos.");
    if (catRes.success) setCategories(catRes.data);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSave(data) {
    setSubmitting(true);
    setError("");
    let res;
    if (mode?.edit) {
      res = await updateProduct(mode.edit.$id, data);
    } else {
      res = await createProduct(data);
    }
    setSubmitting(false);
    if (res.success) {
      setFeedback(mode?.edit ? "Produto atualizado com sucesso!" : "Produto cadastrado!");
      setMode(null);
      reload();
      setTimeout(() => setFeedback(""), 3500);
    } else {
      setError(res.error || "Erro ao salvar produto.");
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`))
      return;
    const res = await deleteProduct(product.$id);
    if (res.success) {
      setFeedback("Produto removido.");
      reload();
      setTimeout(() => setFeedback(""), 3000);
    } else {
      setError(res.error || "Erro ao excluir.");
    }
  }

  async function handleToggleActive(product) {
    const res = await updateProduct(product.$id, { active: !product.active });
    if (res.success) reload();
    else setError(res.error || "Erro ao atualizar status.");
  }

  const displayed = products.filter((p) => {
    const matchCat = filterCat === "all" || p.category === filterCat;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const totalActive = products.filter((p) => p.active).length;
  const lowStock = products.filter(
    (p) => p.active && Number(p.stock) < 5
  ).length;

  const cardStyle = {
    padding: "24px 28px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(209,183,107,0.14)",
  };

  return (
    <AdminLayout>
      {/* Header */}
      <header className="atelier-admin-header">
        <div className="atelier-admin-header-content">
          <span className="atelier-admin-eyebrow">Gestão de Produtos</span>
          <h1 className="atelier-admin-title">
            Loja <em>Virtual</em>
          </h1>
          <p className="atelier-admin-subtitle">
            Cadastre produtos, gerencie estoque, fotos e visibilidade da loja.
          </p>
        </div>
      </header>

      {/* Alertas */}
      {feedback && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: "#10b981",
            fontSize: "14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px" }}
          >
            check_circle
          </span>
          {feedback}
        </div>
      )}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.3)",
            color: "#f87171",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* KPIs rápidos */}
      {!loading && (
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "Total de produtos", value: products.length, icon: "inventory_2" },
            { label: "Produtos ativos", value: totalActive, icon: "visibility" },
            {
              label: "Estoque baixo (< 5)",
              value: lowStock,
              icon: "warning",
              warn: lowStock > 0,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                ...cardStyle,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flex: "1 1 180px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color: kpi.warn ? "#fbbf24" : "#d1b76b",
                  fontSize: "24px",
                }}
              >
                {kpi.icon}
              </span>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "700",
                    color: kpi.warn ? "#fbbf24" : "#f6f2e8",
                  }}
                >
                  {kpi.value}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#99907c" }}>
                  {kpi.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário criar/editar */}
      {mode && (
        <div style={{ ...cardStyle, marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{ color: "#f6f2e8", margin: 0, fontSize: "18px" }}
            >
              {mode?.edit
                ? `Editando: ${mode.edit.name}`
                : "Cadastrar Novo Produto"}
            </h3>
            <button
              type="button"
              onClick={() => setMode(null)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#99907c",
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <ProductForm
            initial={mode?.edit}
            onSave={handleSave}
            onCancel={() => setMode(null)}
            submitting={submitting}
          />
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        {!mode && (
          <button
            type="button"
            onClick={() => setMode("create")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: "#d1b76b",
              color: "#0f0e0e",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              add
            </span>
            Novo Produto
          </button>
        )}

        <div style={{ position: "relative" }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#99907c",
              fontSize: "16px",
              pointerEvents: "none",
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px 14px 10px 36px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "#f6f2e8",
              fontSize: "14px",
              outline: "none",
              minWidth: "200px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["all", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                border:
                  filterCat === cat
                    ? "1px solid #d1b76b"
                    : "1px solid rgba(255,255,255,0.1)",
                background:
                  filterCat === cat
                    ? "rgba(209,183,107,0.15)"
                    : "transparent",
                color: filterCat === cat ? "#d1b76b" : "#99907c",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: filterCat === cat ? "700" : "400",
              }}
            >
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>

        <span
          style={{
            color: "#99907c",
            fontSize: "13px",
            marginLeft: "auto",
          }}
        >
          {displayed.length} produto(s)
        </span>
      </div>

      {/* Lista de produtos */}
      {loading ? (
        <p style={{ color: "#beb7a3" }}>Carregando produtos...</p>
      ) : displayed.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            textAlign: "center",
            padding: "64px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "#3a3835", fontSize: "56px" }}
          >
            storefront
          </span>
          <p style={{ color: "#beb7a3", marginTop: "16px" }}>
            {search || filterCat !== "all"
              ? "Nenhum produto encontrado para os filtros aplicados."
              : "Nenhum produto cadastrado ainda."}
          </p>
          {!search && filterCat === "all" && (
            <button
              type="button"
              onClick={() => setMode("create")}
              style={{
                marginTop: "16px",
                padding: "10px 24px",
                borderRadius: "10px",
                border: "none",
                background: "#d1b76b",
                color: "#0f0e0e",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Cadastrar primeiro produto
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {displayed.map((product) => {
            const imgUrl = getProductImagePreviewUrl(product.imageId, 80);
            const stockNum = Number(product.stock);
            const isLowStock = stockNum < 5 && stockNum >= 0;
            const isOut = stockNum === 0;

            return (
              <div
                key={product.$id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: product.active
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.02)",
                  border: product.active
                    ? "1px solid rgba(209,183,107,0.12)"
                    : "1px solid rgba(255,255,255,0.05)",
                  opacity: product.active ? 1 : 0.55,
                  flexWrap: "wrap",
                  transition: "opacity 0.2s",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#3a3835", fontSize: "22px" }}
                    >
                      image
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#f6f2e8",
                        fontWeight: "600",
                        fontSize: "15px",
                      }}
                    >
                      {product.name}
                    </p>
                    {product.category && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: "rgba(209,183,107,0.12)",
                          color: "#d1b76b",
                          fontSize: "11px",
                        }}
                      >
                        {product.category}
                      </span>
                    )}
                    {!product.active && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: "rgba(255,255,255,0.06)",
                          color: "#99907c",
                          fontSize: "11px",
                        }}
                      >
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                {/* Preço e estoque */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      color: "#d1b76b",
                      fontWeight: "700",
                      fontSize: "16px",
                    }}
                  >
                    {formatCurrency(product.price || 0)}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "11px",
                      color: isOut
                        ? "#f87171"
                        : isLowStock
                        ? "#fbbf24"
                        : "#10b981",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      justifyContent: "flex-end",
                    }}
                  >
                    {(isOut || isLowStock) && (
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "12px" }}
                      >
                        {isOut ? "block" : "warning"}
                      </span>
                    )}
                    {isOut
                      ? "Sem estoque"
                      : `Estoque: ${product.stock ?? 0}`}
                  </p>
                </div>

                {/* Ações */}
                <div
                  style={{ display: "flex", gap: "4px", flexShrink: 0 }}
                >
                  <button
                    type="button"
                    title={product.active ? "Desativar da loja" : "Ativar na loja"}
                    onClick={() => handleToggleActive(product)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        color: product.active ? "#10b981" : "#99907c",
                        fontSize: "22px",
                      }}
                    >
                      {product.active ? "toggle_on" : "toggle_off"}
                    </span>
                  </button>
                  <button
                    type="button"
                    title="Editar"
                    onClick={() => {
                      setMode({ edit: product });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#beb7a3", fontSize: "20px" }}
                    >
                      edit
                    </span>
                  </button>
                  <button
                    type="button"
                    title="Excluir produto"
                    onClick={() => handleDelete(product)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "6px",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#f87171", fontSize: "20px" }}
                    >
                      delete
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
