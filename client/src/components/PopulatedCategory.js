import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import PopulatedModule from './PopulatedModule';

import config from '../config.js'

const backendUrl = config.backendUrl;




const PopulatedCategory = ({user}) => {

    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [newModuleName, setNewModuleName] = useState('');
    const [newCardName, setNewCardName] = useState('');
  
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
  
    const handleAddCard = async (moduleId) => {
      try {
        const response = await axios.post(
          backendUrl + `/api/cards/category/${categoryId}/module/${moduleId}/addCard`,
          { name: newCardName },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (response.status === 201) {
          // If the response is successful, navigate to the new view
          navigate(`/category/${categoryId}/${moduleId}/add`);
        } else {
          console.error('Failed to add card:', response.statusText);
        }
      } catch (error) {
        console.error('Error adding card:', error);
      }
    };


    const onModuleDelete = (moduleId) => {
        setCategory((prevCategory) => ({
          ...prevCategory,
          modules: prevCategory.modules.filter((module) => module._id !== moduleId),
        }));
      };
    
    
      const handleDelete = async (moduleId) => {
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


    return (
        <>
        {category ? (
        <div>
        <h1>Category {category.name}</h1>
        <p>Some text about the category view page.</p>

        {category.modules.map((module) => (
            <PopulatedModule key={module._id} module={module} handleDelete={handleDelete} handleAddCard={handleAddCard} />
        ))}

        <div>
          <input
            type="text"
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
          />
          <button onClick={handleAddModule}>Add Module</button>
        </div>
        </div>
        ) : (
        <p>Loading...</p>
        )}
      </>
    )
}

export default PopulatedCategory;