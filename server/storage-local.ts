// Module de stockage local pour le développement
// Remplace le stockage S3 par un système de fichiers local

import { promises as fs } from 'fs';
import path from 'path';

// Dossier de stockage local (dans le projet)
const STORAGE_DIR = path.join(process.cwd(), 'storage');

// URL de base pour accéder aux fichiers (servie par Express)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Initialiser le dossier de stockage
 */
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Normaliser la clé de stockage
 */
function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, '');
}

/**
 * Obtenir le chemin complet du fichier
 */
function getFilePath(relKey: string): string {
  const key = normalizeKey(relKey);
  return path.join(STORAGE_DIR, key);
}

/**
 * Obtenir l'URL publique du fichier
 */
function getPublicUrl(relKey: string): string {
  const key = normalizeKey(relKey);
  return `${BASE_URL}/storage/${key}`;
}

/**
 * Sauvegarder un fichier localement
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await ensureStorageDir();
  
  const key = normalizeKey(relKey);
  const filePath = getFilePath(key);
  
  // Créer les sous-dossiers si nécessaire
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  // Convertir les données en Buffer si nécessaire
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  
  // Écrire le fichier
  await fs.writeFile(filePath, buffer);
  
  const url = getPublicUrl(key);
  
  console.log(`[Storage Local] Fichier sauvegardé: ${key} -> ${filePath}`);
  
  return { key, url };
}

/**
 * Récupérer l'URL d'un fichier
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const filePath = getFilePath(key);
  
  // Vérifier que le fichier existe
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Fichier non trouvé: ${key}`);
  }
  
  const url = getPublicUrl(key);
  
  return { key, url };
}

/**
 * Supprimer un fichier
 */
export async function storageDelete(relKey: string): Promise<void> {
  const key = normalizeKey(relKey);
  const filePath = getFilePath(key);
  
  try {
    await fs.unlink(filePath);
    console.log(`[Storage Local] Fichier supprimé: ${key}`);
  } catch (error) {
    console.warn(`[Storage Local] Impossible de supprimer ${key}:`, error);
  }
}

/**
 * Lister les fichiers dans un dossier
 */
export async function storageList(prefix: string = ''): Promise<string[]> {
  await ensureStorageDir();
  
  const dirPath = path.join(STORAGE_DIR, normalizeKey(prefix));
  
  try {
    const files = await fs.readdir(dirPath, { recursive: true });
    return files.filter(file => {
      const fullPath = path.join(dirPath, file);
      return fs.stat(fullPath).then(stat => stat.isFile());
    });
  } catch {
    return [];
  }
}

// Export du chemin de stockage pour la configuration Express
export { STORAGE_DIR };
