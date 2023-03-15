import { Octokit } from "https://cdn.skypack.dev/octokit";

const form = document.forms["search"];
const repositoriesElement = document.querySelector('.repositories');
const loader = document.querySelector('.loader');

form.onsubmit = async (event) => {
  event.preventDefault();

  loader.hidden = false;
  repositoriesElement.innerHTML = '';
  const queryString = form.elements.q.value;
  const octokit = new Octokit({});

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