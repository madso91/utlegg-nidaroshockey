emailjs.init("YOUR_EMAILJS_USER_ID");
const utleggContainer = document.getElementById('utleggContainer');
const leggTilUtleggBtn = document.getElementById('leggTilUtleggBtn');
const totalSumEl = document.getElementById('totalSum');
const form = document.getElementById('utleggForm');
function updateTotal() {
    let sum = 0;
    document.querySelectorAll('input[name="belopBilde"]').forEach(input => {
        sum += parseFloat(input.value) || 0;
    });
    totalSumEl.textContent = sum.toFixed(2);
}
leggTilUtleggBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'utleggItem';
    div.innerHTML = `<label>Formål</label><input type="text" name="formalBilde" required><label>Beløp (kr)</label><input type="number" name="belopBilde" required><label>Last opp kvittering</label><input type="file" name="bilde" accept="image/*" capture="environment" required>`;
    utleggContainer.appendChild(div);
    div.querySelector('input[name="belopBilde"]').addEventListener('input', updateTotal);
});
document.addEventListener('input', updateTotal);
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});
document.getElementById('clearSignature').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = 'nidaros-logo.png';
    logo.onload = () => {
        doc.addImage(logo, 'PNG', 10, 10, 50, 50);
        let y = 70;
        doc.text(`Navn: ${form.navn.value}`, 10, y); y += 10;
        doc.text(`Fødselsdato: ${form.fodsel.value}`, 10, y); y += 10;
        doc.text(`Personnummer: ${form.personnummer.value}`, 10, y); y += 10;
        doc.text(`Adresse: ${form.adresse.value}`, 10, y); y += 10;
        doc.text(`Telefon: ${form.telefon.value}`, 10, y); y += 10;
        doc.text(`Kontonummer: ${form.kontonummer.value}`, 10, y); y += 10;
        const utleggItems = document.querySelectorAll('.utleggItem');
        utleggItems.forEach((item, i) => {
            y += 10;
            doc.text(`Utlegg ${i+1}:`, 10, y); y += 10;
            doc.text(`Formål: ${item.querySelector('input[name="formalBilde"]').value}`, 10, y); y += 10;
            doc.text(`Beløp: ${item.querySelector('input[name="belopBilde"]').value} kr`, 10, y); y += 10;
        });
        y += 10;
        doc.text(`Total: ${totalSumEl.textContent} kr`, 10, y); y += 10;
        const signatureData = canvas.toDataURL('image/png');
        doc.addImage(signatureData, 'PNG', 10, y, 100, 40);
        const pdfBlob = doc.output('blob');
        emailjs.send('service_h57xle3', 'template_u45ds36', {
            to_email: 'leder@nidaroshockey.no',
            message: 'Utleggsskjema vedlagt',
            attachment: pdfBlob
        }).then(() => {
            alert('Skjema sendt!');
            form.reset();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            totalSumEl.textContent = '0';
        }).catch(err => {
            alert('Feil ved sending: ' + err);
        });
    };
});