import type { Client, Guild, GuildMember } from "@fluxerjs/core";

const memberCountCache = new Map<string, number>();

export async function fetchAllMembers(guild: Guild) {
  let lastId: string | undefined;
  let count = 0;
  while (true) {
    const members = await guild.members.fetch({ limit: 1000, after: lastId });
    if (members.length === 0) break;
    count += members.length;
    lastId = members.at(-1)?.id;
  }
  return count;
}

export function getMemberCount(guild: Guild) {
  const count = memberCountCache.get(guild.id);
  if (count === undefined) return fetchAllMembers(guild);
  return Promise.resolve(count);
}

export async function getOrFetchGuild(client: Client, id: string) {
  return client.guilds.get(id) ?? (await client.guilds.fetch(id));
}

export function handleGuildMemberAdd(member: GuildMember) {
  const guild = member.guild;
  if (!guild) return;
  const count = memberCountCache.get(guild.id) ?? undefined;
  if (!count) return;
  memberCountCache.set(guild.id, count + 1);
}

export function handleGuildMemberRemove(member: GuildMember) {
  const guild = member.guild;
  if (!guild) return;
  const count = memberCountCache.get(guild.id) ?? undefined;
  if (!count) return;
  memberCountCache.set(guild.id, count - 1);
}
