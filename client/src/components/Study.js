import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate  } from 'react-router-dom';

import StudyCard from './StudyCard';

import config from '../config.js';
const backendUrl = config.backendUrl;


const Study = ({user}) => {
    const {categoryId} = useParams();
    const [category, setCategory] = useState(null);
    const [cardDeck, setCardDeck] = useState({index : -1, cards : []});
    const [loaded, setLoaded] = useState(false);

    const navigate = useNavigate();

    // get all cards from modules and sort them randomly
    const extractCards = (modules) => {
        let cards = [];
        for (let i = 0; i < modules.length; i++)
            cards = cards.concat(modules[i].cards);
        cards.sort(() => Math.random() - 0.5);
    
        return cards;
    };


    useEffect(() => {
        const fetchCategory = async () => {
          try {
            const response = await axios.get(backendUrl + `/api/cards/category/${categoryId}/populated/study`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            });
            setCategory(response.data);
            setCardDeck({index : 0, cards : extractCards(response.data.modules)});
            setLoaded(true);
          } catch (error) {
            console.error('Error fetching category:', error);
          }
        };
    
        fetchCategory();
      }, [categoryId, user.token]); // Include categoryId and user.token as dependencies


      const sendReview = async (card) => {
        try {
          const response = await axios.post(
            backendUrl + `/api/cards/category/${category._id}/module/${card.moduleId}/card/${card._id}/review`,
            {
                nextReviewInterval: card.nextReviewInterval,
                nextReviewDate: card.nextReviewDate,
            },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          return response.data;
        } catch (error) {
          console.error('Error sending review:', error);
        }
      }

      const onReviewSuccess = (card) => {
        if (card.nextReviewInterval == 0)
            card.nextReviewInterval = 1;
        else {
            let nextReviewDate = new Date()
            nextReviewDate.setDate(nextReviewDate.getDate() + card.nextReviewInterval);
            nextReviewDate.setHours(0, 0, 0, 0);
            card.nextReviewDate = nextReviewDate;
            card.nextReviewInterval *= 2;
        }
        setCardDeck({index : cardDeck.index, cards : cardDeck.cards.map(c => c._id == card._id ? card : c)});
        sendReview(card);
      };

      const onReviewFailure = (card) => {
        card.nextReviewInterval = 0;
        setCardDeck({index : cardDeck.index, cards : cardDeck.cards.map(c => c._id == card._id ? card : c)});
        sendReview(card);
      };

      const nextCard = () => {
        if (cardDeck.index + 1 < cardDeck.cards.length)
            setCardDeck({index : cardDeck.index + 1, cards : cardDeck.cards});
        else {
            const lastCard = cardDeck.cards[cardDeck.index];
            let newCards = cardDeck.cards.filter(card => new Date(card.nextReviewDate).getTime() <= Date.now()).sort(() => Math.random() - 0.5);
            if (newCards[0] == lastCard) {
                newCards = newCards.slice(1);
                newCards.push(lastCard);
            }
            setCardDeck({index : 0, cards : newCards});
        }
      };

    return (
        <>
        {cardDeck.cards.length != 0 &&
        <StudyCard card={cardDeck.cards[cardDeck.index]} nextCard={nextCard} onReviewSuccess={onReviewSuccess} onReviewFailure={onReviewFailure} />
        }
        {!loaded &&
        <h1>Loading...</h1>}
        {loaded && cardDeck.cards.length == 0 &&
        <>
        <h1>No cards left to study</h1>
        <a href="#" onClick={() => navigate("/")}>Go back</a>
        
        </>}
        </>
    );
  };

  export default Study;