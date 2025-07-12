// ذخیره و مدیریت سوالات متداول در LocalStorage
function getFAQs() {
    return JSON.parse(localStorage.getItem('ai_faqs') || '[]');
}
function saveFAQs(faqs) {
    localStorage.setItem('ai_faqs', JSON.stringify(faqs));
}
function renderFAQs() {
    const list = document.getElementById('faq-list');
    const faqs = getFAQs();
    list.innerHTML = '';
    faqs.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'faq-item';
        div.innerHTML = `
            <b>سوال:</b> ${item.q}<br>
            <b>جواب:</b> ${item.a}
            <div class="actions">
                <button onclick="editFAQ(${idx})">ویرایش</button>
                <button onclick="deleteFAQ(${idx})">حذف</button>
            </div>
        `;
        list.appendChild(div);
    });
}
function addFAQ(q, a) {
    const faqs = getFAQs();
    faqs.push({q, a});
    saveFAQs(faqs);
    renderFAQs();
}
function deleteFAQ(idx) {
    const faqs = getFAQs();
    faqs.splice(idx, 1);
    saveFAQs(faqs);
    renderFAQs();
}
function editFAQ(idx) {
    const faqs = getFAQs();
    document.getElementById('faq-question').value = faqs[idx].q;
    document.getElementById('faq-answer').value = faqs[idx].a;
    deleteFAQ(idx);
}
document.getElementById('faq-form').onsubmit = function(e) {
    e.preventDefault();
    const q = document.getElementById('faq-question').value.trim();
    const a = document.getElementById('faq-answer').value.trim();
    if (q && a) {
        addFAQ(q, a);
        this.reset();
    }
};
renderFAQs(); 