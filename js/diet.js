document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('userToken');
    const dietContainer = document.getElementById('dietRecommendations');

    // 載入飲食建議
    async function loadDietRecommendations() {
        try {
            const response = await fetch('/api/diet/recommendations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                displayDietRecommendations(data);
            }
        } catch (error) {
            console.error('載入飲食建議失敗:', error);
            dietContainer.innerHTML = '<div class="alert alert-danger">載入飲食建議時發生錯誤</div>';
        }
    }

    // 顯示飲食建議
    function displayDietRecommendations(recommendations) {
        dietContainer.innerHTML = '';

        // 顯示每日營養需求
        const nutritionCard = document.createElement('div');
        nutritionCard.className = 'col-12 mb-4';
        nutritionCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">每日營養需求</h5>
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <h6>熱量目標</h6>
                            <p class="h4">${recommendations.dailyNeeds.calories} 大卡</p>
                        </div>
                        <div class="col-md-3 mb-3">
                            <h6>蛋白質</h6>
                            <p class="h4">${recommendations.dailyNeeds.protein}g</p>
                            <div class="progress">
                                <div class="progress-bar bg-success" style="width: ${recommendations.dailyNeeds.proteinPercentage}%"></div>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3">
                            <h6>碳水化合物</h6>
                            <p class="h4">${recommendations.dailyNeeds.carbs}g</p>
                            <div class="progress">
                                <div class="progress-bar bg-warning" style="width: ${recommendations.dailyNeeds.carbsPercentage}%"></div>
                            </div>
                        </div>
                        <div class="col-md-3 mb-3">
                            <h6>脂肪</h6>
                            <p class="h4">${recommendations.dailyNeeds.fat}g</p>
                            <div class="progress">
                                <div class="progress-bar bg-danger" style="width: ${recommendations.dailyNeeds.fatPercentage}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        dietContainer.appendChild(nutritionCard);

        // 顯示每餐建議
        recommendations.meals.forEach(meal => {
            const mealCard = document.createElement('div');
            mealCard.className = 'col-md-4 mb-4';
            mealCard.innerHTML = `
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0">${meal.type}</h5>
                    </div>
                    <div class="card-body">
                        <h6>建議食物</h6>
                        <ul class="list-unstyled">
                            ${meal.foods.map(food => `
                                <li class="mb-2">
                                    <i class="bi bi-check2-circle text-success"></i>
                                    ${food.name}
                                    <small class="text-muted d-block">
                                        ${food.portion} (${food.calories} 大卡)
                                    </small>
                                </li>
                            `).join('')}
                        </ul>
                        <h6>營養成分</h6>
                        <div class="small">
                            <div class="d-flex justify-content-between mb-1">
                                <span>蛋白質:</span>
                                <span>${meal.nutrition.protein}g</span>
                            </div>
                            <div class="d-flex justify-content-between mb-1">
                                <span>碳水化合物:</span>
                                <span>${meal.nutrition.carbs}g</span>
                            </div>
                            <div class="d-flex justify-content-between mb-1">
                                <span>脂肪:</span>
                                <span>${meal.nutrition.fat}g</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>總熱量:</span>
                                <span>${meal.nutrition.calories} 大卡</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-outline-primary btn-sm" onclick="showAlternatives('${meal.type}')">
                            查看替代方案
                        </button>
                    </div>
                </div>
            `;
            dietContainer.appendChild(mealCard);
        });

        // 顯示飲食建議和注意事項
        const tipsCard = document.createElement('div');
        tipsCard.className = 'col-12 mt-4';
        tipsCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">飲食建議與注意事項</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <h6>一般建議</h6>
                            <ul>
                                ${recommendations.tips.general.map(tip => `
                                    <li>${tip}</li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6>個人化建議</h6>
                            <ul>
                                ${recommendations.tips.personal.map(tip => `
                                    <li>${tip}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        dietContainer.appendChild(tipsCard);
    }

    // 顯示替代方案
    window.showAlternatives = async function(mealType) {
        try {
            const response = await fetch(`/api/diet/alternatives/${mealType}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const alternatives = await response.json();

            if (response.ok) {
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'alternativesModal';
                modal.innerHTML = `
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">${mealType}替代方案</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    ${alternatives.map(alt => `
                                        <div class="col-md-6 mb-3">
                                            <div class="card h-100">
                                                <div class="card-body">
                                                    <h6 class="card-title">${alt.name}</h6>
                                                    <p class="small">${alt.description}</p>
                                                    <div class="d-flex justify-content-between">
                                                        <span>熱量:</span>
                                                        <span>${alt.calories} 大卡</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                new bootstrap.Modal(modal).show();
                modal.addEventListener('hidden.bs.modal', function() {
                    modal.remove();
                });
            }
        } catch (error) {
            console.error('載入替代方案失敗:', error);
            alert('載入替代方案時發生錯誤');
        }
    };

    // 監聽飲食頁籤切換
    document.querySelector('a[href="#diet"]').addEventListener('click', function() {
        if (dietContainer.children.length === 0) {
            loadDietRecommendations();
        }
    });

    // 如果當前在飲食頁籤，立即載入建議
    if (document.getElementById('diet-section').classList.contains('active')) {
        loadDietRecommendations();
    }
}); 