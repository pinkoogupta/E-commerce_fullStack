import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../config/config';
import { toast } from 'react-toastify';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

const AdminOrders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/v1/order/list`,{}, {
        headers: { token }
      });
      console.log(response.data);
      if (response.data.success) {
        
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/v1/order/status`,
        { orderId, status: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Order status updated successfully');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-yellow-500" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Order Management</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  {getStatusIcon(order.status)}
                  <span className="font-medium">Order #{order._id}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-medium mb-2">Customer Details</h3>
                    <p>{order.address.firstName} {order.address.lastName}</p>
                    <p>{order.address.email}</p>
                    <p>{order.address.phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <p>{order.address.street}</p>
                    <p>{order.address.city}, {order.address.state}</p>
                    <p>{order.address.country}, {order.address.zipcode}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity}x · {currency}{item.price} · {item.size} · {item.color}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:w-64 space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold">{currency}{order.amount}</p>
                  <p className="text-sm text-gray-600 mt-2">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                  <p className="text-sm text-gray-600 mt-2">Payment Status</p>
                  <p className={`font-medium ${order.payment ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.payment ? 'Paid' : 'Pending'}
                  </p>
                </div>

                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;