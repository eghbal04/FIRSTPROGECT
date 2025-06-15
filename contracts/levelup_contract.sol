// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract levelup is IERC20 , ReentrancyGuard
{
    string public constant name = "lvl Token";
    string public constant symbol = "LVLUP";
    uint8 public constant decimals = 18;

    IERC20 public immutable usdcToken;
    address public immutable deployer;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    struct User 
    {
        uint256 index;      // موقعیت در درخت
        uint256 leftChild;
        uint256 rightChild;
        uint256 parent;
        address referrer;
        address left;
        address right;
        uint256 binaryPoints;
        uint256 binaryPointCap;
        uint256 binaryPointsClaimed;
        bool activated;
        uint256 totalPurchasedUSDC;
    }
    mapping(address => User) public users;
    mapping(uint256 => address) public indexToAddress;
    mapping(address => bool) public registered;
  
    uint256 public totalUsers;
    uint256 public binaryPool;      // USDC in binary pool
    uint256 public backingPool;     // USDC in backing pool

    uint256 public constant MIN_ACTIVATION_USDC = 100 * 10**6; // 100 USDC with 6 decimals
    uint256 public constant BINARY_POOL_SHARE = 70;  // %
    uint256 public constant BACKING_POOL_SHARE = 30; // %

    uint256 public constant REFERRAL_FEE_PERCENT = 1;
    uint256 public constant BACKING_FEE_PERCENT = 2;
    uint256 public lastClaimTime=block.timestamp;
    uint256 public totalClaimableBinaryPoints;
    uint256 public maxcap=100;
    uint256 public tokenprice;
  
    // Events
    event Activated(address indexed user, uint256 amountUSDC);
    event BinaryRewardClaimed(address indexed user, uint256 rewardTokens);
    event TokensBought(address indexed buyer, uint256 usdcAmount, uint256 tokenAmount);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 usdcAmount);

    // === ERC20 Implementation ===
    function totalSupply() external view override returns (uint256) 
    {
        return _totalSupply;
    }
    function balanceOf(address account) external view override returns (uint256) 
    {
        return _balances[account];
    }
    function allowance(address owner, address spender) external view override returns (uint256) 
    {
        return _allowances[owner][spender];
    }
    function approve(address spender, uint256 amount) external override returns (bool) 
    {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    function transfer(address to, uint256 amount) external override returns (bool) 
    {
        _transfer(msg.sender, to, amount);
        return true;
    }
    function transferFrom(address from, address to, uint256 amount) external override returns (bool) 
    {
        uint256 allowed = _allowances[from][msg.sender];
        require(allowed >= amount, "ERC20: allowance too low");
        _allowances[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal 
    {
        require(to != address(0), "ERC20: transfer to zero");
        uint256 balance = _balances[from];
        require(balance >= amount, "ERC20: insufficient balance");
        _balances[from] = balance - amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal 
    {
        require(to != address(0), "ERC20: mint to zero");
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal 
    {
        uint256 balance = _balances[from];
        require(balance >= amount, "ERC20: burn exceeds balance");
        _balances[from] = balance - amount;
        _totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function estimateBuy(uint256 usdcAmount) public view returns (uint256) 
    {
        return _usdcToTokens(usdcAmount);
    }

    function estimateSell(uint256 tokenAmount) public view returns (uint256) 
    {
            return _tokensToUsdc(tokenAmount);
    }

    // === Constructor ===
    constructor(IERC20 _usdcToken) 
    {
        usdcToken = _usdcToken;
        deployer = msg.sender;
        users[deployer].referrer=deployer;
    }
 
    function updatetoken() public returns (uint256) {
        tokenprice=_getTokenPrice();
        return tokenprice;

    }

    // === Token price and conversion ===
    function _getTokenPrice() internal view returns (uint256) 
    {
        if(_totalSupply == 0) {
            // Initial price: 0.0001 USDC with 6 decimals = 1000
            return 1000;
        }
        // price = backingPool / totalSupply (adjust decimals)
        return (backingPool * 10**18) / _totalSupply / 10**12;
    }

    function _usdcToTokens(uint256 usdcAmount) internal view returns (uint256) 
    {
        uint256 price = _getTokenPrice();
        require(price > 0, "Price is zero");
        return (usdcAmount * 10**18) / price;
    }

    function _tokensToUsdc(uint256 tokenAmount) internal view returns (uint256) 
    {
        uint256 price = _getTokenPrice();
        require(price > 0, "Price is zero");
        return (tokenAmount * price) / 10**18;
    }
            // ثبت‌نام + فعال‌سازی یکجا

    // === Buy tokens ===
    function buyTokens(uint256 usdcAmount) external nonReentrant
    {
        updatetoken();
       require(usdcToken.balanceOf(msg.sender) >= usdcAmount, "Not enough USDC balance");
        User storage user = users[msg.sender];
        require(usdcToken.allowance(msg.sender, address(this)) >= usdcAmount, "USDC allowance too low");
        bool success = usdcToken.transferFrom(msg.sender, address(this), usdcAmount);
        require(success, "USDC transfer failed");

        uint256 referralFee = (usdcAmount * REFERRAL_FEE_PERCENT) / 100;
        uint256 backingFee = (usdcAmount * BACKING_FEE_PERCENT) / 100;
        uint256 netUSDC = usdcAmount - referralFee - backingFee;

        // Update backingPool
        backingPool += backingFee;

        // Mint referral tokens
        uint256 referralTokens = _usdcToTokens(referralFee);
        _mint(user.referrer, referralTokens);
       
        // Mint buyer tokens for net USDC
        uint256 buyerTokens = _usdcToTokens(netUSDC);
        _mint(msg.sender, buyerTokens);

        user.totalPurchasedUSDC += usdcAmount;
        updatetoken();
        emit TokensBought(msg.sender, usdcAmount, buyerTokens);
    }

    // === Sell tokens ===
    function sellTokens(uint256 tokenAmount) external nonReentrant
    {
        updatetoken();
        require(tokenAmount > 0, "Amount zero");
        User storage user = users[msg.sender];
        require(_balances[msg.sender] >= tokenAmount, "Insufficient balance");

        uint256 usdcValue = _tokensToUsdc(tokenAmount);
        uint256 referralFee = (usdcValue * REFERRAL_FEE_PERCENT) / 100;
        uint256 backingFee = (usdcValue * BACKING_FEE_PERCENT) / 100;
        uint256 netUSDC = usdcValue - referralFee - backingFee;

        // Burn tokens from seller
        _burn(msg.sender, tokenAmount);

        // Update pools
        backingPool += backingFee;

        // Pay referral tokens as lvl minted
        uint256 referralTokens = _usdcToTokens(referralFee);
        _mint(user.referrer, referralTokens);

        // Pay USDC to seller
        bool success = usdcToken.transfer(msg.sender, netUSDC);
        require(success, "USDC transfer failed");
        updatetoken();
        emit TokensSold(msg.sender, tokenAmount, netUSDC);
    }

    function depositUSDC(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");
    }

    // === Binary reward calculation and claim ===
   
    function increaseBinaryPointCap(uint256 tokenAmount) external 
    {
        require(tokenAmount > 0, "Amount zero");
        User storage user = users[msg.sender];
        require(user.activated, "Not activated");
        require(_balances[msg.sender] >= tokenAmount, "Insufficient lvl tokens");

        uint256 usdcValue = _tokensToUsdc(tokenAmount);
        require(usdcValue >= MIN_ACTIVATION_USDC, "Min 100 USDC equivalent");

        // Transfer lvl tokens to contract and burn
        _burn(msg.sender, tokenAmount);

        // Allocate 70% of usdcValue to binary pool
        uint256 binaryIncrease = (usdcValue * 70) / 100;
        binaryPool += binaryIncrease;

        // Mint 30% equivalent tokens to deployer
        uint256 deployerTokens = _usdcToTokens((usdcValue * 30) / 100);
        _mint(deployer, deployerTokens);

        // Increase user's binary cap: 1 point per 50 USDC, max 100 points
        uint256 pointsToAdd = usdcValue / (50 * 10**6);
        uint256 newCap = user.binaryPointCap + pointsToAdd;
        if(newCap > 100) newCap = 100;

        // Update total claimable points accordingly
        if(newCap > user.binaryPointCap){
            totalClaimableBinaryPoints += (newCap - user.binaryPointCap);
            user.binaryPointCap = newCap;
        }
    }

    function claimBinaryReward() external 
    {
        User storage user = users[msg.sender];
        require(user.activated, "Not activated");
        require(block.timestamp - lastClaimTime >= 12 hours, "Can only claim once per 12 hours !");   
        uint256 unclaimedPoints = user.binaryPoints - user.binaryPointsClaimed;
        require(unclaimedPoints > 0, "No unclaimed points");

        // Daily cap is 10 points
        uint256 claimableToday = unclaimedPoints > user.binaryPointCap ? user.binaryPointCap : unclaimedPoints;

        require(totalClaimableBinaryPoints > 0, "No claimable points");
        uint256 pointValue = binaryPool / totalClaimableBinaryPoints;

        uint256 rewardTokens = pointValue * claimableToday;

        // Mint reward tokens to user
        _mint(msg.sender, rewardTokens);

        // Update user claimed points and global stats
        user.binaryPointsClaimed += claimableToday;
        totalClaimableBinaryPoints -= claimableToday;
        binaryPool -= rewardTokens;
        // Remove any excess points beyond their binary cap
        if (user.binaryPoints > user.binaryPointCap) {
            uint256 excess = user.binaryPoints - user.binaryPointCap;
            user.binaryPoints -= excess;
        }

        emit BinaryRewardClaimed(msg.sender, rewardTokens);
    }
    function registerAndActivate(address referrer, uint256 usdcAmount) external 
    {
        // --- بررسی شرایط ثبت‌نام ---
        require(referrer != address(0) && referrer != msg.sender, "Invalid referrer");
        require(users[referrer].activated, "Referrer not registered");
        require(!users[msg.sender].activated, "Already registered");
        require(usdcAmount >= MIN_ACTIVATION_USDC, "Min 100 USDC required");

        // --- انتقال USDC ---
        bool success = usdcToken.transferFrom(msg.sender, address(this), usdcAmount);
        require(success, "USDC transfer failed");

        // --- تقسیم وجوه ---
        uint256 binaryShare = (usdcAmount * BINARY_POOL_SHARE) / 100; // 70%
        uint256 backingShare = (usdcAmount * BACKING_POOL_SHARE) / 100; // 30%
        binaryPool += binaryShare;
        backingPool += backingShare;

        // --- تخصیص اندیس و ثبت اطلاعات ---
        totalUsers++;
        uint256 newIndex = totalUsers;

        User storage newUser = users[msg.sender];
        newUser.index = newIndex;
        newUser.activated = true;
        newUser.referrer = referrer;
        newUser.binaryPointCap = 10;
        newUser.totalPurchasedUSDC = usdcAmount;

        indexToAddress[newIndex] = msg.sender;
        registered[msg.sender] = true;

        // --- جایگذاری هوشمند در درخت باینری ---
        if (totalUsers == 1) {
            // اولین کاربر، بدون والد
            newUser.parent = 0;
        } else {
            uint256 parentIndex = findDeepestLeafFromSmallerSide(1); // از سطح ۱ به پایین
            User storage parent = users[indexToAddress[parentIndex]];
            newUser.parent = parentIndex;

            if (parent.leftChild == 0) {
                parent.leftChild = newIndex;
                parent.left = msg.sender;
            } else {
                parent.rightChild = newIndex;
                parent.right = msg.sender;
            }
        }

        // --- پاداش‌ها ---
        uint256 referralReward = (usdcAmount * REFERRAL_FEE_PERCENT) / 100;
        _mint(referrer, _usdcToTokens(referralReward)); // پاداش معرف

        uint256 deployerReward = (usdcAmount * 30) / 100;
        _mint(deployer, _usdcToTokens(deployerReward)); // پاداش توسعه‌دهنده

        emit Activated(msg.sender, usdcAmount);
    }
    function countSubtreeUsers(uint256 index) public view returns (uint256) 
    {
        if (index == 0 || indexToAddress[index] == address(0)) return 0;
        User storage u = users[indexToAddress[index]];
        return 1 + countSubtreeUsers(u.leftChild) + countSubtreeUsers(u.rightChild);
    }

    function findDeepestLeafFromSmallerSide(uint256 rootIndex) public view returns (uint256 refrrer) 
    {
        User storage rootUser = users[indexToAddress[rootIndex]];
        require(rootUser.leftChild != 0 && rootUser.rightChild != 0, "Level 1 must be full");

        uint256 leftCount = countSubtreeUsers(rootUser.leftChild);
        uint256 rightCount = countSubtreeUsers(rootUser.rightChild);
        uint256 current = leftCount <= rightCount ? rootUser.leftChild : rootUser.rightChild;

        while (true)
        {
            User storage u = users[indexToAddress[current]];

            if (u.leftChild == 0 && u.rightChild == 0) 
            {
                return current;
            }

            uint256 l = u.leftChild != 0 ? countSubtreeUsers(u.leftChild) : 0;
            uint256 r = u.rightChild != 0 ? countSubtreeUsers(u.rightChild) : 0;

            if (l >= r && u.leftChild != 0) 
            {
                current = u.leftChild;
            } 
            else if (u.rightChild != 0) 
            {
                current = u.rightChild;
            } 
            else 
            {
                current = u.leftChild;
            }
        }   
    }
}