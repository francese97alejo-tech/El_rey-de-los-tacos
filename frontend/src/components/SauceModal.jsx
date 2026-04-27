import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { fetchSauces } from "../lib/api";
import { Flame } from "lucide-react";

export default function SauceModal({ open, onClose, onConfirm, productName }) {
  const [sauces, setSauces] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open) {
      setSelected([]);
      fetchSauces().then(setSauces);
    }
  }, [open]);

  const toggle = (s) => {
    setSelected((prev) => {
      if (prev.find((x) => x.id === s.id)) return prev.filter((x) => x.id !== s.id);
      if (prev.length >= 2) return prev;
      return [...prev, s];
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-white rounded-3xl max-w-md" data-testid="sauce-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flame className="text-[#D94814]" size={22} />
            Elegí 2 salsas para tu {productName}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-stone-500 -mt-2">Seleccionaste {selected.length}/2</p>
        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
          {sauces.map((s) => {
            const isSel = !!selected.find((x) => x.id === s.id);
            const disabled = !isSel && selected.length >= 2;
            return (
              <button
                key={s.id}
                onClick={() => toggle(s)}
                disabled={disabled}
                data-testid={`sauce-option-${s.id}`}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                  isSel
                    ? "border-[#16A34A] bg-[#16A34A]/5 ring-2 ring-[#16A34A]/30"
                    : "border-stone-200 hover:border-stone-300 disabled:opacity-40"
                }`}
              >
                <Checkbox checked={isSel} className="pointer-events-none" />
                <div className="flex-1">
                  <div className="font-semibold text-stone-900">{s.name}</div>
                  {s.description && <div className="text-xs text-stone-500">{s.description}</div>}
                </div>
              </button>
            );
          })}
        </div>
        <Button
          data-testid="confirm-sauces-btn"
          disabled={selected.length !== 2}
          onClick={() => onConfirm(selected)}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-full py-6 font-bold text-base disabled:opacity-50"
        >
          Confirmar y agregar al carrito
        </Button>
      </DialogContent>
    </Dialog>
  );
}
