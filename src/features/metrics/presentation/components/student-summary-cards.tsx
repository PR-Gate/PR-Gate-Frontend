import { ClipboardCheck, Folder, GitBranch, ShieldCheck } from 'lucide-react';
import type { StudentOverview } from '../../domain/entities/student-overview.entity';

import { formatStudentValue } from '../utils/student-overview-format';

export function StudentSummaryCards({
  overview,
  showGrade = true,
  gradeLabel = 'Calificación actual',
}: {
  overview?: StudentOverview;
  showGrade?: boolean;
  gradeLabel?: string;
}) {
  const projects = overview?.projects;
  const pipelines = overview?.pipelines;
  const gates = overview?.qualityGates;
  const grade = overview?.currentGrade;
  const cards = [
    {
      label: 'Mis proyectos',
      icon: Folder,
      tone: 'blue',
      value: formatStudentValue(projects?.total),
      detail:
        projects?.active != null && projects.completed != null
          ? `${formatStudentValue(projects.active)} activos · ${formatStudentValue(projects.completed)} finalizados`
          : projects?.total != null ? 'Proyectos a los que tienes acceso' : 'Información pendiente',
    },
    {
      label: 'Pipelines recientes',
      icon: GitBranch,
      tone: 'green',
      value: formatStudentValue(pipelines?.total),
      detail:
        pipelines?.successful != null
          ? `${formatStudentValue(pipelines.successful)} exitosos${pipelines.periodLabel ? ` · ${pipelines.periodLabel}` : ''}`
          : 'Información pendiente',
    },
    {
      label: 'Quality Gates',
      icon: ShieldCheck,
      tone: 'amber',
      value:
        gates?.passed != null && gates.total != null
          ? `${formatStudentValue(gates.passed)} / ${formatStudentValue(gates.total)}`
          : '—',
      detail:
        gates?.total === 0
          ? 'Sin resultados recibidos'
          : gates?.requiringCorrection != null
          ? `${formatStudentValue(gates.requiringCorrection)} requieren corrección`
          : 'Información pendiente',
    },
    {
      label: gradeLabel,
      icon: ClipboardCheck,
      tone: 'green',
      value: formatStudentValue(grade?.value),
      detail: grade
        ? `sobre ${formatStudentValue(grade.maximum)} puntos`
        : 'Pendiente de evaluación',
    },
  ];
  return (
    <div
      className={showGrade ? 'student-summary-grid' : 'student-summary-grid student-summary-grid--technical'}
      aria-label="Indicadores del estudiante"
    >
      {(showGrade ? cards : cards.slice(0, 3)).map(({ label, icon: Icon, tone, value, detail }) => (
        <article className="student-panel student-summary-card" key={label}>
          <span className={`student-icon student-icon-${tone}`}>
            <Icon size={20} aria-hidden="true" />
          </span>
          <div>
            <h2>{label}</h2>
            <p
              className="student-summary-value"
              aria-label={value === '—' ? 'Información pendiente' : undefined}
            >
              {value}
            </p>
            <p className="student-summary-detail">{detail}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
