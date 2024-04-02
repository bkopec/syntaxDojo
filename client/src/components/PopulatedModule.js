import React from 'react';
import axios from 'axios';

import Card from './Card';
import config from '../config.js';



const PopulatedModule = ({module, handleDeleteModule, handleAddCard, handleDeleteCard, handleViewCardModal, isUserOwner}) => {
  return (
    <div  className="populatedModule">
    <h2>Module: {module.name}</h2>
    {isUserOwner && 
    <div className="moduleActions">
    <span style={{ color: 'green', fontSize: "36px", fontWeight: 'bold' }} onClick={() => handleAddCard(module._id, module.name)} title="Add Card">＋</span>
    <span className="deleteModuleButton" style={{ color: 'red' }} onClick={() => handleDeleteModule(module._id, module.name)} title="Delete Module">❌</span>
    </div>
    }
    <h3>Cards:</h3>
    <div className="cardList">
      {module.cards.length === 0 && <p>No cards found</p>}
      {module.cards.map((card) => (
        <div key={card._id} className="cardListItem">
          <Card card={card} handleViewCardModal={handleViewCardModal} />
          <div className="cardActions">
          <img className="viewCardIcon" src="/images/eye.png" alt="Edit" onClick={() => handleViewCardModal(card)} title="View Card" />
          {isUserOwner && <span className="deleteCardButton" style={{ color: 'red' }} onClick={() => handleDeleteCard(card._id, module._id)} title="Delete Card">❌</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
  );
}


export default PopulatedModule;