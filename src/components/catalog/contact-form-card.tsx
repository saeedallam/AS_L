"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function ContactFormCard({ locale }: { locale: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Time-trap: real people take a few seconds to fill the form, bots don't.
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const fieldError = (key: string) =>
    fieldErrors[key] ? (
      <p id={`cf-${key}-error`} className="mt-1 text-xs font-bold text-red-600">
        {fieldErrors[key]}
      </p>
    ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setFeedback("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          website_honeypot: honeypot,
          elapsed_ms: Date.now() - openedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setFieldErrors(data.fieldErrors ?? {});
        setFeedback(
          data.error ||
            (locale === "en"
              ? "Please check your input and try again."
              : "يرجى التأكد من صحة البيانات والمحاولة مرة أخرى."),
        );
        return;
      }

      setStatus("success");
      setFeedback(
        data.message ||
          (locale === "en"
            ? "Your message has been sent to Asmaa Model Library."
            : "تم إرسال رسالتك بنجاح إلى مكتبة أسماء النموذجية."),
      );
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      openedAt.current = Date.now();
    } catch {
      setStatus("error");
      setFeedback(
        locale === "en"
          ? "Connection error. Please try again."
          : "حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
      );
    }
  };

  return (
    <form
      noValidate
      aria-busy={status === "submitting"}
      onSubmit={handleSubmit}
      className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8"
    >
      <h2 className="text-xl font-extrabold text-navy">
        {locale === "en" ? "Send Us a Message" : "أرسل لنا رسالة"}
      </h2>
      <p className="mt-1 text-xs text-muted-text">
        {locale === "en"
          ? "Have an inquiry about a product or school list? Send it directly here."
          : "للاستفسار عن منتج أو تجهيز قائمة مدرسية، أرسل رسالتك وسنرد عليك في أقرب وقت."}
      </p>

      {/* Hidden Honeypot field for spam protection */}
      <input
        type="text"
        name="website_honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
      />

      {status === "success" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-900">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="cf-name"
            className="mb-1.5 block text-xs font-bold text-navy"
          >
            {locale === "en" ? "Full Name *" : "الاسم الكامل *"}
          </label>
          <input
            id="cf-name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "cf-name-error" : undefined}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-line bg-page px-3.5 py-2.5 text-sm text-ink focus:border-blue focus:outline-none"
          />
          {fieldError("name")}
        </div>

        <div>
          <label
            htmlFor="cf-phone"
            className="mb-1.5 block text-xs font-bold text-navy"
          >
            {locale === "en" ? "Phone Number *" : "رقم الهاتف *"}
          </label>
          <input
            id="cf-phone"
            type="tel"
            required
            dir="ltr"
            minLength={7}
            maxLength={25}
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "cf-phone-error" : undefined}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-line bg-page px-3.5 py-2.5 text-end text-sm text-ink focus:border-blue focus:outline-none"
          />
          {fieldError("phone")}
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="cf-email"
          className="mb-1.5 block text-xs font-bold text-navy"
        >
          {locale === "en"
            ? "Email (Optional)"
            : "البريد الإلكتروني (اختياري)"}
        </label>
        <input
          id="cf-email"
          type="email"
          dir="ltr"
          maxLength={254}
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "cf-email-error" : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-line bg-page px-3.5 py-2.5 text-end text-sm text-ink focus:border-blue focus:outline-none"
        />
        {fieldError("email")}
      </div>

      <div className="mt-4">
        <label
          htmlFor="cf-message"
          className="mb-1.5 block text-xs font-bold text-navy"
        >
          {locale === "en" ? "Message *" : "نص الرسالة أو الاستفسار *"}
        </label>
        <textarea
          id="cf-message"
          rows={4}
          required
          minLength={5}
          maxLength={2000}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "cf-message-error" : undefined}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-line bg-page px-3.5 py-2.5 text-sm text-ink focus:border-blue focus:outline-none"
        />
        {fieldError("message")}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 text-sm font-bold text-white transition-colors hover:bg-navy-deep disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        <span>{locale === "en" ? "Send Message" : "إرسال الرسالة"}</span>
      </button>
    </form>
  );
}
