import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { name, source } = req.body || {};

    if (typeof source !== "string" || !source.trim()) {
      return res.status(400).json({ error: "El código Lua está vacío" });
    }

    if (source.length > 100000) {
      return res.status(413).json({ error: "El código es demasiado largo" });
    }

    const id = crypto.randomUUID().replaceAll("-", "");

    await put(`scripts/${id}.lua`, source, {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/plain; charset=utf-8"
    });

    const host = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || "https";

    return res.status(200).json({
      id,
      name: String(name || "script").slice(0, 60),
      url: `${protocol}://${host}/api/script?id=${id}`
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al guardar el script. Comprueba Vercel Blob."
    });
  }
}
