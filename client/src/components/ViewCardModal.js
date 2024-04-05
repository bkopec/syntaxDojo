import { useState, useRef, useEffect } from 'react';

const ViewCardModal = ({ card, moduleName, deckName, moduleId, handleCloseModal, handleNextCard, handlePreviousCard, handleUpdateCard, handleDeleteCard, isUserOwner, modules, handleMoveCard}) => {
    const [editingMode, setEditingMode] = useState(false);
    const  [updatedCard, setUpdatedCard] = useState({ ...card, updated:false});
    const fieldsToSkip = ['_id', 'next', 'moduleId', '__v', 'updated', 'reviews', 'nextReviewDate', 'nextReviewInterval'];

    useEffect(() => {
      setUpdatedCard({ ...card, updated: false });
    }, [card]);

    const handleClickOverlay = (e) => {
      if (e.target.classList.contains('overlay')) {
        handleCloseModal();
      }
    };

    const toggleEditingMode = () => {
      if (editingMode) {
        handleUpdateCard(updatedCard);
      }
      setEditingMode(prevMode => !prevMode);
    };
  
    const handleArrayChange = (key, index, newValue) => {
        setUpdatedCard({ ...updatedCard, [key]: updatedCard[key].map((item, i) => i === index ? newValue : item), updated: true});
    };

    const handleCardChange = (key, newValue) => {
        setUpdatedCard({ ...updatedCard, [key]: newValue, updated: true});
    };

    return (
      <div onClick={handleClickOverlay} className="overlay">
        
        <div className="modal viewCard">
            {isUserOwner && <div className="actions">
                {!editingMode && <img className="editIcon" src="/images/edit.png" alt="Edit" onClick={toggleEditingMode} title="Edit Card" />}
                {editingMode && <img className="editIcon" src="/images/green-check.png" alt="Edit" onClick={toggleEditingMode} title="Save Card" />}
                <span className="deleteCardButton" style={{ color: 'red' }} onClick={() => handleDeleteCard(card._id, card.moduleId)} title="Delete Card">❌</span>
                {modules.length > 1 && <label>Change module:&nbsp; 
                  <select onChange={(e) => handleMoveCard(card, e.target.value)} value={""}>
                  <option value="" disabled>Select module</option>
                    {modules.map((module) => (
                      module._id != card.moduleId && <option key={module._id} value={module._id}>{module.name}</option>
                    ))}
                  </select>
                </label>}
            </div>}
          <h1>Card Details</h1>
          <p className="cardPath">{deckName} &gt; {moduleName}</p>
          {Object.keys(card).map(key => (
            fieldsToSkip.includes(key) ? null : (
              <div key={key}>
                {key !== 'type' && !editingMode ? (
                  /**** Viewing mode ****/
                  <p>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:&nbsp;</strong>
                    {Array.isArray(card[key]) ? (
                      <ul>
                        {card[key].map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : ( 
                      card[key].toString() == '' ? <span className="emptyField">Empty</span> : card[key].toString()
                    )}
                  </p>
              ) : ( 
                /**** Editing mode ****/
                  <div className="field">
                    <p>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:&nbsp;</strong>
                    {typeof card[key] === 'boolean' ? (
                      <input type="checkbox" checked={updatedCard[key]} onClick={(e) => handleCardChange(key, e.target.checked)} />
                    ) : key !== 'type' ? (
                      Array.isArray(card[key]) ? (
                        <ul>
                          {card[key].map((item, index) => (
                            <li key={index} contentEditable="true" onBlur={(e) => handleArrayChange(key, index, e.target.textContent)}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <div contentEditable="true" onBlur={(e) => handleCardChange(key, e.target.textContent)}>{card[key]}</div>
                      )
                    ) : (
                        <>
                      {card[key]}
                      </>
                    )}
                    </p>
                  </div>
                )}
              </div>
            )
          ))}
          <span className="closeButton" onClick={handleCloseModal}>&times;</span>
          <span className="next-button" onClick={handleNextCard}>&rarr;</span>
          <span className="previous-button" onClick={handlePreviousCard}>&larr;</span>
        </div>
      </div>
    );
};

export default ViewCardModal;