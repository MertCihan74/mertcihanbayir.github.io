// Initialize Firebase
firebase.initializeApp(window.firebaseConfig);
const db = firebase.firestore();

// CSV Linki üzerinden dinamik kullanıcı listesi çekme
async function fetchAllowedUsers() {
    try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Y6MQ0DS2HUNcvqVp1j5tU9el9_jXromwc-lgRNmz86koWuzep732xjHWUPGQs69FmM6nk3OyhLm7/pub?gid=1456877523&single=true&output=csv');
        const csvText = await response.text();
        
        const lines = csvText.split('\n');
        const users = [];
        
        // İlk satır başlıklar olduğu için 1'den başlıyoruz
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // CSV: Ad Soyad, E-posta (Güvenli yeni format, sadece 2 sütun)
            const parts = line.split(',');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const email = parts[1].trim();
                
                if (name && email) {
                    let cleanEmail = email.toLowerCase().replace(/\s+/g, '');
                    // .con hatasını düzeltme
                    if (cleanEmail.endsWith('.con')) {
                        cleanEmail = cleanEmail.slice(0, -1) + 'm';
                    }
                    users.push({ name, email: cleanEmail });
                }
            }
        }
        return users;
    } catch (e) {
        console.error("CSV fetch error:", e);
        return null;
    }
}

// Metin formatlama (Büyük/Küçük harf duyarlılığını kaldırmak için)
const normalizeString = (str) => {
    return str.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');
};

// 54 Koltuk oluşturma
const totalSeats = 54;
const layout = document.getElementById('bus-layout');

function renderSeats() {
    layout.innerHTML = '';
    let seatNum = 1;
    let colNum = 1;
    
    // 54 koltuk, orta kapı boşluğu ile birlikte çizilecek
    while (seatNum <= totalSeats) {
        const column = document.createElement('div');
        column.className = 'bus-column';
        
        // Üst ikili koltuk grubu (Kapı tarafı - Sağ taraf)
        const topGroup = document.createElement('div');
        topGroup.className = 'seat-group';
        
        // Alt ikili koltuk grubu (Şoför arkası - Sol taraf)
        const bottomGroup = document.createElement('div');
        bottomGroup.className = 'seat-group';

        if (colNum === 8) {
            // 8. Kolon: Sağ tarafta (üstte) orta kapı var
            const door = document.createElement('div');
            door.className = 'middle-door';
            door.innerText = 'ORTA KAPI';
            topGroup.appendChild(door);
            
            // Sol tarafta (altta) koltuklar devam eder (29, 30)
            if(seatNum + 1 <= totalSeats) bottomGroup.appendChild(createSeat(seatNum + 1));
            if(seatNum <= totalSeats) bottomGroup.appendChild(createSeat(seatNum));
            seatNum += 2;
        } else {
            // Normal 4'lü kolon
            if(seatNum + 3 <= totalSeats) topGroup.appendChild(createSeat(seatNum + 3));
            if(seatNum + 2 <= totalSeats) topGroup.appendChild(createSeat(seatNum + 2));
            
            if(seatNum + 1 <= totalSeats) bottomGroup.appendChild(createSeat(seatNum + 1));
            if(seatNum <= totalSeats) bottomGroup.appendChild(createSeat(seatNum));
            seatNum += 4;
        }
        
        // Koridor boşluğu
        const corridor = document.createElement('div');
        corridor.className = 'corridor';
        
        column.appendChild(topGroup);
        column.appendChild(corridor);
        column.appendChild(bottomGroup);
        
        layout.appendChild(column);
        colNum++;
    }
}

function createSeat(num) {
    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.id = 'seat-' + num;
    seat.innerText = num;
    
    seat.addEventListener('click', () => handleSeatClick(num, seat));
    return seat;
}

