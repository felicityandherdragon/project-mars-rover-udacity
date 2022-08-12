// const Immutable = require('immutable');

// ------------------ STORE AND STORE FUNCTIONS ------------------------
let store = Immutable.Map({
  rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  currentRover: 'Curiosity',
  currentRoverGallery: null,
  currentRoverManifest: null,
});

const updateStore = (state, newState) => {
  store = store.merge(state, newState);
  render(root, store);
};

// ---------------------- COMPONENTS AND COMPONENT FUNC------------------------------

async function changeRover(event) {
  console.log(event.target.textContent); //TODO: remove
  updateStore(store, {
    currentRover: event.target.textContent,
  });
  await fetchRoverManifest(store);
  console.log(store.get('currentRover')); //TODO: remove
  console.log(store.getIn(['currentRoverManifest', 'max_sol'])); //TODO: remove
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
        <aside>
          <ul>
            <li>Rover name: ${state.getIn(['currentRoverManifest', 'name'])}</li>
            <li>Landing date: ${state.getIn(['currentRoverManifest', 'landing_date'])}</li>
            <li>Launch date: ${state.getIn(['currentRoverManifest', 'launch_date'])}</li>
            <li>Max sol: ${state.getIn(['currentRoverManifest', 'max_sol'])}</li>
            <li>Earth date: ${state.getIn(['currentRoverManifest', 'max_date'])}</li>
          </ul>
          <button>Pick a random date!</button>
          <button>Show latest!</button>
        </aside>
      </div>
  `;
};

// const roverAsideContentHTML = (state) => {

// }

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

// -------------------- FUNCTIONS PROCESSING DATA ----------------

//-------------------------- RENDERING ------------------------------
// add our markup to the page
const root = document.getElementById('root');

const render = async (root, state) => {
  root.innerHTML = App(state);
  document.querySelector('nav').addEventListener('click', changeRover);
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
});
