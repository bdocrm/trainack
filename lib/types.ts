export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface System {
  id: string;
  name: string;
  description: string;
  version: string;
  features: Feature[];
  createdAt: string;
}

export interface Feature {
  id: string;
  systemId: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  clientId?: string;          // kept for legacy rows
  systemId: string;
  trainerId: string;
  sessionDate: string;
  location: string;
  coveredFeatureIds: string[];
  notes: string;
  status: 'pending' | 'signed';
  acknowledgments?: Acknowledgment[];
  createdAt: string;
}

export interface Acknowledgment {
  id: string;
  sessionId: string;
  clientName: string;
  campaign: string;
  position: string;
  clientSignature: string;
  acknowledgedAt: string;
  ipAddress?: string;
  agreeToTerms: boolean;
  comments?: string;
}
