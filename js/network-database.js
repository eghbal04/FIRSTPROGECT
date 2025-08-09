// network-database.js - ذخیره و بازیابی درخت شبکه در Firebase

// کلاس مدیریت درخت شبکه
class NetworkTreeDatabase {
    constructor() {
        this.collectionName = 'network_tree';
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🌳 راه‌اندازی دیتابیس درخت شبکه...');
            
            // بررسی اینکه Firebase در دسترس است
            if (typeof window.firebasePriceHistory !== 'undefined') {
                this.isInitialized = true;
                console.log('✅ دیتابیس درخت شبکه آماده است');
            } else {
                console.warn('⚠️ Firebase در دسترس نیست، دیتابیس غیرفعال خواهد بود');
            }
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی دیتابیس درخت شبکه:', error);
        }
    }

    // ذخیره گره درخت
    async saveNode(nodeData) {
        if (!this.isInitialized) {
            console.warn('⚠️ دیتابیس هنوز آماده نیست');
            return null;
        }
        try {
            const nodeDoc = {
                ...nodeData,
                timestamp: (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
                date: new Date().toISOString(),
                userId: 'anonymous',
                type: 'node'
            };
            // اگر Firestore فعال است، روی آن ذخیره کن
            if (typeof db !== 'undefined' && db && typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
                const docRef = await db.collection('network_tree_nodes').add(nodeDoc);
                console.log('✅ گره درخت در Firestore ذخیره شد:', docRef.id);
                return docRef.id;
            } else {
                // استفاده از localStorage به عنوان جایگزین
                const nodes = JSON.parse(localStorage.getItem('network_tree_nodes') || '[]');
                const newNode = {
                    id: Date.now().toString(),
                    ...nodeDoc
                };
                nodes.push(newNode);
                localStorage.setItem('network_tree_nodes', JSON.stringify(nodes, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                ));
                console.log('✅ گره درخت در localStorage ذخیره شد:', newNode.id);
                return newNode.id;
            }
        } catch (error) {
            console.error('❌ خطا در ذخیره گره درخت:', error);
            return null;
        }
    }

    // ذخیره کل درخت
    async saveTree(treeData) {
        if (!this.isInitialized) {
            console.warn('⚠️ دیتابیس هنوز آماده نیست');
            return false;
        }
        try {
            const treeDoc = {
                treeData,
                timestamp: (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
                date: new Date().toISOString(),
                userId: 'anonymous',
                type: 'full_tree'
            };
            if (typeof db !== 'undefined' && db && typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
                const docRef = await db.collection('network_tree_full').add(treeDoc);
                console.log('✅ کل درخت در Firestore ذخیره شد:', docRef.id);
                return true;
            } else {
                // استفاده از localStorage به عنوان جایگزین
                const trees = JSON.parse(localStorage.getItem('network_tree_full') || '[]');
                const newTree = {
                    id: Date.now().toString(),
                    ...treeDoc
                };
                trees.push(newTree);
                localStorage.setItem('network_tree_full', JSON.stringify(trees, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                ));
                console.log('✅ کل درخت در localStorage ذخیره شد:', newTree.id);
                return true;
            }
        } catch (error) {
            console.error('❌ خطا در ذخیره کل درخت:', error);
            return false;
        }
    }

    // دریافت گره‌های درخت
    async getNodes(limit = 100) {
        if (!this.isInitialized) {
            console.warn('⚠️ دیتابیس هنوز آماده نیست');
            return [];
        }
        try {
            if (typeof db !== 'undefined' && db && typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
                const snapshot = await db.collection('network_tree_nodes').orderBy('timestamp', 'desc').limit(limit).get();
                const nodes = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    nodes.push({ id: doc.id, ...data });
                });
                console.log(`✅ ${nodes.length} گره از Firestore بازیابی شد`);
                return nodes;
            } else {
                // استفاده از localStorage
                const nodes = JSON.parse(localStorage.getItem('network_tree_nodes') || '[]');
                const limitedNodes = nodes.slice(0, limit);
                console.log(`✅ ${limitedNodes.length} گره از localStorage بازیابی شد`);
                return limitedNodes;
            }
        } catch (error) {
            console.error('❌ خطا در دریافت گره‌ها:', error);
            return [];
        }
    }

    // دریافت آخرین درخت کامل
    async getLatestTree() {
        if (!this.isInitialized) {
            console.warn('⚠️ دیتابیس هنوز آماده نیست');
            return null;
        }
        try {
            if (typeof db !== 'undefined' && db && typeof isFirebaseInitialized !== 'undefined' && isFirebaseInitialized) {
                const snapshot = await db.collection('network_tree_full').orderBy('timestamp', 'desc').limit(1).get();
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    const data = doc.data();
                    console.log('✅ آخرین درخت کامل از Firestore بازیابی شد');
                    return { id: doc.id, ...data };
                } else {
                    console.log('ℹ️ هیچ درخت کاملی در Firestore یافت نشد');
                    return null;
                }
            } else {
                // استفاده از localStorage
                const trees = JSON.parse(localStorage.getItem('network_tree_full') || '[]');
                if (trees.length > 0) {
                    const latestTree = trees[trees.length - 1];
                    console.log('✅ آخرین درخت کامل از localStorage بازیابی شد');
                    return latestTree;
                } else {
                    console.log('ℹ️ هیچ درخت کاملی در localStorage یافت نشد');
                    return null;
                }
            }
        } catch (error) {
            console.error('❌ خطا در دریافت آخرین درخت:', error);
            return null;
        }
    }

    // پاک کردن داده‌های قدیمی
    async cleanupOldData(daysOld = 30) {
        if (!this.isInitialized) {
            console.warn('⚠️ دیتابیس هنوز آماده نیست');
            return 0;
        }

        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            // پاک کردن گره‌ها
            const nodes = JSON.parse(localStorage.getItem('network_tree_nodes') || '[]');
            const filteredNodes = nodes.filter(node => new Date(node.timestamp) >= cutoffDate);
            localStorage.setItem('network_tree_nodes', JSON.stringify(filteredNodes));

            // پاک کردن درخت‌های کامل
            const trees = JSON.parse(localStorage.getItem('network_tree_full') || '[]');
            const filteredTrees = trees.filter(tree => new Date(tree.timestamp) >= cutoffDate);
            localStorage.setItem('network_tree_full', JSON.stringify(filteredTrees));

            const deletedCount = (nodes.length - filteredNodes.length) + (trees.length - filteredTrees.length);
            console.log(`✅ ${deletedCount} رکورد قدیمی از localStorage پاک شد`);
            return deletedCount;
        } catch (error) {
            console.error('❌ خطا در پاک کردن داده‌های قدیمی:', error);
            return 0;
        }
    }

    // دریافت آمار دیتابیس
    async getStats() {
        if (!this.isInitialized) {
            console.warn('⚠️ دیتابیس هنوز آماده نیست');
            return null;
        }

        try {
            const nodes = await this.getNodes(1000);
            const trees = JSON.parse(localStorage.getItem('network_tree_full') || '[]');
            
            if (nodes.length === 0 && trees.length === 0) {
                return {
                    totalNodes: 0,
                    oldestRecord: null,
                    newestRecord: null,
                    treeCount: 0
                };
            }

            const allRecords = [...nodes, ...trees].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const oldestRecord = allRecords[allRecords.length - 1];
            const newestRecord = allRecords[0];

            return {
                totalNodes: nodes.length,
                oldestRecord: oldestRecord ? oldestRecord.timestamp : null,
                newestRecord: newestRecord ? newestRecord.timestamp : null,
                treeCount: trees.length
            };
        } catch (error) {
            console.error('❌ خطا در دریافت آمار:', error);
            return null;
        }
    }

    // صادر کردن داده‌ها
    async exportData(format = 'json') {
        if (!this.isInitialized) {
            console.warn('⚠️ دیتابیس هنوز آماده نیست');
            return null;
        }

        try {
            const nodes = await this.getNodes(1000);
            const trees = JSON.parse(localStorage.getItem('network_tree_full') || '[]');
            const allData = [...nodes, ...trees];
            
            if (format === 'json') {
                return JSON.stringify(allData, null, 2);
            } else if (format === 'csv') {
                // تبدیل به CSV
                const headers = ['id', 'timestamp', 'date', 'userId', 'type'];
                const csvRows = [headers.join(',')];
                
                allData.forEach(record => {
                    const row = headers.map(header => {
                        const value = record[header];
                        return typeof value === 'string' ? `"${value}"` : value;
                    });
                    csvRows.push(row.join(','));
                });
                
                return csvRows.join('\n');
            }
            
            return allData;
        } catch (error) {
            console.error('❌ خطا در صادر کردن داده‌ها:', error);
            return null;
        }
    }
}

