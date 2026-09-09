import { loadComments, isNetworkError, ApiError } from './comments.js';
import { renderComments } from './render.js';
import { initEventHandlers } from './init.js';
import { API_URL } from './config.js';
 
const commentsList = document.getElementById('comments-list');
const nameInput = document.getElementById('name-input');
const commentInput = document.getElementById('comment-input');
const addButton = document.getElementById('add-button');
 
let isAddingComment = false;
 
function renderLoadingComments() {
  commentsList.innerHTML = `
    <li class="comment">
      <div class="comment-body">
        <div class="comment-text">Комментарии загружаются...</div>
      </div>
    </li>
  `;
}
 
function renderErrorComments(message) {
  commentsList.innerHTML = `
    <li class="comment">
      <div class="comment-body">
        <div class="comment-text">${message}</div>
      </div>
      <div class="comment-footer">
        <button class="add-form-button" id="retry-load-button">Повторить</button>
      </div>
    </li>
  `;
 
  const retryButton = document.getElementById('retry-load-button');
  retryButton.addEventListener('click', () => {
    loadAndRenderComments();
  });
}
 
function renderLoadingAddButton() {
  addButton.disabled = true;
  addButton.textContent = 'Комментарий добавляется...';
}
 
function renderDefaultAddButton() {
  addButton.disabled = false;
  addButton.textContent = 'Написать';
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
          'Похоже, у вас пропал интернет. Проверьте соединение и нажмите «Повторить».'
        );
        return;
      }
 
      renderErrorComments('Не удалось загрузить комментарии. Попробуйте позже.');
    });
}
 
function addComment(name, text) {
  const trimmedName = name.trim();
  const trimmedText = text.trim();
 
  if (trimmedName.length < 3 || trimmedText.length < 3) {
    alert('Имя и текст должны содержать не менее 3 символов');
    return Promise.resolve(false);
  }
 
  if (isAddingComment) {
    return Promise.resolve(false);
  }
 
  isAddingComment = true;
  renderLoadingAddButton();
 
  return fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      name: trimmedName,
      text: trimmedText,
    }),
  })
    .then((response) => {
      if (response.status === 400) {
        return response.json().then((errorData) => {
          alert(errorData.error || 'Проверьте правильность заполнения формы');
          return false;
        });
      }
 
      if (response.status === 500) {
        throw new ApiError('Сервер сломался', 500);
      }
 
      if (!response.ok) {
        throw new ApiError('Не удалось добавить комментарий', response.status);
      }
 
      return loadComments().then(() => {
        renderComments();
        return true;
      });
    })
    .catch((error) => {
      console.error(error);
      
      if (isNetworkError(error)) {
        alert('Похоже, у вас пропал интернет. Проверьте соединение и повторите попытку позже.');
        return false;
      }
 
      if (error instanceof ApiError && error.status === 500) {
        alert('Сервер сломался. Попробуйте отправить комментарий позже.');
        return false;
      }
 
      alert('Не удалось добавить комментарий. Попробуйте позже.');
      return false;
    })
    .finally(() => {
      isAddingComment = false;
      renderDefaultAddButton();
    });
}
 
document.addEventListener('DOMContentLoaded', () => {
  initEventHandlers();
 
  loadAndRenderComments();
 
  addButton.addEventListener('click', () => {
    addComment(nameInput.value, commentInput.value).then((success) => {
      if (success) {
        nameInput.value = '';
        commentInput.value = '';
        nameInput.focus();
      }
    });
  });
 
  commentInput.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      addComment(nameInput.value, commentInput.value).then((success) => {
        if (success) {
          nameInput.value = '';
          commentInput.value = '';
          nameInput.focus();
        }
      });
    }
  });
});
 