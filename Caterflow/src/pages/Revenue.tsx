import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Calendar, DollarSign } from "lucide-react";

// Mock data for demonstration
const revenueData = [
  {
    id: 1,
    date: "2024-03-15",
    event: "Johnson Wedding Reception",
    type: "event",
    eventId: "evt-001",
    amount: 12500,
  },
  {
    id: 2,
    date: "2024-03-20",
    event: "Tech Corp Annual Dinner",
    type: "event",
    eventId: "evt-002",
    amount: 18750,
  },
  {
    id: 3,
    date: "2024-03-25",
    event: "Catering Order - Smith Family",
    type: "order",
    orderId: "ord-001",
    amount: 850,
  },
];

const Revenue = () => {
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Revenue Overview</h1>
          <p className="text-gray-500 mt-2">Track your business revenue and transactions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Total Revenue: ${totalRevenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Event/Order</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {item.date}
                      </div>
                    </TableCell>
                    <TableCell>{item.event}</TableCell>
                    <TableCell>${item.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Link
                        to={item.type === 'event' ? `/events/${item.eventId}` : `/orders/${item.orderId}`}
                        className="text-primary hover:underline"
                      >
                        View Details
                      </Link>
                    </TableCell>
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

export default Revenue;