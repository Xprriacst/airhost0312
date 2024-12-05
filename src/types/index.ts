import { z } from 'zod';
import { LucideIcon } from 'lucide-react';

export interface AIInstruction {
  id: string;
  propertyId: string;
  type: 'tone' | 'knowledge' | 'rules';
  content: string;
  isActive: boolean;
  priority: number;
}

export interface FAQItem {
  id: string;
  propertyId: string;
  question: string;
  answer: string;
  category: 'check-in' | 'check-out' | 'wifi' | 'parking' | 'house-rules' | 'general';
  isActive: boolean;
  lastUsed?: Date;
  useCount: number;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  accessCodes: {
    wifi: {
      name: string;
      password: string;
    };
    door: string;
  };
  houseRules: string[];
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  maxGuests: number;
  photos: string[];
  description?: string;
  parkingInfo?: string;
  restaurants?: string[];
  fastFood?: string[];
  emergencyContacts?: string[];
  additionalInfo?: {
    windows?: string;
    tv?: string;
    heating?: string;
    bikes?: string;
  };
  aiInstructions?: AIInstruction[];
  faq?: FAQItem[];
}

export type EmergencyTag = 
  | 'client_mecontent'
  | 'probleme_technique'
  | 'probleme_stock'
  | 'reponse_inconnue'
  | 'urgence';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sender: string;
}

export interface Conversation {
  id: string;
  propertyId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  messages: Message[];
  emergencyTags?: EmergencyTag[];
}

export interface EmergencyCase {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  isActive: boolean;
  severity: 'low' | 'medium' | 'high';
  autoDisablePilot: boolean;
  notifyHost: boolean;
  createdAt: Date;
}

export const emergencyCaseSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  severity: z.enum(['low', 'medium', 'high']),
  autoDisablePilot: z.boolean(),
  notifyHost: z.boolean()
});