// ایجاد نمونه سراسری
const networkTreeDB = new NetworkTreeDatabase();

// اضافه کردن توابع به window برای استفاده در کنسول
window.networkTreeDB = networkTreeDB;
window.saveNetworkNode = (nodeData) => networkTreeDB.saveNode(nodeData);
window.saveNetworkTree = (treeData) => networkTreeDB.saveTree(treeData);
window.getNetworkNodes = (limit) => networkTreeDB.getNodes(limit);
window.getLatestNetworkTree = () => networkTreeDB.getLatestTree();
window.getNetworkStats = () => networkTreeDB.getStats();
window.exportNetworkData = (format) => networkTreeDB.exportData(format);
window.cleanupNetworkData = (days) => networkTreeDB.cleanupOldData(days);

// تابع ذخیره درخت فعلی
window.saveCurrentNetworkTree = async function() {
    try {
        const container = document.getElementById('network-tree');
        if (!container) {
            console.warn('⚠️ Network tree container not found for saving');
            return false;
        }

        // شمارش تعداد گره‌ها
        const nodes = container.querySelectorAll('.tree-node, .empty-node');
        const nodeCount = nodes.length;

        // ذخیره HTML درخت
        const treeData = {
            html: container.innerHTML,
            nodeCount: nodeCount,
            timestamp: new Date(),
            date: new Date().toISOString(),
            userId: 'anonymous',
            type: 'full_tree'
        };

        await window.saveNetworkTree(treeData);
        console.log(`✅ درخت فعلی با ${nodeCount} گره در دیتابیس ذخیره شد`);
        return true;
    } catch (error) {
        console.error('❌ خطا در ذخیره درخت فعلی:', error);
        return false;
    }
};
window.getLatestNetworkTree = () => networkTreeDB.getLatestTree();
window.cleanupNetworkData = (days) => networkTreeDB.cleanupOldData(days);
window.getNetworkStats = () => networkTreeDB.getStats();
window.exportNetworkData = (format) => networkTreeDB.exportData(format);

