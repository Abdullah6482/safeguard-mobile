import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY
const seedPassword = process.env.SAFEGUARD_SEED_PASSWORD

if (!supabaseUrl || !supabaseKey || !seedPassword) {
  throw new Error('Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SAFEGUARD_SEED_PASSWORD before running this development-only seed script.')
}
const supabase = createClient(supabaseUrl, supabaseKey)

const USERS = [
  {
    email: 'investigator.one@example.com',
    password: seedPassword,
    options: {
      data: {
        full_name: 'Demo Investigator One',
        job_title: 'Shift Lead',
        department: 'Operations',
        role: 'investigator'
      }
    }
  },
  {
    email: 'investigator.two@example.com',
    password: seedPassword,
    options: {
      data: {
        full_name: 'Demo Investigator Two',
        job_title: 'Safety Specialist',
        department: 'HSE',
        role: 'investigator'
      }
    }
  },
  {
    email: 'investigator.three@example.com',
    password: seedPassword,
    options: {
      data: {
        full_name: 'Demo Investigator Three',
        job_title: 'Operations Supervisor',
        department: 'Operations',
        role: 'investigator'
      }
    }
  },
  {
    email: 'investigator.four@example.com',
    password: seedPassword,
    options: {
      data: {
        full_name: 'Demo Investigator Four',
        job_title: 'Quality Lead',
        department: 'Quality',
        role: 'investigator'
      }
    }
  }
]

async function createUsers() {
  console.log('Creating users via Supabase API...')
  for (const u of USERS) {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: u.options
    })
    
    if (error) {
      console.error(`Error creating ${u.email}:`, error.message)
    } else {
      console.log(`Successfully created ${u.email}`)
    }
  }
}

createUsers()
