// const Immutable = require('immutable');

// ------------------ STORE AND STORE FUNCTIONS ------------------------
let store = Immutable.Map({
  user: { name: 'Student' },
  rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
  latestSol: 0,
  latestEarthDate: '',
  currentRover: undefined
});

const updateStore = (store, newState) => {
  store = store.merge(store, newState);
  // render(root, store);
};

// ---------------------- COMPONENTS AND COMPONENT FUNC------------------------------

function changeRover(event) {
  console.log(event.target.textContent);
  // store.set('currentRover', event.target.textContent);
  updateStore(store, {
    "currentRover": event.target.textContent
  })
  console.log(store) //TODO: store does not seem to be updated
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

const roverContent = (state) => {
  return `<div id="rover-content">
        <div id="rover-gallery">This is where the picture gallery would show</div>
        <aside>This is where the rover manifest would show</aside>
      </div>
  `
}


// -------------------- FUNCTIONS REQUESTING DATA ----------------

/**
 * @description
 * @param {}
 */

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
        ${roverContent(state)}
        <footer></footer>
    `;
};

//-------------------------- EVENT LISTENER ------------------------------
// listening for load event because page should load before any JS is called
window.addEventListener('load', (event) => {
  render(root, store);
  document.querySelector('nav').addEventListener('click', changeRover)
});
