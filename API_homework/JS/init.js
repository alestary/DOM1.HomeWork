import { comments } from './comments.js';
import { renderComments } from './render.js';
import { API_URL } from './config.js';

function initEventHandlers() {
  const commentsList = document.getElementById('comments-list');

  if (!commentsList) {
    return;
  }

  commentsList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('like-button')) {
      await handleLike(event.target.dataset.id);
      return;
    }

    const commentElement = event.target.closest('.comment');

    if (!commentElement) {
      return;
    }

    const commentId = commentElement.dataset.id;
    const comment = comments.find(
      (item) => item.id === commentId
    );

    if (!comment) {
      return;
    }

    const commentInput =
      document.getElementById('comment-input');

    if (!commentInput) {
      return;
    }

    const replyText = `> ${comment.name}:\n${comment.text}\n\n`;

    commentInput.value = replyText;
    commentInput.focus();
    commentInput.scrollIntoView({ behavior: 'smooth' });
  });
}

async function handleLike(commentId) {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Чтобы поставить лайк, авторизуйтесь');
    window.location.hash = '#login';
    return;
  }

  const likeButton = document.querySelector(
    `.like-button[data-id="${CSS.escape(commentId)}"]`
  );

  if (likeButton) {
    likeButton.disabled = true;
  }

  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(commentId)}/toggle-like`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userLogin');

      alert('Сессия закончилась. Авторизуйтесь снова.');
      window.location.hash = '#login';
      return;
    }

    if (!response.ok) {
      throw new Error('Не удалось изменить лайк');
    }

    const data = await response.json();
    const comment = comments.find(
      (item) => item.id === commentId
    );

    if (!comment || !data.result) {
      return;
    }

    comment.likes = data.result.likes;
    comment.isLiked = data.result.isLiked;

    renderComments();
  } catch (error) {
    console.error(error);
    alert(
      error.message || 'Не удалось изменить лайк'
    );
  }
}

export { initEventHandlers };
