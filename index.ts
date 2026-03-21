import { makeBadge } from "badge-maker";
import Elysia from "elysia";
import { Client, Events, Guild } from "@fluxerjs/core";
import { env } from "./env";
import z, { ZodError } from "zod";
import {
  getOrFetchGuild,
  getMemberCount,
  handleGuildMemberAdd,
  handleGuildMemberRemove,
} from "./member-utils";
import { ResponseSvg, readLogo } from "./utils";

const accentColor = "#4641D9";
const lessAccentColor = "#3935b2";
const client = new Client({
  intents: 0,
});

client.on("guildMemberAdd", handleGuildMemberAdd);

client.on("guildMemberRemove", handleGuildMemberRemove);

const styleSchema = z.enum(["flat", "flat-square", "plastic", "social", "for-the-badge"]);
type Style = z.infer<typeof styleSchema>;

client.on(Events.Error, (e) => {
  console.error("fluxerjs error", e);
});

new Elysia()
  .get("/badge/:id", async (c) => {
    const style: Style = styleSchema.parse(c.query.style ?? "flat");

    const guild = await getOrFetchGuild(client, c.params.id);
    if (!guild) {
      const svg = makeBadge({
        label: "error",
        color: "red",
        message: "community not found",
        style,
      });
      return ResponseSvg(svg, 200);
    }
    const svg = makeBadge({
      label: guild.name,
      message: await getMemberCount(guild).then(
        (count) => `${count.toLocaleString()} members`,
      ),
      labelColor: lessAccentColor,
      color: accentColor,
      style,
      logoBase64: await readLogo(style === "social" ? "black" : "white"),
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
