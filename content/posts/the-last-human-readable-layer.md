---
title: "The Last Human-Readable Layer"
date: 2026-02-16
slug: "the-last-human-readable-layer"
cover:
  image: "/images/corsairgalleon.png"
  alt: "The Corsair Galleon 100 keyboard"
  caption: "The new Corsair Galleon 100 looks like it might be an awesome vibecoding keyboard"
draft: false
---

I got properly nerd sniped by @elonmusk a couple of days ago.

I'd been mulling over where the AI code writing trend might be heading and procrastinating on a half-finished essay draft for a couple of weeks. Then Elon summarised it in a single sentence and I kicked myself. "Code itself will go away in favor of just making the binary directly."

Cue hoots of derision and wonder in equal measure.

So I thought I'd better finish the essay.

---

In 1976, Steve Wozniak was shaking. He'd written a version of BASIC for the Apple II prototype and decided to test it by recreating his Breakout game – the one he'd blown Atari away with by designing it in hardware in 4 days using only 45 chips (and no sleep) - in software.

> "In 30 minutes ..I had tried 100 variations that would have taken me 10 years in hardware if I could have even done it"

> "I did this on my apartment floor, in Cupertino. I just remember the green rug, and the wires going into the TV set, and I called Steve Jobs over and showed him how I could quickly make one little change in my BASIC program and the bricks would all change color. And I could make another change, and the paddle would get bigger, or I could move the score to a different place. We knew that games would never be the same - I was shaking, because games were software finally."

A new layer had formed beneath his feet.

A few weeks ago, although it feels like months, I went through a process lots of others have experienced. I had a specific task to extract some text and convert everything into a nice epub format. Before I would have searched for a library or a package, evaluated the various options, read documentation, handled the inevitable mismatch between what the options I'd found did and what I actually wanted.

Instead, I described what I wanted to Claude and five minutes later I had a working script. Completely bespoke and exactly to my requirements. I didn't bother with the search because describing what I wanted was faster than finding something close enough. I wasn't shaking. But maybe I should have been.

Every abstraction shift which introduces a new layer follows the same pattern. The old guard (of which I have often been a member) says the new way is wasteful, opaque and undisciplined. They're absolutely right about what's lost. They're completely wrong about whether it matters.

Hardware to software: "You can't see what the machine is doing."
Assembly to C: "You're wasting cycles."
C to Python: "It's slow, you don't control memory."
Libraries and frameworks: "Black boxes. You don't understand your dependencies. Could be full of malware"
And now we have the move from human-written code to AI-generated code: "It's slop."

The criticism is broadly the same. And the new layer wins anyway, because speed beats purity once you cross a threshold.

But I think there's something potentially different happening this time.

Natural language is the new layer for coding. This is fine (as the dog in the burning house says) - we all understand that's happening, even if many of us disagree with the direction. Right now it even follows a familiar pattern: you describe what you want, the AI produces code, and that code compiles down through all the layers we've spent decades building to the bedrock of hardware. We still get code artifacts! Something we can read, review, stick in version control and curse at in a year when we try and understand it again. Whether we actually even want to look at AI produced code is the hot topic of the moment.

But what if those intermediate layers vanished? What if the AI translated our intent directly into binary, leaving nothing in between to inspect?

What if code - that last human readable layer – just... goes away?

Let's not forget that the infrastructure we treat as permanent is younger than some developers working today.

Git: 2005. GitHub: 2008. Stack Overflow: 2008. npm: 2010.

All of these were created to solve human coordination problems. We have limited memory, so we need version control. Knowledge gets trapped in individual heads, so we need documentation and somewhere to ask questions. Code is expensive to write, so we share it through package managers. These aren't laws of physics. They're solutions to constraints that might not be the constraints anymore. We can even see evidence of this with the diminishing of Stack Overflow.

So here's where things get a little speculative. If/when AI develops persistent global memory – where every solution, every edge case, every conversation is retained and iterated upon - then what? It doesn't forget, so no need for documentation. It doesn't need to share with itself, so no need for packages. Its "versioning" is just its state at a given moment. Plus it would already be everywhere, so no need for distribution.

Code reuse becomes implicit rather than explicit. Not a repo. Not a dependency. Just absorbed capability. The epub converter I built doesn't go on GitHub. It becomes something the LLM knows how to do. GitHub doesn't die exactly, it just becomes internal. The infrastructure gets absorbed into the intelligence. Humans can still use all of the infrastructure I mentioned before, but I'd hazard this becomes way more niche. Why bother, when the cost of software drops to near zero?

For this to actually work - for AI to become infrastructure rather than just a tool - some problems need solving and they're (unfortunately) rather large ones. They're all being worked on though as far as I can see.

Determinism: Same input, same output, every time. We've all seen this often isn't the case.
Auditability: Can we see the AI's working, all the way down? They're pretty (fundamentally?) opaque.
Stability: Does AI provide a foundation that doesn't shift? Not yet. A new model appears every few months, with different behaviours each time.

The infrastructure we have now offers all three. The AI that might replace it offers none of them to the degree we need. Until these conditions are met, AI stays in relatively low-stakes lanes (although this is rapidly changing). My epub converter was fine, but I'd be avoiding flying on planes where Claude had written the flight control software.

Solving these problems is worth trillions I think. Whoever cracks deterministic, auditable, stable AI inherits the entire coordination layer of software development (and possibly the Earth).

Most people aren't thinking about this yet, hence the derision in response to Elon's comments.

They're arguing about whether AI code is good enough. Whether developers will have jobs or whether Copilot/Codex/Claude Code is useful.

I think the deeper shift is underneath those questions. AI isn't just a tool that writes code. It's becoming the substrate that code runs on. The layer everything else sits above.

Wozniak saw games become software in half an hour on a floor in Cupertino. We might be watching software become something else. The last human-readable layer dissolving into the ones below it. I'm not predicting this definitely happens and I can't imagine it would be on the timescale mentioned by Elon. I'm just noting the trajectory and the things we might want to preserve before they become... quaint? Things like redundancy, independence and the ability to route around damage. Wozniak was shaking because he saw what was coming. Maybe we should be too.
