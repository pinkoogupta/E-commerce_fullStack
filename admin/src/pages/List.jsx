import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config/config";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editData, setEditData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

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

  // Open modal for editing
  const openEditModal = (product) => {
    setCurrentProduct(product);
    setEditData({ price: product.price, stock: { ...product.stock } });
    setModalOpen(true);
  };

  // Handle form input change
  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStockChange = (size, value) => {
    setEditData((prev) => ({
      ...prev,
      stock: { ...prev.stock, [size]: value },
    }));
  };

  // Update product
  const updateProduct = async () => {
    try {
      if (!currentProduct) return;
      const response = await axios.patch( `${backendUrl}/api/v1/product/updateProductAdmin`,
        { productId: currentProduct._id, ...editData },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Product updated successfully!");
        await fetchList();
        setModalOpen(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product.");
    }
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
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{item.price}</p>
            <p>{Object.entries(item.stock || {}).map(([size, qty]) => `${size}: ${qty}`).join(", ")}</p>
            <p onClick={() => removeProduct(item._id)} className="text-right md:text-center cursor-pointer text-lg">X</p>
            <button onClick={() => openEditModal(item)} className="bg-blue-500 text-white px-2 py-1 text-xs rounded">
              Update
            </button>
          </div>
        ))}
      </div>

      {/* Update Modal */}
      {modalOpen && currentProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Update Product</h2>
            <label>Price</label>
            <input
              type="number"
              value={editData.price}
              onChange={(e) => handleEditChange("price", Number(e.target.value))}
              className="border p-2 w-full mb-4"
            />
            <label>Stock</label>
            <div className="mb-4">
              {Object.keys(currentProduct.stock || {}).map((size) => (
                <div key={size} className="flex justify-between items-center mb-2">
                  <span>{size}:</span>
                  <input
                    type="number"
                    value={editData.stock[size] || 0}
                    onChange={(e) => handleStockChange(size, Number(e.target.value))}
                    className="border p-2 w-20 text-center"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={updateProduct} className="bg-green-500 text-white px-4 py-2 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default List;
