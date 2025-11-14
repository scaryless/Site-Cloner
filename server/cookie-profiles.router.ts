import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { cookieProfiles } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import puppeteer from "puppeteer";

/**
 * Router pour gérer les profils de cookies
 */
export const cookieProfilesRouter = router({
  /**
   * Créer une session de navigateur pour capturer les cookies
   */
  createBrowserSession: protectedProcedure
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

      try {
        // Lancer Puppeteer en mode headless
        const browser = await puppeteer.launch({
          headless: false, // Mode visible pour que l'utilisateur puisse se connecter
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        
        // Naviguer vers l'URL
        await page.goto(input.url, { waitUntil: 'networkidle2' });

        // Attendre que l'utilisateur se connecte (30 secondes max)
        // Dans une vraie implémentation, on utiliserait un WebSocket pour notifier
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Récupérer tous les cookies
        const cookies = await page.cookies();
        
        // Extraire le domaine et le titre de la page
        const url = new URL(input.url);
        const domain = url.hostname;
        const title = await page.title();
        
        // Essayer de récupérer le favicon
        let favicon = null;
        try {
          const faviconElement = await page.$('link[rel="icon"], link[rel="shortcut icon"]');
          if (faviconElement) {
            favicon = await page.evaluate(el => el.href, faviconElement);
          }
        } catch (e) {
          // Pas de favicon trouvé
        }

        await browser.close();

        // Sauvegarder le profil de cookies
        const [profile] = await db.insert(cookieProfiles).values({
          userId: ctx.user.id,
          domain,
          siteName: title || domain,
          cookies: JSON.stringify(cookies),
          favicon,
        });

        return {
          id: profile.insertId,
          domain,
          siteName: title || domain,
          favicon,
        };
      } catch (error: any) {
        throw new Error(`Erreur lors de la capture des cookies: ${error.message}`);
      }
    }),

  /**
   * Obtenir tous les profils de cookies de l'utilisateur
   */
  getMyProfiles: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const profiles = await db
      .select()
      .from(cookieProfiles)
      .where(eq(cookieProfiles.userId, ctx.user.id))
      .orderBy(desc(cookieProfiles.createdAt));

    return profiles;
  }),

  /**
   * Supprimer un profil de cookies
   */
  deleteProfile: protectedProcedure
    .input(
      z.object({
        profileId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Base de données non disponible");
      }

      await db
        .delete(cookieProfiles)
        .where(
          and(
            eq(cookieProfiles.id, input.profileId),
            eq(cookieProfiles.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Obtenir un profil spécifique
   */
  getProfile: protectedProcedure
    .input(
      z.object({
        profileId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Base de données non disponible");
      }

      const [profile] = await db
        .select()
        .from(cookieProfiles)
        .where(
          and(
            eq(cookieProfiles.id, input.profileId),
            eq(cookieProfiles.userId, ctx.user.id)
          )
        )
        .limit(1);

      return profile || null;
    }),
});
