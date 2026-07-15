"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { useUsers } from "@/hooks/use-users";
import { User } from "@/lib/api";
import { capitalize, getAvatarColor, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  { key: "mobileNumber", header: "Mobile" },
  { key: "role", header: "Role", render: () => (
    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Student</Badge>
  )},
];

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { users, total, totalPages, isLoading, error } = useUsers({ role: "student", page, limit });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">View all registered students</p>
      </div>
      <DataTable
        title="Students"
        columns={columns}
        data={users}
        isLoading={isLoading}
        error={error}
        keyExtractor={(user) => user.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
