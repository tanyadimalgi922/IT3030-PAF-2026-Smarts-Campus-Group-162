function Field({ label, onChange, placeholder, type = "text", value }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
    </label>
  );
}

export default Field;
