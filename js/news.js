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

// اخبار محلی و استاتیک
const localNews = [
    {
        id: 'local-1',
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
        id: 'local-2',
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
        id: 'local-3',
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
        id: 'local-4',
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
        id: 'local-5',
        title: '📝 آموزش ثبت‌نام و فعال‌سازی حساب',
        content: 'مراحل کامل ثبت‌نام در پلتفرم، انتخاب معرف و فعال‌سازی حساب کاربری.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/a786ff?text=Registration',
        category: 'platform',
        date: new Date('2025-01-11'),
        source: 'LevelUp Team',
        tags: ['ثبت‌نام', 'فعال‌سازی', 'معرف']
    },
    // اخبار کریپتو فارسی
    {
        id: 'crypto-1',
        title: '₿ بیت‌کوین به 50,000 دلار رسید!',
        content: 'بیت‌کوین پس از چندین ماه نوسان، سرانجام به سطح روانی 50,000 دلار رسید. تحلیلگران معتقدند این حرکت می‌تواند آغاز روند صعودی جدیدی باشد.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/ff9500?text=Bitcoin+50K',
        category: 'crypto',
        date: new Date('2025-01-16'),
        source: 'کریپتو نیوز فارسی',
        tags: ['بیت‌کوین', 'BTC', 'قیمت', 'تحلیل']
    },
    {
        id: 'crypto-2',
        title: '🚀 اتریوم 2.0 و تأثیر آن بر بازار',
        content: 'انتقال کامل اتریوم به Proof of Stake و تأثیرات آن بر مصرف انرژی و سرعت تراکنش‌ها. این تغییر می‌تواند آینده ارزهای دیجیتال را متحول کند.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/00ccff?text=Ethereum+2.0',
        category: 'crypto',
        date: new Date('2025-01-15'),
        source: 'بلاکچین ایران',
        tags: ['اتریوم', 'ETH', 'PoS', 'توسعه']
    },
    {
        id: 'crypto-3',
        title: '💎 کاردانو و همکاری جدید با آفریقا',
        content: 'پروژه کاردانو اعلام کرد که قرارداد جدیدی با کشورهای آفریقایی برای توسعه سیستم‌های دیجیتال منعقد کرده است.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/00ff88?text=Cardano+Africa',
        category: 'crypto',
        date: new Date('2025-01-14'),
        source: 'کریپتو پرس',
        tags: ['کاردانو', 'ADA', 'آفریقا', 'همکاری']
    },
    {
        id: 'crypto-4',
        title: '🔥 سولانا و رشد چشمگیر در DeFi',
        content: 'پروتکل‌های DeFi بر روی شبکه سولانا شاهد رشد بی‌سابقه‌ای در حجم معاملات و تعداد کاربران فعال هستند.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/ff6b6b?text=Solana+DeFi',
        category: 'crypto',
        date: new Date('2025-01-13'),
        source: 'دیفای نیوز',
        tags: ['سولانا', 'SOL', 'DeFi', 'معاملات']
    },
    {
        id: 'crypto-5',
        title: '🌙 دوج‌کوین و تأثیر سلبریتی‌ها',
        content: 'توییت جدید ایلان ماسک درباره دوج‌کوین باعث افزایش 20 درصدی قیمت این ارز دیجیتال شد.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/ffd93d?text=Doge+Elon',
        category: 'crypto',
        date: new Date('2025-01-12'),
        source: 'کریپتو وارز',
        tags: ['دوج‌کوین', 'DOGE', 'ایلان ماسک', 'سلبریتی']
    },
    // اخبار فارکس فارسی
    {
        id: 'forex-1',
        title: '💱 دلار آمریکا و نوسانات بازار فارکس',
        content: 'شاخص دلار آمریکا (DXY) تحت تأثیر گزارش‌های اقتصادی جدید، نوسانات قابل توجهی را تجربه کرد. تحلیلگران انتظار دارند این روند ادامه یابد.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/00ccff?text=USD+Forex',
        category: 'forex',
        date: new Date('2025-01-16'),
        source: 'فارکس نیوز ایران',
        tags: ['دلار آمریکا', 'DXY', 'فارکس', 'تحلیل']
    },
    {
        id: 'forex-2',
        title: '🇪🇺 یورو و تصمیمات بانک مرکزی اروپا',
        content: 'بانک مرکزی اروپا (ECB) در جلسه امروز خود تصمیمات جدیدی درباره نرخ بهره و سیاست‌های پولی اتخاذ کرد که بر ارزش یورو تأثیر گذاشت.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/4ecdc4?text=Euro+ECB',
        category: 'forex',
        date: new Date('2025-01-15'),
        source: 'اقتصاد آنلاین',
        tags: ['یورو', 'EUR', 'ECB', 'نرخ بهره']
    },
    {
        id: 'forex-3',
        title: '🇯🇵 ین ژاپن و سیاست‌های بانک مرکزی',
        content: 'بانک مرکزی ژاپن (BOJ) اعلام کرد که سیاست‌های انبساطی خود را ادامه خواهد داد. این تصمیم بر ارزش ین ژاپن تأثیر منفی گذاشت.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/ff6b6b?text=Yen+BOJ',
        category: 'forex',
        date: new Date('2025-01-14'),
        source: 'فارکس پرس',
        tags: ['ین ژاپن', 'JPY', 'BOJ', 'سیاست پولی']
    },
    {
        id: 'forex-4',
        title: '🇬🇧 پوند انگلیس و Brexit',
        content: 'مذاکرات جدید بین انگلیس و اتحادیه اروپا درباره تجارت پس از Brexit، تأثیر مستقیمی بر ارزش پوند انگلیس داشت.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/4ecdc4?text=Pound+Brexit',
        category: 'forex',
        date: new Date('2025-01-13'),
        source: 'فارکس دیلی',
        tags: ['پوند انگلیس', 'GBP', 'Brexit', 'تجارت']
    },
    {
        id: 'forex-5',
        title: '🇨🇭 فرانک سوئیس و امنیت سرمایه‌گذاری',
        content: 'فرانک سوئیس همچنان به عنوان یکی از امن‌ترین ارزهای جهان شناخته می‌شود. سرمایه‌گذاران در زمان نوسانات بازار به این ارز پناه می‌برند.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/ffd93d?text=Swiss+Franc',
        category: 'forex',
        date: new Date('2025-01-12'),
        source: 'فارکس سنتر',
        tags: ['فرانک سوئیس', 'CHF', 'امنیت', 'سرمایه‌گذاری']
    },
    // اخبار اقتصادی فارسی
    {
        id: 'economy-1',
        title: '📊 شاخص‌های اقتصادی ایران و تأثیر بر بازار',
        content: 'گزارش جدید مرکز آمار ایران نشان می‌دهد که تورم ماهانه کاهش یافته است. این خبر تأثیر مثبتی بر بازارهای مالی داشت.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/a786ff?text=Iran+Economy',
        category: 'economy',
        date: new Date('2025-01-16'),
        source: 'اقتصاد نیوز',
        tags: ['اقتصاد ایران', 'تورم', 'شاخص اقتصادی', 'بازار']
    },
    {
        id: 'economy-2',
        title: '🏦 بانک مرکزی و سیاست‌های جدید ارزی',
        content: 'بانک مرکزی ایران اعلام کرد که سیاست‌های جدیدی برای کنترل نرخ ارز و تثبیت بازار ارز اتخاذ کرده است.',
        url: '#',
        image: 'https://via.placeholder.com/300x200/232946/00ff88?text=Central+Bank',
        category: 'economy',
        date: new Date('2025-01-15'),
        source: 'بانک مرکزی ایران',
        tags: ['بانک مرکزی', 'نرخ ارز', 'سیاست ارزی', 'تثبیت']
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
            // در صورت خطا، اخبار محلی اضافه کن
            const localCryptoNews = generateRandomPersianNews().filter(news => news.category === 'crypto');
            allNews = [...localCryptoNews, ...allNews];
        }
        
        // تلاش برای دریافت اخبار فارکس
        try {
            const forexNews = await fetchForexNews();
            if (forexNews && forexNews.length > 0) {
                allNews = [...forexNews, ...allNews];
            }
        } catch (error) {
            console.log('خطا در دریافت اخبار فارکس:', error);
            // در صورت خطا، اخبار محلی اضافه کن
            const localForexNews = generateRandomPersianNews().filter(news => news.category === 'forex');
            allNews = [...localForexNews, ...allNews];
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
    }, 10 * 60 * 1000); // 10 دقیقه
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

