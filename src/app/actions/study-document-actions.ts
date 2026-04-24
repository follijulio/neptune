"use server";

import { UTApi } from "uploadthing/server";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

const utapi = new UTApi();

interface DeleteStudyDocumentResponse {
  success?: boolean;
  error?: string;
}

export async function deleteStudyDocumentAction(
  documentId: string,
): Promise<DeleteStudyDocumentResponse> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado." };

  if (!documentId || typeof documentId !== "string") {
    return { error: "ID de documento inválido." };
  }

  try {
    const doc = await prisma.studyDocument.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        userId: true,
        fileKey: true,
      },
    });

    if (!doc) return { error: "Documento não encontrado." };
    if (doc.userId !== session.user.id) return { error: "Acesso negado." };

    await prisma.studyDocument.delete({
      where: { id: documentId },
    });

    if (doc.fileKey) {
      try {
        await utapi.deleteFiles(doc.fileKey);
      } catch (uploadErr) {
        console.error(
          "[deleteStudyDocumentAction] Falha ao deletar no UploadThing:",
          uploadErr,
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteStudyDocumentAction] Erro:", error);
    return { error: "Não foi possível excluir este material no momento." };
  }
}
