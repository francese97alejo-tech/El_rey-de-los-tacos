import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function QRModal({ open, onClose }) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-white rounded-3xl max-w-sm" data-testid="qr-modal">
        <DialogHeader>
          <DialogTitle className="text-xl">Compartí el menú</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="p-4 bg-white rounded-2xl border-4 border-[#16A34A]">
            <QRCodeSVG value={url} size={200} fgColor="#1C1917" />
          </div>
          <p className="text-sm text-stone-500 text-center">
            Escaneá con tu cámara para abrir el menú en cualquier celular
          </p>
          <Button
            onClick={copy}
            data-testid="copy-link-btn"
            className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-full"
          >
            {copied ? <><Check size={16} className="mr-2" /> Copiado</> : <><Copy size={16} className="mr-2" /> Copiar enlace</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
