let where = ''
let editInput = ''
let howMany = 0
let total = 0
let spendArr = []
const spends = document.querySelector('#all_spends')
let editWhereInput = ''
let editPriceInput = ''
let editTimeInput = ''

// получить инпут в случае когда открывается 3 инпута
function getInputForAll(i) {
  editWhereInput = document.querySelector(`#edit_place_input-${i}`).value.trim()
  editPriceInput = Number(document.querySelector(`#edit_price_input-${i}`).value).toFixed(2)
  editTimeInput = document.querySelector(`#edit_time_input-${i}`).value
}

// получение задачек
async function fetchData() {
  try {
    setLoader()
    spendArr = await fetch('http://localhost:8000/allSpends',
        {
          method: 'GET', headers: {"Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*"}
        }).then(res => res.json())
    deleteLoader()
    render()
  } catch (error) {
    deleteLoader()
    setError('Ошибка в получении данных с сервера')
  }

}

// сохранить изменения в случае когда открывается 3 инпута
async function saveChangesForAll(i) {

  getInputForAll(i)
  if (editPriceInput <= 0 || editPriceInput > 9999999 || editWhereInput === '' || new Date(editTimeInput) > new Date() || new Date(editTimeInput) < new Date(1970)) {
    return setError('Введите корректные данные')
  }

  if (editWhereInput || editPriceInput) {
    try {
      setLoader()
      spendArr = await fetch('http://localhost:8000/spend', {
        method: 'PATCH',
        body: JSON.stringify({_id: spendArr[i]._id, place: editWhereInput, time: editTimeInput, price: editPriceInput}),
        headers: {"Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*"}
      }).then(res => res.json())
      deleteLoader()
      await fetchData()
    } catch (error) {
      deleteLoader()
      setError('Ошибка в получении данных с сервера')
    }
  } else render()
}


// инпут места для добавления новой задачи
function inputWhere() {
  where = document.querySelector('#where').value.trim()
}

// инпут цены для добавления новой задачи
function inputHowMany() {
  howMany = Number(document.querySelector('#how_many').value).toFixed(2)
  if (howMany <= 0) {
    howMany = 0
  }
}
// добавление задачи на enter
async function setEnter (event) {
  if (event.keyCode === 13) {
    event.preventDefault()
    await addSpend()
  }
}
document.addEventListener('keyup', setEnter)

// добавить задачу
async function addSpend() {

  if (!where || !howMany) {
    return setError('Введите корректные данные')
  }
  document.querySelector('#where').value = ''
  document.querySelector('#how_many').value = ''
  if (howMany > 9999999) {
    return setError('Введите корректные данные')
  }
  try {
    setLoader()
    await fetch('http://localhost:8000/spend', {
      method: 'POST',
      body: JSON.stringify({place: where, price: howMany}),
      headers: {"Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*"}
    }).then(res => res.json()).then(res => res.data)
    deleteLoader()
    howMany = ''
    where = ''
    await fetchData()
  } catch (error) {
    deleteLoader()
    setError('Ошибка в получении данных с сервера')
  }
}

// удалить задачу
async function deleteElement(id) {
  try {
    setLoader()
    await fetch(`http://localhost:8000/spend?_id=${id}`, {method: 'DELETE'}).then(res => res.json()).then(res => res.data)
    deleteLoader()
    await fetchData()
  } catch (error) {
    deleteLoader()
    setError('Ошибка в получении данных с сервера')
  }

}

// получить инпут когда открыто одно поле ввода
function getInput(elem, i) {
  editInput = document.querySelector(`#edit-${elem.split('-')[0]}-${i}`).value
  if (Number(editInput)) {
    editInput = Number(editInput).toFixed(2)
  }
  if (editInput <= 0) {
    editInput = 0
  }
}


// сохранить изменения когда открыто одно поле ввода
async function saveChanges(elem, i) {
  getInput(elem, i)
  if (editInput === 0 || Number(editInput) > 9999999 || new Date(editInput) > new Date() || new Date(editTimeInput) < new Date(1970)) {
    return setError('Введите корректные данные')
  }
  const type = elem.split('-')[0]
  spendArr[i][type] = editInput
  try {
    setLoader()
    spendArr = await fetch('http://localhost:8000/spend', {
      method: 'PATCH',
      body: JSON.stringify({
        _id: spendArr[i]._id,
        place: spendArr[i].place,
        time: spendArr[i].time,
        price: spendArr[i].price
      }),
      headers: {"Content-Type": "application/json;charset=utf-8", "Access-Control-Allow-Origin": "*"}
    }).then(res => res.json())
    deleteLoader()
    await fetchData()
    render()
  } catch (error) {
    deleteLoader()
    setError('Ошибка в получении данных с сервера')
  }

}

// открыть окно редактирования с одним полем ввода
function setEdit(elem, i) {
  document.removeEventListener('keyup', setEnter)
  render()
  const field = document.querySelector(`#${elem}`)
  const task = field.parentNode
  task.className = 'task';
  field.remove()
  const input = document.createElement('input')
  input.type = `${elem.split('-')[0] === 'price' ? 'number' : elem.split('-')[0] === 'time' ? 'date' : 'text'}`
  input.type === 'date' ? input.valueAsDate = new Date(spendArr[i][elem.split('-')[0]]) : input.value = `${spendArr[i][elem.split('-')[0]]}`
  input.classList.add('input_edit')
  input.id = `edit-${elem.split('-')[0]}-${i}`
  task.appendChild(input)
  task.addEventListener('focusout', () => render())

  input.addEventListener('keyup', async (event) => {
    if (event.keyCode === 13) {
      event.preventDefault()
      await saveChanges(elem, i)
    }
  })
}

