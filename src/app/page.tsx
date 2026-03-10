import Link from "next/link";
import {
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
import { Logo } from "../components/ui/nav-bar";

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
    <div className="flex min-h-screen w-full flex-col bg-[#000000] text-[#E0E0E0] selection:bg-[#007AFF]/30">
      <header className="sticky top-0 z-50 w-full border-b border-[#1A1A1A] bg-[#000000]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Logo />
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-[#888888] hover:bg-[#121212] hover:text-[#E0E0E0]"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/login?tab=register">
              <Button className="bg-[#E0E0E0] font-semibold text-[#000000] hover:bg-[#CCCCCC]">
                Começar agora
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-24 text-center lg:py-40">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#007AFF]/20 bg-[#007AFF]/10 px-3 py-1 text-sm font-medium text-[#007AFF]">
            <LuGraduationCap className="text-base" />
            <span>Feito de estudantes para estudantes</span>
          </div>

          <h1 className="max-w-4xl bg-gradient-to-b from-[#FFFFFF] to-[#888888] bg-clip-text text-5xl font-extrabold tracking-tight text-transparent lg:text-7xl">
            Domine sua jornada na Licenciatura com dados.
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-[#888888] lg:text-xl">
            O Netuno é o seu painel de controle acadêmico. Acompanhe seu
            Coeficiente de Rendimento, gerencie horas complementares e preveja
            seus próximos semestres em uma interface inteligente e escura.
          </p>

          <Link href="/login?tab=register" className="mt-6">
            <Button className="flex h-14 items-center gap-2 rounded-full bg-[#007AFF] px-8 text-lg font-bold text-white shadow-lg shadow-[#007AFF]/20 hover:bg-[#007AFF]/90">
              Criar conta gratuitamente
              <LuArrowRight className="text-xl" />
            </Button>
          </Link>
        </section>

        <section className="w-full border-y border-[#007AFF]/20 bg-linear-to-br from-[#007AFF]/10 via-[#000000] to-[#000000] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#007AFF]/30 bg-[#007AFF]/10 px-3 py-1 text-sm font-medium text-[#007AFF]">
                  <LuSparkles className="text-base" />
                  <span>Recurso exclusivo</span>
                </div>

                <h2 className="text-4xl leading-tight font-bold lg:text-5xl">
                  Importação automática do seu histórico
                </h2>

                <p className="text-lg leading-relaxed text-[#888888]">
                  Esqueça a digitação manual de dezenas de disciplinas. Faça
                  upload do PDF do seu histórico acadêmico e deixe o Netuno
                  extrair automaticamente todas as suas disciplinas, notas,
                  carga horária e status.
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-[#00FF88]" />
                    <p className="text-[#E0E0E0]">
                      Reconhecimento inteligente de dados do histórico
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-[#00FF88]" />
                    <p className="text-[#E0E0E0]">
                      Extração automática de notas, CR e carga horária
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-[#00FF88]" />
                    <p className="text-[#E0E0E0]">
                      Organização instantânea por período e status
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#007AFF]/30 bg-[#007AFF]/10">
                  <LuFileUp className="text-4xl text-[#007AFF]" />
                </div>
                <div className="text-center">
                  <h3 className="mb-2 text-xl font-bold">
                    Arraste seu PDF aqui
                  </h3>
                  <p className="text-[#888888]">ou clique para selecionar</p>
                </div>
                <div className="max-w-xs text-center text-xs text-[#555555]">
                  Formatos aceitos: PDF do histórico acadêmico oficial da sua
                  instituição
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-[#000000] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 flex flex-col items-center gap-4 text-center">
              <h2 className="text-3xl font-bold lg:text-4xl">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="max-w-2xl text-lg text-[#888888]">
                Esqueça as planilhas confusas. Tenha métricas precisas sobre o
                seu desempenho acadêmico atualizadas em tempo real.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex flex-col gap-4 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-8 transition-all duration-300 hover:border-[#222222]"
                >
                  <div
                    className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      color: feature.accent,
                      backgroundColor: `${feature.accent}1A`,
                    }}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="leading-relaxed text-[#888888]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full border-y border-[#1A1A1A] bg-[#121212] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 flex flex-col items-center gap-4 text-center">
              <h2 className="text-3xl font-bold lg:text-4xl">Como funciona</h2>
              <p className="max-w-2xl text-lg text-[#888888]">
                Configure sua conta e comece a gerenciar sua vida acadêmica em
                minutos. É simples, rápido e intuitivo.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.number} className="relative flex flex-col gap-4">
                  {index < steps.length - 1 && (
                    <div className="absolute top-12 left-[calc(100%)] hidden h-[2px] w-full bg-gradient-to-r from-[#007AFF]/50 to-transparent md:block" />
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#007AFF]/30 bg-[#007AFF]/10 text-2xl font-bold text-[#007AFF]">
                      {step.number}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1A1A1A] bg-[#000000] text-[#007AFF]">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="leading-relaxed text-[#888888]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-[#000000] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <h2 className="text-3xl leading-tight font-bold lg:text-4xl">
                  Por que escolher o Netuno?
                </h2>
                <p className="text-lg leading-relaxed text-[#888888]">
                  Uma plataforma completa projetada especificamente para
                  estudantes universitários que querem ter controle total sobre
                  sua trajetória acadêmica.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] p-4 transition-colors hover:border-[#222222]"
                  >
                    <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-[#00FF88]" />
                    <p className="text-[#E0E0E0]">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full border-y border-[#007AFF]/10 bg-gradient-to-b from-[#000000] via-[#007AFF]/5 to-[#000000] py-24">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center">
            <h2 className="text-4xl leading-tight font-bold lg:text-5xl">
              Pronto para transformar sua experiência acadêmica?
            </h2>
            <p className="max-w-2xl text-lg text-[#888888] lg:text-xl">
              Junte-se aos estudantes que já estão no controle de sua jornada
              universitária. É gratuito para começar.
            </p>
            <Link href="/login?tab=register">
              <Button className="flex h-14 items-center gap-2 rounded-full bg-[#007AFF] px-8 text-lg font-bold text-white shadow-lg shadow-[#007AFF]/20 hover:bg-[#007AFF]/90">
                Criar conta gratuitamente
                <LuArrowRight className="text-xl" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-[#1A1A1A] bg-[#000000] py-10 text-center">
        <p className="text-sm text-[#555555]">
          &copy; {new Date().getFullYear()} Netuno. Desenvolvido para facilitar
          a vida universitária.
        </p>
      </footer>
    </div>
  );
}
