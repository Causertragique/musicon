export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
  groupId?: string;
  instrument?: string;
  picture?: string;
  schoolId?: string;
  schoolDomain?: string;
  subscriptionPlan?: 'basic' | 'premium' | 'enterprise';
}

export interface Group {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  studentIds: string[];
  createdAt: Date;
  invitationCode?: string;
  qrCodeUrl?: string;
  // Propriétés pour l'import depuis Google Classroom et Microsoft Teams
  source?: 'google-classroom' | 'microsoft-teams' | 'manual';
  externalId?: string;
  importedAt?: string;
  studentCount?: number;
  memberCount?: number;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  groupId: string;
  teacherId: string;
  attachments?: string[];
  createdAt: Date;
  submissions: HomeworkSubmission[];
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  practiceDate: Date;
  duration: number; // in minutes
  location: 'school' | 'home';
  content: string;
  nextGoals: string;
  attachments?: string[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
}

export interface PracticeReport {
  id: string;
  studentId: string;
  practiceDate: Date;
  duration: number; // in minutes
  location: 'school' | 'home';
  content: string;
  nextGoals: string;
  submittedAt: Date;
  type: 'homework' | 'general'; // homework-related or general practice
  homeworkId?: string; // if related to homework
  homeworkTitle?: string; // if related to homework
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  groupIds: string[]; // Changed to support multiple groups
  assignedStudentIds: string[]; // Specific students assigned
  teacherId: string;
  type: 'theory' | 'audio_recording' | 'video_recording' | 'solfege_dictation' | 'instrumental' | 'other';
  maxPoints: number;
  attachments?: string[];
  createdAt: Date;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments?: string[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
}

export interface CourseNote {
  id: string;
  title: string;
  content: string;
  teacherId: string;
  groupId?: string; // Changed back to single group selection
  category: 'theory' | 'technique' | 'repertoire' | 'history' | 'other';
  tags: string[];
  attachments?: CourseNoteAttachment[]; // Enhanced attachments with metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseNoteAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  type: 'direct' | 'group' | 'announcement';
  createdAt: Date;
  readBy: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  teacherId: string;
  groupId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

// Nouvelles interfaces pour la gestion financière
export interface Purchase {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  item: string;
  amount: number;
  status: 'paid' | 'credit'; // payé ou à crédit
  createdAt: Date;
  paidAt?: Date;
  teacherId: string;
}

export interface StudentDebt {
  studentId: string;
  totalDebt: number;
  purchases: Purchase[];
}

export interface PartnerSchool {
  id: string;
  name: string;
  domain: string;
  address: string;
  city: string;
  province: string;
  contactEmail: string;
  contactPhone: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  maxStudents: number;
  maxTeachers: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: 'debt_reminder' | 'low_stock' | 'out_of_stock' | 'payment_received' | 'general';
  title: string;
  message: string;
  recipientRole: string;
  relatedId?: string;
  priority?: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
}

// Interface pour un poste budgétaire (enveloppe)
export interface BudgetEnvelope {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  budgetAllocated: number;
  budgetSpent: number;
  budgetRemaining: number;
  isRevenue: boolean;
  accountNumber?: string;
}

// Interface pour un budget annuel
export interface Budget {
  id: string;
  schoolYear: string; // ex: '2024-2025'
  totalBudget: number;
  totalExpenses: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
  envelopes: BudgetEnvelope[];
}