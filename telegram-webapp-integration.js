// ========== ИНТЕГРАЦИЯ С TELEGRAM WEB APP ==========

class TelegramWebAppIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.isInTelegram = !!this.tg;
        this.adminData = null;
        this.isAdmin = false;
        
        this.init();
    }
    
    init() {
        if (!this.isInTelegram) {
            console.warn('Приложение запущено не в Telegram WebApp');
            return;
        }
        
        // Настройка WebApp
        this.tg.ready();
        this.tg.expand();
        
        // Установка цветовой темы
        this.tg.setHeaderColor('#1a1a1a');
        this.tg.setBackgroundColor('#0f0f0f');
        
        // Получение информации о пользователе
        this.userId = this.tg.initDataUnsafe?.user?.id;
        this.username = this.tg.initDataUnsafe?.user?.username;
        
        // Определяем роль пользователя по URL
        this.isAdmin = window.location.pathname.includes('admin-panel');
        
        // Настройка кнопки "Назад"
        this.tg.BackButton.onClick(() => {
            this.tg.close();
        });
        
        if (this.isAdmin) {
            this.tg.BackButton.show();
        }
        
        // Автоматическое обновление статусов
        this.startStatusUpdate();
    }
    
    // Отправка данных боту
    sendToBot(action, data = {}) {
        if (!this.isInTelegram) {
            console.warn('Попытка отправки данных вне Telegram WebApp');
            return;
        }
        
        const payload = {
            action: action,
            user_id: this.userId,
            timestamp: new Date().toISOString(),
            ...data
        };
        
        console.log('Отправка данных боту:', payload);
        this.tg.sendData(JSON.stringify(payload));
    }
    
    // Выбор администратора (для пользовательского приложения)
    selectAdmin(adminId, adminTag) {
        this.sendToBot('select_admin', {
            admin_id: adminId,
            admin_tag: adminTag
        });
        
        // Показываем уведомление
        this.tg.showAlert(`Запрос отправлен администратору #${adminTag}`);
        
        // Закрываем приложение после отправки
        setTimeout(() => {
            this.tg.close();
        }, 1500);
    }
    
    // Принятие запроса (для админ панели)
    acceptRequest(userId) {
        this.sendToBot('admin_action', {
            sub_action: 'accept_request',
            user_id: userId
        });
        
        this.tg.showAlert('Запрос принят');
        this.refreshPage();
    }
    
    // Отклонение запроса (для админ панели)  
    rejectRequest(userId) {
        this.sendToBot('admin_action', {
            sub_action: 'reject_request',
            user_id: userId
        });
        
        this.tg.showAlert('Запрос отклонен');
        this.refreshPage();
    }
    
    // Завершение диалога
    endDialog(userId) {
        this.sendToBot('admin_action', {
            sub_action: 'end_dialog',
            user_id: userId
        });
        
        this.tg.showAlert('Диалог завершен');
        this.refreshPage();
    }
    
    // Обновление страницы
    refreshPage() {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    
    // Запуск автообновления статусов
    startStatusUpdate() {
        if (this.isAdmin) {
            // Обновляем админ панель каждые 30 секунд
            setInterval(() => {
                this.updateAdminPanel();
            }, 30000);
        } else {
            // Обновляем пользовательское приложение каждые 60 секунд
            setInterval(() => {
                this.updateUserApp();
            }, 60000);
        }
    }
    
    // Обновление админ панели
    updateAdminPanel() {
        // Здесь можно добавить логику для обновления данных
        console.log('Обновление админ панели...');
    }
    
    // Обновление пользовательского приложения
    updateUserApp() {
        // Здесь можно добавить логику для обновления статусов админов
        console.log('Обновление пользовательского приложения...');
    }
    
    // Показать ошибку
    showError(message) {
        if (this.isInTelegram) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }
    
    // Показать уведомление
    showNotification(message, title = 'Уведомление') {
        if (this.isInTelegram) {
            this.tg.showPopup({
                title: title,
                message: message,
                buttons: [{type: 'ok'}]
            });
        } else {
            alert(`${title}: ${message}`);
        }
    }
    
    // Показать подтверждение
    showConfirmation(message, onConfirm, title = 'Подтвердите действие') {
        if (this.isInTelegram) {
            this.tg.showPopup({
                title: title,
                message: message,
                buttons: [
                    {type: 'ok', text: 'Да'},
                    {type: 'cancel', text: 'Нет'}
                ]
            }, (buttonId) => {
                if (buttonId === 'ok') {
                    onConfirm();
                }
            });
        } else {
            if (confirm(`${title}: ${message}`)) {
                onConfirm();
            }
        }
    }
    
    // Вибрация при важных действиях
    vibrate() {
        if (this.isInTelegram && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('medium');
        }
    }
    
    // Установка заголовка главной кнопки
    setMainButtonText(text, onClick) {
        if (this.isInTelegram && this.tg.MainButton) {
            this.tg.MainButton.setText(text);
            this.tg.MainButton.onClick(onClick);
            this.tg.MainButton.show();
        }
    }
    
    // Скрытие главной кнопки
    hideMainButton() {
        if (this.isInTelegram && this.tg.MainButton) {
            this.tg.MainButton.hide();
        }
    }
}

