"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Truck,
  Calendar,
  DollarSign,
} from "lucide-react";
import { format, addDays } from "date-fns";
import toast from "react-hot-toast";

import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import type { DeliveryZone } from "@/types";

interface DeliverySlot {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  isActive: boolean;
}

const zoneSchema = z.object({
  name: z.string().min(2, "Name is required"),
  postalCodes: z.string().min(1, "At least one postal code required"),
  baseFee: z.number().min(0, "Fee must be 0 or more"),
  minOrderAmount: z.number().min(0).optional(),
  freeDeliveryThreshold: z.number().min(0).optional().nullable(),
  estimatedMinutes: z.number().min(1).optional(),
  isActive: z.boolean().default(true),
});

const slotsSchema = z.object({
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  timeSlots: z.string().min(1, "Time slots required"),
  maxCapacity: z.number().min(1, "Capacity must be at least 1"),
});

type ZoneForm = z.infer<typeof zoneSchema>;
type SlotsForm = z.infer<typeof slotsSchema>;

export default function DeliveryPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [activeTab, setActiveTab] = useState<"zones" | "slots">("zones");

  // Zone modals
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [deleteZone, setDeleteZone] = useState<DeliveryZone | null>(null);
  const [deletingZone, setDeletingZone] = useState(false);

  // Slots modals
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);

  const zoneForm = useForm<ZoneForm>({
    resolver: zodResolver(zoneSchema),
    defaultValues: { baseFee: 4.99, minOrderAmount: 15, estimatedMinutes: 45, isActive: true },
  });

  const slotsForm = useForm<SlotsForm>({
    resolver: zodResolver(slotsSchema),
    defaultValues: {
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      timeSlots: "09:00-11:00,11:00-13:00,13:00-15:00,15:00-17:00,17:00-19:00",
      maxCapacity: 25,
    },
  });

  const fetchZones = async () => {
    try {
      const { data } = await api.get("/delivery/admin/zones");
      setZones(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch delivery zones");
    } finally {
      setLoadingZones(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const startDate = format(new Date(), "yyyy-MM-dd");
      const endDate = format(addDays(new Date(), 14), "yyyy-MM-dd");
      const { data } = await api.get(
        `/delivery/admin/slots?startDate=${startDate}&endDate=${endDate}`
      );
      setSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch delivery slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchZones();
    fetchSlots();
  }, []);

  // Zone handlers
  const openCreateZone = () => {
    setEditingZone(null);
    zoneForm.reset({
      name: "",
      postalCodes: "",
      baseFee: 4.99,
      minOrderAmount: 15,
      freeDeliveryThreshold: null,
      estimatedMinutes: 45,
      isActive: true,
    });
    setShowZoneModal(true);
  };

  const openEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    zoneForm.reset({
      name: zone.name,
      postalCodes: (zone.postalCodes || []).join(", "),
      baseFee: Number(zone.baseFee) || 0,
      minOrderAmount: Number(zone.minOrderAmount) || 15,
      freeDeliveryThreshold: zone.freeDeliveryThreshold ? Number(zone.freeDeliveryThreshold) : null,
      estimatedMinutes: zone.estimatedMinutes,
      isActive: zone.isActive ?? true,
    });
    setShowZoneModal(true);
  };

  const onSubmitZone = async (data: ZoneForm) => {
    try {
      const payload = {
        name: data.name,
        postalCodes: data.postalCodes.split(",").map((s) => s.trim()),
        baseFee: data.baseFee,
        minOrderAmount: data.minOrderAmount,
        freeDeliveryThreshold: data.freeDeliveryThreshold || null,
        estimatedMinutes: data.estimatedMinutes,
        isActive: data.isActive,
      };

      if (editingZone) {
        await api.put(`/delivery/admin/zones/${editingZone.id}`, payload);
        toast.success("Zone updated");
      } else {
        await api.post("/delivery/admin/zones", payload);
        toast.success("Zone created");
      }
      setShowZoneModal(false);
      fetchZones();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save zone");
    }
  };

  const handleDeleteZone = async () => {
    if (!deleteZone) return;
    setDeletingZone(true);
    try {
      await api.delete(`/delivery/admin/zones/${deleteZone.id}`);
      toast.success("Zone deleted");
      setDeleteZone(null);
      fetchZones();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete zone");
    } finally {
      setDeletingZone(false);
    }
  };

  // Slots handlers
  const onSubmitSlots = async (data: SlotsForm) => {
    try {
      const timeSlots = data.timeSlots.split(",").map((slot) => {
        const [startTime, endTime] = slot.trim().split("-");
        return { startTime, endTime };
      });

      await api.post("/delivery/admin/slots", {
        startDate: data.startDate,
        endDate: data.endDate,
        timeSlots,
        maxCapacity: data.maxCapacity,
      });
      toast.success("Delivery slots created");
      setShowSlotsModal(false);
      fetchSlots();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create slots");
    }
  };

  const toggleSlotStatus = async (slot: DeliverySlot) => {
    try {
      await api.put(`/delivery/admin/slots/${slot.id}`, {
        isActive: !slot.isActive,
      });
      toast.success("Slot updated");
      fetchSlots();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update slot");
    }
  };

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = slot.slotDate.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, DeliverySlot[]>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage delivery zones and time slots
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "zones" ? "primary" : "secondary"}
          onClick={() => setActiveTab("zones")}
        >
          <MapPin size={14} />
          Delivery Zones
        </Button>
        <Button
          variant={activeTab === "slots" ? "primary" : "secondary"}
          onClick={() => setActiveTab("slots")}
        >
          <Clock size={14} />
          Time Slots
        </Button>
      </div>

      {/* Zones Tab */}
      {activeTab === "zones" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateZone}>
              <Plus size={14} />
              Add Zone
            </Button>
          </div>

          {loadingZones ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size={32} />
            </div>
          ) : zones.length === 0 ? (
            <Card>
              <EmptyState
                icon={MapPin}
                title="No delivery zones"
                description="Create zones to define delivery areas"
                action={
                  <Button onClick={openCreateZone}>
                    <Plus size={14} />
                    Add Zone
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone) => (
                <Card key={zone.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <MapPin size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                          <p className="text-xs text-gray-500">
                            {(zone.postalCodes || []).length} postal codes
                          </p>
                        </div>
                      </div>
                      <Badge
                        label={zone.isActive ? "Active" : "Inactive"}
                        className={
                          zone.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Delivery Fee</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(Number(zone.baseFee) || 0)}
                        </span>
                      </div>
                      {zone.freeDeliveryThreshold && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Free Above</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(zone.freeDeliveryThreshold)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Est. Time</span>
                        <span className="font-medium text-gray-900">
                          {zone.estimatedMinutes} min
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                      {(zone.postalCodes || []).slice(0, 5).map((code: string) => (
                        <span
                          key={code}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {code}
                        </span>
                      ))}
                      {(zone.postalCodes || []).length > 5 && (
                        <span className="px-2 py-0.5 text-xs text-gray-400">
                          +{(zone.postalCodes || []).length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditZone(zone)}
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteZone(zone)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slots Tab */}
      {activeTab === "slots" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowSlotsModal(true)}>
              <Plus size={14} />
              Generate Slots
            </Button>
          </div>

          {loadingSlots ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size={32} />
            </div>
          ) : Object.keys(slotsByDate).length === 0 ? (
            <Card>
              <EmptyState
                icon={Clock}
                title="No delivery slots"
                description="Generate slots for upcoming days"
                action={
                  <Button onClick={() => setShowSlotsModal(true)}>
                    <Plus size={14} />
                    Generate Slots
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(slotsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, daySlots]) => (
                  <Card key={date}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <h3 className="font-semibold text-gray-900">
                          {format(new Date(date), "EEEE, MMMM d, yyyy")}
                        </h3>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {daySlots
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((slot) => {
                            const isFull = slot.bookedCount >= slot.maxCapacity;
                            return (
                              <button
                                key={slot.id}
                                onClick={() => toggleSlotStatus(slot)}
                                className={`p-3 rounded-lg border text-left transition-colors ${
                                  !slot.isActive
                                    ? "border-gray-200 bg-gray-50 opacity-50"
                                    : isFull
                                    ? "border-red-200 bg-red-50"
                                    : "border-gray-200 hover:border-primary-300"
                                }`}
                              >
                                <p className="text-sm font-medium text-gray-900">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-500">
                                    {slot.bookedCount}/{slot.maxCapacity}
                                  </span>
                                  {isFull ? (
                                    <Badge
                                      label="Full"
                                      className="bg-red-100 text-red-800 text-xs"
                                    />
                                  ) : !slot.isActive ? (
                                    <Badge
                                      label="Off"
                                      className="bg-gray-100 text-gray-600 text-xs"
                                    />
                                  ) : (
                                    <Badge
                                      label="Open"
                                      className="bg-green-100 text-green-800 text-xs"
                                    />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Zone Modal */}
      <Modal
        isOpen={showZoneModal}
        onClose={() => setShowZoneModal(false)}
        title={editingZone ? "Edit Zone" : "Create Zone"}
        size="md"
      >
        <form onSubmit={zoneForm.handleSubmit(onSubmitZone)} className="space-y-4">
          <Input
            id="name"
            label="Zone Name"
            placeholder="e.g., Downtown"
            error={zoneForm.formState.errors.name?.message}
            {...zoneForm.register("name")}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Codes (comma-separated)
            </label>
            <textarea
              placeholder="10001, 10002, 10003"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...zoneForm.register("postalCodes")}
            />
            {zoneForm.formState.errors.postalCodes && (
              <p className="text-xs text-red-500 mt-1">
                {zoneForm.formState.errors.postalCodes.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="baseFee"
              type="number"
              step="0.01"
              label="Delivery Fee ($)"
              error={zoneForm.formState.errors.baseFee?.message}
              {...zoneForm.register("baseFee", { valueAsNumber: true })}
            />
            <Input
              id="freeDeliveryThreshold"
              type="number"
              step="0.01"
              label="Free Delivery Above ($)"
              placeholder="50.00"
              {...zoneForm.register("freeDeliveryThreshold", { valueAsNumber: true })}
            />
          </div>
          <Input
            id="estimatedMinutes"
            type="number"
            label="Estimated Delivery Time (min)"
            {...zoneForm.register("estimatedMinutes", { valueAsNumber: true })}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              {...zoneForm.register("isActive")}
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowZoneModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={zoneForm.formState.isSubmitting}>
              {editingZone ? "Save Changes" : "Create Zone"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Zone Modal */}
      <Modal
        isOpen={!!deleteZone}
        onClose={() => setDeleteZone(null)}
        title="Delete Zone"
        size="sm"
      >
        {deleteZone && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteZone.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteZone(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteZone} isLoading={deletingZone}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Generate Slots Modal */}
      <Modal
        isOpen={showSlotsModal}
        onClose={() => setShowSlotsModal(false)}
        title="Generate Delivery Slots"
        size="md"
      >
        <form onSubmit={slotsForm.handleSubmit(onSubmitSlots)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="startDate"
              type="date"
              label="Start Date"
              error={slotsForm.formState.errors.startDate?.message}
              {...slotsForm.register("startDate")}
            />
            <Input
              id="endDate"
              type="date"
              label="End Date"
              error={slotsForm.formState.errors.endDate?.message}
              {...slotsForm.register("endDate")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slots (comma-separated)
            </label>
            <input
              type="text"
              placeholder="09:00-11:00,11:00-13:00"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...slotsForm.register("timeSlots")}
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: HH:MM-HH:MM separated by commas
            </p>
          </div>
          <Input
            id="maxCapacity"
            type="number"
            label="Capacity Per Slot"
            error={slotsForm.formState.errors.maxCapacity?.message}
            {...slotsForm.register("maxCapacity", { valueAsNumber: true })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowSlotsModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={slotsForm.formState.isSubmitting}>
              Generate Slots
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