// تابع کمکی برای ذخیره درخت فعلی
window.saveCurrentNetworkTree = async () => {
    try {
        const container = document.getElementById('network-tree');
        if (!container) {
            console.error('❌ Network tree container not found');
            return false;
        }

        // جمع‌آوری داده‌های درخت
        const treeData = {
            nodes: [],
            structure: container.innerHTML,
            timestamp: new Date().toISOString(),
            nodeCount: container.querySelectorAll('.node').length
        };

        // ذخیره در دیتابیس
        const result = await networkTreeDB.saveTree(treeData);
        
        if (result) {
            console.log('✅ درخت فعلی در دیتابیس ذخیره شد');
            return true;
        } else {
            console.error('❌ خطا در ذخیره درخت فعلی');
            return false;
        }
    } catch (error) {
        console.error('❌ خطا در ذخیره درخت فعلی:', error);
        return false;
    }
};



// تابع بررسی وضعیت ذخیره گره‌ها
window.checkNetworkDatabaseStatus = async function() {
    try {
        console.log('🔍 بررسی وضعیت دیتابیس درخت شبکه...');
        
        // بررسی آمار
        const stats = await window.getNetworkStats();
        console.log('📊 آمار دیتابیس:', stats);
        
        // بررسی گره‌های ذخیره شده
        const nodes = await window.getNetworkNodes(10);
        console.log(`📋 ${nodes.length} گره آخر:`, nodes);
        
        // بررسی آخرین درخت
        const latestTree = await window.getLatestNetworkTree();
        console.log('🌳 آخرین درخت کامل:', latestTree);
        
        // بررسی localStorage
        const localStorageNodes = localStorage.getItem('network_tree_nodes');
        const localStorageTrees = localStorage.getItem('network_tree_full');
        
        console.log('💾 وضعیت localStorage:');
        console.log('- گره‌ها:', localStorageNodes ? JSON.parse(localStorageNodes).length : 0, 'رکورد');
        console.log('- درخت‌ها:', localStorageTrees ? JSON.parse(localStorageTrees).length : 0, 'رکورد');
        
        return {
            stats,
            nodes,
            latestTree,
            localStorageStatus: {
                nodesCount: localStorageNodes ? JSON.parse(localStorageNodes).length : 0,
                treesCount: localStorageTrees ? JSON.parse(localStorageTrees).length : 0
            }
        };
        
    } catch (error) {
        console.error('❌ خطا در بررسی وضعیت دیتابیس:', error);
        return null;
    }
};

