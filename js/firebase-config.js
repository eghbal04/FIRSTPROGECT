// Firebase Configuration for Price History Storage
// این فایل تنظیمات Firebase و توابع ذخیره تاریخچه قیمت را مدیریت می‌کند

const firebaseConfig = {
  apiKey: "AIzaSyDYGsaI3REdD6CpWAqFQ0JkZW2TcXM6Plw",
  authDomain: "cpaforex-prices.firebaseapp.com",
  projectId: "cpaforex-prices",
  storageBucket: "cpaforex-prices.appspot.com", // ← اصلاح شد
  messagingSenderId: "100571034895",
  appId: "1:100571034895:web:8d579892cbbdc7fca9ba7a"
};

let db = null;
let isFirebaseInitialized = false;

function initializeFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      isFirebaseInitialized = true;
      console.log('✅ Firebase راه‌اندازی شد');
      return true;
    } else {
      console.warn('⚠️ Firebase SDK بارگذاری نشده است');
      return false;
    }
  } catch (error) {
    console.error('❌ خطا در راه‌اندازی Firebase:', error);
    return false;
  }
}

// تابع حذف داده‌های تکراری از دیتابیس
async function removeDuplicateData(daysBack = 7) {
    if (!isFirebaseInitialized || !db) {
        console.warn('⚠️ Firebase راه‌اندازی نشده است');
        return false;
    }

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        
        const snapshot = await db.collection('price_history')
            .where('timestamp', '>=', cutoffDate)
            .orderBy('timestamp', 'asc')
            .get();

        const duplicates = [];
        const seen = new Set();
        
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const key = `${data.tokenPrice}_${data.pointPrice}`;
            
            if (seen.has(key)) {
                duplicates.push(doc.id);
            } else {
                seen.add(key);
            }
        });

        if (duplicates.length > 0) {
            console.log(`🗑️ حذف ${duplicates.length} رکورد تکراری...`);
            
            // حذف داده‌های تکراری
            const batch = db.batch();
            duplicates.forEach(docId => {
                const docRef = db.collection('price_history').doc(docId);
                batch.delete(docRef);
            });
            
            await batch.commit();
            console.log(`✅ ${duplicates.length} رکورد تکراری حذف شد`);
            return true;
        } else {
            console.log('✅ هیچ داده تکراری یافت نشد');
            return true;
        }
    } catch (error) {
        console.error('❌ خطا در حذف داده‌های تکراری:', error);
        return false;
    }
}

// تابع دریافت آمار ذخیره‌سازی
async function getSaveStats(daysBack = 7) {
    if (!isFirebaseInitialized || !db) {
        return null;
    }

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        
        const snapshot = await db.collection('price_history')
            .where('timestamp', '>=', cutoffDate)
            .orderBy('timestamp', 'desc')
            .get();

        const stats = {
            totalRecords: snapshot.size,
            uniqueRecords: 0,
            duplicateRecords: 0,
            dateRange: `${daysBack} روز گذشته`,
            averageRecordsPerDay: 0
        };

        const seen = new Set();
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const key = `${data.tokenPrice}_${data.pointPrice}`;
            
            if (seen.has(key)) {
                stats.duplicateRecords++;
            } else {
                seen.add(key);
                stats.uniqueRecords++;
            }
        });

        stats.averageRecordsPerDay = Math.round(stats.totalRecords / daysBack);

        return stats;
    } catch (error) {
        console.error('❌ خطا در دریافت آمار:', error);
        return null;
    }
}

