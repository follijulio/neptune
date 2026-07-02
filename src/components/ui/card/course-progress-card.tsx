"use client";

import { TbTargetArrow } from "react-icons/tb";

interface CourseProgressCardProps {
  hoursTotal: number;
  hoursCompleted: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const calculateProgress = (completed: number, total: number): number => {
  if (total <= 0) return 0;
  return clamp(Math.round((completed / total) * 100), 0, 100);
};

const SimpleProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="mt-6 w-full">
      <div className="relative h-3 w-full overflow-hidden rounded-2xl bg-zinc-800/60">
        <div
          className="h-full rounded-2xl bg-linear-to-r from-[#007AFF] to-[#0099FF] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  hoursTotal,
  hoursCompleted,
}) => {
  const progress = calculateProgress(hoursCompleted, hoursTotal);

  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 text-white shadow-lg sm:p-5 lg:p-6">
      <div>
        <header className="flex items-center gap-2 text-sm font-semibold tracking-wider text-zinc-400 ">
          <TbTargetArrow className="shrink-0" />
          <span>Progresso do Curso</span>
        </header>

        <div className="mt-5 min-w-0">
          <span className="block text-4xl leading-none font-light tabular-nums sm:text-5xl lg:text-6xl">
            {progress}%
          </span>
          <span className="mt-2 block text-sm text-zinc-500">
            {hoursCompleted} / {hoursTotal} horas
          </span>
        </div>
      </div>

      <SimpleProgressBar progress={progress} />
    </div>
  );
};