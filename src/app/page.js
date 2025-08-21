import styles from "./page.module.css";
import AudioItem from "./components/audioItem";
import { getAudioFiles } from "./utils/getAudioFiles";

export default function Home() {
  const { audioData, musicData } = getAudioFiles();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>环境音</h2>
            <p className={styles.sectionSubtitle}>营造氛围，助你专注</p>
          </div>
          <div className={styles.audioGrid}>
            {audioData.map((audio, index) => (
              <AudioItem
                key={index}
                title={audio.title}
                src={audio.src}
                icon={audio.icon}
                group="audio"
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>音乐</h2>
            <p className={styles.sectionSubtitle}>轻音乐与旋律，缓解压力</p>
          </div>
          <div className={styles.audioGrid}>
            {musicData.map((audio, index) => (
              <AudioItem
                key={index}
                title={audio.title}
                src={audio.src}
                icon={audio.icon}
                group="music"
                showTitle
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
