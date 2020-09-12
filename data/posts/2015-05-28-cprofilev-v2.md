---
layout: post
title:  cProfileV v2
date:   2015-05-28
url: null
---
I recently made some changes to [cProfileV](https://github.com/ymichael/cprofilev), adding the ability to immediately profile a script and run it at the same time.
<!--more-->

It was always a personal pain point to separately output a temporary profile object before using `cprofilev` to visualise this information and I've been meaning to add this for a while.

This also changes how cProfileV is invoked on the command-line:

1. Simply run your python program in with the -m cprofilev flag.

    $ python -m cprofilev /path/to/python/program ...

2. Navigate to <http://localhost:4000> to view the profile statistics _(even while the program is still running!)_

I've also added a `-f` flag for backward compatibility so people who like the previous method of using profile objects can continue to do so:

    $ cprofilev -f /path/to/save/output

I previously wrote about how to make sense of the profile information [here](/2014/03/08/profiling-python-with-cprofile.html).
