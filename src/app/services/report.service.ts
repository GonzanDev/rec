import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { addDoc, query, where, Timestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';

export type ReportType = 'review' | 'comment';
export type ReportReason = 'spam' | 'offensive' | 'harassment' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface Report {
  id?: string;
  type: ReportType;
  targetId: string; // reviewId for reviews, or reviewId for comments (with commentIndex)
  commentIndex?: number; // Index of the comment in the review's comments array
  reporterId: string;
  reason: ReportReason;
  description?: string;
  timestamp: Timestamp;
  status: ReportStatus;
}

const PATH = 'reports';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private firestore = inject(Firestore);
  private reports = collection(this.firestore, PATH);

  // Create a new report
  createReport(report: Omit<Report, 'id' | 'timestamp' | 'status'>): Promise<any> {
    const newReport: Omit<Report, 'id'> = {
      ...report,
      timestamp: Timestamp.now(),
      status: 'pending',
    };
    return addDoc(this.reports, newReport);
  }

  // Report a review
  reportReview(
    reviewId: string,
    reporterId: string,
    reason: ReportReason,
    description?: string
  ): Promise<any> {
    return this.createReport({
      type: 'review',
      targetId: reviewId,
      reporterId,
      reason,
      description,
    });
  }

  // Report a comment
  reportComment(
    reviewId: string,
    commentIndex: number,
    reporterId: string,
    reason: ReportReason,
    description?: string
  ): Promise<any> {
    return this.createReport({
      type: 'comment',
      targetId: reviewId,
      commentIndex,
      reporterId,
      reason,
      description,
    });
  }

  // Get all pending reports (for admin use)
  getPendingReports(): Observable<Report[]> {
    const q = query(this.reports, where('status', '==', 'pending'));
    return collectionData(q, { idField: 'id' }) as Observable<Report[]>;
  }

  // Update report status (for admin use)
  updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
    const reportDocRef = doc(this.firestore, `${PATH}/${reportId}`);
    return updateDoc(reportDocRef, { status });
  }
}
