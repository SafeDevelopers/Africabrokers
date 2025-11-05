"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface FormData {
  title: string;
  category: string;
  price: string;
  location: string;
  description: string;
}

export default function NewListingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const redirectAttemptedRef = useRef(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    price: "",
    location: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Check if user is authenticated (either via context or cookies)
  const isAuthenticated = () => {
    // Check auth context first
    if (user && user.role === "broker") {
      return true;
    }
    
    // Fallback to cookie check (for cookie-based auth)
    if (typeof document !== "undefined") {
      const role = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("afribrok-role="))
        ?.split("=")[1];
      return role === "BROKER" || role === "broker";
    }
    
    return false;
  };

  // Redirect if not broker once auth is loaded - only once
  useEffect(() => {
    if (isLoading) return; // Wait for auth to finish loading
    if (redirectAttemptedRef.current) return; // Already attempted redirect
    
    if (!isAuthenticated()) {
      redirectAttemptedRef.current = true;
      router.replace("/broker/signin?redirect=/listings/new");
    }
  }, [user, isLoading]);

  // Show loading if checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show loading (redirect is happening)
  if (!isAuthenticated()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Replace with API call using api() hook
      // await api('/v1/brokers/listings', {
      //   method: 'POST',
      //   body: JSON.stringify(formData),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to broker listings page
      router.push("/broker/listings");
    } catch (error) {
      console.error("Failed to create listing:", error);
      alert("Failed to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/broker/listings"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Listing</h1>
            <p className="mt-2 text-sm text-slate-600">
              Add a new property listing to your portfolio
            </p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                errors.title
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-primary focus:ring-primary"
              }`}
              placeholder="Enter listing title"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                errors.category
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-primary focus:ring-primary"
              }`}
            >
              <option value="">Select category</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="industrial">Industrial</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                errors.price
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-primary focus:ring-primary"
              }`}
              placeholder="Enter price"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                errors.location
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-primary focus:ring-primary"
              }`}
              placeholder="Enter location"
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition ${
                errors.description
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-primary focus:ring-primary"
              }`}
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/broker/listings"
            className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              "Creating..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Listing
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}

