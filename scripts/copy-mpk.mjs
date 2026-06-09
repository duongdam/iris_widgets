import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const buildsDir = join(root, "builds");
const widgetsDir = join(root, "widgets");

function findMpkFiles(dir) {
    const results = [];
    if (!existsSync(dir)) {
        return results;
    }

    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            results.push(...findMpkFiles(fullPath));
        } else if (entry.endsWith(".mpk")) {
            results.push(fullPath);
        }
    }

    return results;
}

mkdirSync(buildsDir, { recursive: true });

const mpkFiles = [];

for (const entry of readdirSync(widgetsDir)) {
    const widgetPath = join(widgetsDir, entry);
    if (!statSync(widgetPath).isDirectory()) {
        continue;
    }

    mpkFiles.push(...findMpkFiles(join(widgetPath, "dist")));
}

if (mpkFiles.length === 0) {
    console.log("No .mpk files found under widgets/*/dist/");
    process.exit(0);
}

for (const mpkPath of mpkFiles) {
    const fileName = mpkPath.split("/").pop();
    const destPath = join(buildsDir, fileName);
    cpSync(mpkPath, destPath);
    console.log(`Copied ${fileName} -> builds/${fileName}`);
}

console.log(`Collected ${mpkFiles.length} .mpk file(s) into builds/`);
