export default function StackCard({ stack, selected, onSelect }) {
  const cls = [
    "stack-card",
    selected ? "stack-card--selected" : "",
    !stack.available ? "stack-card--soon" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      onClick={() => stack.available && onSelect(stack.id)}
      role="button"
      aria-pressed={selected}
      tabIndex={stack.available ? 0 : -1}
      onKeyDown={(e) => e.key === "Enter" && stack.available && onSelect(stack.id)}
    >
      <div className="stack-card__icon">{stack.icon}</div>
      <div className="stack-card__content">
        <div className="stack-card__label">
          {stack.label}
          {!stack.available && <span className="stack-card__soon">SOON</span>}
        </div>
        <div className="stack-card__sublabel">{stack.sublabel}</div>
      </div>
      {selected && <div className="stack-card__check">✓</div>}
    </div>
  );
}
