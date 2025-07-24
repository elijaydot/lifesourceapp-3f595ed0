import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Shield, MapPin } from "lucide-react";

type UserRole = "donor" | "recipient" | null;
type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    bloodType: "" as BloodType,
    location: "",
    phone: "",
    consent: false,
  });

  const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    setStep(2);
  };

  const handleFormSubmit = () => {
    // Here we would normally save to backend
    console.log("User data:", { role: userRole, ...formData });
    
    // Navigate to dashboard
    navigate("/dashboard");
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.bloodType !== "" &&
      formData.location.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.consent
    );
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto shadow-soft">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-poppins text-foreground mb-2">
                Welcome to LifeSource
              </h1>
              <p className="text-muted-foreground text-base">
                Privacy-first Blood Matching.<br />
                Save Lives Anonymously.
              </p>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-4">
            <Card 
              className="cursor-pointer transition-all duration-200 hover:shadow-card hover:scale-105"
              onClick={() => handleRoleSelection("donor")}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-poppins font-semibold text-lg">I want to donate</h3>
                  <p className="text-muted-foreground text-sm">Help save lives by donating blood</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-200 hover:shadow-card hover:scale-105"
              onClick={() => handleRoleSelection("recipient")}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-poppins font-semibold text-lg">I need blood</h3>
                  <p className="text-muted-foreground text-sm">Find donors for emergency needs</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
              <Shield className="w-4 h-4" />
              <span>100% Anonymous</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>Location-based Matching</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="font-poppins text-2xl">
            {userRole === "donor" ? "Donor Registration" : "Recipient Registration"}
          </CardTitle>
          <CardDescription>
            Complete your profile to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodType">Blood Type</Label>
            <Select
              value={formData.bloodType}
              onValueChange={(value: BloodType) => setFormData({ ...formData, bloodType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your blood type" />
              </SelectTrigger>
              <SelectContent>
                {bloodTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter your city/area"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
            />
            <Label htmlFor="consent" className="text-sm">
              I agree to the privacy policy and terms of service
            </Label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={!isFormValid()}
              className="flex-1"
            >
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;