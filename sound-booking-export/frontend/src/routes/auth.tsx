import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "login" | "register" } => ({
    ...(search["mode"] === "register" ? { mode: "register" as const } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Login or Register — SoundWave Events" },
      {
        name: "description",
        content: "Sign in or create your SoundWave Events account to book sound systems and track your bookings.",
      },
      { property: "og:title", content: "Login or Register — SoundWave Events" },
      { property: "og:description", content: "Access your booking dashboard and manage your events." },
    ],
  }),
  component: AuthPage,
});

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[\d\s-]{10,15}$/, "Enter a valid mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState(mode ?? "login");
  const [busy, setBusy] = useState(false);
  

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: isAdmin ? "/admin" : "/dashboard", replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid login")) {
        toast.error("Wrong email or password. Try again or reset your password.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      password: String(form.get("password") ?? ""),
      confirm: String(form.get("confirm") ?? ""),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
      },
    });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("weak")) {
        toast.error("That password is too easy to guess. Use a longer, unique password.");
      } else if (msg.includes("already registered") || msg.includes("already been registered")) {
        toast.error("This email already has an account. Try logging in instead.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    if (data.session) {
      toast.success("Account created!");
      navigate({ to: "/dashboard" });
    } else {
      setTab("login");
      toast.success("Account created. You can log in now.");
    }
  }

  async function handleForgot() {
    const email = window.prompt("Enter your account email to receive a reset link:");
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent. Check your inbox.");
  }


  async function googleSignIn() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <PageShell>
      <section className="mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl">Your booking account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register to book sound systems, track status and see your history.
        </p>


        <Card className="surface-panel mt-8 p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input id="login-email" name="email" type="email" required maxLength={255} className="pl-9" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input id="login-password" name="password" type="password" required className="pl-9" placeholder="••••••••" />
                  </div>
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-stage text-primary-foreground hover:opacity-90">
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Login
                </Button>
                <button type="button" onClick={handleForgot} className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
                  Forgot password?
                </button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input id="reg-name" name="fullName" required maxLength={100} className="pl-9" placeholder="Rahul Kumar" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input id="reg-email" name="email" type="email" required maxLength={255} className="pl-9" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Mobile number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input id="reg-phone" name="phone" required maxLength={15} className="pl-9" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" name="password" type="password" required placeholder="Min 8 chars" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirm</Label>
                    <Input id="reg-confirm" name="confirm" type="password" required placeholder="Repeat" />
                  </div>
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-stage text-primary-foreground hover:opacity-90">
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" disabled={busy} onClick={googleSignIn}>
            Continue with Google
          </Button>
        </Card>
      </section>
    </PageShell>
  );
}
