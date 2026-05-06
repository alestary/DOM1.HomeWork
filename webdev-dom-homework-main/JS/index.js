import { loadComments } from './comments.js';
import { renderComments } from './render.js';
import { initEventHandlers } from './init.js';
import { API_URL } from './config.js';

async function addComment(name, text) {
  const trimmedName = name.trim();
  const trimmedText = text.trim();

  if (trimmedName.length < 3 || trimmedText.length < 3) {
    alert('Имя и текст должны содержать не менее 3 символов');
    return false;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: trimmedName,
      text: trimmedText,
    }),
  });

  if (response.status === 400) {
    const errorData = await response.json();
    alert(errorData.error);
    return false;
  }

  if (!response.ok) {
    alert('Не удалось добавить комментарий');
    return false;
  }

  await loadComments();
  renderComments();

  return true;
}

document.addEventListener('DOMContentLoaded', async () => {
  const nameInput = document.getElementById('name-input');
  const commentInput = document.getElementById('comment-input');
  const addButton = document.getElementById('add-button');

  initEventHandlers();

  await loadComments();
  renderComments();

  addButton.addEventListener('click', async () => {
    const success = await addComment(nameInput.value, commentInput.value);

    if (success) {
      nameInput.value = '';
      commentInput.value = '';
      nameInput.focus();
    }
  });

  commentInput.addEventListener('keydown', async (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      const success = await addComment(nameInput.value, commentInput.value);

      if (success) {
        nameInput.value = '';
        commentInput.value = '';
        nameInput.focus();
      }
    }
  });
});