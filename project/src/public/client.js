// ------------------ STORE AND STORE FUNCTIONS ------------------------
let store = Immutable.Map({
  rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  currentRover: 'Curiosity',
  selectedDateType: 'sol', //or date
  currentRoverGallery: null,
  currentRoverManifest: null,
  dateRandom: false
});

const updateStore = (state, newState) => {
  store = store.merge(state, newState);
  render(root, store);
};

// ---------------------- COMPONENTS AND COMPONENT FUNC------------------------------
// add our markup to the page
const root = document.getElementById('root');

const App = (state) => {
  let { rovers } = state;

  return `
        <header id="site-header">Mars Rovers</header>
        ${roverTabs(state)}
        ${roverContentHTML(state)}
        <footer></footer>
    `;
};

const roverTabs = (state) => {
  return `<nav>
        <ul id="rover-tabs">
            ${state
              .get('rovers')
              .toArray()
              .map((eachRover) => {
                return `<li>${eachRover}</li>`;
              })
              .join('')}
        </ul>
    </nav>
    `;
};

const roverContentHTML = (state) => {
  return `<div id="rover-content">
        <div id="rover-gallery">
          ${roverGalleryHTML(state)}
        </div>
        <aside>
          ${roverAsideContentHTML(state)}
        </aside>
      </div>
  `;
};

const roverAsideContentHTML = (state) => {

    return `
      <div class="home-placeholder ${state.get('currentRoverManifest') && 'hidden'}">
        <p>Please select rover to see info</p>
      </div>
      <div class="rover-aside ${!state.get('currentRoverManifest') ? 'hidden' : ''}">
        <ul>
          <li>Rover name: ${state.getIn(['currentRoverManifest', 'name'])}</li>
          <li>Landing date: ${state.getIn(['currentRoverManifest', 'landing_date'])}</li>
          <li>Launch date: ${state.getIn(['currentRoverManifest', 'launch_date'])}</li>
          <li>Max sol: ${state.getIn(['currentRoverManifest', 'max_sol'])}</li>
          <li>Earth date: ${state.getIn(['currentRoverManifest', 'max_date'])}</li>
        </ul>
        <form>
          <label for="random-or-latest">Would you like to see a random date, or the latest date?</label>

          <select id="random-or-latest" name="random-or-latest" required>
            <option value="">Please select</option>
            <option value="random-date" class="date-button-cta" name="random-date">Pick a random date!</option>
            <option value="latest" class="date-button-cta" name="latest">Show latest!</option>
          </select>

          <label for="date-type">Should we go by sol, or earth date?</label>

          <select id="date-type" name="date-type">
            <option value="">Please select</option>
            <option value="sol" name="sol">Sol sounds cool</option>
            <option value="date" name="date">Earth date please</option>
          </select>
        </form>
      </div>
    `
}

const roverGalleryHTML = (state) => {
  console.log('image', state.get('currentRoverGallery')?.toArray()[0].get('img_src'))
  return `
    <p class="${state.get('currentRoverGallery') && 'hidden'}">This is where the picture gallery would show</p>
    <img class="${!state.get('currentRoverGallery') ? 'hidden' : ''}" src="${state.get('currentRoverGallery')?.toArray()[0].get('img_src')}" />
  `
}

// -------------------- FUNCTIONS REQUESTING DATA ----------------
const fetchRoverManifest = async (state) => {
  const currentRover = state.get('currentRover');

  let currentManifest = await fetch(`/mars/${currentRover}`)
    .then((res) => res.json())
    .then((data) => {
      //TODO: remove
      console.log(data.roverInfo.photo_manifest);
      return {
        currentRoverManifest: data.roverInfo.photo_manifest
      }
    })
    .catch(err => console.err(err));

  updateStore(store, currentManifest);
};

const fetchRoverImages = async ({rover, dateType = 'sol', date}) => {
  let roverImages = await fetch(`/mars/${rover}/${dateType}/${date}`)
    .then((res) => res.json())
    .then((data) => {
      return {
        currentRoverGallery: data.marsImage.photos
      }
    })
    .catch(err => console.err(err));

  console.log(roverImages);
  updateStore(store, roverImages);
};

// -------------------- FUNCTIONS PROCESSING DATA ----------------

//-------------------------- RENDERING AND EVENT HANDLERS ------------------------------
const render = async (root, state) => {
  console.log('I am rendering!')
  root.innerHTML = App(state);
  document.querySelector('nav').addEventListener('click', changeRover);
  document.querySelector('#random-or-latest').addEventListener('change', fetchImages);
};

async function changeRover(event) {
  updateStore(store, {
    currentRover: event.target.textContent,
  });

  await fetchRoverManifest(store);
}

const fetchImages = async (event) => {
  const userSelection = event.target.value;
  switch (userSelection) {
    case 'latest':
      updateStore(store, {
        dateRandom: false
      })
      break;
    case 'random-date':
      updateStore(store, {
        dateRandom: true
      })
      break;
    default:
      break
  }

  let date;
  if (store.get('dateRandom') === true) {
    date = Math.floor(Math.random() * store.getIn(['currentRoverManifest', 'max_sol']))
  } else {
    date = store.getIn(['currentRoverManifest', `max_${store.get('selectedDateType')}`])
  }
  console.log('date', date);

  await fetchRoverImages({
    rover: store.get('currentRover').toLowerCase(),
    dateType: store.get('selectedDateType'),
    date: date
  })
  console.log(store.get('currentRoverGallery').toArray());
}

//-------------------------- WINDOW LOAD EVENT ------------------------------
// listening for load event because page should load before any JS is called
window.addEventListener('load', (event) => {
  render(root, store);
});
