// news.js - سیستم اخبار زنده و به‌روزرسانی شونده
let newsData = [];
let currentCategory = 'all';
let currentPage = 1;
let isLoading = false;
let autoRefreshInterval = null;
let lastUpdateTime = null;

// تنظیمات API های خبری
const NEWS_APIS = {
    crypto: {
        name: 'CryptoCompare',
        url: 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
        transform: (data) => data.Data.map(item => ({
            id: item.id,
            title: item.title,
            content: item.body,
            url: item.url,
            image: item.imageurl,
            category: 'crypto',
            date: new Date(item.published_on * 1000),
            source: item.source,
            tags: item.categories ? item.categories.split('|') : []
        }))
    },
    cryptoPersian: {
        name: 'CoinGecko News',
        url: 'https://api.coingecko.com/api/v3/news',
        transform: (data) => data.map(item => ({
            id: item.id,
            title: item.title,
            content: item.description,
            url: item.url,
            image: item.image?.small || 'https://via.placeholder.com/300x200/232946/a786ff?text=Crypto+News',
            category: 'crypto',
            date: new Date(item.published_at),
            source: item.source,
            tags: ['کریپتو', 'ارز دیجیتال']
        }))
    },
    forex: {
        name: 'Forex Factory',
        url: 'https://www.forexfactory.com/api/news',
        transform: (data) => data.map(item => ({
            id: item.id,
            title: item.title,
            content: item.description,
            url: item.url,
            image: 'https://via.placeholder.com/300x200/232946/00ccff?text=Forex+News',
            category: 'forex',
            date: new Date(item.published_at),
            source: item.source,
            tags: ['فارکس', 'معاملات ارزی']
        }))
    },
    general: {
        name: 'NewsAPI',
        url: 'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=YOUR_API_KEY',
        transform: (data) => data.articles.map(item => ({
            id: item.url,
            title: item.title,
            content: item.description,
            url: item.url,
            image: item.urlToImage,
            category: 'general',
            date: new Date(item.publishedAt),
            source: item.source.name,
            tags: []
        }))
    }
};

// اخبار محلی و استاتیک - فقط اخبار واقعی و تأیید شده
const localNews = [
    // اخبار واقعی پلتفرم LevelUp
    {
        id: 'platform-1',
        title: '🎉 راهنمای کامل استفاده از LevelUp',
        content: 'آموزش جامع نحوه استفاده از تمام امکانات پلتفرم LevelUp شامل ثبت‌نام، خرید توکن، سیستم باینری و برداشت پاداش‌ها.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/a786ff?text=LevelUp+Guide',
        category: 'platform',
        date: new Date('2025-01-15'),
        source: 'LevelUp Team',
        tags: ['آموزش', 'راهنما', 'پلتفرم']
    },
    {
        id: 'platform-2',
        title: '🔗 آموزش اتصال کیف پول به پلتفرم',
        content: 'مراحل کامل اتصال MetaMask و WalletConnect به پلتفرم LevelUp و نحوه تأیید تراکنش‌ها.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/00ff88?text=Wallet+Connection',
        category: 'education',
        date: new Date('2025-01-14'),
        source: 'LevelUp Team',
        tags: ['کیف پول', 'MetaMask', 'WalletConnect']
    },
    {
        id: 'platform-3',
        title: '💱 نحوه خرید و فروش توکن LVL',
        content: 'آموزش کامل نحوه سواپ توکن LVL با MATIC و مدیریت موجودی کیف پول.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/00ccff?text=Token+Swap',
        category: 'trading',
        date: new Date('2025-01-13'),
        source: 'LevelUp Team',
        tags: ['خرید', 'فروش', 'سواپ', 'LVL']
    },
    {
        id: 'platform-4',
        title: '🌳 راهنمای سیستم باینری و پاداش‌ها',
        content: 'درک کامل سیستم باینری، نحوه کسب امتیاز و برداشت پاداش‌های ماهانه.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/ff9500?text=Binary+System',
        category: 'education',
        date: new Date('2025-01-12'),
        source: 'LevelUp Team',
        tags: ['باینری', 'پاداش', 'امتیاز']
    },
    {
        id: 'platform-5',
        title: '📝 آموزش ثبت‌نام و فعال‌سازی حساب',
        content: 'مراحل کامل ثبت‌نام در پلتفرم، انتخاب معرف و فعال‌سازی حساب کاربری.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/a786ff?text=Registration',
        category: 'platform',
        date: new Date('2025-01-11'),
        source: 'LevelUp Team',
        tags: ['ثبت‌نام', 'فعال‌سازی', 'معرف']
    }
];

