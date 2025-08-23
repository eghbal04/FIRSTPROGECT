// Binary Tree Traversal System - سیستم پیمایش درخت باینری
// This file provides efficient methods to traverse the binary tree and find all users

class BinaryTreeTraversal {
  constructor() {
    this.visitedUsers = new Set();
    this.userQueue = [];
    this.isTraversing = false;
    this.traversalProgress = {
      totalFound: 0,
      currentIndex: 0,
      isComplete: false
    };
  }

  // Breadth-First Search (BFS) - سریع‌ترین روش برای پیمایش
  async traverseAllUsersBFS(startIndex = 1, maxDepth = 10) {
    try {
      console.log('🌳 Starting BFS traversal from index:', startIndex);
      
      if (!window.contractConfig || !window.contractConfig.contract) {
        await window.connectWallet();
      }
      
      const contract = window.contractConfig.contract;
      if (!contract) {
        throw new Error('Contract not connected');
      }

      this.isTraversing = true;
      this.visitedUsers.clear();
      this.userQueue = [];
      this.traversalProgress = {
        totalFound: 0,
        currentIndex: 0,
        isComplete: false
      };

      // Start with the root user
      const rootAddress = await contract.indexToAddress(startIndex);
      if (rootAddress === '0x0000000000000000000000000000000000000000') {
        console.log('⚠️ Root user not found, starting from index 1');
        return this.traverseAllUsersBFS(1, maxDepth);
      }

      // Add root to queue
      this.userQueue.push({
        address: rootAddress,
        index: startIndex,
        depth: 0
      });

      const allUsers = [];
      let processedCount = 0;

             while (this.userQueue.length > 0) { // No limit - search all users
        const current = this.userQueue.shift();
        
        if (this.visitedUsers.has(current.address)) {
          continue;
        }

        this.visitedUsers.add(current.address);
        processedCount++;

        try {
          // Get user data
          const userData = await contract.users(current.address);
          
          if (userData && userData.index && BigInt(userData.index) > 0n) {
            allUsers.push({
              address: current.address,
              index: Number(userData.index),
              depth: current.depth,
              userData: userData
            });

            this.traversalProgress.totalFound++;
            
            // Update progress every 10 users
            if (this.traversalProgress.totalFound % 10 === 0) {
              console.log(`📊 Found ${this.traversalProgress.totalFound} users so far...`);
              this.updateTraversalProgress();
            }

                   // Get children without depth limit
       if (current.depth < 50) { // Increased depth limit for comprehensive search
              try {
                const tree = await contract.getUserTree(current.address);
                
                if (tree && tree.left && tree.left !== '0x0000000000000000000000000000000000000000') {
                  this.userQueue.push({
                    address: tree.left,
                    index: null,
                    depth: current.depth + 1
                  });
                }
                
                if (tree && tree.right && tree.right !== '0x0000000000000000000000000000000000000000') {
                  this.userQueue.push({
                    address: tree.right,
                    index: null,
                    depth: current.depth + 1
                  });
                }
              } catch (treeError) {
                console.warn('⚠️ Error getting tree for address:', current.address, treeError);
              }
            }
          }
        } catch (userError) {
          console.warn('⚠️ Error getting user data for address:', current.address, userError);
        }

               // Reduced delay for faster search
       if (processedCount % 10 === 0) {
         await new Promise(resolve => setTimeout(resolve, 50));
       }
      }

      this.isTraversing = false;
      this.traversalProgress.isComplete = true;
      
      console.log(`✅ BFS traversal completed! Found ${allUsers.length} users`);
      
      // Store results in localStorage for caching
      this.cacheTraversalResults(allUsers);
      
      return allUsers;

    } catch (error) {
      console.error('❌ Error in BFS traversal:', error);
      this.isTraversing = false;
      throw error;
    }
  }

