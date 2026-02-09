// Initialize Firebase
let db;
// Hardcoded password for simplicity (Client-side usage)
// In a real secure app this should be server-side, but for this use case it's fine.
const APP_PASSWORD = "belfu"; 

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (!window.firebaseConfig || window.firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
            throw new Error("Firebase config missing");
        }
        firebase.initializeApp(window.firebaseConfig);
        db = firebase.firestore();

        // Check LocalStorage Session
        const isAuth = localStorage.getItem('belfu_auth');
        if (isAuth === 'true') {
            showApp();
        } else {
            showLogin();
        }
        
        // Init Particles
        if(typeof tsParticles !== 'undefined') {
            tsParticles.load("tsparticles", {
                particles: {
                    number: { value: 30, density: { enable: true, value_area: 800 } },
                    color: { value: "#ff3366" },
                    shape: { type: "heart" }, 
                    opacity: { value: 0.5, random: true },
                    size: { value: 10, random: true },
                    move: { enable: true, speed: 2, direction: "top", out_mode: "out" }
                },
                interactivity: {
                    events: { onhover: { enable: true, mode: "repulse" } }
                }
            });
        }

    } catch (e) {
        console.error("Firebase Init Error:", e);
        showLogin();
        document.querySelector('.login-card p').innerText = "Lütfen firebase-config.js dosyasını düzenleyin.";
        document.querySelector('.login-card p').style.color = "red";
    }

    setupEventListeners();
});

// Navigation
const pages = ['countdown', 'gallery', 'letters', 'bucketlist', 'watchlist'];

function setupEventListeners() {
    // Login
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password-input');

    function performLogin() {
        const input = passwordInput.value.trim().toLowerCase();
        const err = document.getElementById('auth-error');
        
        // Define valid users and their passwords
        const users = {
            'mert': 'Mert',
            'ezgi': 'Ezgi'
        };

        if (users[input]) {
            const userName = users[input];
            localStorage.setItem('belfu_auth', 'true');
            localStorage.setItem('belfu_user', userName); // Save who logged in
            showApp();
            err.innerText = "";
        } else {
            err.innerText = "Hatalı şifre. Sadece Mert veya Ezgi girebilir.";
            // Add shake animation
            const card = document.querySelector('.login-card');
            card.style.animation = 'shake 0.4s ease-in-out';
            setTimeout(() => card.style.animation = '', 400);
        }
    }

    loginBtn.addEventListener('click', performLogin);

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performLogin();
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('belfu_auth');
        window.location.reload();
    });

    // Tabs
    document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.target;
            switchPage(target);
        });
    });
    
    // File Input Name Logic
    document.getElementById('photo-upload').addEventListener('change', function() {
        const fileName = this.files[0] ? this.files[0].name : '';
        document.getElementById('file-name').textContent = fileName;
    });

    // Feature: Countdown
    document.getElementById('toggle-date-btn').addEventListener('click', () => {
        const area = document.getElementById('date-input-area');
        if (area.style.display === 'none') {
            area.style.display = 'flex';
            area.classList.add('animate__animated', 'animate__fadeIn');
        } else {
            area.style.display = 'none';
        }
    });

    document.getElementById('set-date-btn').addEventListener('click', () => {
         saveDate();
         document.getElementById('date-input-area').style.display = 'none';
    });

    // Feature: Gallery
    document.getElementById('upload-photo-btn').addEventListener('click', uploadPhoto);

    // Feature: Letters
    document.getElementById('send-letter-btn').addEventListener('click', sendLetter);

    // Feature: Bucket List
    document.getElementById('add-bucket-btn').addEventListener('click', () => addItem('bucketlist'));
    document.getElementById('bucket-input').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') addItem('bucketlist');
    });

    // Feature: Watchlist
    document.getElementById('add-watch-btn').addEventListener('click', () => addItem('watchlist'));
    document.getElementById('watch-input').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') addItem('watchlist');
    });
}

function showLogin() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    
    // Load initial data
    loadCountdown();
    loadGallery();
    loadLetters();
    loadList('bucketlist', 'bucket-list');
    loadList('watchlist', 'watch-list');
}

function switchPage(pageId) {
    // Active tab
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if(btn.dataset.target === pageId) btn.classList.add('active');
        else if(btn.dataset.target) btn.classList.remove('active');
    });

    // Show section
    document.querySelectorAll('.section-content').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

// --- Features ---

// 1. Countdown
function saveDate() {
    const date = document.getElementById('anniversary-date').value;
    if (!date) return;
    
    db.collection('settings').doc('anniversary').set({ date: date })
        .then(() => loadCountdown());
}

function loadCountdown() {
    db.collection('settings').doc('anniversary').get().then(doc => {
        if (doc.exists) {
            const date = new Date(doc.data().date);
            startTimer(date);
        }
    });
}

function startTimer(targetDate) {
    const display = document.getElementById('countdown-display');
    
    // Clear existing interval if any (global var hack for simple script)
    if(window.timerInterval) clearInterval(window.timerInterval);

    window.timerInterval = setInterval(() => {
        // Get current time in Istanbul timezone
        const nowIstanbul = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Istanbul"}));
        const diff = Math.abs(nowIstanbul - targetDate); // Use absolute difference to avoid negatives
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        display.innerHTML = `
            <div class="time-unit"><span class="number">${days}</span><span class="label">Gün</span></div>
            <div class="time-unit"><span class="number">${hours}</span><span class="label">Saat</span></div>
            <div class="time-unit"><span class="number">${minutes}</span><span class="label">Dakika</span></div>
            <div class="time-unit"><span class="number">${seconds}</span><span class="label">Saniye</span></div>
        `;
    }, 1000);
}

