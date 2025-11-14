import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Trash2, Globe, Clock, CheckCircle, XCircle } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CookieManager } from "@/components/CookieManager";

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const [url, setUrl] = useState("");
  const [cookies, setCookies] = useState("");
  const [isCloning, setIsCloning] = useState(false);

  const { data: sites, refetch } = trpc.cloner.getMySites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cloneSiteMutation = trpc.cloner.cloneSite.useMutation({
    onSuccess: (data) => {
      toast.success(`Site cloné avec succès : ${data.title}`);
      setUrl("");
      setIsCloning(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
      setIsCloning(false);
    },
  });

  const deleteSiteMutation = trpc.cloner.deleteSite.useMutation({
    onSuccess: () => {
      toast.success("Site supprimé avec succès");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleCloneSite = async () => {
    if (!url.trim()) {
      toast.error("Veuillez entrer une URL valide");
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      toast.error("URL invalide");
      return;
    }

    setIsCloning(true);
    cloneSiteMutation.mutate({ url, cookies: cookies || undefined });
  };

  const handleDeleteSite = (siteId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce site cloné ?")) {
      deleteSiteMutation.mutate({ siteId });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Complété
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-blue-500">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            En cours
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Échoué
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Globe className="w-16 h-16 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold">{APP_TITLE}</CardTitle>
            <CardDescription className="text-lg">
              Clonez n'importe quel site web en quelques secondes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>✓ Téléchargement complet HTML/CSS/JS</p>
              <p>✓ Extraction de toutes les ressources</p>
              <p>✓ Archive ZIP prête à l'emploi</p>
            </div>
            <Button className="w-full" size="lg" onClick={() => window.location.href = getLoginUrl()}>
              Se connecter pour commencer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Bonjour, {user?.name || user?.email}</span>
            <Button variant="outline" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Clone Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cloner un site web</CardTitle>
            <CardDescription>
              Entrez l'URL du site que vous souhaitez cloner. Toutes les ressources seront extraites et téléchargées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCloneSite()}
                  disabled={isCloning}
                  className="flex-1"
                />
                <Button onClick={handleCloneSite} disabled={isCloning} size="lg">
                  {isCloning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Clonage en cours...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Cloner le site
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <CookieManager onCookiesChange={setCookies} initialCookies={cookies} />
                {cookies && (
                  <span className="text-sm text-green-600">
                    ✓ Cookies configurés
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sites List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Mes sites clonés</h2>
          {!sites || sites.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Aucun site cloné pour le moment</p>
                <p className="text-sm">Entrez une URL ci-dessus pour commencer</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <Card key={site.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate">{site.title || "Sans titre"}</CardTitle>
                      {getStatusBadge(site.status)}
                    </div>
                    <CardDescription className="truncate">{site.originalUrl}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {format(new Date(site.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                      </div>

                      {site.status === "completed" && site.zipFileUrl && (
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={() => window.open(site.zipFileUrl!, "_blank")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger ZIP
                        </Button>
                      )}

                      {site.status === "failed" && site.errorMessage && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {site.errorMessage}
                        </div>
                      )}

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleDeleteSite(site.id)}
                        disabled={deleteSiteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
