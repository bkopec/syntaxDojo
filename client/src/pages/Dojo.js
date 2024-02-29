import {
    BrowserRouter as Router,
    Routes, Route, Link,
    useMatch, useParams
  } from 'react-router-dom'
  
import Overview from './Overview';
import CategoryView from './CategoryView';

const DojoPage = ({user, setUser}) => {
    return (

    <Routes>
    <Route path="/" element={ 
        <Overview user={user} />  
    }/>
    <Route path="/category/:categoryId" element={ 
      <>
        <CategoryView user={user} />
      </>
    }/>
    <Route path="/category/:categoryId/:moduleId" element={ 
      <>

      </>
    }/>
    <Route path="/category/:categoryId/:moduleId/add" element={ 
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