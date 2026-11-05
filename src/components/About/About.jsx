import { useEffect, useMemo, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../context/LanguageContext'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import ScrollReveal from '@/components/reactbits/ScrollReveal'
import { FlyingHeading } from './FlyingHeading'
import { OrbitPortrait } from './OrbitPortrait'
import { readScrolled } from './pinned'
import {
  HEADING_INTRO,
  PORTRAIT_REVEAL,
  PORTRAIT_SCROLL,
  PORTRAIT_SCROLL_COMPACT,
  TEXT_WINDOWS,
} from './portraitConfig'
import styles from './About.module.css'

const clamp01 = (value) => Math.min(1, Math.max(0, value))

export function About() {
  const { t } = useLanguage()
  const { about } = t
  const stageRef = useRef(null)
  const innerRef = useRef(null)

  // Each text is revealed within its own window of the pinned scroll.
  const windowed = useMemo(
    () => (from, to) => () => clamp01((readScrolled(stageRef.current) - from) / (to - from)),
    [],
  )
  // Narrow screens: the portrait sits above the heading (still pinned and animated
  // like on large screens), and the paragraphs follow below, outside the pinned
  // stage (there is no room for them next to or under the portrait).
  const compact = useMediaQuery('(max-width: 1024px)')

  // The empty space between the bottom of the portrait + heading and the bottom of
  // the pinned stage. The paragraphs below are pulled up over it (About.module.css),
  // so they follow the heading directly instead of after a screen's worth of nothing.
  const [slack, setSlack] = useState(0)
  useEffect(() => {
    const stage = stageRef.current
    const inner = innerRef.current
    if (!compact || !stage || !inner) return undefined
    const measure = () => {
      const free = stage.getBoundingClientRect().bottom - inner.getBoundingClientRect().bottom
      setSlack(Math.max(0, Math.round(free)))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [compact])

  // The texts below are positioned by their scroll triggers: measure again when
  // the pulled-up space changes.
  useEffect(() => {
    if (compact) ScrollTrigger.refresh()
  }, [compact, slack])

  // Reveal settings for a text: driven by the pinned scroll in the stage, by the
  // page's own scroll below it (done once the text's top is 15% up from the
  // screen's bottom, so what you see after scrolling or jumping here is all there).
  const revealProps = (span) =>
    compact ? { wordAnimationEnd: 'top 85%' } : { progress: windowed(...span) }

  // The lead and the paragraphs. In the stage they follow the pinned scroll; below
  // it they are revealed by the page's own scroll.
  const bodyCopy = (
    <>
      <ScrollReveal
        as="p"
        {...revealProps(TEXT_WINDOWS.lead)}
        effect="rise"
        stagger={0.07}
        baseOpacity={0}
        baseRotation={0}
        enableBlur={false}
        highlightColor="var(--color-accent)"
        containerClassName={styles.paragraphBox}
        textClassName={styles.lead}
      >
        {about.lead}
      </ScrollReveal>
      {about.paragraphs.map((paragraph, index) => (
        <ScrollReveal
          key={paragraph}
          as="p"
          {...revealProps(TEXT_WINDOWS.paragraphs[index % TEXT_WINDOWS.paragraphs.length])}
          effect="rise"
          stagger={0.04}
          baseOpacity={0}
          baseRotation={0}
          enableBlur={false}
          highlightColor="var(--color-accent)"
          containerClassName={styles.paragraphBox}
          textClassName={styles.paragraph}
        >
          {paragraph}
        </ScrollReveal>
      ))}
    </>
  )

  return (
    <section id="about" className={styles.about} aria-label={t.nav.about}>
      {/* With the 'expand' reveal the track is tall and the stage sticks to the top
          of the screen while you scroll through it (see About.module.css). The
          portrait's canvas fills the stage. */}
      <div
        className={styles.track}
        data-reveal={PORTRAIT_REVEAL}
        style={{ '--portrait-scroll': compact ? PORTRAIT_SCROLL_COMPACT : PORTRAIT_SCROLL }}
      >
        <div ref={stageRef} className={styles.stage} data-portrait-stage>
          <div ref={innerRef} className={styles.inner}>
            <div className={styles.text}>
              {HEADING_INTRO === 'fly' ? (
                <FlyingHeading>{about.heading}</FlyingHeading>
              ) : (
                <ScrollReveal
                  as="h2"
                  progress={windowed(...TEXT_WINDOWS.heading)}
                  effect="rise"
                  stagger={0.12}
                  baseOpacity={0}
                  baseRotation={0}
                  enableBlur={false}
                  containerClassName={styles.headingBox}
                  textClassName={styles.heading}
                >
                  {about.heading}
                </ScrollReveal>
              )}
              {!compact && bodyCopy}
            </div>
            <div className={styles.portrait}>
              <OrbitPortrait />
            </div>
          </div>
        </div>
      </div>
      {compact && (
        <div className={`${styles.text} ${styles.copy}`} style={{ '--stage-slack': `${slack}px` }}>
          {bodyCopy}
        </div>
      )}
    </section>
  )
}
