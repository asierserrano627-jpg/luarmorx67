var store = {};

function escapeHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function extractUrl(loader) {
  var m = loader.match(/HttpGet\("([^"]+)"\)/);
  return m ? m[1] : "";
}

function buildHTML(loader, id) {
  var rawUrl = escapeHtml(extractUrl(loader));
  var loaderB64 = Buffer.from(loader).toString("base64");

  return [
    "<!DOCTYPE html><html lang=en><head>",
    "<meta charset=UTF-8>",
    "<meta name=viewport content='width=device-width,initial-scale=1'>",
    "<title>LuarmorX - Protected Script</title>",
    "<style>",
    "*{margin:0;padding:0;box-sizing:border-box}",
    "body{background:#031a0e;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Courier New',monospace;color:#b6ffda;padding:20px}",
    ".glow{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 40%,#00ff8822 0%,transparent 70%)}",
    ".card{background:#061a0f;border:1px solid #00ff8844;border-radius:16px;padding:32px 28px;max-width:560px;width:100%;box-shadow:0 0 40px #00ff8811;position:relative;z-index:1}",
    ".logo{display:flex;align-items:center;gap:12px;margin-bottom:28px;justify-content:center}",
    ".logo-icon{width:40px;height:40px;background:linear-gradient(135deg,#00ff88,#00cfaa);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px}",
    ".logo-text{font-size:20px;font-weight:bold;letter-spacing:3px;color:#fff}",
    ".logo-text span{color:#00ff88}",
    ".badge-row{display:flex;gap:8px;justify-content:center;margin-bottom:24px}",
    ".badge{font-size:10px;padding:3px 12px;border-radius:20px;letter-spacing:1px;background:#0a2e1a;color:#00ff88;border:1px solid #00ff8844}",
    ".badge.id{color:#7fffcc;border-color:#7fffcc44;background:#061a10}",
    ".section-title{font-size:10px;color:#3a8a5a;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}",
    ".code-box{background:#020f07;border:1px solid #00ff8833;border-radius:10px;padding:16px;font-size:12px;line-height:1.9;color:#00ff88;word-break:break-all;white-space:pre-wrap;margin-bottom:16px}",
    ".key{color:#f7c948}.fn{color:#7fffcc}.cm{color:#3a6a4a;font-style:italic}",
    ".bar{height:2px;background:#061a0f;border-radius:2px;margin-top:12px;overflow:hidden}",
    ".bar-inner{height:100%;width:30%;background:linear-gradient(90deg,transparent,#00ff88,transparent);animation:sh 2s infinite}",
    "@keyframes sh{0%{transform:translateX(-200%)}100%{transform:translateX(500%)}}",
    ".copy-btn{width:100%;padding:13px;border:none;border-radius:9px;background:linear-gradient(135deg,#00ff88,#00cfaa);color:#020f07;font-family:'Courier New',monospace;font-size:13px;font-weight:bold;cursor:pointer;letter-spacing:1px;transition:.15s}",
    ".copy-btn:active{transform:scale(.98)}",
    ".note{text-align:center;font-size:10px;color:#2a5a3a;margin-top:16px;line-height:1.6}",
    ".note a{color:#3a8a5a;text-decoration:none}",
    "</style></head><body>",
    "<div class=glow></div>",
    "<div class=card>",
    "<div class=logo><div class=logo-icon>&#11041;</div><div class=logo-text>LUARMOR<span>X</span></div></div>",
    "<div class=badge-row><span class=badge>&#10003; PROTECTED</span><span class='badge id'>#" + id + "</span></div>",
    "<div class=section-title>Loadstring</div>",
    "<div class=code-box>",
    "<span class=key>script_key</span> = <span style=color:#e06c75>&quot;KEY&quot;</span>; <span class=cm>-- A key system is active</span>&#10;",
    "<span class=fn>loadstring</span>(<span class=fn>game:HttpGet</span>(<span style=color:#e06c75>&quot;" + rawUrl + "&quot;</span>))()",
    "<div class=bar><div class=bar-inner></div></div>",
    "</div>",
    "<button class=copy-btn onclick=copyLoader()>&#11041; COPIAR LOADSTRING</button>",
    "<div class=note>Contents can not be displayed on browser &bull; <a href=https://luarmor.net/>https://luarmor.net/</a></div>",
    "</div>",
    "<script>",
    "var loader=atob('" + loaderB64 + "');",
    "function copyLoader(){",
    "navigator.clipboard.writeText(loader).catch(function(){",
    "var t=document.createElement('textarea');t.value=loader;",
    "document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);",
    "});",
    "var b=document.querySelector('.copy-btn');",
    "var o=b.textContent;b.textContent='Copiado!';",
    "setTimeout(function(){b.textContent=o;},1500);",
    "}",
    "<\/script>",
    "</body></html>"
  ].join("");
}

module.exports = async function(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  var id = req.query.id;

  // POST /api/upload — subir script
  if (req.method === "POST" && id === "upload") {
    var body = req.body;
    if (!body || !body.id || !body.lua || !body.loader) {
      return res.status(400).json({ error: "Faltan campos" });
    }
    store[body.id] = { lua: body.lua, loader: body.loader };
    return res.status(200).json({ url: "https://" + req.headers.host + "/api/" + body.id });
  }

  // GET /api/:id — servir HTML o Lua
  if (req.method === "GET" && id && id !== "upload") {
    var entry = store[id];
    if (!entry) {
      return res.status(404).send("Not found");
    }

    var ua = req.headers["user-agent"] || "";
    var isRoblox = !ua.includes("Mozilla") && !ua.includes("Chrome") && !ua.includes("Safari");

    if (isRoblox) {
      res.setHeader("Content-Type", "text/plain");
      return res.status(200).send(entry.lua);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(buildHTML(entry.loader, id));
  }

  return res.status(404).send("Not found");
};
