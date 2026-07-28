export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
}

export type CreateInventoryInput = {
  name: string;
  quantity?: number;
  low_stock_threshold?: number;
};

export type UpdateInventoryInput = Partial<CreateInventoryInput> & {
  id: string;
};

export interface StockAlert {
  id: string;
  name: string;
  quantity: number;
  low_stock_threshold: number;
}

export const LOW_STOCK_DEFAULT = 5;
