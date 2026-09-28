import { LOGIN_URL } from './config.js';

export function renderLogin() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="login-page">
      <div class="login-form">
        <h1 class="login-title">Вход</h1>

        <input
          id="login-input"
          class="add-form-name"
          type="text"
          placeholder="Введите логин"
        />

        <input
          id="password-input"
          class="add-form-name login-password"
          type="password"
          placeholder="Введите пароль"
        />

        <div class="add-form-row">
          <button id="login-button" class="add-form-button">
            Войти
          </button>
        </div>

        <button id="back-to-comments" class="back-button">
          Назад к комментариям
        </button>
      </div>
    </div>
  `;

  const loginButton = document.getElementById('login-button');
  const loginInput = document.getElementById('login-input');
  const passwordInput = document.getElementById('password-input');
  const backButton = document.getElementById('back-to-comments');

  backButton.addEventListener('click', () => {
    window.location.hash = '';
  });

  loginButton.addEventListener('click', () => {
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    if (!login || !password) {
      alert('Введите логин и пароль');
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Входим...';

    fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login,
        password,
      }),
    })
      .then((response) => {
        if (response.status === 400) {
          return response.json().then((errorData) => {
            throw new Error(
              errorData.error || 'Неверный логин или пароль'
            );
          });
        }

        if (!response.ok) {
          throw new Error('Не удалось выполнить вход');
        }

        return response.json();
      })
      .then((data) => {
        const user = data.user;

        localStorage.setItem('token', user.token);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userLogin', user.login);

        window.location.hash = '';
      })
      .catch((error) => {
        console.error(error);
        alert(error.message || 'Не удалось выполнить вход');
      })
      .finally(() => {
        loginButton.disabled = false;
        loginButton.textContent = 'Войти';
      });
  });
}