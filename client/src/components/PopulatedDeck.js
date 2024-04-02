import React, { useState, useEffect, useCallback, useLayoutEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import PopulatedModule from './PopulatedModule.js';
import ViewCardModal from './ViewCardModal.js';
import AddCardModal from './AddCardModal.js';

import config from '../config.js'

const backendUrl = config.backendUrl;




const PopulatedDeck = ({user}) => {

    const {deckId} = useParams();
    const [deck, setDeck] = useState(null);
    const [newModuleName, setNewModuleName] = useState('');

    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [viewCardModal, setViewCardModal] = useState(null);

    const [selectedModuleId, setSelectedModuleId] = useState(null);

    const navigate = useNavigate();

    const [isUserOwner, setIsUserOwner] = useState(false);
  
    useEffect(() => {
      const fetchDeck = async () => {
        try {
          const response = await axios.get(backendUrl + `/api/cards/deck/${deckId}/populated`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          setIsUserOwner(response.data.user.login === user.login);
          setDeck(response.data);
        } catch (error) {
          console.error('Error fetching deck:', error);
        }
      };
  
      fetchDeck();
    }, [deckId, user.token]); 
  

    const onCardAdded = (card, moduleId) => {

            setDeck((prevDeck) => ({
              ...prevDeck,
              modules: prevDeck.modules.map((module) =>
                module._id === moduleId
                  ? {
                      ...module,
                      cards: [...module.cards, { ...card }],
                    }
                  : module
              ),
            }));
      
    }

    useLayoutEffect(() => {
        const handleKeyDown = (event) => {
          if (event.key === 'ArrowLeft' && viewCardModal) {
            handleViewPreviousCard();
          } else if (event.key === 'ArrowRight' && viewCardModal) {
            handleViewNextCard();
          }
        };
    

        document.addEventListener('keydown', handleKeyDown);
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }, [deck, viewCardModal]);


    const handleUpdateCard = async (updatedCard) => {
      if (updatedCard.updated === false)
        return;

      try {
      const response = await axios.put(backendUrl + `/api/cards/deck/${deckId}/module/${updatedCard.moduleId}/card/${updatedCard._id}`, updatedCard, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        });
      if (response.status !== 200)
        throw new Error('Failed to update card:', response.statusText);
        setDeck((prevDeck) => ({
          ...prevDeck,
          modules: prevDeck.modules.map((module) =>
            module._id === updatedCard.moduleId
              ? { ...module, cards: module.cards.map((card) => (card._id === updatedCard._id ? updatedCard : card)) }
              : module
          ),
        }));
        setViewCardModal(updatedCard);

      } catch (error) {
        console.error('Error updating card:', error);
      }

    };


    const handleViewNextCard = () => {
        const currentModule = deck.modules.find((module) =>
            module.cards.some((card) => card._id === viewCardModal._id)
        );
        const currentCardIndex = currentModule.cards.findIndex(
            (card) => card._id === viewCardModal._id
        );
        const nextCard = currentModule.cards[currentCardIndex + 1];
        if (nextCard) {
            setViewCardModal(nextCard);
        }
        else {
            let nextModuleIndex = deck.modules.findIndex((module) => module._id === currentModule._id) + 1;
            let nextModule = deck.modules[nextModuleIndex];
            while (nextModule && nextModule.cards.length === 0) {
                nextModule = deck.modules[nextModuleIndex + 1];
                nextModuleIndex++;
            }
            if (nextModule && nextModule.cards[0])
                setViewCardModal(nextModule.cards[0]);
            else
                setViewCardModal(null);
        }
    };

    const handleViewPreviousCard = () => {
        const currentModule = deck.modules.find((module) =>
            module.cards.some((card) => card._id === viewCardModal._id)
        );
        const currentCardIndex = currentModule.cards.findIndex(
            (card) => card._id === viewCardModal._id
        );
        const previousCard = currentModule.cards[currentCardIndex - 1];
        if (previousCard) {
            setViewCardModal(previousCard);
        }
        else {
            let previousModuleIndex = deck.modules.findIndex((module) => module._id === currentModule._id) - 1;
            if (previousModuleIndex == -1) {
                setViewCardModal(null);
                return;
            }
            let previousModule = deck.modules[previousModuleIndex];
            while (previousModule && previousModule.cards.length === 0) {
                previousModule = deck.modules[previousModuleIndex - 1];
                previousModuleIndex--;
            }
            if (previousModule && previousModule.cards[previousModule.cards.length - 1]) {
                setViewCardModal(previousModule.cards[previousModule.cards.length - 1]);
            }
            else
                setViewCardModal(null);
        }
    };


      const handleViewCardModal = (card) => {
        setViewCardModal(card);
        };

      const handleAddCard = (moduleId) => {
        setShowAddCardModal(true);
        setSelectedModuleId(moduleId);
      };
    
      const handleCloseModal = () => {
        setShowAddCardModal(false);
        setSelectedModuleId(null);
      };
    

    const handleAddModule = async () => {
      if (!newModuleName)
        return;
      try {
        const response = await axios.post(
          backendUrl + `/api/cards/deck/${deckId}/module/`,
          { name: newModuleName },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (response.status === 200) {
          setDeck((prevDeck) => ({
            ...prevDeck,
            modules: [...prevDeck.modules, {_id : response.data.id, name: newModuleName, cards: []}],
          }));
          setNewModuleName('');
        } else {
          console.error('Failed to add module:', response.statusText);
        }
      } catch (error) {
        console.error('Error adding module:', error);
      }
    };


    const onModuleDelete = (moduleId) => {
        setDeck((prevDeck) => ({
          ...prevDeck,
          modules: prevDeck.modules.filter((module) => module._id !== moduleId),
        }));
      };
    
      const handleDeleteCard = async (cardId, moduleId) => {
        const userConfirmed = window.confirm("Are you sure you want to delete this card ?");
        if (!userConfirmed) {
          return;
        }
        try {
          await axios.delete(backendUrl + `/api/cards/deck/${deckId}/module/${moduleId}/card/${cardId}`, 
          {headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },});
            if (viewCardModal && viewCardModal._id === cardId)
                setViewCardModal(null);
            setDeck((prevDeck) => ({
                ...prevDeck,
                modules: prevDeck.modules.map((module) =>
                    module._id === moduleId
                    ? {
                        ...module,
                        cards: module.cards.filter((card) => card._id !== cardId),
                        }
                    : module
                ),
                }));
        } catch (error) {
            console.error('Error deleting card:', error);
            }
        };

      const handleDeleteModule = async (moduleId, moduleName) => {
        const userConfirmed = window.confirm(`Are you sure you want to delete module ${moduleName} ?`);
        if (!userConfirmed) {
          return;
        }

        try {
          await axios.delete(backendUrl + `/api/cards/deck/${deckId}/module/${moduleId}`, 
          {headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },});
          onModuleDelete(moduleId);
        } catch (error) {
          console.error('Error deleting module:', error);
        }
      };


    return (
        <>
        {deck ? (
        <div>
        <nav className="deckActions">
          <a href="#" onClick={() => navigate("/")}>Go back</a>
          <a href={'/deck/' + deck._id + '/study'}><span>&#9654; Study</span></a>
        </nav>
        <h1>Deck: {deck.name}</h1>
        {isUserOwner && <div className="buttonForm">
          <input
            type="text"
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
          />
          <button onClick={handleAddModule}>Add Module</button>
        </div>}

        {deck.modules.length === 0 && <p>No modules or cards in this deck</p>}

        {deck.modules.map((module) => (
            <PopulatedModule 
            key={module._id} 
            module={module} 
            handleDeleteModule={handleDeleteModule} 
            handleAddCard={handleAddCard} 
            handleDeleteCard={handleDeleteCard}
            handleViewCardModal={handleViewCardModal}
            isUserOwner={isUserOwner}
            />
        ))}

        </div>
        ) : (
        <p>Loading...</p>
        )}
         {showAddCardModal && (
                        <AddCardModal
                        className="modal"
                          deckId={deckId}
                          moduleId={selectedModuleId}
                          user={user}
                          onClose={handleCloseModal}
                          onCardAdded={onCardAdded}
                        />
        )}
        {viewCardModal && (
        <ViewCardModal
        className="modal"
        card={viewCardModal}
        deckName={deck.name}
        moduleName={deck.modules.find((module) =>
            module.cards.some((card) => card._id === viewCardModal._id)
        ).name}
        handleNextCard={handleViewNextCard}
        handlePreviousCard={handleViewPreviousCard}
        handleCloseModal={() => setViewCardModal(null)}
        handleUpdateCard={handleUpdateCard}
        handleDeleteCard={handleDeleteCard}
        isUserOwner={isUserOwner}
        />
)}

      </>
    )
}

export default PopulatedDeck;