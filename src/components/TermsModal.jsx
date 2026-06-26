import { useEffect } from "react";

const OVERLAY = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "16px",
};

const DIALOG = {
  background: "#131210",
  border: "1px solid rgba(209,183,107,0.18)",
  borderRadius: "18px",
  width: "100%",
  maxWidth: "680px",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
};

const HEADER = {
  padding: "24px 28px 18px",
  borderBottom: "1px solid rgba(209,183,107,0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
};

const BODY = {
  padding: "24px 28px",
  overflowY: "auto",
  flex: 1,
  color: "#beb7a3",
  fontSize: "13px",
  lineHeight: 1.8,
};

const H2 = { color: "#d1b76b", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.18em", margin: "24px 0 8px" };
const H2_FIRST = { ...H2, marginTop: 0 };
const P = { margin: "0 0 12px" };

function CloseBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        color: "#99907c",
        cursor: "pointer",
        padding: "6px 10px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "12px",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
      Fechar
    </button>
  );
}

function TermsContent() {
  return (
    <>
      <p style={H2_FIRST}>1. Aceitação dos Termos</p>
      <p style={P}>
        Ao criar uma conta e utilizar a plataforma <strong style={{ color: "#f6f2e8" }}>Cadu Elegance</strong>, você
        declara ter lido, compreendido e concordado integralmente com estes Termos de Utilização.
        Caso não concorde com qualquer disposição, não utilize o aplicativo.
      </p>

      <p style={H2}>2. Descrição do Serviço</p>
      <p style={P}>
        A Cadu Elegance disponibiliza uma plataforma digital de agendamento online de serviços de
        barbearia e cuidados masculinos. O aplicativo permite que clientes visualizem serviços,
        profissionais disponíveis, horários livres e realizem agendamentos de forma prática.
      </p>

      <p style={H2}>3. Cadastro e Conta</p>
      <p style={P}>
        Para utilizar as funcionalidades de agendamento, é necessário criar uma conta com nome completo
        e endereço de e-mail válido. Você é responsável por manter a confidencialidade de sua senha e
        por todas as atividades realizadas com sua conta. Em caso de uso não autorizado, notifique
        imediatamente a equipe da Cadu Elegance.
      </p>

      <p style={H2}>4. Agendamentos e Cancelamentos</p>
      <p style={P}>
        Os agendamentos estão sujeitos à disponibilidade dos profissionais. O cliente pode cancelar
        um agendamento futuro diretamente pelo aplicativo. Agendamentos passados não podem ser
        cancelados retroativamente. Recomendamos cancelar com no mínimo 1 hora de antecedência para
        que o horário fique disponível para outros clientes.
      </p>

      <p style={H2}>5. Conduta do Usuário</p>
      <p style={P}>
        O usuário compromete-se a fornecer informações verdadeiras e atualizadas, utilizar a
        plataforma somente para fins lícitos e não realizar agendamentos de má-fé ou com intuito
        de prejudicar profissionais ou outros clientes.
      </p>

      <p style={H2}>6. Disponibilidade do Serviço</p>
      <p style={P}>
        A Cadu Elegance envida esforços para manter a plataforma disponível continuamente, mas não
        garante disponibilidade ininterrupta. Manutenções programadas ou situações imprevistas podem
        ocasionar interrupções temporárias.
      </p>

      <p style={H2}>7. Propriedade Intelectual</p>
      <p style={P}>
        Todo o conteúdo da plataforma — marca, identidade visual, textos e funcionalidades — é de
        propriedade da Cadu Elegance. É proibida a reprodução ou uso não autorizado desses elementos.
      </p>

      <p style={H2}>8. Alterações nos Termos</p>
      <p style={P}>
        Estes Termos podem ser atualizados periodicamente. Notificaremos os usuários sobre mudanças
        relevantes. A continuação do uso da plataforma após as alterações implica aceitação dos novos
        termos.
      </p>

      <p style={H2}>9. Contato</p>
      <p style={{ ...P, marginBottom: 0 }}>
        Dúvidas sobre estes Termos podem ser enviadas para a equipe da Cadu Elegance por meio dos
        canais de atendimento disponíveis na barbearia.
      </p>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <p style={H2_FIRST}>1. Controlador dos Dados</p>
      <p style={P}>
        A <strong style={{ color: "#f6f2e8" }}>Cadu Elegance Barbearia</strong> é a responsável pelo
        tratamento dos dados pessoais coletados por meio desta plataforma, em conformidade com a Lei
        Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <p style={H2}>2. Dados Coletados</p>
      <p style={P}>Coletamos apenas os dados necessários para o funcionamento do serviço:</p>
      <ul style={{ margin: "0 0 12px", paddingLeft: "20px" }}>
        <li style={{ marginBottom: "4px" }}><strong style={{ color: "#d1b76b" }}>Identificação:</strong> nome completo e endereço de e-mail;</li>
        <li style={{ marginBottom: "4px" }}><strong style={{ color: "#d1b76b" }}>Agendamentos:</strong> serviço escolhido, profissional, data e horário;</li>
        <li style={{ marginBottom: "4px" }}><strong style={{ color: "#d1b76b" }}>Acesso:</strong> dados de sessão para autenticação segura.</li>
      </ul>
      <p style={P}>Não coletamos dados de pagamento, documentos ou informações sensíveis.</p>

      <p style={H2}>3. Finalidade do Tratamento</p>
      <p style={P}>Seus dados são utilizados exclusivamente para:</p>
      <ul style={{ margin: "0 0 12px", paddingLeft: "20px" }}>
        <li style={{ marginBottom: "4px" }}>Criar e gerenciar sua conta na plataforma;</li>
        <li style={{ marginBottom: "4px" }}>Realizar e registrar agendamentos de serviços;</li>
        <li style={{ marginBottom: "4px" }}>Enviar comunicações transacionais (confirmações e recuperação de senha);</li>
        <li style={{ marginBottom: "4px" }}>Melhorar a experiência do usuário na plataforma.</li>
      </ul>

      <p style={H2}>4. Base Legal</p>
      <p style={P}>
        O tratamento dos seus dados fundamenta-se no consentimento expresso fornecido no ato do
        cadastro e na execução do contrato de prestação de serviços de agendamento (art. 7º, I e V, da LGPD).
      </p>

      <p style={H2}>5. Compartilhamento de Dados</p>
      <p style={P}>
        Seus dados <strong style={{ color: "#f6f2e8" }}>não são vendidos ou compartilhados</strong> com
        terceiros para fins comerciais. Compartilhamos dados apenas com a infraestrutura de hospedagem
        e autenticação (Appwrite Cloud) estritamente para o funcionamento da plataforma, sujeita à
        sua própria política de privacidade.
      </p>

      <p style={H2}>6. Retenção dos Dados</p>
      <p style={P}>
        Os dados são mantidos enquanto a conta estiver ativa. Após o encerramento da conta ou mediante
        solicitação, os dados pessoais serão excluídos, salvo obrigação legal de retenção.
      </p>

      <p style={H2}>7. Seus Direitos (LGPD)</p>
      <p style={P}>Você tem direito a:</p>
      <ul style={{ margin: "0 0 12px", paddingLeft: "20px" }}>
        <li style={{ marginBottom: "4px" }}>Acessar os dados que mantemos sobre você;</li>
        <li style={{ marginBottom: "4px" }}>Corrigir dados incompletos, inexatos ou desatualizados;</li>
        <li style={{ marginBottom: "4px" }}>Solicitar a exclusão dos seus dados pessoais;</li>
        <li style={{ marginBottom: "4px" }}>Revogar o consentimento a qualquer momento;</li>
        <li style={{ marginBottom: "4px" }}>Solicitar portabilidade dos dados.</li>
      </ul>

      <p style={H2}>8. Segurança</p>
      <p style={P}>
        Adotamos medidas técnicas adequadas para proteger seus dados contra acesso não autorizado,
        incluindo autenticação segura, armazenamento criptografado e controle de acesso por perfis.
      </p>

      <p style={H2}>9. Cookies e Sessão</p>
      <p style={P}>
        Utilizamos tokens de sessão para mantê-lo autenticado. Não utilizamos cookies de rastreamento
        ou publicidade de terceiros.
      </p>

      <p style={H2}>10. Contato para Privacidade</p>
      <p style={{ ...P, marginBottom: 0 }}>
        Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato com a
        equipe da Cadu Elegance pelos canais disponíveis na barbearia.
      </p>
    </>
  );
}

export default function TermsModal({ type, onClose }) {
  // Fecha com Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isTerms = type === "terms";
  const title = isTerms ? "Termos de Utilização" : "Política de Privacidade";

  return (
    <div style={OVERLAY} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={DIALOG} role="dialog" aria-modal="true" aria-label={title}>
        <div style={HEADER}>
          <div>
            <p style={{ margin: 0, color: "#d1b76b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.18em" }}>
              Cadu Elegance
            </p>
            <h2 style={{ margin: "4px 0 0", color: "#f6f2e8", fontSize: "18px", fontFamily: "'Noto Serif', serif" }}>
              {title}
            </h2>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div style={BODY}>
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </div>
      </div>
    </div>
  );
}
