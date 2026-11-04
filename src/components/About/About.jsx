import { OrbitPortrait } from './OrbitPortrait'
import { PORTRAIT_REVEAL, PORTRAIT_SCROLL } from './portraitConfig'
import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={styles.about} aria-label="About">
      {/* With the 'expand' reveal the track is tall and the stage sticks to the top
          of the screen while you scroll through it (see About.module.css). The
          portrait's canvas fills the stage. */}
      <div
        className={styles.track}
        data-reveal={PORTRAIT_REVEAL}
        style={{ '--portrait-scroll': PORTRAIT_SCROLL }}
      >
        <div className={styles.stage} data-portrait-stage>
          <div className={styles.inner}>
            <div className={styles.text}>
              {/* TODO: real about content (bio, skills) goes here */}
              <h2 className={styles.heading}>About</h2>
            </div>
            <div className={styles.portrait}>
              <OrbitPortrait />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
