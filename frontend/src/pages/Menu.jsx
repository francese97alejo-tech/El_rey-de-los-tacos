import { useEffect, useState } from "react";
import { fetchCategories, fetchProducts } from "../lib/api";
import { useCart } from "../context/CartContext";
import SauceModal from "../components/SauceModal";
import QRModal from "../components/QRModal";
import CartDrawer from "../components/CartDrawer";
import { Button } from "../components/ui/button";
import { ChevronDown, Plus, ShoppingCart, MessageCircle, Phone, Share2, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_digital-taco-shop/artifacts/9luf18kx_file_0000000014a871f580aac682e886a718.jpg";
const WHATSAPP = "5491155644915";
const fmt = (n) => `$${Number(n).toLocaleString("es-AR")}`;

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [openCat, setOpenCat] = useState(null);
  const [sauceModal, setSauceModal] = useState({ open: false, product: null });
  const [qrOpen, setQrOpen] = useState(false);
  const cart = useCart();

  useEffect(() => {
    fetchCategories().then((cs) => {
      setCategories(cs);
      if (cs.length > 0) setOpenCat(cs[0].id);
    });
    fetchProducts().then(setProducts);
  }, []);

  const productsByCat = (cid) => products.filter((p) => p.category_id === cid);

  const handleAdd = (product) => {
    if (product.is_taco) {
      setSauceModal({ open: true, product });
    } else {
      cart.addItem(product, 1);
      toast.success(`${product.name} agregado`, { duration: 1500 });
    }
  };

  const confirmSauces = (sauces) => {
    cart.addItem(sauceModal.product, 1, sauces);
    toast.success(`${sauceModal.product.name} agregado con ${sauces.map(s=>s.name).join(", ")}`);
    setSauceModal({ open: false, product: null });
  };

  const franchiseUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola! Me interesa información sobre la franquicia de El Rey de los Tacos 🌮👑")}`;
  const orderUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola! Quisiera hacer un pedido de El Rey de los Tacos")}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden bg-[#0E2A3A]">
        <img
          src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1600&q=80"
          alt="Tacos"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        <div className="absolute top-4 right-4 flex gap-2">
          <span className="bg-[#F59E0B] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
            Delivery
          </span>
          <span className="bg-[#16A34A] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
            Abierto
          </span>
        </div>
        <button
          onClick={() => cart.setOpen(true)}
          data-testid="open-cart-btn"
          className="absolute bottom-4 right-4 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-full px-5 py-3 shadow-2xl flex items-center gap-2 font-bold transition-all hover:scale-105"
        >
          <ShoppingCart size={18} />
          {cart.count > 0 && <span className="bg-white text-[#16A34A] rounded-full px-2 text-sm">{cart.count}</span>}
        </button>
      </div>

      {/* Logo + brand card */}
      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-5 flex items-center gap-4 border border-stone-100">
          <img src={LOGO_URL} alt="Logo" className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover flex-shrink-0" data-testid="brand-logo" />
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-2xl sm:text-3xl text-stone-900 tracking-tight leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>
              EL REY DE LOS TACOS
            </h1>
            <p className="text-stone-500 text-sm mt-1 flex items-center gap-1">
              <Crown size={14} className="text-[#F59E0B]" /> Auténticos sabores mexicanos
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <a
            href={orderUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="action-whatsapp"
            className="flex flex-col items-center gap-1 py-3 bg-white rounded-2xl border border-stone-100 hover:bg-stone-50 transition"
          >
            <MessageCircle size={22} className="text-[#16A34A]" />
            <span className="text-xs text-stone-600 font-semibold">WhatsApp</span>
          </a>
          <a
            href={`tel:+${WHATSAPP}`}
            data-testid="action-phone"
            className="flex flex-col items-center gap-1 py-3 bg-white rounded-2xl border border-stone-100 hover:bg-stone-50 transition"
          >
            <Phone size={22} className="text-stone-700" />
            <span className="text-xs text-stone-600 font-semibold">Llamar</span>
          </a>
          <button
            onClick={() => setQrOpen(true)}
            data-testid="action-share"
            className="flex flex-col items-center gap-1 py-3 bg-white rounded-2xl border border-stone-100 hover:bg-stone-50 transition"
          >
            <Share2 size={22} className="text-stone-700" />
            <span className="text-xs text-stone-600 font-semibold">Compartir</span>
          </button>
        </div>
      </div>

      {/* Category accordion */}
      <div className="max-w-3xl mx-auto px-4 mt-6 pb-32 space-y-3">
        {categories.map((cat) => {
          const isOpen = openCat === cat.id;
          const prods = productsByCat(cat.id);
          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm" data-testid={`category-block-${cat.id}`}>
              <button
                onClick={() => setOpenCat(isOpen ? null : cat.id)}
                data-testid={`category-bar-${cat.id}`}
                className="w-full flex items-center justify-between px-5 py-5 hover:bg-stone-50 transition"
              >
                <span className="font-black text-lg sm:text-xl tracking-wide text-stone-800 uppercase" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {cat.name}
                </span>
                <ChevronDown size={22} className={`text-stone-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-stone-100 divide-y divide-stone-100">
                  {prods.length === 0 && (
                    <div className="px-5 py-6 text-center text-stone-400 text-sm">Sin productos en esta categoría</div>
                  )}
                  {prods.map((p) => (
                    <div key={p.id} className="px-5 py-4 flex items-start gap-3" data-testid={`product-${p.id}`}>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-stone-900 uppercase text-sm sm:text-base">{p.name}</div>
                        {p.description && <div className="text-sm text-stone-500 italic mt-1 leading-snug">{p.description}</div>}
                        <div className="text-stone-900 font-bold mt-2">{fmt(p.price)}</div>
                        <button
                          onClick={() => handleAdd(p)}
                          data-testid={`add-to-cart-${p.id}`}
                          className="mt-2 inline-flex items-center gap-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-sm px-4 py-1.5 rounded-full transition shadow"
                        >
                          Pedir <Plus size={14} />
                        </button>
                      </div>
                      {p.image_url && (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl flex-shrink-0"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with franchise */}
      <footer className="bg-[#0E2A3A] text-white py-10 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <Crown className="mx-auto text-[#F59E0B]" size={36} />
          <h3 className="text-2xl font-black" style={{ fontFamily: "Outfit, sans-serif" }}>
            ¿Querés franquiciar El Rey de los Tacos?
          </h3>
          <p className="text-white/70 max-w-md mx-auto text-sm">
            Sumate a la corona del taco. Escribinos por WhatsApp y te enviamos toda la información.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola! Quisiera información sobre franquicias de El Rey de los Tacos 👑🌮")}`}
            target="_blank"
            rel="noreferrer"
            data-testid="franchise-btn"
            className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-full px-7 py-3 font-bold transition shadow-xl"
          >
            <MessageCircle size={18} /> Pedir información de franquicia
          </a>
          <div className="pt-6 border-t border-white/10 mt-6 text-xs text-white/50">
            <Link to="/admin/login" data-testid="admin-link" className="hover:text-white/80">
              Acceso administrador
            </Link>
            <span className="mx-2">·</span>
            <span>El Rey de los Tacos © 2026</span>
          </div>
        </div>
      </footer>

      <SauceModal
        open={sauceModal.open}
        onClose={() => setSauceModal({ open: false, product: null })}
        onConfirm={confirmSauces}
        productName={sauceModal.product?.name}
      />
      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
      <CartDrawer />
    </div>
  );
}
