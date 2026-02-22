import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const EVENT_ID = '00000000-0000-0000-0000-000000000101';
const GROUP_ID = '00000000-0000-0000-0000-000000000201';

const users = {
  organizer: { email: 'organizer1@test.local', password: 'Password123!' },
  participant: { email: 'participant1@test.local', password: 'Password123!' },
  nonparticipant: { email: 'nonparticipant1@test.local', password: 'Password123!' },
};

async function ensureUser({ email, password }) {
  // Create user if missing (admin API). No placeholder auth.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr && !String(createErr.message || '').toLowerCase().includes('already')) {
    // If already exists, we’ll just sign in.
  }

  // Sign in to get a real JWT for RLS + Realtime
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: sessionData, error: signInErr } = await client.auth.signInWithPassword({ email, password });
  if (signInErr) throw signInErr;

  return { client, userId: sessionData.user.id };
}

async function seedAsServiceRole(organizerId, participantId) {
  // Seed event/group/membership using service role (bypasses RLS for setup only).
  await admin.from('events').upsert({ id: EVENT_ID, organizer_id: organizerId, title: 'Test Event' });
  await admin.from('groups').upsert({ id: GROUP_ID, event_id: EVENT_ID, name: 'Event Chat' });

  await admin.from('event_participants').upsert([
    { event_id: EVENT_ID, user_id: organizerId, status: 'organizer' },
    { event_id: EVENT_ID, user_id: participantId, status: 'joined' },
  ]);

  await admin.from('group_members').upsert([
    { group_id: GROUP_ID, user_id: organizerId },
    { group_id: GROUP_ID, user_id: participantId },
  ]);

  // Ensure table is in realtime publication (required for postgres_changes)
  await admin.rpc('sql', {
    query: `alter publication supabase_realtime add table if not exists public.messages;`,
  }).catch(() => {
    // If you don't have an rpc('sql') helper, ignore; many setups already include it.
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const organizer = await ensureUser(users.organizer);
  const participant = await ensureUser(users.participant);
  const nonparticipant = await ensureUser(users.nonparticipant);

  await seedAsServiceRole(organizer.userId, participant.userId);

  let participantGot = 0;
  let nonparticipantGot = 0;

  const participantChannel = participant.client
    .channel(`event:${EVENT_ID}:messages`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${GROUP_ID}` },
      () => {
        participantGot += 1;
      }
    );

  const nonparticipantChannel = nonparticipant.client
    .channel(`event:${EVENT_ID}:messages`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${GROUP_ID}` },
      () => {
        nonparticipantGot += 1;
      }
    );

  await participantChannel.subscribe();
  await nonparticipantChannel.subscribe();

  // Insert as participant (RLS must allow)
  const { error: insErr } = await participant.client.from('messages').insert({
    group_id: GROUP_ID,
    sender_id: participant.userId,
    body: 'hello realtime',
  });
  if (insErr) throw insErr;

  await wait(800);

  console.log('participantGot', participantGot, 'nonparticipantGot', nonparticipantGot);

  if (participantGot < 1) throw new Error('Participant did not receive realtime insert (check RLS or publication).');
  if (nonparticipantGot > 0) throw new Error('Non-participant received realtime insert (RLS leak).');

  // Eject participant (must revoke immediately)
  const { error: ejectErr } = await admin.rpc('eject_user_from_event', {
    p_event_id: EVENT_ID,
    p_user_id: participant.userId,
    p_ejector_id: organizer.userId,
  });
  if (ejectErr) throw ejectErr;

  // After ejection, participant should fail to insert
  const { error: insAfterErr } = await participant.client.from('messages').insert({
    group_id: GROUP_ID,
    sender_id: participant.userId,
    body: 'should fail after ejection',
  });
  if (!insAfterErr) throw new Error('Ejected participant was still able to insert message (RLS bug).');

  console.log('✅ realtime smoke passed');
  await participantChannel.unsubscribe();
  await nonparticipantChannel.unsubscribe();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
