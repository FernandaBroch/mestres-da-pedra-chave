

const BASE_URL = 'http://127.0.0.1:5500/raiderio.json';
//const BASE_URL = "https://raider.io/api/v1/characters/profile";

let region = "us"
let realm = "Stormrage"
let charName = "Shampug"
let fields = "mythic_plus_recent_runs"
const GET_URL = `${BASE_URL}?region=${region}&realm=${realm}&name=${charName}&fields=${fields}`      

class CharacterIOCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }

  componentDidMount() {
    fetch(GET_URL)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: [result]
          });
          console.log(result)
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
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else if (items) {
      return (
        <ul>
          {items.map(item => (
            <li key="1">
              {item.name} {item.race} {item.achievement_points}
            </li>
          ))}
        </ul>
      );
    }
  }
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<CharacterIOCard />);