"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function DoctorDashboard() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/records")
            .then((res) => res.json())
            .then((data) => {
                setRecords(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch records:", err);
                setLoading(false);
            });
    }, []);

    const approveAppointment = async (id: string, email?: string) => {
        // In a real app, this would send an email and update the status in the DB
        alert(`Appointment confirmed for record ${id}. Confirmation sent to patient.`);
        // Update local state purely for visual feedback in this demo
        setRecords(records.map(r => r.id === id ? { ...r, status: "Confirmed by Doctor" } : r));
    };

    return (
        <div className="min-h-screen bg-clinical-bg p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-sage-900">Dr. Liv Command Center</h1>
                        <p className="text-sage-600">Review patient intake records and bookings from the AI agent</p>
                    </div>
                    <div className="bg-white rounded-lg shadow px-4 py-2 border border-sage-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm font-medium text-sage-700">Agent Online</span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-32 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-xl font-display text-sage-800">We are trying to access the patient records...</p>
                        <p className="text-sage-500 mt-2">Syncing your data from the AI assistant.</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-sage-100">
                        <p className="text-sage-500">No patient records yet. Start a consultation to test the AI!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {records.map((record) => (
                            <div key={record.id} className="bg-white rounded-2xl p-6 shadow-sm border border-sage-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">

                                {/* Left side: Patient Identity */}
                                <div className="md:w-1/4 border-r border-sage-50 pr-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-sage-900">{record.patientName || "Anonymous"}</h3>
                                        <span className="text-xs text-sage-400">{formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}</span>
                                    </div>
                                    <div className="text-sm text-sage-600 mb-1">Age: {record.age || "N/A"}</div>
                                    <div className="text-sm text-sage-600 mb-4">Contact: {record.contact || "N/A"}</div>

                                    {/* Triage Badge */}
                                    <div className={`px-3 py-1.5 rounded-md text-xs font-bold inline-block border
                                        ${record.triageLevel === 'EMERGENCY' ? 'bg-red-100 text-red-700 border-red-200' :
                                            record.triageLevel === 'URGENT' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                record.triageLevel === 'SEMI-URGENT' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                    record.triageLevel === 'ROUTINE' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        record.triageLevel === 'SELF-CARE' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            'bg-sage-100 text-sage-700 border-sage-200'}
                                    `}>
                                        {record.triageLevel || "PENDING TRIAGE"}
                                    </div>
                                </div>

                                {/* Middle: Clinical Details */}
                                <div className="md:w-2/4">
                                    <div className="mb-4">
                                        <span className="text-xs font-bold text-sage-400 uppercase tracking-wider">Chief Complaint</span>
                                        <p className="text-sage-800 mt-1">{record.chiefComplaint || "No complaint recorded"}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <span className="text-xs font-bold text-sage-400 uppercase tracking-wider">Details & Severity</span>
                                            <p className="text-sage-700 mt-1 text-sm">{record.symptomDetails || "-"}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-sage-400 uppercase tracking-wider">Duration</span>
                                            <p className="text-sage-700 mt-1 text-sm">{record.duration || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/50 rounded-lg p-3 border border-sage-100">
                                        <span className="text-xs font-bold text-sage-400 uppercase tracking-wider">Agent Assessment & Next Steps</span>
                                        <p className="text-sage-800 mt-1 text-sm font-medium">{record.recommendation || "Pending recommendation"}</p>
                                        {(record.actionNeeded) && <p className="text-sage-600 mt-1 text-sm italic">Action timeline: {record.actionNeeded}</p>}
                                    </div>
                                </div>

                                {/* Right side: Actions / Status */}
                                <div className="md:w-1/4 bg-gray-50 rounded-xl p-4 flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-sage-400 uppercase tracking-wider">Agent Action Taken</span>
                                        <div className="mt-2 text-sm font-medium text-sage-800">{record.status || "Unknown"}</div>
                                        {record.appointmentTime && (
                                            <div className="mt-2 bg-sage-100 text-sage-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {record.appointmentTime}
                                            </div>
                                        )}
                                        {record.note && <div className="mt-2 text-xs text-sage-500 italic">{record.note}</div>}
                                    </div>

                                    {record.status === "Appointment Booked" && (
                                        <button
                                            onClick={() => approveAppointment(record.id)}
                                            className="mt-4 w-full bg-sage-600 hover:bg-sage-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                                        >
                                            Confirm Booking
                                        </button>
                                    )}
                                    {record.status === "Confirmed by Doctor" && (
                                        <div className="mt-4 text-center text-green-600 font-medium text-sm border border-green-200 bg-green-50 py-2 rounded-lg">
                                            Confirmed ✓
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
