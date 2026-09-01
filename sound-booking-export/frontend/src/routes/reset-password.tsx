import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — SoundWave Events" },
      { name: "description", content: "Choose a new password for your SoundWave Events booking account." },
      { property: "og:title", content: "Set a New Password" },
      { property: "og:description", content: "Complete your password reset for SoundWave Events." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      toast.error("Password needs 8+ characters with a letter and a number");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-md px-4 py-20 sm:px-6">
        <h1 className="font-display text-4xl">Set a new password</h1>
        <Card className="surface-panel mt-8 p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" required placeholder="Min 8 characters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" name="confirm" type="password" required placeholder="Repeat password" />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-stage text-primary-foreground hover:opacity-90">
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Update password
            </Button>
          </form>
        </Card>
      </section>
    </PageShell>
  );
}
