import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Bell, User, Activity, AlertTriangle } from "lucide-react";

// Mock user data - in real app this would come from auth/backend
const mockUser = {
  role: "donor" as "donor" | "recipient",
  name: "Alex Johnson",
  bloodType: "O+",
  location: "Downtown Area",
  status: "available" as "available" | "matched" | "unavailable",
  donationCount: 3,
  badgeCount: 2,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(mockUser);
  const [activeRequests] = useState([
    {
      id: "1",
      bloodType: "O+",
      distance: "1.2 km",
      urgency: "high" as "high" | "medium" | "low",
      timeAgo: "5 min ago",
    },
    {
      id: "2", 
      bloodType: "O+",
      distance: "2.8 km",
      urgency: "medium" as "high" | "medium" | "low",
      timeAgo: "12 min ago",
    },
  ]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-orange-500 text-white";
      case "low": return "bg-yellow-500 text-white";
      default: return "bg-muted";
    }
  };

  const handleEmergencyRequest = () => {
    // For recipients - create emergency request
    navigate("/map");
  };

  const handleViewMap = () => {
    navigate("/map");
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-poppins font-semibold text-lg">LifeSource</h1>
              <p className="text-primary-foreground/80 text-sm">Welcome back, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleViewProfile}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Status Card */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-lg">
                    {user.role === "donor" ? "Donor Status" : "Recipient Status"}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={
                        user.status === "available" 
                          ? "bg-success text-success-foreground" 
                          : user.status === "matched"
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted"
                      }
                    >
                      {user.status === "available" ? "Available" : user.status === "matched" ? "Matched" : "Unavailable"}
                    </Badge>
                    <span className="text-muted-foreground text-sm">Blood Type: {user.bloodType}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.location}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          {user.role === "recipient" ? (
            <Card className="cursor-pointer hover:shadow-card transition-all duration-200" onClick={handleEmergencyRequest}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-lg text-primary">Emergency Blood Request</h3>
                    <p className="text-muted-foreground text-sm">Find nearby donors instantly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="cursor-pointer hover:shadow-card transition-all duration-200" onClick={handleViewMap}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-success-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-lg text-success">View Nearby Requests</h3>
                    <p className="text-muted-foreground text-sm">See who needs your help</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Requests (for donors) */}
        {user.role === "donor" && activeRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-poppins font-semibold text-xl">Active Requests Near You</h2>
            {activeRequests.map((request) => (
              <Card key={request.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Blood Type: {request.bloodType}</span>
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{request.distance} away</span>
                          <span>{request.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Decline
                      </Button>
                      <Button size="sm">
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats for donors */}
        {user.role === "donor" && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold font-poppins text-primary">{user.donationCount}</div>
                <div className="text-sm text-muted-foreground">Lives Saved</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold font-poppins text-success">{user.badgeCount}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;