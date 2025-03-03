import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ListPlus, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Recipe = Database['public']['Tables']['recipes']['Row'];
type NewRecipe = Database['public']['Tables']['recipes']['Insert'];

const Menus = () => {
  const [sortBy, setSortBy] = useState<"name" | "cost" | "popularity">("name");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<NewRecipe>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recipes
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add recipe mutation
  const addRecipeMutation = useMutation({
    mutationFn: async (newRecipe: NewRecipe) => {
      const { data, error } = await supabase
        .from("recipes")
        .insert([{ ...newRecipe, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Recipe added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add recipe",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: Partial<NewRecipe>) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    const newRecipe: NewRecipe = {
      name: data.name!,
      description: data.description || null,
      category: data.category || null,
      cost: parseFloat(data.cost as unknown as string) || null,
      serving_size: parseInt(data.serving_size as unknown as string) || null,
      ingredients: [],
      instructions: [],
      user_id: userId,
    };

    addRecipeMutation.mutate(newRecipe);
  };

  const sortedAndFilteredItems = recipes
    .filter(item => !filterCategory || (item.category?.toLowerCase() || '').includes(filterCategory.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "cost":
          return (a.cost || 0) - (b.cost || 0);
        case "popularity":
          return 0; // No popularity field in the database
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Menus</h1>
                <p className="text-gray-500 mt-2">Create and manage your catering menus</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <ListPlus className="mr-2" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Grilled Salmon" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="Main Course" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="29.99" {...field} />
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
                              <Input placeholder="Fresh Atlantic salmon..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">Add Item</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Filter by category..."
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="max-w-xs"
                    icon={Filter}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSortBy("name")}
                    className={sortBy === "name" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Name
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSortBy("cost")}
                    className={sortBy === "cost" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Cost
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSortBy("popularity")}
                    className={sortBy === "popularity" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Popular
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAndFilteredItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="mt-2">{item.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-semibold">${item.cost?.toFixed(2)}</span>
                      <span className="text-sm text-gray-500">
                        Serves: {item.serving_size || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Menus;
