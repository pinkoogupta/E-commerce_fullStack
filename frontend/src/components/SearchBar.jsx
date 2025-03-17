import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; // Import useSelector and useDispatch
import { assets } from "../assets/assets";
import { useLocation } from "react-router-dom";
import { setSearch, setShowSearch } from "../redux/features/shopSlice"; // Import Redux actions

const SearchBar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  // Access state from Redux
  const search = useSelector((state) => state.shop.search);
  const showSearch = useSelector((state) => state.shop.showSearch);

  // Update visibility based on the current route
  useEffect(() => {
    if (location.pathname.includes("collection")) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  return showSearch && visible ? (
    <div className="border-t border-b bg-gray-50 text-center">
      <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 mx-5 my-5 rounded-full w-3/4 sm:w-1/2">
        <input
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))} // Dispatch setSearch action
          type="text"
          placeholder="Search"
          className="flex-1 outline-none bg-inherit text-sm"
        />
        <img className="w-4" src={assets.search_icon} alt="Search Icon" />
      </div>
      <img
        onClick={() => dispatch(setShowSearch(false))} // Dispatch setShowSearch action
        className="inline w-3 cursor-pointer"
        src={assets.cross_icon}
        alt="Close Search"
      />
    </div>
  ) : null;
};

export default SearchBar;