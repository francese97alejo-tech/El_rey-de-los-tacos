import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Crown, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_digital-taco-shop/artifacts/9luf18kx_file_0000000014a871f580aac682e886a718.jpg";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(user, pass);
      toast.success("¡Bienvenido al panel!");
      nav("/admin");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error de inicio de sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E2A3A] via-[#143247] to-[#0E2A3A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-white/60 hover:text-white text-sm flex items-center gap-1 mb-4" data-testid="back-to-menu">
          <ArrowLeft size={14} /> Volver al menú
        </Link>
        <div className="bg-white rounded-3xl p-7 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <img src={LOGO_URL} alt="Logo" className="w-20 h-20 rounded-2xl object-cover mb-3" />
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              <Crown size={18} className="text-[#F59E0B]" /> Panel de administración
            </h1>
            <p className="text-sm text-stone-500 mt-1">El Rey de los Tacos</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wide text-stone-600 font-bold">Usuario</Label>
              <Input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                data-testid="login-user-input"
                className="mt-1 rounded-xl"
                required
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-stone-600 font-bold">Contraseña</Label>
              <Input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                data-testid="login-pass-input"
                className="mt-1 rounded-xl"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit-btn"
              className="w-full bg-[#D94814] hover:bg-[#B9380E] text-white rounded-full font-bold py-6"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
