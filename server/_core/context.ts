import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Mode développement local : utilisateur mock
  // Pour réactiver OAuth, décommentez le code ci-dessous et supprimez l'utilisateur mock
  
  /*
  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  */

  // Utilisateur mock pour développement local
  const user: User = {
    id: 1,
    openId: "mock-user-local",
    name: "Utilisateur Test",
    email: "test@example.com",
    loginMethod: "mock",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
