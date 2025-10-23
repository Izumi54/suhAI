// Weather Search Module
// Modul ini mengelola input pencarian kota: saran (suggestions), riwayat, enter/click, dan navigasi keyboard
// Ia akan memanggil weatherBackend.performSearch(city) yang sudah ada di suhAI-backend.js

(function() {
    // Elemen DOM yang digunakan (desktop + mobile)
    const desktop = {
        input: document.getElementById('weatherSearch'),
        btn: document.getElementById('searchBtn'),
        suggestionsWrap: document.getElementById('searchSuggestions'),
        suggestionsList: document.getElementById('suggestionsList')
    };

    const mobile = {
        input: document.getElementById('mobileWeatherSearch'),
        btn: document.getElementById('mobileSearchBtn')
    };

    // Daftar kota contoh untuk auto-suggest (fallback selain history)
    const staticCities = ['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Yogyakarta', 'Jepara', 'Denpasar', 'Medan', 'Makassar', 'Balikpapan'];

    // State internal modul
    let currentSuggestions = [];
    let highlightedIndex = -1; // untuk navigasi panah
    let debounceTimer = null;

    // Debounce helper agar input tidak memicu render terlalu sering
    function debounce(fn, delay) {
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // Ambil riwayat dari localStorage
    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]');
        } catch (_) {
            return [];
        }
    }

    // Buat daftar saran berdasarkan query + history + staticCities
    function buildSuggestions(query) {
        const q = (query || '').trim().toLowerCase();
        const history = getHistory();

        // Gabungkan history + static, hilangkan duplikat, filter by query
        const merged = Array.from(new Set([...history, ...staticCities]));
        const filtered = q
            ? merged.filter(c => c.toLowerCase().includes(q))
            : history.length ? history : staticCities.slice(0, 5);

        return filtered.slice(0, 8); // batasi 8 item
    }

    // Render dropdown suggestions (desktop saja; mobile cukup tombol search/enter)
    function renderSuggestions(items) {
        if (!desktop.suggestionsWrap || !desktop.suggestionsList) return;

        desktop.suggestionsList.innerHTML = '';
        if (!items || items.length === 0) {
            desktop.suggestionsWrap.classList.add('hidden');
            return;
        }

        items.forEach((city, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-white hover:bg-opacity-60 rounded transition-colors';
            item.textContent = city;
            item.dataset.index = String(index);
            item.addEventListener('mouseenter', () => highlight(index));
            item.addEventListener('mouseleave', () => highlight(-1));
            item.addEventListener('click', () => commitSearch(city));
            desktop.suggestionsList.appendChild(item);
        });

        highlightedIndex = -1;
        desktop.suggestionsWrap.classList.remove('hidden');
    }

    // Highlight item by index
    function highlight(index) {
        highlightedIndex = index;
        if (!desktop.suggestionsList) return;
        const children = desktop.suggestionsList.querySelectorAll('button');
        children.forEach((el, i) => {
            el.classList.toggle('bg-white', i === highlightedIndex);
            el.classList.toggle('bg-opacity-60', i === highlightedIndex);
        });
    }

    // Commit pencarian (panggil backend)
    function commitSearch(city) {
        const value = (city || '').trim();
        if (!value) return;
        try {
            if (window.weatherBackend && typeof window.weatherBackend.performSearch === 'function') {
                window.weatherBackend.performSearch(value);
            } else {
                console.warn('weatherBackend belum siap. Pastikan suhAI-backend.js sudah dimuat.');
            }
        } finally {
            hideSuggestions();
        }
    }

    function hideSuggestions() {
        if (desktop.suggestionsWrap) desktop.suggestionsWrap.classList.add('hidden');
    }

    // Event: perubahan input (desktop)
    const onDesktopInput = debounce(() => {
        if (!desktop.input) return;
        const q = desktop.input.value;
        currentSuggestions = buildSuggestions(q);
        renderSuggestions(currentSuggestions);
    }, 120);

    // Event: keydown untuk navigasi keyboard (desktop)
    function onDesktopKeyDown(e) {
        if (!currentSuggestions.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = (highlightedIndex + 1) % currentSuggestions.length;
            highlight(next);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = (highlightedIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
            highlight(prev);
        } else if (e.key === 'Enter') {
            if (highlightedIndex >= 0) {
                commitSearch(currentSuggestions[highlightedIndex]);
            } else {
                commitSearch(desktop.input.value);
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    }

    // Event: klik di luar menutup suggestions
    function onDocumentClick(e) {
        const wrap = desktop.suggestionsWrap;
        const input = desktop.input;
        if (!wrap || !input) return;
        const target = e.target;
        if (target !== wrap && target !== input && !wrap.contains(target)) {
            hideSuggestions();
        }
    }

    // Pasang event listeners jika elemen ada
    if (desktop.input) {
        desktop.input.addEventListener('input', onDesktopInput);
        desktop.input.addEventListener('focus', onDesktopInput);
        desktop.input.addEventListener('keydown', onDesktopKeyDown);
    }
    if (desktop.btn && desktop.input) {
        desktop.btn.addEventListener('click', () => commitSearch(desktop.input.value));
    }

    if (mobile.input && mobile.btn) {
        mobile.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') commitSearch(mobile.input.value);
        });
        mobile.btn.addEventListener('click', () => commitSearch(mobile.input.value));
    }

    document.addEventListener('click', onDocumentClick);
})();

 