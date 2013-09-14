A question that keeps coming up regarding [MODIVLE](http://modivle.yrmichael.com) is why I'm doing it and what made me do it.

Well, here it is:

## What happened

### 27 March 2012

There was a wave of [IVLE fever](https://groups.google.com/forum/?fromgroups=#!searchin/nushackers/ivle/nushackers/9vBDb097xfY/H42RzUtu2sYJ) going around the [NUS Hackers'](http://nushackers.org) google groups. My friend [@div_arora](https://twitter.com/div_arora) basically made a [chrome extension](https://github.com/darora/IVLE-Fix) that used Twitter's Bootstrap to _re-skin_ IVLE. To be honest, I was impressed, but more than that, it made me realise how much better IVLE could look.

### 28 March 2012

After forking @div's chrome extension and mucking around with IVLE's DOM, I realise that the a browser extension wasn't going to cut it. I looked up the [IVLE's API](http://wiki.nus.edu.sg/display/ivlelapi/IVLE+LAPI+Overview) which I had previously heard of but never bothered to look up and started reading up on it. I decided to write a [javascript wrapper](https://github.com/ymichael/ivleapi) for the API not very sure what it would be used for.

### 30 March 2012

During the CS2100 lecture, I showed my friends what I had been working on. Nothing interesting happened here except that the I realised I should do something useful with the data after pulling it from IVLE.

_I reached home after the lecture. It had been a long day. I didn't feel like doing any work. I decided to continue working on MODIVLE._

Roughly 8 hours later, I had a working dropbox-like interface for IVLE's workbin. I immediately posted it on the [google group](https://groups.google.com/forum/?fromgroups=#!searchin/nushackers/ivle/nushackers/O90iO6D-do4/WKYMJCu-8S4J).

## Motivation

The truth is, when I first started this project, I didn't know what I wanted to do. I was inspired by IVLE-fix and was bored. So I played around with the API for fun.

In the period time since, a lot has changed. I now have a clearer picture of what I want MODIVLE to do, and the direction I want it to take.

Most importantly, people are using it now. **This is my motivation. To continue iterating on this application. To make it better. To make people happier. Even if its just by a little.**

## Moving Forward

MODIVLE is not finished. It probably never will be.

I have some features I hope to get in soon _(if time permits)_. Like file uploads and forum writes but thats not why its not finished.

Ideally, I'm hoping that MODIVLE outlives my time in NUS. This is the reason why it has been [open sourced](https://github.com/ymichael/modivle) from day one. I'm hoping that it'll eventually evolve into something more. Something more than a single person.
