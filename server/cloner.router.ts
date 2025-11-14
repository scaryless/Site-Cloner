import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { clonedSites, clonedResources } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import axios from "axios";
import * as cheerio from "cheerio";
import archiver from "archiver";
// Utiliser le stockage local au lieu de S3 pour le développement
import { storagePut } from "./storage-local";

/**
 * Fonction pour extraire toutes les ressources d'une page HTML
 */
async function extractResources(html: string, baseUrl: string) {
  const $ = cheerio.load(html);
  const resources: Array<{ type: string; url: string }> = [];

  // Extraire les CSS
  $('link[rel="stylesheet"]').each((_, elem) => {
    const href = $(elem).attr("href");
    if (href) {
      try {
        resources.push({ type: "css", url: new URL(href, baseUrl).href });
      } catch (e) {
        console.warn(`URL invalide ignorée: ${href}`);
      }
    }
  });

  // Extraire les scripts
  $("script[src]").each((_, elem) => {
    const src = $(elem).attr("src");
    if (src) {
      try {
        resources.push({ type: "js", url: new URL(src, baseUrl).href });
      } catch (e) {
        console.warn(`URL invalide ignorée: ${src}`);
      }
    }
  });

  // Extraire les images
  $("img[src]").each((_, elem) => {
    const src = $(elem).attr("src");
    if (src) {
      try {
        resources.push({ type: "image", url: new URL(src, baseUrl).href });
      } catch (e) {
        console.warn(`URL invalide ignorée: ${src}`);
      }
    }
  });

  // Extraire les images de background CSS inline
  $("[style*='background']").each((_, elem) => {
    const style = $(elem).attr("style");
    if (style) {
      const urlMatches = style.match(/url\(['"]?([^'"]+)['"]?\)/g);
      if (urlMatches) {
        urlMatches.forEach((match) => {
          const url = match.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
          if (url) {
            try {
              resources.push({ type: "image", url: new URL(url, baseUrl).href });
            } catch (e) {
              console.warn(`URL invalide ignorée: ${url}`);
            }
          }
        });
      }
    }
  });

  // Extraire les fonts
  $('link[rel="preload"][as="font"]').each((_, elem) => {
    const href = $(elem).attr("href");
    if (href) {
      try {
        resources.push({ type: "font", url: new URL(href, baseUrl).href });
      } catch (e) {
        console.warn(`URL invalide ignorée: ${href}`);
      }
    }
  });

  return resources;
}

/**
 * Fonction pour télécharger une ressource
 */
async function downloadResource(url: string): Promise<Buffer | null> {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Erreur lors du téléchargement de ${url}:`, error);
    return null;
  }
}

/**
 * Fonction pour créer une archive ZIP du site cloné
 */
async function createZipArchive(
  html: string,
  resources: Array<{ type: string; url: string; content: Buffer; localPath: string }>
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    // Ajouter le fichier HTML principal
    archive.append(html, { name: "index.html" });

    // Ajouter toutes les ressources
    resources.forEach((resource) => {
      archive.append(resource.content, { name: resource.localPath });
    });

    archive.finalize();
  });
}

/**
 * Fonction pour remplacer les URLs dans le HTML par des chemins locaux
 */
function replaceUrlsInHtml(html: string, resources: Array<{ url: string; localPath: string }>) {
  let modifiedHtml = html;
  resources.forEach((resource) => {
    modifiedHtml = modifiedHtml.replace(new RegExp(resource.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), resource.localPath);
  });
  return modifiedHtml;
}

export const clonerRouter = router({
  /**
   * Cloner un site web
   */
  cloneSite: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Base de données non disponible");
      }

      const userId = ctx.user.id;

      // Créer l'entrée dans la base de données
      const [site] = await db.insert(clonedSites).values({
        userId,
        originalUrl: input.url,
        status: "processing",
      });

      const siteId = site.insertId;

      try {
        // Télécharger le HTML de la page
        const response = await axios.get(input.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 30000,
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const title = $("title").text() || "Site cloné";

        // Extraire toutes les ressources
        const resourceUrls = await extractResources(html, input.url);

        // Télécharger toutes les ressources
        const downloadedResources = [];
        for (const resource of resourceUrls) {
          const content = await downloadResource(resource.url);
          if (content) {
            const urlObj = new URL(resource.url);
            const localPath = `assets${urlObj.pathname}`;

            downloadedResources.push({
              type: resource.type,
              url: resource.url,
              content,
              localPath,
            });

            // Enregistrer dans la base de données
            await db.insert(clonedResources).values({
              siteId,
              resourceType: resource.type as any,
              originalUrl: resource.url,
              localPath,
              fileSize: content.length,
            });
          }
        }

        // Remplacer les URLs dans le HTML
        const modifiedHtml = replaceUrlsInHtml(html, downloadedResources);

        // Créer l'archive ZIP
        const zipBuffer = await createZipArchive(modifiedHtml, downloadedResources);

        // Upload du ZIP vers S3
        const zipResult = await storagePut(`cloned-sites/${siteId}/site.zip`, zipBuffer, "application/zip");

        // Mettre à jour l'entrée dans la base de données
        await db
          .update(clonedSites)
          .set({
            title,
            htmlContent: modifiedHtml,
            status: "completed",
            zipFileUrl: zipResult.url,
          })
          .where(eq(clonedSites.id, siteId));

        return {
          success: true,
          siteId,
          title,
          zipUrl: zipResult.url,
        };
      } catch (error: any) {
        // Mettre à jour le statut en cas d'erreur
        await db
          .update(clonedSites)
          .set({
            status: "failed",
            errorMessage: error.message,
          })
          .where(eq(clonedSites.id, siteId));

        throw new Error(`Échec du clonage: ${error.message}`);
      }
    }),

  /**
   * Récupérer la liste des sites clonés par l'utilisateur
   */
  getMySites: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    const sites = await db
      .select()
      .from(clonedSites)
      .where(eq(clonedSites.userId, ctx.user.id))
      .orderBy(desc(clonedSites.createdAt));

    return sites;
  }),

  /**
   * Récupérer les détails d'un site cloné
   */
  getSiteDetails: protectedProcedure
    .input(
      z.object({
        siteId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Base de données non disponible");
      }

      const [site] = await db
        .select()
        .from(clonedSites)
        .where(eq(clonedSites.id, input.siteId));

      if (!site || site.userId !== ctx.user.id) {
        throw new Error("Site non trouvé");
      }

      const resources = await db
        .select()
        .from(clonedResources)
        .where(eq(clonedResources.siteId, input.siteId));

      return {
        site,
        resources,
      };
    }),

  /**
   * Supprimer un site cloné
   */
  deleteSite: protectedProcedure
    .input(
      z.object({
        siteId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Base de données non disponible");
      }

      const [site] = await db
        .select()
        .from(clonedSites)
        .where(eq(clonedSites.id, input.siteId));

      if (!site || site.userId !== ctx.user.id) {
        throw new Error("Site non trouvé");
      }

      // Supprimer les ressources associées
      await db.delete(clonedResources).where(eq(clonedResources.siteId, input.siteId));

      // Supprimer le site
      await db.delete(clonedSites).where(eq(clonedSites.id, input.siteId));

      return { success: true };
    }),
});
