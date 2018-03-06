---
layout: post
title:  "I suck at hackathons"
date:   2012-06-07
archive: true
---

I attended the recently concluded [#shdh](http://www.superhappydevhouse.sg/). It was awesome. There was great coffee, beer, food and above all, a great crowd. 

Sadly, I don't have anything to show for it.
<!--more-->

I started the event learning [Haskell](http://learnyouahaskell.com/). But I gave up once I hit `Functors` and `Monads`. I then set out to making a [Gemnasium](https://gemnasium.com) clone for `nodejs` projects.

> Gemnasium keeps you up to date on the gems that matter to you.
We parse your Ruby projects’ gem dependencies and notify you when new versions are released 
<footer>- <cite>Gemnasium.com</cite></footer>

I proceeded to do the following: 

- hooked up github's oath. 
- retrieved a list of the authenticated user's repositories.
- checked each repo for a `package.json` file and/or a `node_modules` directory.
- for each relevant repository, detect the dependencies
- check their version against the npm registry.
- notify the user if and when any dependencies are outdated

As it turns out, `rubygems` exposes a web hook which `npm` does not. However, the npm registry is hosted on couchdb which exposes a ["changes" feed](http://isaacs.iriscouch.net/registry/_changes?feed=continuous).

Anyway, as I reached the last part, fatigue got the better of me and I stopped. Probably also due to the many unknowns that I hadn't figured out.

As a result, I have nothing to show for #shdh. Nothing to show for the day's worth of "hacking". 

Many people would call this a failure. A waste of time. But I regret nothing. Neither do I see it as a failure. If anything it was a great experience. if I had to redo the entire thing, I probably do the same thing. 

In many ways, hackathons are like races. You spend time hacking in isolation (training) and come race-day, you pit your skills against other hackers and see how you fare against the playing field. 

Its a great time to get a sense of where you stand and perhaps, recalibrate your ego.

I suck at hackathons but I like them anyway. Now back to training.