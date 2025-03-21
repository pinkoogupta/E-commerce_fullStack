import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../config/config";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [BestSeller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [stock, setStock] = useState([]);
  const [totalStock, setTotalStock] = useState(0);

  // Initialize stock when sizes or colors change
  useEffect(() => {
    const newStock = sizes.flatMap((size) =>
      colors.map((color) => ({
        size,
        color,
        quantity: 0,
      }))
    );
    setStock(newStock);
  }, [sizes, colors]);

  const handleStockChange = (size, color, value) => {
    const updatedStock = stock.map((item) =>
      item.size === size && item.color === color ? { ...item, quantity: Number(value) || 0 } : item
    );
    setStock(updatedStock);

    const total = updatedStock.reduce((acc, item) => acc + item.quantity, 0);
    setTotalStock(total);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("BestSeller", JSON.stringify(BestSeller));
      formData.append("stock", JSON.stringify(stock));
      formData.append("totalStock", totalStock);

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(`${backendUrl}/api/v1/product/addProduct`, formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
        setPrice("");
        setSizes([]);
        setColors([]);
        setStock([]);
        setTotalStock(0);
        setBestSeller(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      {/* Upload Images */}
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((image, index) => {
            const setImage = [setImage1, setImage2, setImage3, setImage4][index];
            return (
              <label key={index} htmlFor={`Image${index + 1}`}>
                <img className="w-20" src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                <input onChange={(e) => setImage(e.target.files[0])} type="file" id={`Image${index + 1}`} hidden />
              </label>
            );
          })}
        </div>
      </div>

      {/* Product Name */}
      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      {/* Product Description */}
      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Write content here"
          required
        />
      </div>

      {/* Category, Subcategory & Price */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product Category</p>
          <select onChange={(e) => setCategory(e.target.value)} value={category} className="w-full px-3 py-2">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>
        <div>
          <p className="mb-2">Subcategory</p>
          <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className="w-full px-3 py-2">
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Underwear">Underwear</option>
          </select>
        </div>
        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="number"
            placeholder="25"
            required
          />
        </div>
      </div>

      {/* Select Sizes */}
      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
                )
              }
            >
              <p className={`${sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Select Colors */}
      <div>
        <p className="mb-2">Product Colors</p>
        <div className="flex gap-3">
          {["Red", "Blue", "Green", "Black", "White"].map((color) => (
            <div
              key={color}
              onClick={() =>
                setColors((prev) =>
                  prev.includes(color) ? prev.filter((item) => item !== color) : [...prev, color]
                )
              }
            >
              <p className={`${colors.includes(color) ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>
                {color}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Availability */}
      {sizes.length > 0 && colors.length > 0 && (
        <div className="w-full">
          <p className="mb-2">Stock Availability</p>
          <div className="grid grid-cols-5 gap-3">
            {sizes.map((size) =>
              colors.map((color) => (
                <div key={`${size}-${color}`} className="flex flex-col">
                  <label>{`${size} - ${color}`}</label>
                  <input
                    type="number"
                    value={stock.find((item) => item.size === size && item.color === color)?.quantity || ""}
                    onChange={(e) => handleStockChange(size, color, e.target.value)}
                    className="w-full px-3 py-2"
                    placeholder="Qty"
                    min="0"
                  />
                </div>
              ))
            )}
          </div>
          <p className="mt-2 font-semibold">Total Stock: {totalStock}</p>
        </div>
      )}

      {/* BestSeller Checkbox */}
      <div className="flex gap-2 mt-2">
        <input onChange={() => setBestSeller((prev) => !prev)} checked={BestSeller} type="checkbox" id="BestSeller" />
        <label className="cursor-pointer" htmlFor="BestSeller">
          Add to BestSeller
        </label>
      </div>

      {/* Submit Button */}
      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
        Add
      </button>
    </form>
  );
};

export default Add;