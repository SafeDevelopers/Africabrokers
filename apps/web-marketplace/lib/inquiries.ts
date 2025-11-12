/**
 * API utility for inquiries
 * Uses the api() helper which automatically adds X-Tenant header
 */

import { api } from './api';

export interface CreateInquiryPayload {
  listingId: string;
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  captchaToken?: string;
}

export interface Inquiry {
  id: string;
  tenantId: string;
  listingId: string;
  brokerUserId: string;
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  source: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  lastBrokerView?: string;
  brokerNotes?: string;
  listing?: {
    id: string;
    property?: {
      id: string;
      address?: any;
      propertyType?: string;
    };
  };
}

export interface InquiryListResponse {
  items: Inquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListInquiriesParams {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface UpdateInquiryPayload {
  status?: 'NEW' | 'READ' | 'ARCHIVED';
  brokerNotes?: string;
}

/**
 * Create a new inquiry (public endpoint)
 * This is a public endpoint - no Authorization header should be added
 * If it returns 401/403, show a friendly message to the user
 */
export async function createInquiry(payload: CreateInquiryPayload): Promise<{ id: string }> {
  try {
    return await api('/v1/public/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error: any) {
    // Handle 401/403 with friendly message
    if (error?.status === 401 || error?.status === 403) {
      throw new Error('Please sign in to contact brokers. Some features require authentication.');
    }
    throw error;
  }
}

/**
 * List inquiries for authenticated broker
 */
export async function listInquiries(params: ListInquiriesParams = {}): Promise<InquiryListResponse> {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set('status', params.status);
  if (params.q) queryParams.set('q', params.q);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());

  const query = queryParams.toString();
  return api(`/v1/broker/inquiries${query ? `?${query}` : ''}`);
}

/**
 * Get inquiry by ID
 */
export async function getInquiry(id: string): Promise<Inquiry> {
  return api(`/v1/broker/inquiries/${id}`);
}

/**
 * Update inquiry (status, notes)
 */
export async function updateInquiry(
  id: string,
  payload: UpdateInquiryPayload,
): Promise<Inquiry> {
  return api(`/v1/broker/inquiries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

