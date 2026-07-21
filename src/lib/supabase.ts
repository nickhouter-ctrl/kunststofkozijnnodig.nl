import { createClient } from "@supabase/supabase-js";

// Server-side (service role, bypasses RLS). Lazily created: reading env vars at
// module scope breaks the production build when they are not set.
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase env vars ontbreken");
  }
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
