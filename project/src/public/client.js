// const Immutable = require('immutable');

// ------------------ STORE AND STORE FUNCTIONS ------------------------
let store = Immutable.Map({
  user: { name: 'Student' },
  rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  latestSol: 3558,
  latestEarthDate: '2022-08-09',
  currentRover: 'Curiosity',
  currentRoverGallery: Immutable.List([]),
  currentRoverManifest: Immutable.Map({
    name: 'Curiosity',
    landing_date: '2012-08-06',
    launch_date: '2011-11-26',
    status: 'active',
    max_sol: 3558,
    max_date: '2022-08-09',
    total_photos: 589124,
  }),
});

const updateStore = (store, newState) => {
  store = Object.assign(store, newState); //TODO: need to update
  // render(root, store);
};

// ---------------------- COMPONENTS AND COMPONENT FUNC------------------------------

function changeRover(event) {
  console.log(event.target.textContent);
  // store.set('currentRover', event.target.textContent);
  updateStore(store, {
    currentRover: event.target.textContent,
  });
  console.log(store.get('currentRover')); //TODO: store does not seem to be updated
}

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
        <div id="rover-gallery">This is where the picture gallery would show</div>
        <aside>This is where the rover manifest would show</aside>
      </div>
  `;
};

const roverAsideContentHTML = (state) => {
  
}

// -------------------- FUNCTIONS REQUESTING DATA ----------------

/**
 * @description
 * @param {}
 */
const fetchRoverManifest = (state) => {
  const currentRover = state.get('currentRover');
  fetch(`/mars/${currentRover}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data.roverInfo.photo_manifest);
    });
};

// -------------------- FUNCTIONS PROCESSING DATA ----------------

//-------------------------- RENDERING ------------------------------
// add our markup to the page
const root = document.getElementById('root');

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  let { rovers } = state;

  return `
        <header id="site-header">Mars Rovers</header>
        ${roverTabs(state)}
        ${roverContentHTML(state)}
        <footer></footer>
    `;
};

//-------------------------- EVENT LISTENER ------------------------------
// listening for load event because page should load before any JS is called
window.addEventListener('load', (event) => {
  render(root, store);
  document.querySelector('nav').addEventListener('click', changeRover);
  console.log('test', fetchRoverManifest(store));
});
