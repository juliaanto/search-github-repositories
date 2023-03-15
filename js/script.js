import { Octokit } from "https://cdn.skypack.dev/octokit";

const octokit = new Octokit({});
const form = document.forms["search"];
const repositoriesElement = document.querySelector('.repositories');
const loader = document.querySelector('.loader');

form.onsubmit = async (event) => {
  event.preventDefault();
  const queryString = form.elements.q.value;
  const isSearchQueryValid = validateSearchInput(queryString);

  if (isSearchQueryValid) {
    loader.hidden = false;
    repositoriesElement.innerHTML = '';
    
    try {
      const result = await octokit.request("GET /search/repositories", {
        q: queryString,
      });
      loader.hidden = true;
      const repositories = result.data.items.slice(0, 10);
      showRepositories(repositories);
    } catch (error) {
      loader.hidden = true;
      handleError(error.status);
    }
  }
}

function showRepositories(repositories) {
  for (const repository of repositories) {
    repositoriesElement.insertAdjacentHTML('beforeend', `
      <div class="repository">
        <a class="repository__link" href="${repository.html_url}" target="_blank">${repository.owner.login}/<em class="repository__name">${repository.name}</em></a>
      </div>
    `)
  }
}

function handleError(statusCode) {
  const httpResponseStatus = {
    'OK': 200,
    'Validation failed': 422,
    'Service unavailable': 503,
  }

  switch (statusCode) {
      case httpResponseStatus['Validation failed']:
        showMessage('Некорректный поисковой запрос. Попробуйте еще раз.')
        break;
      case httpResponseStatus['Service unavailable']:
        showMessage('Сервис временно недоступен')
        break;
      default:
        showMessage('Произошла ошибка. Попробуйте еще раз.');
    }
}

function showMessage(text) {
  repositoriesElement.insertAdjacentHTML('beforeend', `
    <p>${text}</>
  `)
}

function validateSearchInput(text) {
  let isValid = false;
  
  if (text.length === 0) {
    showInvalidInputMessage('Задан пустой поисковый запрос');
  } else if (text.length > 256) {
    showInvalidInputMessage('Превышено максимальное количество символов (256)');
  } else {
    isValid = true;
  }

  return isValid;
}

function showInvalidInputMessage(message) {
  const searchField = form.querySelector('.search__field');
  const inputElement = searchField.querySelector('.search__input');
  
  inputElement.classList.add('search__input_invalid');

  if (!searchField.querySelector('.search-field__message')) {
    searchField.insertAdjacentHTML('beforeend', `
    <p class="search-field__message">${message}</p>
  `)
  }

  inputElement.oninput = () => {
    if (inputElement.classList.contains('search__input_invalid')) {
      inputElement.classList.remove('search__input_invalid');
      searchField.querySelector('.search-field__message').remove();
    }
  }
}
