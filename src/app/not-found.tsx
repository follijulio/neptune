import { LuRocket } from "react-icons/lu";
import Link from "next/link";

const STAR_BACKGROUND_STYLE: React.CSSProperties = {
  backgroundImage: `
    radial-gradient(circle at 15% 50%, rgba(255, 255, 255, 0.5) 1px, transparent 1px),
    radial-gradient(circle at 85% 30%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
    radial-gradient(circle at 20% 10%, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    radial-gradient(circle at 75% 85%, rgba(255, 255, 255, 0.7) 1px, transparent 1px)
  `,
  backgroundSize: "300px 300px",
};

function StarField() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-60"
      style={STAR_BACKGROUND_STYLE}
    />
  );
}

function OrbitRing() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex h-full w-full items-center justify-end overflow-hidden">
      <div className="relative h-[150vh] w-[150vh] translate-x-[60%] animate-[spin_120s_linear_infinite] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_70%)]">
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          className="z-50 h-full w-full text-[#007AFF]"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      </div>
    </div>
  );
}

function ReturnButton() {
  return (
    <Link
      href="/"
      className="mt-12 flex items-center gap-3 rounded-xl bg-[#007AFF] px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-[#005bb5] hover:shadow-[0_0_50px_rgba(0,122,255,0.6)]"
    >
      <LuRocket className="h-5 w-5" />
      Retornar à Base
    </Link>
  );
}

function NotFoundContent() {
  return (
    <div className="relative z-10 flex flex-col items-center px-6 text-center">
      <h1 className="bg-linear-to-b from-white to-zinc-800 bg-clip-text text-[160px] leading-none font-black tracking-tighter text-transparent select-none">
        404
      </h1>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#E0E0E0] sm:text-4xl">
        Perdido na Órbita de Netuno?
      </h2>
      <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400">
        O sinal foi perdido ou você acidentalmente entrou em um buraco negro...
      </p>
      <ReturnButton />
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#000000] text-white">
      <StarField />
      <OrbitRing />
      <NotFoundContent />
    </div>
  );
}
