
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Switch 
} from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, User } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  
  const saveSettings = () => {
    toast.success("Settings saved successfully", {
      description: "Your changes have been applied",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/70 p-1">
          <TabsTrigger value="account" className="data-[state=active]:bg-white">
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="display" className="data-[state=active]:bg-white">
            Display
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-white">
            Billing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-24 w-24 rounded-full bg-purple-light flex items-center justify-center">
                    <User className="h-12 w-12 text-purple" />
                  </div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">
                        First Name
                      </label>
                      <Input id="firstName" defaultValue="Admin" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </label>
                      <Input id="lastName" defaultValue="User" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input id="email" type="email" defaultValue="admin@example.com" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium">
                        Role
                      </label>
                      <Select defaultValue="admin">
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="language" className="text-sm font-medium">
                        Language
                      </label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-purple hover:bg-purple-medium" onClick={saveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium">
                  Current Password
                </label>
                <Input id="currentPassword" type="password" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button className="bg-purple hover:bg-purple-medium" onClick={saveSettings}>
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { id: 'newOrders', label: 'New Orders', description: 'Receive notifications when new orders are placed' },
                { id: 'orderStatus', label: 'Order Status Updates', description: 'Get notified when order status changes' },
                { id: 'inventory', label: 'Inventory Alerts', description: 'Be alerted when products are low in stock' },
                { id: 'customerMessages', label: 'Customer Messages', description: 'Receive notifications for new customer inquiries' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={item.id === 'newOrders' || item.id === 'inventory'} />
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-3">Notification Channels</h3>
                <div className="space-y-4">
                  {[
                    { id: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { id: 'browser', label: 'Browser Notifications', description: 'Show notifications in your browser' },
                    { id: 'mobile', label: 'Mobile Push Notifications', description: 'Get notified on your mobile device' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{item.label}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={item.id === 'email'} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-purple hover:bg-purple-medium" onClick={saveSettings}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="display" className="space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize your interface appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Dark Mode</h3>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="theme" className="text-sm font-medium">
                    Color Theme
                  </label>
                  <Select defaultValue="purple">
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purple">Purple (Default)</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="density" className="text-sm font-medium">
                    Interface Density
                  </label>
                  <Select defaultValue="comfortable">
                    <SelectTrigger>
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Animations</h3>
                    <p className="text-sm text-muted-foreground">Enable interface animations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-purple hover:bg-purple-medium" onClick={saveSettings}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-6">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your billing details and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-purple-light/50 rounded-md">
                <h3 className="font-medium">Current Plan: Business Pro</h3>
                <p className="text-sm mt-1">Your subscription renews on October 12, 2023</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    Change Plan
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    Cancel Subscription
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Payment Method</h3>
                <div className="p-4 border rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="font-bold text-gray-500">V</span>
                    </div>
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  Add Payment Method
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Billing Address</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium">
                        Company Name (Optional)
                      </label>
                      <Input id="company" defaultValue="Acme Inc." />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Street Address
                    </label>
                    <Input id="address" defaultValue="123 Main St." />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        City
                      </label>
                      <Input id="city" defaultValue="San Francisco" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="state" className="text-sm font-medium">
                        State/Province
                      </label>
                      <Input id="state" defaultValue="CA" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="zip" className="text-sm font-medium">
                        ZIP/Postal Code
                      </label>
                      <Input id="zip" defaultValue="94103" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium">
                      Country
                    </label>
                    <Select defaultValue="us">
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-purple hover:bg-purple-medium" onClick={saveSettings}>
                  Save Billing Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
