export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CompanyDetails {
  name: string;
  email: string;
  address: string;
  taxId: string;
}

export interface ClientDetails {
  name: string;
  email: string;
  address: string;
}

export interface Invoice {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: CompanyDetails;
  client: ClientDetails;
  items: LineItem[];
  currency: string;
  taxRate: number;
}
