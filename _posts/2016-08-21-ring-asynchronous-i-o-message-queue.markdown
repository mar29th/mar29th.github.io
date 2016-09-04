---
layout: post
title: RingMQ From Grounds Up - Prereqs
date: 2016-08-21T21:05:48-05:00
comments: true
---

## Intro

[Ring](https://github.com/mar29th/ring) is a message queue framework
written in Python. As of alpha version, it supports transmitting
arbitrary length data through TCP communication using asynchronous
poll-and-respond mechanism.

In this and following posts I'll share the process of making this
library. This post talks about the prerequisite knowledge that powers
this library. I assume the reader has no knowledge of asynchronous
of any sort, but has understanding of how different kernel represents files.
If you're an experienced programmer in asynchronous networking, you may
skip this one.


## What for

Douban implemented [DPark](https://github.com/douban/dpark) based
on [Matei Zaharia's paper on Spark](http://people.csail.mit.edu/matei/papers/2012/nsdi_spark.pdf)
. It worked perfectly until the team decided to port it to PyPy. ZeroMQ
seems unstable on PyPy and incurred coredumps, so I was assigned the
task to rid DPark of ZeroMQ. To be as native and reusable as possible,
I started out making a new message queue framework as a replacement
for ZeroMQ (PyZMQ in our case).


## Prerequisites

1. A kernel that supports asynchronous I/O and its paradigm.
2. An event loop that continuously performs "callback-poll-I/O" cycle.

More on those later.


## Kernel Support (Polling Mechanisms)

We need kernel's help to do asynchronous networking. Basically we would
need to tell kernel to monitor an inbound connection, and some point in future
we would ask kernel if there's any connection that we have registered is available.
The kernel would tell us which connections are ready for read/write.
This very action of asking is called "polling".

 
POSIX standard defines `select()` mechanism to support polling, but
different implementations usually has its own improved support:

* `epoll()`, Edge-Triggered Polling. Provided by Linux. Polling is
approximately O(1).

* `kqueue()`, Kernel Queue, first provided by FreeBSD. Now also 
exists in some other BSD distributions including macOS.
Polling is approximately O(1).

* `select()`, Select function, as its name suggests. Its performance
degrades as number of open connections (files) increase. Polling is O(n),
where `n` is the largest file identifier value provided to `select()`.

* `poll()`, UNIX standard poll. Polling performance is O(n), but is
slightly better than `select()`, since `n` here correlates to the total
number of files monitored.


There are other mechanisms to do asynchronous polling, such as Windows'
I/O completion ports. Those mechanisms are not of interest in this
library, and so will not be discussed in this blog post.


## Event loops

[Wikipedia](https://en.wikipedia.org/wiki/Event_loop)
explains event loops as follows:

> The event loop ... is a programming construct that waits for and
dispatches events or messages in a program. It works by making a request
to some internal or external "event provider"
(that generally blocks the request until an event has arrived),
and then it calls the relevant event handler ("dispatches the event").

To be more precise, the event loop (or IO loop) used in Ring has the
following phases in each loop interaction, and also in such order:

1. If there's any event triggered in previous loop iterations,
execute the associated callback handlers.
2. Check timeout events. If we should respond to some timeout event,
run the timeout's associated handler. Consider it as a specialized
version of phase 1, only that we specifically handle timeout events.
3. Poll, using the mechanisms described above based on platform
environments. We get a potentially empty list of files that the kernel
determines ready. For each ready file, polling also has indication
whether the file is readable, writable or in error.
4. Respond to poll events. If there was any file ready, either read
or write based on what phase 3 told us. This phase should __only__ do
minimal I/O event response, i.e. read/write __prepared__ data, or respond
to error events. If appropriate, fire an event to some callback _on next
iteration_ (e.g. data in buffer are sufficient for parsing).
Do no try to compute data in this phase. That should be done in phase 1.

There are variations on how the phases are defined. Some implementations
(especially ZeroMQ) combine phases 1, 2 and 4,
and place the combined phase after polling, so overall it becomes:

1. Poll, as in phase 3 previously.
2. Respond to poll and do everything, Including network read/write/error
handling, __and__ data parsing.

This form of event loop has certain advantage that avoids the loop
spending too much time on either CPU-bound (phase 1 previously)
or network I/O-bound work (phase 4 previously). It however is a bit
too customized that other modules cannot make use of the loop and
register/fire asynchronous events on the loop, i.e. not reusable.


## Next

In the next post I'll talk about the specific implementations of Ring,
especially the structure and special considerations necessary under
a Python environment.
