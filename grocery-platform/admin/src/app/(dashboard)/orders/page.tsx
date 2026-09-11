"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import api from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_TRANSITIONS,
} from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import type { Order, PaginatedResponse } from "@/types";

const ORDER_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "PENDING_PAYMENT", label: "Pending Payment" },
  { value: "PAID", label: "Paid" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status) params.append("status", status);
      if (search) params.append("search", search);

      const { data } = await api.get<PaginatedResponse<Order>>(
        `/orders/admin/all?${params.toString()}`
      );
      // Handle both array and paginated responses
      if (Array.isArray(data)) {
        setOrders(data);
        setTotal(data.length);
      } else {
        setOrders(data?.data || []);
        setTotal(data?.total || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus) return;

    setUpdating(selectedOrder.id);
    try {
      await api.patch(`/orders/${selectedOrder.id}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus("");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus("");
    setShowStatusModal(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track customer orders
          </p>
        </div>
        <Button onClick={() => fetchOrders()} variant="outline" size="sm">
          <RefreshCw size={14} />
          Refresh
        </Button>
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
                  placeholder="Search by order number or customer..."
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
                options={ORDER_STATUSES}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size={32} />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="No orders found"
              description="Try adjusting your filters or search query"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Order
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Customer
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Type
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Total
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Payment
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Date
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-sm font-medium text-primary-600 hover:underline"
                          >
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          {order.customer ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.customer.firstName} {order.customer.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.customer.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Guest</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            label={order.fulfillmentType}
                            className={
                              order.fulfillmentType === "DELIVERY"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(order.total)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-xs text-gray-600">
                              {order.paymentMethod?.replace(/_/g, " ") ?? "N/A"}
                            </span>
                            <br />
                            <Badge
                              label={order.paymentStatus}
                              className={
                                order.paymentStatus === "CAPTURED"
                                  ? "bg-green-100 text-green-800"
                                  : order.paymentStatus === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openStatusModal(order)}
                            className="group"
                            disabled={updating === order.id}
                          >
                            <Badge
                              label={order.status.replace(/_/g, " ")}
                              className={`${
                                ORDER_STATUS_COLORS[order.status] ||
                                "bg-gray-100 text-gray-800"
                              } group-hover:ring-2 ring-primary-200 transition-shadow`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye size={14} />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} orders
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

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Order Status"
        size="sm"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Order</p>
              <p className="font-semibold text-gray-900">
                #{selectedOrder.orderNumber}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Current Status:{" "}
                <Badge
                  label={selectedOrder.status.replace(/_/g, " ")}
                  className={ORDER_STATUS_COLORS[selectedOrder.status]}
                />
              </p>
            </div>

            <Select
              label="New Status"
              options={[
                { value: "", label: "Select new status..." },
                ...(ORDER_STATUS_TRANSITIONS[selectedOrder.status] || []).map(
                  (s) => ({
                    value: s,
                    label: s.replace(/_/g, " "),
                  })
                ),
              ]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />

            {(ORDER_STATUS_TRANSITIONS[selectedOrder.status] || []).length ===
              0 && (
              <p className="text-sm text-gray-500">
                This order cannot be transitioned to another status.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={!newStatus}
                isLoading={updating === selectedOrder.id}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
