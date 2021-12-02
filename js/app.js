const baseURL = 'https://bs-api-rest.herokuapp.com';
const api = new BookAPI(baseURL);

const $booksWrapper = document.getElementById('books');
const $modal = document.getElementById('modal');
const $closeModalBtn = document.getElementById('close-modal');
const $messageWrapper = document.getElementById('message');
const $modalFormEdit = document.getElementById('modal-form-edit');
const $formMessage = document.getElementById('form-message');
const $addBookBtn = document.getElementById('add-book');
const $modalFormAdd = document.getElementById('modal-form-add');

// When the page is loaded show all the books.
showBooksOnScreen();

/**
 * General events.
 */

$closeModalBtn.addEventListener('click', () => {
  $modal.style.display = 'none';
  document.body.style.overflow = 'initial';
});

document.addEventListener('click', (event) => {
  if (event.target === $modal) {
    $modal.style.display = 'none';
    document.body.style.overflow = 'initial';
  }
});

$modalFormEdit.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const bookId = sessionStorage.getItem('editBookId');
  
  const formData = new FormData($modalFormEdit);
  // Transforms data types to send it in JSON.
  const formDataCorrectTypes = [...formData.entries()].map((arrData) => {
    if (arrData[0] === 'paginas' || arrData[0] === 'ano_publicacao') {
      arrData[1] = parseInt(arrData[1]);
    }
    if (arrData[0] === 'preco') {
      arrData[1] = parseFloat(arrData[1]);
    }
    return arrData;
  });
  const objFormData = Object.fromEntries(formDataCorrectTypes);

  try {
    const res = await api.updateBook(bookId, objFormData);

    $formMessage.textContent = res.msg;
    $formMessage.classList.remove('-error');
    $formMessage.classList.add('-success');
    $formMessage.style.display = 'block';
  } catch (err) {
    $formMessage.textContent = err.message;
    $formMessage.classList.remove('-success');
    $formMessage.classList.add('-error');
    $formMessage.style.display = 'block';
  } finally {
    setTimeout(() => $formMessage.style.display = 'none', 8000);
  }
});

$addBookBtn.addEventListener('click', () => {
  $modalFormEdit.classList.add('hidden');
  $modalFormAdd.classList.remove('hidden');

  $modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
});

$modalFormAdd.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const formData = new FormData($modalFormAdd);
  // Transforms data types to send it in JSON.
  const formDataCorrectTypes = [...formData.entries()].map((arrData) => {
    if (['paginas', 'ano_publicacao', 'id_editora', 'id_autor'].includes(arrData[0])) {
      arrData[1] = parseInt(arrData[1]);
    }
    if (arrData[0] === 'preco') {
      arrData[1] = parseFloat(arrData[1]);
    }
    return arrData;
  });
  const objFormData = Object.fromEntries(formDataCorrectTypes);

  try {
    const res = await api.addBook(objFormData);

    $formMessage.textContent = res.msg;
    $formMessage.classList.remove('-error');
    $formMessage.classList.add('-success');
    $formMessage.style.display = 'block';

    const newBookCard = createBookCard(res.createdBook);
    $booksWrapper.appendChild(newBookCard);
  } catch (err) {
    $formMessage.textContent = err.message;
    $formMessage.classList.remove('-success');
    $formMessage.classList.add('-error');
    $formMessage.style.display = 'block';
  } finally {
    setTimeout(() => $formMessage.style.display = 'none', 8000);
  }
});

/**
 * Functions.
 */

async function showBooksOnScreen() {
  // @TODO Handle errors with try..catch block.
  const data = await api.getBooks();
  listBooks(data.books, $booksWrapper);
}

function listBooks(books) {
  books.forEach((book) => {
    const card = createBookCard(book);
    $booksWrapper.insertAdjacentElement('beforeend', card);
  });
}

function createBookCard(book) {
  const card = document.createElement('figure');
  
  card.id = book.id_livro;
  card.className = 'book';
  card.innerHTML = `
    <div class="book-icons"></div>
    <img class="book-img" src="${book.url_img}" alt="Capa do livro ${book.titulo}">
    <figcaption>
      <article>
        <h3 class="book-title ellipsis" title="${book.titulo}">
          ${book.titulo}
        </h3>
        <p class="book-description ellipsis" title="${book.descricao}">
          ${book.descricao}
        </p>
        <p class="book-price"><strong>R$ ${book.preco}</strong></p>
      </article>
      <a class="btn -full" href="./" title="Clique para saber mais">
        Saiba mais
      </a>
    </figcaption>
  `;

  const editBtn = createEditBookBtn(book);
  const delBtn = createDeleteBookBtn(book, card);

  const iconsWrapper = card.querySelector('.book-icons');
  
  iconsWrapper.insertAdjacentElement('beforeend', editBtn);
  iconsWrapper.insertAdjacentElement('beforeend', delBtn);

  return card;
}

function createEditBookBtn(book) {
  const editBtn = document.createElement('button');
  
  editBtn.className = 'btn-icon';
  editBtn.id = 'edit-book';
  editBtn.title = 'Editar';
  editBtn.innerHTML = '<span class="fas fa-edit"></span>';

  // Event to open the modal with the form to edit the book info.
  editBtn.addEventListener('click', () => {
    // Sets session storage to send the updated data to the correct book.
    sessionStorage.setItem('editBookId', book.id_livro);

    $modalFormAdd.classList.add('hidden');
    $modalFormEdit.classList.remove('hidden');
    
    // Sets initial values to inputs of edit book form.
    const bookValues = Object.values(book).slice(1, -2);
    const formEditInputs = Array.from(document.querySelectorAll('#modal-form-edit .modal-form-input'));
    
    for (let i = 0; i < formEditInputs.length; i++) {
      formEditInputs[i].value = bookValues[i];
    }

    $modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });

  return editBtn;
}

function createDeleteBookBtn(book, card) {
  const delBtn = document.createElement('button');
  
  delBtn.className = 'btn-icon -del';
  delBtn.id = 'del-book';
  delBtn.title = 'Excluir';
  delBtn.innerHTML = '<span class="fas fa-trash-alt"></span>';

  // Event to remove the book from the screen and from the database.
  delBtn.addEventListener('click', async () => {
    try {
      const res = await api.deleteBook(book.id_livro);

      card.remove();
      $messageWrapper.textContent = res.msg;
      $messageWrapper.classList.remove('-error');
      $messageWrapper.classList.add('-success');
      $messageWrapper.style.display = 'block';
    } catch (err) {
      $messageWrapper.textContent = err.message;
      $messageWrapper.classList.remove('-success');
      $messageWrapper.classList.add('-error');
      $messageWrapper.style.display = 'block';
    } finally {
      setTimeout(() => $messageWrapper.style.display = 'none', 5000);
    }
  });

  return delBtn;
}
