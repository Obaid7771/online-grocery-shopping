"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Star,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import api from "@/lib/api";
import { formatCurrency, formatDate, ORDER_STATUS_COLORS } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

interface CustomerDetails {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  totalSpent: number;
  _count: { orders: number; reviews: number };
  addresses: {
    id: string;
    label: string;
    recipientName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  }[];
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: { productName: string; quantity: number }[];
  }[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const { data } = await api.get(`/admin/customers/${customerId}`);
        setCustomer(data);
      } catch (error) {
        toast.error("Failed to load customer");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [customerId]);

  const toggleStatus = async () => {
    if (!customer) return;
    setToggling(true);
    try {
      await api.patch(`/admin/customers/${customerId}/toggle-status`);
      setCustomer({ ...customer, isActive: !customer.isActive });
      toast.success("Customer status updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size={32} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Customer not found.</p>
        <Link href="/customers">
          <Button variant="outline" className="mt-4">
            <ArrowLeft size={14} />
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={14} />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {customer.firstName[0]}
                {customer.lastName[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-sm text-gray-500">
                Customer since {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant={customer.isActive ? "danger" : "primary"}
          onClick={toggleStatus}
          isLoading={toggling}
        >
          {customer.isActive ? (
            <>
              <UserX size={14} />
              Disable Account
            </>
          ) : (
            <>
              <UserCheck size={14} />
              Enable Account
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="space-y-6">
          {/* Contact */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.email}
                  </p>
                  <Badge
                    label={customer.isEmailVerified ? "Verified" : "Not Verified"}
                    className={
                      customer.isEmailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  />
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Phone size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.phone}
                    </p>
                    <Badge
                      label={customer.isPhoneVerified ? "Verified" : "Not Verified"}
                      className={
                        customer.isPhoneVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <DollarSign size={24} className="text-primary-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <ShoppingBag size={24} className="text-blue-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-gray-900">
                    {customer._count.orders}
                  </p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Star size={24} className="text-yellow-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-gray-900">
                    {customer._count.reviews}
                  </p>
                  <p className="text-xs text-gray-500">Reviews</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Calendar size={24} className="text-purple-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-gray-900">
                    {customer.orders.length > 0
                      ? Math.round(customer.totalSpent / customer._count.orders)
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500">Avg Order</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Saved Addresses ({customer.addresses.length})
              </h3>
            </CardHeader>
            <CardContent>
              {customer.addresses.length === 0 ? (
                <p className="text-sm text-gray-500">No saved addresses.</p>
              ) : (
                <div className="space-y-3">
                  {customer.addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-3 rounded-lg border ${
                        address.isDefault
                          ? "border-primary-200 bg-primary-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <Badge
                                label="Default"
                                className="bg-primary-100 text-primary-800 text-xs"
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {address.recipientName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {address.street}, {address.city}, {address.state}{" "}
                            {address.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Order History
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              {customer.orders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No orders yet.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Order
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Items
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Total
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 hover:bg-gray-50"
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
                          <p className="text-sm text-gray-600">
                            {order.items.slice(0, 2).map((item, i) => (
                              <span key={i}>
                                {item.productName} x{item.quantity}
                                {i < Math.min(order.items.length - 1, 1) && ", "}
                              </span>
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-gray-400">
                                {" "}
                                +{order.items.length - 2} more
                              </span>
                            )}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            label={order.status.replace(/_/g, " ")}
                            className={ORDER_STATUS_COLORS[order.status]}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
