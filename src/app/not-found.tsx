import { LuRocket } from "react-icons/lu";
import { Metadata } from "next";
import Link from "next/link";

import { auth } from "../auth";

import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Buraco negro - Netuno",
};

function StarField() {
  return (
    <div
      className={`pointer-events-none absolute inset-0 opacity-60 ${styles.starField}`}
    />
  );
}

function OrbitRing() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex h-full w-full items-center justify-end overflow-hidden">
      <div className="relative h-screen w-[100vh] translate-x-[50%] animate-[spin_120s_linear_infinite] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_70%)] sm:h-[150vh] sm:w-[150vh] sm:translate-x-[60%]">
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          className="z-50 h-full w-full text-[#007AFF] opacity-50 sm:opacity-100"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      </div>
    </div>
  );
}

async function ReturnButton() {
  const session = await auth();
  const url = session?.user ? "/dashboard" : "/";
  return (
    <Link
      href={url}
      className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#007AFF] px-6 py-3.5 text-xs font-bold text-white transition-all hover:scale-105 hover:bg-[#005bb5] hover:shadow-[0_0_50px_rgba(0,122,255,0.6)] sm:mt-12 sm:w-auto sm:gap-3 sm:px-8 sm:py-4 sm:text-sm"
    >
      <LuRocket className="h-4 w-4 sm:h-5 sm:w-5" />
      Retornar à Base
    </Link>
  );
}

function NotFoundContent() {
  return (
    <div className="relative z-10 flex w-full max-w-md flex-col items-center px-4 text-center sm:px-6">
      <h1 className="bg-linear-to-b from-white to-zinc-800 bg-clip-text text-[100px] leading-none font-black tracking-tighter text-transparent select-none sm:text-[160px]">
        404
      </h1>
      <h2 className="mt-4 px-2 text-2xl font-bold tracking-tight text-[#E0E0E0] sm:mt-6 sm:text-3xl md:text-4xl">
        Perdido na Órbita de Netuno?
      </h2>
      <p className="mt-3 max-w-70 text-sm leading-relaxed text-zinc-400 sm:mt-5 sm:max-w-md sm:text-base">
        O sinal foi perdido ou você acidentalmente entrou em um buraco negro...
      </p>
      <ReturnButton />
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[#000000] text-white">
      <StarField />
      <OrbitRing />
      <NotFoundContent />
    </div>
  );
}
