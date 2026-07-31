#!/usr/bin/env node
/**
 * Copie le build Vite vers hostinger-dist/ à la racine du monorepo.
 * Sur Hostinger : Build = npm run build:hostinger | Output = hostinger-dist
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "apps/web/dist");
const target = join(root, "hostinger-dist");

if (!existsSync(source)) {
  console.error("Erreur: apps/web/dist introuvable. Lance d'abord le build Vite.");
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

console.log("OK → hostinger-dist/ prêt pour Hostinger (contenu de apps/web/dist).");
