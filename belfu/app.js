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
const pages = ['countdown', 'gallery', 'letters', 'bucketlist', 'watchlist', 'travelmap'];

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
        if (this.files.length > 1) {
            document.getElementById('file-name').textContent = `${this.files.length} görsel seçildi`;
        } else {
            const fileName = this.files[0] ? this.files[0].name : '';
            document.getElementById('file-name').textContent = fileName;
        }
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
    initTravelMap();
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
    const fileInput = document.getElementById('photo-upload');
    const files = fileInput.files;
    if (!files || files.length === 0) return;

    const btn = document.getElementById('upload-photo-btn');
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yükleniyor...';
    btn.disabled = true;

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const base64 = await compressImage(file);
            
            await db.collection('gallery').add({
                image: base64,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        fileInput.value = '';
        document.getElementById('file-name').textContent = '';
        
        Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: files.length > 1 ? `${files.length} fotoğraf başarıyla yüklendi.` : 'Fotoğraf başarıyla yüklendi.',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (err) {
        console.error("Upload error:", err);
        Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Yükleme sırasında bir hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonColor: '#ff3366'
        });
    } finally {
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    }
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const MAX_DIMENSION = 600; // Limit dimensions to reduce size (helps mobile, avoids 1MB limit)
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_DIMENSION) {
                    height *= MAX_DIMENSION / width;
                    width = MAX_DIMENSION;
                }
            } else {
                if (height > MAX_DIMENSION) {
                    width *= MAX_DIMENSION / height;
                    height = MAX_DIMENSION;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressed = canvas.toDataURL('image/jpeg', 0.6); // Lower quality to avoid payload limits
            URL.revokeObjectURL(objectUrl);
            resolve(compressed);
        };
        
        img.onerror = (error) => {
            URL.revokeObjectURL(objectUrl);
            reject(error);
        };
        
        img.src = objectUrl;
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

// --- Secret Area Logic ---
let secretKey = null;

function initSecretArea() {
    // Secret Button Trigger
    const btn = document.getElementById('secret-btn');
    if(btn) {
        btn.addEventListener('click', async () => {
            const { value: password } = await Swal.fire({
                title: '❤️🔥 Gizli Alan',
                input: 'password',
                inputLabel: 'Şifreni gir',
                inputPlaceholder: 'Şifre...',
                confirmButtonText: 'Giriş',
                background: '#000',
                color: '#ff0000',
                confirmButtonColor: '#ff0000',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocorrect: 'off'
                },
                customClass: {
                    input: 'swal-secret-input' 
                }
            });

            if (password) {
                verifySecretPassword(password);
            }
        });
    }
}

async function verifySecretPassword(password) {
    const secretRef = db.collection('settings').doc('secret_access');
    const doc = await secretRef.get();

    if (!doc.exists) {
        // First time setup
        await Swal.fire({
            title: 'Yeni Şifre Belirle',
            text: 'Bu şifre gizli alan için kullanılacak. Unutma!',
            icon: 'info',
            confirmButtonColor: '#ff0000',
            background: '#000',
            color: '#fff'
        });
        // We hash it for storage comparison, but we need the PLAIN password for encryption key.
        // Simple hash for storage auth check:
        const hash = CryptoJS.SHA256(password).toString();
        await secretRef.set({ hash: hash });
        
        secretKey = password;
        openSecretArea();
    } else {
        const storedHash = doc.data().hash;
        const inputHash = CryptoJS.SHA256(password).toString();

        if (storedHash === inputHash) {
            // Unlocked!
            sessionStorage.setItem('secret_key', password); // Temporary session key
            
            // Redirect with animation delay if we want, but page transition handles it.
            window.location.href = 'secret.html';
        } else {
            Swal.fire({
                title: 'Hatalı Şifre!',
                icon: 'error',
                confirmButtonColor: '#ff0000',
                background: '#000',
                color: '#fff'
            });
        }
    }
}

// Legacy functions removed as we moved to secret.html
// But keep them if we revert? No, clean up.
// Actually, I'll comment them out or remove them to avoid clutter. 
// User wants separate page.


// Initialize listener right away since app.js is loaded at end of body
document.addEventListener('DOMContentLoaded', () => {
    initSecretArea();
});

// --- Travel Map Feature ---
let visitedCitiesMap = {}; // local cache

async function initTravelMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer || mapContainer.querySelector('svg')) return; // Zaten yüklüyse çık

    try {
        // Fetch SVG
        const response = await fetch('turkey-map.svg');
        const svgContent = await response.text();
        mapContainer.innerHTML = svgContent;

        setupMapInteractions();
        loadVisitedCities();
    } catch (error) {
        console.error('Harita yüklenemedi:', error);
        mapContainer.innerHTML = '<p style="text-align:center; color:red;">Harita yüklenirken bir hata oluştu.</p>';
    }
}

