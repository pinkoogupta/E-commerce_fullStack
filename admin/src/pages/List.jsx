import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../config/config";
import { toast } from "react-toastify";
import { 
  Trash2, 
  Edit, 
  X, 
  Save, 
  Package, 
  DollarSign, 
  Tag, 
  Layers, 
  Search,
  AlertCircle,
  RefreshCw
} from "lucide-react";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editData, setEditData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch product list
  const fetchList = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Remove product
  const removeProduct = async (id) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this product?");
      if (!confirmed) return;
      
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
    setEditData({ price: product.price, stock: product.stock });
    setModalOpen(true);
  };

  // Handle form input change
  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle stock change for a specific size and color
  const handleStockChange = (index, value) => {
    const updatedStock = [...editData.stock];
    updatedStock[index].quantity = Number(value) || 0;
    setEditData((prev) => ({ ...prev, stock: updatedStock }));
  };

  // Update product
  const updateProduct = async () => {
    try {
      if (!currentProduct) return;
      const response = await axios.patch(
        `${backendUrl}/api/v1/product/updateProductAdmin`,
        { 
          productId: currentProduct._id, 
          price: editData.price, 
          stock: editData.stock // Ensure this is an array
        },
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

  // Filter products based on search term
  const filteredProducts = list.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h2 className="text-xl font-bold mb-2 md:mb-0 flex items-center">
          <Package className="mr-2" size={20} /> 
          Products Inventory
        </h2>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchList} 
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center"
            title="Refresh product list"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <AlertCircle size={48} className="mb-4 text-gray-400" />
              <p className="text-lg">No products found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Image</th>
                    <th className="py-3 px-4 text-left">Product Name</th>
                    <th className="py-3 px-4 text-left">SKU</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-left">Price</th>
                    <th className="py-3 px-4 text-left">Stock</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-14 h-14 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                          <img 
                            className="max-w-full max-h-full object-contain" 
                            src={item.image[0]} 
                            alt={item.name} 
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.stock[0]?.sku || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center">
                          <DollarSign size={16} className="text-green-600" />
                          {item.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs overflow-hidden">
                          {item.stock.map((stockItem, idx) => (
                            <div key={idx} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-100 rounded-md text-xs">
                              {stockItem.size}-{stockItem.color}: <span className="font-medium">{stockItem.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            title="Edit product"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => removeProduct(item._id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Update Modal */}
      {modalOpen && currentProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold flex items-center">
                <Edit className="mr-2" size={20} />
                Edit Product: {currentProduct.name}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-1">
                  <div className="mb-6">
                    <div className="border rounded-lg p-4 flex justify-center items-center bg-gray-50 h-48">
                      <img 
                        src={currentProduct.image?.[0]} 
                        alt={currentProduct.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 flex items-center">
                      <DollarSign size={16} className="mr-1" /> Price
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) => handleEditChange("price", Number(e.target.value))}
                        className="pl-8 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} />
                      <span className="text-sm font-medium">Category:</span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {currentProduct.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Stock Management */}
                <div className="md:col-span-2">
                  <div className="mb-4 flex items-center">
                    <Layers size={18} className="mr-2" />
                    <label className="text-sm font-medium">Inventory Management</label>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-96">
                    {editData.stock.map((stockItem, index) => (
                      <div key={index} className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            Size: {stockItem.size}
                          </span>
                          <span className="inline-block w-3 h-3 rounded-full" 
                            style={{backgroundColor: stockItem.color}}
                            title={`Color: ${stockItem.color}`}
                          ></span>
                           <p className="text-sm mb-1">Color: <span className="font-medium">{stockItem.color}</span></p>
                        </div>
                        <div className="mt-3">
                          <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                          <div className="flex items-center">
                            <button 
                              className="bg-gray-200 px-2 py-1 rounded-l-md"
                              onClick={() => handleStockChange(index, Math.max(0, stockItem.quantity - 1))}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={stockItem.quantity}
                              onChange={(e) => handleStockChange(index, e.target.value)}
                              className="border-t border-b w-full text-center py-1 focus:outline-none"
                              min="0"
                            />
                            <button 
                              className="bg-gray-200 px-2 py-1 rounded-r-md"
                              onClick={() => handleStockChange(index, stockItem.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 border-t p-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <X size={16} className="mr-1" /> Cancel
              </button>
              <button
                onClick={updateProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save size={16} className="mr-1" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;