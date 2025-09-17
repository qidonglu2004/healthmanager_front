document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('userToken');
    const foodForm = document.getElementById('foodForm');
    const waterForm = document.getElementById('waterForm');

    // 食物記錄處理
    foodForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const foodData = {
            name: document.getElementById('foodName').value,
            calories: parseInt(document.getElementById('foodCalories').value),
            amount: parseInt(document.getElementById('foodAmount').value),
            date: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(foodData)
            });

            if (response.ok) {
                alert('食物記錄已保存！');
                foodForm.reset();
                // 更新儀表板數據
                updateDashboardData();
            } else {
                const error = await response.json();
                alert(error.message || '記錄失敗，請稍後再試');
            }
        } catch (error) {
            console.error('記錄食物錯誤:', error);
            alert('記錄過程發生錯誤，請稍後再試');
        }
    });

    // 水分記錄處理
    waterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const waterData = {
            amount: parseInt(document.getElementById('waterAmount').value),
            date: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/water', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(waterData)
            });

            if (response.ok) {
                alert('水分記錄已保存！');
                waterForm.reset();
                // 更新儀表板數據
                updateDashboardData();
            } else {
                const error = await response.json();
                alert(error.message || '記錄失敗，請稍後再試');
            }
        } catch (error) {
            console.error('記錄水分錯誤:', error);
            alert('記錄過程發生錯誤，請稍後再試');
        }
    });

    // 更新儀表板數據
    async function updateDashboardData() {
        try {
            const response = await fetch('/api/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                document.getElementById('todayCalories').textContent = data.todayCalories;
                document.getElementById('todayWater').textContent = data.todayWater;
            }
        } catch (error) {
            console.error('更新儀表板數據失敗:', error);
        }
    }

    // 自動完成食物建議
    const foodNameInput = document.getElementById('foodName');
    let foodDatabase = [];

    // 載入食物資料庫
    async function loadFoodDatabase() {
        try {
            const response = await fetch('/api/foods/database', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                foodDatabase = data;
            }
        } catch (error) {
            console.error('載入食物資料庫失敗:', error);
        }
    }

    // 食物名稱輸入建議
    foodNameInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        if (value.length < 2) return;

        const suggestions = foodDatabase.filter(food => 
            food.name.toLowerCase().includes(value)
        ).slice(0, 5);

        // 顯示建議清單
        showFoodSuggestions(suggestions);
    });

    function showFoodSuggestions(suggestions) {
        let suggestionList = document.getElementById('foodSuggestions');
        if (!suggestionList) {
            suggestionList = document.createElement('ul');
            suggestionList.id = 'foodSuggestions';
            suggestionList.className = 'list-group position-absolute w-100';
            foodNameInput.parentNode.appendChild(suggestionList);
        }

        suggestionList.innerHTML = '';
        suggestions.forEach(food => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${food.name} (${food.calories}大卡/100g)`;
            li.addEventListener('click', () => {
                foodNameInput.value = food.name;
                document.getElementById('foodCalories').value = food.calories;
                suggestionList.remove();
            });
            suggestionList.appendChild(li);
        });
    }

    // 初始載入食物資料庫
    loadFoodDatabase();
}); 