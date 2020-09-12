---
layout: post
title:  Python Testing with nose for beginners
date:   2014-12-17
url: null
---
I've been meaning to write a simple primer for unit testing in python ever since
I realized how invaluable writing tests are. You must be thinking that everyone
knows to test they're code. I did too, but I didn't do it. It seemed hard and I
was lazy. Fortunately, its really easy to get started.

This blog post is about how to get started with [`nose`][nose] to write unit
tests for your python code with as little friction as possible.

<!--more-->

# Motivation
If you have no experience writing tests, I fully empathize with you. I
previously only wrote tests when it was 'necessary', which meant I never wrote
them. Consequently, during my internships, I found out how little experience I
had writing tests and testable code. However, once I was over the initial
hurdle, it was easy to see the benefits and flexibility that having tests
affords you.

I figured as with most things, this is a skill that I could get better at by
doing repeatedly. I started writing tests for most of my code, even one-off
[class][cs4248] [assignments][cs3245] and projects that didn't really care too
much about them.

# Installation
The setup is really easy. Just `pip` install `nose`. (easy\_install
works too).

```bash
pip install nose
```

# [Nosetests][nose]
The great thing about [`nose`][nose], is how easy it is to write and run tests.
Installing `nose` adds a `nosetests` command that you can invoke to run your
tests inside the folder you're currently at.

By default, `nosetests` finds:

- files or folders that contain `/[Tt]est/` in their name, eg. `model_test.py`,
  `modelTest.py` etc.
- within these files, functions and classes with `/[Tt]est/` in their name will
  be run as tests. eg. `test_function_simple`, `test_function_zero` etc.

# Test files and writing your first test
Where you put your tests is a matter of preference, I prefer to have my tests in
the same place as my files for ease of locating them and importing the code to
be tested.

If I have `/path/to/project/src/model.py`, I would have a corresponding
`/path/to/project/src/test_model.py`. So all tests for `model.py` will go into
`test_model.py`.

Inside your test files, you simply import the code you're testing and test it.
[_I'll be using examples from one of my class assignments so feel free to refer to it for the full source._][cs3245]

Here is an example:

```py
import model


def test_model_total_count():
    m = model.Model()
    assert m.total_count() == 0

    m.incr_gram_count(('h',))
    m.incr_gram_count(('e',))
    m.incr_gram_count(('l',))
    m.incr_gram_count(('l',))
    m.incr_gram_count(('o',))

    assert m.total_count() == (5 + 4)
    assert m.total_count(include_smoothing=False) == 5
```

In the above example, I import the `model` file and test the `total_count`
method of the `Model` object before and after incrementing the 'grams' in the
model.

Saving this file and running `nosetests` on the command line will run
`test_model_total_count`!

# Some other things about nose
If you've written tests before, or at least heard of them, you'll know that the
example above is really simple and you probably will need a couple more things
to get going.

## `setup` and `teardown`
Chances are, you're writing a couple of tests in each test file that are highly
related. `nose` makes it really easy to write `setup` and `teardown` functions
for your tests:

```py
def setup():
    # setup here..
    pass

def teardown():
    # teardown here..
    pass
```

Simply name them as such and the test runner will run the functions before and after
each test. _(There are other acceptable variants, which I'm leaving out that will be run
by the test runner)_.

## assert equals
In the example above, I used the built-in `assert` function in python. However,
when the test fails, the error message isn't really helpful, it'll say that it
expected `True` but got `False` instead.

`nose` provides a nice `nose.tools._eq_` that takes two values and compares them
using the `==` operator. Upon failure, it gives a nice message, something like
_"expected 5 but was given 4"_, helping you to indentify and fix the source of the
broken test quickly.


## Other bells and whistles
For the sake of making this as simple as possible, I have glossed over
many of `nose`'s functionalities. You probably will use some of them eventually
but they are not necessary to start writing simple tests and get into the habit
of writing testable code. _Trust me, it gets easier._

Stuff like:

- Using a test class instead of test functions
- Specific setup and teardown functions for specific test functions
- Running only some tests (and not all of them)
- Testing that an exception was raised in a test
- ...

# Closing thoughts
Hopefully you feel like writing unit tests in python is really simple after
reading this. If you find yourself in the need for mocking and stubing objects
in your tests, I highly recommend the [`mockito-python`][mockito-python] library
that is model after the java library of the same name. It integrates seamlessly
with `nose` and is really intuitive to use.

Happy testing!

 [cs4248]: https://github.com/ymichael/cs4248
 [cs3245]: https://github.com/ymichael/cs3245-hw
 [nose]: https://nose.readthedocs.org/en/latest/
 [mockito-python]: https://code.google.com/p/mockito-python/
