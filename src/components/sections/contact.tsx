"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";

export function ContactSection() {
  const t = useT();
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
      setError(t("contact.error"));
    }
  }

  return (
    <section id="contact" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-wide text-[#426FB6] mb-2">{t("contact.eyebrow")}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("contact.heading")}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <img src="/images/contact.jpeg" alt="Contact SpringWell Bank" className="rounded-2xl w-full h-48 object-cover mb-6 shadow" />
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Phone, label: "Phone number", value: "+1 (555) 123-4567" },
                { icon: Mail, label: "Email", value: "support@springwellbk.com", href: "mailto:support@springwellbk.com" },
                { icon: MapPin, label: "Address", value: "3250 Pennsylvania Avenue NW" },
                { icon: MessageCircle, label: "Live Chat", value: "Start now", href: "#" },
              ].map((c) => (
                <div key={c.label} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-[#426FB6]/10 rounded-lg flex items-center justify-center mb-3">
                    <c.icon className="h-5 w-5 text-[#426FB6]" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-medium text-gray-900 hover:text-[#426FB6] transition-colors">{c.value}</a>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{c.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">Get In Touch</h3>
            {success && <p className="text-[#426FB6] text-sm mb-4 bg-blue-50 p-3 rounded">{t("contact.success")}</p>}
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">{t("contact.subject")}</Label>
                <Input required value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10 border-gray-300" placeholder="Subject" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">{t("contact.name")}</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} className="h-10 border-gray-300" />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">{t("contact.email")}</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 border-gray-300" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">{t("contact.message")}</Label>
                <textarea
                  className="w-full min-h-[100px] border border-gray-300 bg-white px-3 py-2 rounded-md text-sm"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-[#426FB6] hover:bg-[#3560a0] text-white h-10">{t("contact.send")}</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
