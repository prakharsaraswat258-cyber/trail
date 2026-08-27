import React from "react";
import { MessageSquare, Mail, Phone, UserCheck } from "lucide-react";
import { ContactMethod } from "@/lib/types/foundItem";
import { Input } from "@/components/ui/Input";

interface ContactMethodFieldsProps {
  method: ContactMethod;
  detail: string;
  onMethodChange: (method: ContactMethod) => void;
  onDetailChange: (detail: string) => void;
  error?: string;
}

export const ContactMethodFields: React.FC<ContactMethodFieldsProps> = ({
  method,
  detail,
  onMethodChange,
  onDetailChange,
  error,
}) => {
  const methods: { id: ContactMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: "in_app_chat",
      label: "In-app Chat",
      icon: <MessageSquare className="w-4 h-4 text-accent" />,
      desc: "Protected anonymous student chat",
    },
    {
      id: "email",
      label: "Student Email",
      icon: <Mail className="w-4 h-4 text-accent" />,
      desc: "Campus .edu email address",
    },
    {
      id: "phone",
      label: "Phone Number",
      icon: <Phone className="w-4 h-4 text-accent" />,
      desc: "Direct SMS or call",
    },
  ];

  return (
    <div className="w-full space-y-4" id="contact-section">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-text-primary">
          Finder Contact Method <span className="text-accent">*</span>
        </label>
        <span className="text-xs text-text-muted">How owner reaches you</span>
      </div>

      {/* Radio Group */}
      <div
        role="radiogroup"
        aria-label="Preferred Contact Method"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      >
        {methods.map((item) => {
          const isSelected = method === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onMethodChange(item.id)}
              className={`min-h-[52px] p-3 text-left rounded-lg border transition-all flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? "bg-accent-light border-accent text-text-primary font-semibold shadow-sm"
                  : "bg-surface border-border-strong text-text-secondary hover:bg-surface-alt"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {item.icon}
                <span className="text-xs font-semibold text-text-primary">{item.label}</span>
              </div>
              <span className="text-[11px] text-text-muted leading-tight">{item.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Conditional Inputs based on Method */}
      {method === "in_app_chat" && (
        <div className="p-3.5 rounded-lg bg-surface-alt border border-border flex items-center gap-2.5 text-xs text-text-secondary">
          <UserCheck className="w-4 h-4 text-success flex-shrink-0" />
          <span>
            Connected to your active verified student account. Owners will reach you safely via Penga encrypted chat.
          </span>
        </div>
      )}

      {method === "email" && (
        <div className="pt-1">
          <Input
            id="finder-email-input"
            type="email"
            label="Your Campus Email"
            required
            placeholder="e.g. jdoe@umass.edu"
            value={detail}
            onChange={(e) => onDetailChange(e.target.value)}
            error={error}
            helperText="We will only share this once a claim is verified."
          />
        </div>
      )}

      {method === "phone" && (
        <div className="pt-1">
          <Input
            id="finder-phone-input"
            type="tel"
            label="Your Phone Number"
            required
            placeholder="e.g. (555) 019-2834"
            value={detail}
            onChange={(e) => onDetailChange(e.target.value)}
            error={error}
            helperText="Direct number for verified handoff coordination."
          />
        </div>
      )}
    </div>
  );
};
