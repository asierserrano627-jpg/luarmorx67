
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

    const rawUrl =
      `https://${req.headers.host}/api/raw?id=${id}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LuarmorX — Published Script</title>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #0d1123;
  color: #fff;
  font-family: Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  width: min(90%, 390px);
  text-align: center;
}

.document {
  font-size: 27px;
  margin-bottom: 7px;
}

h1 {
  font-size: 13px;
  margin: 0 0 12px;
  font-weight: 700;
}

.code-box {
  position: relative;
  background: #090d1c;
  border: 1px solid #1c2742;
  border-radius: 9px;
  padding: 15px 12px;
  text-align: left;
  min-height: 68px;
}

.code {
  color: #66c8e8;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.8;
  overflow-wrap: anywhere;
  padding-right: 55px;
}

.copy {
  position: absolute;
  right: 8px;
  top: 8px;
  background: #18213c;
  border: 0;
  color: #cbd5ef;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 9px;
  cursor: pointer;
}

.copy:active {
  background: #263656;
}

.line {
  height: 2px;
  background: linear-gradient(90deg, #101b32, #00cfff);
  margin-top: 12px;
}

.footer {
  margin-top: 10px;
  font-size: 8px;
  color: #596581;
}

.footer a {
  color: #7187a9;
  text-decoration: none;
}

.brand {
  position: fixed;
  bottom: 15px;
  font-size: 9px;
  color: #424d68;
  letter-spacing: 2px;
}
</style>
</head>

<body>

<div class="container">

  <div class="document">📜</div>

  <h1>Loadstring</h1>

  <div class="code-box">

    <div class="code" id="url"></div>

    <button class="copy" id="copy">
      Copy
    </button>

    <div class="line"></div>

  </div>

  <div class="footer">
    Script hosted by LuarmorX
  </div>

</div>

<div class="brand">
  LUARMORX
</div>

<script>
const rawUrl = ${JSON.stringify(rawUrl)};

document.getElementById("url").textContent = rawUrl;

document.getElementById("copy").addEventListener("click", async () => {
  const button = document.getElementById("copy");

  try {
    await navigator.clipboard.writeText(rawUrl);
    button.textContent = "Copied!";
  } catch {
    button.textContent = "Copy failed";
  }

  setTimeout(() => {
    button.textContent = "Copy";
  }, 1500);
});
</script>

</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(html);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
}
