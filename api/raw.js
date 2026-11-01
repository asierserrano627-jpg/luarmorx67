import { list } from "@vercel/blob";

export default async function handler(req, res) {
  const id = String(req.query.id || "");

  if (!/^[a-f0-9]{32}$/.test(id)) {
    return res.status(400).send("ID inválido");
  }

  try {
    const result = await list({
      prefix: `scripts/${id}.lua`,
      limit: 1
    });

    const blob = result.blobs.find(
      item => item.pathname === `scripts/${id}.lua`
    );

    if (!blob) {
      return res.status(404).send("Script no encontrado");
    }

    const response = await fetch(blob.url);

    if (!response.ok) {
      return res.status(502).send("Error leyendo el archivo");
    }

    const source = await response.text();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.status(200).send(source);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Error del servidor");
  }
}
