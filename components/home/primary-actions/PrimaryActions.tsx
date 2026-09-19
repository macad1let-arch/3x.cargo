import GetCodeCard from "./GetCodeCard";
import EducationCard from "./EducationCard";
import styles from "./PrimaryActions.module.css";

export default function PrimaryActions() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <GetCodeCard />
        <EducationCard />
      </div>
    </section>
  );
}