// تابع تست برای ذخیره گره‌های نمونه
window.testSaveSampleNodes = async function() {
    try {
        console.log('🧪 تست ذخیره گره‌های نمونه...');
        
        // ذخیره چند گره نمونه
        const sampleNodes = [
            {
                index: '1',
                address: '0x1234567890123456789012345678901234567890',
                cpaId: 'CPA001',
                level: 0,
                hasDirects: true,
                leftActive: true,
                rightActive: false,
                isEmpty: false,
                userData: { activated: true, balance: '1000' }
            },
            {
                index: '2',
                address: '0x2345678901234567890123456789012345678901',
                cpaId: 'CPA002',
                level: 1,
                hasDirects: false,
                leftActive: false,
                rightActive: false,
                isEmpty: false,
                userData: { activated: true, balance: '500' }
            },
            {
                index: '3',
                address: null,
                cpaId: null,
                level: 1,
                hasDirects: false,
                leftActive: false,
                rightActive: false,
                isEmpty: true,
                userData: null
            }
        ];

        for (const nodeData of sampleNodes) {
            await window.saveNetworkNode(nodeData);
        }

        // ذخیره درخت نمونه
        const sampleTree = {
            html: '<div>درخت نمونه</div>',
            nodeCount: 3,
            timestamp: new Date(),
            date: new Date().toISOString(),
            userId: 'test',
            type: 'full_tree'
        };

        await window.saveNetworkTree(sampleTree);
        
        console.log('✅ گره‌های نمونه با موفقیت ذخیره شدند');
        console.log('📊 آمار فعلی:', await window.getNetworkStats());
        
    } catch (error) {
        console.error('❌ خطا در تست ذخیره گره‌های نمونه:', error);
    }
};

