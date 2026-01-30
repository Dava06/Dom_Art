// Функция для анимации скролла с заданной длительностью (duration в мс)
function scrollToCatalog(duration) {
    const target = document.getElementById('catalog-section');
    if (!target) return;
    const start = window.pageYOffset;
    const end = target.getBoundingClientRect().top + start;
    const change = end - start;
    let currentTime = 0;
    const increment = 20;

    const animate = () => {
        currentTime += increment;
        const val = easeInOutQuad(currentTime, start, change, duration);
        window.scrollTo(0, val);
        if (currentTime < duration) setTimeout(animate, increment);
    };
    animate();
}

// Функция для расчета "плавности" (easing function)
function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

// Скролл к секциям
function scrollToSection(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
}

let activeCard = null;

// Функция для переключения описания
function toggleDescription(limitPrice, location, price, area, imagePaths, clickedCardElement) {
    const descriptionBox = document.getElementById('descriptionBox');
    const descImagesContainer = document.getElementById('descImages');
    if (!descriptionBox || !descImagesContainer) return;

    if (activeCard === clickedCardElement) {
        descriptionBox.classList.remove('is-visible');
        clickedCardElement.classList.remove('active');
        activeCard = null;
        return;
    }

    if (activeCard && activeCard !== clickedCardElement) {
        descriptionBox.classList.remove('is-visible');
        activeCard.classList.remove('active');
        setTimeout(() => {
            updateDescription(location, price, area, imagePaths);
            descriptionBox.classList.add('is-visible');
            activeCard = clickedCardElement;
            clickedCardElement.classList.add('active');
        }, 400);
    } else {
        updateDescription(location, price, area, imagePaths);
        descriptionBox.classList.add('is-visible');
        activeCard = clickedCardElement;
        clickedCardElement.classList.add('active');
    }
}

function updateDescription(location, price, area, imagePaths) {
    const descImagesContainer = document.getElementById('descImages');
    descImagesContainer.innerHTML = '';
    imagePaths.forEach(path => {
        const img = document.createElement('img');
        img.src = path;
        img.onclick = () => openModal(path);
        descImagesContainer.appendChild(img);
    });
    document.getElementById('descLocation').innerText = 'Местоположение: ' + location;
    document.getElementById('descPrice').innerText = 'Точная цена: ' + price;
    document.getElementById('descArea').innerText = 'Площадь: ' + area;
}

// Функции для модального окна изображений
function openModal(imageSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = imageSrc;
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = 'unset';
    }
}

// Supabase константы (данные в облаке)
const SUPABASE_URL = 'https://njcdmybqwcidutenoscg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qY2RteWJxd2NpZHV0ZW5vc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODk1ODMsImV4cCI6MjA4NTE2NTU4M30.Sw7R9-wkftqdFpsg-xfiC8p1bxKMxsSjNQbDlQHHg14';

// Проверка авторизации (по токену в localStorage — сессия)
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Функция для проверки входа и перехода на страницу
function checkLoginAndRedirect(url) {
    if (!isLoggedIn()) {
        alert('Зарегистрируйтесь, чтобы продолжить.');
        openRegisterModal();
        return;
    }
    window.location.href = url;  // Переход на страницу
}

// Функция для обновления UI кнопок авторизации
function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    if (isLoggedIn()) {
        authButtons.innerHTML = '<button class="auth-btn" onclick="logout()">Выйти</button>';
    } else {
        authButtons.innerHTML = '<button class="auth-btn" onclick="openLoginModal()">Войти</button><button class="auth-btn" onclick="openRegisterModal()">Регистрация</button>';
    }
}

// Функция выхода
function logout() {
    localStorage.removeItem('token');
    updateAuthUI();
    alert('Вы вышли из аккаунта.');
}

// Функции для модальных окон входа
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'unset';
    }
}

// Функции для модальных окон регистрации
function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'unset';
    }
}

