import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCategories, fetchProducts, fetchSauces,
  createCategory, updateCategory, deleteCategory,
  createProduct, updateProduct, deleteProduct,
  createSauce, updateSauce, deleteSauce,
  isAuthed, logout,
} from "../lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Pencil, Trash2, Plus, LogOut, Crown, Info } from "lucide-react";
import { toast } from "sonner";

const fmt = (n) => `$${Number(n).toLocaleString("es-AR")}`;

export default function Admin() {
  const nav = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [sauces, setSauces] = useState([]);

  useEffect(() => {
    if (!isAuthed()) {
      nav("/admin/login");
      return;
    }
    reloadAll();
  }, []);

  const reloadAll = () => {
    fetchCategories().then(setCategories);
    fetchProducts().then(setProducts);
    fetchSauces().then(setSauces);
  };

  const handleLogout = () => {
    logout();
    nav("/admin/login");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size={20} className="text-[#F59E0B]" />
            <h1 className="font-black text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>Panel · El Rey de los Tacos</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => nav("/")} variant="outline" className="rounded-full" data-testid="view-menu-btn">Ver menú</Button>
            <Button onClick={handleLogout} variant="outline" className="rounded-full" data-testid="logout-btn">
              <LogOut size={14} className="mr-1" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex gap-3 text-sm">
          <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-blue-900">
            <strong>Cómo agregar fotos a los productos:</strong> Pegá una URL pública de la imagen en el campo "URL de imagen". Podés usar:
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>Imágenes de Unsplash, Pexels o Google Images (clic derecho → "Copiar dirección de imagen")</li>
              <li>Imagen subida a Imgur, Postimages, o cualquier servicio de hosting</li>
              <li>URL desde tu propio sitio (debe terminar en .jpg, .png o .webp)</li>
            </ul>
          </div>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="bg-white border border-stone-200 rounded-full p-1 mb-6">
            <TabsTrigger value="products" data-testid="tab-products" className="rounded-full">Productos</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories" className="rounded-full">Categorías</TabsTrigger>
            <TabsTrigger value="sauces" data-testid="tab-sauces" className="rounded-full">Salsas</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab products={products} categories={categories} onChange={reloadAll} />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab categories={categories} onChange={reloadAll} />
          </TabsContent>
          <TabsContent value="sauces">
            <SaucesTab sauces={sauces} onChange={reloadAll} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ---- Categories Tab ----
function CategoriesTab({ categories, onChange }) {
  const [editing, setEditing] = useState(null);

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar categoría y sus productos?")) return;
    await deleteCategory(id);
    toast.success("Categoría eliminada");
    onChange();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({})} className="bg-[#D94814] hover:bg-[#B9380E] rounded-full" data-testid="new-category-btn">
          <Plus size={16} className="mr-1" /> Nueva categoría
        </Button>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr><th className="text-left p-3 text-xs uppercase font-bold text-stone-600">Nombre</th>
            <th className="text-left p-3 text-xs uppercase font-bold text-stone-600 w-24">Orden</th>
            <th className="w-32"></th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-stone-100" data-testid={`cat-row-${c.id}`}>
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3 text-stone-500">{c.order}</td>
                <td className="p-3 flex gap-1 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(c)} data-testid={`edit-cat-${c.id}`}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(c.id)} data-testid={`del-cat-${c.id}`} className="text-red-600 hover:text-red-700"><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-stone-400">Sin categorías aún</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <CategoryDialog item={editing} onClose={() => setEditing(null)} onSaved={onChange} />}
    </div>
  );
}

function CategoryDialog({ item, onClose, onSaved }) {
  const [name, setName] = useState(item.name || "");
  const [order, setOrder] = useState(item.order ?? 0);

  const save = async () => {
    try {
      if (item.id) await updateCategory(item.id, { name, order: Number(order) });
      else await createCategory({ name, order: Number(order) });
      toast.success("Guardado");
      onSaved();
      onClose();
    } catch (e) {
      toast.error("Error al guardar");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl">
        <DialogHeader><DialogTitle>{item.id ? "Editar" : "Nueva"} categoría</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} data-testid="cat-name-input" /></div>
          <div><Label>Orden</Label><Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} data-testid="cat-order-input" /></div>
        </div>
        <Button onClick={save} className="bg-[#D94814] hover:bg-[#B9380E] rounded-full" data-testid="cat-save-btn">Guardar</Button>
      </DialogContent>
    </Dialog>
  );
}

// ---- Products Tab ----
function ProductsTab({ products, categories, onChange }) {
  const [editing, setEditing] = useState(null);

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    await deleteProduct(id);
    toast.success("Producto eliminado");
    onChange();
  };

  const catName = (id) => categories.find((c) => c.id === id)?.name || "—";

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditing({})} className="bg-[#D94814] hover:bg-[#B9380E] rounded-full" data-testid="new-product-btn">
          <Plus size={16} className="mr-1" /> Nuevo producto
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden" data-testid={`prod-card-${p.id}`}>
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" onError={(e)=>{e.target.style.display='none'}}/>
            ) : (
              <div className="w-full h-40 bg-stone-100 flex items-center justify-center text-stone-400 text-sm">Sin imagen</div>
            )}
            <div className="p-4">
              <div className="text-xs uppercase text-stone-400 font-bold tracking-wide">{catName(p.category_id)}</div>
              <div className="font-bold text-stone-900 mt-1">{p.name}</div>
              <div className="text-sm text-stone-500 line-clamp-2 mt-1">{p.description}</div>
              <div className="flex justify-between items-center mt-3">
                <span className="font-black text-[#D94814]">{fmt(p.price)}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(p)} data-testid={`edit-prod-${p.id}`}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-red-600" data-testid={`del-prod-${p.id}`}><Trash2 size={14} /></Button>
                </div>
              </div>
              {p.is_taco && <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">🌮 Requiere salsas</span>}
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="col-span-full text-center text-stone-400 py-12">Sin productos aún</div>}
      </div>
      {editing && <ProductDialog item={editing} categories={categories} onClose={() => setEditing(null)} onSaved={onChange} />}
    </div>
  );
}

