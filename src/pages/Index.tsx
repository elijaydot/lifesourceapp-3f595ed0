import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Shield, MapPin } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-soft">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-poppins text-foreground mb-2">
              LifeSource
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Privacy-first Blood Matching
            </p>
            <p className="text-base text-muted-foreground">
              Save Lives Anonymously
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
            <Shield className="w-4 h-4" />
            <span>100% Anonymous</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4" />
            <span>Location-based Matching</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full h-12 text-lg font-poppins font-semibold"
            onClick={() => navigate("/onboarding")}
          >
            Get Started
          </Button>
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
