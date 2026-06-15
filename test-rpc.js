import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key] = value.join('=').trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testRpc() {
  const { data, error } = await supabase.rpc('get_email_by_username', {
    p_username: 'voidhymn'
  });
  console.log("RPC Data:", data);
  console.log("RPC Error:", error);
}

testRpc();
