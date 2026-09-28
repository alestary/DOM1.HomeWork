import {
  loadComments,
  isNetworkError,
  ApiError,
} from './comments.js';
import { renderComments } from './render.js';
import { initEventHandlers } from './init.js';
import { API_URL } from './config.js';
import { renderLogin } from './login.js';

let isAddingComment = false;

function getToken() {
  return localStorage.getItem('token');
}

function getUserName() {
  return localStorage.getItem('userName');
}

function isAuthorized() {
  return Boolean(getToken());
}

function renderLoadingComments() {
  const commentsList = document.getElementById('comments-list');

  commentsList.innerHTML = `
    <li class="comment">
      <div class="comment-body">
        <div class="comment-text">Комментарии загружаются...</div>
      </div>
    </li>
  `;
}

function renderErrorComments(message) {
  const commentsList = document.getElementById('comments-list');

  commentsList.innerHTML = `
    <li class="comment">
      <div class="comment-body">
        <div class="comment-text">${message}</div>
      </div>
      <div class="comment-footer">
        <button class="add-form-button" id="retry-load-button">
          Повторить
        </button>
      </div>
    </li>
  `;

  document
    .getElementById('retry-load-button')
    .addEventListener('click', loadAndRenderComments);
}

function renderCommentsPage() {
  const app = document.getElementById('app');
  const authorized = isAuthorized();

  app.innerHTML = `
    <div class="container">
      <ul class="comments" id="comments-list"></ul>

      ${
        authorized
          ? `
            <div class="add-form">
              <input
                type="text"
                class="add-form-name"
                id="name-input"
                readonly
              />

              <textarea
                class="add-form-text"
                placeholder="Введите ваш комментарий"
                rows="4"
                id="comment-input"
              ></textarea>

              <div class="add-form-row">
                <button
                  class="add-form-button"
                  id="add-button"
                >
                  Написать
                </button>
              </div>
            </div>
          `
          : `
            <div class="auth-message">
              <a href="#login">
                Чтобы добавить комментарий, авторизуйтесь
              </a>
            </div>
          `
      }
    </div>
  `;

  loadAndRenderComments();
  initEventHandlers();

  if (!authorized) {
    return;
  }

  const nameInput = document.getElementById('name-input');
  const commentInput = document.getElementById('comment-input');
  const addButton = document.getElementById('add-button');

  nameInput.value = getUserName() || '';

  addButton.addEventListener('click', () => {
    addComment(commentInput.value);
  });

  commentInput.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      addComment(commentInput.value);
    }
  });

  function addComment(text) {
    const trimmedText = text.trim();

    if (trimmedText.length < 3) {
      alert('Комментарий должен содержать не менее 3 символов');
      return;
    }

    if (isAddingComment) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert('Сначала авторизуйтесь');
      window.location.hash = '#login';
      return;
    }

    isAddingComment = true;
    addButton.disabled = true;
    addButton.textContent = 'Комментарий добавляется...';

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: trimmedText,
      }),
    })
      .then(async (response) => {
        if (response.status === 400) {
          const errorData = await response.json();

          throw new Error(
            errorData.error ||
              'Проверьте правильность комментария'
          );
        }

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          localStorage.removeItem('userLogin');

          throw new Error(
            'Сессия закончилась. Авторизуйтесь снова.'
          );
        }

        if (response.status === 500) {
          throw new ApiError('Сервер сломался', 500);
        }

        if (!response.ok) {
          throw new ApiError(
            `Ошибка добавления: ${response.status}`,
            response.status
          );
        }

        return response.json();
      })
      .then(() => loadComments())
      .then(() => {
        renderComments();
        commentInput.value = '';
      })
      .catch((error) => {
        console.error(error);

        if (error.message.includes('Сессия закончилась')) {
          alert(error.message);
          window.location.hash = '#login';
          return;
        }

        if (isNetworkError(error)) {
          alert(
            'Похоже, у вас пропал интернет. Попробуйте позже.'
          );
          return;
        }

        if (
          error instanceof ApiError &&
          error.status === 500
        ) {
          alert(
            'Сервер сломался. Попробуйте отправить комментарий позже.'
          );
          return;
        }

        alert(
          error.message ||
            'Не удалось добавить комментарий'
        );
      })
      .finally(() => {
        isAddingComment = false;
        addButton.disabled = false;
        addButton.textContent = 'Написать';
      });
  }
}

function loadAndRenderComments() {
  renderLoadingComments();

  return loadComments()
    .then(() => {
      renderComments();
    })
    .catch((error) => {
      console.error(error);

      if (isNetworkError(error)) {
        renderErrorComments(
          'Похоже, у вас пропал интернет. Проверьте соединение.'
        );
        return;
      }

      renderErrorComments(
        'Не удалось загрузить комментарии. Попробуйте позже.'
      );
    });
}

function renderCurrentPage() {
  if (window.location.hash === '#login') {
    renderLogin();
    return;
  }

  renderCommentsPage();
}

window.addEventListener('hashchange', renderCurrentPage);

document.addEventListener('DOMContentLoaded', () => {
  renderCurrentPage();
});
