// ------------------ STORE AND STORE FUNCTIONS ------------------------
let store = Immutable.Map({
  rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  currentRover: 'Curiosity',
  selectedDateType: 'sol',
  currentRoverGallery: null,
  currentRoverManifest: null,
  dateRandom: false,
  galleryIdx: 0,
});

const updateStore = (state, newState) => {
  store = store.merge(state, newState);
  render(root, store);
};

// ---------------------- COMPONENTS AND COMPONENT FUNC------------------------------
const root = document.getElementById('root');

const App = (state) => {
  return `
        <header id="site-header"><h1><span>Mars Rovers</span></h1></header>
        ${roverTabs(state)()}
        ${roverContentHTML(state)}
    `;
};

const roverTabs = (state) => {
  return function generateRoverTabs() {
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
};

const roverContentHTML = (state) => {
  return `<div id="rover-content">
        <div id="rover-gallery">
          ${roverGalleryHTML(state)()}
        </div>
        <aside>
          ${roverAsideContentHTML(state)()}
        </aside>
      </div>
  `;
};

const roverAsideContentHTML = (state) => {
  const currManifest = state.get('currentRoverManifest');

  if (!currManifest) {
    return function generateEmptyAsideState() {
      return `<div class="home-placeholder">
        <p>Please select rover to see info</p>
      </div>`;
    };
  } else {
    return function generateAsideShowState() {
      return `<div class="rover-aside">
        <h3><i class="fa-solid fa-hand-sparkles"></i><span> Rover manifest</span></h3>
        <ul class="rover-aside-list">
          <li>Rover name: ${state.getIn(['currentRoverManifest', 'name'])}</li>
          <li>Landing date: ${state.getIn([
            'currentRoverManifest',
            'landing_date',
          ])}</li>
          <li>Launch date: ${state.getIn([
            'currentRoverManifest',
            'launch_date',
          ])}</li>
          <li>Max sol: ${state.getIn(['currentRoverManifest', 'max_sol'])}</li>
          <li>Earth date: ${state.getIn([
            'currentRoverManifest',
            'max_date',
          ])}</li>
        </ul>
        <div>
          <h3><i class="fa-solid fa-hand-sparkles"></i><span> Would you like to see a random date, or the latest date?</span></h3>
          <button value="random-date" class="date-button-cta" name="random-date">Pick a random date!</option>
          <button value="latest" class="date-button-cta" name="latest">Show latest!</button>
        </div>
      </div>
      `;
    };
  }
};

const roverGalleryHTML = (state) => {
  const currIdx = state.get('galleryIdx');
  const currGallery = state.get('currentRoverGallery');

  if (!currGallery) {
    return function generateEmptyGalleryState() {
      return `<p>Pick a date to look at the pictures from that day.  <i class="fa-solid fa-hand-point-right"></i></p>`;
    };
  } else {
    return function generateGalleryShowState() {
      const galleryHTML = `<div class="gallery-body">
        <button class="prev-image">
          <i class="fa-solid fa-circle-arrow-left"></i>
        </button>
        <img src="${currGallery.toArray()[currIdx]}" />
        <button class="next-image">
          <i class="fa-solid fa-circle-arrow-right"></i>
        </button>
      </div>`;
      return galleryHTML;
    };
  }
};

// -------------------- FUNCTIONS REQUESTING DATA ----------------
const fetchRoverManifest = async (state) => {
  const currentRover = state.get('currentRover');

  let currentManifest = await fetch(`/mars/${currentRover}`)
    .then((res) => res.json())
    .then((data) => {
      return {
        currentRoverManifest: data.roverInfo.photo_manifest,
      };
    })
    .catch((err) => console.err(err));

  updateStore(store, currentManifest);
};

const fetchRoverImages = async ({ rover, dateType = 'sol', date }) => {
  let roverImages = await fetch(`/mars/${rover}/${dateType}/${date}`)
    .then((res) => res.json())
    .then((data) => {
      const processedImages = processImageData(data.marsImage.photos);
      return {
        currentRoverGallery: processedImages,
      };
    })
    .catch((err) => console.err(err));

  updateStore(store, roverImages);
};

// -------------------- FUNCTIONS PROCESSING DATA ----------------
const processImageData = (imageData) => {
  const updatedImageData = imageData.map((each) => {
    return each.img_src;
  });
  return updatedImageData;
};

//-------------------------- RENDERING AND EVENT HANDLERS ------------------------------
const render = async (root, state) => {
  root.innerHTML = App(state);
  document.querySelector('nav').addEventListener('click', changeRover);
  const dateSelectButtons = document.querySelectorAll('.date-button-cta');
  if (dateSelectButtons)
    dateSelectButtons.forEach((each) =>
      each.addEventListener('click', fetchImages)
    );
  const prevButton = document.querySelector('.prev-image');
  const nextButton = document.querySelector('.next-image');
  if (prevButton) prevButton.addEventListener('click', prevImage);
  if (nextButton) nextButton.addEventListener('click', nextImage);
};

async function changeRover(event) {
  updateStore(store, {
    currentRover: event.target.textContent,
  });

  await fetchRoverManifest(store);
}

const fetchImages = async (event) => {
  const userSelection = event.target.value;
  let date;
  switch (userSelection) {
    case 'latest':
      updateStore(store, {
        dateRandom: false,
      });
      date = store.getIn([
        'currentRoverManifest',
        `max_${store.get('selectedDateType')}`,
      ]);
      break;
    case 'random-date':
      updateStore(store, {
        dateRandom: true,
      });
      date = Math.floor(
        Math.random() * store.getIn(['currentRoverManifest', 'max_sol'])
      );
      break;
    default:
      break;
  }

  await fetchRoverImages({
    rover: store.get('currentRover').toLowerCase(),
    dateType: store.get('selectedDateType'),
    date: date,
  });
};

const prevImage = (event) => {
  const boundary = 0;
  if (store.get('galleryIdx') <= boundary) {
    alert('you have reached the first image!');
    return;
  } else {
    updateStore(store, {
      galleryIdx: store.get('galleryIdx') - 1,
    });
  }
};

const nextImage = (event) => {
  const boundary = store.get('currentRoverGallery').toArray().length;
  if (store.get('galleryIdx') >= boundary) {
    alert('you have reached the lasts image!');
    return;
  } else {
    updateStore(store, {
      galleryIdx: store.get('galleryIdx') + 1,
    });
  }
};

//-------------------------- WINDOW LOAD EVENT ------------------------------
window.addEventListener('load', (event) => {
  render(root, store);
});
