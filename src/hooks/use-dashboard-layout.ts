import { useEffect, useState } from "react";

export type WidgetId = "yield" | "progress" | "average" | "distribution" | "attention" | "course_status" | "semester";

const DEFAULT_LAYOUT: WidgetId[] = [
  "yield", "progress", "average", "distribution", "attention", "course_status", "semester"
];

const DEFAULT_VISIBILITY: Record<WidgetId, boolean> = {
  yield: true, progress: true, average: true, distribution: true, 
  attention: true, course_status: true, semester: true
};

export function useDashboardLayout() {
  const [layout, setLayout] = useState<WidgetId[]>(DEFAULT_LAYOUT);
  const [visibility, setVisibility] = useState<Record<WidgetId, boolean>>(DEFAULT_VISIBILITY);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLayout = Cookies.get("dash_layout");
    const savedVis = Cookies.get("dash_vis");
    if (savedLayout) setLayout(JSON.parse(savedLayout));
    if (savedVis) setVisibility(JSON.parse(savedVis));
    setIsLoaded(true);
  }, []);

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