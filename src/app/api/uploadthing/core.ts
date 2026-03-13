import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { prisma } from "@/prisma/lib/prisma";
import { auth } from "@/src/auth";

const f = createUploadthing();

const MAX_USER_STORAGE_BYTES = 20 * 1024 * 1024;

export const ourFileRouter = {
  profilePicture: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new UploadThingError("Não autorizado");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
  subjectMaterial: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .input(z.object({ subjectId: z.string() }))
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user?.id) throw new UploadThingError("Não autorizado");

      const storageUsed = await prisma.subjectMaterial.aggregate({
        where: { userId: session.user.id },
        _sum: { size: true },
      });

      const totalBytes = storageUsed._sum.size || 0;

      if (totalBytes >= MAX_USER_STORAGE_BYTES) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message:
            "Perdoe-nos, mas como o projeto é pequeno fica inviável armazenar tantos documentos (Limite atingido). Novamente, perdão...",
        });
      }

      return { userId: session.user.id, subjectId: input.subjectId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.subjectMaterial.create({
        data: {
          name: file.name,
          url: file.ufsUrl,
          size: file.size,
          subjectId: metadata.subjectId,
          userId: metadata.userId,
        },
      });

      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
