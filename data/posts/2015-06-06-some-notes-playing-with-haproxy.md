---
layout: post
title:  "Some notes playing with HAProxy"
date:   2015-06-06
url: null
---
I've been meaning to try out [HAProxy](http://www.haproxy.org/), a tcp/http load balancer, for a while now. Partially because I've heard many great things about it and also because of it's prevalence[^1]. I first encountered HAProxy during my internship at Quora.

Last week, I finally found some time and decided to play around with it. This post is about some interesting things came up.
<!--more-->

## Some background

Before I get to the points, it helps to know what HAProxy and Load Balancing is[^2]. Additionally, HAProxy is configured using a [configuration](http://www.haproxy.org/download/1.5/doc/configuration.txt) file that basically specifics various options and dictates its behavior. 

A simple config file would look something like this:

```
global
    maxconn 256

defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    retries 3
    option redispatch
    timeout connect  5000
    timeout client  10000
    timeout server  10000

frontend httptraffic
    bind *:80
    default_backend servers

backend servers
    server web1 192.168.1.1:80 maxconn 32
    server web2 192.168.1.2:80 maxconn 32
    server web3 192.168.1.3:80 maxconn 32
```

A large part of said _"playing"_ involved understanding the various options available and what they do.

## 1. The `maxconn`[^3] Parameter
One of the first things I was curious about was the `maxconn` parameter. According to the manual, this parameter is used to: __"Fix the maximum number of concurrent connections."__ Also, _"Excess connections will be queued by the system in the socket's listen queue and will be served once a connection closes"._

What was interesting to me, was that this value could be specified on a `global` level as well as a `server` level. Meaning that you could tell HAProxy to allow a maximum of 1000 concurrent connections but only 10 each per server.  Intuitively, it made sense that we would want this level of control but I didn't entirely understand how this would potentially affected performance or how I should go about tuning this. _If say, I only had 1 server, should my server's `maxconn` match the `global` value?_

Searching around, I found this great [question](http://stackoverflow.com/questions/8750518/difference-between-global-maxconn-and-server-maxconn-haproxy)/[answer](http://stackoverflow.com/a/8771616/1070617) on SO that essentially mirrored my thoughts. here is the relevant snippet:

> So it makes a lot of sense to let haproxy distribute the connections as fast as possible from its queue to a server with a very small maxconn. I remember one gaming site queuing more than 30000 concurrent connections and running with a queue of 30 per server ! It was an apache server, and apache is much faster with small numbers of connections than with large numbers.
> 
> Source: <http://stackoverflow.com/a/8771616/1070617>

Basically, you can think of this in terms of where incoming requests are queued/waiting. Your servers being load balanced probably are able to handle a certain number of requests concurrently before performance starts being degraded. At this point, it'll probably make sense to queue the rest of the requests at HAProxy, which is almost definitely more efficient at queueing requests.

To summarise, being able to specify and tune a different `maxconn` for HAProxy and for specific backends provides the following benefits:

1. Avoid overwhelming the application server
2. Distribute the requests more efficiently among the servers.
3. HAProxy is able to terminate the request if the client disconnects before the request is forwarded to the server.

## 2. Handling WebSockets

While limiting the maximum number of connections per backend is great for guaranteeing a certain level of performance, I started to wonder how HAProxy would handle WebSocket connections.

WebSockets[^4], unlike normal HTTP requests, provide a bi-directional link between the client and server and are long-lived. WebSocket connections typically last for a much longer time and thus the `maxconn` value for the backends handling WebSocket requests essentially dictate the number of active WebSocket connections we can handle.

As a consequence, you probably want to use a different group of servers to handle normal HTTP trafic and WebSocket traffic so that you can set a reasonable `maxconn` value for each group. Fortunately, HAProxy makes this super easy[^5].

As an example, we could instruct HAProxy to send traffic to a different group of servers if the path begins with `/websockets`.

```
frontend public
    bind *:80
    acl is_websocket path_beg -i /websockets
    use_backend ws if is_websocket
    default_backend servers

backend servers
    ...

backend ws
    ...
```

This [article](http://blog.silverbucket.net/post/31927044856/3-ways-to-configure-haproxy-for-websockets) demonstrates several other ways to achieve this.

Additionally, HAProxy has several `timeout` parameters that dictate if a connection should be closed after a period of time has elapsed. This following diagram, taken from the [HAProxy Blog](http://blog.haproxy.com/2012/11/07/websockets-load-balancing-with-haproxy/) illustrates this clearly.

![HAProxy Timeouts](/static/img/blog/haproxytimeouts.png)

Image Source: <http://blog.haproxy.com/2012/11/07/websockets-load-balancing-with-haproxy/>

So to make WebSockets work, we need to set a sensible `timeout tunnel` value so that HAProxy doesn't prematurely terminate the connection simply because its idle. The article mentioned selected `3600s` as its `timeout tunnel`.

__Do note that this timeout is reset each time a message is sent (in either direction), so the connection is only terminated if its been truly idle after the amount of time specified by this value.__

## 3. (Ephemeral) Port Exhaustion

Digging a little deeper into concurrent, long-lived connections using HAProxy, I found an interesting blog post about how ["Stack Exchange gets the most out of HAProxy."](http://brokenhaze.com/blog/2014/03/25/how-stack-exchange-gets-the-most-out-of-haproxy/). The entire post covers a great deal of detail about Stack Exchange's HAProxy config file (and is definitely worth a read) but one thing stood out:

> "We ran into something called source port exhaustion. The quick story is that you can only have ~65k ip:port to ip:port connections."

This was the first time I've heard the term "Source Port Exhaustion" and while I knew, from my Networks class, that there are ~65k port numbers, it never occured to me that this would happen. It also turns out that you probably have less than 65k ports[^6] to use and this is something that can be configured _(more on this later)_.

Furthermore, it's not just that there aren't enough "ip:port" (source ports) to connect from HAProxy to the backends, it's that the TCP sockets aren't being recycled/reused fast enough when connections are closed.

> Due to the way TCP/IP works, connections can not be closed immediately. Packets may arrive out of order or be retransmitted after the connection has been closed.
>
> <http://superuser.com/a/173542>

TCP Sockets upon closing, enter a TIME_WAIT state that exists to allow delayed or out-of-order packets to be ignored by the networking stack. This prevents delayed segments from one connection being accepted by a later connection using the same socket[^7].

__On Linux, this value is hardcoded as 60 seconds[^8].__

> Doing a little math, a webservice only needs to have a sustained load of ~230 requests per second be in danger of exhausting the number of ephemeral ports available for outgoing connections.
>
> <https://www.box.com/blog/ephemeral-port-exhaustion-and-web-services-at-scale/>

This [blog post](http://vincent.bernat.im/en/blog/2014-tcp-time-wait-state-linux.html) discusses this issue in great detail, exploring how various remedies like enabling `net.ipv4.tcp_tw_reuse` and `net.ipv4.tcp_tw_recycle` work with respect to whether ports are being exhausted on the server-side (outgoing from HAProxy to a backend) or on the "client-side" (incoming from HAProxy from the point of view of the backend).

Finally, it seems like everyone agrees that the easiest and safest thing to do with respect to this problem, is to increase the number of `(source IP, source port, destination IP, destination port)` combinations:

1. Increase the range of `net.ipv4.ip_local_port_range` on the client (HAProxy)
2. Increasing the number of ports on the server by listening to more ports
3. Increasing the number of source IPs (HAProxy).
4. Increasing the number of destination IPs.

For `3`, HAProxy provides a nice [`source` option](http://cbonte.github.io/haproxy-dconv/configuration-1.5.html#source (Alphabetically sorted keywords reference)) that specifies the source address to bind to before connecting to a server. This can be specified for specific backends and each backend can be listed multiple times, each with a different source.


## 4. Configuring the Linux kernel with `sysctl`.

After learning about how the range of local ports can be configured, I naturally wondered what other kernel settings were "mis-configured" or suboptimal for specific use cases like running HAProxy or running a application web server.

Some googling led me to this: <https://klaver.it/linux/sysctl.conf> and there were many more results for "HAProxy sysctl". I certainly do not know what most of the options do, but am definitely intrigued and going read up on them.

## Closing thoughts

I feel like I have barely scratched the surface here. I know that alot of these things really depend on each situation and each situation is different. Regardless, I feel like I learnt a fair bit just playing around with HAProxy and trying to understand some of its options.

<br>

## Footnotes
[^1]: <http://www.haproxy.org/they-use-it.html>
[^2]: <https://www.digitalocean.com/community/tutorials/an-introduction-to-haproxy-and-load-balancing-concepts>
[^3]: <http://cbonte.github.io/haproxy-dconv/configuration-1.5.html#maxconn (Alphabetically sorted keywords reference)>
[^4]: <https://developer.mozilla.org/en/docs/WebSockets>
[^5]: <http://blog.silverbucket.net/post/31927044856/3-ways-to-configure-haproxy-for-websockets>
[^6]: `cat /proc/sys/net/ipv4/ip_local_port_range`
[^7]: <http://vincent.bernat.im/en/blog/2014-tcp-time-wait-state-linux.html>
[^8]: [Line in the linux source](https://github.com/torvalds/linux/blob/f5ddcbbb40aa0ba7fbfe22355d287603dbeeaaac/include/net/tcp.h#L114)
[^9]: <http://vincent.bernat.im/en/blog/2014-tcp-time-wait-state-linux.html>