import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Filter, Grid, List } from "lucide-react";
import { fetchProducts, fetchCategories } from "../store/slices/productSlice";
import ProductCard from "../components/Products/ProductCard";
import ProductFilters from "../components/Products/ProductFilters";

const Products = () => {
  const dispatch = useDispatch();
  const { products, pagination, isLoading, filters } = useSelector(
    (state) => state.products
  );
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const loadMore = () => {
    if (pagination?.hasMore) {
      dispatch(fetchProducts({ ...filters, page: pagination.currentPage + 1 }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">
            {pagination?.totalProducts} products found
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list" ? "bg-white shadow-sm" : ""
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div
          className={`md:col-span-1 ${
            showFilters ? "block" : "hidden md:block"
          }`}
        >
          <ProductFilters onClose={() => setShowFilters(false)} />
        </div>

        {/* Products Grid */}
        <div className="md:col-span-3">
          {isLoading && products.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-200 animate-pulse rounded-lg h-96"
                ></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products found matching your criteria.
              </p>
              <p className="text-gray-400 mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {products.map((product) => {
                  return <ProductCard key={product._id} product={product} />;
                })}
              </div>

              {/* Load More Button */}
              {pagination?.hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : "Load More Products"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
