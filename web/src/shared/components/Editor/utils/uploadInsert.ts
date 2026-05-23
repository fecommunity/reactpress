import { uploadFile } from "@/shared/api/uploadFile";

export type UploadedFile = {
  url: string;
  originalname?: string;
  filename?: string;
};

export async function uploadEditorAsset(file: File, unique = 0): Promise<UploadedFile> {
  const data = await uploadFile(file, unique);
  return data as UploadedFile;
}

export function uploadedFileName(file: File, res: UploadedFile) {
  return res.originalname ?? res.filename ?? file.name;
}
