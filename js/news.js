// news.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // بارگذاری اخبار و آموزش‌ها
        loadNews();
        loadTutorials();

    } catch (error) {
        console.error("Error in news page:", error);
    }
});

// اخبار بلاکچین
const blockchainNews = [
    {
        id: 1,
        title: "راهنمای کامل استفاده از LevelUp",
        url: "#",
        date: "2025-01-15"
    },
    {
        id: 2,
        title: "آموزش اتصال کیف پول به پلتفرم",
        url: "#",
        date: "2025-01-14"
    },
    {
        id: 3,
        title: "نحوه خرید و فروش توکن LVL",
        url: "#",
        date: "2025-01-13"
    },
    {
        id: 4,
        title: "راهنمای سیستم باینری و پاداش‌ها",
        url: "#",
        date: "2025-01-12"
    },
    {
        id: 5,
        title: "آموزش ثبت‌نام و فعال‌سازی حساب",
        url: "#",
        date: "2025-01-11"
    }
];

// آموزش‌های استفاده از سایت
const tutorials = [
    {
        title: "شروع کار با LevelUp",
        description: "مراحل اولیه ثبت‌نام و اتصال کیف پول به پلتفرم"
    },
    {
        title: "خرید و فروش توکن",
        description: "آموزش کامل نحوه سواپ توکن LVL با MATIC"
    },
    {
        title: "سیستم باینری",
        description: "درک کامل سیستم باینری و نحوه کسب درآمد"
    },
    {
        title: "برداشت پاداش‌ها",
        description: "نحوه برداشت پاداش‌های کسب‌شده از سیستم باینری"
    },
    {
        title: "فروشگاه محصولات",
        description: "راهنمای خرید محصولات آموزشی با توکن LVL"
    }
];

// بارگذاری اخبار
function loadNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    newsList.innerHTML = blockchainNews.map(news => `
        <li class="news-item">
            <a href="${news.url}">${news.title}</a>
            <small style="color: #888; display: block; margin-top: 0.5rem;">
                ${formatDate(news.date)}
            </small>
        </li>
    `).join('');
}

// بارگذاری آموزش‌ها
function loadTutorials() {
    const tutorialList = document.getElementById('tutorial-list');
    if (!tutorialList) return;

    tutorialList.innerHTML = tutorials.map(tutorial => `
        <li class="tutorial-item">
            <div class="tutorial-title">${tutorial.title}</div>
            <div class="tutorial-desc">${tutorial.description}</div>
        </li>
    `).join('');
}

// تابع فرمت تاریخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
} 