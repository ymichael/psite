---
layout: post
title:  "Javascript testing with karma js"
date:   2014-05-10
---

It took me a while to start using [Karma js][], so I figured I write about the
final steps I took to get it working.

*I'm on osx, so your mileage may vary if you are on a different platform.*
<!--more-->

# Background
Its not very clear from the [Karma js][] landing page what it actually is. I
initially thought it was going to replace stuff like qunit or jasmine. Its not.

__Karma js is a test runner. It runs your tests.__

Basically, you writing your tests using your favorite testing framework
(`mocha`, `jasmine`, `qunit` etc.) and use karma js to run it.

Karma js runs tests in your browser(s), from your command-line.
If this doesn't sound cool yet, it will in a bit. Hopefully.

# Pre-requsites
You need to have `nodejs` and `npm` installed on your machine. If you don't, it
should be a pretty straighforward affair to get them.

# Installation
You basically need a couple of `node_modules` to get this running:

## Karma itself
- `karma` (obviously)

## The testing framework of your choice.
I'm using jasmine for my tests, but you don't have to.

- `karma-jasmine`

## The various browser launchers
I want to run my tests on all three browsers. *If you only want a subset of
them, you can remove accordingly*

- `karma-chrome-launcher`
- `karma-firefox-launcher`
- `karma-safari-launcher`

Add these dependencies into your `package.json` and install them. *(For those who
are unfamiliar, a package.json is a file in your project's root directory that
contains information about your project, such as what dependencies it
requires.)*

{% highlight json %}
// package.json
{
  "devDependencies": {
      "karma": "*",
      "karma-chrome-launcher": "*",
      "karma-firefox-launcher": "*",
      "karma-safari-launcher": "*",
      "karma-jasmine": "*"
  }
}
{% endhighlight %}

{% highlight bash %}
# bash
$ npm install
{% endhighlight %}

# Create a karma.conf file
Once you've installed the necessary node modules, you need to create a karma
configuration file.

{% highlight bash %}
$ ./node_modules/karma/bin/karma init karma.conf.js
{% endhighlight %}

Simply answer the questions accordingly.

{% highlight bash %}
# Which testing framework do you want to use ?
# Press tab to list possible options. Enter to move to the next question.
> jasmine

# Do you want to use Require.js ?
# This will add Require.js plugin.
# Press tab to list possible options. Enter to move to the next question.
> no

# Do you want to capture a browser automatically ?
# Press tab to list possible options. Enter empty string to move to the next
# question.
> Chrome
> Firefox
> Safari

# What is the location of your source and test files ?
# You can use glob patterns, eg. "js/*.js" or "test/**/*Spec.js".
# Enter empty string to move to the next question.
> *.js
>

# Should any of the files included by the previous patterns be excluded ?
# You can use glob patterns, eg. "**/*.swp".
# Enter empty string to move to the next question.
>

# Do you want Karma to watch all the files and run the tests on change ?
# Press tab to list possible options.
> yes
{% endhighlight %}

This creates a karma configuration file called `karma.conf.js` in your current
directory.

# Run karma
Finally, start karma in a separate window and watch it run your tests in the
different browsers. *Karma launches the browsers if you haven't already and
they close when you stop karma.*

{% highlight bash %}
$ ./node_modules/karma/bin/karma start karma.conf.js
{% endhighlight %}

Notice that karma runs my tests in all three browsers I specified:

![karma-running](/img/blog/karma-running.png)

[Karma js]: http://karma-runner.github.io/0.12/index.html
