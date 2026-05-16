export interface StoredFileDto {
  id: number;
  originalFileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  fileCategory: string;
  agentId: number;
  url: string;
}
