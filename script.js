// Farm Diary Application
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('farmDiaryUsers')) || {};
        this.init();
    }

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentFarmUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        } else {
            this.showAuthScreen();
        }

        this.setupAuthListeners();
    }

    setupAuthListeners() {
        document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupFormElement').addEventListener('submit', (e) => this.handleSignup(e));
    }

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.toLowerCase();
        const password = document.getElementById('loginPassword').value;

        if (this.users[email] && this.users[email].password === password) {
            this.currentUser = this.users[email];
            localStorage.setItem('currentFarmUser', JSON.stringify(this.currentUser));
            this.showMainApp();
        } else {
            alert('Invalid email or password. Please try again.');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value.toLowerCase();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const location = document.getElementById('farmLocation').value || 'Ghana';

        // Validation
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        if (this.users[email]) {
            alert('An account with this email already exists. Please use a different email or sign in.');
            return;
        }

        // Create new user
        const newUser = {
            name: name,
            email: email,
            password: password,
            location: location,
            createdAt: new Date().toISOString()
        };

        this.users[email] = newUser;
        this.currentUser = newUser;
        
        // Save to localStorage
        localStorage.setItem('farmDiaryUsers', JSON.stringify(this.users));
        localStorage.setItem('currentFarmUser', JSON.stringify(this.currentUser));
        
        this.showMainApp();
    }

    showAuthScreen() {
        document.getElementById('authContainer').style.display = 'flex';
        document.querySelector('.container').classList.remove('authenticated');
    }

    showMainApp() {
        document.getElementById('authContainer').style.display = 'none';
        document.querySelector('.container').classList.add('authenticated');
        
        // Update user info in header
        document.getElementById('userName').textContent = `Welcome, ${this.currentUser.name}!`;
        document.getElementById('userLocation').textContent = this.currentUser.location;
        
        // Initialize farm diary with user-specific data
        if (window.farmDiary) {
            window.farmDiary.loadUserData();
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentFarmUser');
        this.showAuthScreen();
        
        // Reset forms
        document.getElementById('loginFormElement').reset();
        document.getElementById('signupFormElement').reset();
        
        // Clear farm diary data from memory
        if (window.farmDiary) {
            window.farmDiary.clearData();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

class FarmDiary {
    constructor() {
        this.authManager = new AuthManager();
        this.activities = [];
        this.crops = [];
        this.weather = [];
        this.expenses = [];
        this.sales = [];
        this.supportRequests = [];
        
        this.init();
    }

    loadUserData() {
        const user = this.authManager.getCurrentUser();
        if (user) {
            const userKey = user.email;
            this.activities = JSON.parse(localStorage.getItem(`farmActivities_${userKey}`)) || [];
            this.crops = JSON.parse(localStorage.getItem(`farmCrops_${userKey}`)) || [];
            this.weather = JSON.parse(localStorage.getItem(`farmWeather_${userKey}`)) || [];
            this.expenses = JSON.parse(localStorage.getItem(`farmExpenses_${userKey}`)) || [];
            this.sales = JSON.parse(localStorage.getItem(`farmSales_${userKey}`)) || [];
            this.supportRequests = JSON.parse(localStorage.getItem(`farmSupport_${userKey}`)) || [];
            this.renderAll();
            this.populateYearSelector();
        }
    }

    clearData() {
        this.activities = [];
        this.crops = [];
        this.weather = [];
        this.expenses = [];
        this.sales = [];
        this.supportRequests = [];
        this.renderAll();
    }

    init() {
        this.updateCurrentDate();
        this.setupEventListeners();
        
        // Only render if user is authenticated
        if (this.authManager.getCurrentUser()) {
            this.loadUserData();
        }
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submissions
        document.getElementById('activityForm').addEventListener('submit', (e) => this.handleActivitySubmit(e));
        document.getElementById('cropForm').addEventListener('submit', (e) => this.handleCropSubmit(e));
        document.getElementById('weatherForm').addEventListener('submit', (e) => this.handleWeatherSubmit(e));
        document.getElementById('expenseForm').addEventListener('submit', (e) => this.handleExpenseSubmit(e));
        document.getElementById('salesForm').addEventListener('submit', (e) => this.handleSalesSubmit(e));
        document.getElementById('supportForm').addEventListener('submit', (e) => this.handleSupportSubmit(e));

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('activityDate').value = today;
        document.getElementById('weatherDate').value = today;
        document.getElementById('expenseDate').value = today;
        document.getElementById('saleDate').value = today;
        document.getElementById('plantingDate').value = today;
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    }

    // Activity Methods
    handleActivitySubmit(e) {
        e.preventDefault();
        
        const activity = {
            id: Date.now(),
            date: document.getElementById('activityDate').value,
            type: document.getElementById('activityType').value,
            description: document.getElementById('activityDescription').value,
            duration: parseFloat(document.getElementById('activityDuration').value) || 0,
            timestamp: new Date().toISOString()
        };

        this.activities.unshift(activity);
        this.saveActivities();
        this.renderActivities();
        this.closeModal('activityModal');
        this.resetForm('activityForm');
    }

    renderActivities() {
        const container = document.getElementById('activitiesList');
        
        if (this.activities.length === 0) {
            container.innerHTML = this.getEmptyState('📝', 'No activities recorded yet', 'Start logging your daily farm activities');
            return;
        }

        container.innerHTML = this.activities.map(activity => `
            <div class="activity-card">
                <div class="card-header">
                    <div>
                        <div class="activity-type">${this.formatActivityType(activity.type)}</div>
                        <div class="card-title">${activity.description || 'No description'}</div>
                    </div>
                    <div class="card-date">${this.formatDate(activity.date)}</div>
                </div>
                <div class="card-meta">
                    ${activity.duration > 0 ? `<span>⏱️ ${activity.duration} hours</span>` : ''}
                    <span>📅 ${this.formatDate(activity.date)}</span>
                </div>
                <button class="btn btn-danger" onclick="farmDiary.deleteActivity(${activity.id})" style="margin-top: 12px; padding: 6px 12px; font-size: 0.8rem;">Delete</button>
            </div>
        `).join('');
    }

    deleteActivity(id) {
        if (confirm('Are you sure you want to delete this activity?')) {
            this.activities = this.activities.filter(activity => activity.id !== id);
            this.saveActivities();
            this.renderActivities();
        }
    }

    // Crop Methods
    handleCropSubmit(e) {
        e.preventDefault();
        
        const crop = {
            id: Date.now(),
            name: document.getElementById('cropName').value,
            variety: document.getElementById('cropVariety').value,
            plantingDate: document.getElementById('plantingDate').value,
            expectedHarvest: document.getElementById('expectedHarvest').value,
            expectedYield: parseFloat(document.getElementById('expectedYield').value) || 0,
            yieldUnit: document.getElementById('yieldUnit').value,
            area: parseFloat(document.getElementById('cropArea').value) || 0,
            actualYield: parseFloat(document.getElementById('actualYield').value) || 0,
            notes: document.getElementById('cropNotes').value,
            status: 'planted',
            timestamp: new Date().toISOString()
        };

        this.crops.unshift(crop);
        this.saveCrops();
        this.renderCrops();
        this.closeModal('cropModal');
        this.resetForm('cropForm');
    }

    renderCrops() {
        const container = document.getElementById('cropsGrid');
        
        if (this.crops.length === 0) {
            container.innerHTML = this.getEmptyState('🌱', 'No crops recorded yet', 'Start tracking your crops and planting schedules');
            return;
        }

        container.innerHTML = this.crops.map(crop => `
            <div class="crop-card">
                <div class="card-header">
                    <div>
                        <div class="crop-status ${this.getCropStatusClass(crop)}">${this.getCropStatus(crop)}</div>
                        <div class="card-title">${crop.name}</div>
                        ${crop.variety ? `<div style="color: #6b7280; font-size: 0.9rem;">${crop.variety}</div>` : ''}
                    </div>
                </div>
                <div class="card-content">
                    ${crop.notes ? `<p style="margin-bottom: 8px;">${crop.notes}</p>` : ''}
                </div>
                <div class="card-meta">
                    <span>📅 Planted: ${this.formatDate(crop.plantingDate)}</span>
                    ${crop.expectedHarvest ? `<span>🗓️ Expected: ${this.formatDate(crop.expectedHarvest)}</span>` : ''}
                    ${crop.area > 0 ? `<span>📏 ${crop.area} acres</span>` : ''}
                </div>
                <button class="btn btn-danger" onclick="farmDiary.deleteCrop(${crop.id})" style="margin-top: 12px; padding: 6px 12px; font-size: 0.8rem;">Delete</button>
            </div>
        `).join('');
    }

    getCropStatus(crop) {
        const now = new Date();
        const plantingDate = new Date(crop.plantingDate);
        const expectedHarvest = crop.expectedHarvest ? new Date(crop.expectedHarvest) : null;

        if (expectedHarvest && now >= expectedHarvest) {
            return 'Ready to Harvest';
        } else if (expectedHarvest && now >= plantingDate) {
            return 'Growing';
        } else {
            return 'Planted';
        }
    }

    getCropStatusClass(crop) {
        const status = this.getCropStatus(crop).toLowerCase();
        if (status.includes('ready')) return 'status-ready';
        if (status.includes('growing')) return 'status-growing';
        return 'status-planted';
    }

    deleteCrop(id) {
        if (confirm('Are you sure you want to delete this crop?')) {
            this.crops = this.crops.filter(crop => crop.id !== id);
            this.saveCrops();
            this.renderCrops();
        }
    }

    // Weather Methods
    handleWeatherSubmit(e) {
        e.preventDefault();
        
        const weather = {
            id: Date.now(),
            date: document.getElementById('weatherDate').value,
            condition: document.getElementById('weatherCondition').value,
            temperature: parseFloat(document.getElementById('temperature').value) || null,
            rainfall: parseFloat(document.getElementById('rainfall').value) || 0,
            notes: document.getElementById('weatherNotes').value,
            timestamp: new Date().toISOString()
        };

        this.weather.unshift(weather);
        this.saveWeather();
        this.renderWeather();
        this.closeModal('weatherModal');
        this.resetForm('weatherForm');
    }

    renderWeather() {
        const container = document.getElementById('weatherList');
        
        if (this.weather.length === 0) {
            container.innerHTML = this.getEmptyState('🌤️', 'No weather data recorded yet', 'Start logging daily weather conditions');
            return;
        }

        container.innerHTML = this.weather.map(weather => `
            <div class="weather-card">
                <div class="card-header">
                    <div>
                        <div class="weather-condition">${this.getWeatherEmoji(weather.condition)} ${this.formatWeatherCondition(weather.condition)}</div>
                    </div>
                    <div class="card-date">${this.formatDate(weather.date)}</div>
                </div>
                <div class="weather-details">
                    ${weather.temperature !== null ? `
                        <div class="weather-detail">
                            <div class="weather-detail-label">Temperature</div>
                            <div class="weather-detail-value">${weather.temperature}°C</div>
                        </div>
                    ` : ''}
                    <div class="weather-detail">
                        <div class="weather-detail-label">Rainfall</div>
                        <div class="weather-detail-value">${weather.rainfall}mm</div>
                    </div>
                </div>
                ${weather.notes ? `<div class="card-content" style="margin-top: 12px;">${weather.notes}</div>` : ''}
                <button class="btn btn-danger" onclick="farmDiary.deleteWeather(${weather.id})" style="margin-top: 12px; padding: 6px 12px; font-size: 0.8rem;">Delete</button>
            </div>
        `).join('');
    }

    getWeatherEmoji(condition) {
        const emojis = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️',
            stormy: '⛈️',
            foggy: '🌫️'
        };
        return emojis[condition] || '🌤️';
    }

    formatWeatherCondition(condition) {
        return condition.charAt(0).toUpperCase() + condition.slice(1);
    }

    deleteWeather(id) {
        if (confirm('Are you sure you want to delete this weather record?')) {
            this.weather = this.weather.filter(weather => weather.id !== id);
            this.saveWeather();
            this.renderWeather();
        }
    }

    // Expense Methods
    handleExpenseSubmit(e) {
        e.preventDefault();
        
        const expense = {
            id: Date.now(),
            date: document.getElementById('expenseDate').value,
            category: document.getElementById('expenseCategory').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            description: document.getElementById('expenseDescription').value,
            timestamp: new Date().toISOString()
        };

        this.expenses.unshift(expense);
        this.saveExpenses();
        this.renderExpenses();
        this.updateExpenseSummary();
        this.closeModal('expenseModal');
        this.resetForm('expenseForm');
    }

    renderExpenses() {
        const container = document.getElementById('expensesList');
        
        if (this.expenses.length === 0) {
            container.innerHTML = this.getEmptyState('💰', 'No expenses recorded yet', 'Start tracking your farm expenses and costs');
            return;
        }

        container.innerHTML = this.expenses.map(expense => `
            <div class="expense-card">
                <div class="card-header">
                    <div>
                        <div class="expense-category">${this.formatExpenseCategory(expense.category)}</div>
                        <div class="card-title">${expense.description || 'No description'}</div>
                    </div>
                    <div class="expense-amount">GH₵ ${expense.amount.toFixed(2)}</div>
                </div>
                <div class="card-meta">
                    <span>📅 ${this.formatDate(expense.date)}</span>
                </div>
                <button class="btn btn-danger" onclick="farmDiary.deleteExpense(${expense.id})" style="margin-top: 12px; padding: 6px 12px; font-size: 0.8rem;">Delete</button>
            </div>
        `).join('');
    }

    updateExpenseSummary() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTotal = this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((total, expense) => total + expense.amount, 0);

        document.getElementById('monthlyTotal').textContent = `GH₵ ${monthlyTotal.toFixed(2)}`;
    }

    formatExpenseCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveExpenses();
            this.renderExpenses();
            this.updateExpenseSummary();
        }
    }

    // Sales Methods
    handleSalesSubmit(e) {
        e.preventDefault();
        
        try {
            const cropId = document.getElementById('saleCrop').value;
            const quantity = parseFloat(document.getElementById('saleQuantity').value);
            const unit = document.getElementById('saleUnit').value;
            const pricePerUnit = parseFloat(document.getElementById('salePrice').value);
            const buyer = document.getElementById('saleBuyer').value;
            const notes = document.getElementById('saleNotes').value;
            const date = document.getElementById('saleDate').value;

            // Validation
            if (!cropId || !quantity || !unit || !pricePerUnit || !date) {
                alert('Please fill in all required fields');
                return;
            }

            const totalAmount = quantity * pricePerUnit;

            const sale = {
                id: Date.now(),
                cropId: cropId,
                date: date,
                quantity: quantity,
                unit: unit,
                pricePerUnit: pricePerUnit,
                totalAmount: totalAmount,
                buyer: buyer,
                notes: notes,
                timestamp: new Date().toISOString()
            };

            this.sales.unshift(sale);
            this.saveSales();
            this.renderSales();
            this.updateSalesSummary();
            this.closeModal('salesModal');
            this.resetForm('salesForm');
            
            alert('Sale recorded successfully!');
        } catch (error) {
            console.error('Error saving sale:', error);
            alert('Error saving sale. Please try again.');
        }
    }

    renderSales() {
        const container = document.getElementById('salesList');
        
        if (this.sales.length === 0) {
            container.innerHTML = this.getEmptyState('💵', 'No sales recorded yet', 'Start recording your crop sales and income');
            return;
        }

        container.innerHTML = this.sales.map(sale => {
            const crop = this.crops.find(c => c.id == sale.cropId);
            const cropName = crop ? crop.name : 'Unknown Crop';
            
            return `
                <div class="sale-card">
                    <div class="card-header">
                        <div>
                            <div class="sale-crop">${cropName}</div>
                            <div class="card-title">${sale.quantity} ${sale.unit} @ GH₵ ${sale.pricePerUnit.toFixed(2)}</div>
                        </div>
                        <div class="sale-amount">GH₵ ${sale.totalAmount.toFixed(2)}</div>
                    </div>
                    <div class="card-content">
                        ${sale.buyer ? `<p><strong>Buyer:</strong> ${sale.buyer}</p>` : ''}
                        ${sale.notes ? `<p>${sale.notes}</p>` : ''}
                    </div>
                    <div class="card-meta">
                        <span>📅 ${this.formatDate(sale.date)}</span>
                    </div>
                    <button class="btn btn-danger" onclick="farmDiary.deleteSale(${sale.id})" style="margin-top: 12px; padding: 6px 12px; font-size: 0.8rem;">Delete</button>
                </div>
            `;
        }).join('');
    }

    updateSalesSummary() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTotal = this.sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            })
            .reduce((total, sale) => total + sale.totalAmount, 0);

        const monthlySalesElement = document.getElementById('monthlySalesTotal');
        if (monthlySalesElement) {
            monthlySalesElement.textContent = `GH₵ ${monthlyTotal.toFixed(2)}`;
        }
    }

    deleteSale(id) {
        if (confirm('Are you sure you want to delete this sale?')) {
            this.sales = this.sales.filter(sale => sale.id !== id);
            this.saveSales();
            this.renderSales();
            this.updateSalesSummary();
        }
    }

    populateCropOptions() {
        const cropSelect = document.getElementById('saleCrop');
        cropSelect.innerHTML = '<option value="">Select a crop</option>';
        
        this.crops.forEach(crop => {
            const option = document.createElement('option');
            option.value = crop.id;
            option.textContent = `${crop.name}${crop.variety ? ` (${crop.variety})` : ''}`;
            cropSelect.appendChild(option);
        });
    }

    // Support Methods
    handleSupportSubmit(e) {
        e.preventDefault();
        
        const supportRequest = {
            id: Date.now(),
            type: document.getElementById('supportType').value,
            urgency: document.getElementById('supportUrgency').value,
            subject: document.getElementById('supportSubject').value,
            description: document.getElementById('supportDescription').value,
            contactMethod: document.getElementById('supportContact').value,
            phone: document.getElementById('supportPhone').value,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        this.supportRequests.unshift(supportRequest);
        this.saveSupportRequests();
        this.renderSupportRequests();
        this.closeModal('supportModal');
        this.resetForm('supportForm');
        
        alert('Support request submitted successfully! We will contact you soon.');
    }

    renderSupportRequests() {
        const container = document.getElementById('supportRequestsList');
        
        if (this.supportRequests.length === 0) {
            container.innerHTML = this.getEmptyState('🤝', 'No support requests yet', 'Submit a request when you need agricultural assistance');
            return;
        }

        container.innerHTML = this.supportRequests.map(request => `
            <div class="support-request-card">
                <div class="card-header">
                    <div>
                        <div class="support-type">${this.formatSupportType(request.type)}</div>
                        <div class="card-title">${request.subject}</div>
                    </div>
                    <div class="support-status ${request.status}">${request.status.toUpperCase()}</div>
                </div>
                <div class="card-content">
                    <p>${request.description}</p>
                </div>
                <div class="card-meta">
                    <span>📅 ${this.formatDate(request.timestamp.split('T')[0])}</span>
                    <span>⚡ ${request.urgency.toUpperCase()}</span>
                    <span>📞 ${request.contactMethod}</span>
                </div>
            </div>
        `).join('');
    }

    formatSupportType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
    }

    // Utility Methods
    formatActivityType(type) {
        return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getEmptyState(icon, title, description) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-description">${description}</p>
            </div>
        `;
    }

    // Storage Methods
    saveActivities() {
        const user = this.authManager.getCurrentUser();
        if (user) {
            localStorage.setItem(`farmActivities_${user.email}`, JSON.stringify(this.activities));
        }
    }

    saveCrops() {
        const user = this.authManager.getCurrentUser();
        if (user) {
            localStorage.setItem(`farmCrops_${user.email}`, JSON.stringify(this.crops));
        }
    }

    saveWeather() {
        const user = this.authManager.getCurrentUser();
        if (user) {
            localStorage.setItem(`farmWeather_${user.email}`, JSON.stringify(this.weather));
        }
    }

    saveExpenses() {
        const user = this.authManager.getCurrentUser();
        if (user) {
            localStorage.setItem(`farmExpenses_${user.email}`, JSON.stringify(this.expenses));
        }
    }

    saveSales() {
        const user = this.authManager.getCurrentUser();
        if (user) {
            localStorage.setItem(`farmSales_${user.email}`, JSON.stringify(this.sales));
        }
    }

    saveSupportRequests() {
        const user = this.authManager.getCurrentUser();
        if (user) {
            localStorage.setItem(`farmSupport_${user.email}`, JSON.stringify(this.supportRequests));
        }
    }

    // Modal Methods
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    resetForm(formId) {
        document.getElementById(formId).reset();
        // Reset default dates
        const today = new Date().toISOString().split('T')[0];
        if (formId === 'activityForm') document.getElementById('activityDate').value = today;
        if (formId === 'weatherForm') document.getElementById('weatherDate').value = today;
        if (formId === 'expenseForm') document.getElementById('expenseDate').value = today;
        if (formId === 'salesForm') document.getElementById('saleDate').value = today;
        if (formId === 'cropForm') document.getElementById('plantingDate').value = today;
    }

    renderAll() {
        this.renderActivities();
        this.renderCrops();
        this.renderWeather();
        this.renderExpenses();
        this.renderSales();
        this.renderSupportRequests();
        this.updateExpenseSummary();
        this.updateSalesSummary();
    }

    // Reports Methods
    populateYearSelector() {
        const reportYearSelector = document.getElementById('reportYear');
        const analyticsYearSelector = document.getElementById('analyticsYear');
        const currentYear = new Date().getFullYear();
        const years = new Set();
        
        // Add current year
        years.add(currentYear);
        
        // Add years from existing activities, sales, and expenses
        this.activities.forEach(activity => {
            const year = new Date(activity.date).getFullYear();
            years.add(year);
        });
        
        this.sales.forEach(sale => {
            const year = new Date(sale.date).getFullYear();
            years.add(year);
        });
        
        this.expenses.forEach(expense => {
            const year = new Date(expense.date).getFullYear();
            years.add(year);
        });
        
        // Sort years in descending order
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        
        const yearOptions = sortedYears.map(year => 
            `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`
        ).join('');
        
        if (reportYearSelector) {
            reportYearSelector.innerHTML = yearOptions;
        }
        
        if (analyticsYearSelector) {
            analyticsYearSelector.innerHTML = yearOptions;
        }
    }

    generateReport() {
        const selectedYear = parseInt(document.getElementById('reportYear').value);
        const yearActivities = this.activities.filter(activity => {
            const activityYear = new Date(activity.date).getFullYear();
            return activityYear === selectedYear;
        });

        if (yearActivities.length === 0) {
            document.getElementById('reportContainer').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3 class="empty-state-title">No activities found for ${selectedYear}</h3>
                    <p class="empty-state-description">Try selecting a different year or add some activities first</p>
                </div>
            `;
            document.getElementById('printBtn').style.display = 'none';
            return;
        }

        // Group activities by month
        const monthlyActivities = this.groupActivitiesByMonth(yearActivities);
        
        // Calculate statistics
        const stats = this.calculateYearlyStats(yearActivities);
        
        // Generate report HTML
        const reportHTML = this.generateReportHTML(selectedYear, monthlyActivities, stats);
        
        document.getElementById('reportContainer').innerHTML = reportHTML;
        document.getElementById('printBtn').style.display = 'inline-block';
    }

    groupActivitiesByMonth(activities) {
        const months = {};
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        activities.forEach(activity => {
            const date = new Date(activity.date);
            const monthKey = date.getMonth();
            const monthName = monthNames[monthKey];
            
            if (!months[monthName]) {
                months[monthName] = [];
            }
            months[monthName].push(activity);
        });

        // Sort activities within each month by date
        Object.keys(months).forEach(month => {
            months[month].sort((a, b) => new Date(a.date) - new Date(b.date));
        });

        return months;
    }

    calculateYearlyStats(activities) {
        const stats = {
            totalActivities: activities.length,
            totalHours: 0,
            activityTypes: {},
            busiestMonth: '',
            busiestMonthCount: 0
        };

        const monthCounts = {};
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        activities.forEach(activity => {
            // Count total hours
            stats.totalHours += activity.duration || 0;
            
            // Count activity types
            const type = this.formatActivityType(activity.type);
            stats.activityTypes[type] = (stats.activityTypes[type] || 0) + 1;
            
            // Count activities per month
            const monthName = monthNames[new Date(activity.date).getMonth()];
            monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
        });

        // Find busiest month
        Object.entries(monthCounts).forEach(([month, count]) => {
            if (count > stats.busiestMonthCount) {
                stats.busiestMonth = month;
                stats.busiestMonthCount = count;
            }
        });

        return stats;
    }

    generateReportHTML(year, monthlyActivities, stats) {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="report-header">
                <h1 class="report-title">🌾 Farm Activity Report ${year}</h1>
                <p class="report-subtitle">Praaso, Ghana</p>
                <p class="report-date">Generated on ${currentDate}</p>
            </div>

            <div class="report-summary">
                <div class="summary-item">
                    <div class="summary-number">${stats.totalActivities}</div>
                    <div class="summary-label">Total Activities</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">${stats.totalHours.toFixed(1)}</div>
                    <div class="summary-label">Total Hours</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">${Object.keys(stats.activityTypes).length}</div>
                    <div class="summary-label">Activity Types</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">${stats.busiestMonth || 'N/A'}</div>
                    <div class="summary-label">Busiest Month</div>
                </div>
            </div>

            <div class="report-section">
                <h3>Monthly Activity Breakdown</h3>
                ${Object.entries(monthlyActivities).map(([month, activities]) => `
                    <div class="activity-month">
                        <div class="month-header">${month} (${activities.length} activities)</div>
                        <div class="activity-list">
                            ${activities.map(activity => `
                                <div class="activity-item">
                                    <div class="activity-info">
                                        <div class="activity-date">${this.formatDate(activity.date)}</div>
                                        <div class="activity-desc">${activity.description || 'No description'}</div>
                                    </div>
                                    <div class="activity-type-badge">${this.formatActivityType(activity.type)}</div>
                                    ${activity.duration > 0 ? `<div class="activity-duration">${activity.duration}h</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="report-section">
                <h3>Activity Type Summary</h3>
                <div class="activity-list">
                    ${Object.entries(stats.activityTypes).map(([type, count]) => `
                        <div class="activity-item">
                            <div class="activity-info">
                                <div class="activity-desc">${type}</div>
                            </div>
                            <div class="activity-duration">${count} times</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    printReport() {
        window.print();
    }

    // Analytics Methods
    generateAnalytics() {
        const selectedYear = parseInt(document.getElementById('analyticsYear').value);
        const container = document.getElementById('analyticsContainer');
        
        // Filter data for selected year
        const yearExpenses = this.expenses.filter(expense => {
            const expenseYear = new Date(expense.date).getFullYear();
            return expenseYear === selectedYear;
        });
        
        const yearSales = this.sales.filter(sale => {
            const saleYear = new Date(sale.date).getFullYear();
            return saleYear === selectedYear;
        });
        
        const yearCrops = this.crops.filter(crop => {
            const cropYear = new Date(crop.plantingDate).getFullYear();
            return cropYear === selectedYear;
        });
        
        const yearWeather = this.weather.filter(weather => {
            const weatherYear = new Date(weather.date).getFullYear();
            return weatherYear === selectedYear;
        });
        
        // Calculate totals
        const totalExpenses = yearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalRevenue = yearSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;
        
        // Generate analytics HTML
        container.innerHTML = `
            <div class="analytics-summary">
                <div class="summary-card revenue">
                    <div class="summary-number">GH₵ ${totalRevenue.toFixed(2)}</div>
                    <div class="summary-label">Total Revenue</div>
                </div>
                <div class="summary-card expenses">
                    <div class="summary-number">GH₵ ${totalExpenses.toFixed(2)}</div>
                    <div class="summary-label">Total Expenses</div>
                </div>
                <div class="summary-card profit ${netProfit >= 0 ? 'positive' : 'negative'}">
                    <div class="summary-number">GH₵ ${netProfit.toFixed(2)}</div>
                    <div class="summary-label">Net ${netProfit >= 0 ? 'Profit' : 'Loss'}</div>
                </div>
                <div class="summary-card margin">
                    <div class="summary-number">${profitMargin.toFixed(1)}%</div>
                    <div class="summary-label">Profit Margin</div>
                </div>
            </div>
            
            <div class="analytics-section">
                <h3>Crop Yield Performance</h3>
                ${this.generateYieldAnalysis(yearCrops)}
            </div>
            
            <div class="analytics-section">
                <h3>Weather Impact Analysis</h3>
                ${this.generateWeatherAnalysis(yearWeather)}
            </div>
        `;
    }
    
    generateYieldAnalysis(crops) {
        if (crops.length === 0) {
            return '<p>No crops recorded for this year.</p>';
        }
        
        return crops.map(crop => {
            const expectedYield = crop.expectedYield || 0;
            const actualYield = crop.actualYield || 0;
            const performance = expectedYield > 0 ? ((actualYield / expectedYield) * 100) : 0;
            const difference = actualYield - expectedYield;
            
            return `
                <div class="yield-card">
                    <div class="yield-header">
                        <h4>${crop.name}${crop.variety ? ` (${crop.variety})` : ''}</h4>
                        <div class="yield-performance ${performance >= 100 ? 'over' : performance >= 90 ? 'near' : 'under'}">
                            ${performance.toFixed(1)}%
                        </div>
                    </div>
                    <div class="yield-details">
                        <div>Expected: ${expectedYield} ${crop.yieldUnit || 'kg'}</div>
                        <div>Actual: ${actualYield} ${crop.yieldUnit || 'kg'}</div>
                        <div>Difference: ${difference >= 0 ? '+' : ''}${difference} ${crop.yieldUnit || 'kg'}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    generateWeatherAnalysis(weatherData) {
        if (weatherData.length === 0) {
            return '<p>No weather data recorded for this year.</p>';
        }
        
        // Group by month
        const monthlyWeather = {};
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        weatherData.forEach(weather => {
            const month = new Date(weather.date).getMonth();
            const monthName = monthNames[month];
            
            if (!monthlyWeather[monthName]) {
                monthlyWeather[monthName] = {
                    rainfall: [],
                    temperature: []
                };
            }
            
            monthlyWeather[monthName].rainfall.push(weather.rainfall || 0);
            if (weather.temperature !== null) {
                monthlyWeather[monthName].temperature.push(weather.temperature);
            }
        });
        
        // Calculate averages
        const monthlyAverages = Object.entries(monthlyWeather).map(([month, data]) => {
            const avgRainfall = data.rainfall.reduce((sum, val) => sum + val, 0) / data.rainfall.length;
            const avgTemp = data.temperature.length > 0 
                ? data.temperature.reduce((sum, val) => sum + val, 0) / data.temperature.length 
                : null;
            
            return {
                month,
                avgRainfall: avgRainfall.toFixed(1),
                avgTemp: avgTemp ? avgTemp.toFixed(1) : 'N/A'
            };
        });
        
        return `
            <div class="weather-analysis">
                ${monthlyAverages.map(data => `
                    <div class="weather-month">
                        <div class="weather-month-name">${data.month}</div>
                        <div class="weather-stats">
                            <div>🌧️ ${data.avgRainfall}mm</div>
                            <div>🌡️ ${data.avgTemp}°C</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Global Functions for Modal Management
function showActivityModal() {
    document.getElementById('activityModal').style.display = 'block';
}

function showCropModal() {
    document.getElementById('cropModal').style.display = 'block';
}

function showWeatherModal() {
    document.getElementById('weatherModal').style.display = 'block';
}

function showExpenseModal() {
    document.getElementById('expenseModal').style.display = 'block';
}

function showSalesModal() {
    farmDiary.populateCropOptions();
    document.getElementById('salesModal').style.display = 'block';
}

function showSupportModal() {
    document.getElementById('supportModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

function showSignupForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function logout() {
    if (window.farmDiary && window.farmDiary.authManager) {
        window.farmDiary.authManager.logout();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize the application
window.farmDiary = null;
document.addEventListener('DOMContentLoaded', function() {
    window.farmDiary = new FarmDiary();
});