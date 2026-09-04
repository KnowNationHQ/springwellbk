"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const createUser = useMutation(api.users.create);
  const generateUploadUrl = useMutation(api.auth.generateUploadUrl);
  const saveProfileImage = useMutation(api.auth.saveProfileImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("");
  const [currency, setCurrency] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be under 4MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  }

  function removeAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!accountType) { setError("Please select an account type"); return; }
    if (!currency) { setError("Please select a currency"); return; }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const userId = await createUser({
        username,
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        accountType: accountType as "checking" | "savings" | "business",
        currency: currency as "USD" | "GBP" | "EUR",
      });

      if (avatarFile && userId) {
        try {
          const url = await generateUploadUrl();
          const result = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": avatarFile.type },
            body: avatarFile,
          });
          const { storageId } = await result.json();
          await saveProfileImage({ userId: userId as any, imageId: storageId });
        } catch (_) {}
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-blue-700">
            <Landmark className="h-7 w-7" />
            SpringWell Bank
          </Link>
          <p className="text-gray-500 mt-3 text-sm">Create your account in minutes</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-5 sm:p-7">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
                Account created! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-2">
                <div
                  className="relative group w-20 h-20 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <>
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeAvatar(); }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                      <Camera size={20} />
                      <span className="text-[10px] mt-0.5">Photo</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Optional profile photo</p>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">First Name *</Label>
                  <Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Last Name *</Label>
                  <Input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Username *</Label>
                <Input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" className="h-10" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Email *</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Account Type *</Label>
                  <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Currency *</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Password *</Label>
                <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-10" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Confirm Password *</Label>
                <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10" />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={loading || success}>
                {loading ? "Creating Account..." : "Open Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-700 hover:underline font-semibold">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
