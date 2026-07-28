import { createClient } from "@/lib/supabase/client";
import type {
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
} from "@/features/leads/types/lead.types";

const supabase = createClient();

export const leadService = {
  async getAll(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select("*, inventory:inventory_item_id(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Lead[]) ?? [];
  },

  async getById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from("leads")
      .select("*, inventory:inventory_item_id(name)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Lead;
  },

  async create(input: CreateLeadInput): Promise<Lead> {
    const { data, error } = await supabase
      .from("leads")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(input: UpdateLeadInput): Promise<Lead> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
  },
};
