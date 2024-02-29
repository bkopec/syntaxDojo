import React, { useState, useEffect } from 'react';
import axios from 'axios';

import config from '../config.js';
const backendUrl = config.backendUrl;


const Overview = ({user}) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');

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

    fetchCategories();
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

  return (
    <div>
      <h1>Overview</h1>
      <p>Some text about the overview page.</p>

      <form>
        <label>
          Category Name:
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleCreateCategory}>
          Create Category
        </button>
      </form>

      <h2>Categories:</h2>
      <ul>
        {categories.map((category) => (
          <a href={'/category/' + category._id}><li key={category._id}>{category.name}</li></a>
        ))}
      </ul>
    </div>
  );
};

export default Overview;