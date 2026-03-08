import Link from "next/link";
import {
  LuHexagon,
  LuTrendingUp,
  LuBookOpen,
  LuGraduationCap,
  LuArrowRight,
  LuCalendarDays,
  LuStickyNote,
  LuExternalLink,
  LuFileUp,
  LuSparkles,
} from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { FaChartPie } from "react-icons/fa";
import { Button } from "../components/shadcn-ui/button";

const features = [
  {
    title: "Evolução do CR",
    description:
      "Gráficos detalhados mostrando a curva do seu Coeficiente de Rendimento semestre a semestre. Visualize seu progresso e identifique padrões no seu desempenho acadêmico.",
    icon: <LuTrendingUp className="text-2xl" />,
    accent: "#007AFF",
  },
  {
    title: "Grade Curricular Visual",
    description:
      "Navegue pelas disciplinas concluídas, cursando e pendentes com filtros de status intuitivos. Planeje seus próximos semestres com clareza total.",
    icon: <LuBookOpen className="text-2xl" />,
    accent: "#00FF88",
  },
  {
    title: "Carga Horária Inteligente",
    description:
      "Distribuição visual de horas obrigatórias, optativas e complementares. Saiba exatamente quanto falta para sua formatura e planeje estrategicamente.",
    icon: <FaChartPie className="text-2xl" />,
    accent: "#FFB020",
  },
  {
    title: "Sincronização com Google Calendar",
    description:
      "Adicione datas de provas, trabalhos e seminários no Netuno e sincronize automaticamente com seu Google Calendar. Nunca mais perca um prazo importante.",
    icon: <LuCalendarDays className="text-2xl" />,
    accent: "#FF3B30",
  },
  {
    title: "Murais de Anotações",
    description:
      "Organize conteúdos de provas, tópicos de seminários e lembretes por disciplina. Tenha tudo centralizado e acessível quando precisar revisar.",
    icon: <LuStickyNote className="text-2xl" />,
    accent: "#AF52DE",
  },
  {
    title: "Links Rápidos Personalizados",
    description:
      "Crie atalhos diretos para o portal da faculdade, sistemas acadêmicos e outros recursos externos que você usa frequentemente. Tudo a um clique de distância.",
    icon: <LuExternalLink className="text-2xl" />,
    accent: "#5AC8FA",
  },
];

const steps = [
  {
    number: "01",
    title: "Importe seu histórico",
    description:
      "Faça upload do PDF do seu histórico acadêmico. O Netuno extrai automaticamente todas as disciplinas, notas e informações relevantes.",
    icon: <LuFileUp className="text-xl" />,
  },
  {
    number: "02",
    title: "Visualize seus dados",
    description:
      "Acesse gráficos interativos, acompanhe a evolução do seu CR e veja sua grade curricular organizada por status e período.",
    icon: <LuTrendingUp className="text-xl" />,
  },
  {
    number: "03",
    title: "Gerencie sua rotina",
    description:
      "Adicione datas de provas, crie anotações por disciplina, sincronize com seu calendário e mantenha tudo sob controle.",
    icon: <FiCheckCircle className="text-xl" />,
  },
];

