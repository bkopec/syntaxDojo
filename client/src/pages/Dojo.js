import {
    BrowserRouter as Router,
    Routes, Route, Link,
    useMatch, useParams
  } from 'react-router-dom'
  
import Overview from './Overview';
import DeckView from './DeckView';
import DeckStudy from './DeckStudy';

const DojoPage = ({user, setUser}) => {
    return (

    <Routes>
    <Route path="/" element={ 
        <Overview user={user} setUser={setUser} />  
    }/>
    <Route path="/deck/:deckId" element={ 
      <>
        <DeckView user={user} />
      </>
    }/>
    <Route path="/deck/:deckId/study" element={ 
      <>
        <DeckStudy user={user} />
      </>
    }/>
    <Route path="/deck/:deckId/:moduleId" element={ 
      <>

      </>
    }/>
    <Route path="/deck/:deckId/:moduleId/add" element={ 
      <>
             
      </>
    }/>
     <Route
      path="/*" 
      element={<div>404 Page: Not Found</div>}
    />
    </Routes>


    );
}

export default DojoPage;