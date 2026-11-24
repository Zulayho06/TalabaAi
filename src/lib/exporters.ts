import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from 'docx';
import PptxGenJS from 'pptxgenjs';
import { AcademicWork } from '../types/academic';

function slugifyFileName(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60) || 'mustaqil_ish'
  );
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadWorkAsDocx(work: AcademicWork): Promise<void> {
  const currentYear = new Date().getFullYear().toString();
  const children: Paragraph[] = [];

  if (work.format === 'referat') {
    // Formal University Cover Page (Titul varag'i)
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: "O'ZBEKISTON RESPUBLIKASI OLIY TA'LIM, FAN VA INNOVATSIYALAR VAZIRLIGI",
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: work.university.toUpperCase(),
            bold: true,
            size: 26,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1600 },
        children: [
          new TextRun({
            text: `${work.faculty} fakulteti`,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: 'MUSTAQIL ISH (REFERAT)',
            bold: true,
            size: 40,
            color: '1E3A8A',
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: `Fan: ${work.subject}`,
            bold: true,
            size: 26,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1800 },
        children: [
          new TextRun({
            text: `Mavzu: ${work.title}`,
            bold: true,
            size: 28,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `Bajardi: ${work.studentName}`,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 2000 },
        children: [
          new TextRun({
            text: `Guruh: ${work.groupName}`,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: `${currentYear}-yil`,
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // Table of Contents / Reja
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: 'REJA',
            bold: true,
            size: 30,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    work.sections.forEach((sec, idx) => {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `${idx + 1}. ${sec.heading}`,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    });

    if (work.references.length > 0) {
      children.push(
        new Paragraph({
          spacing: { after: 320 },
          children: [
            new TextRun({
              text: `${work.sections.length + 1}. Foydalanilgan adabiyotlar`,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    if (work.abstract) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
          children: [
            new TextRun({
              text: 'Qisqacha annotatsiya',
              bold: true,
              size: 26,
              font: 'Times New Roman',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 240, line: 360 },
          children: [
            new TextRun({
              text: work.abstract,
              italics: true,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }
  } else {
    // Maqola (Academic Article) header
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: `${work.subject.toUpperCase()} · ILMIY MAQOLA`,
            bold: true,
            size: 20,
            color: '1E3A8A',
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: work.title,
            bold: true,
            size: 34,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    if (work.subtitle) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: work.subtitle,
              italics: true,
              size: 24,
              color: '475569',
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
        },
        children: [
          new TextRun({
            text: `${work.studentName} — ${work.university}, ${work.faculty} (${work.groupName})`,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    if (work.abstract) {
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: 'Annotatsiya: ',
              bold: true,
              size: 24,
              font: 'Times New Roman',
            }),
            new TextRun({
              text: work.abstract,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    if (work.keywords.length > 0) {
      children.push(
        new Paragraph({
          spacing: { after: 260 },
          children: [
            new TextRun({
              text: "Kalit so'zlar: ",
              bold: true,
              size: 24,
              font: 'Times New Roman',
            }),
            new TextRun({
              text: work.keywords.join(', '),
              italics: true,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }
  }

  // Body Sections (both Referat and Maqola)
  work.sections.forEach((sec) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 140 },
        children: [
          new TextRun({
            text: sec.heading,
            bold: true,
            size: 28,
            color: '0F172A',
            font: 'Times New Roman',
          }),
        ],
      })
    );

    sec.paragraphs.forEach((para) => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 160, line: 360 },
          indent: { firstLine: 480 },
          children: [
            new TextRun({
              text: para,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    });
  });

  // References
  if (work.references.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 140 },
        children: [
          new TextRun({
            text: 'Foydalanilgan adabiyotlar',
            bold: true,
            size: 28,
            color: '0F172A',
            font: 'Times New Roman',
          }),
        ],
      })
    );

    work.references.forEach((ref, idx) => {
      children.push(
        new Paragraph({
          spacing: { after: 100, line: 320 },
          children: [
            new TextRun({
              text: `${idx + 1}. ${ref}`,
              size: 22,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const prefix = work.format === 'maqola' ? 'maqola' : 'referat';
  triggerBlobDownload(blob, `${prefix}_${slugifyFileName(work.topic)}.docx`);
}

export async function downloadWorkAsPptx(work: AcademicWork): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = work.studentName;
  pptx.subject = work.subject;
  pptx.title = work.title;

  const slidesData =
    work.slides.length > 0
      ? work.slides
      : [
          {
            title: work.title,
            subtitle: work.subtitle,
            bullets: [work.abstract || work.topic],
            notes: '',
          },
        ];

  // Slide 1: Cover Slide (Deep Academic Navy)
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: '0F172A' };
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0.7,
    y: 0.7,
    w: 1.4,
    h: 0.08,
    fill: { color: '3B82F6' },
  });
  coverSlide.addText(work.subject.toUpperCase(), {
    x: 0.7,
    y: 0.95,
    w: 11.8,
    h: 0.4,
    fontSize: 13,
    bold: true,
    color: '93C5FD',
    fontFace: 'Calibri',
  });
  coverSlide.addText(work.title, {
    x: 0.7,
    y: 1.55,
    w: 11.8,
    h: 1.8,
    fontSize: 34,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Calibri',
    valign: 'top',
  });
  if (work.subtitle) {
    coverSlide.addText(work.subtitle, {
      x: 0.7,
      y: 3.45,
      w: 11.2,
      h: 0.7,
      fontSize: 17,
      color: 'CBD5E1',
      fontFace: 'Calibri',
    });
  }
  coverSlide.addShape(pptx.ShapeType.line, {
    x: 0.7,
    y: 4.55,
    w: 11.9,
    h: 0,
    line: { color: '334155', width: 1 },
  });
  coverSlide.addText(
    `${work.studentName}  |  ${work.university}  |  ${work.faculty} (${work.groupName})`,
    {
      x: 0.7,
      y: 4.75,
      w: 11.9,
      h: 0.45,
      fontSize: 13,
      color: '94A3B8',
      fontFace: 'Calibri',
    }
  );

  // Content Slides
  slidesData.forEach((sl, idx) => {
    // Skip duplicate cover if AI already returned the exact same title on slide 1
    if (idx === 0 && sl.title.trim().toLowerCase() === work.title.trim().toLowerCase() && sl.bullets.length <= 2) {
      return;
    }
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Top accent rule
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.12,
      fill: { color: '1E3A8A' },
    });

    // Header label
    slide.addText(`${work.subject}  ·  ${String(idx + 1).padStart(2, '0')}`, {
      x: 0.7,
      y: 0.35,
      w: 11.9,
      h: 0.35,
      fontSize: 11,
      color: '64748B',
      fontFace: 'Calibri',
    });

    slide.addText(sl.title, {
      x: 0.7,
      y: 0.72,
      w: 11.9,
      h: 0.75,
      fontSize: 26,
      bold: true,
      color: '0F172A',
      fontFace: 'Calibri',
    });

    if (sl.subtitle) {
      slide.addText(sl.subtitle, {
        x: 0.7,
        y: 1.48,
        w: 11.9,
        h: 0.4,
        fontSize: 14,
        italic: true,
        color: '475569',
        fontFace: 'Calibri',
      });
    }

    const bulletItems = sl.bullets.map((b) => ({
      text: b,
      options: { bullet: { indent: 18 }, paraSpaceAfter: 12, breakLine: true },
    }));

    slide.addText(bulletItems, {
      x: 0.75,
      y: sl.subtitle ? 2.0 : 1.65,
      w: 11.8,
      h: 3.1,
      fontSize: 17,
      color: '1E293B',
      fontFace: 'Calibri',
      valign: 'top',
    });

    // Footer
    slide.addText(`${work.studentName} · ${work.university}`, {
      x: 0.7,
      y: 5.2,
      w: 11.9,
      h: 0.3,
      fontSize: 10,
      color: '94A3B8',
      fontFace: 'Calibri',
    });

    if (sl.notes) {
      slide.addNotes(sl.notes);
    }
  });

  // Closing / References Slide if references exist
  if (work.references.length > 0) {
    const refSlide = pptx.addSlide();
    refSlide.background = { color: 'F8FAFC' };
    refSlide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.12,
      fill: { color: '1E3A8A' },
    });
    refSlide.addText('Foydalanilgan adabiyotlar', {
      x: 0.7,
      y: 0.55,
      w: 11.9,
      h: 0.65,
      fontSize: 24,
      bold: true,
      color: '0F172A',
      fontFace: 'Calibri',
    });
    const refItems = work.references.slice(0, 8).map((r, i) => ({
      text: `${i + 1}. ${r}`,
      options: { paraSpaceAfter: 8, breakLine: true },
    }));
    refSlide.addText(refItems, {
      x: 0.7,
      y: 1.35,
      w: 11.9,
      h: 3.8,
      fontSize: 13,
      color: '334155',
      fontFace: 'Calibri',
      valign: 'top',
    });
  }

  await pptx.writeFile({ fileName: `taqdimot_${slugifyFileName(work.topic)}.pptx` });
}
