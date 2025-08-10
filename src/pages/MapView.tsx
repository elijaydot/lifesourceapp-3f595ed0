import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Heart, AlertTriangle, Navigation, Search } from "lucide-react";
import Map from "@/components/Map";
import { supabase } from "@/integrations/supabase/client";

// Mock map data - in real app this would come from geolocation API
const mockPins = [
  {
    id: "1",
    type: "recipient" as "recipient" | "donor",
    bloodType: "O+",
    distance: "1.2 km",
    urgency: "high" as "high" | "medium" | "low",
    timeAgo: "5 min ago",
    lat: 40.7128,
    lng: -74.0060,
  },
  {
    id: "2",
    type: "donor" as "recipient" | "donor", 
    bloodType: "A+",
    distance: "0.8 km",
    urgency: "medium" as "high" | "medium" | "low",
    timeAgo: "10 min ago",
    lat: 40.7580,
    lng: -73.9855,
  },
  {
    id: "3",
    type: "recipient" as "recipient" | "donor",
    bloodType: "B-",
    distance: "2.1 km", 
    urgency: "low" as "high" | "medium" | "low",
    timeAgo: "15 min ago",
    lat: 40.7489,
    lng: -73.9857,
  },
];

const MapView = () => {
  const navigate = useNavigate();
  const [selectedPin, setSelectedPin] = useState<typeof mockPins[0] | null>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [userRole] = useState<"donor" | "recipient">("donor");
  const [mapToken, setMapToken] = useState<string | null>(null);
  const [userCenter, setUserCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get Mapbox token from Edge Function (public)
    supabase.functions.invoke("get-mapbox-token").then(({ data, error }) => {
      if (!error && data?.token) setMapToken(data.token);
    });
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCenter([pos.coords.longitude, pos.coords.latitude]);
      });
    }
  }, []);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handlePinClick = (pin: typeof mockPins[0]) => {
    setSelectedPin(pin);
  };

  const handleAcceptRequest = () => {
    if (selectedPin) {
      // Handle accepting blood request
      console.log("Accepting request:", selectedPin.id);
      // Show success message and navigate
      navigate("/dashboard");
    }
  };

  const handleRequestBlood = () => {
    // Handle creating blood request
    console.log("Creating blood request");
    navigate("/dashboard");
  };

  const getPinColor = (type: string, urgency: string) => {
    if (type === "recipient") {
      switch (urgency) {
        case "high": return "bg-destructive";
        case "medium": return "bg-orange-500";
        case "low": return "bg-yellow-500";
        default: return "bg-primary";
      }
    }
    return "bg-success";
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high": return "URGENT";
      case "medium": return "MODERATE";
      case "low": return "LOW";
      default: return "NORMAL";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center space-x-4 z-10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-poppins font-semibold text-lg">
            {userRole === "donor" ? "Blood Requests Nearby" : "Find Donors"}
          </h1>
          <p className="text-primary-foreground/80 text-sm">Tap pins to see details</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <Navigation className="w-5 h-5" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

{/* Map Area */}
      <div className="flex-1 relative bg-muted/20">
        {mapToken ? (
          <Map accessToken={mapToken} center={userCenter ?? [30, 15]} zoom={userCenter ? 12 : 3} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground text-sm">Map is loading...</p>
              <p className="text-muted-foreground text-xs">Add your Mapbox public token to enable the map.</p>
            </div>
          </div>
        )}


        {/* Mock Pins */}
        <div className="absolute inset-0 p-8">
          {mockPins.map((pin, index) => (
            <div
              key={pin.id}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                index === 0 ? "top-1/3 left-1/4" :
                index === 1 ? "top-1/2 left-3/4" :
                "top-2/3 left-1/2"
              }`}
              onClick={() => handlePinClick(pin)}
            >
              <div className={`w-6 h-6 rounded-full ${getPinColor(pin.type, pin.urgency)} border-2 border-white shadow-lg animate-pulse`}>
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  {pin.type === "recipient" ? (
                    <AlertTriangle className="w-3 h-3 text-white" />
                  ) : (
                    <Heart className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Pin Details */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="shadow-soft animate-scale-in">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${getPinColor(selectedPin.type, selectedPin.urgency)} flex items-center justify-center`}>
                      {selectedPin.type === "recipient" ? (
                        <AlertTriangle className="w-5 h-5 text-white" />
                      ) : (
                        <Heart className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-poppins font-semibold">
                          {selectedPin.type === "recipient" ? "Blood Needed" : "Donor Available"}
                        </span>
                        <Badge 
                          className={
                            selectedPin.urgency === "high" ? "bg-destructive text-destructive-foreground" :
                            selectedPin.urgency === "medium" ? "bg-orange-500 text-white" :
                            "bg-yellow-500 text-white"
                          }
                        >
                          {getUrgencyText(selectedPin.urgency)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Blood Type: {selectedPin.bloodType} • {selectedPin.distance} away
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedPin.timeAgo}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedPin(null)}
                  >
                    Close
                  </Button>
                  {userRole === "donor" && selectedPin.type === "recipient" && (
                    <Button 
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={handleAcceptRequest}
                    >
                      Accept Request
                    </Button>
                  )}
                  {userRole === "recipient" && selectedPin.type === "donor" && (
                    <Button 
                      className="flex-1"
                      onClick={handleRequestBlood}
                    >
                      Contact Donor
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emergency Request Button (for recipients) */}
        {userRole === "recipient" && (
          <div className="absolute top-4 right-4">
            <Button 
              className="bg-primary hover:bg-primary/90 shadow-soft"
              onClick={handleRequestBlood}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Request Blood
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="bg-card border-t p-4">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-sm font-medium">{mockPins.filter(p => p.type === "recipient").length}</div>
            <div className="text-xs text-muted-foreground">Active Requests</div>
          </div>
          <div>
            <div className="text-sm font-medium">{mockPins.filter(p => p.type === "donor").length}</div>
            <div className="text-xs text-muted-foreground">Available Donors</div>
          </div>
          <div>
            <div className="text-sm font-medium">2.5 km</div>
            <div className="text-xs text-muted-foreground">Search Radius</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;