import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "./lib/cart";
import { CurrencyProvider } from "./lib/currency";
import { AuthProvider } from "./lib/auth";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Policy from "./pages/Policy";
import Reader from "./pages/Reader";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Support from "./pages/Support";

function App() {
  return (
    <div className="App min-h-screen bg-[#F9F6F0] text-[#1A1A1A]">
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order/:id" element={<OrderSuccess />} />
                <Route path="/policy/:type" element={<Policy />} />
                <Route path="/read/:orderId/:productId" element={<Reader />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/support" element={<Support />} />
              </Routes>
              <Footer />
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: "#F9F6F0",
                    color: "#1A1A1A",
                    border: "1px solid #D4AF37",
                    borderRadius: "2px",
                    fontFamily: "Manrope, sans-serif",
                  },
                }}
              />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </div>
  );
}

export default App;
