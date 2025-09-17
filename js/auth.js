document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // 登入表單處理
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userName', data.name);
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || '登入失敗，請檢查帳號密碼');
            }
        } catch (error) {
            console.error('登入錯誤:', error);
            alert('登入過程發生錯誤，請稍後再試');
        }
    });

    // 註冊表單處理
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('密碼與確認密碼不符');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert('註冊成功！請登入');
                // 切換到登入頁籤
                document.getElementById('login-tab').click();
            } else {
                alert(data.message || '註冊失敗，請稍後再試');
            }
        } catch (error) {
            console.error('註冊錯誤:', error);
            alert('註冊過程發生錯誤，請稍後再試');
        }
    });

    // 檢查登入狀態
    function checkAuthStatus() {
        const token = localStorage.getItem('userToken');
        if (token && window.location.pathname.endsWith('index.html')) {
            window.location.href = 'dashboard.html';
        }
    }

    checkAuthStatus();
}); 