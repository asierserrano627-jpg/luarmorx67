import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { id, lua } = body;

    if (!id || !lua) {
      return res.status(400).json({ error: "Faltan id o lua" });
    }

    const { error } = await supabase
      .from("scripts")
      .upsert({ id, lua });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      id,
      url: `https://\( {req.headers.host}/api/ \){id}`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}