// تابع استخراج کامل درخت از قرارداد فعلی
window.extractCompleteNetworkTree = async function() {
    try {
        console.log('🌳 شروع استخراج کامل درخت شبکه...');
        
        if (!window.contractConfig || !window.contractConfig.contract) {
            throw new Error('اتصال به قرارداد برقرار نیست');
        }
        
        const contract = window.contractConfig.contract;
        const extractedTree = {
            timestamp: Date.now(),
            totalUsers: 0,
            users: [],
            relationships: [],
            metadata: {
                contractAddress: contract.target,
                extractionDate: new Date().toISOString(),
                version: '1.0'
            }
        };
        
        // دریافت تعداد کل کاربران
        const walletsCount = await contract.wallets();
        extractedTree.totalUsers = parseInt(walletsCount.toString());
        console.log(`📊 تعداد کل کاربران: ${extractedTree.totalUsers}`);
        
        // استخراج اطلاعات تمام کاربران
        for (let i = 0; i < extractedTree.totalUsers; i++) {
            try {
                const userAddress = await contract.indexToAddress(BigInt(i));
                if (userAddress && userAddress !== '0x0000000000000000000000000000000000000000') {
                    const userData = await contract.users(userAddress);
                    
                    const userInfo = {
                        index: i,
                        address: userAddress,
                        referrer: userData.referrer,
                        leftChild: userData.leftChild,
                        rightChild: userData.rightChild,
                        level: userData.level,
                        points: userData.points.toString(),
                        balance: userData.balance.toString(),
                        depositedAmount: userData.depositedAmount.toString(),
                        lastClaimTime: userData.lastClaimTime.toString(),
                        isActive: userData.isActive
                    };
                    
                    extractedTree.users.push(userInfo);
                    
                    // اضافه کردن روابط
                    if (userData.referrer !== '0x0000000000000000000000000000000000000000') {
                        extractedTree.relationships.push({
                            child: userAddress,
                            parent: userData.referrer,
                            side: userData.leftChild === userAddress ? 'left' : 'right'
                        });
                    }
                    
                    if (i % 10 === 0) {
                        console.log(`⏳ استخراج کاربر ${i + 1}/${extractedTree.totalUsers}...`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ خطا در استخراج کاربر ${i}:`, error);
            }
        }
        
        // ذخیره در localStorage
        localStorage.setItem('extractedNetworkTree', JSON.stringify(extractedTree));
        
        console.log('✅ استخراج کامل درخت شبکه انجام شد');
        console.log(`📊 آمار استخراج:`);
        console.log(`   - تعداد کاربران: ${extractedTree.users.length}`);
        console.log(`   - تعداد روابط: ${extractedTree.relationships.length}`);
        console.log(`   - آدرس قرارداد: ${extractedTree.metadata.contractAddress}`);
        
        return extractedTree;
        
    } catch (error) {
        console.error('❌ خطا در استخراج درخت شبکه:', error);
        throw error;
    }
};

// تابع نمایش آمار درخت استخراج شده
window.showExtractedTreeStats = function() {
    try {
        const extractedData = localStorage.getItem('extractedNetworkTree');
        if (!extractedData) {
            console.log('❌ هیچ درخت استخراج شده‌ای یافت نشد');
            return;
        }
        
        const tree = JSON.parse(extractedData);
        console.log('📊 === آمار درخت استخراج شده ===');
        console.log(`📅 تاریخ استخراج: ${new Date(tree.timestamp).toLocaleString('fa-IR')}`);
        console.log(`👥 تعداد کل کاربران: ${tree.totalUsers}`);
        console.log(`👤 کاربران استخراج شده: ${tree.users.length}`);
        console.log(`🔗 تعداد روابط: ${tree.relationships.length}`);
        console.log(`📋 آدرس قرارداد: ${tree.metadata.contractAddress}`);
        
        // نمایش چند کاربر نمونه
        console.log('👤 نمونه کاربران:');
        tree.users.slice(0, 5).forEach((user, index) => {
            console.log(`   ${index + 1}. ایندکس: ${user.index}, آدرس: ${user.address.slice(0, 10)}...`);
        });
        
    } catch (error) {
        console.error('❌ خطا در نمایش آمار:', error);
    }
};

// تابع صادر کردن درخت استخراج شده
window.exportExtractedTree = function(format = 'json') {
    try {
        const extractedData = localStorage.getItem('extractedNetworkTree');
        if (!extractedData) {
            console.log('❌ هیچ درخت استخراج شده‌ای یافت نشد');
            return;
        }
        
        const tree = JSON.parse(extractedData);
        
        if (format === 'csv') {
            // صادر کردن به CSV
            const csvContent = [
                'Index,Address,Referrer,LeftChild,RightChild,Level,Points,Balance,DepositedAmount,LastClaimTime,IsActive',
                ...tree.users.map(user => 
                    `${user.index},${user.address},${user.referrer},${user.leftChild},${user.rightChild},${user.level},${user.points},${user.balance},${user.depositedAmount},${user.lastClaimTime},${user.isActive}`
                )
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `network_tree_${new Date(tree.timestamp).toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            
        } else {
            // صادر کردن به JSON
            const dataStr = JSON.stringify(tree, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `network_tree_${new Date(tree.timestamp).toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        console.log(`✅ درخت شبکه به فرمت ${format.toUpperCase()} صادر شد`);
        
    } catch (error) {
        console.error('❌ خطا در صادر کردن درخت:', error);
    }
};

// تابع پاک کردن درخت استخراج شده
window.clearExtractedTree = function() {
    try {
        localStorage.removeItem('extractedNetworkTree');
        console.log('✅ درخت استخراج شده پاک شد');
    } catch (error) {
        console.error('❌ خطا در پاک کردن درخت:', error);
    }
};

// تابع انتقال درخت به قرارداد جدید
window.transferTreeToNewContract = async function(newContractAddress) {
    try {
        console.log('🚀 شروع انتقال درخت به قرارداد جدید...');
        
        // بررسی وجود درخت استخراج شده
        const extractedData = localStorage.getItem('extractedNetworkTree');
        if (!extractedData) {
            throw new Error('هیچ درخت استخراج شده‌ای یافت نشد. ابتدا درخت را استخراج کنید.');
        }
        
        const tree = JSON.parse(extractedData);
        console.log(`📊 انتقال ${tree.users.length} کاربر به قرارداد جدید...`);
        
        // اتصال به قرارداد جدید
        if (!window.contractConfig || !window.contractConfig.signer) {
            throw new Error('اتصال کیف پول برقرار نیست');
        }
        
        const newContract = new ethers.Contract(
            newContractAddress, 
            window.CPA_ABI, 
            window.contractConfig.signer
        );
        
        // بررسی اتصال به قرارداد جدید
        try {
            await newContract.wallets();
            console.log('✅ اتصال به قرارداد جدید برقرار شد');
        } catch (error) {
            throw new Error('قرارداد جدید معتبر نیست یا اتصال برقرار نشد');
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        // انتقال کاربران به ترتیب (از قدیمی به جدید)
        for (let i = 0; i < tree.users.length; i++) {
            const user = tree.users[i];
            
            try {
                // بررسی اینکه آیا کاربر در قرارداد جدید وجود دارد
                const existingUser = await newContract.users(user.address);
                if (existingUser.address !== '0x0000000000000000000000000000000000000000') {
                    console.log(`⏭️ کاربر ${user.address.slice(0, 10)}... قبلاً در قرارداد جدید وجود دارد`);
                    continue;
                }
                
                // انتقال کاربر به قرارداد جدید
                const tx = await newContract.transferUserFromOldContract(
                    user.address,
                    user.referrer,
                    user.leftChild,
                    user.rightChild,
                    user.level,
                    user.points,
                    user.balance,
                    user.depositedAmount,
                    user.lastClaimTime,
                    user.isActive
                );
                
                await tx.wait();
                successCount++;
                
                console.log(`✅ کاربر ${i + 1}/${tree.users.length} منتقل شد: ${user.address.slice(0, 10)}...`);
                
                // کمی صبر بین تراکنش‌ها
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                errorCount++;
                console.warn(`⚠️ خطا در انتقال کاربر ${user.address.slice(0, 10)}...:`, error.message);
            }
        }
        
        console.log('🎉 انتقال درخت شبکه تکمیل شد!');
        console.log(`📊 آمار انتقال:`);
        console.log(`   ✅ موفق: ${successCount} کاربر`);
        console.log(`   ❌ ناموفق: ${errorCount} کاربر`);
        console.log(`   📋 آدرس قرارداد جدید: ${newContractAddress}`);
        
        return {
            successCount,
            errorCount,
            totalUsers: tree.users.length,
            newContractAddress
        };
        
    } catch (error) {
        console.error('❌ خطا در انتقال درخت:', error);
        throw error;
    }
};

// تابع بررسی آمادگی قرارداد جدید
window.checkNewContractReadiness = async function(newContractAddress) {
    try {
        console.log('🔍 بررسی آمادگی قرارداد جدید...');
        
        if (!window.contractConfig || !window.contractConfig.signer) {
            throw new Error('اتصال کیف پول برقرار نیست');
        }
        
        const newContract = new ethers.Contract(
            newContractAddress, 
            window.CPA_ABI, 
            window.contractConfig.signer
        );
        
        // بررسی توابع مورد نیاز
        const requiredFunctions = [
            'transferUserFromOldContract',
            'users',
            'wallets',
            'indexToAddress'
        ];
        
        const checkResults = {};
        
        for (const funcName of requiredFunctions) {
            try {
                if (typeof newContract[funcName] === 'function') {
                    checkResults[funcName] = '✅ موجود';
                } else {
                    checkResults[funcName] = '❌ موجود نیست';
                }
            } catch (error) {
                checkResults[funcName] = '❌ خطا در بررسی';
            }
        }
        
        console.log('📋 وضعیت توابع قرارداد جدید:');
        Object.entries(checkResults).forEach(([func, status]) => {
            console.log(`   ${func}: ${status}`);
        });
        
        // بررسی تعداد کاربران فعلی
        try {
            const currentWallets = await newContract.wallets();
            console.log(`👥 تعداد کاربران فعلی در قرارداد جدید: ${currentWallets.toString()}`);
        } catch (error) {
            console.warn('⚠️ نتوانست تعداد کاربران را بررسی کند');
        }
        
        return checkResults;
        
    } catch (error) {
        console.error('❌ خطا در بررسی قرارداد جدید:', error);
        throw error;
    }
};

console.log('🌳 دیتابیس درخت شبکه بارگذاری شد');
// حذف پیام‌های راهنما
// console.log('💡 دستورات مفید:');
// console.log('  - window.saveCurrentNetworkTree() - ذخیره درخت فعلی');
// console.log('  - window.getNetworkStats() - نمایش آمار');
// console.log('  - window.exportNetworkData("json") - صادر کردن داده‌ها');
// console.log('  - window.cleanupNetworkData(30) - پاک کردن داده‌های قدیمی');

// دستورات تست برای کنسول
// console.log('🌳 دستورات مفید دیتابیس درخت شبکه:');
// console.log('- window.getNetworkNodes(100) - دریافت 100 گره آخر');
// console.log('- window.getLatestNetworkTree() - دریافت آخرین درخت کامل');
// console.log('- window.getNetworkStats() - آمار دیتابیس');
// console.log('- window.exportNetworkData("json") - صادر کردن داده‌ها');
// console.log('- window.cleanupNetworkData(30) - پاک کردن داده‌های قدیمی');
// console.log('- window.saveCurrentNetworkTree() - ذخیره درخت فعلی');
// console.log('- window.checkNetworkDatabaseStatus() - بررسی وضعیت دیتابیس');
// console.log('- window.testSaveSampleNodes() - تست ذخیره گره‌های نمونه');

// تست اولیه دیتابیس
networkTreeDB.init().then(() => {
    console.log('✅ دیتابیس درخت شبکه آماده است');
}).catch(error => {
    console.error('❌ خطا در راه‌اندازی دیتابیس:', error);
});