function ProductDialog({ item, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    category_id: item.category_id || categories[0]?.id || "",
    name: item.name || "",
    description: item.description || "",
    price: item.price ?? 0,
    image_url: item.image_url || "",
    stock: item.stock ?? 999,
    is_taco: item.is_taco ?? false,
  });

  const save = async () => {
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (item.id) await updateProduct(item.id, payload);
      else await createProduct(payload);
      toast.success("Guardado");
      onSaved();
      onClose();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item.id ? "Editar" : "Nuevo"} producto</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Categoría</Label>
            <Select value={form.category_id} onValueChange={(v) => set("category_id", v)}>
              <SelectTrigger data-testid="prod-cat-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Nombre</Label><Input value={form.name} onChange={(e)=>set("name", e.target.value)} data-testid="prod-name-input" /></div>
          <div><Label>Descripción</Label><Textarea value={form.description} onChange={(e)=>set("description", e.target.value)} data-testid="prod-desc-input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Precio ($)</Label><Input type="number" value={form.price} onChange={(e)=>set("price", e.target.value)} data-testid="prod-price-input" /></div>
            <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e)=>set("stock", e.target.value)} data-testid="prod-stock-input" /></div>
          </div>
          <div>
            <Label>URL de imagen</Label>
            <Input
              placeholder="https://..."
              value={form.image_url}
              onChange={(e)=>set("image_url", e.target.value)}
              data-testid="prod-image-input"
            />
            <p className="text-xs text-stone-500 mt-1">Pegá la URL pública de la imagen (jpg, png, webp)</p>
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 w-full h-32 object-cover rounded-xl" onError={(e)=>{e.target.style.display='none'}}/>}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-stone-200 p-3">
            <div>
              <Label className="block">¿Es un taco?</Label>
              <p className="text-xs text-stone-500">Si activás esto, al pedirlo el cliente debe elegir 2 salsas</p>
            </div>
            <Switch checked={form.is_taco} onCheckedChange={(v) => set("is_taco", v)} data-testid="prod-taco-switch" />
          </div>
        </div>
        <Button onClick={save} className="bg-[#D94814] hover:bg-[#B9380E] rounded-full" data-testid="prod-save-btn">Guardar producto</Button>
      </DialogContent>
    </Dialog>
  );
}

// ---- Sauces Tab ----
function SaucesTab({ sauces, onChange }) {
  const [editing, setEditing] = useState(null);

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar salsa?")) return;
    await deleteSauce(id);
    toast.success("Salsa eliminada");
    onChange();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-600">Total: <strong>{sauces.length}</strong> salsas (recomendado: 7)</p>
        <Button onClick={() => setEditing({})} className="bg-[#D94814] hover:bg-[#B9380E] rounded-full" data-testid="new-sauce-btn">
          <Plus size={16} className="mr-1" /> Nueva salsa
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sauces.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-stone-200 p-4" data-testid={`sauce-card-${s.id}`}>
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="font-bold">🌶 {s.name}</div>
                {s.description && <div className="text-sm text-stone-500 mt-1">{s.description}</div>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditing(s)} data-testid={`edit-sauce-${s.id}`}><Pencil size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(s.id)} className="text-red-600" data-testid={`del-sauce-${s.id}`}><Trash2 size={14} /></Button>
              </div>
            </div>
          </div>
        ))}
        {sauces.length === 0 && <div className="col-span-full text-center text-stone-400 py-12">Sin salsas aún</div>}
      </div>
      {editing && <SauceDialog item={editing} onClose={() => setEditing(null)} onSaved={onChange} />}
    </div>
  );
}

function SauceDialog({ item, onClose, onSaved }) {
  const [name, setName] = useState(item.name || "");
  const [description, setDescription] = useState(item.description || "");

  const save = async () => {
    try {
      if (item.id) await updateSauce(item.id, { name, description });
      else await createSauce({ name, description });
      toast.success("Guardado");
      onSaved();
      onClose();
    } catch {
      toast.error("Error");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl">
        <DialogHeader><DialogTitle>{item.id ? "Editar" : "Nueva"} salsa</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nombre</Label><Input value={name} onChange={(e)=>setName(e.target.value)} data-testid="sauce-name-input" /></div>
          <div><Label>Descripción</Label><Textarea value={description} onChange={(e)=>setDescription(e.target.value)} data-testid="sauce-desc-input" /></div>
        </div>
        <Button onClick={save} className="bg-[#D94814] hover:bg-[#B9380E] rounded-full" data-testid="sauce-save-btn">Guardar</Button>
      </DialogContent>
    </Dialog>
  );
}
