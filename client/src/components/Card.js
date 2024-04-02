const Card = ({card, handleViewCardModal}) => {

  const getContentString = () => {
    if (card.name) return card.name;
    if (card.front) return card.front;
    if (card.question) return card.question;
    if (card.instructions) return card.instructions;
    return null;
  };

  const getReviewTimingString = () => {
      if (card.nextReviewInterval === -1) 
        return <p className="reviewDateInfo">Not yet reviewed</p>;
      const now = new Date();
      const nextReviewDate = new Date(card.nextReviewDate);
      const diffTime = nextReviewDate - now;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (days <= 0)
        return (<p className="reviewDateInfo">Ready for review</p>);
      return <p className="reviewDateInfo">Review in {days} day{days > 1 ? 's' : ''}</p>;
  };

  const content = getContentString();

    return (
      <div onClick={() => handleViewCardModal(card)}>
        <p>
          {content}
        </p>
        {getReviewTimingString()}
      </div>
    );

}

export default Card;