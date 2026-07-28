import { useState, useCallback } from "react";
import { useForm, type UseFormProps, type UseFormReturn, type FieldValues } from "react-hook-form";

interface UseViewEditFormProps<TFieldValues extends FieldValues = FieldValues, TContext = any>
  extends UseFormProps<TFieldValues, TContext> {
  onSave: (data: TFieldValues) => Promise<void> | void;
}

interface UseViewEditFormReturn<TFieldValues extends FieldValues = FieldValues, TContext = any> {
  isEditMode: boolean;
  enableEdit: () => void;
  cancelEdit: () => void;
  form: UseFormReturn<TFieldValues, TContext>;
  handleSave: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function useViewEditForm<TFieldValues extends FieldValues = FieldValues, TContext = any>({
  onSave,
  defaultValues,
  ...useFormOptions
}: UseViewEditFormProps<TFieldValues, TContext>): UseViewEditFormReturn<TFieldValues, TContext> {
  const [isEditMode, setIsEditMode] = useState(false);

  const form = useForm<TFieldValues, TContext>({
    defaultValues,
    ...useFormOptions,
  });

  const enableEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const cancelEdit = useCallback(() => {
    form.reset();
    setIsEditMode(false);
  }, [form]);

  const handleSave = form.handleSubmit(async (data) => {
    try {
      await onSave(data);
      form.reset(data);
      setIsEditMode(false);
    } catch (error) {
      console.error("Save failed:", error);
    }
  });

  return {
    isEditMode,
    enableEdit,
    cancelEdit,
    form,
    handleSave,
  };
}
