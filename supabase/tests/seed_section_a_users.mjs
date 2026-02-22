import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Admin client (service role). Never use this key in browser/mobile. [page:1]
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const USERS = [
  { email: 'organizer1@test.local', password: 'Password123!' },
  { email: 'participant1@test.local', password: 'Password123!' },
  { email: 'nonparticipant1@test.local', password: 'Password123!' },
];

async function ensureUser({ email, password }) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {},
  });

  // If user already exists, createUser will error; that's fine for idempotent seeding.
  if (error) {
    const msg = String(error.message || error);
    if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
      console.log(`User exists: ${email}`);
      return;
    }
    throw error;
  }

  console.log(`Created: ${email} (${data.user?.id})`);
}

for (const u of USERS) {
  // eslint-disable-next-line no-await-in-loop
  await ensureUser(u);
}

console.log('✅ Section A auth users ready');
