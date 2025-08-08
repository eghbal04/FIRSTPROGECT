// news.js - سیستم اخبار زنده و به‌روزرسانی شونده با منابع معتبر
let newsData = [];
let currentCategory = 'all';
let currentPage = 1;
let isLoading = false;
let autoRefreshInterval = null;
let lastUpdateTime = null;

// تنظیمات API های خبری معتبر و به‌روز
const NEWS_APIS = {
    // اخبار ارزهای دیجیتال از CoinGecko (رایگان و معتبر)
    crypto: {
        name: 'CoinGecko',
        url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&locale=en',
        transform: async (data) => {
            const cryptoNews = [];
            for (const coin of data.slice(0, 10)) {
                const priceChange = coin.price_change_percentage_24h;
                const trend = priceChange > 0 ? '📈' : '📉';
                const status = priceChange > 0 ? 'افزایش' : 'کاهش';
                
                cryptoNews.push({
                    id: `crypto-${coin.id}`,
                    title: `${trend} قیمت ${coin.name} (${coin.symbol.toUpperCase()})`,
                    content: `قیمت فعلی ${coin.name}: $${coin.current_price.toLocaleString()} | تغییر 24 ساعته: ${priceChange.toFixed(2)}% ${status}`,
                    url: `https://www.coingecko.com/en/coins/${coin.id}`,
                    image: coin.image,
            category: 'crypto',
                    date: new Date(),
                    source: 'CoinGecko',
                    tags: [coin.symbol.toUpperCase(), 'کریپتو', 'قیمت'],
                    price: coin.current_price,
                    change24h: priceChange
                });
            }
            return cryptoNews;
        }
    },
    
    // اخبار اقتصادی از Alpha Vantage (رایگان)
    economy: {
        name: 'Alpha Vantage',
        url: 'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy&apikey=demo',
        transform: (data) => {
            if (!data.feed) return [];
            return data.feed.slice(0, 10).map(item => ({
                id: `economy-${item.url}`,
            title: item.title,
                content: item.summary,
            url: item.url,
                image: 'https://via.placeholder.com/300x200/232946/00ccff?text=Economy',
                category: 'economy',
                date: new Date(item.time_published),
            source: item.source,
                tags: ['اقتصاد', 'بازار', 'مالی']
            }));
        }
    },
    
    // اخبار فارکس از Exchange Rate API
    forex: {
        name: 'Exchange Rate API',
        url: 'https://api.exchangerate-api.com/v4/latest/USD',
        transform: (data) => {
            const forexNews = [];
            const majorPairs = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
            
            majorPairs.forEach(currency => {
                const rate = data.rates[currency];
                if (rate) {
                    forexNews.push({
                        id: `forex-${currency}`,
                        title: `💱 نرخ ارز USD/${currency}`,
                        content: `نرخ تبدیل دلار آمریکا به ${currency}: ${rate.toFixed(4)} | آخرین به‌روزرسانی: ${new Date().toLocaleString('fa-IR')}`,
                        url: 'https://exchangerate-api.com',
                        image: 'https://via.placeholder.com/300x200/232946/00ff88?text=Forex',
            category: 'forex',
                        date: new Date(),
                        source: 'Exchange Rate API',
                        tags: ['فارکس', 'USD', currency, 'نرخ ارز'],
                        rate: rate
                    });
                }
            });
            return forexNews;
        }
    }
};

// اخبار محلی پلتفرم LevelUp (واقعی و مفید)
const localNews = [
    {
        id: 'platform-3',
        title: '💱 نحوه خرید و فروش توکن LVL',
        content: 'آموزش کامل نحوه سواپ توکن LVL با MATIC و مدیریت موجودی کیف پول. شامل محاسبه کارمزدها و بهترین زمان‌ها برای معامله.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/00ccff?text=Token+Swap',
        category: 'trading',
        date: new Date('2025-01-13'),
        source: 'LevelUp Team',
        tags: ['خرید', 'فروش', 'سواپ', 'LVL']
    }
];

