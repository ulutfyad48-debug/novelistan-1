const FOLDERS = {
    novel: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';

window.onload = loadEpisodes;

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
        const div = document.createElement('div');
        div.className = 'item-box';
        div.innerText = `قسط ${i}`;
        div.onclick = () => openDriveFile(i, FOLDERS.novel);
        container.appendChild(div);
    }
}

async function openDriveFile(name, folderId) {
    // about:blank سے بچنے کے لیے ہم پہلے لنک چیک کر رہے ہیں
    const query = encodeURIComponent(`'${folderId}' in parents and name contains '${name}' and trashed=false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${API_KEY}&fields=files(id,webViewLink)`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.files && data.files.length > 0) {
            // یہ لنک موبائل ایپ کو براہ راست ٹرگر کرتا ہے
            window.location.href = data.files[0].webViewLink;
        } else {
            alert("فائل نہیں ملی۔");
        }
    } catch (e) {
        alert("انٹرنیٹ چیک کریں۔");
    }
}
