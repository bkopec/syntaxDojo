import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import config from '../config.js'

const backendUrl = config.backendUrl;

const AddCardModal = ({ deckId, moduleId, user, onClose, onCardAdded}) => {
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
    const correctAnswer = useRef(null);
    const [numberOfAdditionalChoices, setNumberOfAdditionalChoices] = useState(2);

    const [newlinesAroundInput, setNewlinesAroundInput] = useState(false);

    const convertHtml = (html) => {
      return (html.replace(/(?<!>)(<div>|<h1>|<h2>|<h3>|<h4>|<h5>|<h6>|<p>|<li>|<ul>|<ol>)/g, '\n').replace(/<\/(div|h1|h2|h3|h4|h5|h6|p|li|ul|ol)>/gi, '\n').replace(/<[^>]+(?!br\s*\/?>)[^>]*>/g, '').replace(/<br\s*\/?>/gi, '\n'));
    };

    const handlePaste = (event) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('inserttext', false, text);
    };

  const resetInputs = () => {
    if (cardName.current)
      cardName.current.textContent = '';
    if (cardFront.current)
      cardFront.current.textContent = '';
    if (cardBack.current)
      cardBack.current.textContent ='';
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
    if (correctAnswer.current)
      correctAnswer.current.textContent = '';
  }

 const getAdditionalChoices = () => {
    let additionalChoices = [];
    for (let i = 1; i <= numberOfAdditionalChoices; i++) {
      const choice = document.getElementById(`additionalChoice${i}`);
      if (choice) {
        additionalChoices.push(convertHtml(choice.innerHTML));
      }
      else {
        additionalChoices.push('');
      }
    }
    return additionalChoices;
 };

  const handleAddCard = async () => {
    try {
      let payload;

      switch (cardType) {
        case 'standard':
          payload = { name : cardName.current.textContent,
            front: convertHtml(cardFront.current.innerHTML),
            back: convertHtml(cardBack.current.innerHTML)};
          break;
        case 'multipleChoice':
          payload = { name : cardName.current.textContent,
            question: convertHtml(question.current.innerHTML),
            correctAnswer: convertHtml(correctAnswer.current.innerHTML),
            choices: getAdditionalChoices()};
          break;
        case 'lineInput':
          payload = { name : cardName.current.textContent,
            instructions: convertHtml(instructions.current.innerHTML),
            beforeInput: convertHtml(beforeInput.current.innerHTML),
            afterInput: convertHtml(afterInput.current.innerHTML),
            answer: convertHtml(cardAnswer.current.innerHTML),
            newlinesAroundInput: newlinesAroundInput};
          break;
        default:
          break;
      }
      payload['type'] = cardType;
      payload.moduleId = moduleId;

      const response = await axios.post(
        `${backendUrl}/api/cards/deck/${deckId}/module/${moduleId}/addCard`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        resetInputs();
        onCardAdded({...payload,  _id: response.data.id, nextReviewDate : 0, nextReviewInterval : -1 }, moduleId);
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
              onPaste={handlePaste}
            />
            </label>
            <label htmlFor="cardBack" className="required">Back:&nbsp;
            <div 
              contentEditable
              ref={cardBack}
              id="cardBack"
              onPaste={handlePaste}
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
              onPaste={handlePaste}
            />
            </label>
            <label htmlFor="correctAnswer" className="required">Correct answer:
            <div 
              contentEditable
              ref={correctAnswer}
              id="correctAnswer"
              onPaste={handlePaste}
            />
            </label>
            {Array.from({ length: numberOfAdditionalChoices }, (_, index) => (
              <div key={index}>
                <label htmlFor={`additionalChoice${index + 1}`}>Additional Choice {index + 1}:
                <div
                  contentEditable
                  id={`additionalChoice${index + 1}`}
                  onPaste={handlePaste}
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
              onPaste={handlePaste}
            />
            </label>
            <label htmlFor="beforeInput">Before Input:
            <div 
              contentEditable
              ref={beforeInput}
              id="beforeInput"
              onPaste={handlePaste}
            />
            </label>
            <label htmlFor="afterInput">After Input:
            <div 
              contentEditable
              ref={afterInput}
              id="afterInput"
              onPaste={handlePaste}
            />
            </label>
            <label htmlFor="cardAnswer" className="required">Answer:
            <div 
              contentEditable
              ref={cardAnswer}
              id="cardAnswer"
              onPaste={handlePaste}
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