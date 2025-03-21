import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { setSearch, setShowSearch, fetchProducts } from "../redux/features/shopSlice";
import { Filter, ChevronDown, ChevronRight, ShoppingBag, Search, ArrowDownUp } from "lucide-react";

const Collection = () => {
  const dispatch = useDispatch();
  const { products, search, showSearch } = useSelector((state) => state.shop);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [sortOption, setSortOption] = useState("relevent");

  useEffect(() => {
    dispatch(fetchProducts()); // Fetch products on component mount
  }, [dispatch]);

  useEffect(() => {
    // Extract all unique sizes and colors from the products' stock
    const allSizes = products.flatMap(product => 
      product.stock.map(stockItem => stockItem.size)
    );
    const allColors = products.flatMap(product => 
      product.stock.map(stockItem => stockItem.color)
    );

    const uniqueSizes = [...new Set(allSizes)]; // Remove duplicates
    const uniqueColors = [...new Set(allColors)]; // Remove duplicates

    setAvailableSizes(uniqueSizes);
    setAvailableColors(uniqueColors);
  }, [products]);

  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleSize = (e) => {
    const value = e.target.value;
    setSelectedSizes((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleColor = (e) => {
    const value = e.target.value;
    setSelectedColors((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const sortProducts = (productsToSort) => {
    switch (sortOption) {
      case "low-high":
        return [...productsToSort].sort((a, b) => a.price - b.price);
      case "high-low":
        return [...productsToSort].sort((a, b) => b.price - a.price);
      case "newest":
        return [...productsToSort].reverse(); 
      default:
        return productsToSort; 
    }
  };

  useEffect(() => {
    let filtered = products;

    // Apply search filter if search is active
    if (showSearch && search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (category.length > 0) {
      filtered = filtered.filter((product) => category.includes(product.category));
    }

    // Apply sub-category filter
    if (subCategory.length > 0) {
      filtered = filtered.filter((product) => subCategory.includes(product.subCategory));
    }

    // Apply size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.stock.some(stockItem => selectedSizes.includes(stockItem.size))
      );
    }

    // Apply color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter((product) =>
        product.stock.some(stockItem => selectedColors.includes(stockItem.color))
      );
    }

    // Apply sorting
    setFilterProducts(sortProducts(filtered));
  }, [category, subCategory, selectedSizes, selectedColors, products, sortOption, search, showSearch]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Filter */}
      <div className="min-w-60">
        <div 
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 flex items-center cursor-pointer gap-2 font-medium text-gray-800 transition-colors hover:text-gray-600"
        >
          <Filter size={18} />
          <span className="text-xl">FILTERS</span>
          {showFilter ? 
            <ChevronDown className="h-4 w-4 sm:hidden" /> : 
            <ChevronRight className="h-4 w-4 sm:hidden" />
          }
        </div>

        {/* Filter Options */}
        <div className={`bg-white rounded-md shadow-sm border border-gray-200 p-4 mt-4 ${showFilter ? "block" : "hidden"} sm:block`}>
          {/* Category Filter */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="mb-3 text-sm font-medium text-gray-700">CATEGORIES</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {["Men", "Women", "Kids"].map((cat) => (
                <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900" key={cat}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-gray-800 cursor-pointer" 
                    value={cat} 
                    onChange={toggleCategory}
                    checked={category.includes(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Sub Category Filter */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="mb-3 text-sm font-medium text-gray-700">TYPE</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {["Topwear", "Bottomwear", "Winterwear"].map((subCat) => (
                <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900" key={subCat}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-gray-800 cursor-pointer" 
                    value={subCat} 
                    onChange={toggleSubCategory}
                    checked={subCategory.includes(subCat)}
                  />
                  {subCat}
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="mb-3 text-sm font-medium text-gray-700">SIZE</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {availableSizes.map((size, index) => (
                <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900" key={`${size}-${index}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-gray-800 cursor-pointer" 
                    value={size} 
                    onChange={toggleSize}
                    checked={selectedSizes.includes(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">COLOR</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {availableColors.map((color, index) => (
                <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900" key={`${color}-${index}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-gray-800 cursor-pointer" 
                    value={color} 
                    onChange={toggleColor}
                    checked={selectedColors.includes(color)}
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <div className="text-base sm:text-2xl">
            <Title text1={"ALL"} text2={"COLLECTION"} />
            <div className="text-sm text-gray-500 mt-1">
              {filterProducts.length} products found
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <ArrowDownUp size={14} className="text-gray-500" />
            </div>
            <select 
              className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md text-sm appearance-none bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-gray-500"
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="relevent">Sort by: Relevant</option>
              <option value="low-high">Sort by: Low-High</option>
              <option value="high-low">Sort by: High-Low</option>
              <option value="newest">Sort by: Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Search results indicator */}
        {showSearch && search && (
          <div className="flex items-center gap-2 mb-4 py-2 px-4 bg-gray-100 rounded-md">
            <Search size={16} />
            <span className="text-sm">Search results for: <strong>{search}</strong></span>
          </div>
        )}

        {/* Render Products */}
        {filterProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {filterProducts.map((item) => (
              <ProductItem 
                key={item._id} // Use the product's unique _id as the key
                id={item._id} 
                name={item.name} 
                image={item.image} 
                price={item.price} 
                selectedSizes={selectedSizes} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <ShoppingBag size={48} className="text-gray-300 mb-4" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try changing your filter options</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;