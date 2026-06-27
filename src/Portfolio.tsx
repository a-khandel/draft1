import { useEffect, useRef, useState } from 'react'
import './Portfolio.css'

/**
 * Portfolio content. Everything a visitor sees is driven from this object,
 * so it's trivial to customise without touching markup or styles.
 */
const PROFILE = {
  name: 'Aman Khandel',
  role: 'Software Engineer',
  tagline: 'I build fast, accessible web apps and the systems behind them.',
  location: 'Remote · Available for new opportunities',
  github: 'a-khandel',
  email: 'hello@example.com',
  linkedin: 'https://www.linkedin.com/',
  resumeUrl: '/resume.html',
}

const ABOUT = [
  `I'm a software engineer who loves turning ambiguous problems into clean, reliable
   products. I care about performance, accessibility, and writing code that the next
   person can read without a map.`,
  `Day to day I work across the stack — React and TypeScript on the front end, Node and
   edge runtimes on the back end — and I'm happiest shipping things that real people use.`,
]

const SKILLS: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL'] },
  { group: 'Frontend', items: ['React', 'Next.js', 'Vite', 'CSS / Tailwind', 'Accessibility'] },
  { group: 'Backend', items: ['Node.js', 'Cloudflare Workers', 'REST', 'GraphQL', 'PostgreSQL'] },
  { group: 'Tooling', items: ['Git', 'Docker', 'CI/CD', 'Vitest', 'Playwright'] },
]

type Project = {
  title: string
  description: string
  tags: string[]
  link: string
}

const PROJECTS: Project[] = [
  {
    title: 'Spatial Agent Studio',
    description:
      'A React + Cloudflare Workers app that lets an AI agent draw and reason on an infinite canvas. Streaming responses, custom tools, and real-time highlights.',
    tags: ['React', 'TypeScript', 'Cloudflare', 'AI'],
    link: 'https://github.com/a-khandel',
  },
  {
    title: 'Edge Analytics Pipeline',
    description:
      'A privacy-first analytics service running entirely at the edge. Sub-millisecond ingestion, durable aggregation, and a dashboard that loads instantly.',
    tags: ['Workers', 'Durable Objects', 'SQL'],
    link: 'https://github.com/a-khandel',
  },
  {
    title: 'Design System Kit',
    description:
      'An accessible component library with theming, dark mode, and zero-runtime styling. Used across multiple internal products to ship UI faster.',
    tags: ['React', 'Accessibility', 'Design Systems'],
    link: 'https://github.com/a-khandel',
  },
]

