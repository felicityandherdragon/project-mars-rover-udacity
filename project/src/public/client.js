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
        <div>
          <h3>Would you like to see a random date, or the latest date?</h3>
          <button value="random-date" class="date-button-cta" name="random-date">Pick a random date!</option>
          <button value="latest" class="date-button-cta" name="latest">Show latest!</button>
        </div>
      </div>
    `
}

const roverGalleryHTML = (state) => {
  console.log('image', state.get('currentRoverGallery')?.toArray()[0])
  return `
    <p class="${state.get('currentRoverGallery') && 'hidden'}">This is where the picture gallery would show</p>
    <div class="gallery-body ${!state.get('currentRoverGallery') ? 'hidden' : ''}">
      <button class="gallery-nav">
        <i class="fa-solid fa-circle-arrow-left prev-image"></i>
      </button>
      <img src="${state.get('currentRoverGallery')?.toArray()[0]}" />
      <button class="gallery-nav">
        <i class="fa-solid fa-circle-arrow-right next-image"></i>
      </button>
    </div>
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
      const processedImages = processImageData(data.marsImage.photos);
      return {
        currentRoverGallery: processedImages
      }
    })
    .catch(err => console.err(err));

  console.log(roverImages);

  updateStore(store, roverImages);
};

// -------------------- FUNCTIONS PROCESSING DATA ----------------
const processImageData = (imageData) => {
  const updatedImageData = imageData.map((each) => {
    return each.img_src;
  })
  return updatedImageData;
}

//-------------------------- RENDERING AND EVENT HANDLERS ------------------------------
const render = async (root, state) => {
  console.log('I am rendering!')
  root.innerHTML = App(state);
  document.querySelector('nav').addEventListener('click', changeRover);
  document.querySelectorAll('.date-button-cta').forEach((each) => each.addEventListener('click', fetchImages));
  document.querySelectorAll('.gallery-nav').forEach((each) => each.addEventListener('click', navigateGallery))
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
}

const navigateGallery = (event) => {
  console.log(event.target);
  console.log(event.target.classList);
}

//-------------------------- WINDOW LOAD EVENT ------------------------------
window.addEventListener('load', (event) => {
  render(root, store);
});