// Обработчик формы входа (запрос на Supabase)
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Форма входа отправлена');
    const name = document.getElementById('loginName').value.trim();
    const phone = document.getElementById('loginPhone').value.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');  // Очищаем от форматирования
    const password = document.getElementById('loginPassword').value.trim();

    if (!cleanPhone || cleanPhone.length !== 11) {  // Проверяем 11 цифр
        alert('Пожалуйста, введите корректный номер телефона (11 цифр).');
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?name=eq.${name}&phone=eq.${cleanPhone}`, {  // Используем cleanPhone
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const users = await response.json();
        console.log('Ответ Supabase:', users);
        if (users.length > 0 && users[0].password === password) {
            localStorage.setItem('token', 'fake-token-' + users[0].id);
            alert('Вход выполнен успешно!');
            closeLoginModal();
            updateAuthUI();
        } else {
            alert('Неверные данные.');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сети. Проверьте консоль.');
    }
});

// Функции для модального окна подтверждения входа при регистрации
function openConfirmLoginModal(user) {
    const modal = document.getElementById('confirmLoginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Сохраняем данные пользователя для входа
        modal.dataset.userId = user.id;
    }
}

function closeConfirmLoginModal() {
    const modal = document.getElementById('confirmLoginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'unset';
    }
}

// Обработчик формы регистрации (запрос на Supabase) с обработкой дубликата
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Форма регистрации отправлена');
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');  // Очищаем от форматирования
    const password = document.getElementById('regPassword').value.trim();

    if (password.length < 6) {
        alert('Пароль должен быть не менее 6 символов.');
        return;
    }
    if (!cleanPhone || cleanPhone.length !== 11) {  // Проверяем 11 цифр
        alert('Пожалуйста, введите корректный номер телефона (11 цифр).');
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=representation'  // Этот заголовок возвращает данные вставленной строки
            },
            body: JSON.stringify({ name, phone: cleanPhone, password })  // Отправляем cleanPhone
        });
        console.log('Статус ответа:', response.status);
        if (response.ok) {
            const newUser = await response.json();
            console.log('Новый пользователь:', newUser);
            if (newUser && newUser.length > 0 && newUser[0].id) {
                localStorage.setItem('token', 'fake-token-' + newUser[0].id);
                alert('Регистрация успешна! Вы вошли в систему.');
                closeRegisterModal();
                updateAuthUI();  // Обновит UI: кнопка "Войти" сменится на "Выйти"
            } else {
                alert('Регистрация успешна, но не удалось войти автоматически. Попробуйте войти вручную.');
                closeRegisterModal();
                updateAuthUI();
            }
        } else {
            const error = await response.json();
            console.error('Ошибка Supabase:', error);
            if (error.message && error.message.includes('duplicate')) {
                // Если дубликат, пытаемся найти пользователя и показать модал
                const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?name=eq.${name}&phone=eq.${cleanPhone}`, {  // Используем cleanPhone
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                });
                if (checkResponse.ok) {
                    const users = await checkResponse.json();
                    console.log('Найденные пользователи:', users);
                    if (users.length > 0) {
                        openConfirmLoginModal(users[0]);
                    } else {
                        alert('Ошибка: дубликат обнаружен, но пользователь не найден.');
                    }
                } else {
                    alert('Ошибка проверки существования пользователя.');
                }
            } else {
                alert(error.message || 'Ошибка регистрации.');
            }
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        alert('Ошибка сети. Проверьте консоль.');
    }
});

// Обработчики для кнопок в модале подтверждения
document.getElementById('confirmYes').addEventListener('click', function () {
    const modal = document.getElementById('confirmLoginModal');
    const userId = modal.dataset.userId;
    localStorage.setItem('token', 'fake-token-' + userId);
    alert('Вы вошли в систему!');
    closeConfirmLoginModal();
    closeRegisterModal();
    updateAuthUI();
});

document.getElementById('confirmNo').addEventListener('click', function () {
    closeConfirmLoginModal();
});


// Модифицированные функции открытия модалов с проверкой авторизации
function openExcursionModal() {
    if (!isLoggedIn()) {
        alert('Зарегистрируйтесь, чтобы записаться на экскурсию.');
        openRegisterModal();
        return;
    }
    const modal = document.getElementById('excursionModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeExcursionModal() {
    const modal = document.getElementById('excursionModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'unset';
    }
}

// Отправка заявки на экскурсию (теперь в Supabase)
async function submitExcursionRequest() {
    const phoneInput = document.getElementById('excursionPhone');
    if (!phoneInput) return;
    const phone = phoneInput.value.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');  // Очищаем от форматирования
    if (!cleanPhone || cleanPhone.length !== 11) {  // Проверяем 11 цифр
        alert('Пожалуйста, введите корректный номер телефона (11 цифр).');
        phoneInput.focus();
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/excursions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({ phone: cleanPhone })  // Отправляем очищенный номер
        });
        if (response.ok) {
            alert('Спасибо! Мы перезвоним вам в течение 15 минут.');
            closeExcursionModal();
            phoneInput.value = '';
        } else {
            alert('Ошибка отправки. Попробуйте позже.');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        alert('Ошибка сети. Проверьте консоль.');
    }
}

