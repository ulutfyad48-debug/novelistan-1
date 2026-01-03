const FOLDERS = {
    novels: "1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu",
    poetry: "1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h"
};

// یہ فنکشن ڈرائیو سے فائلیں چیک کرے گا (تصوراتی طور پر)
function loadEpisodes() {
    const container = document.getElementById('episodes-container');
    for (let i = 1; i <= 100; i++) {
        let btn = document.createElement('button');
        // یہاں آپ کی شرط: 1-10 فری، پھر پیڈ
        let isFree = i <= 10;
        
        // یہاں ہم 'Inactive' دکھا رہے ہیں جب تک آپ ڈرائیو میں فائل نہ ڈالیں
        btn.className = `ep-btn inactive`; 
        btn.innerText = i;
        
        // مثال کے طور پر اگر قسط اپلوڈ ہے (یہاں آپ اپنی ڈرائیو کی فائل چیکنگ لاجک لگا سکتے ہیں)
        btn.className = isFree ? `ep-btn active-free` : `ep-btn active-paid`;
        
        btn.onclick = () => handleAction(i, isFree);
        container.appendChild(btn);
    }
}

function handleAction(num, free) {
    if (free) {
        window.open(`https://drive.google.com/drive/folders/${FOLDERS.novels}`, '_blank');
    } else {
        document.getElementById('lockModal').style.display = 'block';
        // واٹس ایپ میسج آٹو جنریٹ
        document.getElementById('wa1').href = `https://wa.me/923159226260?text=Novelistan Episode ${num} code please.`;
    }
}

function showTab(id) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

window.onload = loadEpisodes;
