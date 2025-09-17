document.addEventListener('DOMContentLoaded', function() {
    // 檢查登入狀態
    const token = localStorage.getItem('userToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 設置用戶歡迎訊息
    const userName = localStorage.getItem('userName');
    document.getElementById('userGreeting').textContent = `歡迎, ${userName}`;

    // 導航處理
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // 更新導航狀態
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            // 更新內容區域顯示
            contentSections.forEach(section => {
                if (section.id === `${targetId}-section`) {
                    section.classList.remove('d-none');
                } else {
                    section.classList.add('d-none');
                }
            });
        });
    });

    // 登出處理
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        window.location.href = 'index.html';
    });

    // 載入儀表板數據
    async function loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                // 更新儀表板數據
                document.getElementById('todayCalories').textContent = data.todayCalories;
                document.getElementById('calorieGoal').textContent = data.calorieGoal;
                document.getElementById('todayWater').textContent = data.todayWater;
                document.getElementById('waterGoal').textContent = data.waterGoal;
                document.getElementById('currentBMI').textContent = data.bmi.toFixed(1);
            }
        } catch (error) {
            console.error('載入儀表板數據失敗:', error);
        }
    }

    // 定期更新儀表板數據
    loadDashboardData();
    setInterval(loadDashboardData, 300000); // 每5分鐘更新一次
}); 