'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AddProduct } from './AddProduct';
import { 
  Search, 
  ShoppingCart, 
  Star,
  Package,
  Plus,
  Filter,
  Check,
  X,
  ChevronDown,
  SlidersHorizontal
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

interface MarketplaceProps {
  userRole: 'farmer' | 'seller' | 'admin';
}

export function Marketplace({ userRole }: MarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 10000 },
    inStock: null as boolean | null,
    rating: 0,
    sortBy: 'name' as 'name' | 'price' | 'rating' | 'reviews'
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Organic Tomato Seeds',
      price: 299,
      rating: 4.8,
      reviews: 124,
      seller: 'Green Valley Seeds',
      image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      category: 'seeds',
      inStock: true
    },
    {
      id: 2,
      name: 'NPK Fertilizer 10-10-10',
      price: 850,
      rating: 4.6,
      reviews: 89,
      seller: 'Farm Supply Co.',
      image: 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      category: 'fertilizers',
      inStock: true
    },
    {
      id: 3,
      name: 'Leaf Blight Treatment',
      price: 1200,
      rating: 4.9,
      reviews: 156,
      seller: 'AgriCare Solutions',
      image: 'https://images.pexels.com/photos/6928266/pexels-photo-6928266.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      category: 'pesticides',
      inStock: false
    },
    {
      id: 4,
      name: 'Smart Irrigation Timer',
      price: 3500,
      rating: 4.7,
      reviews: 67,
      seller: 'TechFarm Solutions',
      image: 'https://images.pexels.com/photos/4750264/pexels-photo-4750264.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      category: 'irrigation',
      inStock: true
    },
    {
      id: 5,
      name: 'Premium Garden Spade',
      price: 1800,
      rating: 4.5,
      reviews: 203,
      seller: 'Tool Masters',
      image: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      category: 'tools',
      inStock: true
    },
    {
      id: 6,
      name: 'Wheat Seeds - High Yield',
      price: 450,
      rating: 4.8,
      reviews: 312,
      seller: 'Harvest Gold',
      image: 'https://images.pexels.com/photos/461960/pexels-photo-461960.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      category: 'seeds',
      inStock: true
    },
  ]);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'seeds', name: 'Seeds' },
    { id: 'fertilizers', name: 'Fertilizers' },
    { id: 'pesticides', name: 'Pesticides' },
    { id: 'tools', name: 'Tools' },
    { id: 'irrigation', name: 'Irrigation' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
  ];

  const handleProductAdded = (newProduct: Product) => {
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 10000 },
      inStock: null,
      rating: 0,
      sortBy: 'name'
    });
  };

  const hasActiveFilters = () => {
    return filters.inStock !== null || 
           filters.rating > 0 || 
           filters.priceRange.min > 0 || 
           filters.priceRange.max < 10000 ||
           filters.sortBy !== 'name';
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesPrice = product.price >= filters.priceRange.min && product.price <= filters.priceRange.max;
      const matchesStock = filters.inStock === null || product.inStock === filters.inStock;
      const matchesRating = product.rating >= filters.rating;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesRating;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (showAddProduct) {
    return (
      <AddProduct 
        onBack={() => setShowAddProduct(false)} 
        onProductAdded={handleProductAdded}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Marketplace</h2>
        {userRole === 'seller' && (
          <Button 
            onClick={() => setShowAddProduct(true)}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>
        
        {/* Mobile Filter and Category Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-11 flex-1 sm:flex-none"
            onClick={() => setShowCategories(!showCategories)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Categories</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
          </Button>
          
          <div className="relative">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-11 flex-1 sm:flex-none"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilters() && (
                <Badge className="ml-1 bg-green-600 text-white text-xs px-1.5 py-0.5">
                  {/* Count active filters */}
                  {[
                    filters.inStock !== null,
                    filters.rating > 0,
                    filters.priceRange.min > 0,
                    filters.priceRange.max < 10000,
                    filters.sortBy !== 'name'
                  ].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            
            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:mt-2 sm:bg-transparent">
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl p-4 max-h-[80vh] overflow-y-auto sm:relative sm:bottom-auto sm:w-80 sm:border sm:border-gray-200 sm:dark:border-gray-700 sm:rounded-lg sm:shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Price Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Range (₹)</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.priceRange.min}
                          onChange={(e) => handleFilterChange('priceRange', {
                            ...filters.priceRange,
                            min: parseInt(e.target.value) || 0
                          })}
                          className="flex-1"
                        />
                        <span className="text-gray-500 self-center">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.priceRange.max}
                          onChange={(e) => handleFilterChange('priceRange', {
                            ...filters.priceRange,
                            max: parseInt(e.target.value) || 10000
                          })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    {/* Stock Status */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Availability</label>
                      <div className="flex gap-2">
                        <Button
                          variant={filters.inStock === true ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('inStock', filters.inStock === true ? null : true)}
                          className={`flex-1 ${filters.inStock === true ? "bg-green-600 hover:bg-green-700" : ""}`}
                        >
                          In Stock
                        </Button>
                        <Button
                          variant={filters.inStock === false ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('inStock', filters.inStock === false ? null : false)}
                          className={`flex-1 ${filters.inStock === false ? "bg-red-600 hover:bg-red-700" : ""}`}
                        >
                          Out of Stock
                        </Button>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Rating</label>
                      <div className="flex gap-1 justify-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFilterChange('rating', filters.rating === rating ? 0 : rating)}
                            className="p-2"
                          >
                            <Star 
                              className={`w-5 h-5 ${
                                rating <= filters.rating 
                                  ? 'text-yellow-500 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Sort By */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'name', label: 'Name' },
                          { key: 'price', label: 'Price' },
                          { key: 'rating', label: 'Rating' },
                          { key: 'reviews', label: 'Reviews' }
                        ].map((sort) => (
                          <Button
                            key={sort.key}
                            variant={filters.sortBy === sort.key ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange('sortBy', sort.key)}
                            className={filters.sortBy === sort.key ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {sort.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearFilters}
                        className="flex-1"
                      >
                        Clear All
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setShowFilters(false)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories - Mobile Collapsible */}
      <div className={`${showCategories ? 'block' : 'hidden'} sm:block`}>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => {
                setActiveCategory(category.id);
                setShowCategories(false); // Close on mobile after selection
              }}
              size="sm"
              className={`${activeCategory === category.id ? "bg-green-600 hover:bg-green-700" : ""} text-xs sm:text-sm`}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          {filters.priceRange.min > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              Min: ₹{filters.priceRange.min}
              <button onClick={() => handleFilterChange('priceRange', { ...filters.priceRange, min: 0 })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.priceRange.max < 10000 && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              Max: ₹{filters.priceRange.max}
              <button onClick={() => handleFilterChange('priceRange', { ...filters.priceRange, max: 10000 })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.inStock !== null && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              {filters.inStock ? 'In Stock' : 'Out of Stock'}
              <button onClick={() => handleFilterChange('inStock', null)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.rating > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              {filters.rating}+ Stars
              <button onClick={() => handleFilterChange('rating', 0)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.sortBy !== 'name' && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              Sort: {filters.sortBy}
              <button onClick={() => handleFilterChange('sortBy', 'name')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
            Clear All
          </Button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-0">
              <div className="aspect-square sm:aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge className="bg-red-500 text-white">Out of Stock</Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  by {product.seller}
                </p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                  <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({product.reviews})</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-lg sm:text-2xl font-bold text-green-600">₹{product.price}</span>
                  <Button 
                    size="sm"
                    disabled={!product.inStock}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Products Found */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}