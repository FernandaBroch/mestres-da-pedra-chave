const e = React.createElement
const BASE_URL = "https://raider.io/api/v1/characters/profile"

//let championshipDate = new Date("2022-09-04T00:21:42.000Z")
let region = "us"
let fields = "mythic_plus_recent_runs"
let championshipDate = null

let convertDateToJSDate = (date) => {
  return new Date(date)
}
let filterMythicPlusChampionshipRuns = (mythicPlusRuns, championshipDate) => {
  return mythicPlusRuns.filter((currentValue) => {
    return convertDateToJSDate(currentValue.completed_at) > championshipDate
  })
}
let addElement = (parentDiv, elementType, callback) => {
  const newDiv = document.createElement(elementType)
  callback(newDiv)
  document.querySelector(parentDiv).appendChild(newDiv)
}

let addElementDiv = (parentDivID, className) => {
  addElement(parentDivID, "div", (newDiv) => {
    newDiv.setAttribute('class', className)
  })
}
let calculateMythicScore = (mythicPlusChampionshipRuns) => {
  return mythicPlusChampionshipRuns.reduce((score, obj) => { return score + obj.score }, 0).toFixed(2)
}

let setDateAndTime = (date, time) => {
  let data = null
  document.getElementById("data").innerText = date + " " + time + "hs"
  if (time.length == 7)
    data = `${date}T0${time}`
  else
    data = `${date}T${time}`
  data = new Date(data)
  data.setHours(data.getUTCHours() - 3)
  return data
}
let setHtmlAttribute = (atrib1, atrib2) => {
  let result = atrib1
  if (atrib2 != "") {
    result = atrib2
  }
  return result
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
      charName: props.charName,
      date: props.date,
      time: props.time,
      twitch: props.twitch,
      picture: props.picture
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
    const { error, isLoaded, result, mythicPlusRecentRuns, date, time, twitch, picture } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else if (result) {
      if (date != null) {
        championshipDate = setDateAndTime(date, time)
      }
      let mythicPlusChampionshipRuns = filterMythicPlusChampionshipRuns(mythicPlusRecentRuns, championshipDate)

      let score = calculateMythicScore(mythicPlusChampionshipRuns)
      let charPicture = setHtmlAttribute(result.thumbnail_url, picture)
      let charLink = setHtmlAttribute(result.profile_url, twitch)
      return (
        <div className="col s12 m4">
          <div className="col s12 m11">
            <div className="row">
              <div className="card">
                <div className="card-image activator">
                  <img src={charPicture} alt="Character Image" />
                  <span className="card-title">{result.name}</span>
                  <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a>
                </div>
                <div className="card-content">
                  <h3 className="card-title center grey-text text-darken-4">{score}</h3>
                  <p><a href={charLink} targer="_blank">{charLink}</a></p>
                </div>
                <div className="card-reveal">
                  <span className="card-title grey-text text-darken-4 center">{score}<i className="material-icons right">close</i></span>
                  <ul className="collection">
                    {mythicPlusChampionshipRuns.map((item, index) => (
                      <li key={index} className="collection-item">
                        {item.mythic_level}-{item.dungeon}: <span className="right">{item.score}</span>
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

let findCompetitors = () => {
  let competitors = []
  let spreadsheet_id = "1a0JC-J--zD4qBdt9jAiEucNEGAbl0ppOz82qH1wQ7d4"
  let sheet_name = "tabela"
  const GOOGLE_SHEET_URL = `https://opensheet.elk.sh/${spreadsheet_id}/${sheet_name}`

  fetch(GOOGLE_SHEET_URL)
    .then(res => res.json())
    .then(rows => {
      rows.forEach(row => {
        if (row.hasOwnProperty('NomeDoPersonagem') && row.hasOwnProperty('ReinoDoPersonagem')) {
          competitors.push(row)
        }
      })
      competitors.forEach(competitor => {
        addElementDiv("#root", "react-card")
      })

      document.querySelectorAll('.react-card')
        .forEach((domContainer, key) => {
          const root = ReactDOM.createRoot(domContainer)
          root.render(
            e(CharacterIOCard, {
              charName: competitors[key].NomeDoPersonagem,
              realm: competitors[key].ReinoDoPersonagem,
              date: competitors[key].Data,
              time: competitors[key].Hora,
              twitch: competitors[key].LinkDaTwitch,
              picture: competitors[key].LinkDaFoto
            })
          )
        })
    })
}

findCompetitors()

