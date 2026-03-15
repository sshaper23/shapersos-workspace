import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  BorderStyle,
  Tab,
  TabStopPosition,
  TabStopType,
} from "docx";
import { saveAs } from "file-saver";
import { matrixSteps } from "@/data/messaging-matrix";

const BRAND_COLOR = "0EA5E9";
const DARK_COLOR = "1E293B";
const MUTED_COLOR = "64748B";

function createTitlePage(businessName: string, date: string): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 4000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "MESSAGING MATRIX",
          bold: true,
          size: 56,
          color: BRAND_COLOR,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "Strategic Research Document",
          size: 28,
          color: MUTED_COLOR,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          color: BRAND_COLOR,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: businessName,
          bold: true,
          size: 36,
          color: DARK_COLOR,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `Generated ${date}`,
          size: 22,
          color: MUTED_COLOR,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Powered by ShapersOS",
          size: 18,
          color: MUTED_COLOR,
          italics: true,
          font: "Calibri",
        }),
      ],
    }),
  ];
}

function createTableOfContents(): Paragraph[] {
  const steps = matrixSteps.slice(1); // skip step 0

  return [
    new Paragraph({
      children: [new PageBreak()],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Table of Contents",
          bold: true,
          color: DARK_COLOR,
          font: "Calibri",
          size: 36,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          color: BRAND_COLOR,
          size: 20,
        }),
      ],
    }),
    ...steps.map(
      (step) =>
        new Paragraph({
          spacing: { after: 200 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
          children: [
            new TextRun({
              text: `${step.stepNumber}. ${step.title}`,
              size: 24,
              color: DARK_COLOR,
              font: "Calibri",
            }),
            new TextRun({
              children: [new Tab()],
            }),
            new TextRun({
              text: `Step ${step.stepNumber}`,
              size: 20,
              color: MUTED_COLOR,
              font: "Calibri",
            }),
          ],
        })
    ),
  ];
}

function createStepSection(
  stepNumber: number,
  title: string,
  content: string
): Paragraph[] {
  const paragraphs: Paragraph[] = [
    // Page break before each section
    new Paragraph({
      children: [new PageBreak()],
    }),

    // Section header
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `Step ${stepNumber}`,
          size: 20,
          color: BRAND_COLOR,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 32,
          color: DARK_COLOR,
          font: "Calibri",
        }),
      ],
    }),

    // Divider
    new Paragraph({
      spacing: { after: 400 },
      border: {
        bottom: {
          color: BRAND_COLOR,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [],
    }),
  ];

  // Parse content into paragraphs
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphs.push(
        new Paragraph({ spacing: { after: 100 }, children: [] })
      );
      continue;
    }

    // Headings (markdown-style)
    if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({
              text: trimmed.replace(/^###\s*/, "").replace(/\*\*/g, ""),
              bold: true,
              size: 22,
              color: DARK_COLOR,
              font: "Calibri",
            }),
          ],
        })
      );
    } else if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: trimmed.replace(/^##\s*/, "").replace(/\*\*/g, ""),
              bold: true,
              size: 26,
              color: BRAND_COLOR,
              font: "Calibri",
            }),
          ],
        })
      );
    } else if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: trimmed.replace(/^#\s*/, "").replace(/\*\*/g, ""),
              bold: true,
              size: 30,
              color: DARK_COLOR,
              font: "Calibri",
            }),
          ],
        })
      );
    }
    // Bold lines (wrapped in **)
    else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: trimmed.replace(/\*\*/g, ""),
              bold: true,
              size: 22,
              color: DARK_COLOR,
              font: "Calibri",
            }),
          ],
        })
      );
    }
    // Bullet points
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletText = trimmed.replace(/^[-*]\s*/, "");
      // Handle inline bold within bullet
      const parts = parseBoldText(bulletText);
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360 },
          bullet: { level: 0 },
          children: parts,
        })
      );
    }
    // Numbered items
    else if (/^\d+\.\s/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s*/, "");
      const parts = parseBoldText(itemText);
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360 },
          children: parts,
        })
      );
    }
    // Table rows (pipe-separated)
    else if (trimmed.startsWith("|")) {
      // Skip separator rows
      if (trimmed.match(/^\|[\s-|]+\|$/)) continue;

      const cells = trimmed
        .split("|")
        .filter(Boolean)
        .map((c) => c.trim());
      const isHeader = lines.indexOf(line) >= 0 &&
        lines[lines.indexOf(line) + 1]?.trim().match(/^\|[\s-|]+\|$/);

      const runs: TextRun[] = [];
      cells.forEach((cell, i) => {
        if (i > 0) {
          runs.push(
            new TextRun({
              text: "  |  ",
              color: MUTED_COLOR,
              size: 20,
              font: "Calibri",
            })
          );
        }
        runs.push(
          new TextRun({
            text: cell.replace(/\*\*/g, ""),
            bold: !!isHeader,
            size: 20,
            color: isHeader ? BRAND_COLOR : DARK_COLOR,
            font: "Calibri",
          })
        );
      });

      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          children: runs,
        })
      );
    }
    // Regular paragraph
    else {
      const parts = parseBoldText(trimmed);
      paragraphs.push(
        new Paragraph({
          spacing: { after: 120 },
          children: parts,
        })
      );
    }
  }

  return paragraphs;
}

/** Parse a string and return TextRun[] with bold portions marked */
function parseBoldText(text: string): TextRun[] {
  const parts: TextRun[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before bold
    if (match.index > lastIndex) {
      parts.push(
        new TextRun({
          text: text.slice(lastIndex, match.index),
          size: 22,
          color: DARK_COLOR,
          font: "Calibri",
        })
      );
    }
    // Bold text
    parts.push(
      new TextRun({
        text: match[1],
        bold: true,
        size: 22,
        color: DARK_COLOR,
        font: "Calibri",
      })
    );
    lastIndex = regex.lastIndex;
  }

  // Remaining text after last bold
  if (lastIndex < text.length) {
    parts.push(
      new TextRun({
        text: text.slice(lastIndex),
        size: 22,
        color: DARK_COLOR,
        font: "Calibri",
      })
    );
  }

  if (parts.length === 0) {
    parts.push(
      new TextRun({
        text,
        size: 22,
        color: DARK_COLOR,
        font: "Calibri",
      })
    );
  }

  return parts;
}

export async function generateMatrixDocx(
  businessName: string,
  stepOutputs: Record<number, string>
): Promise<void> {
  const date = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sections: Paragraph[] = [];

  // Title page
  sections.push(...createTitlePage(businessName, date));

  // Table of contents
  sections.push(...createTableOfContents());

  // Content sections (steps 1-7)
  for (const step of matrixSteps.slice(1)) {
    const content = stepOutputs[step.stepNumber];
    if (content) {
      sections.push(
        ...createStepSection(step.stepNumber, step.title, content)
      );
    }
  }

  const doc = new Document({
    creator: "ShapersOS",
    title: `Messaging Matrix — ${businessName}`,
    description: `Strategic messaging research document for ${businessName}`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `MessagingMatrix_${businessName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, fileName);
}
