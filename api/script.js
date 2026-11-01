import { list } from "@vercel/blob";

export default async function handler(req, res) {
  const id = String(req.query.id || "");

  const result = await list({
    prefix: `scripts/${id}.lua`,
    limit: 1
  });

  const blob = result.blobs.find(
    b => b.pathname === `scripts/${id}.lua`
  );

  if (!blob) {
    return res.status(404).send("Script no encontrado");
  }

  const content = await fetch(blob.url).then(r => r.text());

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LuarmorX</title>
<style>
body{
background:#080c18;
color:#dde6ff;
font-family:Arial,sans-serif;
padding:30px;
max-width:800px;
margin:auto;
}
pre{
background:#111827;
border:1px solid #1a2540;
padding:18px;
border-radius:10px;
overflow:auto;
white-space:pre-wrap;
}
button{
background:#00ff88;
color:black;
border:0;
padding:12px 20px;
border-radius:8px;
cursor:pointer;
margin-top:15px;
}
</style>
</head>
<body>

<h1>⬡ LUARMORX</h1>

<p>Script publicado correctamente.</p>

<pre id="code"></pre>

<button onclick="navigator.clipboard.writeText(document.getElementById('code').innerText)">
Copiar código
</button>

<script>
document.getElementById("code").textContent = ${JSON.stringify(content)};
</script>

</body>
</html>
  `);
}
