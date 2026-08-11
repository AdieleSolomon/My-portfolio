const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} = require("docx");

const rootDir = path.resolve(__dirname, "..");
const cvHtmlPath = path.join(rootDir, "Solomon-Adiele-CV.html");
const documentsDir = path.join(rootDir, "assets", "documents");
const pdfPath = path.join(documentsDir, "Solomon-Adiele-CV.pdf");
const docxPath = path.join(documentsDir, "Solomon_Adiele_CV.docx");
const legacyDocxPath = path.join(documentsDir, "Solomon-Adiele-CV.docx");

const COLORS = {
  primary: "041128",
  secondary: "D8A13A",
  accent: "F2D06F",
  light: "FFF3D0",
  text: "14213A",
  textLight: "5F6A7D",
  white: "FFFFFF",
};

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: COLORS.white,
};

const cellBorders = {
  top: noBorder,
  right: noBorder,
  bottom: noBorder,
  left: noBorder,
};

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

function findBrowser() {
  return chromeCandidates.find((candidate) => fs.existsSync(candidate));
}

function run(text, options = {}) {
  return new TextRun({
    text,
    font: "Segoe UI",
    color: options.color || COLORS.text,
    bold: options.bold || false,
    italics: options.italics || false,
    size: options.size || 20,
  });
}

function paragraph(children, options = {}) {
  return new Paragraph({
    children: Array.isArray(children) ? children : [run(children, options.run)],
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: {
      before: options.before || 0,
      after: options.after ?? 120,
      line: options.line || 240,
    },
    indent: options.indent,
  });
}

function heading(text, left = false) {
  return paragraph([run(text, { color: left ? COLORS.white : COLORS.primary, bold: true, size: 24 })], {
    before: 220,
    after: 120,
  });
}

function labelValue(label, value) {
  return [
    paragraph([run(label, { color: COLORS.accent, bold: true, size: 17 })], {
      after: 30,
    }),
    paragraph([run(value, { color: COLORS.white, size: 17 })], {
      after: 110,
    }),
  ];
}

function tag(text) {
  return paragraph([run(text, { color: COLORS.primary, size: 16 })], {
    after: 70,
    indent: { left: 120 },
  });
}

function bullet(text, left = false) {
  return paragraph(
    [
      run("> ", {
        color: left ? COLORS.accent : COLORS.secondary,
        bold: true,
        size: 18,
      }),
      run(text, { color: left ? COLORS.white : COLORS.text, size: 18 }),
    ],
    { after: 80, indent: { left: 120 } },
  );
}

