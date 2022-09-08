const e = React.createElement

//const BASE_URL = 'http://127.0.0.1:5500/raiderio.json'
const BASE_URL = "https://raider.io/api/v1/characters/profile"

//let championshipDate = new Date("2022-09-04T00:21:42.000Z")
//let championshipDate = new Date(document.getElementById('data').value)
let championshipDate = new Date(document.querySelector('#data').innerText)
let region = "us"
let fields = "mythic_plus_recent_runs"


let convertDateToJSDate = (date) => {
  return new Date(date)
}

let filterMythicPlusChampionshipRuns = (mythicPlusRuns) => {
  return mythicPlusRuns.filter((currentValue) => {
    return convertDateToJSDate(currentValue.completed_at) > championshipDate
  })
}

let calculateMythicScore = (mythicPlusRecentRuns) => {
  let mythicPlusChampionshipRuns = filterMythicPlusChampionshipRuns(mythicPlusRecentRuns)
  return mythicPlusChampionshipRuns.reduce((score, obj) => { return score + obj.score }, 0).toFixed(2)
}

class CharacterIOCard extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      result: null,
      mythicPlusRecentRuns: [],
      realm: props.realm,
      charName: props.charName
    }
  }

  componentDidMount() {
    let GET_URL = `${BASE_URL}?region=${region}&realm=${this.state.realm}&name=${this.state.charName}&fields=${fields}`
    fetch(GET_URL)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            result: result,
            mythicPlusRecentRuns: result.mythic_plus_recent_runs
          })
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          })
        }
      )
  }

  render() {
    const { error, isLoaded, result, mythicPlusRecentRuns } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else if (result) {
      let score = calculateMythicScore(mythicPlusRecentRuns)
      return (
        <div className="col s12 m4">
          <div className="col s12 m10">
            <div className="row">
              <div className="card">
                <div className="card-image">
                  <img src={result.thumbnail_url} alt="Character Image" />
                  <span className="card-title">{result.name}</span>
                </div>
                <div className="card-content">
                  <h3 className="card-title activator center grey-text text-darken-4">{score}<i className="material-icons right">more_vert</i></h3>
                </div>
                <div className="card-reveal">
                  <span className="card-title grey-text text-darken-4 center">{score}<i className="material-icons right">close</i></span>
                  <ul className="collection">
                    {filterMythicPlusChampionshipRuns(mythicPlusRecentRuns).map((item, index) => (
                      <li key={index} className="collection-item">
                        {item.dungeon}: <span className="right">{item.score}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}

let competitors = [
  {
    charName: "Shampug",
    realm: "Stormrage"
  }, {
    charName: "Dayvinho",
    realm: "Azralon"
  },
  {
    charName: "Zuwang",
    realm: "Azralon"
  },
  {
    charName: "Bircemaria",
    realm: "Azralon"
  }

]
competitors.forEach(competitor => {
  addElementDiv("#root", "react-card")
})

function addElement(parentDiv, elementType, callback) {
  const newDiv = document.createElement(elementType)
  callback(newDiv)
  document.querySelector(parentDiv).appendChild(newDiv)
}

function addElementDiv(parentDivID, className) {
  addElement(parentDivID, "div", (newDiv) => {
    newDiv.setAttribute('class', className)
  })
}

document.querySelectorAll('.react-card')
  .forEach((domContainer, key) => {
    const root = ReactDOM.createRoot(domContainer)
    root.render(
      e(CharacterIOCard, {
        charName: competitors[key].charName,
        realm: competitors[key].realm
      })
    )
  })
