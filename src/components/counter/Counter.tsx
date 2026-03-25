import styles from "./Counter.module.css";

type CounterProps = {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementLabel?: string;
  incrementLabel?: string;
  className?: string;
};

export const Counter = ({
  value,
  onDecrement,
  onIncrement,
  decrementLabel = "Decrease quantity",
  incrementLabel = "Increase quantity",
  className = "",
}: CounterProps) => {
  return (
    <div className={`${styles.counter} ${className}`.trim()}>
      <button
        type="button"
        onClick={onDecrement}
        aria-label={decrementLabel}
        className={styles.button}
      >
        -
      </button>
      <span className={styles.value}>{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={incrementLabel}
        className={styles.button}
      >
        +
      </button>
    </div>
  );
};
