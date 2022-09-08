

const BASE_URL = 'http://127.0.0.1:5500/raiderio.json';
//const BASE_URL = "https://raider.io/api/v1/characters/profile";

let championshipDate = new Date("2022-09-04T00:21:42.000Z")
let region = "us"
let realm = "Stormrage"
let charName = "Shampug"
let fields = "mythic_plus_recent_runs"
const GET_URL = `${BASE_URL}?region=${region}&realm=${realm}&name=${charName}&fields=${fields}`

let raiderIODungeonData = []

let convertDateToJSDate = (date) => {
  return new Date(date)
}

let calculateMythicScore = (runData) => {
  let championshipScore = runData.reduce((score, obj) => { 
    if (convertDateToJSDate(obj.completed_at) > championshipDate)
      return score + obj.score
    return score
  }, 0);
  return championshipScore
}

class CharacterIOCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      result: null,
      raiderDungeonIoData: []
    };
  }

  componentDidMount() {
    fetch(GET_URL)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            result: result,
            raiderIODungeonData: result.mythic_plus_recent_runs
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { error, isLoaded, result, raiderIODungeonData } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else if (result) {
      return (
        <div>
          <img src={result.thumbnail_url} alt="Character Image" />
          <h3>{result.name}</h3>
          <span>{calculateMythicScore(raiderIODungeonData)}</span>
        </div>
      );
    }
  }
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<CharacterIOCard />);