// تابع بررسی داده‌های تکراری در بازه زمانی مشخص
async function checkDuplicateData(tokenPrice, pointPrice, timeWindowMinutes = 5) {
    if (!isFirebaseInitialized || !db) {
        return false;
    }

    try {
        const now = new Date();
        const timeWindow = new Date(now.getTime() - (timeWindowMinutes * 60 * 1000));
        
        const snapshot = await db.collection('price_history')
            .where('timestamp', '>=', timeWindow)
            .orderBy('timestamp', 'desc')
            .get();

        const newTokenPrice = tokenPrice !== null ? parseFloat(tokenPrice) : null;
        const newPointPrice = pointPrice !== null ? parseFloat(pointPrice) : null;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const existingTokenPrice = data.tokenPrice;
            const existingPointPrice = data.pointPrice;
            
            // مقایسه با در نظر گرفتن null values
            const tokenPriceMatch = (newTokenPrice === null && existingTokenPrice === null) || 
                                  (newTokenPrice !== null && existingTokenPrice === newTokenPrice);
            const pointPriceMatch = (newPointPrice === null && existingPointPrice === null) || 
                                  (newPointPrice !== null && existingPointPrice === newPointPrice);
            
            if (tokenPriceMatch && pointPriceMatch) {
                console.log('🔄 داده تکراری در بازه زمانی یافت شد:', {
                    tokenPrice: newTokenPrice,
                    pointPrice: newPointPrice,
                    timeWindow: `${timeWindowMinutes} دقیقه`
                });
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.warn('⚠️ خطا در بررسی داده‌های تکراری:', error);
        return false;
    }
}

// تابع ذخیره تاریخچه قیمت توکن و پوینت
async function savePriceHistory(tokenPrice, pointPrice, options = {}) {
    if (!isFirebaseInitialized || !db) {
        console.warn('⚠️ Firebase راه‌اندازی نشده است');
        return false;
    }

    try {
        // بررسی معتبر بودن داده‌ها
        const newTokenPrice = parseFloat(tokenPrice);
        const newPointPrice = parseFloat(pointPrice);
        
        // فقط اگر هر دو مقدار معتبر باشند ذخیره کن
        if (isNaN(newTokenPrice) || isNaN(newPointPrice)) {
            console.warn('⚠️ یکی از قیمت‌ها نامعتبر است - ذخیره نمی‌شود', {tokenPrice, pointPrice});
            return false;
        }
        
        const finalTokenPrice = newTokenPrice;
        const finalPointPrice = newPointPrice;

        const {
            checkLastRecord = true,      // بررسی آخرین رکورد
            checkTimeWindow = false,     // بررسی در بازه زمانی
            timeWindowMinutes = 5,       // بازه زمانی برای بررسی (دقیقه)
            forceSave = false            // ذخیره اجباری
        } = options;

        // اگر ذخیره اجباری نباشد، بررسی تکرار انجام بده
        if (!forceSave) {
            let shouldSave = true;
            
            // بررسی آخرین رکورد
            if (checkLastRecord) {
                try {
                    const lastSnapshot = await db.collection('price_history')
                        .orderBy('timestamp', 'desc')
                        .limit(1)
                        .get();
                    
                    if (!lastSnapshot.empty) {
                        const lastData = lastSnapshot.docs[0].data();
                        const lastTokenPrice = lastData.tokenPrice;
                        const lastPointPrice = lastData.pointPrice;
                        
                        // اگر هیچ تغییری نبوده، ذخیره نکن
                        if (lastTokenPrice === finalTokenPrice && lastPointPrice === finalPointPrice) {
                            console.log('🔄 داده تکراری (آخرین رکورد) - ذخیره نمی‌شود:', {
                                tokenPrice: finalTokenPrice,
                                pointPrice: finalPointPrice
                            });
                            shouldSave = false;
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ خطا در بررسی آخرین رکورد:', error);
                }
            }
            
            // بررسی در بازه زمانی
            if (shouldSave && checkTimeWindow) {
                const isDuplicate = await checkDuplicateData(finalTokenPrice, finalPointPrice, timeWindowMinutes);
                if (isDuplicate) {
                    shouldSave = false;
                }
            }
            
            if (!shouldSave) {
                return true; // موفقیت بدون ذخیره
            }
        }

        const priceData = {
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            tokenPrice: finalTokenPrice,
            pointPrice: finalPointPrice,
            date: new Date().toISOString(),
            userId: 'anonymous' // می‌توانید بعداً سیستم کاربری اضافه کنید
        };

        await db.collection('price_history').add(priceData);
        console.log('✅ تاریخچه قیمت در Firebase ذخیره شد:', priceData);
        return true;
    } catch (error) {
        console.error('❌ خطا در ذخیره تاریخچه قیمت:', error);
        return false;
    }
}

// تابع بازیابی تاریخچه قیمت
async function getPriceHistory(limit = 100) {
    if (!isFirebaseInitialized || !db) {
        console.warn('⚠️ Firebase راه‌اندازی نشده است');
        return [];
    }

    try {
        const snapshot = await db.collection('price_history')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const history = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            history.push({
                id: doc.id,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date(data.date),
                tokenPrice: data.tokenPrice,
                pointPrice: data.pointPrice,
                date: data.date
            });
        });

        console.log(`✅ ${history.length} رکورد تاریخچه قیمت بازیابی شد`);
        return history;
    } catch (error) {
        console.error('❌ خطا در بازیابی تاریخچه قیمت:', error);
        return [];
    }
}

// تابع بازیابی تاریخچه قیمت بر اساس بازه زمانی
async function getPriceHistoryByDateRange(startDate, endDate) {
    if (!isFirebaseInitialized || !db) {
        console.warn('⚠️ Firebase راه‌اندازی نشده است');
        return [];
    }

    try {
        const snapshot = await db.collection('price_history')
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate)
            .orderBy('timestamp', 'desc')
            .get();

        const history = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            history.push({
                id: doc.id,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date(data.date),
                tokenPrice: data.tokenPrice,
                pointPrice: data.pointPrice,
                date: data.date
            });
        });

        console.log(`✅ ${history.length} رکورد در بازه زمانی مشخص بازیابی شد`);
        return history;
    } catch (error) {
        console.error('❌ خطا در بازیابی تاریخچه قیمت:', error);
        return [];
    }
}