// Функции для модального окна футера
function openFooterModal() {
    if (!isLoggedIn()) {
        alert('Зарегистрируйтесь, чтобы оставить заявку.');
        openRegisterModal();
        return;
    }
    const modal = document.getElementById('footerModal');
    if (modal) modal.style.display = 'block';
}

function closeFooterModal() {
    const modal = document.getElementById('footerModal');
    if (modal) modal.style.display = 'none';
}

// Отправка формы футера (теперь в Supabase)
document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');  // Очищаем
    if (!name || !cleanPhone || cleanPhone.length !== 11) {  // Проверяем
        alert("Пожалуйста, заполните обязательные поля: имя и корректный телефон (11 цифр).");
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({ name, phone: cleanPhone })  // Отправляем очищенный
        });
        if (response.ok) {
            alert("Заявка отправлена! Мы свяжемся с вами скоро.");
            this.reset();
            closeFooterModal();
        } else {
            alert("Ошибка отправки. Проверьте интернет или попробуйте позже.");
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
        alert("Ошибка сети. Проверьте консоль.");
    }
});


// Слайдер отзывов
let currentReviewIndex = 0;
const reviews = document.querySelectorAll('.review-item');

function showReview(index) {
    reviews.forEach((review, i) => {
        review.classList.toggle('active', i === index);
    });
}

function nextReview() {
    currentReviewIndex = (currentReviewIndex + 1) % reviews.length;
    showReview(currentReviewIndex);
}

function prevReview() {
    currentReviewIndex = (currentReviewIndex - 1 + reviews.length) % reviews.length;
    showReview(currentReviewIndex);
}

// Закрытие модальных окон по клику вне и Esc
window.onclick = function (event) {
    const excursionModal = document.getElementById('excursionModal');
    const footerModal = document.getElementById('footerModal');
    const imageModal = document.getElementById('imageModal');
    const applyModal = document.getElementById('applyModal');
    const reviewModal = document.getElementById('reviewModal');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    if (event.target === excursionModal) closeExcursionModal();
    if (event.target === footerModal) closeFooterModal();
    if (event.target === imageModal) closeModal();
    if (event.target === applyModal) closeApplyModal();
    if (event.target === reviewModal) closeReviewModal();
    if (event.target === loginModal) closeLoginModal();
    if (event.target === registerModal) closeRegisterModal();
};

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeExcursionModal();
        closeFooterModal();
        closeModal();
        closeApplyModal();
        closeReviewModal();
        closeLoginModal();
        closeRegisterModal();
    }
});

// Функции для модального окна отзыва
function openReviewModal() {
    if (!isLoggedIn()) {
        alert('Зарегистрируйтесь, чтобы написать отзыв.');
        openRegisterModal();
        return;
    }
    const modal = document.getElementById('reviewModal');
    if (modal) modal.style.display = 'flex';
}

function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) modal.style.display = 'none';
}

// Обработчик для кнопки "Написать отзыв"
document.querySelector('.write-btn').onclick = function () {
    openReviewModal();
};

// Отправка формы отзыва (теперь в Supabase)
document.getElementById('reviewForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('reviewName').value.trim();
    const review = document.getElementById('reviewText').value.trim();
    if (!name || !review) {
        alert("Пожалуйста, заполните все поля.");
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({ name, review })
        });
        if (response.ok) {
            alert("Спасибо за отзыв! Он отправлен.");
            this.reset();
            closeReviewModal();
        } else {
            alert("Ошибка отправки. Попробуйте позже.");
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
        alert("Ошибка сети. Проверьте консоль.");
    }
});

