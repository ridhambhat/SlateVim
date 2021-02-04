import React, {Component} from "react";

// Custom
import Header from "./components/Header";
import SyncingEditor from "./components/SyncingEditor";

// const App = () => {
//   return (
//     <div>
//       <Header />
//       <SyncingEditor />
//       <div className="m-2"></div>
//       <SyncingEditor />
//     </div>
//   );
// };

// export default App;

export default class App extends Component {
  render(){
    return(
      <div>
       <Header />
       <SyncingEditor />
       <div className="m-2"></div>
       <SyncingEditor />
     </div>
    );
  }
};


