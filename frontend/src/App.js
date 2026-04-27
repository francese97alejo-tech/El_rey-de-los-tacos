import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Menu from "./pages/Menu";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
