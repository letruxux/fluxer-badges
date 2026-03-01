export function imgBufferToBase64(buffer: Buffer) {
  return "data:image/svg+xml;base64," + buffer.toString("base64");
}

export function ResponseSvg(svg: string, status?: number) {
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
    },
    status,
  });
}

export async function readLogo(color: "black" | "white" = "black") {
  return Bun.file(`./assets/fluxer-logo-${color}.svg`)
    .arrayBuffer()
    .then((a) => imgBufferToBase64(Buffer.from(a)));
}
