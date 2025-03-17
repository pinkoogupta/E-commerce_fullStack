import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux"; // Import useSelector and useDispatch
import { assets } from "../assets/assets.js";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { setShowSearch, setToken, setCartItems } from "../redux/features/shopSlice";  // Import Redux actions

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access state from Redux
  const token = useSelector((state) => state.shop.token);
  const cartItems = useSelector((state) => state.shop.cartItems);

  // Calculate cart count
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          totalCount += cartItems[items][item];
        }
      }
    }
    return totalCount;
  };

  // Handle logout
  const logout = () => {
    localStorage.removeItem("token");
    dispatch(setToken("")); // Clear token in Redux
    dispatch(setCartItems({})); // Clear cart items in Redux
    navigate("/login");
  };

  return (
    <div>
      <div className="flex items-center justify-between py-5 font-medium">
        <Link to={"/"}>
          <img src={assets.logo} alt="logo" className="w-36" />
        </Link>
        <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
          <NavLink to="/" className="flex flex-col items-center gap-1 nav-link">
            <p>HOME</p>
            <hr className="underline w-0 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
          <NavLink
            to="/collection"
            className="flex flex-col items-center gap-1 nav-link"
          >
            <p>COLLECTION</p>
            <hr className="underline w-0 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
          <NavLink
            to="/about"
            className="flex flex-col items-center gap-1 nav-link"
          >
            <p>ABOUT</p>
            <hr className="underline w-0 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
          <NavLink
            to="/contact"
            className="flex flex-col items-center gap-1 nav-link"
          >
            <p>CONTACT</p>
            <hr className="underline w-0 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
        </ul>

        <div className="flex items-center gap-6">
          <img
            onClick={() => dispatch(setShowSearch(true))} // Dispatch setShowSearch action
            src={assets.search_icon}
            className="w-5 cursor-pointer"
          />

          <div className="group relative">
            <img
              onClick={() => (token ? null : navigate("/login"))}
              src={assets.profile_icon}
              className="w-5 cursor-pointer"
            />
            {/* Drop Down */}
            {token && (
              <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
                <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                  <p className="cursor-pointer hover:text-black">My Profile</p>
                  <p
                    onClick={() => navigate("/orders")}
                    className="cursor-pointer hover:text-black"
                  >
                    Orders
                  </p>
                  <p
                    onClick={logout}
                    className="cursor-pointer hover:text-black"
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>

          <Link to="/cart" className="relative">
            <img src={assets.cart_icon} className="w-5 cursor-pointer" />
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
              {getCartCount()}
            </p>
          </Link>

          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-5 cursor-pointer sm:hidden"
          />
        </div>

        {/* Sidebar for menu */}
        <div
          className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
            visible ? "w-full" : "w-0"
          }`}
        >
          <div className="flex flex-col text-gray-600">
            <div
              onClick={() => setVisible(false)}
              className="flex items-center gap-4 p-3"
            >
              <img src={assets.dropdown_icon} className="h-4 rotate-180" />
              <p className="cursor-pointer">Back</p>
            </div>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/"
            >
              HOME
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/collection"
            >
              COLLECTION
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/about"
            >
              ABOUT
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/contact"
            >
              CONTACT
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;