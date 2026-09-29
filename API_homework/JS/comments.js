import { API_URL } from './config.js';

export let comments = [];

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isNetworkError(error) {
  return error instanceof TypeError;
}

export function loadComments() {
  return fetch(API_URL)
    .then(async (response) => {
      if (response.status === 500) {
        throw new ApiError('Сервер сломался', 500);
      }

      if (!response.ok) {
        let message = `Ошибка загрузки: ${response.status}`;

        try {
          const errorData = await response.json();

          if (errorData.error) {
            message = errorData.error;
          }
        } catch {
          // У ответа может не быть JSON-тела.
        }

        throw new ApiError(message, response.status);
      }

      return response.json();
    })
    .then((data) => {
      comments = Array.isArray(data.comments)
        ? data.comments.map((comment) => ({
            id: comment.id,
            name: comment.author.name,
            date: formatDateFromISO(comment.date),
            text: comment.text,
            likes: comment.likes,
            isLiked: comment.isLiked,
          }))
        : [];
    });
}

export function formatDateFromISO(isoString) {
  const date = new Date(isoString);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1)
    .toString()
    .padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
