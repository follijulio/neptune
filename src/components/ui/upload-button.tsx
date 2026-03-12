import { generateUploadButton } from "@uploadthing/react";

import type { OurFileRouter } from "@/src/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
