# Contributing

The most useful thing you can send is **a pack**: one scene's worth of
challenges, its own way out, and its own names for how well you did. San
Francisco is just the one that ships in the box, and nothing in the core knows
about it.

Start with **[docs/writing-a-pack.md](docs/writing-a-pack.md)**, then copy
`src/packs/example`, which is a working template with both challenge kinds in
about fifty lines.

## Setup

```bash
npm install
npm run dev        # / is the demo, /hostile.html is the style isolation check
npm test           # builds, then exercises the server end to end
npm run typecheck
```

CI runs `typecheck` and `test` on Node 22 and 24. Both need to pass.

## What gets a pull request rejected

Not to be discouraging, but these are the four ways a challenge fails, and all
four have happened during this project's own development.

**A tile people can argue about.** Every answer has to be beyond dispute. A
name that provokes an argument is a broken answer key, not a hard question, and
it comes out regardless of who turns out to be right. If you are not certain,
leave it out.

**A decoy anyone can eliminate on sight.** The first version of the YC challenge
used invented company names, which tested nothing: spotting a made-up word is a
word-shape task. Every decoy should be real, plausible, and wrong only to
someone who knows the scene. The best one in the San Francisco pack is *"a
convertible with the top down"*, which is an ordinary vehicle that is wrong here
only because you would have to know it is freezing.

**Ambiguity dressed as difficulty.** If a solver has to ask "does that count?",
the tile is broken rather than hard. Difficulty comes from obscurity. Check
every new tile against its nearest neighbour in the opposite set.

**A riddle.** Either the answer is derivable from knowledge, or every tile is
funny on its own. Never neither. A knowledge challenge pays out when you get it
right; a joke challenge pays out while you read the options, so a wrong answer
still entertained you. A challenge with neither, one whose answer is "none of
them" or that turns on spotting a meta-joke, leaves someone feeling tricked with
nothing to show for it.

## Two things a pack must have

**An escape hatch.** Gating a form on local knowledge locks out everyone who
does not have it. Give your pack a real way out and score it as its own tier,
not as a failure.

**More tiles than it shows.** `show` draws a subset per run, so a second person
gets a different board. Sixteen tiles showing nine is most of what makes a pack
worth passing along.

## Writing tiles

Start phrases lowercase unless they open with a proper noun. Ten tiles each
beginning with a capital "A" read as ten shouted sentences; lowercase makes each
one a continuation of the prompt above it.

Hints cannot state a count. Sampling changes how many of each side appear, so
"three of these are for tourists" is both a giveaway and wrong.

## Reporting a wrong answer

Every challenge in this repository is a factual claim, and some of them will be
wrong. Open a **wrong answer key** issue rather than a pull request, so the
disagreement is visible before the change lands.

## Style

Two spaces, no semicolons, single quotes. Prettier is not wired up, so match the
file you are editing. Comments explain why something is the way it is, not what
the line does.

No em dashes in copy or comments. Use a comma or a full stop.