// Глобальный экземпляр интеграции
window.tgWebApp = new TelegramWebAppIntegration();

// Глобальные функции для использования в приложениях
window.selectAdmin = (adminId, adminTag) => {
    window.tgWebApp.selectAdmin(adminId, adminTag);
};

window.acceptRequest = (userId) => {
    window.tgWebApp.showConfirmation(
        `Принять запрос от пользователя ${userId}?`,
        () => window.tgWebApp.acceptRequest(userId),
        'Принятие запроса'
    );
};

window.rejectRequest = (userId) => {
    window.tgWebApp.showConfirmation(
        `Отклонить запрос от пользователя ${userId}?`,
        () => window.tgWebApp.rejectRequest(userId),
        'Отклонение запроса'
    );
};

window.endDialog = (userId) => {
    window.tgWebApp.showConfirmation(
        `Завершить диалог с пользователем ${userId}?`,
        () => window.tgWebApp.endDialog(userId),
        'Завершение диалога'
    );
};

// Обновление списка админов в пользовательском приложении
function updateAdminsList(admins) {
    const container = document.getElementById('admin-cards-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (admins.length === 0) {
        container.innerHTML = '<div class="no-admins">🦹‍♂️ Администраторы временно недоступны</div>';
        return;
    }
    
    admins.forEach(admin => {
        const card = document.createElement('div');
        card.className = `admin-card admin-card--${admin.status}`;
        
        const statusIcon = admin.status === 'online' ? '🟢' : 
                          admin.status === 'away' ? '🟡' : '🔴';
        
        const rating = '⭐'.repeat(admin.rating);
        
        card.innerHTML = `
            <div class="admin-avatar">${admin.avatar || '🦹‍♂️'}</div>
            <div class="admin-info">
                <h3 class="admin-name">#${admin.tag}</h3>
                <p class="admin-spec">${admin.specialization}</p>
                <div class="admin-status">
                    <span class="status-indicator">${statusIcon}</span>
                    <span class="response-time">${admin.responseTime}</span>
                </div>
                <div class="admin-rating">${rating}</div>
            </div>
            <div class="admin-actions">
                <button class="select-btn">Выбрать</button>
            </div>
        `;
        
        // Добавляем анимацию появления
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        card.addEventListener('click', () => {
            window.tgWebApp.vibrate();
            selectAdmin(admin.id, admin.tag);
        });
        
        container.appendChild(card);
        
        // Анимация появления
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
}

// Обновление статистики
function updateStats(stats) {
    const onlineCount = document.getElementById('online-count');
    const totalCount = document.getElementById('total-count');
    const restCount = document.getElementById('rest-count');
    
    if (onlineCount) onlineCount.textContent = stats.online || 0;
    if (totalCount) totalCount.textContent = stats.total || 0;
    if (restCount) restCount.textContent = (stats.total - stats.online) || 0;
    
    // Обновляем текст состояния
    const statusText = document.querySelector('.status-text');
    if (statusText && stats.online === 0) {
        statusText.textContent = 'Сейчас никого нет в активном режиме';
    } else if (statusText && stats.online > 0) {
        statusText.textContent = `${stats.online} администратор(ов) онлайн`;
    }
}

// Инициализация админ панели
function initializeAdminPanel(data) {
    // Обновляем профиль админа
    const adminName = document.querySelector('.admin-name');
    const adminStatus = document.querySelector('.admin-status');
    const adminAvatar = document.querySelector('.admin-avatar');
    
    if (adminName) adminName.textContent = `#${data.currentAdmin.tag}`;
    if (adminStatus) adminStatus.textContent = `🟢 Онлайн • ${data.currentAdmin.tag}`;
    if (adminAvatar) adminAvatar.textContent = data.currentAdmin.avatar;
    
    // Обновляем счетчики
    const pendingCount = document.getElementById('pending-count');
    const activeDialogsCount = document.getElementById('active-dialogs-count');
    
    if (pendingCount) pendingCount.textContent = data.pendingRequests.length;
    if (activeDialogsCount) activeDialogsCount.textContent = data.activeDialogs.length;
    
    // Обновляем список запросов
    updatePendingRequests(data.pendingRequests);
    updateActiveDialogs(data.activeDialogs);
    updateTodayStats(data.todayStats);
}

// Обновление списка входящих запросов
function updatePendingRequests(requests) {
    const container = document.getElementById('pending-requests-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 Нет входящих запросов</div>';
        return;
    }
    
    requests.forEach(request => {
        const card = document.createElement('div');
        card.className = `request-card priority-${request.priority}`;
        
        const priorityIcon = request.priority === 'high' ? '🔴' :
                            request.priority === 'medium' ? '🟡' : '🟢';
        
        card.innerHTML = `
            <div class="request-header">
                <h4 class="user-name">#${request.userName}</h4>
                <span class="priority-badge">${priorityIcon} ${request.priority}</span>
            </div>
            <div class="request-info">
                <p class="request-category">📂 ${request.category}</p>
                <p class="request-message">${request.message}</p>
                <span class="waiting-time">⏱️ Ожидает: ${request.waitingTime}</span>
            </div>
            <div class="request-actions">
                <button class="btn btn-accept" onclick="acceptRequest(${request.userId})">
                    ✅ Принять
                </button>
                <button class="btn btn-reject" onclick="rejectRequest(${request.userId})">
                    ❌ Отклонить
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Обновление активных диалогов
function updateActiveDialogs(dialogs) {
    const container = document.getElementById('active-dialogs-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (dialogs.length === 0) {
        container.innerHTML = '<div class="empty-state">💬 Нет активных диалогов</div>';
        return;
    }
    
    dialogs.forEach(dialog => {
        const card = document.createElement('div');
        card.className = 'dialog-card';
        
        const unreadBadge = dialog.unreadCount > 0 ? 
            `<span class="unread-badge">${dialog.unreadCount}</span>` : '';
        
        const statusIcon = dialog.status === 'active' ? '🟢' : '🟡';
        
        card.innerHTML = `
            <div class="dialog-header">
                <h4 class="user-name">#${dialog.userName}</h4>
                ${unreadBadge}
                <span class="dialog-status">${statusIcon}</span>
            </div>
            <div class="dialog-info">
                <p class="last-message">${dialog.lastMessage}</p>
                <div class="dialog-meta">
                    <span class="dialog-time">${new Date(dialog.startTime).toLocaleDateString('ru-RU')}</span>
                    <button class="btn btn-sm btn-end" onclick="endDialog(${dialog.userId})">
                        🚫 Завершить
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Обновление статистики дня
function updateTodayStats(stats) {
    const elements = {
        'total-requests': stats.totalRequests,
        'accepted-requests': stats.acceptedRequests,
        'rejected-requests': stats.rejectedRequests,
        'avg-response-time': stats.avgResponseTime
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Утилиты для работы с временем
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function timeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    return `${Math.floor(diff / 86400)} дн назад`;
}

// Применение темы
function applyTheme() {
    if (window.tgWebApp.isInTelegram) {
        const tg = window.tgWebApp.tg;
        document.documentElement.style.setProperty('--tg-bg-color', tg.backgroundColor);
        document.documentElement.style.setProperty('--tg-text-color', tg.textColor);
        document.documentElement.style.setProperty('--tg-hint-color', tg.hintColor);
        document.documentElement.style.setProperty('--tg-link-color', tg.linkColor);
        document.documentElement.style.setProperty('--tg-button-color', tg.buttonColor);
        document.documentElement.style.setProperty('--tg-button-text-color', tg.buttonTextColor);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация приложения...');
    applyTheme();
    
    // Добавляем обработчики для кнопок навигации
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const screenId = this.dataset.screen;
            if (screenId) {
                showScreen(screenId);
                
                // Обновляем активную кнопку
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
});

// Функция переключения экранов
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// Обработка ошибок
window.addEventListener('error', function(event) {
    console.error('Ошибка в приложении:', event.error);
    if (window.tgWebApp && window.tgWebApp.isInTelegram) {
        window.tgWebApp.showError('Произошла ошибка в приложении');
    }
});

console.log('Telegram WebApp интеграция загружена успешно!');