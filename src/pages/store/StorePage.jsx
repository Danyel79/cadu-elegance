import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  getProductImagePreviewUrl,
  listCategories,
  listProducts,
} from "../../services/storeService";

function formatCurrency(v) {
  return Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* ─── Card de produto padrão ─── */
function ProductCard({ product }) {
  const imgUrl = getProductImagePreviewUrl(product.imageId, 500);
  const inStock = Number(product.stock) > 0;
  const lowStock = Number(product.stock) < 5 && inStock;

  return (
    <div
      style={{
        borderRadius: "16px",
        background: "#141312",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Imagem */}
      <div
        style={{
          aspectRatio: "1/1",
          background: "#1a1918",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "block";
            }}
          />
        ) : null}
        <span
          className="material-symbols-outlined"
          style={{ color: "#2a2826", fontSize: "52px", display: imgUrl ? "none" : "block" }}
        >
          image
        </span>

        {/* Badge estoque */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "3px 10px",
            borderRadius: "999px",
            background: inStock
              ? "rgba(16,185,129,0.12)"
              : "rgba(248,113,113,0.12)",
            border: inStock
              ? "1px solid rgba(16,185,129,0.35)"
              : "1px solid rgba(248,113,113,0.35)",
            color: inStock ? "#10b981" : "#f87171",
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {inStock ? "Disponível" : "Esgotado"}
        </div>
      </div>

      {/* Detalhes */}
      <div
        style={{
          padding: "16px 18px 18px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {product.category && (
          <span
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#d1b76b",
              fontWeight: "600",
            }}
          >
            {product.category}
          </span>
        )}
        <h3
          style={{
            margin: 0,
            color: "#f6f2e8",
            fontSize: "15px",
            fontFamily: "'Noto Serif', serif",
            lineHeight: 1.4,
          }}
        >
          {product.name}
        </h3>
        <div
          style={{
            marginTop: "auto",
            paddingTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "#d1b76b",
              fontWeight: "700",
              fontSize: "17px",
            }}
          >
            {formatCurrency(product.price || 0)}
          </span>
          {lowStock && (
            <span
              style={{
                color: "#fbbf24",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "13px" }}
              >
                warning
              </span>
              Últimas {product.stock}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Card em destaque (produto principal) ─── */
function FeaturedCard({ product }) {
  const imgUrl = getProductImagePreviewUrl(product.imageId, 800);
  const inStock = Number(product.stock) > 0;

  return (
    <div
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        position: "relative",
        minHeight: "420px",
        background: "#141312",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        border: "1px solid rgba(209,183,107,0.15)",
      }}
    >
      {imgUrl && (
        <img
          src={imgUrl}
          alt={product.name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
      {/* Gradiente de baixo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(10,9,9,0.95) 0%, rgba(10,9,9,0.5) 50%, transparent 100%)",
        }}
      />

      <div style={{ position: "relative", padding: "28px 32px" }}>
        {product.category && (
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: "999px",
              background: "rgba(209,183,107,0.15)",
              border: "1px solid rgba(209,183,107,0.35)",
              color: "#d1b76b",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            {product.category}
          </span>
        )}
        <h2
          style={{
            margin: "0 0 6px",
            color: "#f6f2e8",
            fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
            fontFamily: "'Noto Serif', serif",
            lineHeight: 1.25,
          }}
        >
          {product.name}
        </h2>
        <div
          style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}
        >
          <span
            style={{
              color: "#d1b76b",
              fontWeight: "700",
              fontSize: "22px",
            }}
          >
            {formatCurrency(product.price || 0)}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: inStock ? "#10b981" : "#f87171",
              fontWeight: "600",
            }}
          >
            {inStock ? "Em estoque" : "Esgotado"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal ─── */
export default function StorePage() {
  const { signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  async function handleLogout() {
    if (!window.confirm("Tem certeza que deseja sair?")) return;
    await signOut();
    navigate("/login", { replace: true });
  }
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        listProducts({ activeOnly: true }),
        listCategories(),
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        activeCategory === "all" || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  // Produto em destaque = mais caro entre os em estoque
  const featured = useMemo(() => {
    const inStock = products.filter((p) => Number(p.stock) > 0);
    if (!inStock.length) return products[0] || null;
    return inStock.reduce(
      (best, p) => (Number(p.price) > Number(best.price) ? p : best),
      inStock[0]
    );
  }, [products]);

  // Restantes após remover o featured
  const rest = useMemo(() => {
    if (!featured) return filtered;
    if (activeCategory !== "all" || search) return filtered;
    return filtered.filter((p) => p.$id !== featured.$id);
  }, [filtered, featured, activeCategory, search]);

  const showFeatured =
    featured && activeCategory === "all" && !search;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0909", color: "#f6f2e8" }}>
      {/* ── Topo ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(10,9,9,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 32px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Noto Serif', serif",
            fontWeight: "700",
            fontSize: "16px",
            color: "#d1b76b",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          Cadu Elegance
        </p>

        {/* Busca central */}
        <div
          style={{
            position: "relative",
            flex: "0 1 360px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#99907c",
              fontSize: "18px",
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
              width: "100%",
              padding: "9px 14px 9px 40px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "#f6f2e8",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Links direita */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {isAdmin && (
            <Link
              to="/admin/store"
              style={{
                color: "#d1b76b",
                fontSize: "12px",
                textDecoration: "none",
                fontWeight: "600",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Gerenciar
            </Link>
          )}
          <Link
            to="/client"
            style={{ color: "#99907c", fontSize: "13px", textDecoration: "none" }}
          >
            ← Área do cliente
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#beb7a3",
              padding: "6px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
              logout
            </span>
            Sair
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        style={{
          padding: "72px 32px 48px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "'Noto Serif', serif",
            fontSize: "clamp(2.4rem, 5vw, 4rem)",
            margin: "0 0 20px",
            lineHeight: 1.15,
            maxWidth: "640px",
            color: "#f2ca50",
          }}
        >
          Cadu Elegance
          <br />
          <em style={{ color: "#d1b76b" }}>Loja</em>
        </h1>
        <p
          style={{
            color: "#beb7a3",
            fontSize: "15px",
            maxWidth: "520px",
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          Uma coleção selecionada de produtos artesanais para grooming masculino e
          estilo de vida do homem moderno que exige precisão absoluta.
        </p>
      </section>

      {/* ── Categorias ── */}
      <div
        style={{
          padding: "0 32px 32px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {["all", ...categories].map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: active
                    ? "1px solid #d1b76b"
                    : "1px solid rgba(255,255,255,0.1)",
                  background: active
                    ? "rgba(209,183,107,0.12)"
                    : "transparent",
                  color: active ? "#d1b76b" : "#99907c",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: active ? "700" : "400",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {cat === "all" ? "Todos os produtos" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0", color: "#beb7a3" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "40px", color: "#3a3835", display: "block", marginBottom: "16px" }}
            >
              storefront
            </span>
            <p>Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "64px", color: "#2a2826", display: "block", marginBottom: "20px" }}
            >
              storefront
            </span>
            <p style={{ color: "#beb7a3", fontSize: "16px" }}>
              A loja ainda não possui produtos cadastrados.
            </p>
            {isAdmin && (
              <Link
                to="/admin/store"
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  background: "#d1b76b",
                  color: "#0f0e0e",
                  fontWeight: "700",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Cadastrar produtos
              </Link>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "#beb7a3" }}>
              Nenhum produto encontrado para os filtros aplicados.
            </p>
            <button
              type="button"
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              style={{
                marginTop: "12px",
                padding: "8px 20px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                color: "#beb7a3",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Destaque + laterais */}
            {showFeatured && rest.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "32px",
                }}
              >
                <FeaturedCard product={featured} />

                <div style={{ display: "grid", gap: "20px", gridTemplateRows: "1fr 1fr" }}>
                  {rest.slice(0, 2).map((p) => (
                    <div
                      key={p.$id}
                      style={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        background: "#141312",
                        border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "16px",
                        transition: "border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(209,183,107,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.06)";
                      }}
                    >
                      <div
                        style={{
                          width: "90px",
                          height: "90px",
                          borderRadius: "10px",
                          background: "#1a1918",
                          overflow: "hidden",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getProductImagePreviewUrl(p.imageId, 180) ? (
                          <img
                            src={getProductImagePreviewUrl(p.imageId, 180)}
                            alt={p.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span
                            className="material-symbols-outlined"
                            style={{ color: "#2a2826", fontSize: "28px" }}
                          >
                            image
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {p.category && (
                          <p
                            style={{
                              margin: "0 0 4px",
                              fontSize: "10px",
                              color: "#d1b76b",
                              textTransform: "uppercase",
                              letterSpacing: "0.12em",
                              fontWeight: "600",
                            }}
                          >
                            {p.category}
                          </p>
                        )}
                        <p
                          style={{
                            margin: "0 0 8px",
                            color: "#f6f2e8",
                            fontFamily: "'Noto Serif', serif",
                            fontSize: "14px",
                            lineHeight: 1.4,
                          }}
                        >
                          {p.name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: "#d1b76b",
                            fontWeight: "700",
                            fontSize: "16px",
                          }}
                        >
                          {formatCurrency(p.price || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separador */}
            {showFeatured && rest.slice(2).length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "rgba(255,255,255,0.06)",
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    color: "#99907c",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Coleção completa
                </p>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "rgba(255,255,255,0.06)",
                  }}
                />
              </div>
            )}

            {/* Grade de produtos */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              {(showFeatured ? rest.slice(2) : filtered).map((product) => (
                <ProductCard key={product.$id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Banner de agendamento ── */}
      {!loading && products.length > 0 && (
        <section
          style={{
            margin: "0 32px 64px",
            maxWidth: "1136px",
            marginLeft: "auto",
            marginRight: "auto",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, #1a1612 0%, #141312 50%, #0f0e0e 100%)",
            border: "1px solid rgba(209,183,107,0.15)",
            padding: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                color: "#d1b76b",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "10px",
                margin: "0 0 10px",
              }}
            >
              Experiência personalizada
            </p>
            <h2
              style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                margin: "0 0 12px",
                color: "#f6f2e8",
              }}
            >
              Consultoria de Estilo
              <br />
              &amp; Grooming
            </h2>
            <p style={{ color: "#beb7a3", margin: 0, maxWidth: "400px", lineHeight: 1.7 }}>
              Não sabe qual produto combina com você? Agende uma sessão e
              nossos profissionais criarão o kit perfeito para o seu estilo.
            </p>
          </div>
          <Link
            to="/client/book"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 28px",
              borderRadius: "12px",
              background: "#d1b76b",
              color: "#0a0909",
              fontWeight: "700",
              textDecoration: "none",
              fontSize: "14px",
              letterSpacing: "0.04em",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              calendar_month
            </span>
            Agendar agora
          </Link>
        </section>
      )}

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "40px 32px",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "32px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "'Noto Serif', serif",
              color: "#d1b76b",
              fontWeight: "700",
              margin: "0 0 8px",
            }}
          >
            Cadu Elegance
          </p>
          <p style={{ color: "#3a3835", fontSize: "12px", margin: 0 }}>
            O concierge digital do grooming masculino de precisão.
          </p>
        </div>
        <div>
          <p
            style={{
              color: "#beb7a3",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              margin: "0 0 12px",
            }}
          >
            Coleção
          </p>
          {categories.slice(0, 4).map((cat) => (
            <p key={cat} style={{ margin: "0 0 6px" }}>
              <button
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3a3835",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                {cat}
              </button>
            </p>
          ))}
        </div>
        <div>
          <p
            style={{
              color: "#beb7a3",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              margin: "0 0 12px",
            }}
          >
            Acesso rápido
          </p>
          <p style={{ margin: "0 0 6px" }}>
            <Link
              to="/client"
              style={{ color: "#3a3835", textDecoration: "none", fontSize: "13px" }}
            >
              Área do cliente
            </Link>
          </p>
          <p style={{ margin: "0 0 6px" }}>
            <Link
              to="/client/book"
              style={{ color: "#3a3835", textDecoration: "none", fontSize: "13px" }}
            >
              Agendar horário
            </Link>
          </p>
          {isAdmin && (
            <p style={{ margin: 0 }}>
              <Link
                to="/admin/store"
                style={{ color: "#3a3835", textDecoration: "none", fontSize: "13px" }}
              >
                Gerenciar loja
              </Link>
            </p>
          )}
        </div>
      </footer>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.03)",
          padding: "16px 32px",
          textAlign: "center",
          color: "#2a2826",
          fontSize: "12px",
        }}
      >
        © {new Date().getFullYear()} Cadu Elegance. Loja disponível para
        visualização — compras em breve.
      </div>
    </div>
  );
}
