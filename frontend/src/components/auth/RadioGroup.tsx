import styles from "./RadioGroup.module.css";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
}: RadioGroupProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <div className={styles.options} role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`${styles.option} ${value === option.value ? styles.selected : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className={styles.optionLabel}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
