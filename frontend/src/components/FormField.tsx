"use client";

import { motion } from "framer-motion";
import { FormFieldName, TriageLevel, TRIAGE_COLORS } from "@/types/form";

interface FormFieldProps {
  label: string;
  fieldName: FormFieldName;
  value: string;
  isHighlighted: boolean;
  type?: "text" | "textarea" | "triage";
  icon?: React.ReactNode;
}

export function FormField({
  label,
  fieldName,
  value,
  isHighlighted,
  type = "text",
  icon,
}: FormFieldProps) {
  const hasValue = value.trim() !== "";

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={
        isHighlighted
          ? {
              scale: [1, 1.02, 1],
              transition: { duration: 0.3 },
            }
          : {}
      }
    >
      {/* Label */}
      <label
        htmlFor={fieldName}
        className="flex items-center gap-2 text-sm font-medium text-sage-600 mb-1.5"
      >
        {icon && <span className="text-sage-400">{icon}</span>}
        {label}
        {isHighlighted && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-sage-100 text-sage-600 rounded-full"
          >
            Updated
          </motion.span>
        )}
      </label>

      {/* Triage Level Badge */}
      {type === "triage" && value ? (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center px-4 py-2 text-white font-semibold rounded-xl ${
            TRIAGE_COLORS[value as TriageLevel] || ""
          }`}
        >
          {value}
        </motion.div>
      ) : type === "textarea" ? (
        /* Textarea Field */
        <div
          className={`
            min-h-[80px] p-4 rounded-xl border transition-all duration-300
            ${
              hasValue
                ? "bg-cream-50 border-sage-200"
                : "bg-white border-clinical-border"
            }
            ${isHighlighted ? "ring-2 ring-sage-300 border-sage-400" : ""}
          `}
        >
          {hasValue ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sage-800 whitespace-pre-wrap"
            >
              {value}
            </motion.p>
          ) : (
            <p className="text-clinical-muted italic">Waiting for input...</p>
          )}
        </div>
      ) : (
        /* Text Field */
        <div
          className={`
            px-4 py-3 rounded-xl border transition-all duration-300
            ${
              hasValue
                ? "bg-cream-50 border-sage-200"
                : "bg-white border-clinical-border"
            }
            ${isHighlighted ? "ring-2 ring-sage-300 border-sage-400" : ""}
          `}
        >
          {hasValue ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sage-800"
            >
              {value}
            </motion.p>
          ) : (
            <p className="text-clinical-muted italic">Waiting for input...</p>
          )}
        </div>
      )}

      {/* Highlight glow effect */}
      {isHighlighted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 -z-10 bg-sage-200/30 rounded-xl blur-xl"
        />
      )}
    </motion.div>
  );
}
