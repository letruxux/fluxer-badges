export function imgBufferToBase64(buffer: Buffer) {
  return "data:image/svg+xml;base64," + buffer.toString("base64");
}

export function ResponseSvg(svg: string, status?: number) {
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
    },
    status,
  });
}

const logos = new Map<string, string>();

export async function readLogo(color: "black" | "white" = "black") {
  const cached = logos.get(color);
  if (cached) return cached;

  const base64 = await Bun.file(`./assets/fluxer-logo-${color}.svg`)
    .arrayBuffer()
    .then((a) => imgBufferToBase64(Buffer.from(a)));

  logos.set(color, base64);
  return base64;
}
