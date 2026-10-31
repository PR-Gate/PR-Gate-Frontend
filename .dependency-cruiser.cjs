const features = [
  'users',
  'projects',
  'cicd',
  'metrics',
  'ai-practice',
  'notifications',
  'assessments',
  'rubrics',
];
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'domain-is-pure',
      severity: 'error',
      from: { path: '^src/features/[^/]+/domain/', pathNot: '\\.test\\.tsx?$' },
      to: { pathNot: '^src/features/[^/]+/domain/' },
    },
    {
      name: 'application-is-internal',
      severity: 'error',
      from: {
        path: '^src/features/[^/]+/application/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: {
        path: '(^src/(app|shared)/|/(infrastructure|presentation)/|node_modules/)',
      },
    },
    {
      name: 'presentation-no-infrastructure',
      severity: 'error',
      from: { path: '^src/features/[^/]+/presentation/' },
      to: { path: '/infrastructure/' },
    },
    {
      name: 'presentation-no-http',
      severity: 'error',
      from: {
        path: '^src/features/[^/]+/presentation/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: { path: '(shared/services/http/|node_modules/axios/)' },
    },
    {
      name: 'infrastructure-no-outer-layers',
      severity: 'error',
      from: {
        path: '^src/features/[^/]+/infrastructure/',
        pathNot: '\\.test\\.tsx?$',
      },
      to: { path: '(^src/app/|/presentation/)' },
    },
    {
      name: 'shared-no-features-or-app',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: '^src/(app|features)/' },
    },
    ...features.map((feature) => ({
      name: `${feature}-public-api-only`,
      severity: 'error',
      from: { path: `^src/features/${feature}/` },
      to: { path: `^src/features/(?!${feature}/)[^/]+/(?!index\\.ts$)` },
    })),
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.app.json' },
    enhancedResolveOptions: { extensions: ['.ts', '.tsx', '.js', '.json'] },
  },
};
