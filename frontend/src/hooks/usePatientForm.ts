"use client";

import { useState, useCallback, useRef } from "react";
import {
  PatientFormData,
  INITIAL_FORM_DATA,
  FormFieldName,
} from "@/types/form";

export interface UsePatientFormReturn {
  formData: PatientFormData;
  updateField: (fieldName: FormFieldName, value: string) => void;
  getFormState: () => PatientFormData;
  resetForm: () => void;
  recentlyUpdatedField: FormFieldName | null;
}

export function usePatientForm(): UsePatientFormReturn {
  const [formData, setFormData] = useState<PatientFormData>(INITIAL_FORM_DATA);
  const [recentlyUpdatedField, setRecentlyUpdatedField] =
    useState<FormFieldName | null>(null);

  // Use ref to avoid getFormState changing and re-registering RPC handlers
  const formDataRef = useRef<PatientFormData>(formData);
  formDataRef.current = formData;

  const updateField = useCallback(
    (fieldName: FormFieldName, value: string) => {
      console.log(`[Form] Updating field: ${fieldName} = ${value}`);
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Highlight recently updated field
      setRecentlyUpdatedField(fieldName);
      setTimeout(() => setRecentlyUpdatedField(null), 2000);
    },
    []
  );

  // Use ref so this function is stable and doesn't cause RPC handler re-registration
  const getFormState = useCallback(() => {
    return formDataRef.current;
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setRecentlyUpdatedField(null);
  }, []);

  return {
    formData,
    updateField,
    getFormState,
    resetForm,
    recentlyUpdatedField,
  };
}
