import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = mode === 'signin' ? 'Sign In - LifeSource' : 'Create Account - LifeSource';

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) navigate("/dashboard", { replace: true });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [mode, navigate]);

  const handleSignin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Signed in", description: "Welcome back!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "Confirm your address to finish sign up." });
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader>
          <CardTitle className="font-poppins">{mode === 'signin' ? 'Welcome back' : 'Create account'}</CardTitle>
          <CardDescription>
            {mode === 'signin' ? 'Sign in to continue' : 'Join LifeSource to help save lives'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {mode === 'signin' ? (
            <Button className="w-full" onClick={handleSignin} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          ) : (
            <Button className="w-full" onClick={handleSignup} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          )}
          <Button variant="ghost" className="w-full" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? "New here? Create an account" : "Have an account? Sign in"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
