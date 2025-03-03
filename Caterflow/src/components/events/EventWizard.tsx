
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type EventFormData = {
  title: string;
  description: string;
  location: string;
  guestCount: number;
  eventDate: Date;
  dietaryRequirements: string;
  setupInstructions: string;
};

const EventWizard = () => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>();

  const onSubmit = async (data: EventFormData) => {
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: data.title,
          description: data.description,
          location: data.location,
          guest_count: data.guestCount,
          event_date: selectedDate?.toISOString(),
          dietary_requirements: data.dietaryRequirements,
          setup_instructions: data.setupInstructions,
          user_id: user?.id,
          status: 'draft',
          total_amount: 0, // Will be updated later in the process
        });

      if (error) throw error;

      toast.success("Event created successfully!");
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("Failed to create event. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                {...register("title", { required: true })}
              />
              {errors.title && (
                <span className="text-sm text-red-500">Title is required</span>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter event description"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label>Event Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter event location"
                {...register("location", { required: true })}
              />
              {errors.location && (
                <span className="text-sm text-red-500">Location is required</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestCount">Number of Guests</Label>
              <Input
                id="guestCount"
                type="number"
                placeholder="Enter number of guests"
                {...register("guestCount", { required: true, min: 1 })}
              />
              {errors.guestCount && (
                <span className="text-sm text-red-500">Valid guest count is required</span>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dietaryRequirements">Dietary Requirements</Label>
              <Input
                id="dietaryRequirements"
                placeholder="Enter any dietary requirements"
                {...register("dietaryRequirements")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setupInstructions">Setup Instructions</Label>
              <Input
                id="setupInstructions"
                placeholder="Enter setup instructions"
                {...register("setupInstructions")}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>
          Step {step} of 3: {step === 1 ? 'Basic Details' : step === 2 ? 'Location & Guests' : 'Additional Information'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form id="eventForm" onSubmit={handleSubmit(onSubmit)}>
          {renderStep()}
        </form>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          Previous
        </Button>
        
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>Next</Button>
        ) : (
          <Button type="submit" form="eventForm">Create Event</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventWizard;
