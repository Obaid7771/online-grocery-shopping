"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "@/lib/api";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import type { Coupon } from "@/types";

const schema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0.01, "Discount value must be greater than 0"),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional().nullable(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  usageLimitTotal: z.number().min(1).optional(),
  usageLimitPerUser: z.number().min(1).optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteCoupon, setDeleteCoupon] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      discountType: "PERCENTAGE",
      usageLimitTotal: 1000,
      usageLimitPerUser: 1,
      isActive: true,
    },
  });

  const discountType = watch("discountType");

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get("/coupons");
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch coupons");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    reset({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscountAmount: null,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      usageLimitTotal: 1000,
      usageLimitPerUser: 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    reset({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
      discountValue: Number(coupon.discountValue),
      minOrderAmount: Number(coupon.minOrderAmount) || 0,
      maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
      startDate: coupon.startDate?.split("T")[0] || "",
      endDate: coupon.endDate?.split("T")[0] || "",
      usageLimitTotal: coupon.usageLimitTotal || 1000,
      usageLimitPerUser: coupon.usageLimitPerUser || 1,
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingCoupon) {
        // Update payload - don't include code (not editable)
        const updatePayload = {
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderAmount: data.minOrderAmount || 0,
          maxDiscountAmount: data.maxDiscountAmount || null,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          usageLimitTotal: data.usageLimitTotal || 1000,
          usageLimitPerUser: data.usageLimitPerUser || 1,
          isActive: data.isActive,
        };
        await api.put(`/coupons/${editingCoupon.id}`, updatePayload);
        toast.success("Coupon updated successfully");
      } else {
        // Create payload - includes code
        const createPayload = {
          code: data.code.toUpperCase(),
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderAmount: data.minOrderAmount || 0,
          maxDiscountAmount: data.maxDiscountAmount || null,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          usageLimitTotal: data.usageLimitTotal || 1000,
          usageLimitPerUser: data.usageLimitPerUser || 1,
        };
        await api.post("/coupons", createPayload);
        toast.success("Coupon created successfully");
      }
      setShowModal(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleDelete = async () => {
    if (!deleteCoupon) return;
    setDeleting(true);
    try {
      await api.delete(`/coupons/${deleteCoupon.id}`);
      toast.success("Coupon deleted");
      setDeleteCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    } finally {
      setDeleting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { label: "Inactive", color: "bg-gray-100 text-gray-600" };
    const now = new Date();
    const start = coupon.startDate ? new Date(coupon.startDate) : null;
    const end = coupon.endDate ? new Date(coupon.endDate) : null;
    if (start && now < start) return { label: "Scheduled", color: "bg-blue-100 text-blue-800" };
    if (end && now > end) return { label: "Expired", color: "bg-red-100 text-red-800" };
    if (coupon.usageLimitTotal && coupon.timesUsed >= coupon.usageLimitTotal)
      return { label: "Exhausted", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Active", color: "bg-green-100 text-green-800" };
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
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage discount coupons
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={14} />
          Create Coupon
        </Button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <EmptyState
                icon={Tag}
                title="No coupons"
                description="Create your first coupon to offer discounts"
                action={
                  <Button onClick={openCreateModal}>
                    <Plus size={14} />
                    Create Coupon
                  </Button>
                }
              />
            </Card>
          </div>
        ) : (
          coupons.map((coupon) => {
            const status = getCouponStatus(coupon);
            return (
              <Card key={coupon.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          coupon.discountType === "PERCENTAGE"
                            ? "bg-purple-100"
                            : "bg-green-100"
                        }`}
                      >
                        {coupon.discountType === "PERCENTAGE" ? (
                          <Percent size={18} className="text-purple-600" />
                        ) : (
                          <DollarSign size={18} className="text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="text-sm font-mono font-bold text-gray-900 hover:text-primary-600 flex items-center gap-1"
                          >
                            {coupon.code}
                            <Copy size={12} className="text-gray-400" />
                          </button>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.discountValue}% OFF`
                            : formatCurrency(Number(coupon.discountValue)) + " OFF"}
                        </p>
                      </div>
                    </div>
                    <Badge label={status.label} className={status.color} />
                  </div>

                  {coupon.description && (
                    <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
                  )}

                  <div className="space-y-2 text-xs text-gray-500">
                    {coupon.minOrderAmount && Number(coupon.minOrderAmount) > 0 && (
                      <p>Min. order: {formatCurrency(Number(coupon.minOrderAmount))}</p>
                    )}
                    {coupon.maxDiscountAmount && (
                      <p>Max. discount: {formatCurrency(Number(coupon.maxDiscountAmount))}</p>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {coupon.startDate && formatDateShort(coupon.startDate)} -{" "}
                      {coupon.endDate && formatDateShort(coupon.endDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      {coupon.timesUsed} / {coupon.usageLimitTotal || "∞"} used
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditModal(coupon)}
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-500 hover:bg-red-50"
                      onClick={() => setDeleteCoupon(coupon)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCoupon ? "Edit Coupon" : "Create Coupon"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="code"
              label="Coupon Code"
              placeholder="SUMMER25"
              error={errors.code?.message}
              {...register("code")}
            />
            <Select
              id="discountType"
              label="Discount Type"
              options={[
                { value: "PERCENTAGE", label: "Percentage (%)" },
                { value: "FIXED", label: "Fixed Amount ($)" },
              ]}
              {...register("discountType")}
            />
          </div>

          <Input
            id="description"
            label="Description (optional)"
            placeholder="Summer sale discount"
            {...register("description")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="discountValue"
              type="number"
              step="0.01"
              label={discountType === "PERCENTAGE" ? "Discount (%)" : "Discount Amount ($)"}
              placeholder={discountType === "PERCENTAGE" ? "25" : "10.00"}
              error={errors.discountValue?.message}
              {...register("discountValue", { valueAsNumber: true })}
            />
            <Input
              id="minOrderAmount"
              type="number"
              step="0.01"
              label="Min. Order Amount"
              placeholder="0.00"
              {...register("minOrderAmount", { valueAsNumber: true })}
            />
          </div>

          {discountType === "PERCENTAGE" && (
            <Input
              id="maxDiscountAmount"
              type="number"
              step="0.01"
              label="Max Discount Amount (optional)"
              placeholder="100.00"
              helperText="Cap the maximum discount for percentage coupons"
              {...register("maxDiscountAmount", { valueAsNumber: true })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="startDate"
              type="date"
              label="Start Date"
              error={errors.startDate?.message}
              {...register("startDate")}
            />
            <Input
              id="endDate"
              type="date"
              label="End Date"
              error={errors.endDate?.message}
              {...register("endDate")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="usageLimitTotal"
              type="number"
              label="Total Usage Limit"
              placeholder="1000"
              {...register("usageLimitTotal", { valueAsNumber: true })}
            />
            <Input
              id="usageLimitPerUser"
              type="number"
              label="Per User Limit"
              placeholder="1"
              {...register("usageLimitPerUser", { valueAsNumber: true })}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              {...register("isActive")}
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCoupon ? "Save Changes" : "Create Coupon"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteCoupon}
        onClose={() => setDeleteCoupon(null)}
        title="Delete Coupon"
        size="sm"
      >
        {deleteCoupon && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete coupon{" "}
              <span className="font-mono font-bold">{deleteCoupon.code}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteCoupon(null)}>
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
