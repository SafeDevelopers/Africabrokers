/**
 * Form validation schemas using Zod
 * Shared validation logic between frontend and backend
 */

import { z } from 'zod';

// Broker schemas
export const createBrokerSchema = z.object({
  licenseNumber: z.string().min(1, 'License number is required'),
  businessName: z.string().optional(),
});

export const submitBrokerSchema = z.object({
  documentUrls: z.object({
    licenseUrl: z.string().url('Valid license document URL required'),
    idUrl: z.string().url('Valid ID document URL required'),
    selfieUrl: z.string().url('Valid selfie URL required'),
  }),
});

export const reviewDecisionSchema = z.object({
  decision: z.enum(['approved', 'denied', 'needs_more_info'], {
    required_error: 'Decision is required',
  }),
  notes: z.string().optional(),
});

// Listing schemas
export const createListingSchema = z.object({
  propertyId: z.string().uuid('Valid property ID required'),
  priceAmount: z.number().positive('Price must be positive'),
  priceCurrency: z.string().length(3, 'Currency must be 3 characters'),
  availabilityStatus: z.enum(['active', 'pending_review']).optional(),
  featured: z.boolean().optional(),
});

export const searchListingsSchema = z.object({
  search: z.string().optional(),
  propertyType: z.enum(['residential', 'commercial', 'land']).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  district: z.string().optional(),
  availability: z.enum(['active', 'pending_review', 'suspended']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Auth schemas
export const roleSelectionSchema = z.object({
  role: z.enum([
    'certified_broker',
    'agency', 
    'individual_seller',
    'inspector',
    'regulator',
    'admin'
  ], {
    required_error: 'Role selection is required',
  }),
});

// Property schemas  
export const createPropertySchema = z.object({
  type: z.enum(['residential', 'commercial', 'land']),
  address: z.object({
    street: z.string().min(1, 'Street address required'),
    subcity: z.string().min(1, 'Subcity required'),
    city: z.string().min(1, 'City required'),
    region: z.string().min(1, 'Region required'),
    country: z.string().min(1, 'Country required'),
    postalCode: z.string().optional(),
  }),
  ownershipProofUrl: z.string().url().optional(),
});

// Complaint schemas
export const complaintSchema = z.object({
  targetType: z.enum(['broker', 'listing']),
  targetId: z.string().uuid(),
  category: z.string().min(1, 'Category is required'),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

// Export types
export type CreateBrokerInput = z.infer<typeof createBrokerSchema>;
export type SubmitBrokerInput = z.infer<typeof submitBrokerSchema>;
export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
export type RoleSelectionInput = z.infer<typeof roleSelectionSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;