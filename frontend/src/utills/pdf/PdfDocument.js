import jsPDF from "jspdf";

// A4 portrait, mm units — pure vector/text based PDF, koi DOM screenshot nahi.
// Isi liye output PC/mobile/kisi bhi screen size se generate ho, hamesha same nikalta he.
const MARGIN = 12;

export const COLORS = {
  primary: [22, 119, 255],
  primaryDark: [13, 71, 201],
  purple: [147, 51, 234],
  blue100: [219, 234, 254],
  slate700: [51, 65, 85],
  slate500: [100, 116, 139],
  slate200: [226, 232, 240],
  slate100: [241, 245, 249],
  slate300: [203, 213, 225],
  slate50: [248, 250, 252],
  white: [255, 255, 255],
  green: [16, 129, 88],
};

export class PdfDocument {
  
  constructor({ orientation = "p" } = {}) {
    this.doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = MARGIN;
    this.contentWidth = this.pageWidth - this.margin * 2;
    this.cursorY = this.margin;
    this._headerRenderer = null; // naye page pe repeat hone wala header
  }

  ensureSpace(neededHeight, footerSpace = 8) {
    const bottomLimit = this.pageHeight - this.margin - footerSpace;
    if (this.cursorY + neededHeight > bottomLimit) this.addPage();
  }

  addPage() {
    this.doc.addPage();
    this.cursorY = this.margin;
    if (this._headerRenderer) this._headerRenderer(this);
  }

  // is ke baad jitne bhi naye page auto-add honge (table pagination se),
  // un sab pe ye hi header dubara draw hoga — ek hi jagah define karna hota he
  setRepeatingHeader(renderFn) {
    this._headerRenderer = renderFn;
  }

  // ---- Logo (left) + Org info (right) ----
  addBrandHeader({
    logoDataUrl,
    logoWidth = 22,
    logoHeight = 22,
    titleLines = [],
    orgLines = [],
  }) {
    const startY = this.cursorY;

    if (logoDataUrl) {
      this.doc.addImage(
        logoDataUrl,
        "PNG",
        this.margin,
        startY,
        logoWidth,
        logoHeight,
      );
    }

    let leftX = this.margin + (logoDataUrl ? logoWidth + 4 : 0);
    let ty = startY + 5;
    titleLines.forEach((line) => {
      this.doc.setFont("helvetica", line.bold ? "bold" : "normal");
      this.doc.setFontSize(line.size || 10);
      this.doc.setTextColor(...(line.color || COLORS.slate700));
      this.doc.text(line.text, leftX, ty);
      ty += (line.size || 10) * 0.42 + 2;
    });

    let ry = startY + 4;
    orgLines.forEach((line) => {
      if (!line.text) return;
      this.doc.setFont("helvetica", line.bold ? "bold" : "normal");
      this.doc.setFontSize(line.size || 9);
      this.doc.setTextColor(...(line.color || COLORS.slate500));
      this.doc.text(line.text, this.pageWidth - this.margin, ry, {
        align: "right",
      });
      ry += (line.size || 9) * 0.42 + 1.8;
    });

    this.cursorY = Math.max(startY + logoHeight, ty, ry) + 3;
    this._divider();
  }

  _divider(color = COLORS.slate200) {
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(0.4);
    this.doc.line(
      this.margin,
      this.cursorY,
      this.pageWidth - this.margin,
      this.cursorY,
    );
    this.cursorY += 5;
  }

  addSectionHeading(text, opts = {}) {
    const { fill = COLORS.primary, gapAfter = 4 } = opts;
    this.ensureSpace(9);
    const h = 7;
    this.doc.setFillColor(...fill);
    this.doc.rect(this.margin, this.cursorY, this.contentWidth, h, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10);
    this.doc.setTextColor(...COLORS.white);
    this.doc.text(text, this.margin + 3, this.cursorY + h - 2.3);
    this.cursorY += h + gapAfter;
  }

  // left-aligned heading — bg sirf text ke content tak hoti he, poori width nahi
  addInlineHeading(text, opts = {}) {
    const {
      fill = COLORS.blue100,
      textColor = COLORS.primaryDark,
      fontSize = 10.5,
      paddingX = 4,
      paddingY = 2.2,
      gapAfter = 4,
    } = opts;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(fontSize);

    const textWidth = this.doc.getTextWidth(text);
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = fontSize * 0.42 + paddingY * 2;

    this.ensureSpace(boxHeight + gapAfter);

    this.doc.setFillColor(...fill);
    this.doc.roundedRect(
      this.margin,
      this.cursorY,
      boxWidth,
      boxHeight,
      1.2,
      1.2,
      "F",
    );

    this.doc.setTextColor(...textColor);
    this.doc.text(
      text,
      this.margin + paddingX,
      this.cursorY + boxHeight - paddingY - 0.6,
    );

    this.cursorY += boxHeight + gapAfter;
  }

