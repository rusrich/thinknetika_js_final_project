const btn = document.getElementById('find-user')
btn.addEventListener('click', getUserInfo)

const btn2 = document.getElementById('find-issue')
btn2.style.display = 'none'
// btn2.addEventListener('click', getReposInfo)

function getUserInfo(event) {
  return new Promise((resolve, reject) => {
    event.preventDefault()
    let username = document.getElementById('username').value
    console.log(username)
    let urlProfile = `https://api.github.com/users/${username}`
    if (username) {
      resolve(urlProfile)
    }
  }).then((url) => {
    getData(url)
      .then((data) => {
        console.log(data)
        console.log(data.repos_url)
        const userInfo = document.getElementById('user-info')
        const userAvatar = document.createElement('img')
        userAvatar.setAttribute('src', data.avatar_url)
        console.log(data.avatar_url)
        userInfo.innerHTML = `
        <div id="info-bl"><b>Пользователь: </b>${data.login}</div>
        <div id="info-bl"><b>Создан: </b>${data.created_at}</div>
        <div id="info-bl"><b>Ссылка: </b>${data.html_url}</div>
        <div id="info-bl"><b>Кол-во репозиториев: </b>${data.public_repos}</div>
        `
        userInfo.prepend(userAvatar)
        return data.repos_url
      })
      .then((repoData) => {
        // btn.style.display = 'none'
        // btn2.style.display = 'inline-block'
        console.log(repoData)
        return getData(repoData)
      })
      .then((reposList) => {
        console.log(reposList)
        const reposListSelect = document.getElementById('repos-list')
        reposListSelect.innerHTML = `<option selected="selected" disabled>Выберите репозиторий</option>`
        reposListSelect.style.display = 'inline-block'
        reposListSelect.style.width = '200px'
        reposCount = reposList.length
        for (let i = 0; i < reposCount; i++) {
          console.log(reposList[i].name)
          const option = document.createElement('option')
          option.innerHTML = reposList[i].name
          option.setAttribute('link', reposList[i].url + '/issues')
          reposListSelect.append(option)
        }
      })
  })
}

let selectRepo = document.getElementById('repos-list')
selectRepo.addEventListener('change', getReposInfo)

function getReposInfo(event) {
  return new Promise((resolve, reject) => {
    event.preventDefault()
    // let selectRepo = document.getElementById('repos-list')
    let selectRepoValue = selectRepo.options[selectRepo.selectedIndex].getAttribute('link')
    console.log(selectRepoValue)
    resolve(selectRepoValue)
  }).then((urlRepo) => {
    getData(urlRepo)
      .then((data) => {
        console.log(data)
        const countRepos = data.length
        const issuesBlock = document.getElementById('issues')
        issuesBlock.innerHTML = ''
        for (let i = 0; i < countRepos; i++) {
          const elIssue = document.createElement('div')
          elIssue.setAttribute('id', 'issue')
          issuesBlock.append(elIssue)
          const elInfo = document.createElement('div')
          elInfo.setAttribute('id', 'info')
          elInfo.innerHTML = `
            <div id="number-issue">${i}</div>
            <a href="#"><h2>${data[i].title}</h2></a>
            <div id="info-block"><span>Создано</span>${data[i].created_at}</div>
            <div id="info-block"><span>Обновлено</span>${data[i].updated_at}</div>
            <div id="info-block"><span>Статус</span>${data[i].state}</div>
            <div id="info-block"><span>Пользователь</span>${data[i].user['login']}</div>
            `
          elIssue.append(elInfo)
        }
        return data
      })
  })
}

/*function renderUserInfo() {
  const userInfo = document.getElementById('user-info')

}*/

function getData(url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest()
    console.log('UNSENT: ', xhr.status);
    xhr.open('GET', url)
    console.log('OPENED: ', xhr.status);
    xhr.onprogress = function () {
      console.log('LOADING: ', xhr.status);
    };
    xhr.onload = function () {
      if (xhr.status !== 200) {
        reject(xhr.status)
        return
      } else {
        resolve(JSON.parse(xhr.response))
        console.log('DONE: ', xhr.status);
      }
    }
    xhr.send()
  })
}
