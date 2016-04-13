---
layout: post
title:  "Thoughts on Page Load Performance"
date:   2016-04-10
---
This blog post is part learning notes and part open thoughts on how to make
sense of the myriad of great information available for web developers trying to
profile/optimize their sites.

A large part of this is understanding how pages load in browsers and where the
biggest bottlenecks are. Very broadly, time taken for a page to load can be
broken down into time spent *inside* your server (generating the page), and time
spent outside your server (network and in the browser). Most often, the latter
is going to be a large chunk of the time taken. To quote: [Nate Berkopec's
must-read piece on Ludicriously Fast Page
Loads](https://www.nateberkopec.com/2015/10/07/frontend-performance-chrome-timeline.html)[^0]:

> Server response times, while easy to track and instrument, are ultimately a
> meaningless performance metric from an end-user perspective. End-users don't
> care how fast your super-turbocharged bare-metal Node.js server is - they care
> about the page being completely loaded as fast as possible.

Broadly, there are a number of variables that affect your page's performances.
Things like network latency, payload size, assets, actual markup on your page,
proper caching etc. This post focuses on time spent outside your server and some
things you should be thinking about.
<!--more-->

## What do we really care about?

Two things you probably should care about for a page load are:

1. __How long before your users see anything?__
2. __How long before your users can interact with the component you care most
   about?__ *(eg. Submit some content, Expand some truncated content, Perform some
   action)*

Its hard to underscore just how important executing well on these two things
are. _You've already gone through the trouble of building a really great product
that people want to see/use. The countless hours of engineering/ranking/pixel
pushing is all for nought if the users leaves before viewing any of it._

Before 1, your users are just staring at a loading spinner and a blank page -
making this a particularly important period of time, standing between users and
the content they care about _(which is why they are visiting your site in the
first place)_. This is the basis for the term 'Critical Render Path'. There are
a lot of resources on how to optimize it and this is exactly what it does:
reducing the time between users and your site's content.

> Optimizing the critical rendering path refers to prioritizing the display of
> content that relates to the current user action.[^5]

__After 1 and before 2, users can see your content but are unable to interact
with your site__. They can't perform any actions on your site (like leave a
comment, read more etc). I think about the relationship between these two
different things as - The first makes sure that users stick around long enough
to matter.  The second ensures that users have a good experience quickly and are
able to perform actions they/you care about.

For both these things, we want to:
1. Track it as a metric effectively
2. Understand what actually blocks it from happening sooner
3. Diagnose, investigate and fix and relevant blockers.

## Understanding page loads

One thing that makes it hard to reason/think about page load performance is that
there's just so much going on for just a _simple_ request.

A really *handwavvy* list of things that happen during a page load/request:

1. Browsers request a page
2. DNS lookup *(if not cached already)*
3. Redirect maybe?
4. TCP connection
5. TLS *(if is https, session resumption maybe?)*
6. *Server does its work*
7. First byte
8. Gets the HEAD
9. Parses the incoming HTML
10. Sees a CSS link tag.
11. Request CSS *(we cannot paint till we get this)*
12. Sees a JS subresource *(is it async?, if not, block till we get it)*
13. Can we paint yet? Is CSS in yet?
14. ...
15. first paint - User sees content *(but probably cannot click on things yet
    because Javascript..)*
16. User is able to interact with content
17. *... (images come in, async js comes in)*
18. window.onload event.

Add cache misses, spotty connections, multiple connections at once and it becomes
really hard to intuitively figure out which parts are contributing the most to
the slowness or waiting time.

Oh yea, if you use web fonts. There's that too[^7]. Browsers don't like
prefetching fonts until they realise they actually need it. They also dislike
rendering system fonts while waiting and requesting for your fancy web font[^8],
leading to more time before users see your content.

I left out where most of the navigation timing events fire in the list above -
things like DOMInteractive DOMContentLoaded etc because they depend to some
extent on the mark up on your page.

