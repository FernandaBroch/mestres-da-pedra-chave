const e = React.createElement
const BASE_URL = "https://raider.io/api/v1/characters/profile"

//let championshipDate = new Date("2022-09-04T00:21:42.000Z")
let region = "us"
let fields = "mythic_plus_recent_runs"
let raiderIODataResult = []
let errorResult = null

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
  return newDiv
}

let addElementDiv = (parentDivID, className) => {
  return addElement(parentDivID, "div", (newDiv) => {
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
let findCharacterIOData = (characterIOData, callback) => {
  let GET_URL = `${BASE_URL}?region=${region}&realm=${characterIOData.ReinoDoPersonagem}&name=${characterIOData.NomeDoPersonagem}&fields=${fields}`
  return fetch(GET_URL)
    .then(res => res.json())
    .then(
      (result) => {
        raiderIODataResult.push(result)
        return callback(result)
      },
      (error) => {
        errorResult = error
      })
}

class CharacterIOCard extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      realm: props.realm,
      charName: props.charName,
      date: props.date,
      time: props.time,
      twitch: props.twitch,
      picture: props.picture,
      mythicPlusChampionshipRuns: props.mythicPlusChampionshipRuns,
      score: props.score
    }
  }

  componentDidMount() {

    if (raiderIODataResult) {
      this.setState({
        isLoaded: true,
      })
    }
  }

  render() {
    const { isLoaded, twitch, picture, charName, score, mythicPlusChampionshipRuns } = this.state
    if (!isLoaded) {
      return <div>Loading...</div>
    } else if (raiderIODataResult) {
      

      return (
        <div className="col s12 m4">
          <div className="col s12 m11">
            <div className="row">
              <div className="card">
                <div className="card-image activator">
                  <img src={picture} alt="Character Image" />
                  <span className="card-title">{charName}</span>
                  <a className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">add</i></a>
                </div>
                <div className="card-content">
                  <h3 className="card-title center grey-text text-darken-4">{score}</h3>
                  <p><a href={twitch} targer="_blank">{twitch}</a></p>
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
      

      let competitorResults = competitors.map(competitor => {
        return findCharacterIOData(competitor, (raiderIoData) => {
          competitor.score = calculateMythicScore(filterMythicPlusChampionshipRuns(raiderIoData.mythic_plus_recent_runs, setDateAndTime(competitor.Data, competitor.Hora)))
          competitor.charPicture = setHtmlAttribute(raiderIoData.thumbnail_url, competitor.LinkDaFoto)
          competitor.charLink = setHtmlAttribute(raiderIoData.profile_url, competitor.LinkDaTwitch)
          competitor.raiderIoData = raiderIoData
          return competitor
        })
      })
      console.log(competitorResults)

      Promise.all(competitorResults).then((values) => {
        values.sort((a, b) => b.score - a.score)
        values.forEach(competitor => {
          const reactCardDom = addElementDiv("#root", "react-card")
          const root = ReactDOM.createRoot(reactCardDom)
          root.render(
            e(CharacterIOCard, {
              charName: competitor.NomeDoPersonagem,
              realm: competitor.ReinoDoPersonagem,
              date: competitor.Data,
              time: competitor.Hora,
              twitch: competitor.LinkDaTwitch,
              picture: competitor.LinkDaFoto,
              mythicPlusChampionshipRuns: filterMythicPlusChampionshipRuns(competitor.raiderIoData.mythic_plus_recent_runs, setDateAndTime(competitor.Data, competitor.Hora)),
              score: competitor.score
            })
          )
        })
      })
    })

}

findCompetitors()

