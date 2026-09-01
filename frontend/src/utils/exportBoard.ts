import { jsPDF } from 'jspdf';

export const exportBoardAsPng = async (canvasElement: HTMLCanvasElement, filename: string = 'whiteboard.png') => {
  if (!canvasElement) return;
  const image = canvasElement.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = filename;
  link.click();
};

export const exportBoardAsPdf = async (canvasElement: HTMLCanvasElement, filename: string = 'whiteboard.pdf') => {
  if (!canvasElement) return;
  const image = canvasElement.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvasElement.width > canvasElement.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvasElement.width, canvasElement.height],
  });
  pdf.addImage(image, 'PNG', 0, 0, canvasElement.width, canvasElement.height);
  pdf.save(filename);
};