async function handleSeatClick(seatNum, seatEl) {
    // Koltuğun anlık durumunu Firestore'dan kontrol et (başkası tıklamış olabilir)
    const seatRef = db.collection('seats').doc(seatNum.toString());
    const doc = await seatRef.get();
    
    if (doc.exists) {
        const data = doc.data();
        if (data.status === 'taken') {
            const { value: cancelEmail } = await Swal.fire({
                title: `${seatNum} Numaralı Koltuk`,
                html: `Bu koltuk <b>${data.name}</b> tarafından rezerve edilmiş.<br><br><span style="font-size:0.9rem;color:#777;">İptal etmek için kayıtlı e-postanızı giriniz:</span>`,
                input: 'email',
                inputPlaceholder: 'E-posta adresiniz',
                showCancelButton: true,
                confirmButtonText: 'İptal Et',
                cancelButtonText: 'Kapat',
                confirmButtonColor: '#e74c3c'
            });

            if (cancelEmail) {
                if (cancelEmail.trim().toLowerCase() === data.email) {
                    await seatRef.delete();
                    Swal.fire('İptal Edildi', 'Koltuk rezervasyonunuz başarıyla iptal edildi.', 'success');
                } else {
                    Swal.fire('Hata', 'Girdiğiniz e-posta adresi bu koltuğun sahibiyle eşleşmiyor!', 'error');
                }
            }
            return;
        }
        if (data.status === 'pending') {
            const now = new Date();
            const pendingTime = data.timestamp ? data.timestamp.toDate() : now;
            // 2 dakikadan kısaysa işlem sürüyor demektir
            if (now - pendingTime < 2 * 60 * 1000) {
                Swal.fire('İşlemde', 'Bu koltuk şu anda başkası tarafından rezerve ediliyor.', 'warning');
                return;
            }
        }
    }

    // Cinsiyet seçimi
    const { value: gender } = await Swal.fire({
        title: `${seatNum} Numaralı Koltuk`,
        html: `
            <p style="margin-bottom: 10px; color: #555;">Lütfen cinsiyet seçiniz:</p>
            <div class="swal2-radio-container">
                <label class="gender-option">
                    <input type="radio" name="gender" value="female" id="gender-female">
                    <div class="gender-box female"><i class="fas fa-venus"></i></div>
                    <span style="font-weight: bold; margin-top: 5px;">Kadın</span>
                </label>
                <label class="gender-option">
                    <input type="radio" name="gender" value="male" id="gender-male">
                    <div class="gender-box male"><i class="fas fa-mars"></i></div>
                    <span style="font-weight: bold; margin-top: 5px;">Erkek</span>
                </label>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'İlerle',
        cancelButtonText: 'İptal',
        confirmButtonColor: '#2c3e50',
        cancelButtonColor: '#7f8c8d',
        preConfirm: () => {
            const selected = document.querySelector('input[name="gender"]:checked');
            if (!selected) {
                Swal.showValidationMessage('Lütfen bir cinsiyet seçiniz!');
                return false;
            }
            return selected.value;
        }
    });

    if (gender) {
        // Cinsiyet seçildi, koltuğu "işlemde" (pending) olarak işaretle
        await seatRef.set({
            status: 'pending',
            gender: gender,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Doğrulama ve İsim Soyisim girişi
        const { value: formValues, isDismissed, dismiss } = await Swal.fire({
            title: 'Yolcu Doğrulama',
            html: `
                <p style="font-size: 0.9rem; color: #555; margin-bottom: 15px;">Lütfen tura kayıtlı olduğunuz bilgileri giriniz.<br>
                <span style="color: #e74c3c; font-weight: bold; font-size: 0.85rem;">İşlemi tamamlamak için <span id="swal-timer">120</span> saniyeniz var.</span></p>
                <input id="swal-input-name" class="swal2-input" placeholder="Adınız Soyadınız">
                <input id="swal-input-email" class="swal2-input" type="email" placeholder="Kayıtlı E-posta Adresiniz">
            `,
            timer: 120000,
            timerProgressBar: true,
            didOpen: () => {
                const timerSpan = Swal.getHtmlContainer().querySelector('#swal-timer');
                const timerInterval = setInterval(() => {
                    if (Swal.getTimerLeft() && timerSpan) {
                        timerSpan.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                    }
                }, 1000);
                Swal.getPopup().timerInterval = timerInterval;
            },
            willClose: () => {
                clearInterval(Swal.getPopup().timerInterval);
            },
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Onayla',
            cancelButtonText: 'İptal',
            confirmButtonColor: '#27ae60',
            cancelButtonColor: '#e74c3c',
            allowOutsideClick: false, // İşlemdeyken dışarı tıklamayı engelle
            showLoaderOnConfirm: true, // Listeyi çekerken yükleniyor animasyonu göster
            preConfirm: async () => {
                const name = document.getElementById('swal-input-name').value.trim();
                const email = document.getElementById('swal-input-email').value.trim().toLowerCase();
                
                if (!name || !email) {
                    Swal.showValidationMessage('Lütfen ad soyad ve e-posta alanlarını doldurunuz!');
                    return false;
                }

                // Güncel kayıtları Google E-Tablolar üzerinden anlık çek
                const liveUsers = await fetchAllowedUsers();
                
                if (!liveUsers) {
                    Swal.showValidationMessage('Kayıt listesi alınamadı, internet bağlantınızı kontrol edin.');
                    return false;
                }

                // Doğrulama Kontrolü
                const normInputName = normalizeString(name);
                const normInputEmail = email.toLowerCase().replace(/\s+/g, '');

                const userMatch = liveUsers.find(u => {
                    return normalizeString(u.name) === normInputName && 
                           u.email === normInputEmail;
                });

                if (!userMatch) {
                    Swal.showValidationMessage('Girdiğiniz bilgiler (Ad/Soyad veya E-posta) güncel tur kayıtlarıyla eşleşmedi!');
                    return false;
                }

                // Bu e-posta ile daha önce koltuk alınmış mı kontrol et
                try {
                    const snapshot = await db.collection('seats')
                        .where('email', '==', normInputEmail)
                        .get();
                        
                    const takenDoc = snapshot.docs.find(d => d.data().status === 'taken');
                    if (takenDoc) {
                        // Zaten bir koltuğu var, değişim işlemi için bilgiyi döndür
                        return { name: userMatch.name, email: normInputEmail, changeFrom: takenDoc.id };
                    }
                } catch(e) {
                    console.error("Firebase email check error", e);
                }
                
                // Başarılı ise, tablodaki orijinal adını kullanalım
                return { name: userMatch.name, email: normInputEmail };
            }
        });

        if (isDismissed || !formValues) {
            // İşlem iptal edildiyse veya kapatıldıysa koltuğu boşa çıkar
            await seatRef.delete();
            
            if (dismiss === Swal.DismissReason.timer) {
                Swal.fire('Süre Doldu', 'Koltuk ayırma süreniz dolduğu için işleminiz iptal edildi. Koltuk tekrar boşa çıkarıldı.', 'info');
            }
        } else {
            // Eğer koltuk değiştirme işlemiyse onay iste
            if (formValues.changeFrom) {
                const confirmChange = await Swal.fire({
                    title: 'Koltuk Değişikliği',
                    html: `Sizin adınıza zaten <b>${formValues.changeFrom}</b> numaralı koltuk rezerve edilmiş.<br><br>Eski koltuğunuzu iptal edip <b>${seatNum}</b> numaralı koltuğa geçmek istiyor musunuz?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Evet, Değiştir',
                    cancelButtonText: 'Vazgeç',
                    confirmButtonColor: '#3498db'
                });
                
                if (!confirmChange.isConfirmed) {
                    await seatRef.delete(); // Yeni koltuğu boşa çıkar
                    return;
                }
                
                // Eski koltuğu sil
                await db.collection('seats').doc(formValues.changeFrom).delete();
            }

            // İşlem onaylandı, yeni koltuğu "dolu" yap
            Swal.fire({
                title: 'İşleniyor...',
                text: 'Koltuk rezerve ediliyor',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await seatRef.set({
                    status: 'taken',
                    gender: gender,
                    name: formValues.name,
                    email: formValues.email,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                if (formValues.changeFrom) {
                    Swal.fire('Başarılı!', `Koltuk değişikliği yapıldı. Yeni koltuğunuz: ${seatNum}`, 'success');
                } else {
                    Swal.fire('Başarılı!', `${seatNum} numaralı koltuk ${formValues.name} için ayrıldı.`, 'success');
                }
            } catch(e) {
                Swal.fire('Hata', 'Koltuk ayrılırken bir sorun oluştu.', 'error');
                console.error("Firestore error:", e);
                // Hata durumunda da boşa çıkar
                await seatRef.delete();
            }
        }
    }
}

