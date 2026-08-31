"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export function ContactSection() {
  const sendMessage = useMutation(api.messages.create);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await sendMessage({ name, email, subject, message });
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError("Failed to send message. Please try again.");
    }
  }

  return (
    <section id="contact" className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-green-600 text-sm font-medium mb-2">Get in Touch</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Contact Us</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <img src="/images/contact.svg" alt="" aria-hidden className="w-full h-40 object-cover rounded-xl" />
            {[
              { icon: Mail, label: "Email", value: "support@springwellbk.com", href: "mailto:support@springwellbk.com" },
              { icon: Phone, label: "Phone", value: "+1 (555) 123-4567", href: "tel:+15551234567" },
              { icon: MapPin, label: "Address", value: "123 Banking St, New York, NY 10001", href: null },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <c.icon className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-medium hover:text-green-700 transition-colors">{c.value}</a>
                  ) : (
                    <p className="text-sm font-medium">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <h3 className="font-bold text-lg mb-4">Send a Message</h3>
              {success && <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded">Message sent successfully!</p>}
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input required value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subject</Label>
                  <Input required value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10" />
                </div>
                <div>
                  <Label className="text-xs">Message</Label>
                  <textarea
                    className="w-full min-h-[100px] border border-input bg-background px-3 py-2 rounded-md text-sm"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-10">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
