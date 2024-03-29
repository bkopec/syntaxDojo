import React, { useState, useEffect } from 'react';
import axios from 'axios';

import config from '../config.js';
const backendUrl = config.backendUrl;


const Overview = ({user}) => {
  const [categories, setCategories] = useState([]);
  const [publicCategories, setPublicCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryRenaming, setCategoryRenaming] = useState({name:'', _id:''});


  const handleCategoryRenaming = async () => {
    if (categoryRenaming.name === '' || (categoryRenaming.name === categories.find(category => category._id === categoryRenaming.id).name)) {
      setCategoryRenaming({name:'', _id:''});
      return; 
    }
    try {
    const response = await axios.put(`${backendUrl}/api/cards/category/${categoryRenaming.id}/rename`, {name : categoryRenaming.name}, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },}
    );
    if (response.status !== 200)
      throw new Error('Failed to rename category:', response.statusText);
    setCategories(categories.map((category) => category._id === categoryRenaming.id ? {...category, name : categoryRenaming.name} : category));
    setCategoryRenaming({name:'', _id:''});
    } catch (error) {
      console.error('Error renaming category:', error);
    }
  };


  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === 'Enter') {
        handleCategoryRenaming();
      }
    };
    if (categoryRenaming.id !== '') {
    document.addEventListener('keydown', handleEnterKey);
    return () => {
      document.removeEventListener('keydown', handleEnterKey);
    }
  }
  }, [categoryRenaming]);


  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(backendUrl + '/api/cards/category', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchPublicCategories = async () => {
      try {
        const response = await axios.get(backendUrl + '/api/cards/category/public', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setPublicCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };


    fetchCategories();
    fetchPublicCategories();
  }, [user.token]);

  const handleCreateCategory = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/cards/category',
        { user: user.login, name: newCategoryName },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setCategories([...categories, {name : newCategoryName, _id : response.data.id}]);
        setNewCategoryName('');
      } else {
        console.error('Failed to create category:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const userConfirmed = window.confirm(`Are you sure you want to delete category ${categoryName} ?`);
    if (!userConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/cards/category/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
        );
        if (response.status === 200) {
            console.log('Category deleted');
            setCategories(categories.filter((category) => category._id !== categoryId));
            }
        else {
            console.error('Failed to delete category:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error deleting category:', error);
    }
    }
    
    const handleResetCategory = async (categoryId, categoryName) => {
        const userConfirmed = window.confirm(`Are you sure you want to reset deck ${categoryName} ?`);
        if (!userConfirmed) {
          return;
        }
    
        try {
          const response = await axios.put(`${backendUrl}/api/cards/category/${categoryId}/reset`,
            {},
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json',
              },
            }
            );
            if (response.status === 200) {
                console.log('Category reset');
                setCategories(categories.map((category) => category._id === categoryId ? {...category, cards : []} : category));
                }
            else {
                console.error('Failed to reset category:', response.statusText);
            }
        }
        catch (error) {
            console.error('Error resetting category:', error);
        }
        }


  return (
    <div>
      <h1>Overview</h1>

      <form className="buttonForm">
        <label>
          <input
            type="text"
            value={newCategoryName}
            placeholder="New Deck Name"
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleCreateCategory}>
          Create Deck
        </button>
      </form>

      <h2>Your Decks :</h2>
      <ul className="deckList">
        {categories.length == 0 && 
          <li>No decks found</li>}
        {categories.map((category) => (
          <div key={category._id} className="deckItem">
            {(categoryRenaming.id === category._id) &&
            <input type="text" value={categoryRenaming.name} onChange={(e) => setCategoryRenaming({...categoryRenaming, name : e.target.value})} />}
            {(categoryRenaming.id !== category._id) &&
            <a href={'/category/' + category._id}><li>{category.name}</li></a>}
            <div className="categoryActions">
            <a href={'/category/' + category._id + '/study'}><span>&#9654; Study</span></a>
            <a href={'/category/' + category._id}>Edit</a>
            <a href="#" className="resetCategoryButton" onClick={() => handleResetCategory(category._id, category.name)}>Reset cards schedule</a>
            <a href="#" 
            onClick={() => categoryRenaming.name == "" ? setCategoryRenaming({name : category.name, id : category._id}) : handleCategoryRenaming()} 
            style={{color:(categoryRenaming.id === category._id ? "green" : "")}}>
              Rename</a>
            <span className="deleteCategoryButton" style={{ color: 'red' }} onClick={() => handleDeleteCategory(category._id, category.name)}>❌ Delete</span>
            </div>
          </div>
        ))}
      </ul>
      <h2>Public Decks :</h2>
    </div>
  );
};

export default Overview;