import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

const mockEvents = [
  {
    id: 1,
    name: "Johnson Wedding Reception",
    date: "2024-03-15",
    time: "18:00",
    guests: 150,
  },
  {
    id: 2,
    name: "Tech Corp Annual Dinner",
    date: "2024-03-20",
    time: "19:30",
    guests: 200,
  },
  {
    id: 3,
    name: "Smith Family Reunion",
    date: "2024-03-25",
    time: "12:00",
    guests: 75,
  },
];

const UpcomingEvents = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-colors">
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">{event.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.guests} guests
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;