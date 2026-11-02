export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!globalThis.__scripts) globalThis.__scripts = new Map();
    const data = globalThis.__scripts.get(id);

    if (!data) {
      return res.status(404).send("Script not found or expired");
    }

    const ua = (req.headers["user-agent"] || "").toLowerCase();
    const isBrowser =
      ua.includes("mozilla") ||
      ua.includes("chrome") ||
      ua.includes("safari") ||
      ua.includes("firefox") ||
      ua.includes("edg");

    // === NAVEGADOR → Página bonita ===
    if (isBrowser) {
      const host = req.headers.host;
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const fullUrl = `\( {protocol}:// \){host}/api/${id}`;

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Loadstring</title>
<style>
  body{margin:0;background:#0a0e1a;color:#cdd6f4;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .box{background:#111827;border:1px solid #1e293b;border-radius:16px;padding:24px 28px;max-width:520px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,.4)}
  .icon{font-size:32px;text-align:center;margin-bottom:8px}
  h1{margin:0 0 18px;font-size:20px;text-align:center;color:#fff}
  pre{background:#0b1120;border-radius:10px;padding:14px 16px;font-size:13px;line-height:1.6;overflow-x:auto;position:relative;white-space:pre-wrap}
  .copy{position:absolute;top:10px;right:10px;background:#1e293b;border:none;color:#94a3b8;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px}
  .copy:hover{color:#fff}
  .note{font-size:11px;color:#64748b;text-align:center;margin-top:14px}
</style>
</head>
<body>
  <div class="box">
    <div class="icon">📜</div>
    <h1>Loadstring</h1>
    <pre id="code">script_key = "KEY"; -- A key system is active
loadstring(game:HttpGet("${fullUrl}"))()</pre>
    <button class="copy" onclick="navigator.clipboard.writeText(document.getElementById('code').innerText)">Copy</button>
    <div class="note">Contents can not be displayed on browser • https://luarmor.net/</div>
  </div>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    }

    // === ROBLOX → Script real ===
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).send(data.lua);

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal error");
  }
}
