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

    const source = await fetch(blob.url).then(r => r.text());

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>LuarmorX</title>
        <style>
          body {
            background:#080c18;
            color:#dde6ff;
            font-family:Arial;
            max-width:800px;
            margin:50px auto;
            padding:20px;
          }
          h1 { color:#00ff88; }
          pre {
            background:#111827;
            padding:20px;
            border-radius:12px;
            overflow:auto;
            white-space:pre-wrap;
          }
          a { color:#00cfff; }
        </style>
      </head>
      <body>
        <h1>⬡ LUARMORX</h1>
        <p>Proyecto publicado correctamente.</p>
        <p>Identificador: ${id}</p>
        <pre id="code"></pre>
        <p><a href="/api/raw?id=${id}">Ver contenido Lua</a></p>
        <script>
          document.getElementById("code").textContent =
            ${JSON.stringify(source)};
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Error del servidor");
  }
}