// 2. Gallery (Base64)
async function uploadPhoto() {
    const file = document.getElementById('photo-upload').files[0];
    if (!file) return;

    // Compress and Convert to Base64
    try {
        const base64 = await compressImage(file);
        
        db.collection('gallery').add({
            image: base64,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            document.getElementById('photo-upload').value = '';
        }).catch(err => {
            console.error("Upload error:", err);
            Swal.fire({
                icon: 'error',
                title: 'Hata',
                text: 'Fotoğraf yüklenemedi. Boyut sınırı aşılmış olabilir.',
                confirmButtonColor: '#ff3366'
            });
        });

    } catch (e) {
        console.error("Compression error:", e);
        Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Görüntü işleme hatası.',
            confirmButtonColor: '#ff3366'
        });
    }
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const MAX_WIDTH = 800; // Limit width to reduce size
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress to JPEG with 0.7 quality
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
        };
        reader.onerror = (error) => reject(error);
    });
}

function loadGallery() {
    db.collection('gallery').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `<img src="${data.image}" loading="lazy">`;
            
            // Click to enlarge (Lightbox)
            div.onclick = () => {
                Swal.fire({
                    imageUrl: data.image,
                    imageAlt: 'Anı',
                    showConfirmButton: false,
                    showCloseButton: true,
                    showDenyButton: true,
                    denyButtonText: '<i class="fas fa-trash"></i> Bu fotoğrafı sil',
                    denyButtonColor: 'transparent',
                    background: 'transparent',
                    backdrop: `rgba(0,0,0,0.8)`,
                    customClass: {
                        image: 'swal-image-limit',
                        actions: 'swal-actions-transparent', // We might need to style this or just rely on inline styles if possible for the button text color
                        denyButton: 'btn-delete-lightbox' // Custom class for styling
                    },
                    // Remove footer
                }).then((result) => {
                    if (result.isDenied) {
                        deleteItem('gallery', doc.id);
                    }
                });
            };
            
            grid.appendChild(div);
        });
    });
}

// 3. Letters
function sendLetter() {
    const content = document.getElementById('letter-content').value;
    if (!content.trim()) return;

    db.collection('letters').add({
        content: content,
        author: localStorage.getItem('belfu_user') || "Anonim", 
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById('letter-content').value = '';
    });
}

function loadLetters() {
    const grid = document.getElementById('letters-grid');
    db.collection('letters').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        grid.innerHTML = '';
        const currentUser = localStorage.getItem('belfu_user');

        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = 'letter-card animate__animated animate__zoomIn';
            // Random rotation for natural feel
            div.style.setProperty('--rotation', (Math.random() * 6 - 3) + 'deg');
            div.style.transform = `rotate(${(Math.random() * 6 - 3)}deg)`;
            
            let deleteBtnHTML = '';
            if (data.author === currentUser) {
                // IMPORTANT: stopPropagation to prevent closing when deleting
                deleteBtnHTML = `<button class="letter-delete-btn" onclick="event.stopPropagation(); deleteItem('letters', '${doc.id}')"><i class="fas fa-trash"></i></button>`;
            }

            const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : '';

            div.innerHTML = `
                <div class="letter-content">
                    <p>"${data.content}"</p>
                </div>
                <small>Gönderen: ${data.author}</small>
                ${deleteBtnHTML}
            `;

            // Click to toggle open/close
            div.onclick = function() {
                // If it's already open, close it (or maybe keep it open? User said "açılma efekti", usually implies toggle)
                // Let's toggle.
                this.classList.toggle('open');
            };

            grid.appendChild(div);
        });
    });
}

// 4. Listeners (Bucket & Watch)
function addItem(collection) {
    const inputId = collection === 'bucketlist' ? 'bucket-input' : 'watch-input';
    let val = document.getElementById(inputId).value.trim();
    if (!val) return;

    // specific request: "ilk harf her zaman büyük olsun"
    val = val.charAt(0).toUpperCase() + val.slice(1);

    db.collection(collection).add({
        text: val,
        completed: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById(inputId).value = '';
    });
}

function loadList(collection, elementId) {
    const list = document.getElementById(elementId);
    db.collection(collection).orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        list.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = `list-item animate__animated animate__zoomIn ${data.completed ? 'completed' : ''}`;
            
            div.innerHTML = `
                <div class="item-content-wrapper" onclick="toggleComplete('${collection}', '${doc.id}', ${!data.completed})">
                    <div class="checkbox-completed">
                        <i class="fas fa-check"></i>
                    </div>
                    <span>${data.text}</span>
                </div>
                <button class="delete-btn" onclick="deleteItem('${collection}', '${doc.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            list.appendChild(div);
        });
    });
}

window.toggleComplete = (collection, id, status) => {
    db.collection(collection).doc(id).update({ completed: status });
};

window.deleteItem = (collection, id) => {
    Swal.fire({
        title: 'Silmek istediğine emin misin?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff3366',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Evet, sil!',
        cancelButtonText: 'İptal'
    }).then((result) => {
        if (result.isConfirmed) {
            db.collection(collection).doc(id).delete();
            Swal.fire({
                title: 'Silindi!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
};
