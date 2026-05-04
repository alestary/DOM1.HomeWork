"use strict";
import { comments } from './comments.js';
import { escapeHtml } from './replaceAll.js';
import { renderComments } from './render.js';
import { initEventHandlers } from './init.js';

const API_URL = "https://webdev-hw-api.vercel.app/api/v1/alestary/comments";

function fetchComments() {
  return fetch(API_URL)
    .then(response => {
      if (!response.ok) throw new Error("Ошибка загрузки комментариев");
      return response.json();
    })
    .then(data => {
      comments.length = 0;
      data.comments.forEach(c => {
        comments.push({
          ...c,
          isLiked: false
        });
      });
    });
}

function addComment(name, text) {
  const escapedName = escapeHtml(name.trim());
  const escapedText = escapeHtml(text.trim());

  if (!escapedName || !escapedText) {
    alert("Пожалуйста, заполните оба поля");
    return;
  }

  const postBody = { name: escapedName, text: escapedText };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postBody)
  })
    .then(response => {
      if (!response.ok) throw new Error("Ошибка при отправке комментария");
      return response.json();
    })
    .then(data => {
      comments.push({
        ...data.comment,
        isLiked: false
      });
      renderComments();
    })
    .catch(error => {
      alert("Не удалось добавить комментарий: " + error.message);
    });
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

document.addEventListener("DOMContentLoaded", () => {
  fetchComments()
    .then(() => {
      renderComments();
      initEventHandlers();

      const nameInput = document.getElementById("name-input");
      const commentInput = document.getElementById("comment-input");
      const addButton = document.getElementById("add-button");

      addButton.addEventListener("click", () => {
        addComment(nameInput.value, commentInput.value);
        nameInput.value = "";
        commentInput.value = "";
        nameInput.focus();
      });

      commentInput.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.key === "Enter") {
          addComment(nameInput.value, commentInput.value);
          nameInput.value = "";
          commentInput.value = "";
          nameInput.focus();
        }
      });

      console.log("Приложение загружено! Лайки работают.");
    })
    .catch(error => {
      alert("Не удалось загрузить комментарии: " + error.message);
      renderComments();
      initEventHandlers();
    });
});