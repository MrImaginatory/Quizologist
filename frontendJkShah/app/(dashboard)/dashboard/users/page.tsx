"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { useUsers } from "@/hooks/use-users";
import { User } from "@/lib/api";
import { capitalize, getAvatarColor, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { AssignLocationDialog } from "@/components/dialogs/assign-location-dialog";
import { useAuth } from "@/contexts/auth-context";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [assignUser, setAssignUser] = useState<User | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const { users, total, totalPages, isLoading, error, refetch } = useUsers({ page, limit });
  const { user: currentUser } = useAuth();

  const handleAssignClick = (user: User) => {
    setAssignUser(user);
    setShowAssignDialog(true);
  };

  const columns = [
    { key: "sno", header: "#", render: (_user: User, index: number) => index + 1 },
    {
      key: "name",
      header: "Name",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={`text-white text-xs font-medium ${getAvatarColor(user.fname + user.lname)}`}>
              {getInitials(user.fname, user.lname)}
            </AvatarFallback>
          </Avatar>
          <span>{capitalize(`${user.fname} ${user.lname}`)}</span>
        </div>
      ),
    },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (user: User) => (
      <Badge
        variant="outline"
        className={
          user.role === "student"
            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
            : user.role === "teacher"
              ? "bg-green-500/10 text-green-500 border-green-500/20"
              : "bg-purple-500/10 text-purple-500 border-purple-500/20"
        }
      >
        {capitalize(user.role)}
      </Badge>
    )},
    { key: "mobileNumber", header: "Mobile" },
    {
      key: "location",
      header: "Location",
      render: (user: User) => (
        user.location ? (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">{capitalize(user.location.city)}, {capitalize(user.location.state)}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Not assigned</span>
        )
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: User) => (
        user.id !== currentUser?.id ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleAssignClick(user)}
            title="Assign location"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Users</h1>
        <p className="text-muted-foreground">Manage all users in the system</p>
      </div>
      <DataTable
        title="Users"
        columns={columns}
        data={users}
        isLoading={isLoading}
        error={error}
        keyExtractor={(user) => user.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
      <AssignLocationDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        user={assignUser}
        onSuccess={refetch}
      />
    </div>
  );
}
