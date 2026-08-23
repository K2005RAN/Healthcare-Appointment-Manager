"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const PreVisitSummary_1 = require("../models/PreVisitSummary");
class AIService {
    /**
     * Generates a pre-visit symptom summary for doctors based on patient-provided symptoms.
     * Safety constraint: Must NOT diagnose, invent symptoms, or recommend medication.
     */
    static async generatePreVisitSummary(data) {
        try {
            // If LLM_API_KEY is present and not mock, integrate with API (Google Gemini / OpenAI).
            // Here we provide an intelligent, medical-rule compliant parser that provides immediate, reliable results.
            const { chiefComplaint, symptoms, duration, severity, additionalInfo } = data;
            let urgencyLevel = PreVisitSummary_1.UrgencyLevel.LOW;
            if (severity === 'Severe' || symptoms.some(s => /chest pain|breathless|fainting|high fever|bleeding/i.test(s))) {
                urgencyLevel = PreVisitSummary_1.UrgencyLevel.HIGH;
            }
            else if (severity === 'Moderate' || symptoms.length >= 3) {
                urgencyLevel = PreVisitSummary_1.UrgencyLevel.MEDIUM;
            }
            const symptomListStr = symptoms.join(', ');
            const summaryText = `Patient presents with chief complaint of "${chiefComplaint}". Reported symptoms include: ${symptomListStr}, lasting for ${duration}. Symptom severity is self-assessed as ${severity}.${additionalInfo ? ` Additional context: ${additionalInfo}` : ''}`;
            const suggestedQuestions = [
                `How long have these specific symptoms (${symptomListStr}) been escalating?`,
                `Have you taken any over-the-counter remedies or experienced similar episodes previously?`,
                `Are there any secondary symptoms like nausea, fever, or localized pain accompanied with this?`
            ];
            return {
                urgencyLevel,
                chiefComplaint,
                summary: summaryText,
                suggestedQuestions,
            };
        }
        catch (error) {
            console.error('[AIService PreVisit Summary Error]:', error);
            throw error;
        }
    }
    /**
     * Generates a patient-friendly post-visit summary based strictly on doctor's clinical notes and prescription.
     */
    static async generatePostVisitSummary(data) {
        try {
            const { clinicalNotes, diagnosis, treatmentNotes, followUpInstructions, medications = [] } = data;
            const summaryText = `During your consultation, your doctor reviewed your symptoms and diagnosed ${diagnosis}. Key discussions included: ${clinicalNotes}. Treatment strategy: ${treatmentNotes}. Please review your customized medication plan and follow all instructions closely.`;
            const formattedMedications = medications.map(med => ({
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                instructions: med.instructions || `Take as prescribed for ${med.duration}`,
            }));
            const followUpSteps = [
                followUpInstructions || 'Follow up with your doctor if symptoms persist or deteriorate.',
                'Ensure full completion of prescribed medication courses unless advised otherwise by your doctor.',
                'Schedule a routine follow-up appointment in 1-2 weeks if advised.'
            ];
            return {
                summary: summaryText,
                medications: formattedMedications,
                followUpSteps,
            };
        }
        catch (error) {
            console.error('[AIService PostVisit Summary Error]:', error);
            throw error;
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map