import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cookie, Plus, Trash2, Globe, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CookieProfileManagerProps {
  onProfileSelect?: (profileId: number) => void;
  selectedProfileId?: number;
}

export function CookieProfileManager({ onProfileSelect, selectedProfileId }: CookieProfileManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  const { data: profiles, refetch } = trpc.cookieProfiles.getMyProfiles.useQuery();

  const createSessionMutation = trpc.cookieProfiles.createBrowserSession.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Cookies capturés avec succès pour ${data.siteName} !`, {
        description: "Le navigateur a été fermé automatiquement. Vous pouvez maintenant utiliser ce profil pour cloner le site.",
        duration: 5000,
      });
      setNewSiteUrl("");
      setIsCapturing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
      setIsCapturing(false);
    },
  });

  const deleteProfileMutation = trpc.cookieProfiles.deleteProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil supprimé");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleCaptureCookies = async () => {
    if (!newSiteUrl.trim()) {
      toast.error("Veuillez entrer une URL valide");
      return;
    }

    try {
      new URL(newSiteUrl);
    } catch (e) {
      toast.error("URL invalide");
      return;
    }

    setIsCapturing(true);
    
    // Notification de démarrage
    toast.info("🌐 Ouverture du navigateur...", {
      duration: 3000,
    });
    
    // Notification d'instruction
    setTimeout(() => {
      toast.info("🔑 Connectez-vous au site. La capture se fera automatiquement après connexion.", {
        duration: 10000,
      });
    }, 2000);
    
    createSessionMutation.mutate({ url: newSiteUrl });
  };

  const handleDeleteProfile = (profileId: number, siteName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le profil "${siteName}" ?`)) {
      deleteProfileMutation.mutate({ profileId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Cookie className="w-4 h-4 mr-2" />
          Gérer les profils de cookies
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profils de cookies</DialogTitle>
          <DialogDescription>
            Créez des profils pour cloner des sites protégés par authentification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ajouter un nouveau profil */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer un nouveau profil
            </h3>
            <div className="space-y-3">
              <Input
                type="url"
                placeholder="https://example.com"
                value={newSiteUrl}
                onChange={(e) => setNewSiteUrl(e.target.value)}
                disabled={isCapturing}
              />
              <Button 
                onClick={handleCaptureCookies} 
                disabled={isCapturing}
                className="w-full"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Capture en cours... (connectez-vous dans le navigateur)
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Ouvrir le navigateur et capturer les cookies
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-600">
                🔍 Un navigateur s'ouvrira automatiquement. Connectez-vous normalement au site. 
                Dès que la connexion est détectée, les cookies seront capturés et le navigateur se fermera automatiquement.
              </p>
            </div>
          </div>

          {/* Liste des profils */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Mes profils ({profiles?.length || 0})</h3>
            
            {!profiles || profiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Cookie className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucun profil de cookies pour le moment</p>
                <p className="text-sm">Créez-en un pour cloner des sites protégés</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profiles.map((profile) => (
                  <Card 
                    key={profile.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProfileId === profile.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => onProfileSelect?.(profile.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {profile.favicon ? (
                            <img 
                              src={profile.favicon} 
                              alt="" 
                              className="w-8 h-8 rounded flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <Globe className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {profile.siteName || profile.domain}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">{profile.domain}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {selectedProfileId === profile.id && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Sélectionné
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProfile(profile.id, profile.siteName || profile.domain);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
