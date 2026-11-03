import { OrbitPortrait } from './OrbitPortrait'
import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={styles.about} aria-label="About">
      <div className={styles.inner}>
        <div className={styles.text}>
          {/* TODO: real about content (bio, skills) goes here */}
          <h2 className={styles.heading}>About</h2>
        </div>
        <div className={styles.portrait}>
          <OrbitPortrait />
        </div>
      </div>
    </section>
  )
}
