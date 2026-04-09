import { API_URL } from './config.js';

let comments = [];

async function loadComments() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }
    const data = await response.json();

    comments = data.comments.map(comment => ({
      id: comment.id,
      name: comment.author.name,
      date: formatDateFromISO(comment.date), 
      text: comment.text,
      likes: comment.likes,
      isLiked: comment.isLiked
    }));

    renderComments();
  } catch (error) {
    console.error(error);
    alert('Не удалось загрузить комментарии. Попробуйте позже.');
  }
}

function formatDateFromISO(isoString) {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export {loadComments};
export {comments};
export {formatDateFromISO};