"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Building2, Shield } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Globe, title: "Wherever You Are", description: "We help you manage your cash flow no matter where you are." },
  { icon: Building2, title: "Direct to Your Account", description: "Funds deposited into your bank account within one business day." },
  { icon: Shield, title: "Fast and Secure", description: "Affordable payments with bank-level security." },
];

export default function LoanPage() {
  const createApplication = useMutation(api.loanApplications.create);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Please login first");
      return;
    }

    try {
      await createApplication({
        userId: userId as Id<"users">,
        amount: Number(amount),
        purpose,
        fullName,
        gender: "male",
        dateOfBirth: "2000-01-01",
        email,
        phone,
        address,
        city,
        state: "",
        postalCode: "",
        employmentStatus,
        monthlyIncome: monthlyIncome || undefined,
      });
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-blue-800 text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-blue-300 text-sm mb-2">15-Minutes Transfer Upon Approval</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Getting <span className="text-blue-400">Money</span> is now as easy as spending.
          </h1>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {features.map((f) => (
              <div key={f.title} className="text-center p-5">
                <f.icon className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.description}</p>
              </div>
            ))}
          </div>

          <hr className="mb-10" />

          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-1">Apply Now</h2>
            <p className="text-gray-500 text-sm mb-6">Fill out an application form</p>

            {success && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded text-sm mb-4">
                Your application has been submitted successfully!
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-4">
                {error}
                {error === "Please login first" && (
                  <Link href="/login" className="underline ml-2 font-semibold">Login here</Link>
                )}
              </div>
            )}

            <Card className="shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Loan Amount *</Label>
                      <Input type="number" placeholder="Enter amount" required value={amount} onChange={(e) => setAmount(e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Purpose *</Label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="car">Car Purchase</SelectItem>
                          <SelectItem value="home">Home Purchase</SelectItem>
                          <SelectItem value="investment">Investments</SelectItem>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Full Name *</Label>
                    <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Email *</Label>
                      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Phone *</Label>
                      <Input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Address *</Label>
                    <Input required value={address} onChange={(e) => setAddress(e.target.value)} className="h-10" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">City *</Label>
                      <Input required value={city} onChange={(e) => setCity(e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Employment Status *</Label>
                      <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fulltime">Full Time</SelectItem>
                          <SelectItem value="parttime">Part Time</SelectItem>
                          <SelectItem value="self">Self Employed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Monthly Income</Label>
                    <Input value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} className="h-10" />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11">Submit Application</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
