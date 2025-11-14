import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Cookie, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CookieManagerProps {
  onCookiesChange: (cookies: string) => void;
  initialCookies?: string;
}

export function CookieManager({ onCookiesChange, initialCookies = "" }: CookieManagerProps) {
  const [cookies, setCookies] = useState(initialCookies);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onCookiesChange(cookies);
    setIsOpen(false);
    toast.success("Cookies enregistrés");
  };

  const handleClear = () => {
    setCookies("");
    onCookiesChange("");
    toast.info("Cookies effacés");
  };

  const bookmarkletCode = `javascript:(function(){const cookies=document.cookie;if(!cookies){alert('Aucun cookie trouvé sur cette page');return;}const formatted=cookies.split('; ').map(c=>{const [name,value]=c.split('=');return{name,value,domain:window.location.hostname,path:'/'};});const json=JSON.stringify(formatted,null,2);const textarea=document.createElement('textarea');textarea.value=json;textarea.style.position='fixed';textarea.style.top='50%';textarea.style.left='50%';textarea.style.transform='translate(-50%,-50%)';textarea.style.width='80%';textarea.style.height='400px';textarea.style.zIndex='999999';textarea.style.background='white';textarea.style.border='2px solid black';textarea.style.padding='10px';textarea.style.fontSize='12px';document.body.appendChild(textarea);textarea.select();const closeBtn=document.createElement('button');closeBtn.textContent='✕ Fermer';closeBtn.style.position='fixed';closeBtn.style.top='calc(50% - 220px)';closeBtn.style.right='calc(10% - 20px)';closeBtn.style.zIndex='9999999';closeBtn.style.padding='10px 20px';closeBtn.style.background='red';closeBtn.style.color='white';closeBtn.style.border='none';closeBtn.style.cursor='pointer';closeBtn.style.borderRadius='5px';closeBtn.onclick=()=>{document.body.removeChild(textarea);document.body.removeChild(closeBtn);};document.body.appendChild(closeBtn);})();`;

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    toast.success("Bookmarklet copié ! Créez un favori et collez ce code comme URL");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Cookie className="w-4 h-4 mr-2" />
          {cookies ? "Modifier les cookies" : "Ajouter des cookies"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestion des cookies</DialogTitle>
          <DialogDescription>
            Pour cloner des sites protégés par authentification, ajoutez les cookies de votre session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bookmarklet */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Cookie className="w-4 h-4" />
              Extraction automatique des cookies
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Utilisez ce bookmarklet pour extraire automatiquement les cookies depuis n'importe quel site :
            </p>
            <ol className="text-sm text-gray-700 space-y-2 mb-3 list-decimal list-inside">
              <li>Copiez le code du bookmarklet ci-dessous</li>
              <li>Créez un nouveau favori dans votre navigateur</li>
              <li>Collez le code comme URL du favori</li>
              <li>Naviguez vers le site à cloner et connectez-vous</li>
              <li>Cliquez sur le bookmarklet pour extraire les cookies</li>
              <li>Copiez le JSON affiché et collez-le dans le champ ci-dessous</li>
            </ol>
            <Button onClick={copyBookmarklet} variant="secondary" size="sm" className="w-full">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier le bookmarklet
                </>
              )}
            </Button>
          </div>

          {/* Cookie Input */}
          <div className="space-y-2">
            <Label htmlFor="cookies">Cookies (format JSON)</Label>
            <Textarea
              id="cookies"
              placeholder={`[\n  {\n    "name": "session_id",\n    "value": "abc123",\n    "domain": "example.com",\n    "path": "/"\n  }\n]`}
              value={cookies}
              onChange={(e) => setCookies(e.target.value)}
              rows={12}
              className="font-mono text-xs"
            />
            <p className="text-xs text-gray-500">
              Format attendu : tableau JSON avec name, value, domain et path pour chaque cookie
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClear}>
              Effacer
            </Button>
            <Button onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
