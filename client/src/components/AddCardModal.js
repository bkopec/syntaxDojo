import React, { useState, useRef } from 'react';
import axios from 'axios';

import config from '../config.js'

const backendUrl = config.backendUrl;

const AddCardModal = ({ categoryId, moduleId, user, onClose, onCardAdded }) => {
  const cardName = useRef(null);
  const [cardType, setCardType] = useState('standard');

  // standard card
  const cardFront = useRef(null);
  const cardBack = useRef(null);

  // input card
  const instructions = useRef(null);
  const beforeInput = useRef(null);
  const afterInput = useRef(null);
  const cardAnswer = useRef(null);

  // multiple choice card
    const question = useRef(null);
    const [additionalChoices, setAdditionalChoices] = useState(['', '']);
    const correctAnswer = useRef(null);
    const [numberOfAdditionalChoices, setNumberOfAdditionalChoices] = useState(2);

    const [newlinesAroundInput, setNewlinesAroundInput] = useState(false);

    

  const resetInputs = () => {
    if (cardName.current)
      cardName.current.textContent = '';
    //setCardType('standard');
    if (cardFront.current)
      cardFront.current.textContent = '';
    if (cardBack.current)
      cardBack.current.textContent = '';
    if (beforeInput.current)
      beforeInput.current.textContent = '';
    if (afterInput.current)
      afterInput.current.textContent = '';
    if (cardAnswer.current)
      cardAnswer.current.textContent = '';
    if (question.current)
      question.current.textContent = '';
    if (instructions.current)
      instructions.current.textContent = '';
    setAdditionalChoices(Array(numberOfAdditionalChoices).fill(''));
    if (correctAnswer.current)
      correctAnswer.current.textContent = '';
  }

  const handleAddCard = async () => {
    try {
      let payload;

      switch (cardType) {
        case 'standard':
          payload = { name : cardName.current.textContent,
            front: cardFront.current.textContent,
            back: cardBack.current.textContent};
          break;
        case 'multipleChoice':
          payload = { name : cardName.current.textContent,
            question: question.current.textContent,
            correctAnswer: correctAnswer.current.textContent,
            choices: additionalChoices};
          break;
        case 'lineInput':
          payload = { name : cardName.current.textContent,
            instructions: instructions.current.textContent,
            beforeInput: beforeInput.current.textContent,
            afterInput: afterInput.current.textContent,
            answer: cardAnswer.current.textContent,
            newlinesAroundInput: newlinesAroundInput};
          break;
        default:
          break;
      }
      payload['type'] = cardType;
      payload.moduleId = moduleId;

      const response = await axios.post(
        `${backendUrl}/api/cards/category/${categoryId}/module/${moduleId}/addCard`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        // If the response is successful, close the modal and trigger the callback
        //onClose();
        resetInputs();
        onCardAdded({...payload,  _id: response.data.id, }, moduleId);
      } else {
        console.error('Failed to add card:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  
  const handleNumberOfAdditionalChoicesChange = (event) => {
    const newNumberOfAnswers = parseInt(event.target.value, 10);
    setNumberOfAdditionalChoices(newNumberOfAnswers);
    if (event.target.value > numberOfAdditionalChoices)
        setAdditionalChoices([...additionalChoices, '']);
    else
        setAdditionalChoices(additionalChoices.slice(0, newNumberOfAnswers));
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...additionalChoices];
    newChoices[index] = value;
    setAdditionalChoices(newChoices);
  };

  const renderCardTypeFields = () => {
    switch (cardType) {
      case 'standard':
        return (
          <>
            <label htmlFor="cardFront" className="required">Front:&nbsp;
            <div 
              contentEditable
              ref={cardFront}
              id="cardFront"
            />
            </label>
            <label htmlFor="cardBack" className="required">Back:&nbsp;
            <div 
              contentEditable
              ref={cardBack}
              id="cardBack"
            />
            </label>
          </>
        );
      case 'multipleChoice':
        return (
          <>
            <label htmlFor="question" className="required">Question:
            <div 
              contentEditable
              ref={question}
              id="question"
            />
            </label>
            <label htmlFor="correctAnswer" className="required">Correct answer:
            <div 
              contentEditable
              ref={correctAnswer}
              id="correctAnswer"
            />
            </label>
            {Array.from({ length: numberOfAdditionalChoices }, (_, index) => (
              <div key={index}>
                <label htmlFor={`additionalChoice${index + 1}`}>Additional Choice {index + 1}:
                <input
                  type="text"
                  id={`additionalChoice${index + 1}`}
                  value={additionalChoices[index]}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                />
                </label>
              </div>
            ))}
            <label htmlFor="numberOfAdditionalChoices">Number of additional choices:
            <input
              type="number"
              id="numberOfAdditionalChoices"
              value={numberOfAdditionalChoices}
              onChange={handleNumberOfAdditionalChoicesChange}
            />
            </label>
          </>
        );
      case 'lineInput':
        return (
          <>
          <label htmlFor="instructions" className="required">Instructions:
          <div 
              contentEditable
              ref={instructions}
              id="instructions"
            />
            </label>
            <label htmlFor="beforeInput">Before Input:
            <div 
              contentEditable
              ref={beforeInput}
              id="beforeInput"
            />
            </label>
            <label htmlFor="afterInput">After Input:
            <div 
              contentEditable
              ref={afterInput}
              id="afterInput"
            />
            </label>
            <label htmlFor="cardAnswer" className="required">Answer:
            <div 
              contentEditable
              ref={cardAnswer}
              id="cardAnswer"
            />
            </label>
            <label htmlFor="newlinesAroundInput">Newlines surrounding input:
            <input
              type="checkbox"
              id="newlinesAroundInput"
              checked={newlinesAroundInput}
              onChange={(e) => setNewlinesAroundInput(e.target.checked)}
            />
            </label>
          </>
        );
      // Add more cases for additional card types
      default:
        return null;
    }
  };

  return (
    <div className="overlay">
      <div className="addCard modal">
        <h2>Add Card</h2>
        <label>
          Card Type:
          <select value={cardType} onChange={(e) => setCardType(e.target.value)}>
            <option value="standard">Standard</option>
            <option value="multipleChoice">Multiple Choice</option>
            <option value="lineInput">Line/Multiline Input</option>
            {/* Add more options for additional card types */}
          </select>
        </label>
        {renderCardTypeFields()}
        <label>
          Card Name:
          <div
            contentEditable
            ref={cardName}
          />
        </label>
        <button className="addCardButton" onClick={handleAddCard}>Add Card</button>
        <span className="closeButton" onClick={() => onClose()}>&times;</span>
      </div>
    </div>
  );
};

export default AddCardModal;