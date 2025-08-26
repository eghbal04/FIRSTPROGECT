// JavaScript file for managing user information in network
window.UserInfoModal = class UserInfoModal {
    constructor() {
        this.initModal();
        this.bindEvents();
    }

    initModal() {
        const modal = document.createElement('div');
        modal.className = 'user-info-modal';
        modal.innerHTML = `
            <div class="user-info-header">
                <h3 class="user-info-title">User Information</h3>
                <button class="close-button">&times;</button>
            </div>
            <div class="user-info-content">
                <div class="info-group">
                    <div class="info-label">User ID</div>
                    <div class="info-value" id="userId">-</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Wallet Address</div>
                    <div class="info-value" id="userWallet">-</div>
                </div>
                <div class="info-group">
                    <div class="info-label">User Type</div>
                    <div class="info-value" id="userType">-</div>
                </div>
                <div class="user-stats">
                    <div class="stat-item">
                        <div class="stat-value" id="userBalance">0</div>
                        <div class="stat-label">Balance</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="userReferrals">0</div>
                        <div class="stat-label">Referrals</div>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="action-button" onclick="showUserTransactions()">Transactions</button>
                    <button class="action-button" onclick="showUserNetwork()">Network</button>
                </div>
            </div>
        `;

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        document.body.appendChild(modal);
        document.body.appendChild(backdrop);

        this.modal = modal;
        this.backdrop = backdrop;
    }

    bindEvents() {
        const closeButton = this.modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => this.hide());
        this.backdrop.addEventListener('click', () => this.hide());

        // Touch events for mobile
        let startY = 0;
        let currentY = 0;

        this.modal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            this.modal.style.transition = 'none';
        });

        this.modal.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 0) { // Only allow downward swipe
                this.modal.style.transform = `translateY(${deltaY}px)`;
            }
        });

        this.modal.addEventListener('touchend', () => {
            this.modal.style.transition = 'transform 0.15s ease-in-out';
            if (currentY - startY > 100) { // If swiped down more than 100px
                this.hide();
            } else {
                this.modal.style.transform = '';
            }
        });
    }

    async show(nodeData) {
        this.modal.querySelector('.user-info-content').innerHTML = '<div class="loading-spinner"></div>';
        this.modal.classList.add('active');
        this.backdrop.classList.add('active');

        try {
            await this.loadUserInfo(nodeData);
        } catch (error) {
            this.showError();
        }
    }

    hide() {
        this.modal.classList.remove('active');
        this.backdrop.classList.remove('active');
        setTimeout(() => {
            this.modal.style.transform = '';
        }, 150);
    }

    async loadUserInfo(nodeData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 250));

        document.getElementById('userId').textContent = `IAM${String(nodeData.id).padStart(5, '0')}`;
        document.getElementById('userWallet').textContent = this.formatAddress(nodeData.wallet);
        document.getElementById('userType').textContent = this.getUserType(nodeData.type);
        document.getElementById('userBalance').textContent = this.formatNumber(nodeData.balance);
        document.getElementById('userReferrals').textContent = nodeData.referrals || '0';
    }

    showError() {
        this.modal.querySelector('.user-info-content').innerHTML = `
            <div class="error-state">
                Error loading user information
                <br>
                Please try again
            </div>
        `;
    }

    formatAddress(address) {
        if (!address) return '-';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num || 0);
    }

    getUserType(type) {
        const types = {
            1: 'Regular User',
            2: 'Premium User',
            3: 'Admin'
        };
        return types[type] || 'Unknown';
    }
}

// Initialize
let userInfoModal;
document.addEventListener('DOMContentLoaded', () => {
    userInfoModal = new UserInfoModal();
    window.userInfoModal = userInfoModal;
    
    // Add click listeners to network nodes
    document.querySelectorAll('.network-node').forEach(node => {
        node.addEventListener('click', (e) => {
            const nodeData = JSON.parse(node.dataset.info || '{}');
            userInfoModal.show(nodeData);
        });
    });
});
