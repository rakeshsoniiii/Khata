import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkziyeuhwdxlnpxgukay.supabase.co';
const supabaseKey = 'sb_publishable_h0MKcYgDqa4GQNDS0p9BEw_5VWRuWex';

export const supabase = createClient(supabaseUrl, supabaseKey);
