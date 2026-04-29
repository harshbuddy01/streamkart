import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "./lib/cart";
import { CurrencyProvider } from "./lib/currency";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Policy from "./pages/Policy";

function App() {
  return (
    <div className="App min-h-screen bg-[#F9F6F0] text-[#1A1A1A]">
      <CurrencyProvider>
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
      </CurrencyProvider>
    </div>
  );
}

export default App;
