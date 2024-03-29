import React, { useState, useEffect, useCallback, useLayoutEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import PopulatedModule from './PopulatedModule';
import ViewCardModal from './ViewCardModal';
import AddCardModal from './AddCardModal';

import config from '../config.js'

const backendUrl = config.backendUrl;




const PopulatedCategory = ({user}) => {

    const {categoryId} = useParams();
    const [category, setCategory] = useState(null);
    const [newModuleName, setNewModuleName] = useState('');

    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [viewCardModal, setViewCardModal] = useState(null);


    const [selectedModuleId, setSelectedModuleId] = useState(null);

    const navigate = useNavigate();
  
    // Fetch category data on component mount
    useEffect(() => {
      const fetchCategory = async () => {
        try {
          const response = await axios.get(backendUrl + `/api/cards/category/${categoryId}/populated`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          setCategory(response.data);
        } catch (error) {
          console.error('Error fetching category:', error);
        }
      };
  
      fetchCategory();
    }, [categoryId, user.token]); // Include categoryId and user.token as dependencies
  

    const onCardAdded = (card, moduleId) => {

            setCategory((prevCategory) => ({
              ...prevCategory,
              modules: prevCategory.modules.map((module) =>
                module._id === moduleId
                  ? {
                      ...module,
                      cards: [...module.cards, { ...card }],
                    }
                  : module
              ),
            }));
      
            //handleCloseModal();
    }

    useLayoutEffect(() => {
        const handleKeyDown = (event) => {
          if (event.key === 'ArrowLeft' && viewCardModal) {
            handleViewPreviousCard();
          } else if (event.key === 'ArrowRight' && viewCardModal) {
            handleViewNextCard();
          }
        };
    
        //document.removeEventListener('keydown', handleKeyDown);

        document.addEventListener('keydown', handleKeyDown);
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }, [category, viewCardModal]);


    const handleUpdateCard = async (updatedCard) => {
      if (updatedCard.updated === false)
        return;

      try {
      const response = await axios.put(backendUrl + `/api/cards/category/${categoryId}/module/${updatedCard.moduleId}/card/${updatedCard._id}`, updatedCard, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        });
      if (response.status !== 200)
        throw new Error('Failed to update card:', response.statusText);
        setCategory((prevCategory) => ({
          ...prevCategory,
          modules: prevCategory.modules.map((module) =>
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
        const currentModule = category.modules.find((module) =>
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
            let nextModuleIndex = category.modules.findIndex((module) => module._id === currentModule._id) + 1;
            let nextModule = category.modules[nextModuleIndex];
            while (nextModule && nextModule.cards.length === 0) {
                nextModule = category.modules[nextModuleIndex + 1];
                nextModuleIndex++;
            }
            if (nextModule && nextModule.cards[0])
                setViewCardModal(nextModule.cards[0]);
            else
                setViewCardModal(null);
        }
    };

    const handleViewPreviousCard = () => {
        const currentModule = category.modules.find((module) =>
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
            let previousModuleIndex = category.modules.findIndex((module) => module._id === currentModule._id) - 1;
            if (previousModuleIndex == -1) {
                setViewCardModal(null);
                return;
            }
            let previousModule = category.modules[previousModuleIndex];
            while (previousModule && previousModule.cards.length === 0) {
                previousModule = category.modules[previousModuleIndex - 1];
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
      try {
        const response = await axios.post(
          backendUrl + `/api/cards/category/${categoryId}/module/`,
          { name: newModuleName },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (response.status === 200) {
          // If the response is successful, update the category state
          setCategory((prevCategory) => ({
            ...prevCategory,
            modules: [...prevCategory.modules, {_id : response.data.id, name: newModuleName, cards: []}],
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
        setCategory((prevCategory) => ({
          ...prevCategory,
          modules: prevCategory.modules.filter((module) => module._id !== moduleId),
        }));
      };
    
      const handleDeleteCard = async (cardId, moduleId) => {
        const userConfirmed = window.confirm("Are you sure you want to delete this card ?");
        if (!userConfirmed) {
          return;
        }
        try {
          await axios.delete(backendUrl + `/api/cards/category/${categoryId}/module/${moduleId}/card/${cardId}`, 
          {headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },});
            if (viewCardModal && viewCardModal._id === cardId)
                setViewCardModal(null);
            setCategory((prevCategory) => ({
                ...prevCategory,
                modules: prevCategory.modules.map((module) =>
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
          await axios.delete(backendUrl + `/api/cards/category/${categoryId}/module/${moduleId}`, 
          {headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },});
          onModuleDelete(moduleId);
        } catch (error) {
          console.error('Error deleting module:', error);
        }
      };

      console.log(category);

    return (
        <>
        {category ? (
        <div>
        <a href="#" onClick={() => navigate("/")}>Go back</a>
        <h1>Deck: {category.name}</h1>
        <div className="buttonForm">
          <input
            type="text"
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
          />
          <button onClick={handleAddModule}>Add Module</button>
        </div>

        {category.modules.map((module) => (
            <PopulatedModule 
            key={module._id} 
            module={module} 
            handleDeleteModule={handleDeleteModule} 
            handleAddCard={handleAddCard} 
            handleDeleteCard={handleDeleteCard}
            handleViewCardModal={handleViewCardModal}
            
            />
        ))}

        </div>
        ) : (
        <p>Loading...</p>
        )}
         {showAddCardModal && (
                        <AddCardModal
                        className="modal"
                          categoryId={categoryId}
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
        categoryName={category.name}
        moduleName={category.modules.find((module) =>
            module.cards.some((card) => card._id === viewCardModal._id)
        ).name}
        handleNextCard={handleViewNextCard}
        handlePreviousCard={handleViewPreviousCard}
        handleCloseModal={() => setViewCardModal(null)}
        handleUpdateCard={handleUpdateCard}
        handleDeleteCard={handleDeleteCard}
        />
)}

      </>
    )
}

export default PopulatedCategory;