"use client";

import { motion } from "framer-motion";
import { FormField } from "./FormField";
import { PatientFormData, FormFieldName } from "@/types/form";

interface PatientIntakeFormProps {
  formData: PatientFormData;
  recentlyUpdatedField: FormFieldName | null;
}

// Icons as simple SVG components
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function PatientIntakeForm({
  formData,
  recentlyUpdatedField,
}: PatientIntakeFormProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Patient Information Section */}
      <motion.section variants={itemVariants}>
        <h3 className="font-display text-lg font-semibold text-sage-700 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600">
            <UserIcon />
          </span>
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Full Name"
            fieldName="patientName"
            value={formData.patientName}
            isHighlighted={recentlyUpdatedField === "patientName"}
            icon={<UserIcon />}
          />
          <FormField
            label="Age"
            fieldName="age"
            value={formData.age}
            isHighlighted={recentlyUpdatedField === "age"}
            icon={<CalendarIcon />}
          />
          <FormField
            label="Contact"
            fieldName="contact"
            value={formData.contact}
            isHighlighted={recentlyUpdatedField === "contact"}
            icon={<PhoneIcon />}
          />
        </div>
      </motion.section>

      {/* Symptoms Section */}
      <motion.section variants={itemVariants}>
        <h3 className="font-display text-lg font-semibold text-sage-700 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600">
            <HeartIcon />
          </span>
          Symptoms
        </h3>
        <div className="space-y-4">
          <FormField
            label="Chief Complaint"
            fieldName="chiefComplaint"
            value={formData.chiefComplaint}
            isHighlighted={recentlyUpdatedField === "chiefComplaint"}
            type="textarea"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Symptom Details"
              fieldName="symptomDetails"
              value={formData.symptomDetails}
              isHighlighted={recentlyUpdatedField === "symptomDetails"}
              type="textarea"
            />
            <FormField
              label="Duration"
              fieldName="duration"
              value={formData.duration}
              isHighlighted={recentlyUpdatedField === "duration"}
              icon={<ClockIcon />}
            />
          </div>
        </div>
      </motion.section>

      {/* Visual Assessment Section */}
      <motion.section variants={itemVariants}>
        <h3 className="font-display text-lg font-semibold text-sage-700 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600">
            <EyeIcon />
          </span>
          Visual Assessment
        </h3>
        <FormField
          label="Observations"
          fieldName="visualAssessment"
          value={formData.visualAssessment}
          isHighlighted={recentlyUpdatedField === "visualAssessment"}
          type="textarea"
        />
      </motion.section>

      {/* Triage & Recommendation Section */}
      <motion.section variants={itemVariants}>
        <h3 className="font-display text-lg font-semibold text-sage-700 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600">
            <AlertIcon />
          </span>
          Assessment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Triage Level"
            fieldName="triageLevel"
            value={formData.triageLevel}
            isHighlighted={recentlyUpdatedField === "triageLevel"}
            type="triage"
          />
          <FormField
            label="Recommendation"
            fieldName="recommendation"
            value={formData.recommendation}
            isHighlighted={recentlyUpdatedField === "recommendation"}
            type="textarea"
          />
        </div>
      </motion.section>

      {/* Status Section */}
      <motion.section variants={itemVariants}>
        <h3 className="font-display text-lg font-semibold text-sage-700 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-600">
            <CheckIcon />
          </span>
          Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Status"
            fieldName="status"
            value={formData.status}
            isHighlighted={recentlyUpdatedField === "status"}
          />
          <FormField
            label="Action Needed"
            fieldName="actionNeeded"
            value={formData.actionNeeded}
            isHighlighted={recentlyUpdatedField === "actionNeeded"}
          />
          <FormField
            label="Appointment Time"
            fieldName="appointmentTime"
            value={formData.appointmentTime}
            isHighlighted={recentlyUpdatedField === "appointmentTime"}
            icon={<CalendarIcon />}
          />
        </div>
      </motion.section>
    </motion.div>
  );
}
