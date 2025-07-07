'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Package,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  seller: string;
  image: string;
  category: string;
  inStock: boolean;
  brand?: string;
  description?: string;
  specifications?: string;
  quantity?: string;
  unit?: string;
  tags?: string[];
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
}

interface ProductPageProps {
  product: Product;
  cart: CartItem[];
  onAddToCart: (product: { id: number; name: string; price: number; image: string; seller: string }) => void;
  onBack: () => void;
}

interface Review {
  id: number;
  user: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpful: number;
}

export function ProductPage({ product, cart, onAddToCart, onBack }: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();

  // Sample product images (in real app, this would come from product data)
  const productImages = [
    product.image,
    'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    'https://images.pexels.com/photos/6928266/pexels-photo-6928266.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
  ];

  // Sample reviews
  const reviews: Review[] = [
    {
      id: 1,
      user: 'John D.',
      rating: 5,
      date: '2 days ago',
      title: 'Excellent quality seeds',
      comment: 'These seeds germinated perfectly and the plants are growing strong. Highly recommend!',
      helpful: 12
    },
    {
      id: 2,
      user: 'Sarah M.',
      rating: 4,
      date: '1 week ago',
      title: 'Good value for money',
      comment: 'Good quality seeds, though delivery took a bit longer than expected.',
      helpful: 8
    },
    {
      id: 3,
      user: 'Mike R.',
      rating: 5,
      date: '2 weeks ago',
      title: 'Perfect for my garden',
      comment: 'Exactly what I was looking for. The seeds are fresh and the instructions are clear.',
      helpful: 15
    }
  ];

  const cartItem = cart.find(item => item.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        seller: product.seller
      });
    }
    toast({
      title: "Added to cart!",
      description: `${quantity} ${quantity === 1 ? 'item' : 'items'} of ${product.name} added to your cart.`,
      duration: 2000,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this product: ${product.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard.",
        duration: 2000,
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={productImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-md overflow-hidden border-2 ${
                  selectedImage === index
                    ? 'border-green-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
              {product.brand && (
                <Badge variant="outline" className="text-xs">
                  {product.brand}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
                <span className="text-sm font-medium ml-1">{product.rating}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({product.reviews} reviews)
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sold by <span className="font-medium">{product.seller}</span>
            </p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-green-600">
                ₹{product.price}
              </span>
              {product.quantity && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  per {product.quantity} {product.unit}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  In Stock
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Quantity:</label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="px-3 py-1 text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              {currentQuantity > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({currentQuantity} in cart)
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-green-600 hover:bg-green-700 h-12"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`h-12 w-12 ${
                  isWishlisted ? 'text-red-500 border-red-500' : ''
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="h-12 w-12"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-green-600" />
              <span>Free shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Quality guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="w-4 h-4 text-green-600" />
              <span>Easy returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        {/* Description */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Description
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {product.description || 
                `High-quality ${product.name.toLowerCase()} perfect for your agricultural needs. 
                This product is carefully selected and tested to ensure the best results for your farming operations. 
                Whether you're a professional farmer or a home gardener, this product will help you achieve optimal yields.`
              }
            </p>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Specifications
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Category</span>
              <span className="font-medium">{product.category}</span>
            </div>
            {product.brand && (
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Brand</span>
                <span className="font-medium">{product.brand}</span>
              </div>
            )}
            {product.quantity && (
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Quantity</span>
                <span className="font-medium">{product.quantity} {product.unit}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Seller</span>
              <span className="font-medium">{product.seller}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Rating</span>
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
                <span className="font-medium ml-1">{product.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Customer Reviews
          </h2>
          <Button variant="outline" size="sm">
            Write a Review
          </Button>
        </div>
        
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {review.user}
                      </p>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {review.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {review.comment}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful})
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    <ThumbsDown className="w-4 h-4" />
                    Not helpful
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 