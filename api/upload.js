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

    // Guardamos en globalThis (funciona mientras la instancia esté caliente)
    if (!globalThis.__scripts) globalThis.__scripts = new Map();
    globalThis.__scripts.set(id, { lua, created: Date.now() });

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
