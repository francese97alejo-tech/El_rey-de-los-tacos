import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { useCart } from "../context/CartContext";
import { Minus, Plus, Trash2, ShoppingCart, MessageCircle } from "lucide-react";
import { useState } from "react";

const WHATSAPP = "5491155644915";
const fmt = (n) => `$${Number(n).toLocaleString("es-AR")}`;

export default function CartDrawer() {
  const { items, updateQty, removeItem, total, open, setOpen, clear } = useCart();
  const [mode, setMode] = useState("retiro");
  const [pay, setPay] = useState("efectivo");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const sendOrder = () => {
    if (items.length === 0) return;
    let msg = `*🌮 EL REY DE LOS TACOS - Nuevo Pedido*%0A%0A`;
    msg += `*Cliente:* ${name || "Sin nombre"}%0A`;
    msg += `*Modalidad:* ${mode === "retiro" ? "Retiro en local" : "Envío a domicilio"}%0A`;
    if (mode === "envio") msg += `*Dirección:* ${address}%0A`;
    msg += `*Pago:* ${pay === "efectivo" ? "Efectivo" : "Transferencia"}%0A%0A`;
    msg += `*Pedido:*%0A`;
    items.forEach((i) => {
      msg += `• ${i.qty}x ${i.product.name} - ${fmt(i.product.price * i.qty)}%0A`;
      if (i.sauces && i.sauces.length > 0) {
        msg += `   _Salsas: ${i.sauces.map((s) => s.name).join(", ")}_%0A`;
      }
    });
    msg += `%0A*TOTAL: ${fmt(total)}*`;
    if (notes) msg += `%0A%0A*Notas:* ${notes}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[#16A34A] text-white p-0 border-l-0 flex flex-col"
        data-testid="cart-drawer"
      >
        <SheetHeader className="p-5 border-b border-white/20">
          <SheetTitle className="text-white flex items-center gap-2 text-xl">
            <ShoppingCart size={22} /> Tu carrito
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 && (
            <div className="text-center text-white/80 py-12">
              <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
              <p>Tu carrito está vacío</p>
              <p className="text-sm mt-1 opacity-70">Agregá algo del menú</p>
            </div>
          )}
          {items.map((i) => (
            <div key={i.lineId} className="bg-white/10 backdrop-blur rounded-2xl p-3" data-testid={`cart-line-${i.lineId}`}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="font-bold">{i.product.name}</div>
                  {i.sauces && i.sauces.length > 0 && (
                    <div className="text-xs opacity-80 mt-0.5">
                      🌶 {i.sauces.map((s) => s.name).join(" · ")}
                    </div>
                  )}
                  <div className="text-sm opacity-90 mt-1">{fmt(i.product.price)} c/u</div>
                </div>
                <button onClick={() => removeItem(i.lineId)} className="p-1.5 hover:bg-white/20 rounded-full" data-testid={`remove-${i.lineId}`}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(i.lineId, i.qty - 1)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                    <Minus size={14} />
                  </button>
                  <span className="font-bold w-6 text-center">{i.qty}</span>
                  <button onClick={() => updateQty(i.lineId, i.qty + 1)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="font-bold">{fmt(i.product.price * i.qty)}</div>
              </div>
            </div>
          ))}

          {items.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/20">
              <div>
                <Label className="text-white text-sm font-bold">Modalidad</Label>
                <RadioGroup value={mode} onValueChange={setMode} className="grid grid-cols-2 gap-2 mt-2">
                  <label className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border-2 ${mode === "retiro" ? "bg-white text-[#16A34A] border-white" : "border-white/30"}`}>
                    <RadioGroupItem value="retiro" data-testid="mode-retiro" className="border-current" />
                    <span className="font-semibold text-sm">Retiro en local</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border-2 ${mode === "envio" ? "bg-white text-[#16A34A] border-white" : "border-white/30"}`}>
                    <RadioGroupItem value="envio" data-testid="mode-envio" className="border-current" />
                    <span className="font-semibold text-sm">Envío a domicilio</span>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-white text-sm font-bold">Pago</Label>
                <RadioGroup value={pay} onValueChange={setPay} className="grid grid-cols-2 gap-2 mt-2">
                  <label className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border-2 ${pay === "efectivo" ? "bg-white text-[#16A34A] border-white" : "border-white/30"}`}>
                    <RadioGroupItem value="efectivo" data-testid="pay-efectivo" className="border-current" />
                    <span className="font-semibold text-sm">Efectivo</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border-2 ${pay === "transferencia" ? "bg-white text-[#16A34A] border-white" : "border-white/30"}`}>
                    <RadioGroupItem value="transferencia" data-testid="pay-transferencia" className="border-current" />
                    <span className="font-semibold text-sm">Transferencia</span>
                  </label>
                </RadioGroup>
              </div>

              <Input
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="cart-name-input"
                className="bg-white/10 border-white/30 placeholder:text-white/60 text-white rounded-xl"
              />
              {mode === "envio" && (
                <Input
                  placeholder="Dirección de entrega"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  data-testid="cart-address-input"
                  className="bg-white/10 border-white/30 placeholder:text-white/60 text-white rounded-xl"
                />
              )}
              <Textarea
                placeholder="Aclaraciones (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="cart-notes-input"
                className="bg-white/10 border-white/30 placeholder:text-white/60 text-white rounded-xl resize-none"
                rows={2}
              />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-white/20 bg-[#15803D] space-y-3">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>TOTAL</span>
              <span data-testid="cart-total">{fmt(total)}</span>
            </div>
            <Button
              onClick={sendOrder}
              data-testid="checkout-whatsapp-btn"
              className="w-full bg-white hover:bg-stone-100 text-[#16A34A] rounded-full font-bold py-6 text-base shadow-lg"
            >
              <MessageCircle size={20} className="mr-2" /> Enviar pedido por WhatsApp
            </Button>
            <button onClick={clear} className="w-full text-white/80 hover:text-white text-sm underline">
              Vaciar carrito
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
