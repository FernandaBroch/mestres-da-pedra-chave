

const BASE_URL = 'http://127.0.0.1:5500/raiderio.json';
//const BASE_URL = "https://raider.io/api/v1/characters/profile";

let championshipDate = new Date("2022-09-04T00:21:42.000Z")
let region = "us"
let realm = "Stormrage"
let charName = "Shampug"
let fields = "mythic_plus_recent_runs"
const GET_URL = `${BASE_URL}?region=${region}&realm=${realm}&name=${charName}&fields=${fields}`

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
  return mythicPlusChampionshipRuns.reduce((score, obj) => { return score + obj.score }, 0);  
}

class CharacterIOCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      result: null,
      mythicPlusRecentRuns: []
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
            mythicPlusRecentRuns: result.mythic_plus_recent_runs
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
    const { error, isLoaded, result, mythicPlusRecentRuns } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else if (result) {
      let score = calculateMythicScore(mythicPlusRecentRuns)
      return (
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
      );
    }
  }
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<CharacterIOCard />);