import type { ComponentPropsWithoutRef, ElementType } from "react";
import styles from "./PrimaryButton.module.css";

type PrimaryButtonProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & ComponentPropsWithoutRef<T>;

export const PrimaryButton = <T extends ElementType = "button">({
  as,
  className = "",
  ...props
}: PrimaryButtonProps<T>) => {
  const Component = as ?? "button";
  return (
    <Component
      {...props}
      className={`${styles.primaryButton} ${className}`.trim()}
    />
  );
};
