import {
  Activity,
  ChevronRight,
  ClipboardCheck,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';

const steps = [
  { title: 'Push', icon: GitBranch },
  { title: 'CI/CD', icon: Activity },
  { title: 'Quality Gate', icon: ShieldCheck },
  { title: 'Rúbrica', icon: ClipboardCheck },
];

export function LoginPipelineSteps() {
  return (
    <ol aria-label="Flujo de evaluación técnica" className="login-pipeline">
      {steps.map(({ title, icon: Icon }, index) => (
        <li key={title}>
          <div
            className={
              index === 0
                ? 'login-pipeline-step login-pipeline-step-active'
                : 'login-pipeline-step'
            }
          >
            <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
            <span>{title}</span>
          </div>
          {index < steps.length - 1 && (
            <ChevronRight
              size={14}
              aria-hidden="true"
              className="login-pipeline-arrow"
            />
          )}
        </li>
      ))}
    </ol>
  );
}
