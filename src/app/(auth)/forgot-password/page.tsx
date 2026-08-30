"use client";

import { useState } from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-green-700">
            <Landmark className="h-7 w-7" />
            SpringWell Bank
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                  If an account exists with {email}, you&apos;ll receive a reset link shortly.
                </div>
                <Link href="/login" className="text-green-700 hover:underline text-sm font-semibold">
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-bold">Reset Password</h2>
                  <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Send Reset Link</Button>
                <div className="text-center text-sm">
                  <Link href="/login" className="text-green-700 hover:underline">Back to Login</Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
