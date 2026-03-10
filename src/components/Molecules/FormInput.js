const FormInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  options = [],
}) => {
  return (
    <div className="mb-3">
      <label className="form-label fw-bold small text-muted text-uppercase">
        {label}
      </label>
      {type === "select" ? (
        <select
          className="form-select py-2"
          name={name}
          value={value}
          onChange={onChange}
        >
          <option value="">Select {label}</option>
          {options.map((opt, index) => (
            <option key={index} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="form-control py-2"
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          required
        />
      )}
    </div>
  );
};

export default FormInput;
