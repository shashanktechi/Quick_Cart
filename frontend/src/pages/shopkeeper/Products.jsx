import React, { useState, useEffect } from 'react';
import { storeApi } from '../../api/storeApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ImageUploader from '../../components/ImageUploader';
import { Package, Pencil, X, Check } from 'lucide-react';

const Products = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    storeApi.getInventory()
      .then((d) => setInventory(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      name: item.product?.name || '',
      category: item.product?.category || '',
      unitPrice: item.product?.unitPrice || '',
      description: item.product?.description || '',
    });
  };

  const cancelEdit = () => { setEditingItem(null); setEditForm({}); };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleSave = async (inventoryId, productId) => {
    setSavingId(inventoryId);
    try {
      await storeApi.updateProduct(productId, {
        name: editForm.name,
        category: editForm.category,
        unitPrice: parseFloat(editForm.unitPrice),
        description: editForm.description,
      });
      setEditingItem(null);
      load();
    } catch (e) {
      console.error(e);
    } finally { setSavingId(null); }
  };

  const inputClass = "px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 w-full";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Products</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">Edit product details, categories, and pricing. To add new products or update quantities, use the Inventory tab.</p>

      {inventory.length === 0 ? (
        <EmptyState title="No products yet" description="Add products from the Inventory tab first." icon={Package} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inventory.map((item) => {
            const product = item.product;
            const isEditing = editingItem === item.id;

            return (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                {/* Product Image */}
                <div className="relative">
                  {product?.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-teal/10 to-teal-light/5 flex items-center justify-center">
                      <Package size={36} className="text-teal/30" />
                    </div>
                  )}
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(item)}
                      className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm text-gray-600 dark:text-gray-300 hover:text-teal transition-colors"
                      id={`edit-product-${item.id}`}
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  {isEditing ? (
                    <>
                      <input name="name" value={editForm.name} onChange={handleEditChange} className={inputClass} placeholder="Product name" />
                      <input name="category" value={editForm.category} onChange={handleEditChange} className={inputClass} placeholder="Category" />
                      <input name="unitPrice" value={editForm.unitPrice} onChange={handleEditChange} className={inputClass} type="number" step="0.01" placeholder="Price (₹)" />
                      <input name="description" value={editForm.description} onChange={handleEditChange} className={inputClass} placeholder="Description" />

                      {/* Product Image Uploader */}
                      <ImageUploader
                        type="product-image"
                        options={{ productId: product?.id }}
                        label="Update product image"
                        onUploadComplete={load}
                      />

                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleSave(item.id, product?.id)} disabled={savingId === item.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-teal text-white rounded-xl hover:bg-teal-dark transition-all disabled:opacity-50">
                          <Check size={13} /> {savingId === item.id ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={cancelEdit}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all">
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{product?.name}</h3>
                        {product?.category && (
                          <span className="text-xs font-semibold text-teal dark:text-teal-light bg-teal/10 dark:bg-teal-light/10 px-2 py-0.5 rounded-full">{product.category}</span>
                        )}
                      </div>
                      {product?.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>}
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-extrabold text-teal dark:text-teal-light">₹{parseFloat(product?.unitPrice || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: <span className="font-bold text-gray-700 dark:text-gray-300">{item.quantity}</span></p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