function setupMapInteractions() {
    const tooltip = document.getElementById('city-tooltip');
    
    // Yalnızca ID'si olan tanımlı şehir gruplarına event ekle, ana kapsayıcıya ekleme.
    document.querySelectorAll('#svg-turkey g.turkey g[id]').forEach(cityGroup => {
        const cityId = cityGroup.id;
        const cityName = cityGroup.getAttribute('data-city-name');
        
        // Mouse events for Tooltip
        cityGroup.addEventListener('mouseenter', (e) => {
            e.stopPropagation(); // Event'in parent gruplara geçmesini engelle
            tooltip.innerHTML = cityName;
            if (visitedCitiesMap[cityId]) {
                const date = new Date(visitedCitiesMap[cityId].visitDate).toLocaleDateString('tr-TR');
                tooltip.innerHTML += `<br><span class="tooltip-date" style="font-size:0.8rem; opacity:0.8">${date}</span>`;
            }
            tooltip.classList.remove('hidden');
        });
        
        cityGroup.addEventListener('mousemove', (e) => {
            e.stopPropagation();
            // Sabit pozisyonlama kullanarak ekran üzerindeki kesin lokasyona koyuyoruz
            tooltip.style.position = 'fixed';
            tooltip.style.left = e.clientX + 'px';
            tooltip.style.top = e.clientY + 'px';
        });
        
        cityGroup.addEventListener('mouseleave', (e) => {
            e.stopPropagation();
            tooltip.classList.add('hidden');
        });

        // Click Event
        cityGroup.addEventListener('click', (e) => {
            e.stopPropagation(); // En önemli kısım: Tıklamanın ana harita grubuna geçip sahte kayıt açmasını engeller
            if (visitedCitiesMap[cityId]) {
                showVisitedCityPopup(cityId, cityName, visitedCitiesMap[cityId]);
            } else {
                showCityPopup(cityId, cityName);
            }
        });
    });
}

function loadVisitedCities() {
    db.collection('visited_cities').onSnapshot(snapshot => {
        visitedCitiesMap = {};
        let count = 0;
        
        // Reset all cities visually
        document.querySelectorAll('#svg-turkey g').forEach(g => {
            g.classList.remove('visited');
        });

        snapshot.forEach(doc => {
            const data = doc.data();
            visitedCitiesMap[data.cityId] = { id: doc.id, ...data };
            
            // Mark visually
            const cityGroup = document.getElementById(data.cityId);
            if (cityGroup) {
                cityGroup.classList.add('visited');
            }
            count++;
        });
        
        updateTravelStats(count);
    });
}

function updateTravelStats(count) {
    document.getElementById('visited-count').innerText = count;
    const progress = (count / 81) * 100;
    document.getElementById('visited-progress').style.width = `${progress}%`;
}

