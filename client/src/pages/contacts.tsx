import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const typeColors: Record<string, string> = {
  Vendor: "bg-blue-100 text-blue-800",
  Customer: "bg-green-100 text-green-800",
  Both: "bg-purple-100 text-purple-800",
};

export default function Contacts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await fetch("/api/contacts");
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      type: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to add contact");
      }

      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Contact added",
        description: "New contact has been added successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  const filteredContacts = contacts.filter((contact: any) => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm);
    const matchesType = typeFilter === "all" || contact.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage vendors and customers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-contact">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Create a new vendor or customer contact
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" data-testid="input-contact-name" {...form.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" data-testid="input-phone" {...form.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" data-testid="input-contact-email" {...form.register("email")} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="addressLine">Address Line</Label>
                  <Input id="addressLine" data-testid="input-address" {...form.register("addressLine")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" data-testid="input-city" {...form.register("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" data-testid="input-state" {...form.register("state")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" data-testid="input-pincode" {...form.register("pincode")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" data-testid="input-country" {...form.register("country")} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select onValueChange={(value) => form.setValue("type", value)}>
                    <SelectTrigger data-testid="select-contact-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vendor">Vendor</SelectItem>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-contact"
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-contact">
                  Save Contact
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contacts..."
                  className="pl-10"
                  data-testid="input-search-contacts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Vendor">Vendors</SelectItem>
                <SelectItem value="Customer">Customers</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contacts Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading contacts...
                    </TableCell>
                  </TableRow>
                ) : filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No contacts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact: any) => {
                    const address = [
                      contact.addressLine,
                      contact.city,
                      contact.state,
                      contact.pincode,
                      contact.country,
                    ].filter(Boolean).join(", ");
                    return (
                      <TableRow key={contact.id} data-testid={`row-contact-${contact.id}`}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              {contact.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {contact.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {address || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={typeColors[contact.type]}>
                            {contact.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-edit-${contact.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