// Обновлённый обработчик кнопок услуг
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded fired');
    const buttons = document.querySelectorAll('.btn');
    console.log('Buttons found:', buttons.length);

    // **ОБНОВЛЕННОЕ: Настройка полей телефона с исправленной маской**
    const phoneInputs = [
        'loginPhone',
        'regPhone',
        'excursionPhone',
        'phone',  // из contactForm
        'applyPhone'
    ];
    phoneInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.placeholder = '+7 (XXX) XXX-XX-XX';  // Placeholder
            input.maxLength = 18;  // Для полной маски
            input.addEventListener('input', function (e) {
                let value = e.target.value.replace(/[^0-9]/g, '');  // Только цифры
                value = value.slice(0, 11);  // Ограничиваем до 11 цифр
                // Форматируем маску постепенно
                let formatted = '';
                if (value.length >= 1) formatted = '+7 ';
                if (value.length >= 2) formatted += '(' + value.slice(1, Math.min(4, value.length));
                if (value.length >= 5) formatted += ') ' + value.slice(4, Math.min(7, value.length));
                if (value.length >= 8) formatted += '-' + value.slice(7, Math.min(9, value.length));
                if (value.length >= 10) formatted += '-' + value.slice(9, Math.min(11, value.length));
                e.target.value = formatted;
            });
            input.addEventListener('keydown', function (e) {
                // Разрешаем backspace, delete и навигацию
                if (['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                    return;
                }
                // Запрещаем нецифры
                if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                }
            });
        }
    });

    buttons.forEach(button => {
        button.addEventListener('click', function (event) {
            const action = event.target.getAttribute('data-action');
            console.log('Button clicked, action:', action);
            switch (action) {
                case 'more':
                    const overlay = document.createElement('div');
                    overlay.className = overlay.className = 'modal-overlay';

                    const modal = document.createElement('div');
                    modal.className = 'modal-window';

                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'modal-close';
                    closeBtn.textContent = '×';

                    const title = document.createElement('h3');
                    title.className = 'modal-title';
                    title.textContent = 'Юридическая проверка земельного участка';

                    const text = document.createElement('p');
                    text.className = 'modal-text';
                    text.innerHTML = `
                        Важно: игнорирование проверок грозит отказом в регистрации, штрафами или сносом построек.
                    `;

                    const list = document.createElement('ul');
                    list.className = 'modal-list';
                    list.innerHTML = `
                        <li><strong>Градостроительные регламенты:</strong> Правила землепользования и застройки (ПЗЗ) — виды разрешённого использования, предельные размеры участка, параметры застройки (высота, этажность, отступы). Генеральный план — перспективное развитие территории, зоны ограничений. ЗОУИТ (зоны с особыми условиями) — санитарные, природоохранные, охранные зоны и их ограничения.</li>
                    `;

                    modal.appendChild(closeBtn);
                    modal.appendChild(title);
                    modal.appendChild(text);
                    modal.appendChild(list);
                    overlay.appendChild(modal);
                    document.body.appendChild(overlay);
                    overlay.classList.add('active');

                    closeBtn.addEventListener('click', () => {
                        overlay.classList.remove('active');
                        setTimeout(() => overlay.remove(), 300);
                    });

                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            overlay.classList.remove('active');
                            setTimeout(() => overlay.remove(), 300);
                        }
                    });
                    break;
                case 'consult':
                    if (!isLoggedIn()) {
                        alert('Зарегистрируйтесь, чтобы получить консультацию.');
                        openRegisterModal();
                        return;
                    }
                    window.open('https://t.me/melikyan_7', '_blank');
                    break;
                case 'apply':
                    openApplyModal();
                    break;
            }
        });
    });

    // Анимация карточек услуг при загрузке
    const cards = document.querySelectorAll('.services-cards .card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // Инициализация галереи
    initGallery();

    // Инициализация слайдера отзывов
    showReview(currentReviewIndex);
    updateAuthUI();
});

// Функции для галереи в услугах
let galleryIndex = 0;
const galleryImgs = document.querySelectorAll('.gallery-img');

function initGallery() {
    showGallery(galleryIndex);
    setInterval(() => {
        nextGallery();
    }, 3000);
}

function showGallery(index) {
    galleryImgs.forEach((img, i) => {
        img.classList.toggle('active', i === index);
    });
}

function nextGallery() {
    galleryIndex = (galleryIndex + 1) % galleryImgs.length;
    showGallery(galleryIndex);
}

function prevGallery() {
    galleryIndex = (galleryIndex - 1 + galleryImgs.length) % galleryImgs.length;
    showGallery(galleryIndex);
}

