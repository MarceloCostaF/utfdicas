import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://amzgsukfekuaysitwqgy.supabase.co'
const supabaseKey = 'sb_publishable_Su79YCs8p44A0jb7pmTCJw_NSe3Yjik'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)