async function showCityPopup(cityId, cityName) {
    const { value: formValues } = await Swal.fire({
        title: `❤️ ${cityName}`,
        html: `
            <p style="margin-bottom: 20px; font-size: 0.9rem; color: #555;">Bu güzel şehre ne zaman gittik?</p>
            <input type="date" id="swal-input-date" class="swal2-input" required>
            <div class="swal-file-grid" style="display:flex; flex-direction:column; gap:15px; margin-top:20px;">
                <div style="text-align:left;">
                    <p style="margin-bottom: 5px; font-size: 0.8rem; color: #555; font-weight:bold;">Mert'in Anısı:</p>
                    <input type="file" id="swal-file-mert" class="custom-swal-file" accept="image/*" style="font-size:0.8rem; width:100%; cursor: pointer; position: relative; z-index: 1000;" onclick="event.stopPropagation();" ontouchstart="event.stopPropagation();">
                </div>
                <div style="text-align:left;">
                    <p style="margin-bottom: 5px; font-size: 0.8rem; color: #555; font-weight:bold;">Ezgi'nin Anısı:</p>
                    <input type="file" id="swal-file-ezgi" class="custom-swal-file" accept="image/*" style="font-size:0.8rem; width:100%; cursor: pointer; position: relative; z-index: 1000;" onclick="event.stopPropagation();" ontouchstart="event.stopPropagation();">
                </div>
            </div>
            <p style="font-size:0.75rem; color:#888; margin-top:15px; margin-bottom:0;">* Fotoğraflar zorunlu değildir, sonradan da ekleyebilirsiniz.</p>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Kaydet',
        cancelButtonText: 'İptal',
        confirmButtonColor: '#ff4757',
        preConfirm: () => {
            const date = document.getElementById('swal-input-date').value;
            const fileMert = document.getElementById('swal-file-mert').files[0];
            const fileEzgi = document.getElementById('swal-file-ezgi').files[0];
            
            if (!date) {
                Swal.showValidationMessage('Lütfen en azından ziyaret tarihini seçin!');
                return false;
            }
            return { date: date, fileMert: fileMert, fileEzgi: fileEzgi };
        }
    });

    if (formValues) {
        Swal.fire({
            title: 'Yükleniyor...',
            text: 'Anı haritaya işleniyor',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const compressedMert = formValues.fileMert ? await compressImage(formValues.fileMert) : null;
            const compressedEzgi = formValues.fileEzgi ? await compressImage(formValues.fileEzgi) : null;
            
            await db.collection('visited_cities').add({
                cityId: cityId,
                cityName: cityName,
                visitDate: formValues.date,
                photoMert: compressedMert,
                photoEzgi: compressedEzgi,
                author: localStorage.getItem('belfu_user') || 'Anonim',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            Swal.fire({
                icon: 'success',
                title: 'Başarılı',
                text: `${cityName} haritaya eklendi!`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Şehir eklenirken hata:", err);
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Şehir kaydedilemedi.',
            });
        }
    }
}

function showVisitedCityPopup(cityId, cityName, data) {
    const formattedDate = new Date(data.visitDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const actualMertPhoto = data.photoMert || data.photo;
    
    // HTML Generators for Photos
    const mertHTML = actualMertPhoto 
        ? `<div style="flex:1;"><img src="${actualMertPhoto}" style="width:100%; border-radius:8px; object-fit:cover; aspect-ratio:1; border:2px solid #ddd; box-shadow:0 4px 6px rgba(0,0,0,0.1);"><p style="font-size:0.8rem; margin:5px 0 0 0; color:#555;">Mert</p></div>`
        : `<div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px dashed #ff4757; border-radius:8px; aspect-ratio:1; padding:10px; background:rgba(255, 71, 87, 0.05);">
             <p style="font-size:0.7rem; color:#ff4757; margin-bottom:8px; font-weight:500;">Mert Eksik 😢</p>
             <label style="background:#ff4757; color:white; border:none; padding:6px 12px; border-radius:6px; font-size:0.75rem; cursor:pointer; box-shadow:0 2px 4px rgba(255,71,87,0.3); transition:all 0.2s;">
                 Ekle
                 <input type="file" accept="image/*" style="display:none;" onchange="handleDirectUpload('${data.id}', 'photoMert', this)">
             </label>
           </div>`;
           
    const ezgiHTML = data.photoEzgi 
        ? `<div style="flex:1;"><img src="${data.photoEzgi}" style="width:100%; border-radius:8px; object-fit:cover; aspect-ratio:1; border:2px solid #ddd; box-shadow:0 4px 6px rgba(0,0,0,0.1);"><p style="font-size:0.8rem; margin:5px 0 0 0; color:#555;">Ezgi</p></div>`
        : `<div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px dashed #70a1ff; border-radius:8px; aspect-ratio:1; padding:10px; background:rgba(112, 161, 255, 0.05);">
             <p style="font-size:0.7rem; color:#70a1ff; margin-bottom:8px; font-weight:500;">Ezgi Eksik 😢</p>
             <label style="background:#70a1ff; color:white; border:none; padding:6px 12px; border-radius:6px; font-size:0.75rem; cursor:pointer; box-shadow:0 2px 4px rgba(112,161,255,0.3); transition:all 0.2s;">
                 Ekle
                 <input type="file" accept="image/*" style="display:none;" onchange="handleDirectUpload('${data.id}', 'photoEzgi', this)">
             </label>
           </div>`;

    Swal.fire({
        title: cityName,
        html: `
            <p style="color: #ff4757; font-weight: 500; margin-bottom: 2px;">${formattedDate}</p>
            <p style="font-size: 0.8rem; color: #888; margin-bottom: 20px;">Ekleyen: ${data.author}</p>
            <div style="display:flex; gap:15px;">
                ${mertHTML}
                ${ezgiHTML}
            </div>
        `,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Kapat',
        showDenyButton: true,
        denyButtonText: '<i class="fas fa-trash"></i> Sil',
        denyButtonColor: '#ff7675'
    }).then((result) => {
        if (result.isDenied) {
            Swal.fire({
                title: 'Emin misin?',
                text: `${cityName} haritadan silinecek.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ff7675',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Evet, sil!',
                cancelButtonText: 'İptal'
            }).then((delResult) => {
                if (delResult.isConfirmed) {
                    db.collection('visited_cities').doc(data.id).delete();
                    Swal.fire('Silindi!', '', 'success');
                }
            });
        }
    });
}

// Add missing photo later directly without extra popup
window.handleDirectUpload = async function(docId, fieldName, inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    Swal.fire({
        title: 'Yükleniyor...',
        text: 'Fotoğrafınız işleniyor',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
    });

    try {
        const compressed = await compressImage(file);
        await db.collection('visited_cities').doc(docId).update({
            [fieldName]: compressed
        });
        Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Fotoğraf eklendi!',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            // Re-open the popup so the user sees the updated photo instantly
            const cityData = Object.values(visitedCitiesMap).find(c => c.id === docId);
            if (cityData) {
                showVisitedCityPopup(cityData.cityId, cityData.cityName, cityData);
            }
        });
    } catch (err) {
        console.error(err);
        Swal.fire('Hata', 'Fotoğraf yüklenemedi. Boyut çok büyük olabilir.', 'error');
    }
};
