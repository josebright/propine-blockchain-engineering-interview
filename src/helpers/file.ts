import { existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";

export const handleDir = (outDir: string, deleteFiles = false) => {
  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  } else {
    if (deleteFiles) {
      const fileNames = readdirSync(outDir);
      fileNames.forEach((fileName) => {
        unlinkSync(join(outDir, fileName));
      });
    }
  }
};