// تابع پاک کردن تاریخچه قدیمی (بیش از 30 روز)
async function cleanupOldPriceHistory(daysToKeep = 30) {
    if (!isFirebaseInitialized || !db) {
        console.warn('⚠️ Firebase راه‌اندازی نشده است');
        return false;
    }

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const snapshot = await db.collection('price_history')
            .where('timestamp', '<', cutoffDate)
            .get();

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`✅ ${snapshot.docs.length} رکورد قدیمی پاک شد`);
        return true;
    } catch (error) {
        console.error('❌ خطا در پاک کردن تاریخچه قدیمی:', error);
        return false;
    }
}

// تابع دریافت آمار تاریخچه قیمت
async function getPriceHistoryStats() {
    if (!isFirebaseInitialized || !db) {
        console.warn('⚠️ Firebase راه‌اندازی نشده است');
        return null;
    }

    try {
        const snapshot = await db.collection('price_history').get();
        const totalRecords = snapshot.size;
        
        if (totalRecords === 0) {
            return { totalRecords: 0, oldestRecord: null, newestRecord: null };
        }

        let oldestRecord = null;
        let newestRecord = null;
        let totalTokenPrice = 0;
        let totalPointPrice = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const timestamp = data.timestamp ? data.timestamp.toDate() : new Date(data.date);
            
            if (!oldestRecord || timestamp < oldestRecord.timestamp) {
                oldestRecord = { ...data, timestamp, id: doc.id };
            }
            if (!newestRecord || timestamp > newestRecord.timestamp) {
                newestRecord = { ...data, timestamp, id: doc.id };
            }

            totalTokenPrice += data.tokenPrice || 0;
            totalPointPrice += data.pointPrice || 0;
        });

        return {
            totalRecords,
            oldestRecord,
            newestRecord,
            averageTokenPrice: totalTokenPrice / totalRecords,
            averagePointPrice: totalPointPrice / totalRecords
        };
    } catch (error) {
        console.error('❌ خطا در دریافت آمار تاریخچه:', error);
        return null;
    }
}

