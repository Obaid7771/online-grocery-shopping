"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import api from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { Category } from "@/types";

const UNITS = [
  { value: "PIECE", label: "Piece" },
  { value: "KG", label: "Kilogram (kg)" },
  { value: "G", label: "Gram (g)" },
  { value: "LB", label: "Pound (lb)" },
  { value: "OZ", label: "Ounce (oz)" },
  { value: "LITER", label: "Liter (L)" },
  { value: "ML", label: "Milliliter (mL)" },
  { value: "PACK", label: "Pack" },
  { value: "BOX", label: "Box" },
  { value: "BUNCH", label: "Bunch" },
];

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(2, "SKU is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  comparePrice: z.number().min(0).optional(),
  unit: z.string().default("PIECE"),
  unitStep: z.number().min(0.01).default(1),
  stockQuantity: z.number().min(0).default(0),
  minStockThreshold: z.number().min(0).default(5),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: "PIECE",
      unitStep: 1,
      stockQuantity: 0,
      minStockThreshold: 5,
      isFeatured: false,
      isActive: true,
    },
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await api.get("/categories?includeInactive=false");
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const { data } = await api.post("/storage/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImageUrls((prev) => [...prev, ...data.urls]);
      toast.success(`Uploaded ${files.length} image(s)`);
    } catch (error) {
      toast.error("Failed to upload images");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Transform imageUrls to images array format expected by backend
      const images = imageUrls.map((url, index) => ({
        url,
        isPrimary: index === 0,
        sortOrder: index,
      }));

      await api.post("/products", {
        name: data.name,
        sku: data.sku,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        discountPrice: data.comparePrice || undefined, // Backend uses discountPrice
        unit: data.unit,
        unitStep: data.unitStep,
        stockQuantity: data.stockQuantity,
        minStockThreshold: data.minStockThreshold,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        images,
      });
      toast.success("Product created successfully");
      router.push("/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create product");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={14} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Product Name"
              placeholder="e.g., Organic Bananas"
              error={errors.name?.message}
              {...register("name")}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="sku"
                label="SKU"
                placeholder="e.g., PROD-001"
                error={errors.sku?.message}
                {...register("sku")}
              />
              <Select
                id="categoryId"
                label="Category"
                options={[
                  { value: "", label: "Select a category" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                error={errors.categoryId?.message}
                {...register("categoryId")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Product description..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Product Images
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                {uploading ? (
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Upload size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              First image will be the primary image. Drag to reorder.
            </p>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                id="price"
                type="number"
                step="0.01"
                label="Price"
                placeholder="0.00"
                error={errors.price?.message}
                {...register("price", { valueAsNumber: true })}
              />
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                label="Compare at Price (optional)"
                placeholder="0.00"
                helperText="Original price for sale items"
                {...register("comparePrice", { valueAsNumber: true })}
              />
              <Select
                id="unit"
                label="Unit"
                options={UNITS}
                {...register("unit")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                id="unitStep"
                type="number"
                step="0.01"
                label="Unit Step"
                placeholder="1"
                helperText="Minimum quantity increment"
                {...register("unitStep", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="stockQuantity"
                type="number"
                label="Stock Quantity"
                placeholder="0"
                error={errors.stockQuantity?.message}
                {...register("stockQuantity", { valueAsNumber: true })}
              />
              <Input
                id="minStockThreshold"
                type="number"
                label="Low Stock Threshold"
                placeholder="5"
                helperText="Alert when stock falls below this"
                {...register("minStockThreshold", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  {...register("isActive")}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Active</p>
                  <p className="text-xs text-gray-500">
                    Product is visible and available for purchase
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  {...register("isFeatured")}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Featured</p>
                  <p className="text-xs text-gray-500">
                    Show in featured products section
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/products">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
