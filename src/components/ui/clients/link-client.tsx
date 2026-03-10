"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/shadcn-ui/button";
import { Input } from "@/src/components/shadcn-ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/shadcn-ui/dialog";
import {
  createLinkAction,
  deleteLinkAction,
} from "@/src/app/actions/links-actions";
import {
  LuPlus,
  LuTrash2,
  LuGlobe,
  LuGraduationCap,
  LuBookOpen,
  LuCalculator,
  LuCode,
  LuExternalLink,
} from "react-icons/lu";
import MainLayout from "../main-layout";

type LinkItem = {
  id: string;
  title: string;
  url: string;
  icon: string;
};

const ICON_MAP: Record<string, React.ElementType> = {
  Globe: LuGlobe,
  GraduationCap: LuGraduationCap,
  BookOpen: LuBookOpen,
  Calculator: LuCalculator,
  Code: LuCode,
};

export default function LinksClient({
  initialLinks = [],
}: {
  initialLinks: LinkItem[];
}) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("Globe");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    let url = formData.get("url") as string;

    if (!title || !url) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    //todo: validar URL melhor, talvez com regex ou uma lib de validação
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const result = await createLinkAction({ title, url, icon: selectedIcon });

    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      router.refresh();
      setLinks([
        ...links,
        { id: Date.now().toString(), title, url, icon: selectedIcon },
      ]);
    }
    setLoading(false);
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();

    setLinks(links.filter((l) => l.id !== id));
    await deleteLinkAction(id);
  }

  return (
    <MainLayout>
      <div className="w-full">
        <header className="mb-10 border-b border-[#1A1A1A] pb-6 flex justify-between items-end">
          <span />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#007AFF] hover:bg-[#005bb5] text-white font-bold gap-2 rounded-xl h-12 px-6 group">
                <LuPlus className="group-hover:rotate-90 transition-transform duration-300" />{" "}
                Adicionar Link
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-[#1A1A1A] text-white sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Adicionar
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-5 pt-4">
                {error && (
                  <p className="text-[#FF3B30] text-sm font-medium">{error}</p>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">
                    Título
                  </label>
                  <Input
                    name="title"
                    placeholder="Ex: SIGAA UFAL, Wolfram Alpha..."
                    className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-[#007AFF]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">
                    URL
                  </label>
                  <Input
                    name="url"
                    placeholder="sigaa.ufal.br"
                    className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-[#007AFF]"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-300">
                    Ícone
                  </label>
                  <div className="flex gap-4">
                    {Object.keys(ICON_MAP).map((iconName) => {
                      const IconComponent = ICON_MAP[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setSelectedIcon(iconName)}
                          className={`p-3 rounded-xl border transition-all ${
                            selectedIcon === iconName
                              ? "bg-[#007AFF]/20 border-[#007AFF] text-[#007AFF]"
                              : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          <IconComponent className="h-6 w-6" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#007AFF] hover:bg-[#005bb5] text-white font-bold h-12 rounded-xl mt-4"
                >
                  {loading ? "A guardar..." : "Guardar Link"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {links.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#1A1A1A] rounded-2xl bg-[#0A0A0A]">
            <p className="text-zinc-500 text-lg">
              Ainda não guardaste nenhum link.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {links.map((link) => {
              const Icon = ICON_MAP[link.icon] || LuGlobe;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-4 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#007AFF]/50 hover:bg-[#007AFF]/5 transition-all duration-300 shadow-lg"
                >
                  <div className="bg-black border border-zinc-800 p-3 rounded-xl group-hover:border-[#007AFF] group-hover:text-[#007AFF] transition-colors">
                    <Icon className="h-6 w-6 text-zinc-300 group-hover:text-[#007AFF]" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-[#E0E0E0] truncate">
                      {link.title}
                    </span>
                    <span className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                      {link.url.replace(/^https?:\/\//, "")}{" "}
                      <LuExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, link.id)}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-[#FF3B30] opacity-0 group-hover:opacity-100 transition-all p-1"
                    title="Remover link"
                  >
                    <LuTrash2 className="h-4 w-4" />
                  </button>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
