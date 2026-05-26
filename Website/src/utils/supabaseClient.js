import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dnsgtapwzdibqgkonwda.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_4jRniDlTFw4MBSuu-SVnmg_z6bGnF12"

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase credentials. Authentication will not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
