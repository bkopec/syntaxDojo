import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

import config from '../config.js';
const backendUrl = config.backendUrl;


const Overview = ({user, setUser}) => {
  const [decks, setDecks] = useState([]);
  const [publicDecks, setPublicDecks] = useState([]);
  const [newDeckName, setNewDeckName] = useState('');
  const [deckRenaming, setDeckRenaming] = useState({name:'', _id:''});
  const [loaded, setLoaded] = useState([false, false]); // [decks, publicDecks]

  const navigate = useNavigate();

  const handleDeckRenaming = async () => {
    if (deckRenaming.name === '' || (deckRenaming.name === decks.find(deck => deck._id === deckRenaming.id).name)) {
      setDeckRenaming({name:'', _id:''});
      return; 
    }
    try {
    const response = await axios.put(`${backendUrl}/api/cards/deck/${deckRenaming.id}/rename`, {name : deckRenaming.name}, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },}
    );
    if (response.status !== 200)
      throw new Error('Failed to rename deck:', response.statusText);
    setDecks(decks.map((deck) => deck._id === deckRenaming.id ? {...deck, name : deckRenaming.name} : deck));
    setDeckRenaming({name:'', _id:''});
    } catch (error) {
      console.error('Error renaming deck:', error);
    }
  };


  // Allow user to press Enter to confirm deck renaming
  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === 'Enter') {
        handleDeckRenaming();
      }
    };
    if (deckRenaming.id !== '') {
    document.addEventListener('keydown', handleEnterKey);
    return () => {
      document.removeEventListener('keydown', handleEnterKey);
    }
  }
  }, [deckRenaming]);


  // Fetch decks on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(backendUrl + '/api/cards/deck', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setDecks(response.data);
        setLoaded([true, loaded[1]]);
      } catch (error) {
        console.error('Error fetching decks:', error);
      }
    };

    const fetchPublicDecks = async () => {
      try {
        const response = await axios.get(backendUrl + '/api/cards/deck/public', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setPublicDecks(response.data);
        setLoaded([loaded[0], true]);
      } catch (error) {
        console.error('Error fetching decks:', error);
      }
    };


    fetchCategories();
    fetchPublicDecks();
  }, [user.token]);

  const handleCreateDeck = async () => {
    if (!newDeckName)
      return;
    try {
      const response = await axios.post(
        backendUrl + '/api/cards/deck',
        { user: user.login, name: newDeckName },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setDecks([...decks, {name : newDeckName, _id : response.data.id}]);
        setNewDeckName('');
      } else {
        console.error('Failed to create deck:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating deck:', error);
    }
  };

  const handleDeleteDeck = async (deckId, deckName) => {
    const userConfirmed = window.confirm(`Are you sure you want to delete deck ${deckName} ?`);
    if (!userConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/cards/deck/${deckId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
        );
        if (response.status === 200) {
            setDecks(decks.filter((deck) => deck._id !== deckId));
            }
        else {
            console.error('Failed to delete deck:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error deleting deck:', error);
    }
    }
    
    const handleResetDeck = async (deckId, deckName) => {
        const userConfirmed = window.confirm(`Are you sure you want to reset deck ${deckName} ?`);
        if (!userConfirmed) {
          return;
        }
    
        try {
          const response = await axios.put(`${backendUrl}/api/cards/deck/${deckId}/reset`,
            {},
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json',
              },
            }
            );
            if (response.status === 200) {
                setDecks(decks.map((deck) => deck._id === deckId ? {...deck, cards : []} : deck));
                }
            else {
                console.error('Failed to reset deck:', response.statusText);
            }
        }
        catch (error) {
            console.error('Error resetting deck:', error);
        }
        }


        const handleLogout  = () => {
          const cookies = new Cookies();

          cookies.remove('login');
          cookies.remove('jwt-token');
          setUser({});
          navigate("/")
        }

  return (
    <div>
       <nav className="deckActions">
          <a href="#" onClick={handleLogout}>Log out</a>
        </nav>
      <h1>Overview</h1>

      <form className="buttonForm">
        <label>
          <input
            type="text"
            value={newDeckName}
            placeholder="New Deck Name"
            onChange={(e) => setNewDeckName(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleCreateDeck}>
          Create Deck
        </button>
      </form>

      <h2>Your Decks :</h2>
      <ul className="deckList">
        {loaded[0] && decks.length == 0 && 
          <li>No decks found</li>}
        {decks.map((deck) => (
          <div key={deck._id} className="deckItem">
            {(deckRenaming.id === deck._id) &&
            <input type="text" value={deckRenaming.name} onChange={(e) => setDeckRenaming({...deckRenaming, name : e.target.value})} />}
            {(deckRenaming.id !== deck._id) &&
            <a href={'/deck/' + deck._id}><li>{deck.name}</li></a>}
            <div className="deckActions">
            <a href={'/deck/' + deck._id + '/study'}><span>&#9654; Study</span></a>
            <a href={'/deck/' + deck._id}>Edit</a>
            <a href="#" className="resetDeckButton" onClick={() => handleResetDeck(deck._id, deck.name)}>Reset cards schedule</a>
            <a href="#" 
            onClick={() => deckRenaming.name == "" ? setDeckRenaming({name : deck.name, id : deck._id}) : handleDeckRenaming()} 
            style={{color:(deckRenaming.id === deck._id ? "green" : "")}}>
              Rename</a>
            <span className="deleteDeckButton" style={{ color: 'red' }} onClick={() => handleDeleteDeck(deck._id, deck.name)}>❌ Delete</span>
            </div>
          </div>
        ))}
      </ul>
      <h2>Public Decks :</h2>
      <ul className="deckList">
        {loaded[1] && publicDecks.length == 0 && 
          <li>No decks found</li>}
        {publicDecks.map((deck) => (
          <div key={deck._id} className="deckItem">
            {(deckRenaming.id === deck._id) &&
            <input type="text" value={deckRenaming.name} onChange={(e) => setDeckRenaming({...deckRenaming, name : e.target.value})} />}
            {(deckRenaming.id !== deck._id) &&
            <a href={'/deck/' + deck._id}><li>{deck.name}</li></a>}
            <div className="deckActions">
            <a href={'/deck/' + deck._id + '/study'}><span>&#9654; Study</span></a>
            <a href="#" className="resetDeckButton" onClick={() => handleResetDeck(deck._id, deck.name)}>Reset cards schedule</a>
            </div>
            <p className="author">Author : <span>{deck.user.login}</span></p>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default Overview;