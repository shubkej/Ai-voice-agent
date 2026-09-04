export type ProductCategory = 
  | 'Industrial Machinery' 
  | 'Fabrication & Cutting' 
  | 'Power Tools & Hardware' 
  | 'Spares, Bearings & Fittings';

export interface CatalogItem {
  id: string;
  name: string;
  category: ProductCategory;
  modelCode: string;
  shortDesc: string;
  specifications: {
    capacity?: string;
    power?: string;
    dimensions?: string;
    precision?: string;
    warranty: string;
  };
  priceRange: string;
  demoAvailable: boolean;
  stockStatus: 'In Stock' | 'Fast Ship (3-5 days)' | 'Custom Build (2-3 weeks)';
  highlights: string[];
}

export interface QuoteRequest {
  id: string;
  companyName: string;
  contactPhone: string;
  machineOrItem: string;
  specifications?: string;
  quantity?: string | number;
  deliveryLocation?: string;
  notes?: string;
  status: 'Pending Review' | 'Quotation Sent' | 'Follow-up Scheduled';
  createdAt: string;
}

export interface DemoBooking {
  id: string;
  companyName: string;
  contactPhone: string;
  machineModel: string;
  preferredDate: string;
  facilityLocation: string;
  trialScope?: string;
  status: 'Confirmed' | 'Technician Assigned' | 'Pending Scheduling';
  createdAt: string;
}

export interface ServiceTicket {
  id: string;
  companyName: string;
  contactPhone: string;
  machineModel: string;
  issueDescription: string;
  preferredDate?: string;
  urgency: 'Routine Service' | 'Priority Repair' | 'Emergency Breakdown';
  status: 'Open' | 'Dispatched' | 'Resolved';
  createdAt: string;
}

export interface TranscriptItem {
  id: string;
  speaker: 'adesh' | 'caller' | 'system';
  text: string;
  timestamp: string;
  isPartial?: boolean;
}

export type CallState = 
  | 'idle' 
  | 'connecting' 
  | 'connected' 
  | 'speaking' 
  | 'listening' 
  | 'interrupted' 
  | 'ended' 
  | 'error';

export interface ActivityLog {
  id: string;
  type: 'quote' | 'demo' | 'service' | 'info';
  title: string;
  details: string;
  time: string;
}
