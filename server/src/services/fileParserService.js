const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

/**
 * Extract plain text from PDF or DOCX buffer
 */
async function extractTextFromFile(buffer, originalname, mimetype) {
  const ext = path.extname(originalname || '').toLowerCase();

  if (ext === '.pdf' || mimetype === 'application/pdf') {
    let parser = null;
    try {
      let text = '';
      if (typeof pdfParse === 'function') {
        const data = await pdfParse(buffer);
        text = (data.text || '').trim();
      } else if (pdfParse?.PDFParse) {
        parser = new pdfParse.PDFParse({ data: buffer });
        const data = await parser.getText();
        text = (data.text || '').trim();
      } else if (typeof pdfParse?.default === 'function') {
        const data = await pdfParse.default(buffer);
        text = (data.text || '').trim();
      } else if (pdfParse?.default?.PDFParse) {
        parser = new pdfParse.default.PDFParse({ data: buffer });
        const data = await parser.getText();
        text = (data.text || '').trim();
      } else {
        throw new Error('Unsupported pdf-parse library structure');
      }

      if (!text || text.length < 20) {
        throw new Error(
          'The uploaded PDF appears to be a scanned image or contains no readable text. Please copy and paste your resume text into the text area instead.'
        );
      }
      return text;
    } catch (err) {
      if (err.message.includes('scanned image')) throw err;
      throw new Error(`Failed to parse PDF document: ${err.message || 'Corrupt or unreadable file'}`, { cause: err });
    } finally {
      if (parser && typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }

  if (
    ext === '.docx' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.doc'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = (result.value || '').trim();

      if (!text || text.length < 20) {
        throw new Error(
          'The uploaded Word document contains no readable text. Please ensure it contains formatted resume content or paste the text directly.'
        );
      }
      return text;
    } catch (err) {
      throw new Error(`Failed to parse Word document: ${err.message || 'Corrupt or unreadable file'}`, { cause: err });
    }
  }

  throw new Error('Unsupported file format. Please upload a .pdf or .docx resume file.');
}

module.exports = { extractTextFromFile };
