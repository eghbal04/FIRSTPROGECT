// AI Help System - Common Questions and Answers
class AIHelpSystem {
    constructor() {
        this.commonQuestions = {
            // سوالات مربوط به ثبت‌نام
            'registration': {
                keywords: ['ثبت‌نام', 'register', 'signup', 'sign up', 'join', 'عضویت'],
                answers: [
                    'برای ثبت‌نام در سیستم CPA، ابتدا کیف پول خود را متصل کنید.',
                    'سپس روی دکمه "ثبت‌نام" کلیک کنید و هزینه ثبت‌نام را پرداخت کنید.',
                    'پس از ثبت‌نام، می‌توانید از تمام امکانات سیستم استفاده کنید.'
                ]
            },
            
            // سوالات مربوط به قیمت توکن
            'token_price': {
                keywords: ['قیمت', 'price', 'token price', 'cpa price', 'قیمت توکن'],
                answers: [
                    'قیمت توکن CPA به صورت پویا محاسبه می‌شود.',
                    'قیمت فعلی را می‌توانید در بخش "قیمت‌ها" مشاهده کنید.',
                    'قیمت بر اساس عرضه و تقاضا در سیستم تعیین می‌شود.'
                ]
            },
            
            // سوالات مربوط به پاداش‌ها
            'rewards': {
                keywords: ['پاداش', 'reward', 'claim', 'برداشت', 'withdraw'],
                answers: [
                    'پاداش‌های باینری را می‌توانید از بخش "پروفایل" برداشت کنید.',
                    'برای برداشت، روی دکمه "برداشت پاداش" کلیک کنید.',
                    'پاداش‌ها به صورت خودکار به کیف پول شما ارسال می‌شوند.'
                ]
            },
            
            // سوالات مربوط به شبکه باینری
            'binary_network': {
                keywords: ['شبکه باینری', 'binary network', 'network', 'شبکه', 'referral'],
                answers: [
                    'شبکه باینری یک سیستم ارجاع است که به شما امکان کسب درآمد می‌دهد.',
                    'هر کاربر می‌تواند دو نفر را معرفی کند (چپ و راست).',
                    'پاداش‌ها بر اساس فعالیت شبکه شما محاسبه می‌شود.'
                ]
            },
            
            // سوالات مربوط به خرید توکن
            'buy_tokens': {
                keywords: ['خرید', 'buy', 'purchase', 'token buy', 'خرید توکن'],
                answers: [
                    'برای خرید توکن CPA، به بخش "تبدیل ارز" بروید.',
                    'مقدار USDC مورد نظر را وارد کنید.',
                    'روی دکمه "خرید" کلیک کنید و تراکنش را تایید کنید.'
                ]
            },
            
            // سوالات مربوط به کیف پول
            'wallet': {
                keywords: ['کیف پول', 'wallet', 'metamask', 'اتصال', 'connect'],
                answers: [
                    'برای استفاده از سیستم، ابتدا MetaMask را نصب کنید.',
                    'سپس روی دکمه "اتصال کیف پول" کلیک کنید.',
                    'اطمینان حاصل کنید که در شبکه Polygon هستید.'
                ]
            },
            
            // سوالات مربوط به امنیت
            'security': {
                keywords: ['امنیت', 'security', 'safe', 'مطمئن', 'trust'],
                answers: [
                    'سیستم CPA بر اساس قراردادهای هوشمند امن ساخته شده است.',
                    'کد قرارداد قابل بررسی و تایید است.',
                    'هیچ شخص ثالثی به دارایی‌های شما دسترسی ندارد.'
                ]
            },
            
            // سوالات مربوط به آموزش
            'education': {
                keywords: ['آموزش', 'education', 'learn', 'tutorial', 'راهنما'],
                answers: [
                    'برای آموزش‌های کامل، به بخش "آموزش و یادگیری" بروید.',
                    'ویدیوهای آموزشی و مستندات کامل در دسترس است.',
                    'همچنین می‌توانید از دستیار هوشمند کمک بگیرید.'
                ]
            }
        };
    }
    
