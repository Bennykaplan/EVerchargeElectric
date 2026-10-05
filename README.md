# EverCharge Arcade

Seven browser games, served as a static site at **https://everchargeelectric.com**.

No build step, no server, no API keys — plain HTML, CSS and JavaScript. Every push
to `main` deploys automatically via Netlify.

## The games

| Game | What it is |
|---|---|
| Snake | Eat apples, grow, avoid walls and your own tail |
| Breakout | Clear the bricks, three lives, levels get faster |
| Flap | Thread the gaps; they tighten as you score |
| Asteroids | Turn, thrust, shoot; rocks split twice |
| Missile | Intercept incoming missiles before they flatten six cities |
| Imitation | **Two players, two browsers.** Copy the pattern, add a step, pass it back |
| Home Run Derby | Ten outs; time the swing and clear the wall |

## Layout

```
index.html        the hub
style.css         shared shell styling
arcade.js         shared helpers: canvas sizing, input, game loop, high scores
games/*.html      one self-contained file per game
netlify.toml      static publish config
```

Each game owns its own logic in a single file. `arcade.js` only removes the
boilerplate they all repeat — a DPR-aware canvas, a delta-timed loop, live key
state, and high scores that survive a blocked `localStorage`.

## Imitation, and how two browsers find each other

Imitation connects two players **directly, browser to browser**, over WebRTC using
PeerJS's public broker for the initial introduction only. Once the two peers know
about each other, the game data never touches a third party. One player creates a
room and reads out a four-character code; the other types it in.

Direct peer connections can be blocked on locked-down school or corporate networks.
It works on ordinary home internet and on mobile data.

## Running it locally

It is a static site, so anything that serves files works:

```
npx serve .
```

Opening `index.html` straight from disk mostly works too, but Imitation needs to be
served over http/https for WebRTC.
