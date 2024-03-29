import ViewCardModal from './ViewCardModal';
import React, { useState } from 'react';

const Card = ({card, handleViewCardModal, handleDeleteCard}) => {

  const getContent = () => {
    if (card.name) return card.name;
    if (card.front) return card.front;
    if (card.question) return card.question;
    if (card.instructions) return card.instructions;
    return null;
  };

  const content = getContent();

    return (
      <>
        <li onClick={() => handleViewCardModal(card)}>
        <p>
          {content}
        </p>
        </li>
    </>
    );

}

export default Card;