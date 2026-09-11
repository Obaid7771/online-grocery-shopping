"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  GripVertical,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import type { Category } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sortOrder: 0, isActive: true },
  });

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories?includeInactive=true");
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    reset({ name: "", description: "", parentId: "", sortOrder: 0, isActive: true });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, data);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", data);
        toast.success("Category created successfully");
      }
      setShowModal(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;

    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteCategory.id}`);
      toast.success("Category deleted successfully");
      setDeleteCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Build tree structure
  const rootCategories = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  const renderCategory = (category: Category, level = 0) => {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 ${
            level > 0 ? `ml-${level * 6}` : ""
          }`}
          style={{ marginLeft: level * 24 }}
        >
          <div className="w-6">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(category.id)}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-gray-500" />
                ) : (
                  <ChevronRight size={14} className="text-gray-500" />
                )}
              </button>
            )}
          </div>
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <FolderOpen size={18} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{category.name}</p>
            {category.description && (
              <p className="text-xs text-gray-500 truncate max-w-xs">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              label={`${category._count?.products || 0} products`}
              className="bg-gray-100 text-gray-600"
            />
            <Badge
              label={category.isActive ? "Active" : "Inactive"}
              className={
                category.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }
            />
            <span className="text-xs text-gray-400 w-12 text-center">
              #{category.sortOrder}
            </span>
            <Button variant="ghost" size="sm" onClick={() => openEditModal(category)}>
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setDeleteCategory(category)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>{children.map((child) => renderCategory(child, level + 1))}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize your products into categories
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={14} />
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No categories"
              description="Create your first category to organize products"
              action={
                <Button onClick={openCreateModal}>
                  <Plus size={14} />
                  Add Category
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-gray-50">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <div className="w-6" />
                <div className="w-10" />
                <div className="flex-1">Name</div>
                <div className="flex items-center gap-2">
                  <span className="w-20 text-center">Products</span>
                  <span className="w-16 text-center">Status</span>
                  <span className="w-12 text-center">Order</span>
                  <span className="w-24 text-center">Actions</span>
                </div>
              </div>
              {rootCategories.map((category) => renderCategory(category))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? "Edit Category" : "New Category"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Category Name"
            placeholder="e.g., Fresh Vegetables"
            error={errors.name?.message}
            {...register("name")}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Optional description..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...register("description")}
            />
          </div>
          {!editingCategory && (
            <Select
              id="parentId"
              label="Parent Category (optional)"
              options={[
                { value: "", label: "None (Top Level)" },
                ...categories
                  .filter((c) => !c.parentId)
                  .map((c) => ({ value: c.id, label: c.name })),
              ]}
              {...register("parentId")}
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="sortOrder"
              type="number"
              label="Sort Order"
              placeholder="0"
              {...register("sortOrder", { valueAsNumber: true })}
            />
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  {...register("isActive")}
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        title="Delete Category"
        size="sm"
      >
        {deleteCategory && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteCategory.name}</span>?
              {(deleteCategory._count?.products || 0) > 0 && (
                <span className="block mt-2 text-yellow-600">
                  Warning: This category has {deleteCategory._count?.products}{" "}
                  products that will need to be reassigned.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteCategory(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
