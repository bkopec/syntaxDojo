import React from 'react';
import axios from 'axios';

import Card from './Card';
import config from '../config.js';
const backendUrl = config.backendUrl;



const PopulatedModule = ({module, handleDeleteModule, handleAddCard, handleDeleteCard, handleViewCardModal}) => {
  return (
    <div>
    <h2>Module: {module.name} 
    <span style={{ color: 'green', fontSize: "36px", fontWeight: 'bold' }} onClick={() => handleAddCard(module._id, module.name)} title="Add Card">+</span>
    <span style={{ color: 'red' }} onClick={() => handleDeleteModule(module._id, module.name)} title="Delete Module">❌</span>
    </h2>
    <h3>Cards:</h3>
    <ul>
      {module.cards.map((card) => (
        <div key={card._id} className="cardListItem">
          <Card card={card} handleViewCardModal={handleViewCardModal} />
          <div className="cardActions">
          <img className="viewCardIcon" src="/images/eye.png" alt="Edit" onClick={() => handleViewCardModal(card)} title="View Card" />
            <span className="deleteCardButton" style={{ color: 'red' }} onClick={() => handleDeleteCard(card._id, module._id)} title="Delete Card">❌</span>
          </div>
        </div>
      ))}
    </ul>
  </div>
  );
}


export default PopulatedModule;