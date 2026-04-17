import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side (anon key, RLS enforced)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side (service role, bypasses RLS)
export function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export type Project = {
  id: string;
  slug: string;
  title: string;
  location: string;
  year: string;
  category: string;
  products: string[];
  summary: string;
  description: string;
  cover: string;
  images: string[];
  review_name: string | null;
  review_text: string | null;
  review_rating: number;
  published: boolean;
  sort_order: number;
};
