"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card className="w-full max-w-md border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
          Connexion
        </p>
        <h1 className="text-2xl font-semibold text-slate-950">Accéder au dashboard</h1>
      </div>
      <form className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
          Se connecter
        </Button>
      </form>
    </Card>
  );
}
