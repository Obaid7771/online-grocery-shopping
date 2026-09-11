"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
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
import Spinner from "@/components/ui/Spinner";
import type { Order } from "@/types";

interface OrderDetails extends Order {
  address?: {
    recipientName: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  deliverySlot?: {
    slotDate: string;
    startTime: string;
    endTime: string;
  };
  payments?: {
    id: string;
    paymentMethod: string;
    status: string;
    amount: number;
    transactionId?: string;
    paidAt?: string;
  }[];
}

const STATUS_TIMELINE = [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        toast.error("Failed to load order details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!newStatus || !order) return;

    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
      setOrder({ ...order, status: newStatus });
      setNewStatus("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/orders">
          <Button variant="outline" className="mt-4">
            <ArrowLeft size={14} />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_TIMELINE.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const availableTransitions = ORDER_STATUS_TRANSITIONS[order.status] || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={14} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <Badge
          label={order.status.replace(/_/g, " ")}
          className={`text-sm px-3 py-1 ${ORDER_STATUS_COLORS[order.status]}`}
        />
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {STATUS_TIMELINE.slice(0, -2).map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-primary-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        } ${isCurrent ? "ring-4 ring-primary-100" : ""}`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={16} />
                        ) : (
                          <span className="text-xs font-semibold">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center ${
                          isCompleted ? "text-primary-600 font-medium" : "text-gray-500"
                        }`}
                      >
                        {status.replace(/_/g, " ")}
                      </span>
                    </div>
                    {index < STATUS_TIMELINE.length - 3 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          index < currentStatusIndex ? "bg-primary-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled/Refunded Status */}
      {isCancelled && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4 text-red-600">
              <XCircle size={24} />
              <div>
                <p className="font-semibold">
                  Order {order.status === "CANCELLED" ? "Cancelled" : "Refunded"}
                </p>
                {order.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    Reason: {order.notes}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package size={18} className="text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Items ({order.items?.length || 0})
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                      Product
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                      Price
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                      Qty
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              SKU: {item.productSku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Update Status */}
          {availableTransitions.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Update Order Status
                </h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Select
                      label="New Status"
                      options={[
                        { value: "", label: "Select status..." },
                        ...availableTransitions.map((s) => ({
                          value: s,
                          label: s.replace(/_/g, " "),
                        })),
                      ]}
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={!newStatus}
                    isLoading={updating}
                  >
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="text-gray-900">
                  {order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : "Free"}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">{formatCurrency(order.tax)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Customer</h3>
              </div>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{order.customer.email}</p>
                  <Link
                    href={`/customers/${order.customer.id}`}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    View Customer Profile
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Guest Checkout</p>
              )}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          {order.fulfillmentType === "DELIVERY" && order.address && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delivery Address
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900">
                    {order.address.recipientName}
                  </p>
                  <p className="text-gray-600">{order.address.phone}</p>
                  <p className="text-gray-600">
                    {order.address.street}
                    {order.address.apartment && `, ${order.address.apartment}`}
                  </p>
                  <p className="text-gray-600">
                    {order.address.city}, {order.address.state}{" "}
                    {order.address.postalCode}
                  </p>
                  {order.address.deliveryInstructions && (
                    <p className="text-gray-500 text-xs mt-2 italic">
                      Note: {order.address.deliveryInstructions}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Slot */}
          {order.deliverySlot && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delivery Slot
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(order.deliverySlot.slotDate).toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "long", day: "numeric" }
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {order.deliverySlot.startTime} - {order.deliverySlot.endTime}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Payment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="text-gray-900">
                    {order.paymentMethod?.replace(/_/g, " ") ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
