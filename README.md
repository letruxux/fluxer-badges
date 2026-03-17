# fluxer badges!

[![image](https://badges.fluxer.ltrx.lol/badge/1476277757476868234?style=for-the-badge)](https://fluxer.gg/Roi7rTTU)

> [!NOTE]
> You need to [invite the bot](https://web.fluxer.app/oauth2/authorize?client_id=1477673661788864709&scope=bot&permissions=1024) to your server to use this.

> [!NOTE]
> The server won't respond if Fluxer is down. Check its status [here](https://fluxerstatus.com).

## how to use:

allowed styles:

- flat
- flat-square
- plastic
- social
- for-the-badge

`https://badges.fluxer.ltrx.lol/badge/0000000000000000000?style=flat`

![image](https://badges.fluxer.ltrx.lol/badge/1476277757476868234?style=flat)

`https://badges.fluxer.ltrx.lol/badge/0000000000000000000?style=flat-square`

![image](https://badges.fluxer.ltrx.lol/badge/1476277757476868234?style=flat-square)

`https://badges.fluxer.ltrx.lol/badge/0000000000000000000?style=plastic`

![image](https://badges.fluxer.ltrx.lol/badge/1476277757476868234?style=plastic)

`https://badges.fluxer.ltrx.lol/badge/0000000000000000000?style=social`

![image](https://badges.fluxer.ltrx.lol/badge/1476277757476868234?style=social)

`https://badges.fluxer.ltrx.lol/badge/0000000000000000000?style=for-the-badge`

![image](https://badges.fluxer.ltrx.lol/badge/1476277757476868234?style=for-the-badge)

## selfhost

```yml
# compose.yml
services:
  fluxerbadges:
    stop_grace_period: 60s # in case fluxer crashes, it waits 60 seconds before restarting
    image: ghcr.io/letruxux/fluxer-badges:latest
    environment:
      - FLUXER_BOT_TOKEN=${FLUXER_BOT_TOKEN} # use env or change this to your token directly here
    ports:
      - "4005:4005" # runs on port 4005, you can change this if you want
    restart: unless-stopped
```

## credits

- [fluxerjs](https://github.com/fluxerjs/core)
- [badge-maker](https://github.com/badges/shields)
