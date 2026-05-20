import { loadComments } from './comments.js';
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

function renderLoadingAddButton() {
  addButton.disabled = true;
  addButton.textContent = 'Комментарий добавляется...';
}

function renderDefaultAddButton() {
  addButton.disabled = false;
  addButton.textContent = 'Написать';
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: trimmedName,
      text: trimmedText,
    }),
  })
    .then((response) => {
      if (response.status === 400) {
        return response.json().then((errorData) => {
          alert(errorData.error);
          return false;
        });
      }

      if (!response.ok) {
        throw new Error('Не удалось добавить комментарий');
      }

      return loadComments().then(() => {
        renderComments();
        return true;
      });
    })
    .catch((error) => {
      console.error(error);
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

  renderLoadingComments();

  loadComments()
    .then(() => {
      renderComments();
    })
    .catch((error) => {
      console.error(error);
      commentsList.innerHTML = `
        <li class="comment">
          <div class="comment-body">
            <div class="comment-text">Не удалось загрузить комментарии</div>
          </div>
        </li>
      `;
    });

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