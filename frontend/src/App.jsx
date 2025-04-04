import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import ForgetPassword from "./pages/ForgetPassword"; // Import Forget Password Page
import ResetPassword from "./pages/ResetPassword"; // Import Reset Password Page
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/scrollToTop";
import SearchBar from "./components/SearchBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <div className="px-4 md:px-[7vw] sm:px-[5vw] lg:px-[9vw]">
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/forgot-password" element={<ForgetPassword />} /> 
        <Route path="/reset-password/:token" element={<ResetPassword />} /> 
      </Routes>
      <Footer />
    </div>
  );
}
