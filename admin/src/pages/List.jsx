import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config/config";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editData, setEditData] = useState({});

  // Fetch product list
  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/product/list`);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products.");
    }
  };

  // Remove product
  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/v1/product/remove`,
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove product.");
    }
  };

  // Update product
  const updateProduct = async (id) => {
    try {
      const updatedData = editData[id];
      if (!updatedData) return toast.warning("No changes made!");

      const response = await axios.patch(
        `${backendUrl}/api/v1/product/updateProduct`,
        { productId: id, ...updatedData },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        await fetchList();
        setEditData((prev) => ({ ...prev, [id]: {} })); // Reset edited fields after update
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product.");
    }
  };

  // Handle edit (preserve all stock sizes)
  const handleEdit = (id, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]:
          field === "stock"
            ? {
                ...list.find((p) => p._id === id)?.stock, // Preserve existing stock
                ...prev[id]?.stock, // Preserve previously edited stock
                ...value, // Update only the selected size
              }
            : value,
      },
    }));
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_2fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Product Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b className="text-center">Action</b>
          <b className="text-center">Edit</b>
        </div>

        {/* Product List */}
        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr_1fr_2fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            <img className="w-12" src={item.image[0]} alt="" />

            {/* Non-Editable Product Name */}
            <p>{item.name}</p>

            {/* Non-Editable Category */}
            <p>{item.category}</p>

            {/* Editable Price */}
            <input
              type="number"
              value={editData[item._id]?.price ?? item.price}
              onChange={(e) =>
                handleEdit(item._id, "price", Number(e.target.value))
              }
              className="border p-1 w-20"
            />

            {/* Editable Stock */}
            <div>
              {Object.entries(item.stock || {}).map(([size, qty]) => (
                <div
                  key={size}
                  className="flex justify-between items-center w-32"
                >
                  <span className="w-8">{size}:</span>
                  <input
                    type="number"
                    value={editData[item._id]?.stock?.[size] ?? qty}
                    onChange={(e) =>
                      handleEdit(item._id, "stock", {
                        ...editData[item._id]?.stock,
                        [size]: Number(e.target.value),
                      })
                    }
                    className="border p-2 w-20 text-center"
                  />
                </div>
              ))}
            </div>

            {/* Remove Product Button */}
            <p
              onClick={() => removeProduct(item._id)}
              className="text-right md:text-center cursor-pointer text-lg"
            >
              X
            </p>

            {/* Update Product Button */}
            <button
              onClick={() => updateProduct(item._id)}
              className="bg-blue-500 text-white px-2 py-1 text-xs rounded"
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