function twoPartLine(leftText, rightText, options = {}) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: noBorder,
      right: noBorder,
      bottom: noBorder,
      left: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [
              paragraph([run(leftText, { bold: true, color: COLORS.primary, size: 19 })], {
                after: 40,
              }),
            ],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [
              paragraph([run(rightText, { bold: true, color: COLORS.secondary, size: 18 })], {
                alignment: AlignmentType.RIGHT,
                after: 40,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function leftColumnChildren() {
  return [
    paragraph([run("SOLOMON CHIMEREUCHEYA ADIELE", { color: COLORS.secondary, size: 28 })], {
      alignment: AlignmentType.CENTER,
      after: 50,
    }),
    paragraph([run("Full-Stack Developer", { color: COLORS.secondary, size: 22 })], {
      alignment: AlignmentType.CENTER,
      after: 260,
    }),

    heading("CONTACT", true),
    bullet("08069383370, 08127890779", true),
    bullet("solomonadiele1@gmail.com", true),
    bullet("Abia State, Nigeria", true),

    heading("PERSONAL DETAILS", true),
    ...labelValue("Date of Birth", "12th March 1997"),
    ...labelValue("Place of Birth", "Aba, Abia State"),
    ...labelValue("Gender", "Male"),
    ...labelValue("Marital Status", "Single"),
    ...labelValue("State of Origin", "Abia State"),
    ...labelValue("LGA", "Obingwa"),
    ...labelValue("Hometown", "Eziama Mgboko"),
    ...labelValue("Nationality", "Nigerian"),
    ...labelValue("Religion", "Christianity"),

    heading("TECHNICAL SKILLS", true),
    paragraph([run("Development", { color: COLORS.accent, bold: true, size: 19 })], {
      after: 70,
    }),
    tag("Full-Stack Development"),
    tag("System Formatting"),
    tag("Windows Installation"),
    paragraph([run("Software", { color: COLORS.accent, bold: true, size: 19 })], {
      before: 120,
      after: 70,
    }),
    tag("Video Editing"),
    tag("Microsoft Office Suite"),

    heading("PROFESSIONAL SKILLS", true),
    bullet("Team Leadership", true),
    bullet("Mentoring & Development", true),
    bullet("Problem Solving", true),
    bullet("Communication", true),
    bullet("Payroll Management", true),
    bullet("Teaching & Instruction", true),
  ];
}

function rightColumnChildren() {
  return [
    heading("PROFESSIONAL PROFILE"),
    paragraph(
      [
        run(
          "A dedicated and passionate Full-Stack Developer with a strong background in computer science, seeking to contribute technical expertise and professional skills to drive organizational growth and development through innovation, integrity, and excellence.",
          { color: COLORS.textLight, italics: true, size: 19 },
        ),
      ],
      { alignment: AlignmentType.CENTER, after: 260 },
    ),

    heading("WORK EXPERIENCE"),
    twoPartLine("Payroll Specialist / Salary Account Officer", "Mar 2023 - May 2025"),
    paragraph([run("Inner Galaxy Steel Company Limited", { bold: true, size: 18 })], {
      after: 70,
    }),
    bullet("Managed payroll operations ensuring accuracy and timely disbursement"),
    bullet("Handled salary accounts and financial records for employees"),
    bullet("Implemented efficient payroll processing systems"),

    twoPartLine("ICT Staff Worker", "Jul 2019 - Jan 2020"),
    paragraph([run("Rivers State Television (RSTV)", { bold: true, size: 18 })], {
      after: 70,
    }),
    bullet("Gained practical experience in technology operations and support"),
    bullet("Assisted in ICT department functions and technical tasks"),
    bullet("Developed foundational IT support skills"),

    heading("EDUCATION"),
    twoPartLine("Full-Stack Developer (Postgraduate)", "2025"),
    paragraph([run("Babcock University, Ilishan Remo, Ogun State", { size: 18 })], {
      after: 160,
    }),
    twoPartLine("BSc Computer Science", "2017 - 2020"),
    paragraph([run("Clifford University, Ihie, Abia State", { size: 18 })], {
      after: 160,
    }),
    twoPartLine("Diploma in Computer Training", "2016"),
    paragraph([run("Ever Great Computers, Omoba, Abia State", { size: 18 })], {
      after: 160,
    }),
    twoPartLine("SSCE", "2009 - 2015"),
    paragraph([run("Lucy Memorial Secondary School, Amiri, Abia State", { size: 18 })], {
      after: 160,
    }),
    twoPartLine("First School Leaving Certificate", "2002 - 2009"),
    paragraph([run("C.P.S Eziama Mgboko, Obingwa L.G.A, Abia State", { size: 18 })], {
      after: 160,
    }),

    heading("CERTIFICATIONS"),
    twoPartLine("NYSC Discharge Certificate", "2021 - 2022"),

    heading("REFERENCES"),
    paragraph([run("Available upon request", { size: 18 })], { after: 0 }),
  ];
}

async function generateDocx() {
  const doc = new Document({
    creator: "Solomon Adiele",
    title: "Solomon Adiele CV",
    description: "Curriculum vitae of Solomon Adiele",
    styles: {
      default: {
        document: {
          run: {
            font: "Segoe UI",
            size: 20,
            color: COLORS.text,
          },
          paragraph: {
            spacing: { line: 240 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838,
            },
            margin: {
              top: 360,
              right: 360,
              bottom: 360,
              left: 360,
            },
          },
        },
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            borders: {
              top: noBorder,
              right: noBorder,
              bottom: noBorder,
              left: noBorder,
              insideHorizontal: noBorder,
              insideVertical: noBorder,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 34, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP,
                    shading: {
                      type: ShadingType.CLEAR,
                      fill: COLORS.primary,
                      color: "auto",
                    },
                    margins: {
                      top: 420,
                      right: 300,
                      bottom: 420,
                      left: 300,
                    },
                    borders: cellBorders,
                    children: leftColumnChildren(),
                  }),
                  new TableCell({
                    width: { size: 66, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP,
                    margins: {
                      top: 420,
                      right: 300,
                      bottom: 420,
                      left: 360,
                    },
                    borders: cellBorders,
                    children: rightColumnChildren(),
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  fs.writeFileSync(legacyDocxPath, buffer);
}

function generatePdf() {
  const browserPath = findBrowser();

  if (!browserPath) {
    throw new Error(
      "Chrome or Edge was not found. Set CHROME_PATH to a Chromium-based browser executable.",
    );
  }

  const fileUrl = `file:///${cvHtmlPath.replace(/\\/g, "/")}?print=1`;
  const result = spawnSync(
    browserPath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--print-to-pdf-no-header",
      `--print-to-pdf=${pdfPath}`,
      fileUrl,
    ],
    {
      cwd: rootDir,
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "PDF generation failed.");
  }
}

async function main() {
  fs.mkdirSync(documentsDir, { recursive: true });

  generatePdf();
  await generateDocx();

  console.log(`Generated ${path.relative(rootDir, pdfPath)}`);
  console.log(`Generated ${path.relative(rootDir, docxPath)}`);
  console.log(`Generated ${path.relative(rootDir, legacyDocxPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
