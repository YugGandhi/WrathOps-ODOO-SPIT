import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

export default function Settings() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      companyName: "StockMaster Industries",
      email: "info@stockmaster.com",
      phone: "+1 (555) 000-0000",
      addressLine: "123 Business Street",
      buildingNo: "Building 5",
      street: "Main Avenue",
      city: "New York",
      state: "NY",
      pincode: "10001",
      country: "United States",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      console.log("Company settings:", data);
      toast({
        title: "Settings saved",
        description: "Company profile has been updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage company profile and system settings
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            data-testid="button-edit-settings"
          >
            Edit
          </Button>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  data-testid="input-company-name"
                  disabled={!isEditing}
                  {...form.register("companyName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-company-email"
                  disabled={!isEditing}
                  {...form.register("email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  data-testid="input-company-phone"
                  disabled={!isEditing}
                  {...form.register("phone")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  data-testid="input-company-country"
                  disabled={!isEditing}
                  {...form.register("country")}
                />
              </div>
            </div>

            <div className="pt-4">
              <h3 className="font-semibold mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="buildingNo">Building No</Label>
                  <Input
                    id="buildingNo"
                    data-testid="input-building-no"
                    disabled={!isEditing}
                    {...form.register("buildingNo")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    data-testid="input-street"
                    disabled={!isEditing}
                    {...form.register("street")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine">Address Line</Label>
                  <Input
                    id="addressLine"
                    data-testid="input-address-line"
                    disabled={!isEditing}
                    {...form.register("addressLine")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    data-testid="input-company-city"
                    disabled={!isEditing}
                    {...form.register("city")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    data-testid="input-company-state"
                    disabled={!isEditing}
                    {...form.register("state")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    data-testid="input-company-pincode"
                    disabled={!isEditing}
                    {...form.register("pincode")}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" data-testid="button-save-settings">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                  data-testid="button-cancel-settings"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
