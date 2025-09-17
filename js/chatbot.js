document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('userToken');
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');

    // 初始歡迎訊息
    addMessage('bot', '您好！我是您的健康助理。我可以為您提供健康相關的建議，包括飲食、運動、生活習慣等方面。請告訴我您想了解什麼？');

    // 處理訊息發送
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // 顯示使用者訊息
        addMessage('user', message);
        userInput.value = '';
        userInput.disabled = true;

        try {
            // 顯示正在輸入指示
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'bot-msg typing-indicator';
            typingIndicator.innerHTML = '<span>.</span><span>.</span><span>.</span>';
            chatBox.appendChild(typingIndicator);
            chatBox.scrollTop = chatBox.scrollHeight;

            // 發送請求到後端
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        userProfile: await getUserProfile(),
                        recentRecords: await getRecentRecords()
                    }
                })
            });

            // 移除輸入指示
            typingIndicator.remove();

            if (response.ok) {
                const data = await response.json();
                addMessage('bot', data.reply);
            } else {
                throw new Error('回應失敗');
            }
        } catch (error) {
            console.error('聊天錯誤:', error);
            addMessage('bot', '抱歉，我現在無法正確回應。請稍後再試。');
        } finally {
            userInput.disabled = false;
            userInput.focus();
        }
    });

    // 添加訊息到聊天框
    function addMessage(sender, text) {
        const div = document.createElement('div');
        div.className = sender === 'user' ? 'user-msg' : 'bot-msg';
        
        // 處理可能的 Markdown 格式
        if (sender === 'bot') {
            const formattedText = formatBotMessage(text);
            div.innerHTML = formattedText;
        } else {
            div.textContent = text;
        }

        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // 格式化機器人訊息（支援簡單的 Markdown）
    function formatBotMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 粗體
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜體
            .replace(/```(.*?)```/g, '<code>$1</code>') // 程式碼
            .replace(/\n/g, '<br>'); // 換行
    }

    // 獲取用戶資料
    async function getUserProfile() {
        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('獲取用戶資料失敗:', error);
            return null;
        }
    }

    // 獲取最近記錄
    async function getRecentRecords() {
        try {
            const response = await fetch('/api/user/recent-records', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('獲取最近記錄失敗:', error);
            return null;
        }
    }

    // 添加打字動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 8px 16px;
        }
        .typing-indicator span {
            width: 8px;
            height: 8px;
            background-color: #90949c;
            border-radius: 50%;
            animation: typing 1s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.3s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
}); 