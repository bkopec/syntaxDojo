import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudyCard = ({ card, nextCard, onReviewSuccess, onReviewFailure }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState(-1);
    const [cardReviewed, setCardReviewed] = useState(false);
    const choices = useRef(null);
    const inputRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const reviewed = cardReviewed;
        setCardReviewed(false);
        setShowAnswer(false);
        if (inputRef.current) {
            inputRef.current.innerHTML = "&#8203;";
            inputRef.current.focus();
        }
        if (reviewed) {
            choices.current = null;
            setSelectedChoice(-1);
            nextCard();
        }
        }, [card, cardReviewed]);

    console.log("selected :" + selectedChoice)
    const getCardHeader = useMemo(() => {
        if (card.type === 'standard') {
            return <p>{card.front}</p>;
        }

        if (card.type === 'multipleChoice') {
            if (choices.current === null) {
                choices.current = [...card.choices, card.correctAnswer];
                choices.current.sort(() => Math.random() - 0.5);
            }
            return (
                <>
                    <p>{card.question}</p>
                    <ul className="multipleChoice">
                        {choices.current.map((choice, index) => (
                            <>
                            {!showAnswer && 
                            <div className="choice">
                            <input type="radio" checked={selectedChoice == index ? 'true' : ''} value={index} onClick={() => setSelectedChoice(index)}/>
                            <label>{choice}</label>
                            </div>
                            }
                            {showAnswer &&
                            <div className={"choice" + 
                            (choices.current[index] === card.correctAnswer ? 
                            " correctAnswer" 
                            : 
                            (selectedChoice == index ? " wrongAnswer" : ""))}>
                            <input type="radio" checked={selectedChoice == index ? 'true' : ''} disabled={true} />
                            <label>{choice}</label>
                            </div>
                            }
                            </>
                        ))}
                    </ul>
                </>
            );
        }
        if (card.type === 'lineInput') {
            return (
                <>
                    <p>{card.instructions}</p>
                    {card.beforeInput && <p className={"beforeInput" + (card.newlinesAroundInput ? "" : " inline")}>{card.beforeInput}</p>}
                    <div ref={inputRef} className={"cardInput" + (card.newlinesAroundInput ? "" : " inline")} contentEditable={showAnswer ? "false" : "true"}>&#8203;</div>
                    {card.afterInput && <p className={"afterInput" +  (card.newlinesAroundInput ? "" : " inline")}>{card.afterInput}</p>}
                </>
            );
        }
    }, [card, choices, showAnswer, selectedChoice]);

    const getCardAnswer = useMemo(() => {
        if (card.type === 'standard') {
            return card.back;
        }

        if (card.type === 'multipleChoice') {
            return card.correctAnswer;
        }
        if (card.type === 'lineInput') {
            return card.answer;
        }
    }, [card]);

    return (
        <div className={"studyCard" + (showAnswer ? " answered" : "")}>
            <nav>
                <a href="#" onClick={() => navigate("/")}>Go Back</a>
                <a href="#" onClick={() => nextCard()}>Skip Card</a>
            </nav>
            {getCardHeader}
            <div className="actions">
            {!showAnswer && <button className="showAnswer" onClick={() => setShowAnswer(true)}>Show Answer</button>}
            {showAnswer && (
                <>
                    <button className="goodAnswer" onClick={() => { onReviewSuccess(card); setCardReviewed(true); }}>I knew it</button>
                    <button className="badAnswer" onClick={() => { onReviewFailure(card); setCardReviewed(true); }}>I didn't know it</button>
                </>
            )}
            </div>
            {showAnswer && (
                <p><strong>Answer :&nbsp;</strong>
                    {getCardAnswer}
                </p>
            )}
        </div>
    );
}

export default StudyCard;