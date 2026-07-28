import { LOW_STOCK_DEFAULT } from "@/features/inventory/types/inventory.types";

/** Default LITHOS slab catalog (31 products @ 50 slabs). */
export const DEFAULT_SLAB_PRODUCTS = [
  "Aviano (Avenza)",
  "Black Storm",
  "Botticino (Cloudy White)",
  "Cemento",
  "Calacatta Elba*",
  "Calacatta Lithos",
  "Calacatta Marina",
  "Calacatta Noir",
  "Calcutta Noir",
  "Calcutta Noir (Laza)",
  "Carrara capri",
  "Carrara White",
  "Diamante",
  "Florence Brown",
  "Grainy White",
  "Grosseto (Grey Lac)",
  "Massimo* (Chromo)",
  "Messina*",
  "Misterio Gold",
  "Nero Marquina",
  "Pompeii",
  "Pure White",
  "Sea Storm",
  "Skyline Gold",
  "Statuario Black",
  "Statuario brown",
  "Super White",
  "Taj Mahal",
  "Tuscany Concrete",
  "Vernazza",
  "White Sparkling Mirror",
] as const;

export const DEFAULT_SLAB_QUANTITY = 50;
export const DEFAULT_SLAB_LOW_STOCK = LOW_STOCK_DEFAULT;
