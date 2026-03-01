import { makeBadge } from "badge-maker";
import Elysia from "elysia";
import { Client, Events, Guild } from "@fluxerjs/core";
import { env } from "./env";
import z, { ZodError } from "zod";

function imgBufferToBase64(buffer: Buffer) {
  return "data:image/svg+xml;base64," + buffer.toString("base64");
}

const accentColor = "#4641D9";
const lessAccentColor = "#3935b2";

const client = new Client({
  intents: 0,
});

function ResponseSvg(svg: string, status?: number) {
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
    },
    status,
  });
}

const memberCountCache = new Map<string, number>();
client.on("guildMemberAdd", async (member) => {
  const guild = member.guild;
  if (!guild) return;
  const count = memberCountCache.get(guild.id) ?? undefined;
  if (!count) return;
  memberCountCache.set(guild.id, count + 1);
});

client.on("guildMemberRemove", async (member) => {
  const guild = member.guild;
  if (!guild) return;
  const count = memberCountCache.get(guild.id) ?? undefined;
  if (!count) return;
  memberCountCache.set(guild.id, count - 1);
});

async function fetchAllMembers(guild: Guild) {
  let lastId: string | undefined;
  let count = 0;
  while (true) {
    const members = await guild.members.fetch({ limit: 1000, after: lastId });
    if (members.length === 0) break;
    count += members.length;
    lastId = members.at(-1)?.id;
    await Bun.sleep(10);
  }
  return count;
}

function getMemberCount(guild: Guild) {
  const count = memberCountCache.get(guild.id);
  if (count === undefined) return fetchAllMembers(guild);
  return Promise.resolve(count);
}

async function getOrFetchGuild(id: string) {
  return client.guilds.get(id) ?? (await client.guilds.fetch(id));
}

const styleSchema = z.enum(["flat", "flat-square", "plastic", "social", "for-the-badge"]);
type Style = z.infer<typeof styleSchema>;

client.on(Events.Error, (e) => {
  console.error("fluxerjs error", e);
});

new Elysia()
  .get("/badge/:id", async (c) => {
    const style: Style = styleSchema.parse(c.query.style ?? "flat");

    const guild = await getOrFetchGuild(c.params.id);
    if (!guild) {
      const svg = makeBadge({
        label: "error",
        color: "red",
        message: "community not found",
        style,
      });
      return ResponseSvg(svg, 404);
    }
    const svg = makeBadge({
      label: guild.name,
      message: await getMemberCount(guild).then(
        (count) => `${count.toLocaleString()} online`,
      ),
      labelColor: lessAccentColor,
      color: accentColor,
      style,
      logoBase64: await fetch(
        "https://raw.githubusercontent.com/fluxerapp/fluxer/refactor/fluxer_app/src/images/fluxer-logo-monochrome.svg",
      )
        .then((res) => res.text())
        .then((res) => res.replace("currentColor", "white"))
        .then((a) => imgBufferToBase64(Buffer.from(a))),
    });

    return ResponseSvg(svg);
  })
  .onError(({ error }) => {
    console.error(error);
    return ResponseSvg(
      makeBadge({
        label: "error",
        color: "red",
        message: error instanceof ZodError ? "invalid args" : "unknown error",
      }),
    );
  })
  .get("/", (c) => c.redirect("https://github.com/letruxux/fluxer-badges/"))
  .listen(4005, async (server) => {
    console.log(`Listening on port ${server.port}`);
    await client.login(env.FLUXER_BOT_TOKEN);
  });
