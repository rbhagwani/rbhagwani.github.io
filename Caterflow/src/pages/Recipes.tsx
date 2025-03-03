import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash2, ChartBar, ChartPie, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Database } from "@/integrations/supabase/types";

type Recipe = Database['public']['Tables']['recipes']['Row'];
type NewRecipe = Database['public']['Tables']['recipes']['Insert'];

const Recipes = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<NewRecipe>();

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
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Recipe added successfully",
      });
    },
  });

  // Delete recipe mutation
  const deleteRecipeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
    },
  });

  // Update recipe mutation
  const updateRecipeMutation = useMutation({
    mutationFn: async (recipe: Recipe) => {
      const { error } = await supabase
        .from("recipes")
        .update(recipe)
        .eq("id", recipe.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setSelectedRecipe(null);
      toast({
        title: "Success",
        description: "Recipe updated successfully",
      });
    },
  });

  const onSubmit = async (data: NewRecipe) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    if (selectedRecipe) {
      updateRecipeMutation.mutate({ ...data, id: selectedRecipe.id, user_id: userId } as Recipe);
    } else {
      addRecipeMutation.mutate({ ...data, user_id: userId });
    }
  };

  // Chart data preparation
  const categoryData = recipes.reduce((acc: { name: string; value: number }[], recipe) => {
    const category = recipe.category || "Uncategorized";
    const existingCategory = acc.find((item) => item.name === category);
    if (existingCategory) {
      existingCategory.value++;
    } else {
      acc.push({ name: category, value: 1 });
    }
    return acc;
  }, []);

  const costData = recipes.map((recipe) => ({
    name: recipe.name,
    cost: recipe.cost || 0,
  }));

  const COLORS = ["#FF6B2C", "#2C3E50", "#27AE60", "#3498DB"];

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Recipes</h1>
          <p className="text-gray-500 mt-2">Manage your recipes and view analytics</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setShowCharts(!showCharts)}>
            <ChartBar className="mr-2" />
            {showCharts ? "Hide Analytics" : "Show Analytics"}
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2" />
            Print Report
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2" />
                Add Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedRecipe ? "Edit Recipe" : "Add New Recipe"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Grilled Salmon" {...field} />
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
                          <Textarea placeholder="A delicious grilled salmon recipe..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
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
                      name="serving_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serving Size</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="4" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
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
                  <Button type="submit" className="w-full">
                    {selectedRecipe ? "Update Recipe" : "Add Recipe"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showCharts && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipes by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart width={400} height={300}>
                <Pie
                  data={categoryData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recipe Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={400} height={300} data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#FF6B2C" />
              </BarChart>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{recipe.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      form.reset(recipe);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRecipeMutation.mutate(recipe.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">{recipe.category}</p>
              <p className="mb-4">{recipe.description}</p>
              <div className="flex justify-between text-sm">
                <span>Cost: ${recipe.cost}</span>
                <span>Serves: {recipe.serving_size}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Recipes;