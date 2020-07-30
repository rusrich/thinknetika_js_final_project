const btn = document.getElementById('find-user')
btn.addEventListener('click', getUserInfo)

const selectRepo = document.getElementById('repos-list')
selectRepo.addEventListener('change', getReposInfo)

function getWarning(message, display = 'block') {
  const warning = document.getElementById('warning')
  warning.style.display = display
  warning.innerHTML = message
}

function getUsername() {
  let regexp = /[a-z0-9_\-]/
  let username = document.getElementById('username').value
  getWarning('', 'none')
  if (regexp.test(username)) {
    return username
  } else {
    getWarning(`${username} - некорректное имя пользователя. Попробуйте еще раз`, 'block')
  }
}

async function getUserInfo() {
  try {
    const username = await getUsername()
    const urlProfile = `https://api.github.com/users/${username}`
    const getDat = await getData(urlProfile)
    await cleanIssueList()
    const getRepDat = await getReposData(getDat)
    const getReps = await getData(getRepDat)
    await getRepos(getReps)
  } catch (err) {
    console.error('Ошибка: ', err)
  }
}

async function getReposInfo() {
  let selectRepoValue = selectRepo.options[selectRepo.selectedIndex].getAttribute('link')
  try {
    const urlRepo = await getData(selectRepoValue)
    await getReposInfoData(urlRepo)
  } catch (err) {
    console.error('Ошибка: ', err)
  }
}

function getReposData(data) {
  const userInfo = document.getElementById('user-info')
  const userAvatar = document.createElement('img')
  userAvatar.setAttribute('src', data.avatar_url)
  userInfo.innerHTML = `
        <div id="info-bl"><b>Пользователь: </b>${data.login}</div>
        <div id="info-bl"><b>Создан: </b>${data.created_at}</div>
        <div id="info-bl"><b>Ссылка: </b>${data.html_url}</div>
        <div id="info-bl"><b>Кол-во репозиториев: </b>${data.public_repos}</div>
        `
  userInfo.prepend(userAvatar)
  let reposUrl = data.repos_url
  return reposUrl
}

function getRepos(reposList) {
  const reposListSelect = document.getElementById('repos-list')
  reposListSelect.innerHTML = `<option selected="selected" disabled>Выберите репозиторий</option>`
  reposListSelect.style.display = 'inline-block'
  reposListSelect.style.width = '200px'
  reposCount = reposList.length
  getWarning('', 'none')
  if (reposCount > 0) {
    for (let i = 0; i < reposCount; i++) {
      const option = document.createElement('option')
      option.innerHTML = reposList[i].name
      option.setAttribute('link', reposList[i].url + '/issues')
      reposListSelect.append(option)
    }
  } else {
    getWarning('У пользователя нет репозиториев')
  }
}

function cleanIssueList() {
  const issuesBlock = document.getElementById('issues')
  issuesBlock.innerHTML = ''
  return issuesBlock
}

function getReposInfoData(data) {
  const countRepos = data.length
  const issuesBlock = cleanIssueList()
  getWarning('', 'none')
  if (countRepos > 0) {
    for (let i = 0; i < countRepos; i++) {
      const elIssue = document.createElement('div')
      elIssue.setAttribute('id', 'issue')
      issuesBlock.append(elIssue)
      const elInfo = document.createElement('div')
      elInfo.setAttribute('id', 'info')
      elInfo.innerHTML = ''
      elInfo.innerHTML = `
            <div id="number-issue">${i + 1}</div>
            <a id="title-link" href="#" target="_blank"><h2>${data[i].title}</h2></a>
            <div id="info-block"><span>Создано</span>${data[i].created_at}</div>
            <div id="info-block"><span>Обновлено</span>${data[i].updated_at}</div>
            <div id="info-block"><span>Статус</span>${data[i].state}</div>
            <div id="info-block"><span>Пользователь</span>${data[i].user['login']}</div>
            `
      elIssue.append(elInfo)
      const titleLink = document.getElementById('title-link')
      titleLink.setAttribute('href', data[i].html_url)
    }
    return data
  } else {
    getWarning('У пользователя нет репозиториев')
  }
}

function getData(url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest()
    console.log('UNSENT: ', xhr.status)
    xhr.open('GET', url)
    console.log('OPENED: ', xhr.status)
    xhr.onprogress = function () {
      console.log('LOADING: ', xhr.status)
    }
    getWarning('', 'none')
    xhr.onload = function () {
      if (xhr.status !== 200) {
        reject('Ошибка 404', xhr.status)
        getWarning('Пользователь не найден')
        return
      } else {
        resolve(JSON.parse(xhr.response))
        console.log('DONE: ', xhr.status)
      }
    }
    xhr.send()
  })
}