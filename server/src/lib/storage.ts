import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "./env";

export interface StoredFile {
  url: string;
  key: string;
}

export interface StorageDriver {
  save(buffer: Buffer, originalName: string, folder: string): Promise<StoredFile>;
}

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function safeExtension(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
}

/**
 * Local-disk driver for development. Files are written under /uploads and
 * served statically by Express. Swap this for an S3/R2 driver in production
 * by implementing the same StorageDriver interface.
 */
class LocalDiskStorage implements StorageDriver {
  async save(buffer: Buffer, originalName: string, folder: string): Promise<StoredFile> {
    const filename = `${randomUUID()}${safeExtension(originalName)}`;
    const key = `${folder}/${filename}`;
    const destDir = path.join(UPLOADS_DIR, folder);

    await fs.mkdir(destDir, { recursive: true });
    await fs.writeFile(path.join(destDir, filename), buffer);

    return { key, url: `${env.serverPublicUrl}/uploads/${key}` };
  }
}

// When STORAGE_DRIVER=s3|r2, construct the corresponding driver here instead.
export const storage: StorageDriver = new LocalDiskStorage();

export const LOCAL_UPLOADS_DIR = UPLOADS_DIR;