// Veritabanındaki değişiklikleri canlı dinleme
function listenToSeats() {
    db.collection('seats').onSnapshot((snapshot) => {
        // Önce tüm koltukları sıfırla (eğer veritabanından veri silinirse UI da güncellensin diye)
        document.querySelectorAll('.seat').forEach(seat => {
            // Koltuk numarası classını koru, diğerlerini temizle
            seat.className = 'seat';
            seat.removeAttribute('data-name');
        });

        // Gelen veriye göre koltukları işaretle
        snapshot.docs.forEach(doc => {
            const seatNum = doc.id;
            const data = doc.data();
            
            const seatEl = document.getElementById('seat-' + seatNum);
            if(seatEl) {
                if (data.status === 'taken') {
                    seatEl.classList.add('taken');
                    seatEl.classList.add(data.gender); // 'male' or 'female'
                    seatEl.setAttribute('data-name', data.name);
                } else if (data.status === 'pending') {
                    // Zaman aşımı kontrolü (2 dakika)
                    const now = new Date();
                    const pendingTime = data.timestamp ? data.timestamp.toDate() : now;
                    if (now - pendingTime < 2 * 60 * 1000) {
                        seatEl.classList.add('pending');
                    } else {
                        // Zaman aşımına uğramış pending, veritabanından silebiliriz (İsteğe bağlı, burada sadece arayüze eklemiyoruz)
                    }
                }
            }
        });
    }, (error) => {
        console.error("Snapshot error: ", error);
        // İzin hataları vs. olursa sessizce logla
    });
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    renderSeats();
    listenToSeats();
});
