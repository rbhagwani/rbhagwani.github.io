import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginForm = z.infer<typeof formSchema>;

const AdminLogin = () => {
  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: AdminLoginForm) => {
    setIsLoading(true);
    const { email, password } = data;

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        console.error("Login error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        form.setError("root", { 
          type: "manual",
          message: error.message 
        });
      } else {
        console.log("Login successful");
        
        // Fetch company details
        const { data: companyUser, error: companyError } = await supabase
          .from('companyuser')
          .select('companyid')
          .eq('uid', authData.user?.id)
          .single();

        if (companyError) {
          console.error("Error fetching company details:", companyError);
        } else if (companyUser) {
          // Fetch company name
          const { data: company } = await supabase
            .from('company')
            .select('companyname')
            .eq('companyid', companyUser.companyid)
            .single();

          // Store user and company details in localStorage
          localStorage.setItem('user', JSON.stringify({
            id: authData.user?.id,
            email: authData.user?.email,
            companyId: companyUser.companyid,
            companyName: company?.companyname
          }));
        }

        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        navigate('/');
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-screen">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <div className="text-sm font-medium text-red-500">
                  {form.formState.errors.root.message}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLogin;
