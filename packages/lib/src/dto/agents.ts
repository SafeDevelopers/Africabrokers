import { z } from 'zod';

export const CreateAgentApplicationSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationType: z.string().optional(),
  orgType: z.string().optional(),
  orgTypeNotes: z.string().optional(),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  primaryContact: z.object({
    name: z.string().min(1, 'Primary contact name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Primary contact phone is required'),
  }),
  secondaryContact: z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
    })
    .optional(),
  teamSize: z.string().min(1, 'Team size is required'),
  coverageAreas: z.array(z.string()).min(1, 'At least one coverage area is required'),
  previousExperience: z.string().min(1, 'Previous experience is required'),
  complianceStandards: z.array(z.string()).optional(),
});

export type CreateAgentApplicationDto = z.infer<typeof CreateAgentApplicationSchema>;

