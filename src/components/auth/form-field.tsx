
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

export const FormField = ({
  id,
  label,
  type,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "",
  error
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
      />
    </div>
  );
};

export const PasswordField = ({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "",
  error
}: Omit<FormFieldProps, "type">) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
              <line x1="2" x2="22" y1="2" y2="22"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
