import { RiErrorWarningLine } from "react-icons/ri";

const AttentionRequiredCard = () => {
  return (
    <div className="w-full h-72 p-4 rounded-3xl border border-white/50 bg-transparent text-white flex flex-col gap-8">
      <h1 className="flex items-center gap-2 font-semibold text-[#888888]">
        <RiErrorWarningLine className="inline" /> Atenção Requerida
      </h1>
      <p className="text-6xl text-[#FFB020]">2</p>
      <p className="text-[#888888]">
        Disciplinas próximas do limite de faltas.
      </p>
    </div>
  );
};

export default AttentionRequiredCard;
