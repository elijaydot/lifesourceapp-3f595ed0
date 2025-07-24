import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Shield, MapPin } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Hero Card */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center space-y-6">
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

          {/* Feature highlights */}
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm bg-muted/30 rounded-lg p-3">
              <Shield className="w-4 h-4 text-accent" />
              <span>100% Anonymous</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm bg-muted/30 rounded-lg p-3">
              <MapPin className="w-4 h-4 text-success" />
              <span>Location-based Matching</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              className="w-full h-12 text-lg font-poppins font-semibold shadow-soft hover:shadow-card transition-all duration-200"
              onClick={() => navigate("/onboarding")}
            >
              Get Started
            </Button>
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Privacy Policy
            </p>
          </div>
        </div>

        {/* Bottom stats/trust indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 text-center border border-border/30">
            <div className="text-2xl font-bold font-poppins text-primary">24/7</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 text-center border border-border/30">
            <div className="text-2xl font-bold font-poppins text-success">Safe</div>
            <div className="text-xs text-muted-foreground">Secure</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