/** Reveal-on-scroll wrapper using IntersectionObserver (graceful fallback to visible). */
function Reveal({ children, as: Tag = 'div', className = '', ...rest }: any) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.15 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${shown ? 'is-visible' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

type GhEvent = {
  id: string
  type: string
  repo: { name: string }
  created_at: string
}

/** Live GitHub activity — fetched client-side with a graceful offline fallback. */
function GitHubActivity({ username }: { username: string }) {
  const [events, setEvents] = useState<GhEvent[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`https://api.github.com/users/${username}/events/public?per_page=30`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((data: GhEvent[]) => {
        if (!cancelled) setEvents(Array.isArray(data) ? data.slice(0, 6) : [])
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [username])

  const describe = (e: GhEvent) => {
    const repo = e.repo?.name ?? 'a repository'
    const map: Record<string, string> = {
      PushEvent: `Pushed commits to ${repo}`,
      PullRequestEvent: `Opened a pull request in ${repo}`,
      IssuesEvent: `Worked on an issue in ${repo}`,
      CreateEvent: `Created something in ${repo}`,
      WatchEvent: `Starred ${repo}`,
      ForkEvent: `Forked ${repo}`,
    }
    return map[e.type] ?? `${e.type.replace('Event', '')} on ${repo}`
  }

  return (
    <div className="gh-activity" aria-live="polite">
      <div className="gh-activity__head">
        <span className="gh-dot" aria-hidden="true" />
        <span>Live GitHub activity</span>
        <a
          className="gh-activity__link"
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          @{username}
        </a>
      </div>

      {!events && !error && (
        <ul className="gh-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="gh-item gh-item--loading" aria-hidden="true">
              <span className="gh-skel" />
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="gh-fallback">
          Couldn&apos;t reach GitHub right now — see the latest work directly on{' '}
          <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer noopener">
            my profile
          </a>
          .
        </p>
      )}

      {events && events.length > 0 && (
        <ul className="gh-list">
          {events.map((e) => (
            <li key={e.id} className="gh-item">
              <span className="gh-item__text">{describe(e)}</span>
              <time className="gh-item__time" dateTime={e.created_at}>
                {new Date(e.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </li>
          ))}
        </ul>
      )}

      {events && events.length === 0 && (
        <p className="gh-fallback">No public activity to show yet — plenty more on the way.</p>
      )}
    </div>
  )
}

export default function Portfolio() {
  const year = new Date().getFullYear()

  return (
    <div className="portfolio">
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      {/* NAV */}
      <header className="nav">
        <div className="nav__inner">
          <a className="nav__brand" href="#hero" aria-label="Back to top">
            {PROFILE.name.split(' ').map((w) => w[0]).join('')}
          </a>
          <nav aria-label="Primary">
            <ul className="nav__links">
              <li><a href="#about">About</a></li>
              <li><a href="#skills">Skills</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section id="hero" className="hero" aria-labelledby="hero-heading">
          <div className="hero__bg" aria-hidden="true">
            <span className="blob blob--1" />
            <span className="blob blob--2" />
            <span className="blob blob--3" />
          </div>
          <div className="hero__content">
            <p className="hero__eyebrow">{PROFILE.location}</p>
            <h1 id="hero-heading" className="hero__title">
              Hi, I&apos;m <span className="grad-text">{PROFILE.name}</span>
              <br />
              {PROFILE.role}
            </h1>
            <p className="hero__tagline">{PROFILE.tagline}</p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="#projects">
                View my work
              </a>
              <a
                className="btn btn--ghost"
                href={PROFILE.resumeUrl}
                target="_blank"
                rel="noreferrer noopener"
                download
              >
                Download résumé
              </a>
            </div>
            <GitHubActivity username={PROFILE.github} />
          </div>
        </section>

        {/* ABOUT */}
        <Reveal as="section" id="about" className="section" aria-labelledby="about-heading">
          <div className="section__inner">
            <h2 id="about-heading" className="section__title">
              <span className="section__num">01</span> About
            </h2>
            <div className="about">
              {ABOUT.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </Reveal>

        {/* SKILLS */}
        <Reveal as="section" id="skills" className="section section--alt" aria-labelledby="skills-heading">
          <div className="section__inner">
            <h2 id="skills-heading" className="section__title">
              <span className="section__num">02</span> Skills
            </h2>
            <div className="skills">
              {SKILLS.map((g) => (
                <div className="skills__group" key={g.group}>
                  <h3 className="skills__group-title">{g.group}</h3>
                  <ul className="badges" aria-label={`${g.group} skills`}>
                    {g.items.map((s) => (
                      <li className="badge" key={s}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* PROJECTS */}
        <Reveal as="section" id="projects" className="section" aria-labelledby="projects-heading">
          <div className="section__inner">
            <h2 id="projects-heading" className="section__title">
              <span className="section__num">03</span> Projects
            </h2>
            <div className="projects">
              {PROJECTS.map((p) => (
                <article className="card" key={p.title}>
                  <h3 className="card__title">{p.title}</h3>
                  <p className="card__desc">{p.description}</p>
                  <ul className="badges badges--sm">
                    {p.tags.map((t) => (
                      <li className="badge badge--sm" key={t}>
                        {t}
                      </li>
                    ))}
                  </ul>
                  <a
                    className="card__link"
                    href={p.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`View ${p.title} on GitHub`}
                  >
                    View project →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CONTACT */}
        <Reveal as="section" id="contact" className="section section--alt" aria-labelledby="contact-heading">
          <div className="section__inner section__inner--center">
            <h2 id="contact-heading" className="section__title section__title--center">
              <span className="section__num">04</span> Contact
            </h2>
            <p className="contact__lead">
              Have a role, a project, or just want to say hi? I&apos;d love to hear from you.
            </p>
            <div className="contact__actions">
              <a className="btn btn--primary" href={`mailto:${PROFILE.email}`}>
                Email me
              </a>
              <a
                className="btn btn--ghost"
                href={`https://github.com/${PROFILE.github}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                GitHub
              </a>
              <a className="btn btn--ghost" href={PROFILE.linkedin} target="_blank" rel="noreferrer noopener">
                LinkedIn
              </a>
            </div>
          </div>
        </Reveal>
      </main>

      <footer className="footer">
        <p>
          © {year} {PROFILE.name} · Built with React + TypeScript
        </p>
      </footer>
    </div>
  )
}
