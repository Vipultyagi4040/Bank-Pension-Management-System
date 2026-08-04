import { forwardRef, useId } from "react";
import { AlertCircle, Check } from "lucide-react";

export type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  options?: { value: string; label: string; disabled?: boolean }[];
  className?: string;
  style?: React.CSSProperties;
  inputClassName?: string;
  labelClassName?: string;
  onIconClick?: () => void;
  success?: boolean;
  helperText?: string;
  layout?: "vertical" | "horizontal";
  fullWidth?: boolean;
};

export default forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  {
    label,
    name,
    type = "text",
    value,
    onChange,
    onBlur,
    error,
    required,
    placeholder,
    icon,
    rightIcon,
    rows = 3,
    disabled,
    readOnly,
    maxLength,
    min,
    max,
    step,
    autoComplete,
    autoFocus,
    options,
    className,
    style,
    inputClassName,
    labelClassName,
    onIconClick,
    success = false,
    helperText,
    layout = "vertical",
    fullWidth = true,
  },
  ref
) {
  const fieldId = useId();
  const inputId = `field-${fieldId}`;
  const errorId = `error-${fieldId}`;
  const helpId = `help-${fieldId}`;

  const hasValue = value !== undefined && value !== "" && value !== null;
  const showError = Boolean(error);
  const showSuccess = success && hasValue && !showError;
  const isTextarea = type === "textarea";
  const isSelect = type === "select";
  const isDate = type === "date";
  const actualType = type === "textarea" ? "textarea" : type === "select" ? "select" : type;

  const inputClasses = `form-input-floating ${showError ? "error" : ""} ${showSuccess ? "success" : ""} ${isDate ? "date-input" : ""} ${inputClassName || ""}`.trim();

  const renderInput = () => {
    if (isTextarea) {
      return (
        <textarea
          ref={ref as any}
          id={inputId}
          name={name}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={showError}
          aria-describedby={error ? errorId : helperText ? helpId : undefined}
          className={inputClasses}
          style={style}
        />
      );
    }

    if (isSelect && options) {
      return (
        <select
          ref={ref as any}
          id={inputId}
          name={name}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          aria-invalid={showError}
          aria-describedby={error ? errorId : helperText ? helpId : undefined}
          className={inputClasses}
          style={style}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={ref as any}
        id={inputId}
        name={name}
        type={actualType}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        aria-invalid={showError}
        aria-describedby={error ? errorId : helperText ? helpId : undefined}
        className={inputClasses}
        style={style}
      />
    );
  };

  const inputPaddingLeft = icon || onIconClick ? 44 : 16;
  const inputPaddingRight = rightIcon || success ? 40 : 16;

  return (
    <div
      className={`form-field-wrapper ${layout} ${fullWidth ? "full-width" : ""} ${className || ""}`.trim()}
      style={{ position: "relative" }}
    >
      <div className={`form-field-container ${showError ? "error" : ""} ${showSuccess ? "success" : ""}`.trim()}>
        {icon && (
          <span
            className={`form-field-icon ${onIconClick ? "clickable" : ""} ${showError ? "error" : ""} ${showSuccess ? "success" : ""}`}
            onClick={onIconClick}
            style={{ left: 14 }}
          >
            {icon}
          </span>
        )}

        <div style={{
          position: "relative",
          paddingLeft: inputPaddingLeft,
          paddingRight: inputPaddingRight,
          width: "100%"
        }}>
          {renderInput()}

          {!isSelect && (
            <label
              htmlFor={inputId}
              className={`form-floating-label ${labelClassName || ""} ${hasValue ? "floated" : ""} ${showError ? "error" : ""} ${showSuccess ? "success" : ""}`.trim()}
            >
              {label}
              {required && <span className="required-mark">*</span>}
            </label>
          )}

          {isSelect && (
            <label
              htmlFor={inputId}
              className={`form-floating-label form-floating-label-select ${labelClassName || ""} ${hasValue ? "floated" : ""} ${showError ? "error" : ""} ${showSuccess ? "success" : ""}`.trim()}
            >
              {label}
              {required && <span className="required-mark">*</span>}
            </label>
          )}

          {rightIcon && (
            <span className="form-field-icon-right" style={{ right: 14 }}>
              {rightIcon}
            </span>
          )}

          {showSuccess && (
            <span className="form-field-icon-right success">
              <Check size={16} />
            </span>
          )}

          {showError && (
            <span className="form-field-icon-right error">
              <AlertCircle size={16} />
            </span>
          )}
        </div>
      </div>

      {showError && (
        <div id={errorId} className="form-error-message">
          {error}
        </div>
      )}

      {!showError && helperText && (
        <div id={helpId} className="form-helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
});
