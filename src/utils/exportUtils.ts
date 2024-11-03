import jsPDF from 'jspdf';

interface ExportOptions {
  format: 'pdf' | 'txt' | 'json';
  filename?: string;
}

export const exportDreams = (dreams: any[], options: ExportOptions) => {
  const filename = options.filename || `dream-journal-${new Date().toISOString().split('T')[0]}`;

  switch (options.format) {
    case 'pdf':
      exportToPDF(dreams, filename);
      break;
    case 'txt':
      exportToTXT(dreams, filename);
      break;
    case 'json':
      exportToJSON(dreams, filename);
      break;
  }
};

const exportToPDF = (dreams: any[], filename: string) => {
  const pdf = new jsPDF();
  let yPosition = 20;

  pdf.setFontSize(20);
  pdf.text('Dream Journal', 20, yPosition);
  yPosition += 20;

  dreams.forEach((dream, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.text(`Dream #${index + 1}`, 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.text(`Date: ${new Date(dream.date).toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;

    pdf.text(`Mood: ${dream.mood}`, 20, yPosition);
    yPosition += 10;

    pdf.text(`Clarity: ${dream.clarity}`, 20, yPosition);
    yPosition += 10;

    // Split long text into multiple lines
    const contentLines = pdf.splitTextToSize(dream.content, 170);
    contentLines.forEach((line: string) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 7;
    });

    yPosition += 10;
  });

  pdf.save(`${filename}.pdf`);
};

const exportToTXT = (dreams: any[], filename: string) => {
  let content = 'DREAM JOURNAL\n\n';

  dreams.forEach((dream, index) => {
    content += `Dream #${index + 1}\n`;
    content += `Date: ${new Date(dream.date).toLocaleDateString()}\n`;
    content += `Mood: ${dream.mood}\n`;
    content += `Clarity: ${dream.clarity}\n`;
    content += `Content: ${dream.content}\n`;
    content += '\n-------------------\n\n';
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportToJSON = (dreams: any[], filename: string) => {
  const content = JSON.stringify(dreams, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 