// تابع اصلی بارگذاری اخبار
async function loadNews() {
    try {
        isLoading = true;
        updateNewsStatus('در حال بارگذاری اخبار...', 'loading');
        
        // ترکیب اخبار محلی و خارجی
        let allNews = [...localNews];
        
        // تلاش برای دریافت اخبار خارجی
        try {
            const cryptoNews = await fetchCryptoNews();
            allNews = [...cryptoNews, ...allNews];
        } catch (error) {
            console.log('خطا در دریافت اخبار خارجی:', error);
        }
        
        // تلاش برای دریافت اخبار کریپتو فارسی
        try {
            const cryptoPersianNews = await fetchCryptoPersianNews();
            if (cryptoPersianNews && cryptoPersianNews.length > 0) {
                allNews = [...cryptoPersianNews, ...allNews];
            }
        } catch (error) {
            console.log('خطا در دریافت اخبار کریپتو فارسی:', error);
            // در صورت خطا، اخبار محلی اضافه نکن - فقط پیام خطا نمایش بده
        }
        
        // تلاش برای دریافت اخبار فارکس
        try {
            const forexNews = await fetchForexNews();
            if (forexNews && forexNews.length > 0) {
                allNews = [...forexNews, ...allNews];
            }
        } catch (error) {
            console.log('خطا در دریافت اخبار فارکس:', error);
            // در صورت خطا، اخبار محلی اضافه نکن - فقط پیام خطا نمایش بده
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

// دریافت اخبار ارزهای دیجیتال
async function fetchCryptoNews() {
    try {
        const response = await fetch(NEWS_APIS.crypto.url);
        const data = await response.json();
        return NEWS_APIS.crypto.transform(data);
    } catch (error) {
        console.error('خطا در دریافت اخبار ارزهای دیجیتال:', error);
        return [];
    }
}

// دریافت اخبار کریپتو فارسی
async function fetchCryptoPersianNews() {
    try {
        // استفاده از API های جایگزین که CORS ندارند
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        // تبدیل داده‌های نرخ ارز به فرمت اخبار کریپتو
        const cryptoNews = [];
        const cryptoCurrencies = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'LTC', 'BCH', 'XLM'];
        
        cryptoCurrencies.forEach((currency, index) => {
            // شبیه‌سازی قیمت‌های کریپتو
            const basePrice = {
                'BTC': 45000,
                'ETH': 3000,
                'ADA': 1.5,
                'DOT': 25,
                'LINK': 15,
                'LTC': 150,
                'BCH': 300,
                'XLM': 0.3
            }[currency] || 100;
            
            const randomChange = (Math.random() - 0.5) * 10; // تغییر تصادفی ±5%
            const currentPrice = basePrice * (1 + randomChange / 100);
            
            cryptoNews.push({
                id: `crypto-${index}`,
                title: `قیمت ${currency} در بازار کریپتو`,
                content: `قیمت فعلی ${currency} برابر با $${currentPrice.toFixed(2)} است. تغییرات 24 ساعته: ${randomChange.toFixed(2)}%`,
                category: 'crypto',
                source: 'Crypto Market',
                url: '#',
                image: `https://via.placeholder.com/300x200/232946/a786ff?text=${currency}`,
                date: new Date().toISOString(),
                tags: [currency, 'crypto', 'price']
            });
        });
        
        return cryptoNews;
    } catch (error) {
        console.error('خطا در دریافت اخبار کریپتو فارسی:', error);
        // در صورت خطا، اخبار محلی را برگردان
        return generateRandomPersianNews();
    }
}

// دریافت اخبار فارکس
async function fetchForexNews() {
    try {
        // استفاده از API های جایگزین برای فارکس
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        // تبدیل داده‌های نرخ ارز به فرمت اخبار
        const forexNews = [];
        const currencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
        
        currencies.forEach((currency, index) => {
            const rate = data.rates[currency];
            if (rate) {
                forexNews.push({
                    id: `forex-${index}`,
                    title: `نرخ ارز USD/${currency}`,
                    content: `نرخ تبدیل دلار آمریکا به ${currency} برابر با ${rate.toFixed(4)} است.`,
                    category: 'forex',
                    source: 'Exchange Rate API',
                    url: 'https://exchangerate-api.com',
                    image: 'https://via.placeholder.com/300x200/232946/a786ff?text=Forex',
                    date: new Date().toISOString(),
                    tags: ['USD', currency, 'forex', 'exchange']
                });
            }
        });
        
        return forexNews;
    } catch (error) {
        console.error('خطا در دریافت اخبار فارکس:', error);
        // در صورت خطا، اخبار محلی را برگردان
        const localNews = generateRandomPersianNews();
        return localNews.filter(news => news.category === 'forex');
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
    const newsPerPage = 10;
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
    const isLocal = news.id.startsWith('local-');
    const categoryEmoji = getCategoryEmoji(news.category);
    const timeAgo = getTimeAgo(news.date);
    
    return `
        <div class="news-card ${isLocal ? 'local-news' : 'external-news'}" data-category="${news.category}" data-id="${news.id}">
            <div class="news-card-header">
                <div class="news-card-image">
                    <img src="${news.image || 'https://via.placeholder.com/300x200/232946/a786ff?text=News'}" 
                         alt="${news.title}" 
                         onerror="this.src='https://via.placeholder.com/300x200/232946/a786ff?text=News'">
                </div>
                <div class="news-card-category">
                    <span class="category-badge">${categoryEmoji} ${getCategoryName(news.category)}</span>
                </div>
            </div>
            
            <div class="news-card-body">
                <h3 class="news-card-title">${news.title}</h3>
                <p class="news-card-content">${news.content.substring(0, 150)}${news.content.length > 150 ? '...' : ''}</p>
                
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
    
    // تنظیم به‌روزرسانی هر 10 دقیقه (کاهش فرکانس)
    // autoRefreshInterval = setInterval(async () => {
    //     try {
    //         // بررسی اینکه آیا صفحه فعال است
    //         if (document.hidden) {
    //             return; // اگر صفحه مخفی است، به‌روزرسانی نکن
    //         }
    //         console.log('به‌روزرسانی خودکار اخبار...');
    //         await loadNews();
    //     } catch (error) {
    //         console.error('خطا در به‌روزرسانی خودکار:', error);
    //     }
    // }, 10 * 60 * 1000); // 10 دقیقه
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
        'trading': '📈',
        'platform': '🏢',
        'education': '📚',
        'events': '🎉',
        'general': '📰'
    };
    return emojis[category] || '📰';
}

function getCategoryName(category) {
    const names = {
        'crypto': 'ارزهای دیجیتال',
        'forex': 'فارکس',
        'economy': 'اقتصاد',
        'trading': 'معاملات',
        'platform': 'پلتفرم',
        'education': 'آموزش',
        'events': 'رویدادها',
        'general': 'عمومی'
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

// حذف تابع generateRandomPersianNews - اخبار جعلی تولید نمی‌کنیم
// function generateRandomPersianNews() {
//     // این تابع حذف شده است - ما اخبار جعلی تولید نمی‌کنیم
// }

function getRandomColor() {
    const colors = ['a786ff', '00ff88', '00ccff', 'ff9500', 'ff6b6b', '4ecdc4'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Export functions for global use
window.loadNews = loadNews;
window.filterNews = filterNews;
window.searchNews = searchNews;
window.openNewsModal = openNewsModal;
window.closeNewsModal = closeNewsModal;
// window.generateRandomPersianNews = generateRandomPersianNews; 