// Функции для модального окна записи на приём
function openApplyModal() {
    if (!isLoggedIn()) {
        alert('Зарегистрируйтесь, чтобы записаться на приём.');
        openRegisterModal();
        return;
    }
    const modal = document.getElementById('applyModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeApplyModal() {
    const modal = document.getElementById('applyModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'unset';
    }
}

// Отправка формы записи на приём (теперь в Supabase)
document.getElementById('applyForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('applyName').value.trim();
    const phone = document.getElementById('applyPhone').value.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');  // Очищаем
    if (!name || !cleanPhone || cleanPhone.length !== 11) {  // Проверяем
        alert("Пожалуйста, заполните все поля и корректный телефон (11 цифр).");
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({ name, phone: cleanPhone })  // Отправляем очищенный
        });
        if (response.ok) {
            alert("Заявка отправлена! Мы свяжемся с вами скоро.");
            this.reset();
            closeApplyModal();
        } else {
            alert("Ошибка отправки. Попробуйте позже.");
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
        alert("Ошибка сети. Проверьте консоль.");
    }
});
function showText() {
    const text = `
    <h2>Юридическая проверка земельного участка</h2>
    <ol>
      <li><strong>Юридическая чистота:</strong>
        <ul>
          <li>Выписка из ЕГРН — проверьте собственника, категорию земли, ВРИ, границы, обременения (аресты, ипотеки, сервитуты).</li>
          <li>Статус продавца — согласие супруга (если в браке), действительность паспорта/доверенности, отсутствие долгов.</li>
          <li>Публичная кадастровая карта — сверьте данные с ЕГРН (площадь, ВРИ, категория).</li>
          <li>Осмотр на местности — соответствие границ, состояние земли, подъездные пути, наличие незарегистрированных построек.</li>
        </ul>
      </li>
      <li><strong>Градостроительные регламенты:</strong>
        <ul>
          <li>Правила землепользования и застройки (ПЗЗ) — виды разрешённого использования, предельные размеры участка, параметры застройки (высота, этажность, отступы).</li>
          <li>Генеральный план — перспективное развитие территории, зоны ограничений.</li>
          <li>ЗОУИТ (зоны с особыми условиями) — санитарные, природоохранные, охранные зоны и их ограничения.</li>
        </ul>
      </li>
      <li><strong>Дополнительные шаги:</strong>
        <ul>
          <li>Проверьте историю сделок (при сомнениях).</li>
          <li>Для строительства — подайте уведомление о планируемых работах.</li>
          <li>Привлеките юриста для комплексной проверки.</li>
        </ul>
      </li>
    </ol>
  `;
    document.getElementById('popupText').innerHTML = text;
    document.getElementById('popupText').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    const warrantyButton = document.querySelector('.btn[data-action="warranty-details"]');

    if (warrantyButton) {
        warrantyButton.addEventListener('click', function () {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';

            const modal = document.createElement('div');
            modal.className = 'modal-window';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.textContent = '×';

            const title = document.createElement('h3');
            title.className = 'modal-title';
            title.textContent = 'Кровельные работы';

            const text = document.createElement('p');
            text.className = 'modal-text';
            text.innerHTML = `
       Компании совмещают гарантию на кровельные материалы и на работы по установке, во время которого потребитель может проверить качество кровли.
      `;

            const list = document.createElement('ul');
            list.className = 'modal-list';
            list.innerHTML = `
        <li><strong>На технические свойства</strong> — срок 10–50 лет.Гарантирует, что материал сохранит прочность, герметичность и стойкость к нагрузкам.</li >
        <li><strong>На внешний вид</strong> — обычно 10–20 лет. Производитель обещает, что цвет не выгорит, не облупится и не изменит оттенок.</li>
        <li><strong>На заводской брак</strong> — действует сразу после покупки и покрывает дефекты производства (царапины, кривые листы, неровная посыпка).</li>
    `;

            modal.appendChild(closeBtn);
            modal.appendChild(title);
            modal.appendChild(text);
            modal.appendChild(list);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            overlay.classList.add('active');

            closeBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    setTimeout(() => overlay.remove(), 300);
                }
                // Функция для открытия карты в новой вкладке (если нужно добавить onclick к iframe)
                function openMap() {
                    window.open('https://www.google.com/maps?q=Ростов-на-Дону,+ул.+Пушкинская+46', '_blank');
                }
            });
        });
    }
});