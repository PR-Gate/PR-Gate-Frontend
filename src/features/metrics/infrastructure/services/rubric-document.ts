export async function readRubricDocument(file: File): Promise<string> {
  if (!file.size || file.size > 10 * 1024 * 1024) {
    throw new Error('Selecciona un documento de hasta 10 MB.');
  }
  const extension = file.name.split('.').at(-1)?.toLowerCase();
  const data = await file.arrayBuffer();
  let content: string;
  switch (extension) {
    case 'pdf': {
      const pdf = await import('pdfjs-dist');
      const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdf.GlobalWorkerOptions.workerSrc = worker.default;
      const task = pdf.getDocument({ data });
      try {
        const document = await task.promise;
        if (document.numPages > 50)
          throw new Error('El PDF debe tener hasta 50 páginas.');
        const pages = [];
        for (let index = 1; index <= document.numPages; index++) {
          const page = await document.getPage(index);
          const { items } = await page.getTextContent();
          pages.push(
            items
              .map((item) =>
                'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '',
              )
              .join(''),
          );
        }
        content = pages.join('\n');
      } finally {
        await task.destroy();
      }
      break;
    }
    case 'docx': {
      const { extractRawText } = await import('mammoth');
      content = (await extractRawText({ arrayBuffer: data })).value;
      break;
    }
    case 'xlsx': {
      const { readSheet } = await import('read-excel-file/browser');
      const rows = await readSheet(data);
      if (rows.length > 1000)
        throw new Error('El Excel debe tener hasta 1000 filas.');
      content = rows
        .map((row) => row.map((cell) => String(cell ?? '').trim()).join('\t'))
        .join('\n');
      break;
    }
    default:
      throw new Error('Selecciona un PDF, Word (.docx) o Excel (.xlsx).');
  }
  if (!content.trim())
    throw new Error(
      'No encontramos texto seleccionable. Si el PDF es escaneado, usa una versión con texto.',
    );
  return content.trim();
}