// открыть окно редактирования с 3 полями ввода
function openEdit(i) {
  render()
  const task = document.querySelector(`#task-${i}`)
  task.innerHTML = ''


  const editPlaceInput = document.createElement('input')
  editPlaceInput.placeholder = 'Где'
  editPlaceInput.maxLength = 300
  editPlaceInput.id = `edit_place_input-${i}`
  editPlaceInput.value = spendArr[i].place
  editPlaceInput.classList.add('input_edit')
  task.appendChild(editPlaceInput)


  const editTimeInput = document.createElement('input')
  editTimeInput.id = `edit_time_input-${i}`
  editTimeInput.type = 'date'
  editTimeInput.valueAsDate = new Date(spendArr[i].time)
  editTimeInput.classList.add('input_edit')
  task.appendChild(editTimeInput)

  const editPriceInput = document.createElement('input')
  editPriceInput.placeholder = 'Потрачено'
  editPriceInput.id = `edit_price_input-${i}`
  editPriceInput.type = 'number'
  editPriceInput.classList.add('input_edit')
  editPriceInput.value = spendArr[i].price
  task.appendChild(editPriceInput)


  const saveButton = document.createElement('button')
  saveButton.innerText = 'Сохранить'
  saveButton.classList.add('btn')
  saveButton.addEventListener('click', () => saveChangesForAll(i))
  task.appendChild(saveButton)

  const cancelButton = document.createElement('button')
  cancelButton.innerText = 'Отмена'
  cancelButton.classList.add('btn')
  cancelButton.addEventListener('click', () => render())
  task.appendChild(cancelButton)
}

// создал лоадер
function setLoader() {
  const ring = document.createElement('div')
  ring.id = 'ring'
  ring.classList.add('lds-ring')
  spends.before(ring)

  let firstDiv = document.createElement('div')
  ring.appendChild(firstDiv)

  let secondDiv = document.createElement('div')
  ring.appendChild(secondDiv)

  let thirdDiv = document.createElement('div')
  ring.appendChild(thirdDiv)

  let fourthDiv = document.createElement('div')
  ring.appendChild(fourthDiv)
}

// удалил лоадер
function deleteLoader() {
  let load = document.getElementById('ring')
  load.remove()
}

function setError(str) {
  const errorDiv = document.createElement('div')
  errorDiv.classList.add('error')
  const errorText = document.createElement('span')
  errorText.innerText = str
  errorDiv.appendChild(errorText)
  spends.appendChild(errorDiv)
  setTimeout(() => {
    errorDiv.remove()
  }, 5000)
}

function reduceTotal () {
  total = spendArr.reduce((accum, el) => accum + el.price, 0)
}

// рендер
function render() {
  spends.innerHTML = ''
  const sum = document.createElement('div')
  sum.classList.add('sum')
  reduceTotal()
  sum.innerText = `Всего денег потрачено было : ${total} рублей`


  spendArr.forEach((el, i) => {
    // вся задача
    const container = document.createElement('div')
    container.id = `task-${i}`
    container.classList.add('container_task')


    const placeContainer = document.createElement('div')
    placeContainer.classList.add('element')
    container.appendChild(placeContainer)


    const place = document.createElement('span')
    place.innerText = `${el.place}`
    place.addEventListener('click', () => setEdit(place.id, i))
    placeContainer.appendChild(place)
    place.id = `place-${i}`


    const timeContainer = document.createElement('div')
    timeContainer.classList.add('element')
    container.appendChild(timeContainer)


    const time = document.createElement('span')
    time.innerText = `${new Date(el.time).toLocaleDateString('ru-ru')}`
    timeContainer.appendChild(time)
    time.addEventListener('click', () => setEdit(time.id, i))
    time.id = `time-${i}`

    const priceContainer = document.createElement('div')
    container.appendChild(priceContainer)
    priceContainer.classList.add('element')


    const price = document.createElement('span')
    price.innerText = `${el.price} ₽`
    price.addEventListener('click', () => setEdit(price.id, i))
    priceContainer.appendChild(price)
    price.id = `price-${i}`


    const deleteEl = document.createElement('button')
    deleteEl.innerText = 'Удалить'
    deleteEl.addEventListener('click', () => deleteElement(el._id))
    container.appendChild(deleteEl)
    deleteEl.classList.add('btn')
    deleteEl.id = `delete-${i}`

    const editTask = document.createElement('button')
    editTask.innerText = 'Изменить'
    container.appendChild(editTask)
    editTask.classList.add('btn')
    editTask.classList.add('edit_btn')
    editTask.id = `edit-${i}`
    editTask.addEventListener('click', () => {
      openEdit(i)
    })

    // див со всеми задачами
    spends.appendChild(container)
    spends.appendChild(sum)
  })
}