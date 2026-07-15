import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { customerApi } from '../../api/customerApi';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { ArrowLeft, ShieldCheck, Flame, Package, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSelector as useAppSelector } from 'react-redux';

const StoreDetail = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [inventory, setInventory] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const cartItems = useAppSelector((state) => state.cart.items);
  const totalQty = cartItems.reduce((a, i) => a + i.qty, 0);
  const totalPrice = cartItems.reduce((a, i) => a + parseFloat(i.product.unitPrice) * i.qty, 0);

  useEffect(() => {
    customerApi.getStoreInventory(storeId)
      .then((data) => {
        if (Array.isArray(data)) {
          setInventory(data);
          // Get store details from first inventory item if available
          if (data.length > 0 && data[0].store) {
            setStore(data[0].store);
          }
        }
      })
      .catch(() => setError('Failed to load store inventory.'))
      .finally(() => setLoading(false));
  }, [storeId]);

  const filtered = inventory.filter((item) => {
    const product = item.product;
    return !search || product?.name?.toLowerCase().includes(search.toLowerCase()) || product?.category?.toLowerCase().includes(search.toLowerCase());
  });

  const handleCheckout = () => navigate('/customer/checkout');

  const bannerUrl = store?.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="space-y-6 pb-36 md:pb-4">
      {/* Banner */}
      <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden shadow-md">
        <img src={bannerUrl} alt={store?.name || 'Store'} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white">{store?.name || 'Loading...'}</h1>
            {store?.verificationStatus === 'APPROVED' && <ShieldCheck size={18} className="text-teal-light" />}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-white/80 text-xs">{store?.address}</span>
            {store?.freshnessScore && (
              <span className="flex items-center gap-1 text-teal-light text-xs font-semibold">
                <Flame size={12} className="fill-current" />
                {t('common.freshness')}: {parseFloat(store.freshnessScore).toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text" placeholder="Search products..." value={search}
          onChange={(e) => setSearch(e.target.value)} id="store-search"
          className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
        />
      </div>

      {loading ? <LoadingSpinner /> : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No products available" description="This store has no products in stock right now." icon={Package} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            item.product && item.quantity > 0 ? (
              <ProductCard key={item.id} product={item.product} />
            ) : null
          ))}
        </div>
      )}

      {/* Sticky Cart Bar */}
      {totalQty > 0 && (
        <div className="fixed bottom-16 md:bottom-4 inset-x-4 md:left-auto md:right-4 md:w-80 bg-teal text-white rounded-2xl shadow-xl px-5 py-4 flex items-center justify-between z-30 transition-all duration-300">
          <div>
            <p className="text-xs font-semibold opacity-80">{totalQty} item{totalQty > 1 ? 's' : ''} in cart</p>
            <p className="text-lg font-extrabold">₹{totalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={handleCheckout}
            className="flex items-center gap-2 bg-white text-teal font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-teal-50 transition-all shadow-sm"
          >
            <ShoppingCart size={16} />
            {t('buttons.viewCart')}
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreDetail;
