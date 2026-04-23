function Field({ label, onChange, pattern, placeholder, title, type = "text", value }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        onChange={(event) => onChange(event.target.value)}
        pattern={pattern}
        placeholder={placeholder}
        required
        title={title}
        type={type}
        value={value}
      />
    </label>
  );
}

export default Field;
