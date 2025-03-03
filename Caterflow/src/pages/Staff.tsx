
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Search } from "lucide-react";
import StaffForm from "@/components/staff/StaffForm";
import { toast } from "sonner";

interface Staff {
  id: string;
  name: string;
  role: string;
  contact_number?: string;
  email?: string;
  hourly_rate?: number;
}

const Staff = () => {
  const { user } = useAuth();
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: staffMembers = [], refetch: refetchStaff } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data as Staff[];
    },
  });

  const filteredStaff = staffMembers.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStaffAdded = async () => {
    await refetchStaff();
    setShowAddStaff(false);
    toast.success("Staff member added successfully!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-gray-500 mt-2">Manage your team members</p>
          </div>
          <Button onClick={() => setShowAddStaff(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        {showAddStaff && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Staff Member</CardTitle>
              <CardDescription>Enter the staff member's details</CardDescription>
            </CardHeader>
            <CardContent>
              <StaffForm onSuccess={handleStaffAdded} onCancel={() => setShowAddStaff(false)} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.contact_number}</TableCell>
                    <TableCell>${staff.hourly_rate}/hr</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Staff;
