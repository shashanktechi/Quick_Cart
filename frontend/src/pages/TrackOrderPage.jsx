import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Phone, MapPin, CheckCircle2, Clock, Package, Loader2, Navigation, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { DeliveryTrackingMap } from '../components/ui/DeliveryTrackingMap';

export function TrackOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!orderId) {
      setError('No order found to track');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/customer/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    // In a real app, we'd poll or use WebSockets here for updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-surface min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">{error || 'Order not found'}</h2>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const getStatusIndex = (status) => {
    const statuses = ['PENDING', 'ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    return statuses.indexOf(status) >= 0 ? statuses.indexOf(status) : 0;
  };
  const currentIndex = getStatusIndex(order.status);
  
  const estimatedMins = order.estimatedDeliveryTime || 12;

  return (
    <div className="bg-background font-body text-ink antialiased min-h-screen">
      <div className="w-full bg-surface min-h-screen flex flex-col relative">
        {/* Prominent Neat Top Header */}
        <div className="w-full bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <button 
            onClick={() => navigate('/stores')} 
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <span className="font-display font-black text-base text-ink">
            Tracking Order #{order.id}
          </span>
        </div>

        {/* Map Area */}
        <div className="w-full h-[40vh] bg-surface relative flex items-center justify-center overflow-hidden z-0">
          <DeliveryTrackingMap order={order} height="100%" />
        </div>

        {/* Content Sheet */}
        <div className="flex-1 bg-surface -mt-6 rounded-t-3xl relative z-10 p-5 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
          <div className="w-12 h-1.5 bg-ink/10 rounded-full mx-auto mb-6"></div>

          {/* ETA Card */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="font-display font-black text-3xl text-ink">Arriving in</span>
              <span className="font-display font-black text-3xl text-primary">{estimatedMins} mins</span>
              <span className="font-body text-sm text-ink-muted mt-1">
                {order.status === 'PENDING' ? 'Waiting for store to confirm...' :
                 order.status === 'ACCEPTED' ? 'Order is being packed...' :
                 order.status === 'OUT_FOR_DELIVERY' ? 'Partner is on the way!' : 'Order delivered!'}
              </span>
            </div>
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center animate-[pulse_1s_ease-in-out_infinite]">
              <Clock className="h-8 w-8 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Delivery Agent Info */}
          {order.deliveryAgent && (
            <div className="bg-surface rounded-2xl p-4 flex items-center justify-between mb-6 shadow-sm border border-ink/5">
              <div className="flex items-center gap-4">
                <img src={order.deliveryAgent.profilePhotoUrl || "https://i.pravatar.cc/150?img=11"} alt="Delivery Agent" className="w-14 h-14 rounded-full border-2 border-primary object-cover" />
                <div>
                  <h3 className="font-display font-bold text-lg text-ink">{order.deliveryAgent.fullName || 'Raju K'}</h3>
                  <div className="flex items-center gap-1 text-ink-muted text-xs font-mono font-bold mt-1">
                    <span className="bg-ink/10 px-1.5 py-0.5 rounded">4.8 ★</span>
                    <span>• {order.deliveryAgent.vehicleType || 'Bike'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm">
                  <Phone className="h-5 w-5 fill-current" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════ 3D VISUAL TRACKER ═══════════════════ */}
          <div className="mb-10 px-2">
            <h3 className="font-display font-black text-lg text-ink mb-8">Order Progress</h3>
            
            {/* 3D Stage */}
            <div 
              className="relative w-full mx-auto"
              style={{ perspective: '800px' }}
            >
              {/* The tilted 3D platform */}
              <div
                className="relative mx-auto px-6 py-10"
                style={{
                  transform: 'rotateX(18deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Background platform slab */}
                <div 
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)',
                    border: '1px solid rgba(15, 157, 110, 0.12)',
                    boxShadow: '0 20px 60px -15px rgba(15, 81, 50, 0.15), 0 8px 24px -8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                    transform: 'translateZ(-10px)',
                  }}
                />

                {/* Horizontal dotted rail */}
                <div className="relative flex items-center justify-between w-full" style={{ transformStyle: 'preserve-3d' }}>
                  {/* Rail track (dotted background) */}
                  <div className="absolute top-1/2 left-[28px] right-[28px] -translate-y-1/2 h-[3px]" style={{ transform: 'translateZ(2px)' }}>
                    <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(15,157,110,0.2) 0px, rgba(15,157,110,0.2) 6px, transparent 6px, transparent 14px)', backgroundSize: '14px 3px' }} />
                  </div>
                  {/* Rail progress fill */}
                  <div 
                    className="absolute top-1/2 left-[28px] -translate-y-1/2 h-[3px] rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `calc(${(currentIndex / 3) * 100}% * (1 - 56px / 100%))`,
                      maxWidth: `calc(100% - 56px)`,
                      background: 'linear-gradient(90deg, #0F9D6E, #10B981)',
                      boxShadow: '0 0 12px rgba(15, 157, 110, 0.4)',
                      transform: 'translateZ(2px)',
                    }}
                  >
                    {/* Glowing tip */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(15,157,110,0.8)]" />
                  </div>

                  {/* 4 Junction Nodes */}
                  {[
                    { label: 'Confirmed', icon: '📋', color: '#059669' },
                    { label: 'Packed', icon: '📦', color: '#0891B2' },
                    { label: 'On the Way', icon: '🏍️', color: '#7C3AED' },
                    { label: 'Delivered', icon: '✅', color: '#16A34A' }
                  ].map((step, idx) => {
                    const isActive = currentIndex >= idx;
                    const isCurrent = currentIndex === idx;

                    return (
                      <div key={idx} className="relative flex flex-col items-center z-10" style={{ transformStyle: 'preserve-3d' }}>
                        {/* 3D Floating Node */}
                        <div
                          className="relative transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                          style={{
                            transform: `translateZ(${isActive ? '24px' : '4px'}) ${isCurrent ? 'scale(1.15)' : 'scale(1)'}`,
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          {/* Shadow beneath node */}
                          <div 
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full transition-all duration-700"
                            style={{
                              width: isActive ? '36px' : '28px',
                              height: '8px',
                              background: isActive ? 'radial-gradient(ellipse, rgba(15,81,50,0.25) 0%, transparent 70%)' : 'radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%)',
                              transform: 'translateZ(-28px)',
                              filter: 'blur(2px)',
                            }}
                          />
                          
                          {/* Main node circle */}
                          <div 
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${isCurrent ? 'animate-pulse' : ''}`}
                            style={{
                              background: isActive 
                                ? `linear-gradient(145deg, ${step.color}dd, ${step.color})` 
                                : 'linear-gradient(145deg, #f9fafb, #e5e7eb)',
                              boxShadow: isActive 
                                ? `0 8px 32px ${step.color}44, inset 0 1px 0 rgba(255,255,255,0.3)` 
                                : '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                              border: isActive ? `2px solid ${step.color}` : '2px solid #e5e7eb',
                            }}
                          >
                            <span className={`text-2xl transition-all duration-500 ${!isActive ? 'grayscale opacity-40' : ''} ${isCurrent ? 'scale-110' : ''}`} style={{ filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none' }}>
                              {step.icon}
                            </span>
                          </div>

                          {/* Checkmark badge */}
                          {isActive && !isCurrent && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-primary/20" style={{ transform: 'translateZ(4px)' }}>
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}

                          {/* Pulse ring for current step */}
                          {isCurrent && (
                            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ background: step.color, animationDuration: '2s' }} />
                          )}
                        </div>
                        
                        {/* Label below node */}
                        <div 
                          className="mt-4 flex flex-col items-center gap-1 transition-all duration-500"
                          style={{ transform: 'translateZ(8px)' }}
                        >
                          <span className={`font-display font-black text-[11px] whitespace-nowrap transition-colors duration-500 ${isActive ? 'text-ink' : 'text-ink-muted/50'}`}>
                            {step.label}
                          </span>
                          {isCurrent && (
                            <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════ STEPPED POINT TRACKER ═══════════════ */}
          <div className="mb-8 px-2">
            <h3 className="font-display font-black text-lg text-ink mb-6">Tracking Details</h3>
            <div className="flex flex-col relative ml-1">
              
              {[
                { label: 'Order Confirmed', desc: 'We have received your order', time: 'Just now', icon: '📋' },
                { label: 'Order Packed', desc: 'Store has packed your items', time: 'Preparing', icon: '📦' },
                { label: 'Out for Delivery', desc: 'Delivery partner is on the way', time: 'En route', icon: '🏍️' },
                { label: 'Delivered', desc: 'Order delivered successfully', time: 'Completed', icon: '✅' }
              ].map((step, idx) => {
                const isActive = currentIndex >= idx;
                const isCurrent = currentIndex === idx;
                const isLast = idx === 3;

                return (
                  <div key={idx} className="flex gap-5 relative">
                    {/* Vertical connector column */}
                    <div className="flex flex-col items-center">
                      {/* Node dot */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 relative z-10 ${
                        isCurrent 
                          ? 'bg-primary text-white shadow-[0_0_0_4px_rgba(15,157,110,0.15)]' 
                          : isActive 
                            ? 'bg-primary text-white' 
                            : 'bg-background border-2 border-border'
                      }`}>
                        {isActive ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-border" />
                        )}
                      </div>
                      {/* Dotted connector line */}
                      {!isLast && (
                        <div className="w-0 flex-1 my-1" style={{ 
                          minHeight: '32px',
                          borderLeft: `2px ${isActive ? 'solid' : 'dotted'} ${isActive ? '#0F9D6E' : '#E5E7EB'}`,
                          transition: 'border-color 0.5s ease'
                        }} />
                      )}
                    </div>

                    {/* Content card */}
                    <div className={`flex-1 pb-8 transition-all duration-500 ${isLast ? 'pb-0' : ''}`}>
                      <div className={`rounded-xl p-3 transition-all duration-500 ${
                        isCurrent 
                          ? 'bg-primary/5 border border-primary/20 shadow-sm' 
                          : isActive 
                            ? 'bg-transparent' 
                            : 'bg-transparent opacity-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{step.icon}</span>
                            <span className={`font-display font-bold text-sm ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
                              {step.label}
                            </span>
                          </div>
                          {isActive && (
                            <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isCurrent ? 'bg-primary/10 text-primary' : 'bg-ink/5 text-ink-muted'
                            }`}>
                              {isCurrent ? 'In Progress' : 'Done'}
                            </span>
                          )}
                        </div>
                        <p className={`font-body text-xs mt-1.5 ml-[30px] ${isActive ? 'text-ink-muted' : 'text-ink-muted/50'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Summary */}
          <div className="bg-surface rounded-2xl p-4 flex items-center justify-between shadow-sm border border-ink/5 cursor-pointer hover:bg-ink/5 transition-colors" onClick={() => navigate('/orders')}>
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-warning/20 text-warning rounded-xl flex items-center justify-center">
                 <Package className="h-6 w-6" />
               </div>
               <div>
                 <span className="font-display font-bold text-ink block">Order Details</span>
                 <span className="font-body text-xs text-ink-muted block mt-1">{order.items?.length || 0} items • ₹{order.totalAmount?.toFixed(2)}</span>
               </div>
             </div>
             <ArrowLeft className="h-5 w-5 text-ink-muted rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
}
