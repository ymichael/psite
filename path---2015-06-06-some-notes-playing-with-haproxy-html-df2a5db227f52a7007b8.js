webpackJsonp([0xb4f31a509e2e],{362:function(e,t){e.exports={data:{markdownRemark:{html:'<p>I\'ve been meaning to try out <a href="http://www.haproxy.org/">HAProxy</a>, a tcp/http load balancer, for a while now. Partially because I\'ve heard many great things about it and also because of it\'s prevalence<sup id="fnref-1"><a href="#fn-1" class="footnote-ref">1</a></sup>. I first encountered HAProxy during my internship at Quora.</p>\n<p>Last week, I finally found some time and decided to play around with it. This post is about some interesting things came up.</p>\n<!--more-->\n<h2>Some background</h2>\n<p>Before I get to the points, it helps to know what HAProxy and Load Balancing is<sup id="fnref-2"><a href="#fn-2" class="footnote-ref">2</a></sup>. Additionally, HAProxy is configured using a <a href="http://www.haproxy.org/download/1.5/doc/configuration.txt">configuration</a> file that basically specifics various options and dictates its behavior. </p>\n<p>A simple config file would look something like this:</p>\n<div class="gatsby-highlight">\n      <pre class="language-none"><code class="language-none">global\n    maxconn 256\n\ndefaults\n    log     global\n    mode    http\n    option  httplog\n    option  dontlognull\n    retries 3\n    option redispatch\n    timeout connect  5000\n    timeout client  10000\n    timeout server  10000\n\nfrontend httptraffic\n    bind *:80\n    default_backend servers\n\nbackend servers\n    server web1 192.168.1.1:80 maxconn 32\n    server web2 192.168.1.2:80 maxconn 32\n    server web3 192.168.1.3:80 maxconn 32</code></pre>\n      </div>\n<p>A large part of said <em>"playing"</em> involved understanding the various options available and what they do.</p>\n<h2>1. The <code>maxconn</code><sup id="fnref-3"><a href="#fn-3" class="footnote-ref">3</a></sup> Parameter</h2>\n<p>One of the first things I was curious about was the <code>maxconn</code> parameter. According to the manual, this parameter is used to: <strong>"Fix the maximum number of concurrent connections."</strong> Also, <em>"Excess connections will be queued by the system in the socket\'s listen queue and will be served once a connection closes".</em></p>\n<p>What was interesting to me, was that this value could be specified on a <code>global</code> level as well as a <code>server</code> level. Meaning that you could tell HAProxy to allow a maximum of 1000 concurrent connections but only 10 each per server.  Intuitively, it made sense that we would want this level of control but I didn\'t entirely understand how this would potentially affected performance or how I should go about tuning this. <em>If say, I only had 1 server, should my server\'s <code>maxconn</code> match the <code>global</code> value?</em></p>\n<p>Searching around, I found this great <a href="http://stackoverflow.com/questions/8750518/difference-between-global-maxconn-and-server-maxconn-haproxy">question</a>/<a href="http://stackoverflow.com/a/8771616/1070617">answer</a> on SO that essentially mirrored my thoughts. here is the relevant snippet:</p>\n<blockquote>\n<p>So it makes a lot of sense to let haproxy distribute the connections as fast as possible from its queue to a server with a very small maxconn. I remember one gaming site queuing more than 30000 concurrent connections and running with a queue of 30 per server ! It was an apache server, and apache is much faster with small numbers of connections than with large numbers.</p>\n<p>Source: <a href="http://stackoverflow.com/a/8771616/1070617">http://stackoverflow.com/a/8771616/1070617</a></p>\n</blockquote>\n<p>Basically, you can think of this in terms of where incoming requests are queued/waiting. Your servers being load balanced probably are able to handle a certain number of requests concurrently before performance starts being degraded. At this point, it\'ll probably make sense to queue the rest of the requests at HAProxy, which is almost definitely more efficient at queueing requests.</p>\n<p>To summarise, being able to specify and tune a different <code>maxconn</code> for HAProxy and for specific backends provides the following benefits:</p>\n<ol>\n<li>Avoid overwhelming the application server</li>\n<li>Distribute the requests more efficiently among the servers.</li>\n<li>HAProxy is able to terminate the request if the client disconnects before the request is forwarded to the server.</li>\n</ol>\n<h2>2. Handling WebSockets</h2>\n<p>While limiting the maximum number of connections per backend is great for guaranteeing a certain level of performance, I started to wonder how HAProxy would handle WebSocket connections.</p>\n<p>WebSockets<sup id="fnref-4"><a href="#fn-4" class="footnote-ref">4</a></sup>, unlike normal HTTP requests, provide a bi-directional link between the client and server and are long-lived. WebSocket connections typically last for a much longer time and thus the <code>maxconn</code> value for the backends handling WebSocket requests essentially dictate the number of active WebSocket connections we can handle.</p>\n<p>As a consequence, you probably want to use a different group of servers to handle normal HTTP trafic and WebSocket traffic so that you can set a reasonable <code>maxconn</code> value for each group. Fortunately, HAProxy makes this super easy<sup id="fnref-5"><a href="#fn-5" class="footnote-ref">5</a></sup>.</p>\n<p>As an example, we could instruct HAProxy to send traffic to a different group of servers if the path begins with <code>/websockets</code>.</p>\n<div class="gatsby-highlight">\n      <pre class="language-none"><code class="language-none">frontend public\n    bind *:80\n    acl is_websocket path_beg -i /websockets\n    use_backend ws if is_websocket\n    default_backend servers\n\nbackend servers\n    ...\n\nbackend ws\n    ...</code></pre>\n      </div>\n<p>This <a href="http://blog.silverbucket.net/post/31927044856/3-ways-to-configure-haproxy-for-websockets">article</a> demonstrates several other ways to achieve this.</p>\n<p>Additionally, HAProxy has several <code>timeout</code> parameters that dictate if a connection should be closed after a period of time has elapsed. This following diagram, taken from the <a href="http://blog.haproxy.com/2012/11/07/websockets-load-balancing-with-haproxy/">HAProxy Blog</a> illustrates this clearly.</p>\n<p><img src="/static/img/blog/haproxytimeouts.png" alt="HAProxy Timeouts"></p>\n<p>Image Source: <a href="http://blog.haproxy.com/2012/11/07/websockets-load-balancing-with-haproxy/">http://blog.haproxy.com/2012/11/07/websockets-load-balancing-with-haproxy/</a></p>\n<p>So to make WebSockets work, we need to set a sensible <code>timeout tunnel</code> value so that HAProxy doesn\'t prematurely terminate the connection simply because its idle. The article mentioned selected <code>3600s</code> as its <code>timeout tunnel</code>.</p>\n<p><strong>Do note that this timeout is reset each time a message is sent (in either direction), so the connection is only terminated if its been truly idle after the amount of time specified by this value.</strong></p>\n<h2>3. (Ephemeral) Port Exhaustion</h2>\n<p>Digging a little deeper into concurrent, long-lived connections using HAProxy, I found an interesting blog post about how <a href="http://brokenhaze.com/blog/2014/03/25/how-stack-exchange-gets-the-most-out-of-haproxy/">"Stack Exchange gets the most out of HAProxy."</a>. The entire post covers a great deal of detail about Stack Exchange\'s HAProxy config file (and is definitely worth a read) but one thing stood out:</p>\n<blockquote>\n<p>"We ran into something called source port exhaustion. The quick story is that you can only have ~65k ip:port to ip:port connections."</p>\n</blockquote>\n<p>This was the first time I\'ve heard the term "Source Port Exhaustion" and while I knew, from my Networks class, that there are ~65k port numbers, it never occured to me that this would happen. It also turns out that you probably have less than 65k ports<sup id="fnref-6"><a href="#fn-6" class="footnote-ref">6</a></sup> to use and this is something that can be configured <em>(more on this later)</em>.</p>\n<p>Furthermore, it\'s not just that there aren\'t enough "ip:port" (source ports) to connect from HAProxy to the backends, it\'s that the TCP sockets aren\'t being recycled/reused fast enough when connections are closed.</p>\n<blockquote>\n<p>Due to the way TCP/IP works, connections can not be closed immediately. Packets may arrive out of order or be retransmitted after the connection has been closed.</p>\n<p><a href="http://superuser.com/a/173542">http://superuser.com/a/173542</a></p>\n</blockquote>\n<p>TCP Sockets upon closing, enter a TIME_WAIT state that exists to allow delayed or out-of-order packets to be ignored by the networking stack. This prevents delayed segments from one connection being accepted by a later connection using the same socket<sup id="fnref-7"><a href="#fn-7" class="footnote-ref">7</a></sup>.</p>\n<p><strong>On Linux, this value is hardcoded as 60 seconds<sup id="fnref-8"><a href="#fn-8" class="footnote-ref">8</a></sup>.</strong></p>\n<blockquote>\n<p>Doing a little math, a webservice only needs to have a sustained load of ~230 requests per second be in danger of exhausting the number of ephemeral ports available for outgoing connections.</p>\n<p><a href="https://www.box.com/blog/ephemeral-port-exhaustion-and-web-services-at-scale/">https://www.box.com/blog/ephemeral-port-exhaustion-and-web-services-at-scale/</a></p>\n</blockquote>\n<p>This <a href="http://vincent.bernat.im/en/blog/2014-tcp-time-wait-state-linux.html">blog post</a> discusses this issue in great detail, exploring how various remedies like enabling <code>net.ipv4.tcp_tw_reuse</code> and <code>net.ipv4.tcp_tw_recycle</code> work with respect to whether ports are being exhausted on the server-side (outgoing from HAProxy to a backend) or on the "client-side" (incoming from HAProxy from the point of view of the backend).</p>\n<p>Finally, it seems like everyone agrees that the easiest and safest thing to do with respect to this problem, is to increase the number of <code>(source IP, source port, destination IP, destination port)</code> combinations:</p>\n<ol>\n<li>Increase the range of <code>net.ipv4.ip_local_port_range</code> on the client (HAProxy)</li>\n<li>Increasing the number of ports on the server by listening to more ports</li>\n<li>Increasing the number of source IPs (HAProxy).</li>\n<li>Increasing the number of destination IPs.</li>\n</ol>\n<p>For <code>3</code>, HAProxy provides a nice <a href="http://cbonte.github.io/haproxy-dconv/configuration-1.5.html#source" title="Alphabetically sorted keywords reference"><code>source</code> option</a> that specifies the source address to bind to before connecting to a server. This can be specified for specific backends and each backend can be listed multiple times, each with a different source.</p>\n<h2>4. Configuring the Linux kernel with <code>sysctl</code>.</h2>\n<p>After learning about how the range of local ports can be configured, I naturally wondered what other kernel settings were "mis-configured" or suboptimal for specific use cases like running HAProxy or running a application web server.</p>\n<p>Some googling led me to this: <a href="https://klaver.it/linux/sysctl.conf">https://klaver.it/linux/sysctl.conf</a> and there were many more results for "HAProxy sysctl". I certainly do not know what most of the options do, but am definitely intrigued and going read up on them.</p>\n<h2>Closing thoughts</h2>\n<p>I feel like I have barely scratched the surface here. I know that alot of these things really depend on each situation and each situation is different. Regardless, I feel like I learnt a fair bit just playing around with HAProxy and trying to understand some of its options.</p>\n<br>\n<h2>Footnotes</h2>\n<div class="footnotes">\n<hr>\n<ol>\n<li id="fn-1">\n<p><a href="http://www.haproxy.org/they-use-it.html">http://www.haproxy.org/they-use-it.html</a></p>\n<a href="#fnref-1" class="footnote-backref">↩</a>\n</li>\n<li id="fn-2">\n<p><a href="https://www.digitalocean.com/community/tutorials/an-introduction-to-haproxy-and-load-balancing-concepts">https://www.digitalocean.com/community/tutorials/an-introduction-to-haproxy-and-load-balancing-concepts</a></p>\n<a href="#fnref-2" class="footnote-backref">↩</a>\n</li>\n<li id="fn-3">\n<p>&#x3C;<a href="http://cbonte.github.io/haproxy-dconv/configuration-1.5.html#maxconn">http://cbonte.github.io/haproxy-dconv/configuration-1.5.html#maxconn</a> (Alphabetically sorted keywords reference)></p>\n<a href="#fnref-3" class="footnote-backref">↩</a>\n</li>\n<li id="fn-4">\n<p><a href="https://developer.mozilla.org/en/docs/WebSockets">https://developer.mozilla.org/en/docs/WebSockets</a></p>\n<a href="#fnref-4" class="footnote-backref">↩</a>\n</li>\n<li id="fn-5">\n<p><a href="http://blog.silverbucket.net/post/31927044856/3-ways-to-configure-haproxy-for-websockets">http://blog.silverbucket.net/post/31927044856/3-ways-to-configure-haproxy-for-websockets</a></p>\n<a href="#fnref-5" class="footnote-backref">↩</a>\n</li>\n<li id="fn-6">\n<p><code>cat /proc/sys/net/ipv4/ip_local_port_range</code></p>\n<a href="#fnref-6" class="footnote-backref">↩</a>\n</li>\n<li id="fn-7">\n<p><a href="http://vincent.bernat.im/en/blog/2014-tcp-time-wait-state-linux.html">http://vincent.bernat.im/en/blog/2014-tcp-time-wait-state-linux.html</a></p>\n<a href="#fnref-7" class="footnote-backref">↩</a>\n</li>\n<li id="fn-8">\n<p><a href="https://github.com/torvalds/linux/blob/f5ddcbbb40aa0ba7fbfe22355d287603dbeeaaac/include/net/tcp.h#L114">Line in the linux source</a></p>\n<a href="#fnref-8" class="footnote-backref">↩</a>\n</li>\n<li id="fn-9">\n<p><a href="http://vincent.bernat.im/en/blog/2014-tcp-time-wait-state-linux.html">http://vincent.bernat.im/en/blog/2014-tcp-time-wait-state-linux.html</a></p>\n<a href="#fnref-9" class="footnote-backref">↩</a>\n</li>\n</ol>\n</div>',frontmatter:{title:"Some notes playing with HAProxy",date:"06 June, 2015"},fields:{slug:"/2015/06/06/some-notes-playing-with-haproxy.html"}}},pathContext:{slug:"/2015/06/06/some-notes-playing-with-haproxy.html"}}}});
//# sourceMappingURL=path---2015-06-06-some-notes-playing-with-haproxy-html-df2a5db227f52a7007b8.js.map