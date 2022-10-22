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
  }).sort((a, b) => b.mythic_level - a.mythic_level)
}
let isDepletedKey = (dungeon) => {
  return dungeon.clear_time_ms > dungeon.par_time_ms
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

let findHighestMythicKey = (mythicPlusChampionshipRuns) => {
  let result = []
  
  if (mythicPlusChampionshipRuns.length > 0) {
    result.score = mythicPlusChampionshipRuns[0].score
    result.mythicLevel = mythicPlusChampionshipRuns[0].mythic_level
    result.dungeonName = mythicPlusChampionshipRuns[0].dungeon
  }
  return result
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
      score: props.score,
      mythicLevel: props.mythicLevel,
      dungeonName: props.dungeonName
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
    const { isLoaded, twitch, picture, charName, realm, score, mythicPlusChampionshipRuns, mythicLevel, dungeonName } = this.state
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
                  <span className="card-title black-text blue lighten-5">{charName} - {realm}</span>
                  <a className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">add</i></a>
                </div>
                <div className="card-content">
                  <p className="card-title center grey-text text-darken-4">{mythicLevel} - {dungeonName}</p>
                  <p><a href={twitch} target="_blank">{twitch}</a></p>
                </div>
                <div className="card-reveal">
                  <span className="card-title grey-text text-darken-4 center">{score}<i className="material-icons right">close</i></span>
                  <ul className="collection">
                    {mythicPlusChampionshipRuns.map((item, index) => (
                      <li key={index} className={isDepletedKey(item) ? "collection-item red" : "collection-item"}>
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
          let championshipRuns = filterMythicPlusChampionshipRuns(raiderIoData.mythic_plus_recent_runs, setDateAndTime(competitor.Data, competitor.Hora))
          let highestMythicKey = findHighestMythicKey(championshipRuns.filter(dungeon => !isDepletedKey(dungeon)))
          competitor.score = highestMythicKey.score
          competitor.mythicLevel = highestMythicKey.mythicLevel
          competitor.dungeonName = highestMythicKey.dungeonName
          competitor.charPicture = setHtmlAttribute(raiderIoData.thumbnail_url, competitor.LinkDaFoto)
          competitor.charLink = setHtmlAttribute(raiderIoData.profile_url, competitor.LinkDaTwitch)
          competitor.championshipRuns = championshipRuns
          return competitor
        })
      })

      Promise.all(competitorResults).then((values) => {

        values.sort((a, b) => {
          let bMythicLevel = b.mythicLevel == undefined ? 0 : b.mythicLevel
          let aMythicLevel = a.mythicLevel == undefined ? 0 : a.mythicLevel
          if (bMythicLevel == aMythicLevel) {
            return b.score - a.score
          }
          return bMythicLevel - aMythicLevel
        })

        values.forEach(competitor => {
          const reactCardDom = addElementDiv("#root", "react-card")
          const root = ReactDOM.createRoot(reactCardDom)
          root.render(
            e(CharacterIOCard, {
              charName: competitor.NomeDoPersonagem,
              realm: competitor.ReinoDoPersonagem,
              date: competitor.Data,
              time: competitor.Hora,
              twitch: competitor.charLink,
              picture: competitor.charPicture,
              mythicPlusChampionshipRuns: competitor.championshipRuns,
              score: competitor.score,
              mythicLevel: competitor.mythicLevel,
              dungeonName: competitor.dungeonName
            })
          )
        })
      })
    })

}

findCompetitors()

