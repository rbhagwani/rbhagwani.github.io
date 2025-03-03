import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type Event = Database['public']['Tables']['events']['Row'];
type NewEvent = Database['public']['Tables']['events']['Insert'];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  event_date: z.string().min(1, "Event date is required"),
  location: z.string().min(1, "Location is required"),
  guest_count: z.string().min(1, "Guest count is required"),
  description: z.string().optional(),
});

const Events = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAllPastEvents, setShowAllPastEvents] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      event_date: new Date().toISOString(),
      location: "",
      guest_count: "",
      description: "",
    },
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch events with separate queries for upcoming and past events
  const { data: upcomingEvents = [], isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", today)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: pastEvents = [], isLoading: isLoadingPast } = useQuery({
    queryKey: ["events", "past"],
    queryFn: async () => {
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .lt("event_date", today)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (newEvent: NewEvent) => {
      const { data, error } = await supabase
        .from("events")
        .insert([{ ...newEvent, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Event added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    const newEvent: NewEvent = {
      title: data.title,
      description: data.description || null,
      event_date: data.event_date,
      location: data.location,
      guest_count: parseInt(data.guest_count) || 0,
      status: 'upcoming',
      menu: null,
      total_amount: 0,
      user_id: userId,
    };

    addEventMutation.mutate(newEvent);
  };

  if (isLoadingUpcoming || isLoadingPast) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  // Calculate the events to display
  const displayedPastEvents = showAllPastEvents ? pastEvents : pastEvents.slice(0, 4);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-gray-500 mt-2">Schedule and manage your catering events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <CalendarPlus className="mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Event</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Corporate Lunch" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Event Location" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guest_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Count</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Event details..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Schedule Event</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500">No upcoming events scheduled</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.event_date).toLocaleDateString()} - {event.location}
                    </p>
                    <p className="text-sm mt-2">{event.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Guests: {event.guest_count}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Past Events</h2>
            <div className="space-y-4">
              {pastEvents.length === 0 ? (
                <p className="text-gray-500">No past events</p>
              ) : (
                <>
                  {displayedPastEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(event.event_date).toLocaleDateString()} - {event.location}
                      </p>
                      <p className="text-sm mt-2">{event.description}</p>
                      <p className="text-sm text-gray-500 mt-1">Guests: {event.guest_count}</p>
                    </div>
                  ))}
                  {pastEvents.length > 4 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setShowAllPastEvents(!showAllPastEvents)}
                    >
                      {showAllPastEvents ? 'Show Less' : `Show All (${pastEvents.length})`}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Events;
