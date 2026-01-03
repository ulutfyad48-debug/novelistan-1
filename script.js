// Google Drive Folder IDs
const FOLDERS = {
    novel: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    codewords: '1n8MuNqMaOe6eAntLDf-zTHXaNji3NEkn',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

// Google Drive API Key (آپ کو یہ Google Cloud Console سے لینا ہوگا)
const API_KEY = 'YOUR_GOOGLE_DRIVE_API_KEY_HERE';

// Store purchased episodes
let purchasedEpisodes = [];

// Load purchased episodes from localStorage
function loadPurchasedEpisodes() {
    const stored = localStorage.getItem('purchased_episodes');
    if (stored) {
        purchasedEpisodes = JSON.parse(stored);
    }
}

// Save purchased episodes to localStorage
function savePurchasedEpisodes() {
    localStorage.setItem('purchased_episodes', JSON.stringify(purchasedEpisodes));
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadPurchasedEpisodes();
    loadEpisodes();
});

// Show specific section
function showSection(section) {
    document.getElementById('home-screen').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(section + '-section').classList.add('active');

    // Load content based on section
    if (section === 'novels') {
        loadEpisodes();
    } else if (section === 'poetry') {
        loadPoetry();
    } else if (section === 'codewords') {
        loadCodewords();
    } else if (section === 'about') {
        loadAbout();
    }
}

// Show home screen
function showHome() {
    document.getElementById('home-screen').style.display = 'block';
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
}

// Load Novel Episodes (1-100)
function loadEpisodes() {
    const container = document.getElementById('episodes-container');
    container.innerHTML = '';

    // Create 100 episode cards
    for (let i = 1; i <= 100; i++) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        
        let status = '';
        let label = '';
        let clickHandler = '';

        // Determine episode status
        if (i <= 10) {
            // First 10 episodes are FREE
            card.classList.add('free');
            status = 'free';
            label = 'مفت';
            clickHandler = `onclick="openEpisode(${i}, 'free')"`;
        } else if (i <= 80) {
            // Episodes 11-80 (paid in packages of 5)
            const packageNum = Math.ceil((i - 10) / 5);
            const price = i <= 50 ? 50 : 100;
            
            if (purchasedEpisodes.includes(`package_${packageNum}`)) {
                card.classList.add('free');
                status = 'purchased';
                label = 'خریدا ہوا';
                clickHandler = `onclick="openEpisode(${i}, 'purchased')"`;
            } else {
                card.classList.add('paid');
                status = 'paid';
                label = `${price} روپے`;
                clickHandler = `onclick="showPaymentModal(${i}, ${price}, ${packageNum})"`;
            }
        } else {
            // Last 20 episodes (81-100)
            if (purchasedEpisodes.includes('final_package')) {
                card.classList.add('free');
                status = 'purchased';
                label = 'خریدا ہوا';
                clickHandler = `onclick="openEpisode(${i}, 'purchased')"`;
            } else {
                card.classList.add('paid');
                status = 'paid';
                label = '300 روپے';
                clickHandler = `onclick="showPaymentModal(${i}, 300, 'final')"`;
            }
        }

        card.setAttribute('onclick', clickHandler.replace('onclick="', '').replace('"', ''));
        
        card.innerHTML = `
            <div class="episode-number">قسط ${i}</div>
            <div class="episode-label">${label}</div>
        `;

        container.appendChild(card);
    }
}

// Open Episode (for free or purchased episodes)
async function openEpisode(episodeNum, type) {
    // Try to fetch the file from Google Drive
    const fileUrl = await getEpisodeFileUrl(episodeNum);
    
    if (fileUrl) {
        window.open(fileUrl, '_blank');
    } else {
        alert(`قسط ${episodeNum} ابھی دستیاب نہیں ہے۔ براہ کرم بعد میں کوشش کریں۔`);
    }
}

// Get Episode File URL from Google Drive
async function getEpisodeFileUrl(episodeNum) {
    try {
        // Google Drive API call to list files
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDERS.novel}'+in+parents&key=${API_KEY}&fields=files(id,name,webViewLink)`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.files) {
            // Find file matching episode number (e.g., "1.pdf", "Episode 1.pdf", etc.)
            const episodeFile = data.files.find(file => {
                const fileName = file.name.toLowerCase();
                return fileName.includes(episodeNum.toString()) || 
                       fileName.includes(`episode ${episodeNum}`) ||
                       fileName.includes(`قسط ${episodeNum}`);
            });

            if (episodeFile) {
                return episodeFile.webViewLink || `https://drive.google.com/file/d/${episodeFile.id}/view`;
            }
        }
    } catch (error) {
        console.error('Error fetching episode:', error);
    }
    return null;
}

// Show Payment Modal
let currentPurchase = null;