// تابع صادر کردن تاریخچه قیمت
async function exportPriceHistory(format = 'json') {
    if (!isFirebaseInitialized || !db) {
        console.warn('⚠️ Firebase راه‌اندازی نشده است');
        return null;
    }

    try {
        const history = await getPriceHistory(1000); // حداکثر 1000 رکورد

        if (format === 'csv') {
            const csvContent = [
                'تاریخ,قیمت توکن,قیمت پوینت',
                ...history.map(record => 
                    `${record.date},${record.tokenPrice},${record.pointPrice}`
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `price_history_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            // JSON format
            const dataStr = JSON.stringify(history, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `price_history_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        console.log('✅ تاریخچه قیمت صادر شد');
        return true;
    } catch (error) {
        console.error('❌ خطا در صادر کردن تاریخچه:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeFirebase();
});

// بقیه توابع (ذخیره، دریافت، آمار و ...) از اینجا به بعد قرار بگیرند

// تابع‌های عمومی برای استفاده در فایل‌های دیگر
window.firebasePriceHistory = {
    initialize: initializeFirebase,
    save: savePriceHistory,
    get: getPriceHistory,
    getByDateRange: getPriceHistoryByDateRange,
    cleanup: cleanupOldPriceHistory,
    getStats: getPriceHistoryStats,
    export: exportPriceHistory,
    // توابع جدید برای مدیریت داده‌های تکراری
    checkDuplicate: checkDuplicateData,
    removeDuplicates: removeDuplicateData,
    getSaveStats: getSaveStats
};

// Export برای استفاده در ماژول‌ها
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeFirebase,
        savePriceHistory,
        getPriceHistory,
        getPriceHistoryByDateRange,
        cleanupOldPriceHistory,
        getPriceHistoryStats,
        exportPriceHistory,
        checkDuplicateData,
        removeDuplicateData,
        getSaveStats
    };
}

// توابع کمکی برای دسترسی از کنسول
window.firebaseHelpers = {
    // بررسی داده‌های تکراری
    checkDuplicates: (tokenPrice, pointPrice, timeWindow = 5) => {
        return checkDuplicateData(tokenPrice, pointPrice, timeWindow);
    },
    
    // حذف داده‌های تکراری
    removeDuplicates: (daysBack = 7) => {
        return removeDuplicateData(daysBack);
    },
    
    // دریافت آمار ذخیره‌سازی
    getStats: (daysBack = 7) => {
        return getSaveStats(daysBack);
    },
    
    // ذخیره با گزینه‌های پیشرفته
    saveWithOptions: (tokenPrice, pointPrice, options = {}) => {
        return savePriceHistory(tokenPrice, pointPrice, options);
    },
    
    // نمایش آمار در کنسول
    showStats: async (daysBack = 7) => {
        const stats = await getSaveStats(daysBack);
        if (stats) {
            console.log('📊 آمار ذخیره‌سازی:', stats);
            console.log(`📈 کل رکوردها: ${stats.totalRecords}`);
            console.log(`✅ رکوردهای منحصر به فرد: ${stats.uniqueRecords}`);
            console.log(`🔄 رکوردهای تکراری: ${stats.duplicateRecords}`);
            console.log(`📅 میانگین روزانه: ${stats.averageRecordsPerDay}`);
        } else {
            console.log('❌ خطا در دریافت آمار');
        }
    },
    
    // نمایش وضعیت سیستم جلوگیری از تکرار
    showDuplicatePreventionStatus: async () => {
        console.log('🛡️ وضعیت سیستم جلوگیری از تکرار:');
        console.log('✅ بررسی آخرین رکورد: فعال');
        console.log('✅ بررسی بازه زمانی: قابل تنظیم');
        console.log('✅ ذخیره اجباری: قابل تنظیم');
        console.log('✅ مدیریت داده‌های NaN: فعال');
        
        // نمایش آخرین رکورد
        try {
            const lastSnapshot = await db.collection('price_history')
                .orderBy('timestamp', 'desc')
                .limit(1)
                .get();
            
            if (!lastSnapshot.empty) {
                const lastData = lastSnapshot.docs[0].data();
                console.log('📋 آخرین رکورد ذخیره شده:', {
                    tokenPrice: lastData.tokenPrice,
                    pointPrice: lastData.pointPrice,
                    date: lastData.date
                });
            }
        } catch (error) {
            console.warn('⚠️ خطا در دریافت آخرین رکورد:', error);
        }
    },
    
    // تست بارگذاری داده‌های تاریخی
    testHistoricalDataLoad: async () => {
        console.log('🧪 تست بارگذاری داده‌های تاریخی...');
        try {
            // تست 1: بررسی Firebase
            const firebaseData = await window.firebasePriceHistory.get(10);
            console.log('📊 داده‌های Firebase:', firebaseData);

            // تست 2: بررسی PriceHistoryManager
            if (window.priceHistoryManager) {
                console.log('📈 وضعیت PriceHistoryManager:');
                console.log('- Firebase فعال:', window.priceHistoryManager.isFirebaseEnabled());
                console.log('- تعداد رکوردهای توکن:', window.priceHistoryManager.tokenHistory.length);
                console.log('- تعداد رکوردهای پوینت:', window.priceHistoryManager.pointHistory.length);

                // تست داده‌های واقعی
                if (window.priceHistoryManager.tokenHistory.length > 0) {
                    console.log('📊 نمونه داده‌های توکن:', window.priceHistoryManager.tokenHistory.slice(-3));
                }
                if (window.priceHistoryManager.pointHistory.length > 0) {
                    console.log('📊 نمونه داده‌های پوینت:', window.priceHistoryManager.pointHistory.slice(-3));
                }

                // تست بارگذاری مجدد
                await window.priceHistoryManager.reloadFromFirebase();
                console.log('🔄 بعد از بارگذاری مجدد:');
                console.log('- تعداد رکوردهای توکن:', window.priceHistoryManager.tokenHistory.length);
                console.log('- تعداد رکوردهای پوینت:', window.priceHistoryManager.pointHistory.length);
            } else {
                console.log('❌ PriceHistoryManager در دسترس نیست');
            }

            // تست 3: بررسی چارت‌ها
            if (window.priceChartsManager) {
                console.log('📊 وضعیت PriceChartsManager:');
                console.log('- Firebase فعال:', window.priceChartsManager.firebaseEnabled);

                // تست به‌روزرسانی چارت‌ها
                window.priceChartsManager.updateCharts();
                console.log('✅ چارت‌ها به‌روزرسانی شدند');
            } else {
                console.log('❌ PriceChartsManager در دسترس نیست');
            }

            // تست 4: بررسی چارت‌های جداگانه
            if (window.priceChart) {
                console.log('📊 وضعیت PriceChart:');
                console.log('- چارت موجود:', !!window.priceChart.chart);
                if (window.priceChart.chart) {
                    console.log('- تعداد داده‌ها:', window.priceChart.chart.data.datasets[0].data.length);
                }
                // تست به‌روزرسانی
                window.priceChart.generateTimePeriodData();
                console.log('✅ PriceChart به‌روزرسانی شد');
            }

            if (window.pointChart) {
                console.log('📊 وضعیت PointChart:');
                console.log('- چارت موجود:', !!window.pointChart.chart);
                if (window.pointChart.chart) {
                    console.log('- تعداد داده‌ها:', window.pointChart.chart.data.datasets[0].data.length);
                }
                // تست به‌روزرسانی
                window.pointChart.generateTimePeriodData();
                console.log('✅ PointChart به‌روزرسانی شد');
            }

        } catch (error) {
            console.error('❌ خطا در تست بارگذاری داده‌های تاریخی:', error);
        }
    }
}; 