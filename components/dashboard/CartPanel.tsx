'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import ReactDOM from 'react-dom';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Truck,
  Package
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
}

interface CartPanelProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveFromCart: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export function CartPanel({ 
  cart, 
  isOpen, 
  onClose, 
  onRemoveFromCart, 
  onUpdateQuantity, 
  getCartTotal, 
  getCartItemCount 
}: CartPanelProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveFromCart(productId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
        duration: 2000,
      });
    } else {
      onUpdateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      toast({
        title: "Order placed successfully!",
        description: "Your order has been placed and will be delivered soon.",
        duration: 3000,
      });
      setIsCheckingOut(false);
      onClose();
    }, 2000);
  };

  const shippingCost = getCartTotal() > 1000 ? 0 : 100;
  const totalWithShipping = getCartTotal() + shippingCost;

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-end">
      <div 
        ref={cartRef}
        className="w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-900/30 dark:to-blue-900/30">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Shopping Cart</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Package className="w-16 h-16 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Add some products to get started
                </p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <Card key={item.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        by {item.seller}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600">
                          ₹{item.price}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, 0)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Item Total */}
                      <div className="text-right mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total: <span className="font-medium">₹{item.price * item.quantity}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer - Order Summary & Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium">₹{getCartTotal()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `₹${shippingCost}`
                  )}
                </span>
              </div>
              {shippingCost > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Free shipping on orders over ₹1000
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">₹{totalWithShipping}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-green-600 hover:bg-green-700 h-12"
            >
              {isCheckingOut ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Checkout
                </div>
              )}
            </Button>

            {/* Continue Shopping */}
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
} 