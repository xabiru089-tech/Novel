// State Aplikasi
let novels = JSON.parse(localStorage.getItem('my_novels')) || [];
let currentNovelId = null;
let currentChapterIndex = null;
let readerFontSize = 16;

// DOM Elements
const views = {
    dashboard: document.getElementById('view-dashboard'),
    detail: document.getElementById('view-novel-detail'),
    reader: document.getElementById('view-reader')
};

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    setupEventListeners();
});

// Sistem Navigasi Tampilan
function switchView(viewName) {
    Object.keys(views).forEach(key => {
        views[key].classList.remove('active');
    });
    views[viewName].classList.add('active');
}

// Render Dashboard
function renderDashboard() {
    const grid = document.getElementById('novel-grid');
    const emptyState = document.getElementById('empty-state');
    grid.innerHTML = '';

    if (novels.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        novels.forEach(novel => {
            const card = document.createElement('div');
            card.className = 'novel-card';
            card.onclick = () => openNovelDetail(novel.id);
            card.innerHTML = `
                <img src="${novel.cover || 'https://via.placeholder.com/150x200?text=No+Cover'}" alt="Cover">
                <div class="novel-card-body">
                    <div class="novel-card-title">${novel.title}</div>
                    <div class="novel-card-author">${novel.author}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// Buka Detail Novel
function openNovelDetail(id) {
    currentNovelId = id;
    const novel = novels.find(n => n.id === id);
    if (!novel) return;

    document.getElementById('detail-title').innerText = novel.title;
    document.getElementById('detail-author').innerText = novel.author;
    document.getElementById('detail-genre').innerText = novel.genre || '-';
    document.getElementById('detail-cover').src = novel.cover || 'https://via.placeholder.com/150x200?text=No+Cover';

    renderChapterList(novel);
    switchView('detail');
}

// Render Daftar Bab
function renderChapterList(novel) {
    const list = document.getElementById('chapter-list');
    list.innerHTML = '';

    if (!novel.chapters || novel.chapters.length === 0) {
        list.innerHTML = '<li style="padding: 12px; color: #94a3b8;">Belum ada bab. Tambahkan bab pertama!</li>';
    } else {
        novel.chapters.forEach((ch, index) => {
            const li = document.createElement('li');
            li.className = 'chapter-item';
            li.innerHTML = `<span>${ch.title}</span> <span>></span>`;
            li.onclick = () => openReader(index);
            list.appendChild(li);
        });
    }
}

// Buka Mode Baca (Reader)
function openReader(index) {
    currentChapterIndex = index;
    const novel = novels.find(n => n.id === currentNovelId);
    const chapter = novel.chapters[index];

    document.getElementById('reader-chapter-title').innerText = chapter.title;
    
    // PENANGANAN TEKS & SPASI OTOMATIS (1 Spasi)
    const textContainer = document.getElementById('reader-text-container');
    textContainer.innerHTML = '';

    const paragraphs = chapter.content.split('\n');
    paragraphs.forEach(pText => {
        if (pText.trim() !== '') {
            const p = document.createElement('p');
            p.innerText = pText.trim();
            textContainer.appendChild(p);
        }
    });

    switchView('reader');
}

// Event Listeners
function setupEventListeners() {
    // Tombol Buka Modal
    document.getElementById('btn-open-add-modal').onclick = () => document.getElementById('modal-add-novel').style.display = 'flex';
    document.querySelectorAll('.btn-add-trigger').forEach(b => b.onclick = () => document.getElementById('modal-add-novel').style.display = 'flex');
    document.getElementById('btn-open-add-chapter').onclick = () => document.getElementById('modal-add-chapter').style.display = 'flex';

    // Close Modals
    document.querySelectorAll('.close-modal').forEach(c => {
        c.onclick = () => {
            document.getElementById('modal-add-novel').style.display = 'none';
            document.getElementById('modal-add-chapter').style.display = 'none';
        }
    });

    // Navigasi Back
    document.getElementById('btn-back-to-dashboard').onclick = () => { renderDashboard(); switchView('dashboard'); };
    document.getElementById('btn-back-to-detail').onclick = () => switchView('detail');

    // Form Tambah Novel + FileReader
    document.getElementById('form-add-novel').onsubmit = function(e) {
        e.preventDefault();
        const title = document.getElementById('novel-title').value;
        const author = document.getElementById('novel-author').value;
        const genre = document.getElementById('novel-genre').value;
        const coverFile = document.getElementById('novel-cover').files[0];

        const save = (coverBase64) => {
            const newNovel = {
                id: Date.now(),
                title, author, genre,
                cover: coverBase64,
                chapters: []
            };
            novels.push(newNovel);
            localStorage.setItem('my_novels', JSON.stringify(novels));
            document.getElementById('modal-add-novel').style.display = 'none';
            this.reset();
            renderDashboard();
        };

        if (coverFile) {
            const reader = new FileReader();
            reader.onload = (e) => save(e.target.result);
            reader.readAsDataURL(coverFile);
        } else {
            save('');
        }
    };

    // Form Tambah Bab
    document.getElementById('form-add-chapter').onsubmit = function(e) {
        e.preventDefault();
        const title = document.getElementById('chapter-title').value;
        const content = document.getElementById('chapter-content').value;

        const novel = novels.find(n => n.id === currentNovelId);
        novel.chapters.push({ title, content });
        localStorage.setItem('my_novels', JSON.stringify(novels));

        document.getElementById('modal-add-chapter').style.display = 'none';
        this.reset();
        renderChapterList(novel);
    };

    // Pengatur Font Reader
    document.getElementById('btn-font-add').onclick = () => {
        readerFontSize += 2;
        document.getElementById('reader-text-container').style.fontSize = readerFontSize + 'px';
        document.getElementById('font-size-label').innerText = readerFontSize + 'px';
    };
    document.getElementById('btn-font-sub').onclick = () => {
        if (readerFontSize > 12) {
            readerFontSize -= 2;
            document.getElementById('reader-text-container').style.fontSize = readerFontSize + 'px';
            document.getElementById('font-size-label').innerText = readerFontSize + 'px';
        }
    };

    // Pengatur Tema Reader
    const readerBox = document.getElementById('reader-content-box');
    document.getElementById('theme-light').onclick = () => readerBox.className = 'reader-body theme-light';
    document.getElementById('theme-sepia').onclick = () => readerBox.className = 'reader-body theme-sepia';
    document.getElementById('theme-dark').onclick = () => readerBox.className = 'reader-body theme-dark';

    // Hapus Novel
    document.getElementById('btn-delete-novel').onclick = () => {
        if (confirm('Yakin ingin menghapus novel ini?')) {
            novels = novels.filter(n => n.id !== currentNovelId);
            localStorage.setItem('my_novels', JSON.stringify(novels));
            renderDashboard();
            switchView('dashboard');
        }
    };
}
