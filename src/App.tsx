import { Navigate, Route, Routes } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import { CartProvider } from "./context/cart-context";
import { Header } from "./components/header/Header";
import { ScrollToTop } from "./components/scroll-to-top/ScrollToTop";
import { CartPage } from "./pages/cart-page/CartPage";
import { ProductListPage } from "./pages/product-listing-page/ProductListPage";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Header />
      <div className="appRoot">
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar
          transition={Slide}
        />
      </div>
    </CartProvider>
  );
}

export default App;