function showPaymentModal(episodeNum, price, packageId) {
    currentPurchase = { episodeNum, price, packageId };
    
    const modal = document.getElementById('payment-modal');
    const message = document.getElementById('payment-message');
    
    let messageText = '';
    
    if (episodeNum <= 50) {
        const startEp = ((packageId - 1) * 5) + 11;
        const endEp = startEp + 4;
        messageText = `اقساط ${startEp} سے ${endEp} تک: ${price} روپے`;
    } else if (episodeNum <= 80) {
        const startEp = ((packageId - 1) * 5) + 11;
        const endEp = startEp + 4;
        messageText = `اقساط ${startEp} سے ${endEp} تک: ${price} روپے`;
    } else {
        messageText = `آخری 20 اقساط (81-100): ${price} روپے`;
    }
    
    message.textContent = messageText;
    modal.classList.add('active');
}

// Close Payment Modal
function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
    // Show code entry modal
    setTimeout(() => {
        showCodeModal();
    }, 500);
}

// Show Code Entry Modal
function showCodeModal() {
    document.getElementById('code-modal').classList.add('active');
    document.getElementById('code-input').value = '';
    document.getElementById('code-input').focus();
}

// Close Code Modal
function closeCodeModal() {
    document.getElementById('code-modal').classList.remove('active');
}

// Verify Code
function verifyCode() {
    const input = document.getElementById('code-input').value.trim().toUpperCase();
    const { episodeNum, packageId } = currentPurchase;
    
    // Generate expected code based on your formula
    const expectedCode = generateExpectedCode(episodeNum, packageId);
    
    if (input === expectedCode) {
        // Save purchased package
        if (packageId === 'final') {
            purchasedEpisodes.push('final_package');
        } else {
            purchasedEpisodes.push(`package_${packageId}`);
        }
        savePurchasedEpisodes();
        
        closeCodeModal();
        loadEpisodes(); // Reload episodes to show purchased ones
        
        alert('✅ کوڈ درست ہے! اب آپ یہ اقساط پڑھ سکتے ہیں۔');
    } else {
        alert('❌ غلط کوڈ! براہ کرم دوبارہ کوشش کریں یا واٹس ایپ پر رابطہ کریں۔');
    }
}

// Generate Expected Code (YHD formula)
function generateExpectedCode(episodeNum, packageId) {
    // Your code formula: YHD{episode}MS{package}
    if (packageId === 'final') {
        return `YHD${episodeNum}MSFINAL`;
    } else {
        return `YHD${episodeNum}MS${packageId}`;
    }
}

// Load Poetry from Google Drive
async function loadPoetry() {
    const container = document.getElementById('poetry-container');
    container.innerHTML = '<div class="loading">شاعری لوڈ ہو رہی ہے...</div>';
    
    try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDERS.poetry}'+in+parents&key=${API_KEY}&fields=files(id,name,webViewLink,mimeType)`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            container.innerHTML = '';
            
            data.files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'content-item';
                item.onclick = () => window.open(file.webViewLink, '_blank');
                
                item.innerHTML = `
                    <h3>📝 ${file.name}</h3>
                    <p>کلک کریں پڑھنے کے لیے</p>
                `;
                
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<div class="loading">ابھی کوئی شاعری دستیاب نہیں ہے</div>';
        }
    } catch (error) {
        console.error('Error loading poetry:', error);
        container.innerHTML = '<div class="loading">شاعری لوڈ کرنے میں مسئلہ ہوا</div>';
    }
}

// Load Codewords from Google Drive
async function loadCodewords() {
    const container = document.getElementById('codewords-container');
    container.innerHTML = '<div class="loading">کوڈ ورڈز لوڈ ہو رہے ہیں...</div>';
    
    try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDERS.codewords}'+in+parents&key=${API_KEY}&fields=files(id,name,webViewLink,mimeType)`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            container.innerHTML = '';
            
            data.files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'content-item';
                item.onclick = () => window.open(file.webViewLink, '_blank');
                
                item.innerHTML = `
                    <h3>🔐 ${file.name}</h3>
                    <p>کلک کریں پڑھنے کے لیے</p>
                `;
                
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<div class="loading">ابھی کوئی کوڈ ورڈز دستیاب نہیں ہیں</div>';
        }
    } catch (error) {
        console.error('Error loading codewords:', error);
        container.innerHTML = '<div class="loading">کوڈ ورڈز لوڈ کرنے میں مسئلہ ہوا</div>';
    }
}

// Load About from Google Drive
async function loadAbout() {
    const container = document.getElementById('about-container');
    container.innerHTML = '<div class="loading">معلومات لوڈ ہو رہی ہیں...</div>';
    
    try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDERS.about}'+in+parents&key=${API_KEY}&fields=files(id,name,webViewLink,mimeType)`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            container.innerHTML = '';
            
            data.files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'content-item';
                item.onclick = () => window.open(file.webViewLink, '_blank');
                
                item.innerHTML = `
                    <h3>📄 ${file.name}</h3>
                    <p>کلک کریں پڑھنے کے لیے</p>
                `;
                
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<div class="loading">ابھی کوئی معلومات دستیاب نہیں ہیں</div>';
        }
    } catch (error) {
        console.error('Error loading about:', error);
        container.innerHTML = '<div class="loading">معلومات لوڈ کرنے میں مسئلہ ہوا</div>';
    }
}