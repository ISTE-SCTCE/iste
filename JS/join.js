// Simple join page behavior: local validation + link to official Google Form
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('localJoinForm');
    const msg = document.getElementById('join-message');
    const googleBtn = document.getElementById('gotoGoogleForm');
    const googleFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSedLB440cM_eJxTYzXtfxVumi2fEsqSO_qWgyHn8jWH53td8g/viewform?usp=dialog';
    const joinNow = document.getElementById('join-now');

    if (googleBtn) {
        googleBtn.setAttribute('href', googleFormURL);
    }

    if (!form) return;

    form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const name = document.getElementById('join-name').value.trim();
        const email = document.getElementById('join-email').value.trim();
        if (!name || !email) {
            msg.textContent = 'Please enter your name and email.';
            msg.style.color = '#ffcccc';
            return;
        }

        // Mock-save to localStorage (no server). This lets the user see a response.
        const entry = { name, email, department: document.getElementById('join-dept').value.trim(), year: document.getElementById('join-year').value };
        const saved = JSON.parse(localStorage.getItem('iste_joined') || '[]');
        saved.push(Object.assign({ ts: Date.now() }, entry));
        localStorage.setItem('iste_joined', JSON.stringify(saved));

        msg.textContent = 'Thanks! Your details are saved locally. Click Official Form to finish registration.';
        msg.style.color = '#b3ffb3';
        form.reset();
    });

    // Join now button behaviour: submit local form if valid, otherwise scroll to form
    if (joinNow) {
        joinNow.addEventListener('click', function () {
            // if form fields are filled, trigger submit; otherwise focus the name field
            const nameVal = document.getElementById('join-name').value.trim();
            const emailVal = document.getElementById('join-email').value.trim();
            if (nameVal && emailVal) {
                // submit via requestSubmit where available
                if (typeof form.requestSubmit === 'function') form.requestSubmit();
                else form.dispatchEvent(new Event('submit', { cancelable: true }));
            } else {
                // scroll to the form and focus the name input
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                document.getElementById('join-name').focus();
                msg.textContent = 'Please fill your name and email to submit locally, or use Official Form.';
                msg.style.color = '#ffd0a6';
            }
        });
    }
});
