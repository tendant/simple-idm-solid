/**
 * useForm hook - Simple form state management for SolidJS
 */
import { createStore } from 'solid-js/store';
import { createSignal } from 'solid-js';

export type ValidationRule<T> = (value: T) => string | undefined;
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]> | ValidationRule<T[K]>[];
};

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: ValidationSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: () => boolean;
  isValid: () => boolean;
  handleChange: (field: keyof T, value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e: Event) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  reset: () => void;
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>,
): UseFormReturn<T> {
  const [values, setValues] = createStore(options.initialValues);
  const [errors, setErrors] = createStore<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = createStore<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  // Validate a single field
  const validateField = (field: keyof T, value: T[keyof T]): string | undefined => {
    if (!options.validate) return undefined;

    const validators = options.validate[field];
    if (!validators) return undefined;

    // Handle single validator
    if (typeof validators === 'function') {
      return validators(value);
    }

    // Handle multiple validators
    if (Array.isArray(validators)) {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
    }

    return undefined;
  };

  // Validate all fields
  const validateAll = (): boolean => {
    if (!options.validate) return true;

    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    for (const field in options.validate) {
      const error = validateField(field as keyof T, values[field]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Check if form is valid
  const isValid = (): boolean => {
    return Object.keys(errors).length === 0;
  };

  // Handle field change
  const handleChange = (field: keyof T, value: T[keyof T]) => {
    setValues({ [field]: value } as Partial<T>);

    // Validate field if it's been touched
    if (touched[field]) {
      const error = validateField(field, value);
      if (error) {
        setErrors({ [field]: error } as Partial<Record<keyof T, string>>);
      } else {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    }
  };

  // Handle field blur
  const handleBlur = (field: keyof T) => {
    setTouched({ [field]: true } as Partial<Record<keyof T, boolean>>);

    // Validate field on blur
    const error = validateField(field, values[field]);
    if (error) {
      setErrors({ [field]: error } as Partial<Record<keyof T, string>>);
    } else {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    // Mark all fields as touched
    const allTouched: Partial<Record<keyof T, boolean>> = {};
    for (const field in options.initialValues) {
      allTouched[field as keyof T] = true;
    }
    setTouched(allTouched);

    // Validate all fields
    const formIsValid = validateAll();
    if (!formIsValid) {
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await options.onSubmit(values as T);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set field value programmatically
  const setFieldValue = (field: keyof T, value: T[keyof T]) => {
    setValues({ [field]: value } as Partial<T>);
  };

  // Set field error programmatically
  const setFieldError = (field: keyof T, error: string) => {
    setErrors({ [field]: error } as Partial<Record<keyof T, string>>);
  };

  // Reset form to initial values
  const reset = () => {
    setValues(options.initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
  };
}

// Common validators
export const validators = {
  required: (message = 'This field is required') => (value: any) => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    return undefined;
  },

  email: (message = 'Invalid email address') => (value: string) => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return undefined;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (!value) return undefined;
    if (value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (!value) return undefined;
    if (value.length > max) {
      return message || `Must be at most ${max} characters`;
    }
    return undefined;
  },

  pattern: (regex: RegExp, message = 'Invalid format') => (value: string) => {
    if (!value) return undefined;
    if (!regex.test(value)) {
      return message;
    }
    return undefined;
  },

  match: (otherField: string, message = 'Fields do not match') => (value: string, allValues: any) => {
    if (!value) return undefined;
    if (value !== allValues[otherField]) {
      return message;
    }
    return undefined;
  },
};
