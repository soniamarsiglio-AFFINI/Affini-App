import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvpugvgwfjrdzdyfhpjv.supabase.co'
const supabaseKey = 'sb_publishable_x81s0ziz1KnKQ-Eixe0CTQ_D6-wop2x'

export const supabase = createClient(supabaseUrl, supabaseKey)
