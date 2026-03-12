"use client";

import { FaChartPie } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import {
  LuArrowRight,
  LuBookOpen,
  LuCalendarDays,
  LuExternalLink,
  LuFileUp,
  LuGraduationCap,
  LuSparkles,
  LuStickyNote,
  LuTrendingUp,
} from "react-icons/lu";
import Link from "next/link";

import { Button } from "../components/shadcn-ui/button";

const features = [
  {
    title: "Evolução do CR",
    description:
      "Gráficos detalhados mostrando a curva do seu Coeficiente de Rendimento semestre a semestre. Visualize seu progresso e identifique padrões no seu desempenho acadêmico.",
    icon: <LuTrendingUp className="text-xl sm:text-2xl" />,
    accent: "#007AFF",
  },
  {
    title: "Grade Curricular Visual",
    description:
      "Navegue pelas disciplinas concluídas, cursando e pendentes com filtros de status intuitivos. Planeje seus próximos semestres com clareza total.",
    icon: <LuBookOpen className="text-xl sm:text-2xl" />,
    accent: "#00FF88",
  },
  {
    title: "Carga Horária Inteligente",
    description:
      "Distribuição visual de horas obrigatórias, optativas e complementares. Saiba exatamente quanto falta para sua formatura e planeje estrategicamente.",
    icon: <FaChartPie className="text-xl sm:text-2xl" />,
    accent: "#FFB020",
  },
  {
    title: "Sincronização com Google Calendar",
    description:
      "Adicione datas de provas, trabalhos e seminários no Netuno e sincronize automaticamente com seu Google Calendar. Nunca mais perca um prazo importante.",
    icon: <LuCalendarDays className="text-xl sm:text-2xl" />,
    accent: "#FF3B30",
  },
  {
    title: "Murais de Anotações",
    description:
      "Organize conteúdos de provas, tópicos de seminários e lembretes por disciplina. Tenha tudo centralizado e acessível quando precisar revisar.",
    icon: <LuStickyNote className="text-xl sm:text-2xl" />,
    accent: "#AF52DE",
  },
  {
    title: "Links Rápidos Personalizados",
    description:
      "Crie atalhos diretos para o portal da faculdade, sistemas acadêmicos e outros recursos externos que você usa frequentemente. Tudo a um clique de distância.",
    icon: <LuExternalLink className="text-xl sm:text-2xl" />,
    accent: "#5AC8FA",
  },
];

