
import { put } from "@vercel/blob";
import crypto from "node:crypto";

function obfuscate(source) {
  // Codificación Base64 como capa básica de ocultación.
  // No es cifrado ni impide recuperar el código original.
  const encoded = Buffer.from(source, "utf8").toString("base64");

  return `-- LuarmorX Protected Script
local encoded = "${encoded}"
local alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

local function decode(data)
    local chars = {}
    for i = 1, #data, 4 do
        local a = alphabet:find(data:sub(i,i), 1, true) - 1
        local b = alphabet:find(data:sub(i+1,i+1), 1, true) - 1
        local c = alphabet:find(data:sub(i+2,i+2), 1, true) - 1
        local d = alphabet:find(data:sub(i+3,i+3), 1, true) - 1
        local n = a * 262144 + b * 4096 + c * 64 + d
        chars[#chars+1] = string.char(
            math.floor(n / 65536) % 256,
            math.floor(n / 256) % 256,
            n % 256
        )
    end
    return table.concat(chars)
end

local decoded = decode(encoded)
return decoded
`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { name, source } = req.body || {};

    if (typeof source !== "string" || !source.trim()) {
      return res.status(400).json({ error: "Código vacío" });
    }

    if (source.length > 100000) {
      return res.status(413).json({ error: "Código demasiado largo" });
    }

    const id = crypto.randomUUID().replaceAll("-", "");
    const protectedSource = obfuscate(source);

    await put(`scripts/${id}.lua`, protectedSource, {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/plain; charset=utf-8"
    });

    const host = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const base = `${protocol}://${host}`;

    return res.status(200).json({
      id,
      name: String(name || "script").slice(0, 60),
      pageUrl: `${base}/api/page?id=${id}`,
      rawUrl: `${base}/api/raw?id=${id}`
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "No se pudo publicar el script"
    });
  }
}