// دریافت اخبار ارزهای دیجیتال از CoinGecko
async function fetchCryptoNews() {
    try {
        const response = await fetch(NEWS_APIS.crypto.url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        return await NEWS_APIS.crypto.transform(data);
    } catch (error) {
        console.error('خطا در دریافت اخبار ارزهای دیجیتال:', error);
        return [];
    }
}

// دریافت اخبار اقتصادی
async function fetchEconomyNews() {
    try {
        const response = await fetch(NEWS_APIS.economy.url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        return NEWS_APIS.economy.transform(data);
    } catch (error) {
        console.error('خطا در دریافت اخبار اقتصادی:', error);
        return [];
    }
}

// دریافت اخبار فارکس
async function fetchForexNews() {
    try {
        const response = await fetch(NEWS_APIS.forex.url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        return NEWS_APIS.forex.transform(data);
    } catch (error) {
        console.error('خطا در دریافت اخبار فارکس:', error);
        return [];
    }
}

// تابع اصلی بارگذاری اخبار
async function loadNews() {
    try {
        isLoading = true;
        updateNewsStatus('در حال بارگذاری اخبار...', 'loading');
        
        // ترکیب اخبار محلی و خارجی
        let allNews = [...localNews];
        
        // دریافت اخبار ارزهای دیجیتال
        try {
            const cryptoNews = await fetchCryptoNews();
            if (cryptoNews && cryptoNews.length > 0) {
            allNews = [...cryptoNews, ...allNews];
            }
        } catch (error) {
            console.log('خطا در دریافت اخبار ارزهای دیجیتال:', error);
        }
        
        // دریافت اخبار اقتصادی
        try {
            const economyNews = await fetchEconomyNews();
            if (economyNews && economyNews.length > 0) {
                allNews = [...economyNews, ...allNews];
            }
        } catch (error) {
            console.log('خطا در دریافت اخبار اقتصادی:', error);
        }
        
        // دریافت اخبار فارکس
        try {
            const forexNews = await fetchForexNews();
            if (forexNews && forexNews.length > 0) {
                allNews = [...forexNews, ...allNews];
            }
        } catch (error) {
            console.log('خطا در دریافت اخبار فارکس:', error);
        }
        
        // مرتب‌سازی بر اساس تاریخ
        allNews.sort((a, b) => b.date - a.date);
        
        newsData = allNews;
        displayNews();
        setupAutoRefresh();
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('خطا در بارگذاری اخبار:', error);
        updateNewsStatus('خطا در بارگذاری اخبار', 'error');
    } finally {
        isLoading = false;
    }
}

// نمایش اخبار
function displayNews() {
    const container = document.getElementById('news-container');
    if (!container) return;
    
    // فیلتر کردن اخبار بر اساس دسته‌بندی
    let filteredNews = newsData;
    if (currentCategory !== 'all') {
        filteredNews = newsData.filter(news => news.category === currentCategory);
    }
    
    // محدود کردن تعداد اخبار نمایش داده شده
    const newsPerPage = 12;
    const startIndex = (currentPage - 1) * newsPerPage;
    const endIndex = startIndex + newsPerPage;
    const displayNews = filteredNews.slice(startIndex, endIndex);
    
    // ایجاد HTML اخبار
    const newsHTML = displayNews.map(news => createNewsCard(news)).join('');
    
    // نمایش اخبار
    if (currentPage === 1) {
        container.innerHTML = newsHTML;
    } else {
        container.insertAdjacentHTML('beforeend', newsHTML);
    }
    
    // نمایش/مخفی کردن دکمه "بارگذاری بیشتر"
    const loadMoreBtn = document.getElementById('load-more-news-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = endIndex < filteredNews.length ? 'block' : 'none';
    }
    
    updateNewsStatus(`${filteredNews.length} خبر یافت شد`, 'success');
}

// ایجاد کارت خبر
function createNewsCard(news) {
    const isLocal = news.id.startsWith('platform-');
    const categoryEmoji = getCategoryEmoji(news.category);
    const timeAgo = getTimeAgo(news.date);
    
    // اضافه کردن کلاس مخصوص برای اخبار قیمت
    const isPriceNews = news.category === 'crypto' && news.price;
    const priceClass = isPriceNews ? 'price-news' : '';
    const changeClass = isPriceNews && news.change24h ? (news.change24h > 0 ? 'positive-change' : 'negative-change') : '';
    
    return `
        <div class="news-card ${isLocal ? 'local-news' : 'external-news'} ${priceClass} ${changeClass}" data-category="${news.category}" data-id="${news.id}">
            <div class="news-card-header">
                <div class="news-card-image">
                    <img src="${news.image || 'https://via.placeholder.com/300x200/232946/a786ff?text=News'}" 
                         alt="${news.title}" 
                         onerror="this.src='https://via.placeholder.com/300x200/232946/a786ff?text=News'">
                </div>
                <div class="news-card-category">
                    <span class="category-badge">${categoryEmoji} ${getCategoryName(news.category)}</span>
                </div>
                ${isPriceNews && news.price ? `
                    <div class="price-info">
                        <span class="price-value">$${news.price.toLocaleString()}</span>
                        ${news.change24h ? `<span class="price-change ${news.change24h > 0 ? 'positive' : 'negative'}">${news.change24h > 0 ? '+' : ''}${news.change24h.toFixed(2)}%</span>` : ''}
                    </div>
                ` : ''}
            </div>
            
            <div class="news-card-body">
                <h3 class="news-card-title">${news.title}</h3>
                <p class="news-card-content">${news.content.substring(0, 120)}${news.content.length > 120 ? '...' : ''}</p>
                
                <div class="news-card-meta">
                    <span class="news-source">📰 ${news.source}</span>
                    <span class="news-time">🕒 ${timeAgo}</span>
                </div>
                
                ${news.tags.length > 0 ? `
                    <div class="news-tags">
                        ${news.tags.map(tag => `<span class="news-tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="news-card-footer">
                <button class="news-read-btn" onclick="openNewsModal('${news.id}')">
                    📖 خواندن کامل
                </button>
                ${!isLocal ? `
                    <a href="${news.url}" target="_blank" class="news-external-btn">
                        🌐 منبع اصلی
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// تنظیم به‌روزرسانی خودکار
function setupAutoRefresh() {
    // پاک کردن interval قبلی
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // تنظیم به‌روزرسانی هر 5 دقیقه برای اخبار قیمت
    /* // News auto refresh غیرفعال شده
    autoRefreshInterval = setInterval(async () => {
        try {
            // بررسی اینکه آیا صفحه فعال است
            if (document.hidden) {
                return; // اگر صفحه مخفی است، به‌روزرسانی نکن
            }
            console.log('به‌روزرسانی خودکار اخبار...');
            await loadNews();
        } catch (error) {
            console.error('خطا در به‌روزرسانی خودکار:', error);
        }
    }, 5 * 60 * 1000); // غیرفعال شده - سیستم مرکزی جایگزین شده
    */
    console.log('⚠️ News auto refresh غیرفعال شده برای بهینه‌سازی عملکرد');
}

// فیلتر کردن اخبار
function filterNews(category) {
    currentCategory = category;
    currentPage = 1;
    displayNews();
    updateActiveFilter(category);
}

// جستجو در اخبار
function searchNews(query) {
    if (!query.trim()) {
        displayNews();
        return;
    }
    
    const container = document.getElementById('news-container');
    if (!container) return;
    
    const filteredNews = newsData.filter(news => 
        news.title.toLowerCase().includes(query.toLowerCase()) ||
        news.content.toLowerCase().includes(query.toLowerCase()) ||
        news.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    const newsHTML = filteredNews.map(news => createNewsCard(news)).join('');
    container.innerHTML = newsHTML;
    
    updateNewsStatus(`${filteredNews.length} نتیجه برای "${query}" یافت شد`, 'success');
}

// بارگذاری اخبار بیشتر
function loadMoreNews() {
    currentPage++;
    displayNews();
}

// باز کردن مودال خبر
function openNewsModal(newsId) {
    const news = newsData.find(n => n.id === newsId);
    if (!news) return;
    
    const modal = document.getElementById('news-modal');
    const title = document.getElementById('news-modal-title');
    const content = document.getElementById('news-modal-content');
    const category = document.getElementById('news-modal-category');
    const date = document.getElementById('news-modal-date');
    const author = document.getElementById('news-modal-author');
    const tags = document.getElementById('news-modal-tags');
    
    if (title) title.textContent = news.title;
    if (content) content.innerHTML = news.content;
    if (category) category.textContent = getCategoryName(news.category);
    if (date) date.textContent = formatDate(news.date);
    if (author) author.textContent = news.source;
    if (tags) {
        tags.innerHTML = news.tags.map(tag => `<span class="news-tag">#${tag}</span>`).join('');
    }
    
    if (modal) modal.style.display = 'flex';
}

// بستن مودال خبر
function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    if (modal) modal.style.display = 'none';
}

// تابع‌های کمکی
function getCategoryEmoji(category) {
    const emojis = {
        'crypto': '₿',
        'forex': '💱',
        'economy': '📊',
        'events': '🎉',
        'general': '📰',
        'nft': '🎨',
        'airdrop': '🎁'
    };
    return emojis[category] || '📰';
}

function getCategoryName(category) {
    const names = {
        'crypto': 'ارزهای دیجیتال',
        'forex': 'فارکس',
        'economy': 'اقتصاد',
        'events': 'رویدادها',
        'general': 'عمومی',
        'nft': 'NFT',
        'airdrop': 'ایردراپ'
    };
    return names[category] || 'عمومی';
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'همین الان';
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    if (days < 7) return `${days} روز پیش`;
    return formatDate(date);
}

function formatDate(date) {
    // اگر ورودی رشته یا عدد بود، تبدیل به Date کن
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateNewsStatus(message, type = 'info') {
    const statusElement = document.getElementById('newsStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `news-status ${type}`;
    }
}

function updateActiveFilter(category) {
    const buttons = document.querySelectorAll('.news-filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}

function updateLastUpdateTime() {
    lastUpdateTime = new Date();
    const timeElement = document.querySelector('.last-update-time');
    if (timeElement) {
        timeElement.textContent = `آخرین به‌روزرسانی: ${formatDate(lastUpdateTime)}`;
    }
}

// راه‌اندازی رویدادها
document.addEventListener('DOMContentLoaded', () => {
    // بارگذاری اولیه اخبار
    loadNews();
    
    // رویدادهای فیلترها
    const filterButtons = document.querySelectorAll('.news-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterNews(btn.dataset.category);
        });
    });
    
    // رویداد جستجو
    const searchInput = document.getElementById('news-search-input');
    const searchBtn = document.getElementById('news-search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchNews(e.target.value);
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput ? searchInput.value : '';
            searchNews(query);
        });
    }
    
    // رویداد بارگذاری بیشتر
    const loadMoreBtn = document.getElementById('load-more-news-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreNews);
    }
    
    // رویدادهای مودال
    const modalClose = document.getElementById('news-modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeNewsModal);
    }
    
    const modal = document.getElementById('news-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeNewsModal();
            }
        });
    }
    
    // دکمه به‌روزرسانی دستی
    const refreshBtn = document.createElement('button');
    refreshBtn.innerHTML = '🔄 به‌روزرسانی';
    refreshBtn.className = 'control-btn';
    refreshBtn.style.marginLeft = '1rem';
    refreshBtn.onclick = loadNews;
    
    const filtersContainer = document.querySelector('.news-filters');
    if (filtersContainer) {
        filtersContainer.appendChild(refreshBtn);
    }
    
    // نمایش زمان آخرین به‌روزرسانی
    const lastUpdateDiv = document.createElement('div');
    lastUpdateDiv.className = 'last-update-time';
    lastUpdateDiv.style.textAlign = 'center';
    lastUpdateDiv.style.color = '#888';
    lastUpdateDiv.style.fontSize = '0.9rem';
    lastUpdateDiv.style.marginTop = '1rem';
    
    const newsContainer = document.getElementById('news-container');
    if (newsContainer && newsContainer.parentNode) {
        newsContainer.parentNode.insertBefore(lastUpdateDiv, newsContainer.nextSibling);
    }
});

// پاک کردن interval در زمان خروج از صفحه
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // پاک کردن interval درخت شبکه
    if (window.clearNetworkTreeInterval) {
        window.clearNetworkTreeInterval();
    }
    
    console.log('News intervals cleared on page unload');
});

// Export functions for global use
window.loadNews = loadNews;
window.filterNews = filterNews;
window.searchNews = searchNews;
window.openNewsModal = openNewsModal;
window.closeNewsModal = closeNewsModal;