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
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { usersApi, User } from "@/lib/api";
import { useLocations } from "@/hooks/use-locations";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function AssignLocationDialog({ open, onOpenChange, user, onSuccess }: AssignLocationDialogProps) {
  const { token } = useAuth();
  const { locations, isLoading: locationsLoading } = useLocations({ fetchAll: true });
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedLocationId(user?.location?.id || "");
      setError("");
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      const locationId = selectedLocationId || null;
      await usersApi.assignLocation(user.id, locationId, token || undefined);
      toast.success(locationId ? "Location assigned successfully" : "Location removed successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLocation = async () => {
    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      await usersApi.assignLocation(user.id, null, token || undefined);
      toast.success("Location removed successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove location");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const currentLocation = user.location;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Assign Location</DialogTitle>
          <DialogDescription>
            Assign a location to {capitalize(user.fname)} {capitalize(user.lname)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {currentLocation && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{currentLocation.address_line_1}</p>
                    <p className="text-xs text-muted-foreground">
                      {capitalize(currentLocation.city)}, {capitalize(currentLocation.state)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={handleRemoveLocation}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="location">
                {currentLocation ? "Change Location" : "Select Location"}
              </Label>
              <Select
                value={selectedLocationId}
                onValueChange={(value) => setSelectedLocationId(value || "")}
                disabled={locationsLoading}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedLocationId
                      ? locations.find((loc) => loc.id === selectedLocationId)
                        ? `${locations.find((loc) => loc.id === selectedLocationId)?.address_line_1}, ${capitalize(locations.find((loc) => loc.id === selectedLocationId)?.city || "")}`
                        : currentLocation
                          ? `${currentLocation.address_line_1}, ${capitalize(currentLocation.city)}`
                          : "Choose a location"
                      : locationsLoading
                        ? "Loading locations..."
                        : "Choose a location"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {locations
                    .filter((loc) => !loc.is_central)
                    .map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.address_line_1}, {capitalize(loc.city)}, {capitalize(loc.state)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedLocationId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
