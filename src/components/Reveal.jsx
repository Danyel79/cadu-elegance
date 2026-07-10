import { useScrollReveal } from "../hooks/useScrollReveal";

/**
 * Envolve qualquer conteúdo e aplica um fade + slide-up assim que ele entra
 * na viewport pela primeira vez. `as` troca a tag do wrapper (ex.: "section").
 */
export default function Reveal({ children, delay = 0, as = "div", style = {} }) {
  const Tag = as;
  const [ref, visible] = useScrollReveal();

  return (
    <Tag
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
