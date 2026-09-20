import YuanAction from "./YuanAction";
import WholesaleAction from "./WholesaleAction";
import styles from "./SecondaryActions.module.css";

export default function SecondaryActions() {
  return (
    <section className={styles.section}>
      <div className={styles.list}>
        <YuanAction />
        <WholesaleAction />
      </div>
    </section>
  );
}