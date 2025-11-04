"use client";

import { User, Mail, Phone } from "lucide-react";

interface BrokerCardProps {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export function BrokerCard({ name, email, phone, avatar }: BrokerCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-8 w-8" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-semibold text-slate-900">{name}</h3>
            <p className="text-xs text-slate-500">Verified Broker</p>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <a
                href={`mailto:${email}`}
                className="hover:text-primary hover:underline"
              >
                {email}
              </a>
            </div>
            {phone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                <a
                  href={`tel:${phone}`}
                  className="hover:text-primary hover:underline"
                >
                  {phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

