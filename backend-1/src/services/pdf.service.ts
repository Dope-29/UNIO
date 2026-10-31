import PDFDocument from 'pdfkit';
interface Printable {
  number: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string | null;
  currency: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: { toString(): string };
  discountTotal: { toString(): string };
  taxTotal: { toString(): string };
  total: { toString(): string };
  amountPaid: { toString(): string };
  lines: {
    description: string;
    quantity: number;
    unitPrice: { toString(): string };
    discountAmount: { toString(): string };
    taxAmount: { toString(): string };
    lineTotal: { toString(): string };
  }[];
}
export async function invoicePdf(i: Printable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 45, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.fontSize(22).text('Brightloop Software');
    doc.fontSize(15).text(`Invoice ${i.number}`);
    doc
      .fontSize(10)
      .text(`Status: ${i.status} | Currency: ${i.currency}`)
      .text(
        `Issued: ${i.issueDate.toISOString().slice(0, 10)} | Due: ${i.dueDate.toISOString().slice(0, 10)}`,
      )
      .moveDown()
      .text(i.customerName)
      .text(i.customerEmail);
    if (i.customerAddress) doc.text(i.customerAddress);
    doc.moveDown();
    for (const l of i.lines) {
      if (doc.y > 690) doc.addPage();
      doc
        .fontSize(11)
        .text(l.description)
        .fontSize(9)
        .text(
          `${l.quantity} x ${l.unitPrice} | Discount ${l.discountAmount} | Tax ${l.taxAmount} | Total ${l.lineTotal}`,
        )
        .moveDown();
    }
    doc
      .moveDown()
      .fontSize(11)
      .text(`Subtotal: ${i.subtotal}`)
      .text(`Discount: ${i.discountTotal}`)
      .text(`Tax: ${i.taxTotal}`)
      .text(`Total: ${i.total} ${i.currency}`)
      .text(`Paid: ${i.amountPaid}`);
    doc.end();
  });
}
