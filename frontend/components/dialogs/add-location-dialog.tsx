"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { locationsApi, Location, CreateLocationPayload } from "@/lib/api";
import { toast } from "sonner";

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLocation?: Location | null;
  onSuccess?: () => void;
}

export function AddLocationDialog({ open, onOpenChange, editLocation, onSuccess }: AddLocationDialogProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<CreateLocationPayload>({
    address_line_1: "",
    address_line_2: "",
    landmark: "",
    city: "",
    pincode: "",
    state: "",
    country: "India",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editLocation) {
      setFormData({
        address_line_1: editLocation.address_line_1,
        address_line_2: editLocation.address_line_2 || "",
        landmark: editLocation.landmark || "",
        city: editLocation.city,
        pincode: editLocation.pincode,
        state: editLocation.state,
        country: editLocation.country,
      });
    } else {
      setFormData({
        address_line_1: "",
        address_line_2: "",
        landmark: "",
        city: "",
        pincode: "",
        state: "",
        country: "India",
      });
    }
  }, [editLocation, open]);

  const handleChange = (field: keyof CreateLocationPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (editLocation) {
        await locationsApi.update(editLocation.id, formData, token || undefined);
        toast.success("Location updated successfully");
      } else {
        await locationsApi.create(formData, token || undefined);
        toast.success("Location created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save location");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editLocation ? "Edit Location" : "Add Location"}</DialogTitle>
          <DialogDescription>
            {editLocation ? "Update the location details." : "Create a new location. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="address_line_1">Address Line 1 *</Label>
              <Input
                id="address_line_1"
                value={formData.address_line_1}
                onChange={(e) => handleChange("address_line_1", e.target.value)}
                placeholder="e.g., 123 Main Street"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address_line_2">Address Line 2</Label>
              <Input
                id="address_line_2"
                value={formData.address_line_2}
                onChange={(e) => handleChange("address_line_2", e.target.value)}
                placeholder="e.g., Suite 100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => handleChange("landmark", e.target.value)}
                placeholder="e.g., Near City Mall"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="e.g., Mumbai"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  placeholder="e.g., 400001"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="e.g., Maharashtra"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="e.g., India"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editLocation ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
