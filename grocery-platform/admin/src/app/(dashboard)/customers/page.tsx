"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import type { Customer, PaginatedResponse } from "@/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.append("search", search);

      const { data } = await api.get<PaginatedResponse<Customer>>(
        `/admin/customers?${params.toString()}`
      );
      // Handle both array and paginated responses
      if (Array.isArray(data)) {
        setCustomers(data);
        setTotal(data.length);
      } else {
        setCustomers(data?.data || []);
        setTotal(data?.total || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch customers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const toggleStatus = async (customerId: string) => {
    setToggling(customerId);
    try {
      await api.patch(`/admin/customers/${customerId}/toggle-status`);
      toast.success("Customer status updated");
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage customer accounts
        </p>
      </div>

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
              placeholder="Search by name, email, or phone..."
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

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size={32} />
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers found"
              description="Customers will appear here when they create accounts"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Customer
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Contact
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Orders
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Verified
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Joined
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary-600">
                                {customer.firstName[0]}
                                {customer.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {customer.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail size={12} className="text-gray-400" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone size={12} className="text-gray-400" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ShoppingBag size={14} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {customer._count?.orders || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            label={customer.isEmailVerified ? "Yes" : "No"}
                            className={
                              customer.isEmailVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            label={customer.isActive ? "Active" : "Disabled"}
                            className={
                              customer.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {formatDate(customer.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/customers/${customer.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye size={14} />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={
                                customer.isActive
                                  ? "text-red-500 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }
                              onClick={() => toggleStatus(customer.id)}
                              disabled={toggling === customer.id}
                            >
                              {customer.isActive ? (
                                <UserX size={14} />
                              ) : (
                                <UserCheck size={14} />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
    </div>
  );
}
