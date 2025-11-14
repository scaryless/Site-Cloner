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

        // Récupérer les cookies initiaux
        const initialCookies = await page.cookies();
        const initialCookieCount = initialCookies.length;

        // Attendre que de nouveaux cookies soient créés (indiquant une connexion)
        // ou timeout après 60 secondes
        const startTime = Date.now();
        const maxWaitTime = 60000; // 60 secondes max
        let cookies = initialCookies;
        
        while (Date.now() - startTime < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Vérifier toutes les 2 secondes
          cookies = await page.cookies();
          
          // Si de nouveaux cookies sont apparus, c'est probablement une connexion réussie
          if (cookies.length > initialCookieCount + 2) {
            console.log(`[Cookie Capture] Nouveaux cookies détectés (${cookies.length} vs ${initialCookieCount})`);
            // Attendre encore 3 secondes pour s'assurer que tous les cookies sont créés
            await new Promise(resolve => setTimeout(resolve, 3000));
            cookies = await page.cookies();
            break;
          }
        }
        
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
