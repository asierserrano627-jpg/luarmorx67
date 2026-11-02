// Usamos un Map en memoria (para prueba).
// En producción real usa Upstash Redis (gratis) — te explico abajo.

const store = globalThis.__scripts || (globalThis.__scripts = new Map());

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, lua, loader } = req.body;

    if (!id || !lua) {
      return res.status(400).json({ error: "Faltan id o lua" });
    }

    // Guardamos el script
    store.set(id, { lua, loader, created: Date.now() });

    return res.status(200).json({
      success: true,
      id,
      url: `https://\( {req.headers.host}/api/ \){id}`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
