import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={styles.about} aria-label="About">
      {/* TODO: real about content (bio, skills, photo) goes here */}
      <h2 className={styles.heading}>About</h2>
    </section>
  )
}
