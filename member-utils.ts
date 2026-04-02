import type { Client, Guild, GuildMember } from "@fluxerjs/core";

const memberCountCache = new Map<string, number>();
const memberCountPromises = new Map<string, Promise<number>>();

export async function fetchAllMembers(guild: Guild): Promise<number> {
  let lastId: string | undefined;
  let count = 0;

  while (true) {
    const members = await guild.members.fetch({
      limit: 1000,
      after: lastId,
    });

    if (members.length === 0) break;

    count += members.length;
    lastId = members.at(-1)?.id;
  }

  return count;
}

export function getMemberCount(guild: Guild): Promise<number> {
  const cached = memberCountCache.get(guild.id);
  if (cached !== undefined) return Promise.resolve(cached);

  const existingPromise = memberCountPromises.get(guild.id);
  if (existingPromise) return existingPromise;

  const promise = fetchAllMembers(guild).then((count) => {
    memberCountCache.set(guild.id, count);
    memberCountPromises.delete(guild.id);
    return count;
  });

  memberCountPromises.set(guild.id, promise);
  return promise;
}

export async function getOrFetchGuild(client: Client, id: string) {
  return client.guilds.get(id) ?? client.guilds.fetch(id);
}

export function handleGuildMemberAdd(member: GuildMember) {
  const guild = member.guild;
  if (!guild) return;

  const count = memberCountCache.get(guild.id);
  if (count === undefined) return;

  memberCountCache.set(guild.id, count + 1);
}

export function handleGuildMemberRemove(member: GuildMember) {
  const guild = member.guild;
  if (!guild) return;

  const count = memberCountCache.get(guild.id);
  if (count === undefined) return;

  memberCountCache.set(guild.id, Math.max(0, count - 1));
}