    // تشخیص نوع سوال بر اساس کلمات کلیدی
    detectQuestionType(userQuestion) {
        const question = userQuestion.toLowerCase();
        
        for (const [type, data] of Object.entries(this.commonQuestions)) {
            for (const keyword of data.keywords) {
                if (question.includes(keyword.toLowerCase())) {
                    return type;
                }
            }
        }
        
        return null;
    }
    
    // دریافت پاسخ مناسب
    getAnswer(questionType) {
        if (questionType && this.commonQuestions[questionType]) {
            const answers = this.commonQuestions[questionType].answers;
            return answers[Math.floor(Math.random() * answers.length)];
        }
        return null;
    }
    
    // تولید پاسخ هوشمند
    generateSmartResponse(userQuestion) {
        const questionType = this.detectQuestionType(userQuestion);
        
        if (questionType) {
            const answer = this.getAnswer(questionType);
            if (answer) {
                return {
                    type: 'predefined',
                    answer: answer,
                    confidence: 0.9
                };
            }
        }
        
        // اگر سوال در دسته‌بندی‌های ما نبود، از AI استفاده کن
        return {
            type: 'ai',
            answer: null,
            confidence: 0.5
        };
    }
    
    // نمایش سوالات متداول
    showCommonQuestions() {
        const questions = [
            'چطور می‌تونم ثبت‌نام کنم؟',
            'قیمت توکن CPA چقدر است؟',
            'چطور می‌تونم پاداش‌ها را برداشت کنم؟',
            'سیستم شبکه باینری چطور کار می‌کند؟',
            'چطور می‌تونم توکن بخرم؟',
            'کیف پول خود را چطور متصل کنم؟',
            'آیا سیستم امن است؟',
            'کجا می‌تونم آموزش ببینم؟'
        ];
        
        return questions;
    }
    
    // تولید راهنمای کامل
    generateCompleteGuide() {
        return {
            title: 'راهنمای کامل CPA',
            sections: [
                {
                    title: 'شروع کار',
                    content: [
                        '1. نصب MetaMask',
                        '2. اتصال به شبکه Polygon',
                        '3. اتصال کیف پول به سایت',
                        '4. ثبت‌نام و پرداخت هزینه'
                    ]
                },
                {
                    title: 'خرید و فروش',
                    content: [
                        '1. رفتن به بخش تبدیل ارز',
                        '2. انتخاب نوع تراکنش (خرید/فروش)',
                        '3. وارد کردن مقدار',
                        '4. تایید تراکنش'
                    ]
                },
                {
                    title: 'شبکه باینری',
                    content: [
                        '1. معرفی دو نفر به سیستم',
                        '2. کسب پاداش از فعالیت شبکه',
                        '3. برداشت پاداش‌های باینری',
                        '4. نظارت بر عملکرد شبکه'
                    ]
                },
                {
                    title: 'امنیت',
                    content: [
                        '1. استفاده از کیف پول امن',
                        '2. بررسی قراردادهای هوشمند',
                        '3. عدم اشتراک‌گذاری کلید خصوصی',
                        '4. استفاده از شبکه‌های معتبر'
                    ]
                }
            ]
        };
    }
}

// ایجاد نمونه سراسری
window.aiHelpSystem = new AIHelpSystem();

// تابع کمکی برای استفاده در AI Assistant
window.getAIHelpResponse = function(userQuestion) {
    return window.aiHelpSystem.generateSmartResponse(userQuestion);
};

// تابع نمایش راهنمای کامل
window.showCompleteGuide = function() {
    return window.aiHelpSystem.generateCompleteGuide();
};

// تابع دریافت سوالات متداول
window.getCommonQuestions = function() {
    return window.aiHelpSystem.showCommonQuestions();
}; 

function getAdminFAQs() {
    return JSON.parse(localStorage.getItem('ai_faqs') || '[]');
}

// در متد پاسخ‌دهی اصلی:
// اگر سوال کاربر با سوالات ادمین مطابقت داشت، همان جواب را برگردان
AIHelpSystem.prototype.getAnswer = function(message) {
    // ابتدا جستجو در سوالات ادمین
    const adminFaqs = getAdminFAQs();
    const found = adminFaqs.find(f => message.includes(f.q));
    if (found) return found.a;
    // ... ادامه منطق قبلی (جستجو در commonQuestions و ...)
    // ... existing code ...
} 