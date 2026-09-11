"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Package,
  Star,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import type { Product, Category, PaginatedResponse } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.append("search", search);
      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (stockFilter === "low") params.append("lowStock", "true");
      if (stockFilter === "out") params.append("outOfStock", "true");

      const { data } = await api.get<PaginatedResponse<Product> | Product[]>(
        `/products?${params.toString()}`
      );
      if (Array.isArray(data)) {
        setProducts(data);
        setTotal(data.length);
      } else {
        setProducts(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryFilter, stockFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/categories?includeInactive=true");
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async () => {
    if (!deleteModal) return;

    setDeleting(true);
    try {
      await api.delete(`/products/${deleteModal.id}`);
      toast.success("Product deleted successfully");
      setDeleteModal(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus size={14} />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products by name, SKU..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select
                options={[
                  { value: "", label: "All Categories" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full md:w-40">
              <Select
                options={[
                  { value: "", label: "All Stock" },
                  { value: "low", label: "Low Stock" },
                  { value: "out", label: "Out of Stock" },
                ]}
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size={32} />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Try adjusting your filters or add a new product"
              action={
                <Link href="/products/new">
                  <Button>
                    <Plus size={14} />
                    Add Product
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Product
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Category
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        SKU
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Price
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Stock
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const isLowStock =
                        product.inventory &&
                        product.inventory.quantity <= product.inventory.lowStockThreshold &&
                        product.inventory.quantity > 0;
                      const isOutOfStock = product.inventory?.quantity === 0;

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.imageUrls?.[0] ? (
                                <img
                                  src={product.imageUrls[0]}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Package size={20} className="text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </p>
                                {product.isFeatured && (
                                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                                    <Star size={12} />
                                    Featured
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {product.category?.name || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500 font-mono">
                              {product.sku}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {product.comparePrice &&
                                product.comparePrice > product.price && (
                                  <span className="text-xs text-gray-400 line-through">
                                    {formatCurrency(product.comparePrice)}
                                  </span>
                                )}
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium ${
                                  isOutOfStock
                                    ? "text-red-600"
                                    : isLowStock
                                    ? "text-yellow-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {product.inventory?.quantity ?? 0}
                              </span>
                              {isLowStock && (
                                <AlertTriangle
                                  size={14}
                                  className="text-yellow-500"
                                />
                              )}
                              {isOutOfStock && (
                                <Badge
                                  label="Out"
                                  className="bg-red-100 text-red-800 text-xs"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              label={product.isActive ? "Active" : "Inactive"}
                              className={
                                product.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/products/${product.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Edit size={14} />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setDeleteModal(product)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} products
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Product"
        size="sm"
      >
        {deleteModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteModal.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteModal(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleting}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
