"use client";
import { useState, type FormEvent } from "react";
import { mailLink, site, whatsappLink } from "@/content/site";

type Status = { kind: "idle" | "sending" | "error" | "handoff" | "sent"; message?: string };

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

async function post(endpoint: string, data: Record<string, string>) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(String(res.status));
}

export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<typeof values>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const body = `${values.message}\n\nFrom: ${values.name} (${values.email})`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Partial<typeof values> = {};
    if (values.name.trim().length < 2) next.name = "Enter your name.";
    if (!isEmail(values.email)) next.email = "Enter an email address like name@example.com.";
    if (values.message.trim().length < 10) next.message = "Write at least 10 characters so we know how to help.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`contact-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    if (!site.contactEndpoint) {
      setStatus({ kind: "handoff" });
      window.location.href = mailLink(`Website message from ${values.name}`, body);
      return;
    }
    setStatus({ kind: "sending" });
    try {
      await post(site.contactEndpoint, values);
      setStatus({ kind: "sent" });
    } catch {
      setStatus({ kind: "error", message: `Your message didn't send. Check your connection and try again, or email ${site.email}.` });
    }
  };

  if (status.kind === "sent") {
    return <div className="form-result" role="status"><h3>Message sent</h3><p>Thanks, {values.name}. We'll reply to {values.email}.</p><button className="btn" onClick={() => { setValues({ name: "", email: "", message: "" }); setStatus({ kind: "idle" }); }}>Send another message</button></div>;
  }
  if (status.kind === "handoff") {
    return (
      <div className="form-result" role="status">
        <h3>Your email app is opening</h3>
        <p>Your message is written and ready. Press send there to reach us. If nothing opened, send it on WhatsApp instead.</p>
        <div className="row">
          <a className="btn" href={whatsappLink(body)} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
          <button className="btn btn-ghost" onClick={() => setStatus({ kind: "idle" })}>Edit message</button>
        </div>
      </div>
    );
  }

  const field = (name: keyof typeof values, label: string, type = "text") => (
    <div className="field">
      <label htmlFor={`contact-${name}`}>{label}</label>
      {name === "message" ? (
        <textarea id={`contact-${name}`} rows={5} value={values[name]} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `err-${name}` : undefined} onChange={(e) => setValues({ ...values, [name]: e.target.value })} />
      ) : (
        <input id={`contact-${name}`} type={type} autoComplete={name} value={values[name]} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `err-${name}` : undefined} onChange={(e) => setValues({ ...values, [name]: e.target.value })} />
      )}
      {errors[name] && <p className="field-error" id={`err-${name}`}>{errors[name]}</p>}
    </div>
  );

  return (
    <form className="form" onSubmit={submit} noValidate>
      {field("name", "Your name")}
      {field("email", "Email address", "email")}
      {field("message", "Message")}
      {status.kind === "error" && <p className="field-error" role="alert">{status.message}</p>}
      <button className="btn" disabled={status.kind === "sending"}>{status.kind === "sending" ? "Sending…" : "Send message"}</button>
    </form>
  );
}

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setStatus({ kind: "error", message: "Enter an email address like name@example.com." });
      return;
    }
    if (!site.newsletterEndpoint) {
      setStatus({ kind: "handoff" });
      window.location.href = mailLink("Add me to the Kwirky news list", `Please send Kwirky news to ${email}.`);
      return;
    }
    setStatus({ kind: "sending" });
    try {
      await post(site.newsletterEndpoint, { email });
      setStatus({ kind: "sent" });
    } catch {
      setStatus({ kind: "error", message: "That didn't go through. Try again in a moment." });
    }
  };

  if (status.kind === "sent") return <p role="status">You're on the list.</p>;
  if (status.kind === "handoff") return <p role="status">Your email app is opening with the request ready. Press send to join the list.</p>;
  return (
    <form onSubmit={submit} noValidate className="news-form">
      <label htmlFor="news-email">Email address</label>
      <div className="news-row">
        <input id="news-email" type="email" autoComplete="email" value={email} aria-invalid={status.kind === "error"} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-lime" disabled={status.kind === "sending"}>Join</button>
      </div>
      {status.kind === "error" && <p className="field-error" role="alert">{status.message}</p>}
    </form>
  );
}
