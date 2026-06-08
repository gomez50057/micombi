import Link from "next/link";
import styles from "./Button.module.css";

export default function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  onClick,
  disabled = false,
}) {
  const className = `${styles.button} ${styles[variant] || styles.primary}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
