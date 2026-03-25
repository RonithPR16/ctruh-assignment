import type { InputHTMLAttributes } from "react";
import styles from "./InputField.module.css";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const InputField = ({
  className = "",
  ...props
}: InputFieldProps) => {
  return (
    <input
      {...props}
      className={`${styles.input} ${className}`.trim()}
    />
  );
};