const benefits = [
  "Importação automática de dados do histórico em PDF",
  "Gráficos de evolução do CR ao longo dos semestres",
  "Controle de horas complementares, obrigatórias e optativas",
  "Sincronização unidirecional com Google Calendar",
  "Murais de anotações organizados por disciplina",
  "Links personalizados para recursos externos",
  "Interface dark otimizada para longas sessões de estudo",
  "Dados 100% privados e sob seu controle",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#E0E0E0] selection:bg-[#007AFF]/30 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-[#1A1A1A] bg-[#000000]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuHexagon className="text-[#007AFF] text-3xl" />
            <span className="text-xl font-bold tracking-tight">Netuno</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-[#888888] hover:text-[#E0E0E0] hover:bg-[#121212]"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/login?tab=register">
              <Button className="bg-[#E0E0E0] text-[#000000] hover:bg-[#CCCCCC] font-semibold">
                Começar agora
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24 lg:py-40 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-sm font-medium">
            <LuGraduationCap className="text-base" />
            <span>Feito de estudantes para estudantes</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight max-w-4xl bg-gradient-to-b from-[#FFFFFF] to-[#888888] bg-clip-text text-transparent">
            Domine sua jornada na Licenciatura com dados.
          </h1>

          <p className="text-lg lg:text-xl text-[#888888] max-w-2xl leading-relaxed">
            O Netuno é o seu painel de controle acadêmico. Acompanhe seu
            Coeficiente de Rendimento, gerencie horas complementares e preveja
            seus próximos semestres em uma interface inteligente e escura.
          </p>

          <Link href="/login?tab=register" className="mt-6">
            <Button className="h-14 px-8 text-lg bg-[#007AFF] text-white hover:bg-[#007AFF]/90 font-bold rounded-full flex items-center gap-2 shadow-lg shadow-[#007AFF]/20">
              Criar conta gratuitamente
              <LuArrowRight className="text-xl" />
            </Button>
          </Link>
        </section>

        {/* Import PDF Highlight Section */}
        <section className="w-full bg-gradient-to-br from-[#007AFF]/10 via-[#000000] to-[#000000] border-y border-[#007AFF]/20 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/30 text-[#007AFF] text-sm font-medium">
                  <LuSparkles className="text-base" />
                  <span>Recurso exclusivo</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Importação automática do seu histórico
                </h2>

                <p className="text-lg text-[#888888] leading-relaxed">
                  Esqueça a digitação manual de dezenas de disciplinas. Faça
                  upload do PDF do seu histórico acadêmico e deixe o Netuno
                  extrair automaticamente todas as suas disciplinas, notas,
                  carga horária e status.
                </p>

                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-[#00FF88] text-xl flex-shrink-0 mt-0.5" />
                    <p className="text-[#E0E0E0]">
                      Reconhecimento inteligente de dados do histórico
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-[#00FF88] text-xl flex-shrink-0 mt-0.5" />
                    <p className="text-[#E0E0E0]">
                      Extração automática de notas, CR e carga horária
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-[#00FF88] text-xl flex-shrink-0 mt-0.5" />
                    <p className="text-[#E0E0E0]">
                      Organização instantânea por período e status
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-8 flex flex-col items-center justify-center gap-6 min-h-[400px]">
                <div className="w-20 h-20 rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/30 flex items-center justify-center">
                  <LuFileUp className="text-[#007AFF] text-4xl" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">
                    Arraste seu PDF aqui
                  </h3>
                  <p className="text-[#888888]">ou clique para selecionar</p>
                </div>
                <div className="text-xs text-[#555555] text-center max-w-xs">
                  Formatos aceitos: PDF do histórico acadêmico oficial da sua
                  instituição
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-[#000000] py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16 gap-4">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="text-[#888888] text-lg max-w-2xl">
                Esqueça as planilhas confusas. Tenha métricas precisas sobre o
                seu desempenho acadêmico atualizadas em tempo real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 rounded-2xl flex flex-col gap-4 hover:border-[#222222] transition-all duration-300 group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300"
                    style={{
                      color: feature.accent,
                      backgroundColor: `${feature.accent}1A`,
                    }}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-[#888888] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full bg-[#121212] border-y border-[#1A1A1A] py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16 gap-4">
              <h2 className="text-3xl lg:text-4xl font-bold">Como funciona</h2>
              <p className="text-[#888888] text-lg max-w-2xl">
                Configure sua conta e comece a gerenciar sua vida acadêmica em
                minutos. É simples, rápido e intuitivo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col gap-4 relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[calc(100%)] w-full h-[2px] bg-gradient-to-r from-[#007AFF]/50 to-transparent" />
                  )}

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/10 border-2 border-[#007AFF]/30 flex items-center justify-center text-2xl font-bold text-[#007AFF]">
                      {step.number}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#000000] border border-[#1A1A1A] flex items-center justify-center text-[#007AFF]">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-[#888888] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full bg-[#000000] py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-6">
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                  Por que escolher o Netuno?
                </h2>
                <p className="text-lg text-[#888888] leading-relaxed">
                  Uma plataforma completa projetada especificamente para
                  estudantes universitários que querem ter controle total sobre
                  sua trajetória acadêmica.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-[#0A0A0A] border border-[#1A1A1A] p-4 rounded-lg hover:border-[#222222] transition-colors"
                  >
                    <FiCheckCircle className="text-[#00FF88] text-xl flex-shrink-0 mt-0.5" />
                    <p className="text-[#E0E0E0]">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-gradient-to-b from-[#000000] via-[#007AFF]/5 to-[#000000] border-y border-[#007AFF]/10 py-24">
          <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-8">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Pronto para transformar sua experiência acadêmica?
            </h2>
            <p className="text-lg lg:text-xl text-[#888888] max-w-2xl">
              Junte-se aos estudantes que já estão no controle de sua jornada
              universitária. É gratuito para começar.
            </p>
            <Link href="/login?tab=register">
              <Button className="h-14 px-8 text-lg bg-[#007AFF] text-white hover:bg-[#007AFF]/90 font-bold rounded-full flex items-center gap-2 shadow-lg shadow-[#007AFF]/20">
                Criar conta gratuitamente
                <LuArrowRight className="text-xl" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#000000] border-t border-[#1A1A1A] py-10 text-center">
        <p className="text-[#555555] text-sm">
          &copy; {new Date().getFullYear()} Netuno. Desenvolvido para facilitar
          a vida universitária.
        </p>
      </footer>
    </div>
  );
}
