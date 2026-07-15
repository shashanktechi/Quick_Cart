import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity } from '../app/cartSlice';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const cartItems = useSelector((state) => state.cart.items);

  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const qty = cartItem ? cartItem.qty : 0;

  const handleAdd = () => {
    dispatch(addToCart({ product, qty: 1 }));
  };

  const handleIncrease = () => {
    dispatch(updateQuantity({ productId: product.id, qty: qty + 1 }));
  };

  const handleDecrease = () => {
    dispatch(updateQuantity({ productId: product.id, qty: qty - 1 }));
  };

  const imageUrl = product.imageUrl || 'https://images.unsplash.com/photo-1610832958506-ee56336191d1?auto=format&fit=crop&w=300&q=80';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card p-4 border border-gray-150/60 dark:border-gray-700/60 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <div>
        <div className="w-full h-36 rounded-xl bg-gray-50 dark:bg-gray-900 overflow-hidden mb-3.5 relative">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal/90 text-white shadow-sm">
            {product.category}
          </span>
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-gray-800 dark:text-white leading-tight">{product.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 h-8">
            {product.description || 'No description available'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-base font-extrabold text-teal dark:text-teal-light">
          ₹{parseFloat(product.unitPrice).toFixed(2)}
        </span>

        {qty > 0 ? (
          <div className="flex items-center gap-2 bg-teal/10 dark:bg-teal-light/10 text-teal dark:text-teal-light rounded-full p-1 border border-teal/20">
            <button
              onClick={handleDecrease}
              className="p-1 rounded-full hover:bg-teal hover:text-white transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-bold px-1.5 min-w-[1.25rem] text-center">{qty}</span>
            <button
              onClick={handleIncrease}
              className="p-1 rounded-full hover:bg-teal hover:text-white transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal text-white hover:bg-teal-dark shadow-sm text-xs font-bold transition-all duration-200"
          >
            <ShoppingCart size={13} />
            <span>{t('buttons.addToCart')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
