export type SubjectStatus =
  | "aprovado"
  | "reprovado_falta"
  | "reprovado_media"
  | "final"
  | "cursando";

type UFALResult = {
  status: SubjectStatus;
  currentAverage: number;
  neededForFinal: number;
};

function hasFailedByAbsence(
  currentAbsences: number,
  maxAbsences: number,
): boolean {
  return currentAbsences > maxAbsences;
}

function applyReavToLowerGrade(
  ab1: number | null,
  ab2: number | null,
  reav: number | null,
): { finalAB1: number; finalAB2: number } {
  const n1 = ab1 ?? 0;
  const n2 = ab2 ?? 0;

  let finalAB1 = n1;
  let finalAB2 = n2;

  if (reav === null) return { finalAB1, finalAB2 };

  if (n1 <= n2 && reav > n1) finalAB1 = reav;
  else if (n2 < n1 && reav > n2) finalAB2 = reav;

  return { finalAB1, finalAB2 };
}

function calculatePartialAverage(finalAB1: number, finalAB2: number): number {
  return (finalAB1 + finalAB2) / 2;
}

function getStatusBeforeFinal(
  ab1: number | null,
  ab2: number | null,
  partialAverage: number,
): UFALResult | null {
  if (ab1 === null || ab2 === null) {
    return {
      status: "cursando",
      currentAverage: partialAverage,
      neededForFinal: 0,
    };
  }

  if (partialAverage >= 7.0) {
    return {
      status: "aprovado",
      currentAverage: partialAverage,
      neededForFinal: 0,
    };
  }

  if (partialAverage < 5.0) {
    return {
      status: "reprovado_media",
      currentAverage: partialAverage,
      neededForFinal: 0,
    };
  }

  return null;
}

function getFinalExamResult(
  partialAverage: number,
  finalExam: number,
): UFALResult {
  const finalAverage = (partialAverage + finalExam) / 2;

  if (finalAverage >= 5.5) {
    return {
      status: "aprovado",
      currentAverage: finalAverage,
      neededForFinal: 0,
    };
  }

  return {
    status: "reprovado_media",
    currentAverage: finalAverage,
    neededForFinal: 0,
  };
}

function getNeededForFinal(partialAverage: number): number {
  return Math.max(0, 11 - partialAverage);
}

export function calculateUFALStatus(
  ab1: number | null,
  ab2: number | null,
  reav: number | null,
  finalExam: number | null,
  currentAbsences: number,
  maxAbsences: number,
): UFALResult {
  if (hasFailedByAbsence(currentAbsences, maxAbsences)) {
    return { status: "reprovado_falta", currentAverage: 0, neededForFinal: 0 };
  }

  const { finalAB1, finalAB2 } = applyReavToLowerGrade(ab1, ab2, reav);
  const partialAverage = calculatePartialAverage(finalAB1, finalAB2);

  const preFinalStatus = getStatusBeforeFinal(ab1, ab2, partialAverage);
  if (preFinalStatus) return preFinalStatus;

  if (finalExam !== null) {
    return getFinalExamResult(partialAverage, finalExam);
  }

  return {
    status: "final",
    currentAverage: partialAverage,
    neededForFinal: getNeededForFinal(partialAverage),
  };
}
