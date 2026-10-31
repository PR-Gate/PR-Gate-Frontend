import { expect, it } from 'vitest';
import { validateRubricFile } from './file-validation';
it('accepts supported extensions up to 10 MB and rejects unsupported, empty or oversized files', () => {
  for (const extension of ['PDF', 'doc', 'docx', 'xls', 'xlsx'])
    expect(
      validateRubricFile({
        name: `rubrica.${extension}`,
        size: 10 * 1024 * 1024,
      }),
    ).toBeNull();
  expect(validateRubricFile({ name: 'script.exe', size: 20 })).not.toBeNull();
  expect(validateRubricFile({ name: 'empty.pdf', size: 0 })).not.toBeNull();
  expect(
    validateRubricFile({ name: 'large.pdf', size: 10 * 1024 * 1024 + 1 }),
  ).not.toBeNull();
});
