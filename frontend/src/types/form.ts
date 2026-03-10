export interface PatientFormData {
  patientName: string;
  age: string;
  contact: string;
  chiefComplaint: string;
  symptomDetails: string;
  duration: string;
  visualAssessment: string;
  triageLevel: TriageLevel | "";
  recommendation: string;
  status: PatientStatus | "";
  actionNeeded: string;
  appointmentTime: string;
}

export type TriageLevel =
  | "EMERGENCY"
  | "URGENT"
  | "SEMI-URGENT"
  | "ROUTINE"
  | "SELF-CARE";

export type PatientStatus =
  | "New"
  | "In Progress"
  | "Appointment Booked"
  | "Callback Requested"
  | "Completed";

export const TRIAGE_COLORS: Record<TriageLevel, string> = {
  EMERGENCY: "triage-emergency",
  URGENT: "triage-urgent",
  "SEMI-URGENT": "triage-semiurgent",
  ROUTINE: "triage-routine",
  "SELF-CARE": "triage-selfcare",
};

export const TRIAGE_DESCRIPTIONS: Record<TriageLevel, string> = {
  EMERGENCY: "Requires immediate emergency care",
  URGENT: "See a doctor within 2-4 hours",
  "SEMI-URGENT": "See a doctor within 24 hours",
  ROUTINE: "Schedule an appointment",
  "SELF-CARE": "Can be managed at home",
};

export const INITIAL_FORM_DATA: PatientFormData = {
  patientName: "",
  age: "",
  contact: "",
  chiefComplaint: "",
  symptomDetails: "",
  duration: "",
  visualAssessment: "",
  triageLevel: "",
  recommendation: "",
  status: "",
  actionNeeded: "",
  appointmentTime: "",
};

export type FormFieldName = keyof PatientFormData;
