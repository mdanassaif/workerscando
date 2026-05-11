"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components";
import styles from "@/styles/pages/about.module.css";

export default function AboutClient() {
  return (
    <main className={styles.page}>
      <Navbar />

      <div className={styles.content}>

        {/* ── Hero ── */}
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>A real story</span>
            <h1 className={styles.heroTitle}>
              Never used Cloudflare.<br />
              Jumped in anyway.
            </h1>
            <p className={styles.heroSub}>
              No prior account. No tutorial. Just a prompt that asked
              <em> "what should I build?"</em> — and a Workers setup that was
              shockingly, stupidly simple. This is what happened next.
            </p>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className={styles.statsBar}>
          <div className={styles.statsInner}>
            <div className={styles.stat}>
              <span className={styles.statNum}>8</span>
              <span className={styles.statLabel}>Tools live</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>6</span>
              <span className={styles.statLabel}>Built in streak</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>~2mo</span>
              <span className={styles.statLabel}>Disappeared for</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>100</span>
              <span className={styles.statLabel}>The real goal</span>
            </div>
          </div>
        </div>

        {/* ── Chapter 1 — The start ── */}
        <section className={styles.chapter}>
          <div className={styles.chapterInner}>
            <div className={styles.chapterText}>
              <span className={styles.chapterNum}>01 — How it started</span>
              <h2 className={styles.chapterTitle}>A prompt and a blank Cloudflare account</h2>
              <p className={styles.chapterBody}>
                I&apos;d never actually used Cloudflare for anything before — not even
                for DNS. But Workers kept showing up everywhere and I got curious.
                So I just… created an account and tried it.
              </p>
              <p className={styles.chapterBody}>
                First thing I did was ask an AI: <em>"what are some useful small tools
                I could build on Cloudflare Workers?"</em> Got a list back. Picked one.
                Wrote the code. Deployed. It worked.
              </p>
              <p className={styles.chapterBody}>
                That was it. No weeks of setup. No &ldquo;getting the environment right.&rdquo;
                Just <strong>wrangler deploy</strong> and it was live, globally, instantly.
                I was genuinely surprised by how simple it felt.
              </p>
            </div>
            <div className={styles.chapterMedia}>
              <div className={styles.tweetFrame}>
                <div className={styles.tweetFrameBar}>
                  <span className={styles.tweetFrameDot} />
                  <span className={styles.tweetFrameDot} />
                  <span className={styles.tweetFrameDot} />
                </div>
                <Image
                  src="/firstpostbyfayaz.png"
                  alt="The tweet from Fayaz that brought attention to the project"
                  width={480}
                  height={320}
                  className={styles.tweetImg}
                />
              </div>
              <p className={styles.mediaCaption}>
                Fayaz (<a href="https://x.com/fayazara" target="_blank" rel="noopener noreferrer" className={styles.mention}>@fayazara</a>) noticed what I was building
              </p>
            </div>
          </div>
        </section>

        {/* ── Chapter 2 — The streak ── */}
        <section className={`${styles.chapter} ${styles.chapterAlt}`}>
          <div className={styles.chapterInner}>
            <div className={styles.chapterText}>
              <span className={styles.chapterNum}>02 — The streak</span>
              <h2 className={styles.chapterTitle}>First tool live. Brother messaged.</h2>
              <p className={styles.chapterBody}>
                Once I started I couldn&apos;t stop. URL shortener, dead man&apos;s switch,
                OG image generator, job board — one after another. The energy was real.
              </p>
              <p className={styles.chapterBody}>
                The very first tool went live and my brother messaged almost immediately.
                He&apos;d seen it. His take? Grab a domain, make it a proper thing, ship
                100 tools. He even had the name — <span className={styles.domainName}>workerscando.com</span>.
                The ideas were always mine, things I ran into in daily life and thought
                <em> &ldquo;why doesn&apos;t this exist?&rdquo;</em> But the push to
                commit to 100 and actually own it? That was him.
              </p>
            </div>
            <div className={styles.chapterMedia}>
              <div className={styles.tweetFrame}>
                <div className={styles.tweetFrameBar}>
                  <span className={styles.tweetFrameDot} />
                  <span className={styles.tweetFrameDot} />
                  <span className={styles.tweetFrameDot} />
                </div>
                <Image
                  src="/bruhsuggested.png"
                  alt="Brother's reaction and suggestions after seeing the first tools"
                  width={480}
                  height={320}
                  className={styles.tweetImg}
                />
              </div>
              <p className={styles.mediaCaption}>My brother messaged right after the first one dropped.</p>
            </div>
          </div>
        </section>

        {/* ── Chapter 3 — Fayaz notice ── */}
        <section className={styles.chapter}>
          <div className={styles.chapterInner}>
            <div className={styles.chapterText}>
              <span className={styles.chapterNum}>03 — The validation</span>
              <h2 className={styles.chapterTitle}>&ldquo;Dude is cracked&rdquo;</h2>
              <p className={styles.chapterBody}>
                Fayaz — a builder I really respect in the Workers/Cloudflare space —
                came across the project and said what he said. That kind of offhand
                compliment from someone who actually knows their stuff hits different.
              </p>
              <p className={styles.chapterBody}>
                It wasn&apos;t about clout. It was just confirmation that the thing I was
                doing had merit. That the gap I was filling was real. I still think about
                that when the motivation dips.
              </p>
            </div>
            <div className={styles.chapterMedia}>
              <div className={styles.tweetFrame}>
                <div className={styles.tweetFrameBar}>
                  <span className={styles.tweetFrameDot} />
                  <span className={styles.tweetFrameDot} />
                  <span className={styles.tweetFrameDot} />
                </div>
                <Image
                  src="/hesaiddudeiscracked.png"
                  alt="Fayaz's reaction — 'dude is cracked'"
                  width={480}
                  height={320}
                  className={styles.tweetImg}
                />
              </div>
              <p className={styles.mediaCaption}>Still kind of unreal this happened.</p>
            </div>
          </div>
        </section>

        {/* ── The idea is simple ── */}
        <section className={styles.manifesto}>
          <div className={styles.manifestoInner}>
            <h2 className={styles.manifestoTitle}>The idea is simple.</h2>
            <div className={styles.manifestoGrid}>
              <div className={styles.manifestoCard}>
                <span className={styles.manifestoIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </span>
                <h3 className={styles.manifestoCardTitle}>Edge-first</h3>
                <p className={styles.manifestoCardBody}>
                  Every tool runs on Cloudflare&apos;s global network. No servers to
                  manage, no cold starts, latency in single-digit milliseconds.
                </p>
              </div>
              <div className={styles.manifestoCard}>
                <span className={styles.manifestoIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                    <path d="M7 7h.01"/>
                  </svg>
                </span>
                <h3 className={styles.manifestoCardTitle}>Real problems</h3>
                <p className={styles.manifestoCardBody}>
                  Every tool comes from something I actually ran into. Not
                  invented problems — things I needed and couldn&apos;t find, built.
                </p>
              </div>
              <div className={styles.manifestoCard}>
                <span className={styles.manifestoIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                </span>
                <h3 className={styles.manifestoCardTitle}>Open source</h3>
                <p className={styles.manifestoCardBody}>
                  Every Worker, every component, every line is public. Fork it,
                  learn from it, build on top of it — no strings attached.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── The gap ── */}
        <section className={styles.gap}>
          <div className={styles.gapInner}>
            <div className={styles.gapLeft}>
              <span className={styles.gapNum}>04</span>
              <h2 className={styles.gapTitle}>Then I disappeared for two months.</h2>
            </div>
            <div className={styles.gapRight}>
              <p className={styles.gapBody}>
                Life happened. Momentum died. I stopped shipping and I knew it was
                happening and somehow that made it worse — every day I didn&apos;t build
                felt like a bigger debt to pay back later.
              </p>
              <p className={styles.gapBody}>
                I genuinely regret that gap. Not in a dramatic way — just the quiet
                kind of regret you feel when you let something good go cold. The
                streak was working. The ideas were there. I just stopped.
              </p>
              <p className={styles.gapBodyAccent}>
                So this is me paying that debt back.
              </p>
            </div>
          </div>
        </section>

        {/* ── The comeback ── */}
        <section className={styles.comeback}>
          <div className={styles.comebackInner}>
            <span className={styles.eyebrow}>Chapter 05 — Now</span>
            <h2 className={styles.comebackTitle}>
              Back with new ideas.<br />Building things that matter.
            </h2>
            <p className={styles.comebackBody}>
              The goal hasn&apos;t changed: 100 tools on Cloudflare Workers. But the
              approach is different now. Less &ldquo;ship fast and move on,&rdquo; more
              &ldquo;build something genuinely useful, understand it deeply, then ship it.&rdquo;
            </p>
            <p className={styles.comebackBody}>
              Every tool from here is a real thing I&apos;d use. Every Worker is something
              I&apos;m learning from. If it helps someone else along the way — even better.
            </p>
            <div className={styles.comebackLinks}>
              <Link href="/projects" className={styles.comebackBtnPrimary}>
                See all tools
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Builder ── */}
        <section className={styles.builder}>
          <div className={styles.builderInner}>
            <div className={styles.builderBadge}>The builder</div>
            <p className={styles.builderName}>Mohd Anas</p>
            <p className={styles.builderBio}>
              Full-stack dev. Edge computing enthusiast. Deeply interested in the
              Cloudflare Workers ecosystem. Open to internships and interesting problems.
            </p>
            <div className={styles.builderLinks}>
              <a
                href="https://x.com/mdanassaif"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.builderLink}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                @mdanassaif
              </a>
              <a href="mailto:iamanassaif@gmail.com" className={styles.builderLink}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                iamanassaif@gmail.com
              </a>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
