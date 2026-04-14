"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuBookOpen,
  LuCalculator,
  LuCode,
  LuExternalLink,
  LuGlobe,
  LuGraduationCap,
  LuPencil,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import { useRouter } from "next/navigation";

import {
  createLinkAction,
  deleteLinkAction,
  updateLinkAction,
} from "@/src/app/actions/links-actions";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/shadcn-ui/dialog";
import { Input } from "@/src/components/shadcn-ui/input";

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
  const [error, setError] = useState<string | null>(null);

  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Globe");

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  const isEmpty = useMemo(() => links.length === 0, [links]);

  function openCreateModal() {
    setEditingLink(null);
    setTitleInput("");
    setUrlInput("");
    setSelectedIcon("Globe");
    setError(null);
    setIsOpen(true);
  }

  function openEditModal(e: React.MouseEvent, link: LinkItem) {
    e.preventDefault();
    e.stopPropagation();

    setEditingLink(link);
    setTitleInput(link.title);
    setUrlInput(link.url);
    setSelectedIcon(link.icon || "Globe");
    setError(null);
    setIsOpen(true);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalUrl = urlInput;

    if (!titleInput || !finalUrl) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    if (editingLink) {
      const result = await updateLinkAction({
        id: editingLink.id,
        title: titleInput,
        url: finalUrl,
        icon: selectedIcon,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setLinks((prev) =>
          prev.map((l) =>
            l.id === editingLink.id
              ? { ...l, title: titleInput, url: finalUrl, icon: selectedIcon }
              : l,
          ),
        );
        setIsOpen(false);
      }
    } else {
      const result = await createLinkAction({
        title: titleInput,
        url: finalUrl,
        icon: selectedIcon,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setLinks([
          ...links,
          {
            id: Date.now().toString(),
            title: titleInput,
            url: finalUrl,
            icon: selectedIcon,
          },
        ]);
        setIsOpen(false);
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();

    setLinks((prev) => prev.filter((l) => l.id !== id));
    await deleteLinkAction(id);
  }

  return (
    <section className="px-4 sm:px-0">
      <div className="w-full">
        <header className="flex items-end justify-between border-[#1A1A1A] pb-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateModal}
                className="group h-10 gap-2 rounded-xl bg-[#007AFF] px-4 text-sm font-bold text-white hover:bg-[#005bb5] sm:h-12 sm:px-6 sm:text-base"
              >
                <LuPlus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 sm:h-5 sm:w-5" />{" "}
                Adicionar Link
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] max-w-100 rounded-2xl border-[#1A1A1A] bg-[#121212] p-4 text-white sm:max-w-md sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold sm:text-2xl">
                  {editingLink ? "Editar Link" : "Adicionar Link"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSave}
                className="space-y-4 pt-2 sm:space-y-5 sm:pt-4"
              >
                {error && (
                  <p className="text-xs font-medium text-[#FF3B30] sm:text-sm">
                    {error}
                  </p>
                )}

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
                    Título
                  </label>
                  <Input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="Ex: SIGAA UFAL, Wolfram Alpha..."
                    className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
                    URL
                  </label>
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="sigaa.ufal.br"
                    className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
                  />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
                    Ícone
                  </label>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {Object.keys(ICON_MAP).map((iconName) => {
                      const IconComponent = ICON_MAP[iconName];
                      return (
                        <button
                        title="Selecionar ícone"
                          key={iconName}
                          type="button"
                          onClick={() => setSelectedIcon(iconName)}
                          className={`rounded-lg border p-2 transition-all sm:rounded-xl sm:p-3 ${
                            selectedIcon === iconName
                              ? "border-[#007AFF] bg-[#007AFF]/20 text-[#007AFF]"
                              : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-10 w-full rounded-xl bg-[#007AFF] text-sm font-bold text-white hover:bg-[#005bb5] sm:mt-4 sm:h-12 sm:text-base"
                >
                  {loading
                    ? "A guardar..."
                    : editingLink
                      ? "Salvar Alterações"
                      : "Guardar Link"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isEmpty ? (
          <div className="rounded-2xl border border-dashed border-[#1A1A1A] bg-[#0A0A0A] py-16 text-center sm:py-24">
            <p className="text-base text-zinc-500 sm:text-lg">
              Não há links salvos...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {links.map((link) => {
              const Icon = ICON_MAP[link.icon] || LuGlobe;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-4 shadow-lg transition-all duration-300 hover:border-[#007AFF]/50 hover:bg-[#007AFF]/5 sm:gap-4 sm:rounded-2xl sm:p-5"
                >
                  <div className="shrink-0 rounded-lg border border-zinc-800 bg-black p-2.5 transition-colors group-hover:border-[#007AFF] group-hover:text-[#007AFF] sm:rounded-xl sm:p-3">
                    <Icon className="h-5 w-5 text-zinc-300 group-hover:text-[#007AFF] sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex flex-col overflow-hidden pr-6 sm:pr-8">
                    <span className="truncate text-sm font-bold text-[#E0E0E0] sm:text-base">
                      {link.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-zinc-500 sm:text-xs">
                      {link.url.replace(/^https?:\/\//, "")}{" "}
                      <LuExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 flex flex-col gap-1 transition-all sm:top-4 sm:right-4 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      onClick={(e) => openEditModal(e, link)}
                      className="rounded p-1 text-zinc-600 hover:bg-[#007AFF]/10 hover:text-[#007AFF] sm:p-1.5"
                      title="Editar link"
                    >
                      <LuPencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, link.id)}
                      className="rounded p-1 text-zinc-600 hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] sm:p-1.5"
                      title="Remover link"
                    >
                      <LuTrash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
