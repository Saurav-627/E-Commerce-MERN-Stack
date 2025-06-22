import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, X } from 'lucide-react';
import { setFilters } from '../../store/slices/productSlice';

const ProductFilters = ({ onClose }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.products);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const clearFilters = () => {
    dispatch(setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      featured: false,
      sort: 'created_at DESC'
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </h3>
        <button onClick={onClose} className="md:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search products..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="Min"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Max"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Featured */}
      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.featured}
            onChange={(e) => handleFilterChange('featured', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Featured Products Only</span>
        </label>
      </div>

      {/* Sort */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="created_at DESC">Newest First</option>
          <option value="created_at ASC">Oldest First</option>
          <option value="price ASC">Price: Low to High</option>
          <option value="price DESC">Price: High to Low</option>
          <option value="name ASC">Name: A to Z</option>
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ProductFilters;