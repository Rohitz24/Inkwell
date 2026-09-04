import saveAs from "file-saver";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import html2pdf from "html2pdf.js";

// 1. Export as Plain Markdown (.md)
export function exportToMarkdown(title, textContent) {
  const content = `# ${title || "Untitled"}\n\n${textContent}`;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  saveAs(blob, `${(title || "document").toLowerCase().replace(/\s+/g, "-")}.md`);
}

// 2. Export as PDF (.pdf)
export function exportToPDF(elementId, title) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const opt = {
    margin: [15, 15, 15, 15],
    filename: `${(title || "document").toLowerCase().replace(/\s+/g, "-")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf().set(opt).from(element).save();
}

// 3. Export as Microsoft Word (.docx)
export async function exportToDocx(title, textContent) {
  const paragraphs = textContent
    .split("\n\n")
    .filter(Boolean)
    .map((p) => new Paragraph({ text: p, spacing: { after: 200 } }));

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title || "Untitled Document",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${(title || "document").toLowerCase().replace(/\s+/g, "-")}.docx`);
}