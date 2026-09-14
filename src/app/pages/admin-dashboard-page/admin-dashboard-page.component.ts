import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Subscription, firstValueFrom } from 'rxjs';
import { ReportService, Report, ReportStatus } from '../../services/report.service';
import { ReviewService, Review } from '../../services/review.service';
import { UserService, User } from '../../services/user.service';

interface Comment {
  userId: string;
  content: string;
  timestamp: Date;
}

interface EnrichedReport extends Report {
  reporterUsername: string;
  review?: Review | null;
  reviewAuthorUsername?: string;
  reportedComment?: Comment | null;
}

type StatusFilter = ReportStatus | 'all';

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  offensive: 'Contenido ofensivo',
  harassment: 'Acoso',
  other: 'Otro',
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisado',
  dismissed: 'Descartado',
};

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrls: ['./admin-dashboard-page.component.css'],
})
export class AdminDashboardPageComponent implements OnInit, OnDestroy {
  private reportService = inject(ReportService);
  private reviewService = inject(ReviewService);
  private userService = inject(UserService);

  private subscription?: Subscription;

  isLoading = true;
  statusFilter: StatusFilter = 'pending';
  reports: EnrichedReport[] = [];

  reportToDelete: EnrichedReport | null = null;

  readonly reasonLabels = REASON_LABELS;
  readonly statusLabels = STATUS_LABELS;
  readonly filters: { value: StatusFilter; label: string }[] = [
    { value: 'pending', label: 'Pendientes' },
    { value: 'reviewed', label: 'Revisados' },
    { value: 'dismissed', label: 'Descartados' },
    { value: 'all', label: 'Todos' },
  ];

  ngOnInit() {
    this.loadReports();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  setFilter(filter: StatusFilter) {
    if (this.statusFilter === filter) return;
    this.statusFilter = filter;
    this.loadReports();
  }

  private loadReports() {
    this.isLoading = true;
    this.subscription?.unsubscribe();

    const reports$ =
      this.statusFilter === 'all'
        ? this.reportService.getAllReports()
        : this.reportService.getReportsByStatus(this.statusFilter);

    this.subscription = reports$.subscribe({
      next: async (reports) => {
        this.reports = await Promise.all(reports.map((r) => this.enrich(r)));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los reportes:', error);
        toast.error('No se pudieron cargar los reportes');
        this.isLoading = false;
      },
    });
  }

  private async enrich(report: Report): Promise<EnrichedReport> {
    const [reporter, review] = await Promise.all([
      this.userService.getById(report.reporterId).catch(() => null),
      firstValueFrom(this.reviewService.getReviewById(report.targetId)).catch(() => null),
    ]);

    let reviewAuthorUsername: string | undefined;
    let reportedComment: Comment | null = null;

    if (review) {
      const author = await this.userService.getById(review.userId).catch(() => null);
      reviewAuthorUsername = author?.username || author?.email || review.userId;

      if (report.type === 'comment' && report.commentIndex !== undefined) {
        reportedComment = (review.comments?.[report.commentIndex] as Comment) ?? null;
      }
    }

    return {
      ...report,
      reporterUsername: reporter?.username || reporter?.email || report.reporterId,
      review,
      reviewAuthorUsername,
      reportedComment,
    };
  }

  async markAs(report: EnrichedReport, status: ReportStatus) {
    if (!report.id) return;
    try {
      await this.reportService.updateReportStatus(report.id, status);
      toast.success(`Reporte marcado como ${this.statusLabels[status].toLowerCase()}`);
    } catch (error) {
      console.error('Error al actualizar el reporte:', error);
      toast.error('No se pudo actualizar el reporte');
    }
  }

  confirmDelete(report: EnrichedReport) {
    this.reportToDelete = report;
  }

  cancelDelete() {
    this.reportToDelete = null;
  }

  async deleteReportedContent() {
    const report = this.reportToDelete;
    if (!report) return;

    try {
      if (report.type === 'review') {
        await this.reviewService.deleteReview(report.targetId);
        toast.success('Reseña eliminada');
      } else if (report.reportedComment) {
        await this.reviewService.removeComment(report.targetId, report.reportedComment);
        toast.success('Comentario eliminado');
      }

      if (report.id) {
        await this.reportService.updateReportStatus(report.id, 'reviewed');
      }
    } catch (error) {
      console.error('Error al eliminar el contenido reportado:', error);
      toast.error('No se pudo eliminar el contenido');
    } finally {
      this.reportToDelete = null;
    }
  }
}
