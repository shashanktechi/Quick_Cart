import React from 'react';
import { X, MapPin } from 'lucide-react';
import { DeliveryTrackingMap } from './DeliveryTrackingMap';

export function DeliveryMapModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-base text-ink">Delivery Destination Map – Order #{order.id}</h3>
              <p className="text-xs text-ink-muted">{order.deliveryAddress || 'Selected Address'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink/5 text-ink-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Body */}
        <div className="w-full h-[450px] relative">
          <DeliveryTrackingMap order={order} height="100%" />
        </div>

        <div className="p-4 bg-surface border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeliveryMapModal;
