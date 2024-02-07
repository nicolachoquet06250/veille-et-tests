import html2pdf from 'html2pdf.js';

/**
 * @param {HTMLElement} elementToExtract 
 */
export function generatePDF(elementToExtract) {
  return () => {
    const element = elementToExtract.cloneNode(true);
    
    [...element.querySelectorAll('[data-extract_color]')]
        .map(e => (e.style.color = e.dataset.extract_color));

    [...element.querySelectorAll('[data-hide_in_export')]
        .map(e => (e.style.display = 'none'));
    
    html2pdf().set({
        margin:       0.5,
        filename:     'generated.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 1 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait', precision: '12' }
    }).from(element).save();
  }
}