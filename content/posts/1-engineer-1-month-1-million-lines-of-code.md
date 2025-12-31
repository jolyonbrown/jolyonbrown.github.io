---
title: "1 engineer, 1 month, 1 million lines of code"
date: 2025-12-23T17:56:27Z
slug: "1-engineer-1-month-1-million-lines-of-code"
cover:
  image: "/images/screenshot-2025-12-23_17-45-24-1-1.png"
  alt: "A screenshot of a LinkedIn job advertisement aiming to eliminate C code in windows using AI"
  caption: ""
draft: false
---

I saw quite a lot of comment on this job advertisement on LinkedIn by Galen Hunt, who is a distinguished engineer at Microsoft.

![A screenshot of a LinkedIn job advertisement aiming to eliminate C code in windows using AI](/images/image-1-1-1.png "1 million lines? Surely not everyone said")

There was widespread derision on Twitter/X in response to this which I think is a bit unfair. Quite a lot of it seemed to be about the use of Rust (which seems to relate to some cultural issues I don't care about in this context). Yet more of it was about the wisdom of replacing 'battle hardened' code with 'AI generated slop' which I thought was a bit of a basic take. Yes, we all know that history is full of disasters when it comes to upgrades, replacements and rewrites. Yes, we all know that it's possible to generate bad code using these tools. This might well end up being scrapped for all kinds of reasons, but that's Microsoft's issue.

My interest, though, was in the disbelief and condemnation of the '1 engineer, 1 month, 1 million lines of code' statement. 'Pure insanity', 'Cult of AI', 'Who is going to review 50K lines of code a day', 'Delusional' etc. You get the idea.

I disagree with these views.

Of course '1 million lines of code' on its own is a meaningless metric. What I think people missed here was the likely change in how software development is progressing and what the types of roles involved in it might look like in the future.

I think we need to accept that in a lot of firms most future code won't be written by humans or reviewed by them either. Humans will act more like a combination of Product Owner/Lead Engineer of their own division of agents. They'll steer the direction of the systems and collaborate with them to achieve the desired results. I mean, this isn't science fiction here. This is happening now. We review behaviour, test results and semantic correctness. No-one will be manually reviewing 50K lines of code daily.

The 1 million lines a month makes sense as a target if you stop thinking about engineers as typists and start thinking about them as directing automated code factories at scales way above what we have now.

And why should we stop there? It's easy to imagine humans moving up another abstraction level. Instead of engineers orchestrating with detailed technical judgement, it might be the case that they simply define broad constraints and technical criteria and let the system figure everything out, reviewing the proposed solutions (again, this is happening now to a certain extent).

I don't see this as a problem. We've already been around this loop. Back in the day I'd write assembly for the Commodore 64. I knew exactly what was happening on the machine as a whole each cycle. I knew all the memory registers and the tricks needed to get the results I wanted. Now when I'm writing a higher level language I don't check the machine code that gets executed. By and large I trust the compiler to get things right and just make sure tests pass. We're just abstracting upwards in the same way.

Where we end up in the medium term is with humans concentrating on how testing and validation of these resulting complex systems works. Perhaps we find our current anthropocentric models of QA and engineering departments don't translate here. The AI code factories might simply generate and verify in a single process while exploring the solution space defined by the constraints and success criteria we give them.

Personally, I love the idea that we are trying to get to a point where we can say - here's a billion lines of legacy code to look at, here's what we want to achieve, here are the constraints - and actually having a fighting chance of that working. I hope they succeed.
