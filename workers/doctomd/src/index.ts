import { handleCORS, corsHeaders } from '../../shared/cors';

interface MarkdownInput {
  name: string;
  blob: Blob;
}

interface MarkdownResult {
  name: string;
  mimeType: string;
  data: string;
}

interface Env {
  AI: {
    toMarkdown(
      input: MarkdownInput | MarkdownInput[],
    ): Promise<MarkdownResult | MarkdownResult[]>;
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const SUPPORTED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.apple.numbers',
  'text/csv',
  'text/html',
  'text/xml',
  'application/xml',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  // MS Office macro-enabled variants
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
]);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const cors = handleCORS(req);
    if (cors) return cors;

    if (req.method === 'GET') {
      return json({
        name: 'DocToMD',
        description: 'Convert any file to Markdown using Workers AI toMarkdown',
        usage: 'POST / with multipart/form-data, field name: file',
        supported: [
          'PDF', 'DOCX', 'XLSX', 'XLS', 'ODS', 'ODT',
          'CSV', 'HTML', 'XML', 'JPEG', 'PNG', 'WebP', 'SVG',
        ],
      });
    }

    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // Parse multipart form
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return json({ error: 'Expected multipart/form-data body' }, 400);
    }

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return json({ error: 'Missing file field in form data' }, 400);
    }

    if (file.size === 0) {
      return json({ error: 'File is empty' }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB` },
        413,
      );
    }

    // Type check — allow octet-stream since browsers sometimes send that
    const mimeType = file.type || 'application/octet-stream';
    const isKnownType = SUPPORTED_TYPES.has(mimeType);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const knownExts = new Set([
      'pdf', 'docx', 'xlsx', 'xls', 'xlsm', 'xlsb', 'et',
      'ods', 'odt', 'numbers', 'csv',
      'html', 'htm', 'xml',
      'jpeg', 'jpg', 'png', 'webp', 'svg',
    ]);

    if (!isKnownType && !knownExts.has(ext)) {
      return json(
        { error: `Unsupported file type: ${mimeType || ext}. Check the supported formats list.` },
        415,
      );
    }

    // Derive a reliable MIME type from extension when browser omits it
    const EXT_MIME: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
      xlsb: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
      ods: 'application/vnd.oasis.opendocument.spreadsheet',
      odt: 'application/vnd.oasis.opendocument.text',
      numbers: 'application/vnd.apple.numbers',
      csv: 'text/csv',
      html: 'text/html',
      htm: 'text/html',
      xml: 'text/xml',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };

    // File is a Blob — use it directly, but ensure the type is set correctly
    const resolvedMime = (mimeType !== 'application/octet-stream' && mimeType)
      ? mimeType
      : (EXT_MIME[ext] ?? 'application/octet-stream');

    const blob = resolvedMime !== file.type
      ? new Blob([file], { type: resolvedMime })
      : file;

    const start = Date.now();
    let result: MarkdownResult;

    try {
      const raw = await env.AI.toMarkdown({ name: file.name, blob });
      result = Array.isArray(raw) ? raw[0] : raw;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown AI error';
      return json({ error: `Conversion failed: ${msg}` }, 500);
    }

    const elapsed = Date.now() - start;

    if (!result?.data) {
      const errResult = result as unknown as { format: string; error?: string };
      return json({
        error: errResult?.error ?? 'AI could not convert this file — format may be unsupported or the file may be corrupted.',
      }, 422);
    }

    return json({
      markdown: result.data,
      name: result.name,
      mimeType: result.mimeType,
      elapsed,
    });
  },
};