  // Depth-First Search (DFS) - برای پیمایش عمیق
  async traverseAllUsersDFS(startIndex = 1, maxDepth = 10) {
    try {
      console.log('🌳 Starting DFS traversal from index:', startIndex);
      
      if (!window.contractConfig || !window.contractConfig.contract) {
        await window.connectWallet();
      }
      
      const contract = window.contractConfig.contract;
      if (!contract) {
        throw new Error('Contract not connected');
      }

      this.isTraversing = true;
      this.visitedUsers.clear();
      this.traversalProgress = {
        totalFound: 0,
        currentIndex: 0,
        isComplete: false
      };

      const allUsers = [];
      
      // Start DFS from root
      const rootAddress = await contract.indexToAddress(startIndex);
      if (rootAddress === '0x0000000000000000000000000000000000000000') {
        console.log('⚠️ Root user not found, starting from index 1');
        return this.traverseAllUsersDFS(1, maxDepth);
      }

      await this.dfsRecursive(rootAddress, 0, maxDepth, contract, allUsers);

      this.isTraversing = false;
      this.traversalProgress.isComplete = true;
      
      console.log(`✅ DFS traversal completed! Found ${allUsers.length} users`);
      
      // Store results in localStorage for caching
      this.cacheTraversalResults(allUsers);
      
      return allUsers;

    } catch (error) {
      console.error('❌ Error in DFS traversal:', error);
      this.isTraversing = false;
      throw error;
    }
  }

  // Recursive DFS helper
  async dfsRecursive(address, depth, maxDepth, contract, allUsers) {
    if (depth > maxDepth || this.visitedUsers.has(address)) {
      return;
    }

    this.visitedUsers.add(address);

    try {
      const userData = await contract.users(address);
      
      if (userData && userData.index && BigInt(userData.index) > 0n) {
        allUsers.push({
          address: address,
          index: Number(userData.index),
          depth: depth,
          userData: userData
        });

        this.traversalProgress.totalFound++;
        
        // Update progress every 10 users
        if (this.traversalProgress.totalFound % 10 === 0) {
          console.log(`📊 Found ${this.traversalProgress.totalFound} users so far...`);
          this.updateTraversalProgress();
        }

                 // Get children without depth limit
         if (depth < 50) { // Increased depth limit for comprehensive search
          try {
            const tree = await contract.getUserTree(address);
            
            if (tree && tree.left && tree.left !== '0x0000000000000000000000000000000000000000') {
              await this.dfsRecursive(tree.left, depth + 1, maxDepth, contract, allUsers);
            }
            
            if (tree && tree.right && tree.right !== '0x0000000000000000000000000000000000000000') {
              await this.dfsRecursive(tree.right, depth + 1, maxDepth, contract, allUsers);
            }
          } catch (treeError) {
            console.warn('⚠️ Error getting tree for address:', address, treeError);
          }
        }
      }
    } catch (userError) {
      console.warn('⚠️ Error getting user data for address:', address, userError);
    }

         // Reduced delay for faster search
     await new Promise(resolve => setTimeout(resolve, 20));
  }

     // Index-based traversal - پیمایش بر اساس ایندکس
   async traverseByIndexRange(startIndex = 1, endIndex = 10000) {
    try {
      console.log(`🔍 Starting index-based traversal from ${startIndex} to ${endIndex}`);
      
      if (!window.contractConfig || !window.contractConfig.contract) {
        await window.connectWallet();
      }
      
      const contract = window.contractConfig.contract;
      if (!contract) {
        throw new Error('Contract not connected');
      }

      this.isTraversing = true;
      this.traversalProgress = {
        totalFound: 0,
        currentIndex: startIndex,
        isComplete: false
      };

      const allUsers = [];
      
      for (let i = startIndex; i <= endIndex; i++) {
        try {
          const address = await contract.indexToAddress(i);
          
          if (address !== '0x0000000000000000000000000000000000000000') {
            const userData = await contract.users(address);
            
            if (userData && userData.index && BigInt(userData.index) > 0n) {
              allUsers.push({
                address: address,
                index: i,
                depth: 0, // Will be calculated later if needed
                userData: userData
              });

              this.traversalProgress.totalFound++;
            }
          }

          this.traversalProgress.currentIndex = i;
          
          // Update progress every 50 indices
          if (i % 50 === 0) {
            console.log(`📊 Processed ${i} indices, found ${this.traversalProgress.totalFound} users`);
            this.updateTraversalProgress();
          }

                     // Reduced delay for faster search
           if (i % 20 === 0) {
             await new Promise(resolve => setTimeout(resolve, 50));
           }

        } catch (error) {
          console.warn(`⚠️ Error processing index ${i}:`, error);
        }
      }

      this.isTraversing = false;
      this.traversalProgress.isComplete = true;
      
      console.log(`✅ Index-based traversal completed! Found ${allUsers.length} users`);
      
      // Store results in localStorage for caching
      this.cacheTraversalResults(allUsers);
      
      return allUsers;

    } catch (error) {
      console.error('❌ Error in index-based traversal:', error);
      this.isTraversing = false;
      throw error;
    }
  }

