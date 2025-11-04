"use client";

import Link from "next/link";
import { Mail, FileText, Eye, Archive } from "lucide-react";
import { Inquiry } from "../../../lib/inquiries";

interface InquiryRowProps {
  inquiry: Inquiry;
  onStatusChange?: (id: string, status: string) => void;
}

export function InquiryRow({ inquiry, onStatusChange }: InquiryRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800";
      case "READ":
        return "bg-green-100 text-green-800";
      case "ARCHIVED":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const listingTitle =
    inquiry.listing?.property?.address?.title ||
    inquiry.listing?.property?.propertyType ||
    "Listing";

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition">
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-slate-900">{inquiry.fullName}</div>
          <div className="text-sm text-slate-600 flex items-center gap-1 mt-1">
            <Mail className="h-3 w-3" />
            {inquiry.email}
          </div>
          {inquiry.phone && (
            <div className="text-xs text-slate-500 mt-1">{inquiry.phone}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-900 max-w-xs truncate">
          {listingTitle}
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
            inquiry.status
          )}`}
        >
          {inquiry.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {formatDate(inquiry.createdAt)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/inquiries/${inquiry.id}`}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {inquiry.status !== "ARCHIVED" && (
            <button
              onClick={() => onStatusChange?.(inquiry.id, "ARCHIVED")}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

