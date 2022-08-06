// const Immutable = require('immutable');

// ------------------ STORE AND STORE FUNCTIONS ------------------------
let store = Immutable.Map({
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    latestSol: 0,
    latestEarthDate: ''
})

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

// ---------------------- COMPONENTS ------------------------------


// -------------------- FUNCTIONS REQUESTING DATA ----------------

/**
 * @description
 * @param {}
 */


// -------------------- FUNCTIONS PROCESSING DATA ----------------


//-------------------------- RENDERING ------------------------------
// add our markup to the page
const root = document.getElementById('root')

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    let { rovers, apod } = state

    return `
        <header></header>
        <main>
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    Blah
                </p>
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})