  // Cache traversal results
  cacheTraversalResults(users) {
    try {
      const cacheData = {
        users: users,
        timestamp: Date.now(),
        totalUsers: users.length
      };
      
      localStorage.setItem('binaryTreeTraversalCache', JSON.stringify(cacheData));
      console.log('💾 Traversal results cached successfully');
    } catch (error) {
      console.warn('⚠️ Error caching traversal results:', error);
    }
  }

  // Get cached traversal results
  getCachedTraversalResults() {
    try {
      const cached = localStorage.getItem('binaryTreeTraversalCache');
      if (cached) {
        const data = JSON.parse(cached);
        const cacheAge = Date.now() - data.timestamp;
        
        // Cache is valid for 1 hour
        if (cacheAge < 3600000) {
          console.log('📋 Using cached traversal results');
          return data.users;
        } else {
          console.log('⏰ Cache expired, will perform new traversal');
          localStorage.removeItem('binaryTreeTraversalCache');
        }
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Error reading cached traversal results:', error);
      return null;
    }
  }

  // Update traversal progress
  updateTraversalProgress() {
    // Dispatch custom event for progress updates
    const event = new CustomEvent('traversalProgress', {
      detail: {
        ...this.traversalProgress,
        isTraversing: this.isTraversing
      }
    });
    document.dispatchEvent(event);
  }

     // Unlimited traversal - no restrictions
   async traverseAllUsersUnlimited(startIndex = 1) {
     try {
       console.log('🚀 Starting unlimited traversal from index:', startIndex);
       
       if (!window.contractConfig || !window.contractConfig.contract) {
         await window.connectWallet();
       }
       
       const contract = window.contractConfig.contract;
       if (!contract) {
         throw new Error('Contract not connected');
       }

       this.isTraversing = true;
       this.visitedUsers.clear();
       this.userQueue = [];
       this.traversalProgress = {
         totalFound: 0,
         currentIndex: 0,
         isComplete: false
       };

       // Start with the root user
       const rootAddress = await contract.indexToAddress(startIndex);
       if (rootAddress === '0x0000000000000000000000000000000000000000') {
         console.log('⚠️ Root user not found, starting from index 1');
         return this.traverseAllUsersUnlimited(1);
       }

       // Add root to queue
       this.userQueue.push({
         address: rootAddress,
         index: startIndex,
         depth: 0
       });

       const allUsers = [];
       let processedCount = 0;

       while (this.userQueue.length > 0) { // No limit at all
         const current = this.userQueue.shift();
         
         if (this.visitedUsers.has(current.address)) {
           continue;
         }

         this.visitedUsers.add(current.address);
         processedCount++;

         try {
           // Get user data
           const userData = await contract.users(current.address);
           
           if (userData && userData.index && BigInt(userData.index) > 0n) {
             allUsers.push({
               address: current.address,
               index: Number(userData.index),
               depth: current.depth,
               userData: userData
             });

             this.traversalProgress.totalFound++;
             
             // Update progress every 20 users
             if (this.traversalProgress.totalFound % 20 === 0) {
               console.log(`📊 Found ${this.traversalProgress.totalFound} users so far...`);
               this.updateTraversalProgress();
             }

             // Get children without any depth limit
             try {
               const tree = await contract.getUserTree(current.address);
               
               if (tree && tree.left && tree.left !== '0x0000000000000000000000000000000000000000') {
                 this.userQueue.push({
                   address: tree.left,
                   index: null,
                   depth: current.depth + 1
                 });
               }
               
               if (tree && tree.right && tree.right !== '0x0000000000000000000000000000000000000000') {
                 this.userQueue.push({
                   address: tree.right,
                   index: null,
                   depth: current.depth + 1
                 });
               }
             } catch (treeError) {
               console.warn('⚠️ Error getting tree for address:', current.address, treeError);
             }
           }
         } catch (userError) {
           console.warn('⚠️ Error getting user data for address:', current.address, userError);
         }

         // Minimal delay for faster search
         if (processedCount % 20 === 0) {
           await new Promise(resolve => setTimeout(resolve, 20));
         }
       }

       this.isTraversing = false;
       this.traversalProgress.isComplete = true;
       
       console.log(`✅ Unlimited traversal completed! Found ${allUsers.length} users`);
       
       // Store results in localStorage for caching
       this.cacheTraversalResults(allUsers);
       
       return allUsers;

     } catch (error) {
       console.error('❌ Error in unlimited traversal:', error);
       this.isTraversing = false;
       throw error;
     }
   }

   // Get all users with voting data
   async getAllUsersWithVotes() {
    try {
      console.log('🎯 Getting all users with voting data...');
      
      // Try to get cached results first
      let users = this.getCachedTraversalResults();
      
      if (!users) {
               // Perform new traversal with unlimited depth
       users = await this.traverseAllUsersBFS(1, 50); // BFS with unlimited depth
      }

      if (!window.contractConfig || !window.contractConfig.contract) {
        await window.connectWallet();
      }
      
      const contract = window.contractConfig.contract;
      if (!contract) {
        throw new Error('Contract not connected');
      }

      // Get voting data for each user
      const usersWithVotes = [];
      
      for (const user of users) {
        try {
          // Get like count for this user
          const likeCount = await contract.getUserLikeCount(user.address);
          
          usersWithVotes.push({
            ...user,
            likeCount: Number(likeCount) || 0
          });

                 // Reduced delay for faster search
       if (usersWithVotes.length % 50 === 0) {
         await new Promise(resolve => setTimeout(resolve, 30));
       }

        } catch (error) {
          console.warn(`⚠️ Error getting votes for user ${user.address}:`, error);
          usersWithVotes.push({
            ...user,
            likeCount: 0
          });
        }
      }

      // Sort by like count (descending)
      usersWithVotes.sort((a, b) => b.likeCount - a.likeCount);
      
      console.log(`✅ Found ${usersWithVotes.length} users with voting data`);
      
      return usersWithVotes;

    } catch (error) {
      console.error('❌ Error getting users with votes:', error);
      throw error;
    }
  }

  // Stop current traversal
  stopTraversal() {
    this.isTraversing = false;
    this.userQueue = [];
    console.log('⏹️ Traversal stopped by user');
  }

  // Get traversal status
  getTraversalStatus() {
    return {
      isTraversing: this.isTraversing,
      progress: this.traversalProgress,
      visitedCount: this.visitedUsers.size,
      queueLength: this.userQueue.length
    };
  }
}

// Create global instance
window.binaryTreeTraversal = new BinaryTreeTraversal();

// Export for use in other files
window.BinaryTreeTraversal = BinaryTreeTraversal;

// Helper functions for easy access
  window.traverseAllUsers = async (method = 'bfs', startIndex = 1, maxDepth = 50) => {
   try {
     switch (method.toLowerCase()) {
       case 'bfs':
         return await window.binaryTreeTraversal.traverseAllUsersBFS(startIndex, maxDepth);
       case 'dfs':
         return await window.binaryTreeTraversal.traverseAllUsersDFS(startIndex, maxDepth);
       case 'index':
         return await window.binaryTreeTraversal.traverseByIndexRange(startIndex, startIndex + 9999);
       case 'unlimited':
         return await window.binaryTreeTraversal.traverseAllUsersUnlimited(startIndex);
       default:
         return await window.binaryTreeTraversal.traverseAllUsersBFS(startIndex, maxDepth);
     }
   } catch (error) {
     console.error('❌ Error in traverseAllUsers:', error);
     throw error;
   }
 };

window.getAllUsersWithVotes = async () => {
  return await window.binaryTreeTraversal.getAllUsersWithVotes();
};

window.stopTraversal = () => {
  window.binaryTreeTraversal.stopTraversal();
};

window.getTraversalStatus = () => {
  return window.binaryTreeTraversal.getTraversalStatus();
};

console.log('✅ Binary Tree Traversal System loaded successfully');
