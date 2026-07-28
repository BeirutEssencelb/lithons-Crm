export type OrderStatus =
  | "draft"
  | "confirmed"
  | "delivered"
  | "invoiced"
  | "paid";

export type InvoiceStatus = "unpaid" | "paid" | "overdue";

export interface OrderItem {
  id: string;
  order_id: string;
  inventory_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  client_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  order_items?: OrderItem[];
  client?: {
    first_name: string;
    last_name: string;
    email: string;
    company?: string;
  };
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  issued_at: string;
  due_at?: string;
  total_amount: number;
  status: InvoiceStatus;
}

export type CreateOrderInput = Omit<Order, "id" | "created_at" | "updated_at" | "order_items" | "client"> & {
  items: Array<{
    inventory_id: string;
    quantity: number;
    unit_price: number;
  }>;
};

export type UpdateOrderInput = Partial<
  Omit<Order, "id" | "created_at" | "updated_at" | "order_items" | "client">
> & { id: string };

/** Printable invoice structure */
export interface PrintableInvoice {
  invoice_number: string;
  issued_at: string;
  due_at?: string;
  from: { name: string; address?: string };
  to: { name: string; email: string; address?: string; company?: string };
  items: Array<{
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
}
