import fs from "fs/promises";
import path from "path";

export class FileUtils {
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`File deleted: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }

  static async ensureUploadsDir() {
    const uploadsDir = path.resolve("uploads");
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }
  }

  static async cleanOldFiles(dirPath, maxAgeMs = 24 * 60 * 60 * 1000) {
    try {
      const files = await fs.readdir(dirPath);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > maxAgeMs && stats.isFile()) {
          await this.deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error("Failed to clean old files:", error);
    }
  }
}

export default FileUtils;
