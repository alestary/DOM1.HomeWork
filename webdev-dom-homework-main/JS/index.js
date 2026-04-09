"use strict";
import { comments, loadComments } from './comments.js';
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

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, text: trimmedText })
    });

    if (response.status === 400) {
      const errorData = await response.json();
      alert(`Ошибка: ${errorData.error}`);
      return false;
    }

    if (!response.ok) {
      throw new Error(`Ошибка при добавлении: ${response.status}`);
    }

    await loadComments(); 
    renderComments();
    return true;
  } catch (error) {
    console.error(error);
    alert('Не удалось добавить комментарий. Попробуйте позже.');
    return false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initEventHandlers();

  await loadComments();
  renderComments();

  const nameInput = document.getElementById("name-input");
  const commentInput = document.getElementById("comment-input");
  const addButton = document.getElementById("add-button");

  addButton.addEventListener("click", async () => {
    const name = nameInput.value;
    const text = commentInput.value;
    const success = await addComment(name, text);
    if (success) {
      nameInput.value = "";
      commentInput.value = "";
      nameInput.focus();
    }
  });

  commentInput.addEventListener("keydown", async (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      const name = nameInput.value;
      const text = commentInput.value;
      const success = await addComment(name, text);
      if (success) {
        nameInput.value = "";
        commentInput.value = "";
        nameInput.focus();
      }
    }
  });

  console.log("Приложение загружено! Лайки работают.");
});