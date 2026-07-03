import { useState } from "react";
import Cookies from "js-cookie";

export type WidgetId =
  | "yield"
  | "progress"
  | "average"
  | "distribution"
  | "attention"
  | "course_status"
  | "semester";

const DEFAULT_LAYOUT: WidgetId[] = [
  "yield",
  "progress",
  "average",
  "distribution",
  "attention",
  "course_status",
  "semester",
];

const DEFAULT_VISIBILITY: Record<WidgetId, boolean> = {
  yield: true,
  progress: true,
  average: true,
  distribution: true,
  attention: true,
  course_status: true,
  semester: true,
};

export function useDashboardLayout() {
  const [layout, setLayout] = useState<WidgetId[]>(() => {
    const savedLayout = Cookies.get("dash_layout");
    if (!savedLayout) return DEFAULT_LAYOUT;

    try {
      return JSON.parse(savedLayout) as WidgetId[];
    } catch {
      return DEFAULT_LAYOUT;
    }
  });

  const [visibility, setVisibility] = useState<Record<WidgetId, boolean>>(
    () => {
      const savedVis = Cookies.get("dash_vis");
      if (!savedVis) return DEFAULT_VISIBILITY;

      try {
        return JSON.parse(savedVis) as Record<WidgetId, boolean>;
      } catch {
        return DEFAULT_VISIBILITY;
      }
    },
  );

  const isLoaded = true;

  const updateLayout = (newLayout: WidgetId[]) => {
    setLayout(newLayout);
    Cookies.set("dash_layout", JSON.stringify(newLayout));
  };

  const toggleVisibility = (id: WidgetId) => {
    const newVis = { ...visibility, [id]: !visibility[id] };
    setVisibility(newVis);
    Cookies.set("dash_vis", JSON.stringify(newVis));
  };

  return { layout, visibility, updateLayout, toggleVisibility, isLoaded };
}
