export const PLANETARY_LEVELS = [
  {
    name: "Mercúrio",
    xpRequired: 0,
    color: "text-zinc-400",
    shadow: "shadow-zinc-400",
  },
  {
    name: "Vênus",
    xpRequired: 1200,
    color: "text-orange-400",
    shadow: "shadow-orange-400",
  },
  {
    name: "Terra",
    xpRequired: 2500,
    color: "text-blue-400",
    shadow: "shadow-blue-400",
  },
  {
    name: "Marte",
    xpRequired: 4000,
    color: "text-red-500",
    shadow: "shadow-red-500",
  },
  {
    name: "Júpiter",
    xpRequired: 6000,
    color: "text-amber-500",
    shadow: "shadow-amber-500",
  },
  {
    name: "Saturno",
    xpRequired: 7500,
    color: "text-yellow-200",
    shadow: "shadow-yellow-200",
  },
  {
    name: "Urano",
    xpRequired: 9000,
    color: "text-cyan-300",
    shadow: "shadow-cyan-300",
  },
  {
    name: "Netuno",
    xpRequired: 10000,
    color: "text-[#007AFF]",
    shadow: "shadow-[#007AFF]",
  },
];

export function getUserPlanet(xp: number) {
  let current = PLANETARY_LEVELS[0];
  let next = PLANETARY_LEVELS[1];

  for (let i = 0; i < PLANETARY_LEVELS.length; i++) {
    if (xp >= PLANETARY_LEVELS[i].xpRequired) {
      current = PLANETARY_LEVELS[i];
      next = PLANETARY_LEVELS[i + 1] || PLANETARY_LEVELS[i];
    }
  }

  const progress =
    next.name === current.name
      ? 100
      : ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) *
        100;

  return { current, next, progress };
}