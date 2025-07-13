import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    modelNo: '',
    hsCode: '',
    total_stock: ''
  });

  // Fetch products
  const getProducts = async () => {
    try {
      const res = await axios.get('/products/list');
      setProducts(res.data.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  // Add new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/products/create', formData);
      setFormData({
        name: '',
        category: '',
        price: '',
        modelNo: '',
        hsCode: '',
        total_stock: ''
      });
      Swal.fire('Success', 'Product added successfully!', 'success');
      getProducts();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to add product', 'error');
    }
  };

  // Handle product details edit
  const handleEditProduct = async (product) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Product Details',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Name" value="${product.name}">
        <input id="swal-input2" class="swal2-input" placeholder="Category" value="${product.category}">
        <input id="swal-input3" class="swal2-input" placeholder="Price" value="${product.price}">
        <input id="swal-input4" class="swal2-input" placeholder="Model No" value="${product.modelNo}">
        <input id="swal-input5" class="swal2-input" placeholder="HS Code" value="${product.hsCode}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Product',
      preConfirm: () => {
        return {
          name: document.getElementById('swal-input1').value,
          category: document.getElementById('swal-input2').value,
          price: document.getElementById('swal-input3').value,
          modelNo: document.getElementById('swal-input4').value,
          hsCode: document.getElementById('swal-input5').value
        }
      }
    });

    if (formValues) {
      try {
        await axios.put(`/products/update/${product.id}`, {
          ...formValues,
          total_stock: product.total_stock // Keep existing stock
        });
        Swal.fire('Updated!', 'Product details updated successfully', 'success');
        getProducts();
      } catch (err) {
        Swal.fire('Error', 'Failed to update product', 'error');
      }
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">📦 Inventory Management</h1>

        {/* Product Add Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow mb-8">
          {['name', 'category', 'price', 'modelNo', 'hsCode', 'total_stock'].map((field) => (
            <input
              key={field}
              name={field}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              placeholder={field}
              className="border p-2 rounded w-full"
              required
            />
          ))}
          <div className="md:col-span-2">
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              ➕ Add Product
            </button>
          </div>
        </form>

        {/* Product List Table */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">📋 Product List</h2>
          {products.length === 0 ? (
            <p className="text-gray-500">No products available.</p>
          ) : (
            <table className="w-full table-auto border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Stock</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t text-center">
                    <td className="p-2 border">{p.name}</td>
                    <td className="p-2 border">{p.category}</td>
                    <td className="p-2 border">Rs. {p.price}</td>
                    <td className="p-2 border">{p.total_stock}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleEditProduct(p)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                      >
                        ✏️ Edit Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