// تولید اخبار تصادفی فارسی برای نمایش بهتر
function generateRandomPersianNews() {
    const cryptoTopics = [
        {
            title: '🔥 رشد چشمگیر بیت‌کوین در هفته گذشته',
            content: 'بیت‌کوین در هفته گذشته رشد قابل توجهی را تجربه کرد و تحلیلگران معتقدند این روند ادامه خواهد داشت.',
            tags: ['بیت‌کوین', 'BTC', 'رشد', 'تحلیل']
        },
        {
            title: '🚀 اتریوم و توسعه‌های جدید شبکه',
            content: 'تیم توسعه‌دهنده اتریوم اعلام کرد که به‌روزرسانی‌های جدیدی برای بهبود عملکرد شبکه در راه است.',
            tags: ['اتریوم', 'ETH', 'توسعه', 'شبکه']
        },
        {
            title: '💎 کاردانو و همکاری‌های جدید',
            content: 'پروژه کاردانو اعلام کرد که قراردادهای جدیدی با شرکت‌های فناوری منعقد کرده است.',
            tags: ['کاردانو', 'ADA', 'همکاری', 'فناوری']
        }
    ];
    
    const forexTopics = [
        {
            title: '💱 نوسانات دلار آمریکا در بازار فارکس',
            content: 'شاخص دلار آمریکا تحت تأثیر گزارش‌های اقتصادی جدید، نوسانات قابل توجهی را تجربه کرد.',
            tags: ['دلار آمریکا', 'DXY', 'فارکس', 'نوسانات']
        },
        {
            title: '🇪🇺 یورو و تصمیمات بانک مرکزی اروپا',
            content: 'بانک مرکزی اروپا در جلسه امروز خود تصمیمات جدیدی درباره سیاست‌های پولی اتخاذ کرد.',
            tags: ['یورو', 'EUR', 'ECB', 'سیاست پولی']
        },
        {
            title: '🇯🇵 ین ژاپن و تأثیر سیاست‌های اقتصادی',
            content: 'سیاست‌های جدید بانک مرکزی ژاپن تأثیر مستقیمی بر ارزش ین ژاپن در بازارهای جهانی داشت.',
            tags: ['ین ژاپن', 'JPY', 'BOJ', 'اقتصاد']
        }
    ];
    
    const economyTopics = [
        {
            title: '📊 گزارش جدید شاخص‌های اقتصادی ایران',
            content: 'مرکز آمار ایران گزارش جدیدی از وضعیت اقتصادی کشور منتشر کرد که نشان‌دهنده بهبود نسبی است.',
            tags: ['اقتصاد ایران', 'شاخص اقتصادی', 'گزارش', 'بهبود']
        },
        {
            title: '🏦 بانک مرکزی و سیاست‌های جدید ارزی',
            content: 'بانک مرکزی ایران اعلام کرد که سیاست‌های جدیدی برای تثبیت بازار ارز اتخاذ کرده است.',
            tags: ['بانک مرکزی', 'نرخ ارز', 'سیاست ارزی', 'تثبیت']
        }
    ];
    
    const allTopics = [...cryptoTopics, ...forexTopics, ...economyTopics];
    
    // تولید 5 خبر تصادفی
    const news = [];
    for (let i = 0; i < 5; i++) {
        const randomTopic = allTopics[Math.floor(Math.random() * allTopics.length)];
        news.push({
            id: `random-${Date.now()}-${i}`,
            title: randomTopic.title,
            content: randomTopic.content,
            url: '#',
            image: `https://via.placeholder.com/300x200/232946/${getRandomColor()}?text=News`,
            category: randomTopic.title.includes('بیت‌کوین') || randomTopic.title.includes('اتریوم') || randomTopic.title.includes('کاردانو') ? 'crypto' : 
                      randomTopic.title.includes('دلار') || randomTopic.title.includes('یورو') || randomTopic.title.includes('ین') ? 'forex' : 'economy',
            date: new Date(),
            source: 'خبرگزاری مالی',
            tags: randomTopic.tags
        });
    }
    
    return news;
}

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
window.generateRandomPersianNews = generateRandomPersianNews; 