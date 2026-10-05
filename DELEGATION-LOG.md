# Delegation log — EverCharge Arcade

Site: https://everchargeelectric.com · Repo: https://github.com/Bennykaplan/EVerchargeElectric

A record of what I asked Claude for, what it produced, and how it was checked.
Verification was mostly automated: the games run headlessly in jsdom with a stubbed
canvas and a hand-cranked frame clock, so the real game code can be driven and
measured rather than eyeballed.

---

### 1. Build seven games
**Asked:** Replace the quiz on my site with seven games — Snake, Breakout, Splat,
Asteroids, Missile Command, Imitation and one of my own.

**Produced:** Seven self-contained pages plus a hub. Shared `style.css` and
`arcade.js` (canvas sizing, delta-timed loop, key state, high scores). My own game
is a Home Run Derby. No build step, no server, no API keys.

**Verified:** 40-check headless suite — every game starts, scores, ends and restarts
without errors; a draw-call census confirms each renders a full scene per frame
rather than failing silently. All seven hub tiles resolve to real files.

---

### 2. Make Imitation two-player across browsers
**Asked:** Two people in separate browsers playing each other live.

**Produced:** WebRTC peer-to-peer via PeerJS's public broker for introductions only;
gameplay data goes browser to browser. One player creates a room code, the other
enters it.

**Verified:** Tested with two real browser tabs against the live site. Confirmed the
full exchange: host created code `VDSV`, guest joined, pattern passed back and forth,
a deliberate mistake produced "You lost" on one side and "You win" on the other, the
quick-message chat crossed the link, and a rematch reset both sides with turns swapped.

---

### 3. Make the basketball game easier
**Asked:** I can't score, make it easier but not too easy.

**Produced:** Scrapped and rebuilt as the Home Run Derby.

**Verified:** Before rebuilding, I checked the physics and found the game was
**impossible, not hard** — maximum throw speed was 760 px/s and the hoop needed at
least 1039 to reach, so no angle could ever score. A second bug meant any shot steep
enough to drop into the rim flew off the top of the canvas first. Worth recording
because "too hard" turned out to be a bug, not a tuning problem.

---

### 4. Home Run Derby, swing with left click
**Asked:** Pitched to, swing with left mouse click, not too hard and not too easy.

**Produced:** Ten outs, timing-based swing, distance tracking, camera that zooms out
to follow the ball. Pitches quicken as you homer, then stop quickening.

**Verified:** Swept the swing across 19 timings from very early to very late. Six
scored, thirteen were outs; the home-run window measures **about 157 ms**, which is
wide enough to learn and tight enough to matter. Also confirmed taking pitches costs
nothing and wild swinging burns all ten outs.

---

### 5. Host on Netlify with continuous deployment
**Asked:** Move it off Vercel to Netlify, on my own domain, deploying from GitHub.

**Produced:** Netlify project serving `everchargeelectric.com`; GoDaddy apex A record
pointed at `75.2.60.5`; repo pushed to GitHub and linked for automatic deploys.

**Verified:** Checked DNS from the authoritative nameserver and two public resolvers,
confirmed `Server: Netlify` with a valid certificate, and loaded every page over
HTTPS. Continuous deployment proved by pushing a commit and watching the build go
`building → ready` on its own. Three blockers were found and cleared along the way:
Netlify defaults new projects to **Private** (which would have failed the "must load
for someone not signed in" rule), the GitHub app had never been authorised, and
Netlify's free plan refuses to build private repos from unverified contributors.

---

### 6. Make every game play from both sides
**Asked:** Every game playable in both directions, with a computer opponent that
actually plays — no scripted wins — and difficulty that ramps on both sides.

**Produced:**

| Game | The flip | How the computer plays |
|---|---|---|
| Snake | You place the apples | Three skill tiers: greedy, then shortest-path BFS, then BFS that refuses any move boxing it into a pocket smaller than its body |
| Breakout | It plays you, paddle vs paddle | Predicts where the ball crosses its line, folding in wall bounces; capped speed and aim error, both improving each point |
| Splat | You lay out the columns | Flies the same gravity and flap impulse you get, aiming at each gap with a misread fixed per column |
| Asteroids | You throw the rocks | Dodges whatever is closing on it, otherwise leads the nearest rock and fires, on the same controls a human gets |
| Missile | You attack, it defends | Picks the missile closest to landing, solves the intercept by iterating time-to-target, fires with scatter; tracks one at a time |
| Imitation | Play the computer | Holds the whole pattern and can genuinely slip — often while short, rarely once long |
| Derby | You pitch, it bats | Times the ball to the plate with an error that grows the more you change speeds between pitches |

**Verified — measured, not assumed:**

- **Snake:** ate 30 randomly-placed apples without crashing and reached top tier.
  Added a 25-apple cap so a round against a good AI still ends.
- **Breakout:** a player who never moves loses 7–4; a player tracking the ball
  perfectly wins 7–6. Genuinely close on both ends.
- **Splat:** clears an easy course and an alternating one, and can still be brought
  down early by awkward placements while its skill is low.
- **Asteroids:** survives 9–11 of your 18 rocks under constant fire.
- **Missile:** hammering one city fails (it saves four); spreading fire wins. The
  strategy beats it, brute force doesn't.
- **Imitation:** matchmaking takes 3.5–7 s with stepped status lines and pairs you
  with an ordinary-looking username, so an AI opponent isn't obvious.
- **Derby:** throwing one speed every pitch concedes 8 home runs; mixing speeds
  concedes 1–2.

**Bugs found by testing, and fixed:**

1. **Splat's pilot couldn't fly at all.** It predicted its fall all the way to the
   next column, so it was permanently "about to be too low", flapped nonstop and
   pinned itself to the ceiling. Replaced with a short fixed lookahead. Even then it
   clipped every gap, so I solved the steady state algebraically — the flap
   oscillation was sitting ~97 px above the line it aimed at — and set the slack to
   centre it.
2. **Derby's batter ran away with it.** Its skill ramp keyed off home runs allowed,
   so every homer made it better and the round never ended — 319 home runs from 320
   pitches. Ramp now follows pitches thrown.
3. **Derby's "mixing speeds" did nothing.** The previous pitch speed was overwritten
   before it was compared, so the surprise term was always zero.
4. **Asteroids' ramp never ran.** Skill was keyed to small rocks fully destroyed,
   which barely increments. Rebased on rocks thrown.

One correction to my own testing: an early Splat run looked broken because the test
harness hadn't stubbed the canvas's bounding rect, so every click mapped to the
bottom of the screen. The harness was wrong, not the game — though it did mask a real
bug underneath.

---

### Still mine to do
- Play each game and sign off that it's actually fun from both sides — the numbers
  above say the opponents are fair, but that's a judgement I have to make myself.
- Post in the course Slack channel about what I hit and reply to classmates.
