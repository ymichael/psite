---
layout: post
title:  "Build and run eclipse java projects from the command line"
date:   2014-09-24
url: null
---
__You can skip the context of this post if all you need is the commands.__

# Some context
Recently, I had to work on a Java assignment. I created a Java project in
Eclipse and jumped right into the assignment.

This was great as I got started really quickly, writing tests, running them,
debugging my code, stepping through them in the debugger, fixing compile time
errors etc. Eclipse handled all these things without much setup on my part.

However, for my assignment, the final submission required me build and run my
java program from the command line. This shouldn't be a big problem (I thought)
and it wasn't, the only unfortunate things was that googling around for a solution
took longer than I expected.
<!--more-->

_I had expected StackOverflow to already contain the answer to my question since
I figured someone probably faced the same issue before._


I found the following:

- [Java - Build and run eclipse project from command line](http://stackoverflow.com/questions/5441565/java-build-and-run-eclipse-project-from-command-line)
- [Compile and run Eclipse Project from command prompt](http://stackoverflow.com/questions/18902934/compile-and-run-eclipse-project-from-command-prompt)
- [Build Eclipse Java Project from Command Line](http://stackoverflow.com/questions/206473/build-eclipse-java-project-from-command-line)
- [Can I run command line program created by eclipse](http://stackoverflow.com/questions/2276219/can-i-run-from-command-line-program-created-by-eclipse)

All of which were not particularly helpful for my situation..

To be clear, I wanted

- Simple `javac` and `java` commands that I could run (or
add to a `Makefile`) such that the `.class` files generated would go into the
`bin` folder created in the eclipse project. _(So running it via the command line
would be similar to running it in eclipse in terms of what files were
generated.)_
- Possibly a way to run my `junit` tests from the command line too. (less
  important).

# My project setup.
My project structure is as follows:

```bash
cs5223
  |- .classpath
  |- .project
  |- src
      |- cs5223
          |- Server.java
          |- Player.java
          |- Game.java
  |- bin
  |- test
      |- cs5223
          |- PlayerTest.java
          |- GameTest.java
```

# Building the project
Run the following command to compile your `.java` file in `src` and put them in `bin`

```bash
javac -d bin/ -cp src /path/to/java/file
```

 My package was called `cs5223` and I was trying to build `cs5223.Server.java`
 _(which was the entry point into my project)._

```bash
javac -d bin/ -cp src src/cs5223/Server.java
```

# Running the project
Once you've compiled your `.java` files, you run them using the following command.

```bash
java -cp bin JAVA_CLASS
```

My `Server` class had the following fully qualified package path:
`cs5223.Server` so I ran the following command.

```bash
java -cp bin cs5223.Server
```


# Running my junit tests
This required downloading a [`junit` jar](https://github.com/junit-team/junit/wiki/Download-and-Install)
which I placed in my root folder. _(Pretty sure you can avoid doing this, but this was cleaner imo)_

```bash
# Building the tests.
javac -cp junit-4.8.1.jar:src -d test/ \
    test/cs5223/GameTest.javacva \
    test/cs5223/PlayerTest.java

# Runing the tests
java -cp test:bin:junit-4.8.1.jar orrg.junit.runner.JUnitCore \
    cs5223.GameTest \
    cs5223.PlayerTest
```

_Semicolons are used to demarcate multiple paths._

