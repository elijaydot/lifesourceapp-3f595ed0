import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  User, 
  Heart, 
  MapPin, 
  Shield, 
  Bell, 
  Award,
  History,
  Settings,
  LogOut
} from "lucide-react";

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  role: "donor" as "donor" | "recipient",
  bloodType: "O+",
  location: "Downtown Area",
  joinDate: "January 2024",
  donationCount: 3,
  badges: [
    { id: "1", name: "First Donation", icon: "🩸", earned: true },
    { id: "2", name: "Hero of the Day", icon: "🦸", earned: true },
    { id: "3", name: "3 Lives Saved", icon: "❤️", earned: false },
    { id: "4", name: "Quick Responder", icon: "⚡", earned: true },
  ],
  history: [
    { id: "1", date: "2024-01-15", type: "donation", status: "completed", location: "Central Hospital" },
    { id: "2", date: "2024-01-10", type: "donation", status: "completed", location: "City Medical Center" },
    { id: "3", date: "2024-01-05", type: "donation", status: "completed", location: "Emergency Clinic" },
  ],
  settings: {
    notifications: true,
    locationSharing: true,
    emergencyAlerts: true,
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const [user] = useState(mockUser);
  const [settings, setSettings] = useState(user.settings);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    // Handle logout logic
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-poppins font-semibold text-lg">Profile</h1>
          <p className="text-primary-foreground/80 text-sm">Manage your account</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-poppins font-semibold text-xl">{user.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={user.role === "donor" ? "bg-success" : "bg-primary"}>
                    {user.role === "donor" ? "Donor" : "Recipient"}
                  </Badge>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm">{user.bloodType}</span>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">{user.location}</span>
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  Member since {user.joinDate}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats for Donors */}
        {user.role === "donor" && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold font-poppins text-primary">{user.donationCount}</div>
                <div className="text-sm text-muted-foreground">Lives Saved</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold font-poppins text-success">
                  {user.badges.filter(b => b.earned).length}
                </div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Badges Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
            <CardDescription>Your impact and milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.badges.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-3">
                <div className={`text-2xl ${badge.earned ? 'opacity-100' : 'opacity-30'}`}>
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${badge.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {badge.name}
                  </div>
                </div>
                {badge.earned && (
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    Earned
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* History Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.history.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {item.type === "donation" ? "Blood Donation" : "Blood Request"}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-success text-success-foreground text-xs">
                    {item.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Settings Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Privacy & Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive alerts for new requests</div>
                </div>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Location Sharing</div>
                  <div className="text-sm text-muted-foreground">Allow anonymous location matching</div>
                </div>
              </div>
              <Switch
                checked={settings.locationSharing}
                onCheckedChange={(checked) => handleSettingChange("locationSharing", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Emergency Alerts</div>
                  <div className="text-sm text-muted-foreground">High priority emergency notifications</div>
                </div>
              </div>
              <Switch
                checked={settings.emergencyAlerts}
                onCheckedChange={(checked) => handleSettingChange("emergencyAlerts", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;