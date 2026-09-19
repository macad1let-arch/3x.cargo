import YuanAction from "./YuanAction";
import WholesaleAction from "./WholesaleAction";
import styles from "./SecondaryActions.module.css";

export default function SecondaryActions() {
  return (
    <section className={styles.section} aria-label="Дополнительные услуги">
      <div className={styles.grid}>
        <YuanAction />
        <WholesaleAction />
      </div>
    </section>
  );
}