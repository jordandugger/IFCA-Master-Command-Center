interface PlaceholderProps {
  icon: string;
  title: string;
  text: string;
  codeHint?: string;
}

export function Placeholder({ icon, title, text, codeHint }: PlaceholderProps) {
  return (
    <div className="ph">
      <div className="ph-icon">{icon}</div>
      <div className="ph-title">{title}</div>
      <div className="ph-text">{text}</div>
      {codeHint && <code>{codeHint}</code>}
    </div>
  );
}
