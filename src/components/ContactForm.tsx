"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Er ging iets mis. Probeer het opnieuw.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Onbekende fout");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-ink/10 bg-paper p-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rebu-green/10">
            <CheckCircle className="h-8 w-8 text-rebu-green" />
          </div>
          <h3 className="mt-4 font-display text-2xl font-medium text-ink">Bericht verstuurd!</h3>
          <p className="mt-2 text-ink-soft">
            Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="btn-secondary mt-6"
          >
            Nieuw bericht versturen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-ink/10 bg-paper p-8 sm:p-10">
      <h2 className="font-display text-2xl font-medium text-ink">
        Stuur ons een bericht
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Vul het formulier in en we reageren meestal binnen een paar uur.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
            Naam <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Uw volledige naam"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
            E-mailadres <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="naam@voorbeeld.nl"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium text-ink">
            Telefoonnummer
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            placeholder="+31 6 12345678"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
            Bericht <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            placeholder="Waar kunnen wij u mee helpen?"
            className="input resize-y"
          />
        </div>

        {status === "error" && (
          <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Versturen...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Verstuur bericht
            </>
          )}
        </button>
      </form>
    </div>
  );
}
