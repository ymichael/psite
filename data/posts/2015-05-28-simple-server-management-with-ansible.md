---
layout: post
title:  Simple Server Management with Ansible
date:   2015-05-28
archive: true
url: null
---

Recently, I discovered [Ansible](http://www.ansible.com/home), a tool to remotely manage servers. I haven't used _chef_ or _puppet_ but I hear its similar but simpler. It helps, for now, to think of Ansible as simply "remote ssh commands".

My ansible _plays_ for server management can be found here: <https://github.com/ymichael/ansible-ubuntu-box>
<!--more-->

## Motivation

I find myself having to do the same setup each time I start a new server[^1] _(I use Ubuntu 14.04)_. Simple things like:

- creating a new user
- adding my public key to the authorized key file
- adding this user to the sudoers file
- disabling root ssh access
- disabling password ssh access
- update apt cache
- configuring UFW to allow/deny some ports
- ...

Because I do this rather infrequently, I usually google for a guide. Additionally, this process is mundane and time consuming. _A perfect candidate for automation!_

In addition to one-off user setup, I also find myself having to install various software on my servers:

- git
- nodejs
- fail2ban
- ...

These are more variable and depend on what I'll eventually be using the server for _(application deployment using ansible probably is a whole blog post by itself)_.

## My [ansible plays](https://github.com/ymichael/ansible-ubuntu-box)

I basically have two plays:

- `newuser.yml`: which creates and sets up a new user
- `main.yml`: which installs various things and secures the server

The `newuser.yml` play is one-off per server, whereas I update the `main.yml` play and run it whenever I want to install something new.

To set up a new box, I simply edit my host file and add the node's ip address to it.

## Ansible _plays_?

The first confusing thing about ansible, at least for me, was the terminology. But once you get past that, you'll start to wonder how you got by without it.

- You can think of a __play__ as a list of __tasks__.
- Each __task__ is akin to running an "ssh command"

If you start googling/reading about Ansible, you'll see terms like _playbooks_ and _roles_. For the sake of simplicity, I'm not going to go over them since we won't be using them.

Ansible plays are written in [YAML](http://yaml.org/) and super readable. You don't really need to be an expert in the language. You probably can figure out the syntax once you've seen some examples of it.

```yaml
# Example task in yaml
# sudo apt-get upgrade
- name: Update all packages to the latest version
  sudo: yes
  apt: upgrade=safe
```

## The host file

A __hosts__ file in ansible simply tells it which servers to talk to. _This file is a simple ini file (so you can apply labels and group servers)._

For starts you can simply put the ip address of the server on the first line of the file.

```bash
$ echo NODE_IP > hosts
```

## Running plays

Finally, in order to run a play, you run the following command:

```bash
$ ansible-playbook -i /path/to/hosts /path/to/yaml/file
```

## Closing thoughts

I know that I've barely scratched the surface here. There is so much more that can be done but its a start. I'm currently trying to use Ansible to run remote `docker` commands to set up and link containers on my server to deploy and update applications easily. I'll probably write about that or release the plays on github when I'm done.

I've also found [ansible-galaxy](https://galaxy.ansible.com/) to be a rich source of plays and references on how to accomplish certain things.

<br>

## Footnotes

[^1]: I use Digital Ocean and its awesome. My referral link: <https://www.digitalocean.com/?refcode=94be0d6caba4>.
