"use client";

import { useState, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { useLocations } from "@/hooks/use-locations";
import { locationsApi, Location } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, MapPin } from "lucide-react";
import { AddLocationDialog } from "@/components/dialogs/add-location-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useDeleteWithUndo } from "@/hooks/use-delete-with-undo";
import { useAuth } from "@/contexts/auth-context";

export default function LocationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { locations, total, totalPages, isLoading, error, refetch } = useLocations({ page, limit });
  const { token } = useAuth();

  const handleDelete = useCallback(async (id: string) => {
    await locationsApi.delete(id, token || undefined);
  }, [token]);

  const { deleteWithUndo } = useDeleteWithUndo({
    type: "location",
    onDelete: handleDelete,
  });

  const handleEditClick = (location: Location) => {
    setEditLocation(location);
    setShowAddDialog(true);
  };

  const handleDeleteClick = (location: Location) => {
    setDeleteTarget(location);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteWithUndo(deleteTarget.id, `${deleteTarget.address_line_1}, ${deleteTarget.city}`);
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  const handleDialogClose = () => {
    setShowAddDialog(false);
    setEditLocation(null);
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  const columns = [
    { key: "sno", header: "#", render: (_l: Location, index: number) => index + 1 },
    {
      key: "address",
      header: "Address",
      render: (l: Location) => (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">{l.address_line_1}</p>
            {l.address_line_2 && <p className="text-sm text-muted-foreground">{l.address_line_2}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "city",
      header: "City",
      render: (l: Location) => capitalize(l.city),
    },
    {
      key: "state",
      header: "State",
      render: (l: Location) => capitalize(l.state),
    },
    {
      key: "pincode",
      header: "Pincode",
      render: (l: Location) => l.pincode,
    },
    {
      key: "country",
      header: "Country",
      render: (l: Location) => capitalize(l.country),
    },
    {
      key: "is_central",
      header: "Type",
      render: (l: Location) => (
        <Badge variant={l.is_central ? "default" : "secondary"}>
          {l.is_central ? "Central" : "Regular"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (l: Location) => (
        <div className="flex items-center gap-1">
          {!l.is_central && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEditClick(l)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDeleteClick(l)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Manage all locations in the system</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>
      <DataTable
        title="Locations"
        columns={columns}
        data={locations}
        isLoading={isLoading}
        error={error}
        keyExtractor={(l) => l.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
      <AddLocationDialog
        open={showAddDialog}
        onOpenChange={handleDialogClose}
        editLocation={editLocation}
        onSuccess={handleDialogSuccess}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Location"
        description={`Are you sure you want to delete this location? This action can be undone within 5 seconds.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
