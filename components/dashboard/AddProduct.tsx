'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Upload,
  Plus,
  X,
  Save,
  Package,
  Leaf,
  Apple,
  Sprout,
  Wrench,
  Shield,
  Image as ImageIcon,
  Trash2
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

interface AddProductProps {
  onBack: () => void;
  onProductAdded: (product: Product) => void;
}

export function AddProduct({ onBack, onProductAdded }: AddProductProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    specifications: '',
    inStock: true,
    quantity: '',
    unit: '',
    brand: '',
    images: [] as File[]
  });

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = {
    vegetables: {
      name: 'Vegetables',
      icon: Leaf,
      subcategories: ['Seeds', 'Saplings', 'Fresh Produce', 'Organic', 'Hybrid Varieties']
    },
    fruits: {
      name: 'Fruits',
      icon: Apple,
      subcategories: ['Seeds', 'Saplings', 'Fresh Produce', 'Organic', 'Citrus', 'Tropical']
    },
    fertilizers: {
      name: 'Fertilizers',
      icon: Sprout,
      subcategories: ['Organic', 'Chemical', 'NPK', 'Micronutrients', 'Liquid', 'Granular']
    },
    pesticides: {
      name: 'Pesticides',
      icon: Shield,
      subcategories: ['Insecticides', 'Fungicides', 'Herbicides', 'Organic', 'Biological Control']
    },
    tools: {
      name: 'Tools & Equipment',
      icon: Wrench,
      subcategories: ['Hand Tools', 'Power Tools', 'Irrigation', 'Harvesting', 'Soil Testing', 'Sprayers']
    }
  };

  const units = ['kg', 'grams', 'liters', 'pieces', 'packets', 'bags', 'bottles'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      // Validate file types
      const validFiles = filesToAdd.filter(file => 
        file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
      );

      if (validFiles.length !== filesToAdd.length) {
        alert('Some files were skipped. Please upload only image files under 5MB.');
      }

      // Update form data
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));

      // Create preview URLs
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const remainingSlots = 5 - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      // Validate file types
      const validFiles = filesToAdd.filter(file => 
        file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
      );

      if (validFiles.length !== filesToAdd.length) {
        alert('Some files were skipped. Please upload only image files under 5MB.');
      }

      // Update form data
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));

      // Create preview URLs
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getDefaultProductImage = (category: string) => {
    const imageMap: { [key: string]: string } = {
      vegetables: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      fruits: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      fertilizers: 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      pesticides: 'https://images.pexels.com/photos/6928266/pexels-photo-6928266.jpeg?auto=compress&cs=tinysrgb&w=300&h=200',
      tools: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=300&h=200'
    };
    return imageMap[category] || 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300&h=200';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.category || !formData.price || !formData.description || !formData.quantity || !formData.unit) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the product object
      const newProduct: Product = {
        id: Date.now(), // Simple ID generation for demo
        name: formData.name,
        price: parseFloat(formData.price),
        rating: 4.5, // Default rating for new products
        reviews: 0, // New products start with 0 reviews
        seller: formData.brand || 'Your Store', // Use brand as seller name or default
        image: imagePreviews.length > 0 ? imagePreviews[0] : getDefaultProductImage(formData.category),
        category: formData.category,
        inStock: formData.inStock,
        brand: formData.brand,
        description: formData.description,
        specifications: formData.specifications,
        quantity: formData.quantity,
        unit: formData.unit,
        tags: tags
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the callback to add product to marketplace
      onProductAdded(newProduct);

      // Clean up object URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));

      // Show success message
      alert('Product added successfully!');
      
      // Navigate back to marketplace
      onBack();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (categoryKey: string) => {
    const category = categories[categoryKey as keyof typeof categories];
    return category ? category.icon : Package;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Organic Tomato Seeds"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Green Valley Seeds"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, category]) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {category.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(value) => handleInputChange('subcategory', value)}
                    disabled={!formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.category && categories[formData.category as keyof typeof categories]?.subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product, its benefits, usage instructions..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                  id="specifications"
                  placeholder="Technical details, composition, certifications..."
                  value={formData.specifications}
                  onChange={(e) => handleInputChange('specifications', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="100"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => handleInputChange('inStock', e.target.checked.toString())}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="inStock">Product is in stock</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add tags (e.g., organic, hybrid, disease-resistant)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Product Images ({formData.images.length}/5)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop images here, or click to browse
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleFileSelect}
                    disabled={formData.images.length >= 5}
                  >
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Upload up to 5 images. Max size: 5MB per image. Recommended size: 800x600px
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Category Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.category ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = getCategoryIcon(formData.category);
                      return <IconComponent className="w-5 h-5 text-green-600" />;
                    })()}
                    <span className="font-medium">
                      {categories[formData.category as keyof typeof categories]?.name}
                    </span>
                  </div>
                  {formData.subcategory && (
                    <Badge variant="outline">{formData.subcategory}</Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select a category to see preview</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving Product...' : 'Save Product'}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onBack}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}