import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings, useUpdateCompanySettings } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useCompanySettings();
  const updateSettings = useUpdateCompanySettings();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    buildingNo: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || "",
        email: settings.email || "",
        phone: settings.phone || "",
        buildingNo: settings.buildingNo || "",
        street: settings.street || "",
        city: settings.city || "",
        state: settings.state || "",
        pincode: settings.pincode || "",
        country: settings.country || "",
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings.mutateAsync({
        ...formData,
        addressLine: formData.street,
      });
      setIsEditing(false);
      toast({
        title: "Settings saved",
        description: "Company profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (settings) {
      setFormData({
        companyName: settings.companyName || "",
        email: settings.email || "",
        phone: settings.phone || "",
        buildingNo: settings.buildingNo || "",
        street: settings.street || "",
        city: settings.city || "",
        state: settings.state || "",
        pincode: settings.pincode || "",
        country: settings.country || "",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your company profile and preferences</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your company profile and preferences</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Company Profile</CardTitle>
            </div>
            <CardDescription>Update your company information and contact details</CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} data-testid="button-edit">
              Edit
            </Button>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  disabled={!isEditing}
                  required
                  data-testid="input-company-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  required
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildingNo">Building No / Street Name</Label>
                <Input
                  id="buildingNo"
                  value={formData.buildingNo}
                  onChange={(e) => setFormData({ ...formData, buildingNo: e.target.value })}
                  disabled={!isEditing}
                  data-testid="input-building-no"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  disabled={!isEditing}
                  data-testid="input-street"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  required
                  data-testid="input-city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                  required
                  data-testid="input-state"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  disabled={!isEditing}
                  required
                  data-testid="input-pincode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  required
                  data-testid="input-country"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save">
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
