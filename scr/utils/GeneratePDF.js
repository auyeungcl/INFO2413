import jsPDF from "jspdf";
import pdfMake from "pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";

export const generatePDFDocument = (pdfHtml) => {
  //   const doc = new jsPDF();

  let html = htmlToPdfmake(pdfHtml);
  const documentDefinition = { content: html };
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  pdfMake.createPdf(documentDefinition).open();
};
