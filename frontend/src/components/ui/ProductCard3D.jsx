import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Heart, Plus, Minus } from 'lucide-react';
import { Button } from './Button';
import { useCart } from '../../context/CartContext';
import { ProductCard as ProductCardFallback } from './ProductCard';

// The actual 3D Scene representing the card
function CardScene({ image, isHovered }) {
  const groupRef = useRef();
  
  // Create texture from image URL (using a basic TextureLoader)
  const texture = React.useMemo(() => new THREE.TextureLoader().load(image), [image]);
  // Make sure texture repeats correctly if needed, though product images usually fit.
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Smoothly interpolate rotation based on mouse position
    const targetX = isHovered ? -(state.pointer.y * Math.PI) / 18 : 0; // ~10 degrees
    const targetY = isHovered ? (state.pointer.x * Math.PI) / 18 : 0;
    
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.1;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.1;
    
    // Slight lift effect on hover
    const targetZ = isHovered ? 0.2 : 0;
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Product Image Plane */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Soft Blurred Shadow Plane beneath the card */}
      <mesh position={[0, -0.1, -0.5]} scale={isHovered ? 1.05 : 1}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshBasicMaterial color="#000000" transparent={true} opacity={isHovered ? 0.15 : 0.08} />
      </mesh>
    </group>
  );
}

export function ProductCard3D({ 
  id, image, name, size, price, mrp, discountPercent, 
  storeId, storeName, isOutOfStock, onConflict 
}) {
  const { getProductQuantity, addToCart, removeFromCart } = useCart();
  const quantity = getProductQuantity(id);
  const [isHovered, setIsHovered] = useState(false);
  
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setIsWebGLSupported(false);
    } catch (e) {
      setIsWebGLSupported(false);
    }

    // Check reduced motion
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionMq.matches);
    
    // Check touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleAdd = (e) => {
    if (e) e.stopPropagation();
    if (isOutOfStock) return;
    const product = { id, image, name, size, price, storeId, storeName, mrp };
    const result = addToCart(product, storeId, storeName);
    
    if (result && !result.success && onConflict) {
      onConflict(result.conflictStoreName, storeName, () => {
        addToCart(product, storeId, storeName);
      });
    }
  };

  const handleRemove = (e) => {
    if (e) e.stopPropagation();
    removeFromCart(id);
  };

  // Fallback to standard 2D card for touch devices, reduced motion, or no WebGL
  if (!isWebGLSupported || prefersReducedMotion || isTouchDevice) {
    return (
      <ProductCardFallback 
        id={id} image={image} name={name} size={size} price={price} 
        mrp={mrp} discountPercent={discountPercent} storeId={storeId} 
        storeName={storeName} isOutOfStock={isOutOfStock} onConflict={onConflict} 
      />
    );
  }

  return (
    <div 
      className="p-3 min-w-[160px] max-w-[180px] shrink-0 relative bg-surface border-2 border-primary/20 shadow-ao rounded-xl overflow-hidden flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Featured Badge */}
      <div className="absolute top-0 left-0 bg-primary text-white font-mono text-[9px] font-bold px-2 py-1 rounded-br-lg z-20 shadow-sm uppercase tracking-wider">
        Featured
      </div>

      {isOutOfStock && (
        <div className="absolute inset-0 bg-ink/10 backdrop-blur-[1px] z-30 flex items-center justify-center">
          <span className="bg-ink text-white font-mono text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-md -rotate-12">
            Sold Out
          </span>
        </div>
      )}

      {/* 3D Canvas Area */}
      <div className="relative aspect-square w-full rounded-lg mb-2 flex items-center justify-center cursor-crosshair">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-transparent rounded-lg" />
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center opacity-50 text-xs font-mono font-bold">Loading 3D...</div>}>
          <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={1} />
            <CardScene image={image} isHovered={isHovered} />
          </Canvas>
        </Suspense>
        <button className="absolute top-1 right-1 p-1.5 bg-surface/80 rounded-full border border-border text-ink-muted hover:text-error transition-colors z-20">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Product Details (HTML Overlay) */}
      <div className="flex flex-col flex-grow z-10 relative">
        <h3 className="font-body text-sm line-clamp-2 min-h-[40px] leading-tight font-bold text-ink">{name}</h3>
        <span className="font-mono text-xs text-ink-muted mt-1 font-bold">{size}</span>
      </div>

      <div className="flex flex-col mt-3 gap-2 z-10 relative">
        <div className="flex flex-col">
          {mrp && <span className="font-mono text-[10px] text-ink-muted line-through">₹{mrp.toFixed(2)}</span>}
          <span className="font-mono text-base font-black text-ink tracking-tight">₹{price?.toFixed(2) || price}</span>
        </div>
        
        {quantity > 0 ? (
          <div className="flex items-center justify-between border-2 border-primary bg-primary/10 rounded-lg h-9 overflow-hidden">
            <button onClick={handleRemove} className="w-9 h-full flex items-center justify-center active:bg-primary/20 transition-colors text-primary">
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-mono font-bold text-sm text-primary">{quantity}</span>
            <button onClick={handleAdd} className="w-9 h-full flex items-center justify-center active:bg-primary/20 transition-colors text-primary">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button 
            onClick={handleAdd}
            className="w-full h-9 bg-primary text-white hover:bg-primary-dark font-mono text-xs uppercase tracking-wider rounded-lg shadow-ao transition-all active:scale-95"
            disabled={isOutOfStock}
          >
            ADD
          </Button>
        )}
      </div>
    </div>
  );
}
