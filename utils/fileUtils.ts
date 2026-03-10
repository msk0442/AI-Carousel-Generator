declare const jspdf: any;

export const createCarouselPdf = (title: string, images: string[]) => {
  const doc = new jspdf.jsPDF({
    orientation: 'p',
    unit: 'px',
    format: [1080, 1080],
    compress: true,
  });

  if (!images || images.length === 0) {
    console.error("Cannot create PDF: No images provided.");
    return;
  }

  // Add the first page
  doc.addImage(`data:image/png;base64,${images[0]}`, 'PNG', 0, 0, 1080, 1080, undefined, 'FAST');
  
  // Add subsequent pages
  images.slice(1).forEach(imageBase64 => {
    doc.addPage([1080, 1080], 'p');
    doc.addImage(`data:image/png;base64,${imageBase64}`, 'PNG', 0, 0, 1080, 1080, undefined, 'FAST');
  });

  doc.save(`${(title || 'ai_carousel').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.pdf`);
};
