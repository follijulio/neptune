import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/src/auth";

const f = createUploadthing();

export const ourFileRouter = {
  profilePicture: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Não autorizado");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completo para userId:", metadata.userId);
      console.log("URL do arquivo:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