const steps = [
  {
    number: "01",
    title: "Importe seu histórico",
    description:
      "Faça upload do PDF do seu histórico acadêmico. O Netuno extrai automaticamente todas as disciplinas, notas e informações relevantes.",
    icon: <LuFileUp className="text-lg sm:text-xl" />,
  },
  {
    number: "02",
    title: "Visualize seus dados",
    description:
      "Acesse gráficos interativos, acompanhe a evolução do seu CR e veja sua grade curricular organizada por status e período.",
    icon: <LuTrendingUp className="text-lg sm:text-xl" />,
  },
  {
    number: "03",
    title: "Gerencie sua rotina",
    description:
      "Adicione datas de provas, crie anotações por disciplina, sincronize com seu calendário e mantenha tudo sob controle.",
    icon: <FiCheckCircle className="text-lg sm:text-xl" />,
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
    <div className="flex h-full w-full flex-col overflow-x-hidden bg-[#000000] text-[#E0E0E0] selection:bg-[#007AFF]/30">
      <main className="flex flex-1 flex-col items-center">
        <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:gap-8 sm:px-6 sm:py-24 lg:py-40">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#007AFF]/20 bg-[#007AFF]/10 px-3 py-1 text-xs font-medium text-[#007AFF] sm:gap-2 sm:px-4 sm:py-1.5 sm:text-sm">
            <LuGraduationCap className="shrink-0 text-sm sm:text-base" />
            <span className="truncate">
              Feito de estudantes para estudantes
            </span>
          </div>

          <h1 className="max-w-4xl bg-linear-to-b from-[#FFFFFF] to-[#888888] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-7xl">
            Domine sua jornada na Licenciatura com dados.
          </h1>

          <p className="max-w-2xl px-2 text-base leading-relaxed text-[#888888] sm:px-0 sm:text-lg lg:text-xl">
            O Netuno é o seu painel de controle acadêmico. Acompanhe seu
            Coeficiente de Rendimento, gerencie horas complementares e preveja
            seus próximos semestres em uma interface inteligente e escura.
          </p>

          <Link
            href="/login?tab=register"
            className="mt-4 w-full sm:mt-6 sm:w-auto"
          >
            <Button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#007AFF] px-6 text-base font-bold text-white shadow-lg shadow-[#007AFF]/20 transition-transform hover:scale-105 hover:bg-[#007AFF]/90 sm:h-14 sm:w-auto sm:px-8 sm:text-lg">
              Criar conta gratuitamente
              <LuArrowRight className="shrink-0 text-lg sm:text-xl" />
            </Button>
          </Link>
        </section>

        <section className="w-full border-y border-[#007AFF]/20 bg-linear-to-br from-[#007AFF]/10 via-[#000000] to-[#000000] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="order-2 flex flex-col gap-5 sm:gap-6 lg:order-1">
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#007AFF]/30 bg-[#007AFF]/10 px-3 py-1 text-xs font-medium text-[#007AFF] sm:gap-2 sm:text-sm">
                  <LuSparkles className="shrink-0 text-sm sm:text-base" />
                  <span>Recurso exclusivo</span>
                </div>

                <h2 className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                  Importação automática do seu histórico
                </h2>

                <p className="text-base leading-relaxed text-[#888888] sm:text-lg">
                  Esqueça a digitação manual de dezenas de disciplinas. Faça
                  upload do PDF do seu histórico acadêmico e deixe o Netuno
                  extrair automaticamente todas as suas disciplinas, notas,
                  carga horária e status.
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:mt-4">
                  {[
                    "Reconhecimento inteligente de dados do histórico",
                    "Extração automática de notas, CR e carga horária",
                    "Organização instantânea por período e status",
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3">
                      <FiCheckCircle className="mt-1 shrink-0 text-lg text-[#00FF88] sm:text-xl" />
                      <p className="text-sm text-[#E0E0E0] sm:text-base">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative order-1 flex min-h-[300px] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 sm:min-h-[400px] sm:gap-6 sm:p-8 lg:order-2">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#007AFF]/5 to-transparent" />
                <div className="z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#007AFF]/30 bg-[#007AFF]/10 sm:h-20 sm:w-20">
                  <LuFileUp className="text-3xl text-[#007AFF] sm:text-4xl" />
                </div>
                <div className="z-10 text-center">
                  <h3 className="mb-1 text-lg font-bold sm:mb-2 sm:text-xl">
                    Arraste seu PDF aqui
                  </h3>
                  <p className="text-sm text-[#888888] sm:text-base">
                    ou clique para selecionar
                  </p>
                </div>
                <div className="z-10 mt-2 max-w-xs text-center text-[10px] text-[#555555] sm:text-xs">
                  Formatos aceitos: PDF do histórico acadêmico oficial da sua
                  instituição
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-[#000000] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-16 sm:gap-4">
              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="max-w-2xl text-base text-[#888888] sm:text-lg">
                Esqueça as planilhas confusas. Tenha métricas precisas sobre o
                seu desempenho acadêmico atualizadas em tempo real.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex flex-col gap-3 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#222222] sm:gap-4 sm:p-8"
                >
                  <div
                    className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:mb-2 sm:h-12 sm:w-12"
                    style={{
                      color: feature.accent,
                      backgroundColor: `${feature.accent}1A`,
                    }}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-lg font-bold sm:text-xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#888888] sm:text-base">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full border-y border-[#1A1A1A] bg-[#121212] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-16 sm:gap-4">
              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                Como funciona
              </h2>
              <p className="max-w-2xl text-base text-[#888888] sm:text-lg">
                Configure sua conta e comece a gerenciar sua vida acadêmica em
                minutos. É simples, rápido e intuitivo.
              </p>
            </div>

            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
              <div className="absolute top-8 right-[15%] left-[15%] -z-10 hidden h-0.5 bg-[#1A1A1A] md:block" />

              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative flex flex-col gap-3 bg-[#121212] sm:gap-4"
                >
                  <div className="flex flex-row items-center gap-4 md:flex-col md:items-start">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#007AFF]/30 bg-[#007AFF]/10 text-xl font-bold text-[#007AFF] sm:h-16 sm:w-16 sm:text-2xl">
                      {step.number}
                    </div>
                    <div className="absolute top-[52px] right-4 hidden h-10 w-10 items-center justify-center rounded-full border border-[#1A1A1A] bg-[#000000] text-[#007AFF] md:flex lg:right-12">
                      {step.icon}
                    </div>

                    <div className="flex flex-col md:hidden">
                      <h3 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
                        {step.title}
                        <div className="text-[#007AFF]">{step.icon}</div>
                      </h3>
                    </div>
                  </div>

                  <div className="mt-2 hidden md:block">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                  </div>

                  <p className="text-sm leading-relaxed text-[#888888] sm:text-base">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-[#000000] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col gap-4 text-center sm:gap-6 lg:text-left">
                <h2 className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                  Por que escolher o Netuno?
                </h2>
                <p className="text-base leading-relaxed text-[#888888] sm:text-lg">
                  Uma plataforma completa projetada especificamente para
                  estudantes universitários que querem ter controle total sobre
                  sua trajetória acadêmica.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 transition-colors hover:border-[#222222] sm:gap-3"
                  >
                    <FiCheckCircle className="mt-0.5 shrink-0 text-lg text-[#00FF88] sm:text-xl" />
                    <p className="text-sm text-[#E0E0E0] sm:text-base">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full border-y border-[#007AFF]/10 bg-gradient-to-b from-[#000000] via-[#007AFF]/5 to-[#000000] py-16 sm:py-24">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 text-center sm:gap-8 sm:px-6">
            <h2 className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              Pronto para transformar sua experiência acadêmica?
            </h2>
            <p className="max-w-2xl text-base text-[#888888] sm:text-lg lg:text-xl">
              Junte-se aos estudantes que já estão no controle de sua jornada
              universitária. É gratuito para começar.
            </p>
            <Link href="/login?tab=register" className="mt-2 w-full sm:w-auto">
              <Button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#007AFF] px-6 text-base font-bold text-white shadow-lg shadow-[#007AFF]/20 transition-transform hover:scale-105 hover:bg-[#007AFF]/90 sm:h-14 sm:w-auto sm:px-8 sm:text-lg">
                Criar conta gratuitamente
                <LuArrowRight className="shrink-0 text-lg sm:text-xl" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-[#1A1A1A] bg-[#000000] px-4 py-8 text-center sm:py-10">
        <p className="text-xs text-[#555555] sm:text-sm">
          &copy; {new Date().getFullYear()} Netuno. Desenvolvido para facilitar
          a vida universitária.
        </p>
      </footer>
    </div>
  );
}
