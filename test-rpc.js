import { createClient } from '@supabase/supabase-js';

// Since dotenv wasn't found, we'll read directly from process.env, which Vite handles, or we can just read the .env file manually.
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
  const { data, error } = await supabase.rpc('get_email_if_valid_password', {
    p_username: 'voidhymn',
    p_password: 'wrongpassword'
  });
  console.log("RPC Data:", data);
  console.log("RPC Error:", error);
}

testRpc();
