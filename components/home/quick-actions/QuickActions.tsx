import TariffsAction from "./TariffsAction";
import PurchaseAction from "./PurchaseAction";
import InstructionsAction from "./InstructionsAction";
import ContactAction from "./ContactAction";
import styles from "./QuickActions.module.css";

export default function QuickActions() {
  return (
    <section className={styles.section} aria-label="Быстрые действия">
      <div className={styles.grid}>
        <TariffsAction />
        <PurchaseAction />
        <InstructionsAction />
        <ContactAction />
      </div>
    </section>
  );
}