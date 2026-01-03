const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';
const FOLDERS = {
    novel: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    codewords: '1n8MuNqMaOe6eAntLDf-zTHXaNji3NEkn',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

let purchasedEpisodes = JSON.parse(localStorage.getItem('purchased_episodes')) || [];
let currentPurchase = null;

window.onload = () => { loadEpisodes(); };

function showSection(section) {
    document.getElementById('home-screen').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section + '-section').classList.add('active');
}

function showHome() {
    document.getElementById('home-screen').style.display = 'block';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
}

function loadEpisodes() {
    const container = document.getElementById('episodes-container');
    container.innerHTML = '';
    for (let i = 1; i <= 100; i++) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        let packageId = i <= 10 ? 'free' : (i <= 80 ? Math.ceil((i - 10) / 5) : 'final');
        
        if (i <= 10 || purchasedEpisodes.includes('pkg_' + packageId)) {
            card.innerHTML = `قسط ${i}<br><span style="color:green">پڑھیں</span>`;
            card.onclick = () => openFile(i);
        } else {
            card.innerHTML = `قسط ${i}<br><span style="color:red">لاک</span>`;
            card.onclick = () => showPayment(i, packageId);
        }
        container.appendChild(card);
    }
}

function showPayment(num, pkgId) {
    currentPurchase = { num, pkgId };
    const modal = document.getElementById('payment-modal');
    const msg = document.getElementById('payment-message');
    const waLinks = document.getElementById('whatsapp-links');
    
    let text = `السلام علیکم! مجھے ناول کی قسط نمبر ${num} (پیکیج ${pkgId}) خریدنی ہے۔`;
    let encodedText = encodeURIComponent(text);

    msg.innerText = `قسط ${num} لاک ہے۔ اسے کھولنے کے لیے واٹس ایپ پر رابطہ کریں۔`;
    waLinks.innerHTML = `
        <a href="https://wa.me/923159226260?text=${encodedText}" class="whatsapp-btn" target="_blank">رابطہ بذریعہ واٹس ایپ</a>
        <br><button onclick="showCodeModal()" style="margin-top:10px; cursor:pointer;">کوڈ موجود ہے؟ یہاں کلک کریں</button>
    `;
    modal.classList.add('active');
}

function verifyCode() {
    const input = document.getElementById('code-input').value.trim().toUpperCase();
    const expected = `YHD${currentPurchase.num}MS${currentPurchase.pkgId}`.toUpperCase();
    
    if (input === expected) {
        purchasedEpisodes.push('pkg_' + currentPurchase.pkgId);
        localStorage.setItem('purchased_episodes', JSON.stringify(purchasedEpisodes));
        alert('کوڈ درست ہے!');
        location.reload();
    } else {
        alert('غلط کوڈ! براہ کرم درست کوڈ درج کریں۔');
    }
}

async function openFile(num) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDERS.novel}'+in+parents&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const file = data.files.find(f => f.name.includes(num.toString()));
        if (file) window.open(`https://drive.google.com/uc?id=${file.id}&export=view`, '_blank');
        else alert('فائل ابھی اپ لوڈ نہیں ہوئی');
    } catch (e) { alert('کنکشن کا مسئلہ'); }
}

function closePaymentModal() { document.getElementById('payment-modal').classList.remove('active'); }
function showCodeModal() { closePaymentModal(); document.getElementById('code-modal').classList.add('active'); }
function closeCodeModal() { document.getElementById('code-modal').classList.remove('active'); }
