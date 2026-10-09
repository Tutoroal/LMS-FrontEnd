export type UserData = { LegacyClassReference?: string;
 ID: string; Name: string; Email: string; RoleID: number; NISN_NIP: string; NIS: string;
 TempatLahir: string; TanggalLahir: string; JenisKelamin: string; Specialty: string;
 ClassID: number | null; Class?: ClassData | null; CreatedAt: string;
};
export type ClassData = { ID: number; ClassName: string; Major: string; HomeroomTeacherID: string | null; HomeroomTeacher?: UserData | null };
export type SubjectData = { ID: number; SubjectName: string; TeacherID: string; Teacher?: UserData };
export type MaterialData = { ID: number; SubjectID: number; ClassID: number; Title: string; ContentURL: string; ClassName: string; SubjectName: string };
export type AssignmentData = { ID: number; SubjectID: number; ClassID: number; Title: string; Deadline: string; MaxScore: number; ClassName: string; SubjectName: string; SubmissionCount: number };
export type SubmissionData = { ID: number; AssignmentID: number; StudentID: string; FileURL: string; Score: number; Feedback: string; GradedAt: string | null; SubmittedAt: string; StudentName: string; StudentNIS: string; ClassName: string };
export type StudentTask = { assignment: AssignmentData; subject_name: string; submission: SubmissionData; has_submitted: boolean; is_graded: boolean; can_submit: boolean };
export type ExamData = { ID: number; SubjectID: number; ClassID: number; Title: string; Type: string; Date: string; Duration: number; IsActive: boolean; SubjectName: string; ClassName: string; QuestionCount: number; CompletedCount: number };
export type QuestionData = { ID: number; ExamID: number; QuestionText: string; OptionA: string; OptionB: string; OptionC: string; OptionD: string; CorrectAnswer: string };
export type ExamResultData = { ID: number; Score: number; StudentName: string; StudentNIS: string; StartedAt: string | null; SubmittedAt: string | null };
export type ScheduleData = { ID: number; ClassID: number; SubjectID: number; Class: ClassData; Subject: SubjectData; DayOfWeek: string; StartTime: string; EndTime: string };
export type SchoolData = { ID: number; SchoolName: string; AcademicYear: string };
export type SessionData = { id: string; name: string; email: string; role_id: number; expires_at: string; class_id: number | null; nis: string; nisn_nip: string };
export const DEPARTMENTS = ["PPLG", "TJKT", "DKV", "BDR", "PERHOTELAN", "MPLB"] as const;
export const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export function dateLabel(value: string, time = false) {
 if (!value || value.startsWith("0001")) return "?";
 return new Date(value).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) });
}
export function calendarLabel(value: string) {
 return new Date(value).toLocaleDateString("id-ID", { timeZone: "UTC", dateStyle: "long" });
}
