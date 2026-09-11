"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  AlertTriangle,
  Package,
  ChevronLeft,
  ChevronRight,
  History,
  Plus,
  Minus,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import type { InventoryItem, PaginatedResponse } from "@/types";

interface InventoryLog {
  id: string;
  changeType: string;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string | null;
  createdAt: string;
  performedBy?: { firstName: string; lastName: string };
}

const adjustmentSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  changeType: z.enum(["MANUAL_ADJUSTMENT", "PURCHASE_RECEIPT", "WASTAGE_DAMAGE"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().optional(),
});

type AdjustmentForm = z.infer<typeof adjustmentSchema>;

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<AdjustmentForm>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { changeType: "MANUAL_ADJUSTMENT", quantity: 1 },
  });

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append("search", search);

      const { data } = await api.get<PaginatedResponse<InventoryItem>>(
        `/inventory?${params.toString()}`
      );
      // Handle both array and paginated responses
      if (Array.isArray(data)) {
        setInventory(data);
        setTotal(data.length);
      } else {
        setInventory(data?.data || []);
        setTotal(data?.total || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch inventory");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  const fetchLowStockAlerts = async () => {
    try {
      const { data } = await api.get("/inventory/alerts");
      setLowStockAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchLowStockAlerts();
  }, [fetchInventory]);

  const openAdjustModal = (item: InventoryItem, type: "add" | "remove") => {
    setSelectedProduct(item);
    setAdjustmentType(type);
    // Handle both flat and nested data structures
    const productId = (item as any).product?.id || (item as any).productId || (item as any).id;
    setValue("productId", productId);
    setValue("changeType", type === "add" ? "PURCHASE_RECEIPT" : "MANUAL_ADJUSTMENT");
    setValue("quantity", 1);
    setValue("reason", "");
    setShowAdjustModal(true);
  };

  const openLogsModal = async (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowLogsModal(true);
    setLogsLoading(true);
    try {
      // Handle both flat and nested data structures
      const productId = (item as any).product?.id || (item as any).productId || (item as any).id;
      const { data } = await api.get(`/inventory/logs/${productId}`);
      setLogs(data.data || data);
    } catch (error) {
      toast.error("Failed to load inventory logs");
      console.error(error);
    } finally {
      setLogsLoading(false);
    }
  };

  const onSubmitAdjustment = async (data: AdjustmentForm) => {
    try {
      const quantityChanged = adjustmentType === "remove" ? -data.quantity : data.quantity;
      await api.post("/inventory/adjust", {
        productId: data.productId,
        changeType: data.changeType,
        quantityChanged,
        reason: data.reason || `${adjustmentType === "add" ? "Added" : "Removed"} ${data.quantity} units`,
      });
      toast.success("Stock adjusted successfully");
      setShowAdjustModal(false);
      reset();
      fetchInventory();
      fetchLowStockAlerts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to adjust stock");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage stock levels
          </p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">
                Low Stock Alerts ({lowStockAlerts.length})
              </h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {lowStockAlerts.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-yellow-200"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {(item as any).product?.name || (item as any).name}
                  </span>
                  <Badge
                    label={`${item.quantity} left`}
                    className={
                      item.quantity === 0
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-600"
                    onClick={() => openAdjustModal(item, "add")}
                  >
                    <Plus size={12} />
                    Restock
                  </Button>
                </div>
              ))}
              {lowStockAlerts.length > 10 && (
                <span className="text-sm text-yellow-700 self-center">
                  +{lowStockAlerts.length - 10} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size={32} />
            </div>
          ) : inventory.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No inventory items found"
              description="Products will appear here once created"
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
                        SKU
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        In Stock
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Reserved
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Available
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Threshold
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item: any) => {
                      // Handle both flat structure (from API) and nested structure
                      const product = item.product || item;
                      const quantity = item.quantity ?? item.stockQuantity ?? 0;
                      const reservedQty = item.reservedQuantity ?? 0;
                      const threshold = item.lowStockThreshold ?? item.minStockThreshold ?? 5;
                      const available = quantity - reservedQty;
                      const isLow = quantity <= threshold && quantity > 0;
                      const isOut = quantity === 0;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.imageUrls?.[0] || product.images?.[0]?.url ? (
                                <img
                                  src={product.imageUrls?.[0] || product.images?.[0]?.url}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Package size={16} className="text-gray-400" />
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500 font-mono">
                              {product.sku}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`text-sm font-semibold ${
                                isOut
                                  ? "text-red-600"
                                  : isLow
                                  ? "text-yellow-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-gray-500">
                              {reservedQty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-medium text-gray-900">
                              {available}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-gray-500">
                              {threshold}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isOut ? (
                              <Badge label="Out of Stock" className="bg-red-100 text-red-800" />
                            ) : isLow ? (
                              <Badge label="Low Stock" className="bg-yellow-100 text-yellow-800" />
                            ) : (
                              <Badge label="In Stock" className="bg-green-100 text-green-800" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => openAdjustModal(item, "add")}
                              >
                                <Plus size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => openAdjustModal(item, "remove")}
                                disabled={item.quantity === 0}
                              >
                                <Minus size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openLogsModal(item)}
                              >
                                <History size={14} />
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
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <span className="text-sm text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title={`${adjustmentType === "add" ? "Add" : "Remove"} Stock`}
        size="sm"
      >
        {selectedProduct && (
          <form onSubmit={handleSubmit(onSubmitAdjustment)} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">
                {(selectedProduct as any).product?.name || (selectedProduct as any).name}
              </p>
              <p className="text-xs text-gray-500">
                Current stock: {(selectedProduct as any).quantity ?? (selectedProduct as any).stockQuantity ?? 0}
              </p>
            </div>
            <input type="hidden" {...register("productId")} />
            <Select
              id="changeType"
              label="Reason Type"
              options={
                adjustmentType === "add"
                  ? [
                      { value: "PURCHASE_RECEIPT", label: "Purchase Receipt" },
                      { value: "MANUAL_ADJUSTMENT", label: "Manual Adjustment" },
                    ]
                  : [
                      { value: "MANUAL_ADJUSTMENT", label: "Manual Adjustment" },
                      { value: "WASTAGE_DAMAGE", label: "Wastage/Damage" },
                    ]
              }
              error={errors.changeType?.message}
              {...register("changeType")}
            />
            <Input
              id="quantity"
              type="number"
              min="1"
              label="Quantity"
              error={errors.quantity?.message}
              {...register("quantity", { valueAsNumber: true })}
            />
            <Input
              id="reason"
              label="Notes (optional)"
              placeholder="Reason for adjustment..."
              {...register("reason")}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowAdjustModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className={adjustmentType === "remove" ? "bg-red-500 hover:bg-red-600" : ""}
              >
                {adjustmentType === "add" ? "Add Stock" : "Remove Stock"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Inventory Logs Modal */}
      <Modal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title="Inventory History"
        size="lg"
      >
        {selectedProduct && (
          <div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900">
                {(selectedProduct as any).product?.name || (selectedProduct as any).name}
              </p>
            </div>
            {logsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner size={24} />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No inventory changes recorded.
              </p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-left py-2 px-3">Type</th>
                      <th className="text-right py-2 px-3">Change</th>
                      <th className="text-right py-2 px-3">New Qty</th>
                      <th className="text-left py-2 px-3">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-50">
                        <td className="py-2 px-3 text-gray-500">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            label={log.changeType.replace(/_/g, " ")}
                            className="bg-gray-100 text-gray-700 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`font-medium ${
                              log.quantityChanged > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {log.quantityChanged > 0 ? "+" : ""}
                            {log.quantityChanged}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {log.newQuantity}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {log.performedBy
                            ? `${log.performedBy.firstName} ${log.performedBy.lastName}`
                            : "System"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