  // table jaise hi columns/widths use kar ke ek highlighted totals row draw karta he
  addSummaryRow(columns, summaryData = {}, opts = {}) {
    const {
      fill = COLORS.slate100,
      textColor = COLORS.slate700,
      gapAfter = 6,
    } = opts;
    const rowH = 8;
    this.ensureSpace(rowH + gapAfter);

    this.doc.setFillColor(...fill);
    this.doc.rect(this.margin, this.cursorY, this.contentWidth, rowH, "F");

    // top border — table se alag dikhane ke liye thin line, gap nahi
    this.doc.setDrawColor(...COLORS.slate200);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      this.margin,
      this.cursorY,
      this.margin + this.contentWidth,
      this.cursorY,
    );

    let x = this.margin;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...textColor);

    columns.forEach((col) => {
      const align = col.align || "left";
      const value = col.summaryRender ? col.summaryRender(summaryData) : "";
      const textX = align === "right" ? x + col.width - 2 : x + 2;
      this.doc.text(value, textX, this.cursorY + rowH - 2.6, { align });
      x += col.width;
    });

    this.cursorY += rowH + gapAfter;
  }

  // 2-column label:value grid (doctor info + filters ke liye)
  addInfoGrid(pairs, columns = 2) {
    const colWidth = this.contentWidth / columns;
    const rowHeight = 6.5;
    const rows = Math.ceil(pairs.length / columns);
    this.ensureSpace(rows * rowHeight + 4);

    pairs.forEach((pair, idx) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      const x = this.margin + col * colWidth;
      const y = this.cursorY + row * rowHeight;

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8.3);
      this.doc.setTextColor(...COLORS.slate500);
      this.doc.text(`${pair.label}:`, x, y);

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9);
      this.doc.setTextColor(...COLORS.slate700);
      this.doc.text(String(pair.value ?? "-"), x + 32, y);
    });

    this.cursorY += rows * rowHeight + 4;
  }

  // stat cards row (Total Patient / Gross / Discount / Net)
  addStatCards(stats) {
    const gap = 3;
    const cardW = (this.contentWidth - gap * (stats.length - 1)) / stats.length;
    const cardH = 14;
    this.ensureSpace(cardH + 4);

    stats.forEach((stat, i) => {
      const x = this.margin + i * (cardW + gap);
      const y = this.cursorY;

      this.doc.setFillColor(...COLORS.slate50);
      this.doc.setDrawColor(...COLORS.slate200);
      this.doc.roundedRect(x, y, cardW, cardH, 1.4, 1.4, "FD");

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(6.8);
      this.doc.setTextColor(...COLORS.slate500);
      this.doc.text(stat.label, x + 2.5, y + 5);

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9.5);
      this.doc.setTextColor(...(stat.valueColor || COLORS.slate700));
      this.doc.text(String(stat.value), x + 2.5, y + 11);
    });

    this.cursorY += cardH + 5;
  }

  // Auto page-break + header repeat table — columns: [{key,label,width,align,render}]
  addTable({
    columns,
    rows,
    zebra = true,
    bottomGap = 4,
    bottomBorder = true,
  }) {
    const headerH = 7.5;
    const rowH = 6;

    const drawHeader = () => {
      this.doc.setFillColor(...COLORS.slate700);
      this.doc.rect(this.margin, this.cursorY, this.contentWidth, headerH, "F");
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.4);
      this.doc.setTextColor(...COLORS.white);

      let x = this.margin;
      columns.forEach((col) => {
        const align = col.align || "left";
        const textX = align === "right" ? x + col.width - 2 : x + 2;
        this.doc.text(col.label, textX, this.cursorY + headerH - 2.3, {
          align,
        });
        x += col.width;
      });
      this.cursorY += headerH;
    };

    this.ensureSpace(headerH + rowH * 2);
    drawHeader();

    rows.forEach((row, idx) => {
      if (this.cursorY + rowH > this.pageHeight - this.margin - 8) {
        this.addPage();
        drawHeader();
      }

      if (zebra && idx % 2 === 1) {
        this.doc.setFillColor(...COLORS.slate50);
        this.doc.rect(this.margin, this.cursorY, this.contentWidth, rowH, "F");
      }

      let x = this.margin;
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.3);
      this.doc.setTextColor(...COLORS.slate700);

      columns.forEach((col) => {
        const align = col.align || "left";
        const value = col.render ? col.render(row) : String(row[col.key] ?? "");
        const textX = align === "right" ? x + col.width - 2 : x + 2;
        this.doc.text(value, textX, this.cursorY + rowH - 1.8, { align });
        x += col.width;
      });

      this.cursorY += rowH;
    });

    if (bottomBorder) {
      this.doc.setDrawColor(...COLORS.slate200);
      this.doc.line(
        this.margin,
        this.cursorY,
        this.margin + this.contentWidth,
        this.cursorY,
      );
    }
    this.cursorY += bottomGap;
  }
  addSpacer(h = 4) {
    this.cursorY += h;
  }

  // sab pages pe footer (page number etc.) — end me ek hi baar call karo
  finalizeFooters(footerText = "") {
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.3);
      this.doc.setTextColor(...COLORS.slate500);
      this.doc.text(footerText, this.margin, this.pageHeight - 6);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight - 6,
        { align: "right" },
      );
    }
  }

  save(fileName) {
    this.doc.save(`${fileName.replace(/\s+/g, "_")}.pdf`);
  }
}
