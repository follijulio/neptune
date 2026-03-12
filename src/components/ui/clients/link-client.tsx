"use client";

import { useEffect, useState } from "react";
import {
  LuBookOpen,
  LuCalculator,
  LuCode,
  LuExternalLink,
  LuGlobe,
  LuGraduationCap,
  LuPlus,
  LuTrash2,
  LuPencil,
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
    <section>
      <div className="w-full">
        <header className="flex items-end justify-between border-[#1A1A1A] pb-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateModal}
                className="group h-12 gap-2 rounded-xl bg-[#007AFF] px-6 font-bold text-white hover:bg-[#005bb5]"
              >
                <LuPlus className="transition-transform duration-300 group-hover:rotate-90" />{" "}
                Adicionar Link
              </Button>
            </DialogTrigger>

            <DialogContent className="rounded-2xl border-[#1A1A1A] bg-[#121212] text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {editingLink ? "Editar Link" : "Adicionar Link"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-5 pt-4">
                {error && (
                  <p className="text-sm font-medium text-[#FF3B30]">{error}</p>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">
                    Título
                  </label>
                  <Input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="Ex: SIGAA UFAL, Wolfram Alpha..."
                    className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">
                    URL
                  </label>
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="sigaa.ufal.br"
                    className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
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
                          className={`rounded-xl border p-3 transition-all ${
                            selectedIcon === iconName
                              ? "border-[#007AFF] bg-[#007AFF]/20 text-[#007AFF]"
                              : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
                  className="mt-4 h-12 w-full rounded-xl bg-[#007AFF] font-bold text-white hover:bg-[#005bb5]"
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

        {links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1A1A1A] bg-[#0A0A0A] py-24 text-center">
            <p className="text-lg text-zinc-500">Não há links salvos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {links.map((link) => {
              const Icon = ICON_MAP[link.icon] || LuGlobe;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-4 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-5 shadow-lg transition-all duration-300 hover:border-[#007AFF]/50 hover:bg-[#007AFF]/5"
                >
                  <div className="rounded-xl border border-zinc-800 bg-black p-3 transition-colors group-hover:border-[#007AFF] group-hover:text-[#007AFF]">
                    <Icon className="h-6 w-6 text-zinc-300 group-hover:text-[#007AFF]" />
                  </div>
                  <div className="flex flex-col overflow-hidden pr-8">
                    {" "}
                    <span className="truncate font-bold text-[#E0E0E0]">
                      {link.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-zinc-500">
                      {link.url.replace(/^https?:\/\//, "")}{" "}
                      <LuExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 transition-all group-hover:opacity-100">
                    <button
                      onClick={(e) => openEditModal(e, link)}
                      className="p-1 text-zinc-600 hover:text-[#007AFF]"
                      title="Editar link"
                    >
                      <LuPencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, link.id)}
                      className="p-1 text-zinc-600 hover:text-[#FF3B30]"
                      title="Remover link"
                    >
                      <LuTrash2 className="h-4 w-4" />
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
