import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://waissnnstrfjmjrczfls.supabase.co'
const supabaseKey = 'sb_publishable_IE58a-P2Z4rORKxcpazCsQ_8ZlKrAIg'
const supabase = createClient(supabaseUrl, supabaseKey)

const USERS = [
  {
    email: 'omar.khalid@obs.com',
    password: 'Test@1234',
    options: {
      data: {
        full_name: 'Omar Khalid',
        job_title: 'Shift Lead A',
        department: 'Production',
        role: 'investigator'
      }
    }
  },
  {
    email: 'fatima.hassan@obs.com',
    password: 'Test@1234',
    options: {
      data: {
        full_name: 'Fatima Hassan',
        job_title: 'Shift Lead B',
        department: 'Quality Control',
        role: 'investigator'
      }
    }
  },
  {
    email: 'khalid.nasser@obs.com',
    password: 'Test@1234',
    options: {
      data: {
        full_name: 'Khalid Nasser',
        job_title: 'Production Manager',
        department: 'Production',
        role: 'investigator'
      }
    }
  },
  {
    email: 'sara.ahmed@obs.com',
    password: 'Test@1234',
    options: {
      data: {
        full_name: 'Sara Ahmed',
        job_title: 'QC Lead',
        department: 'Quality Control',
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
