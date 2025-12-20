import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Review } from '../../services/review.service';
import { ReportService, ReportReason } from '../../services/report.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent {
  @Input() review!: Review;
  @Input() userInfo: any;
  @Input() albumInfo: any;
  @Input() currentUserId: string | null = null;
  @Input() getUserName!: (userId: string) => string;

  @Output() likeToggled = new EventEmitter<Review>();
  @Output() commentAdded = new EventEmitter<{ reviewId: string; comment: string }>();

  private reportService = inject(ReportService);

  newCommentContent: string = '';

  // Report modal state
  showReportModal: boolean = false;
  reportType: 'review' | 'comment' = 'review';
  reportCommentIndex: number = -1;
  selectedReason: ReportReason = 'spam';
  reportDescription: string = '';
  isSubmittingReport: boolean = false;

  reportReasons: { value: ReportReason; label: string }[] = [
    { value: 'spam', label: 'Spam' },
    { value: 'offensive', label: 'Contenido ofensivo' },
    { value: 'harassment', label: 'Acoso' },
    { value: 'other', label: 'Otro' }
  ];

  get isLikedByUser(): boolean {
    return this.review.likes?.includes(this.currentUserId || '') || false;
  }

  onToggleLike(): void {
    this.likeToggled.emit(this.review);
  }

  onAddComment(): void {
    if (!this.newCommentContent?.trim() || !this.review.id) return;

    this.commentAdded.emit({
      reviewId: this.review.id,
      comment: this.newCommentContent
    });
    this.newCommentContent = '';
  }

  // Open report modal for a review
  openReportReviewModal(): void {
    if (!this.currentUserId) {
      toast.error('Debes iniciar sesión para reportar');
      return;
    }
    this.reportType = 'review';
    this.reportCommentIndex = -1;
    this.resetReportForm();
    this.showReportModal = true;
  }

  // Open report modal for a comment
  openReportCommentModal(commentIndex: number): void {
    if (!this.currentUserId) {
      toast.error('Debes iniciar sesión para reportar');
      return;
    }
    this.reportType = 'comment';
    this.reportCommentIndex = commentIndex;
    this.resetReportForm();
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.resetReportForm();
  }

  private resetReportForm(): void {
    this.selectedReason = 'spam';
    this.reportDescription = '';
  }

  async submitReport(): Promise<void> {
    if (!this.currentUserId || !this.review.id) return;

    this.isSubmittingReport = true;

    try {
      if (this.reportType === 'review') {
        await this.reportService.reportReview(
          this.review.id,
          this.currentUserId,
          this.selectedReason,
          this.reportDescription || undefined
        );
      } else {
        await this.reportService.reportComment(
          this.review.id,
          this.reportCommentIndex,
          this.currentUserId,
          this.selectedReason,
          this.reportDescription || undefined
        );
      }

      toast.success('Reporte enviado correctamente');
      this.closeReportModal();
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      toast.error('Error al enviar el reporte');
    } finally {
      this.isSubmittingReport = false;
    }
  }
}