For a more in-depth deep dive into the nitty gritty details that go into a page
load: you should read [Nate's post](
https://www.nateberkopec.com/2015/10/07/frontend-performance-chrome-timeline.html)
linked above. This [video](https://www.youtube.com/watch?v=XeMDXlJ051s) also
does a good job describing some of the basics of how browsers treat JS and CSS
with respect to rendering.

## The Numbers

The great thing about the current state of client side performance is that there
are lots of browser APIs and information available to track the numbers we
really care about:

* There's the **Navigation Timing API**[^1] - which basically contains timestamps of
  events related to the page load
* There's **First Paint**[^2] available on some browsers, that tell you when the
  browser first painted something visually to the user.
* There's the **Resource Timing API**[^3] - which is basically Navigation Timing but
  for your subresources (JS, CSS, Images etc)

There's a really nice [bookmarklet](http://kaaes.github.io/timing/)[^4] that makes
is really easy to visualize and reason about navigation timing information. It
produces something like this:

![navigation timing visualization](/img/blog/navtiming.png)

It breaks up the various phases of a request into network, server and browser
which makes it really intuitive to reason about. I highly recommend giving it a
go. _I find it particularly useful to visualize navigation timing under multiple
different conditions (network, cache etc) and try and figure out when certain subresources
come in, paint happens etc without looking at the actual network tabs just to
test my understanding of what is happening. It works wonders. No, really._

## How long before your users see anything? _(aka First Meaningful Paint)_

Earlier in this post, I mentioned that we really care about two things. This is
the first of them. One way to measure this is via the first paint event which
gives us a good proxy to when users begin to see content. __However it important
to be aware that this number potentially isn't meaningful to the extent that
your first paint doesn't show anything useful to the user__.

The real number we want that's a little harder to measure is first _meaningful_
paint.

Take the following filmstrip of <quora.com> as an example:

![Quora film strip](/img/blog/quora-filmstrip.png)

First paint happened at 779ms but really, we care about the paint at 1.37s.
Users care about the pain at 1.37s. I'm not sure how to go about measuring this
in production easily but this particular differentiation helps us to the extent
that we can go about debugging slow paint times with a better idea of what we're
trying to move.

Oh, if you're wondering how I got this filmstrip, you can thank that awesome
people working on Chrome DevTools[^13]. _You probably can figure this out by
just fiddling with devtools for a bit - hint: its in the network tab and an icon
that looks like a video camera_.

First paint is blocked by a number of things:

0. **TTFB (Time to first byte)**: Often, network latency is going to be a big
   factor for first paint. You want to make sure that your server responds
   quickly[^14] which basically involves auditing everything that happens
   between request start and first byte which involves the DNS lookup, initial
   TCP handshake, TLS negotiation ... up to when your server returns its first
   byte.

1. **HTML**: This is obvious but your content needs to be there before the
   browser can render it. Often, you'd want to prioritise above the fold (stuff
   the user can see and is in their viewport) and your HTML/markup should
   reflect that.[^15]

2. **CSS payload**: If you have any external stylesheet, this needs
   to be fetched before the browser will render anything after it. If your users
   have to fetch 50KB of css just to see the logo of your site, you probably
   have some low hanging wins there.

   > By default CSS is treated as a render blocking resource, which means that
   > the browser will hold rendering of any processed content until the CSSOM is
   > constructed. Make sure to keep your CSS lean, deliver it as quickly as
   > possible, and use media types and queries to unblock rendering.[^16]

3. **Blocking JS**: Any non async javascript tag is going to block rendering of
   content after it. This really shouldn't be happening but its something to
   be aware of since you might need this for certain things. _Its always worth
   considering if any time spent here blocking paint can be spent after we paint
   instead._

Using a combination of Navigation Timing and Resource Timing, we can figure out
when and how often any of the above blocks first paint. This will probably
differ based on your mark up and what optimizations you have in place. It'll
also vary based on cache hit/miss cases.

Knowing which of these form the bottleneck for you application's first paint can
go a long way in helping you meaningfully work towards make it faster. Oh I
highly recommend watching/reading a number bunch of perf
audits[^9][^10][^11][^12] in the wild - very informative and practically
applicable.[^17]

### How long before your users an interact with stuff they care about?

This second metric is a little more tricky and varies more based on the set up of
your javascript and the purpose of your page.*For clarification, this shouldn't
be confused with the DOMInteractive event in Navigation Timing*. What I'm
referring to here is something that you'll probably need to define for your site
- some core action that users take when on your site that relies on javascript.

The reason top level metrics and numbers in navigation timing here break down is
that they aren't granular enough. For instance:

- `LoadEventEnd` is probably an upper bound of this number but probably includes
  a lot of unnecessary things like images that probably make it more noisy than
  we'd like. As your javascript complexity increases, you probably have some
  long tail of interactions that you don't care as much and timeliness is less
  important there.
- `DOMContentLoaded` is fired when your intial DOM is completely loaded and
  parsed but doesn't account for async javascript files which probably/might be
  required before your core action is functional.

_I find this [page](http://kaaes.github.io/timing/info.html) really useful as a
cheatsheet on what each event in Navigation Timing means and often find myself
referring to it._

## Closing thoughts

There's an age old adage about measuring and profiling before trying to optimise
anything. There's no reason why it shouldn't hold true for client side
performance. More often than not, I've been surprised when measuring something
or when some improvement didn't move some metrics as much as I expected it to.

In the above two client side page load metrics, there are often multiple variables
that affect them for different sets of users: things like users on mobile, new
users (more cache misses) - making it all the more important to first have a
good understanding of where the bottlenecks in your site actually are.

## Footnotes
[^0]: No seriously, if you had to choose, just read his post and skip this.
[^1]: [Navigation Timing API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API)
[^2]: Chrome - `chrome.loadTimes().firstPaintTime`. You should probably use this [library](https://github.com/addyosmani/timing.js/) by Addy Osmani.
[^3]: [Resource Timing API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API/Using_the_Resource_Timing_API)
[^4]: <http://kaaes.github.io/timing/>
[^5]: <https://developers.google.com/web/fundamentals/performance/critical-rendering-path/?hl=en>
[^7]: [Good primer on best practices working with web fonts by Ilya Grigorik](https://www.igvita.com/2014/01/31/optimizing-web-font-rendering-performance/)
[^8]: Nice history on web font rendering - <https://dev.opera.com/articles/better-font-face/>
[^9]: [Paul Irish walks through Reddit Mobile in a PR](https://github.com/reddit/reddit-mobile/issues/247)
[^10]: [More Paul Irish Audits](http://www.paulirish.com/2015/advanced-performance-audits-with-devtools/)
[^11]: [Perf audit of Tumblr's Dashboard](https://docs.google.com/document/d/1E2w0UQ4RhId5cMYsDcdcNwsgL0gP\_S6SDv27yi1mCEY/edit?pref=2&pli=1)
[^12]: <http://www.perf-tooling.today/audits>
[^13]: <https://developers.google.com/web/updates/2015/07/devtools-digest-film-strip-and-a-new-home-for-throttling?hl=en>
[^14]: <https://plus.google.com/+IlyaGrigorik/posts/GTWYbYWP6xP>
[^15]: The early bytes of your page are premium first class HTTP seats. Make them worth your while.
[^16]: <https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-blocking-css?hl=en>
[^17]: I spend a lot of time trying to replicate and understand these perf audits. I highly recommend giving them a go.
